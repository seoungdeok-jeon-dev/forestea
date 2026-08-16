import "./load-env.js";
import cors from "@fastify/cors";
import { getCloverAppConfig } from "@forestea/clover";
import { prisma } from "@forestea/db";
import Fastify from "fastify";
import { z } from "zod";
import { registerAuthRoutes } from "./routes/auth.js";
import {
  formatCloverAuthHint,
  withClover,
} from "./services/clover-runtime.js";
import {
  getCachedMenu,
  setCachedMenu,
} from "./services/menu-cache.js";
import {
  getActiveCloverAuth,
  getConnectedMerchantId,
  resolveMerchantIdFromEnv,
} from "./services/clover-token-service.js";
import { resolvePricedLineItems } from "./services/menu-pricing.js";
import { placePaidOrder } from "./services/order-placement.js";
import { requireInternal } from "./security.js";

const cartLineInputSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().positive(),
  modifierIds: z.array(z.string()).optional().default([]),
});

const checkoutSchema = z.object({
  items: z.array(cartLineInputSchema).min(1),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  pickupNote: z.string().optional(),
});

const placeOrderSchema = checkoutSchema.extend({
  sourceToken: z.string().min(10),
  idempotencyKey: z.string().uuid(),
  userId: z.string().optional(),
});

const port = Number(process.env.PORT ?? 4000);

async function cloverErrorReply(
  reply: { status: (code: number) => { send: (body: unknown) => unknown } },
  err: unknown,
) {
  const message = err instanceof Error ? err.message : "Clover API error";
  const status = message.includes("429")
    ? 429
    : message.includes("401")
      ? 401
      : 502;
  const auth = await getActiveCloverAuth();
  const hint =
    status === 429
      ? "Clover sandbox rate limit. Wait 10–30s and retry; avoid spamming /menu and /auth/diagnostics."
      : status === 401
        ? formatCloverAuthHint(auth?.merchantId ?? null)
        : undefined;
  return reply.status(status).send({ error: message, hint });
}

function validateEnv() {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "INTERNAL_API_SECRET is required (min 16 chars) and must match the web app. " +
        "Add it to the API env file (.env.development / .env.production).",
    );
  }
}

async function main() {
  validateEnv();
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });

  await registerAuthRoutes(app);

  app.get("/health", async () => {
    const appConfig = getCloverAppConfig();
    const auth = await getActiveCloverAuth();
    const envMerchantId = resolveMerchantIdFromEnv();

    return {
      ok: true,
      cloverAppConfigured: Boolean(appConfig),
      cloverConnected: Boolean(auth),
      sandbox: appConfig?.sandbox ?? true,
      merchantId: auth?.merchantId ?? null,
      envMerchantId,
      merchantIdMismatch: Boolean(
        auth && envMerchantId && auth.merchantId !== envMerchantId,
      ),
    };
  });

  app.get("/menu/items/:itemId", async (request, reply) => {
    const { itemId } = request.params as { itemId: string };
    try {
      const { result } = await withClover((clover) => clover.getItem(itemId));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Not found";
      if (message.includes("not found")) {
        return reply.status(404).send({ error: message });
      }
      return await cloverErrorReply(reply, err);
    }
  });

  app.get("/menu", async (request, reply) => {
    try {
      const auth = await getActiveCloverAuth();
      if (auth) {
        const cached = getCachedMenu(auth.merchantId);
        if (cached) return cached;
      }

      const { result, merchantId } = await withClover(async (clover) => {
        const categories = await clover.getCategories();
        const items = await clover.getItems();
        return { categories, items };
      });

      setCachedMenu(merchantId, result);
      return result;
    } catch (err) {
      return await cloverErrorReply(reply, err);
    }
  });

  // Pure pricing quote: resolves server-side prices + tax via Clover. This is a
  // read-only preview and intentionally does NOT persist an order — the order is
  // only created at payment time (POST /orders) with an idempotency key.
  app.post("/checkout", async (request, reply) => {
    const parsed = checkoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const { items } = parsed.data;

    try {
      const { result } = await withClover(async (clover) => {
        const lineItems = await resolvePricedLineItems(clover, items);
        const totals = await clover.checkoutOrder(lineItems);
        return totals;
      });

      return {
        totals: {
          subtotal: result.subtotal,
          tax: result.tax,
          total: result.total,
        },
        lineItems: result.lineItems,
      };
    } catch (err) {
      return await cloverErrorReply(reply, err);
    }
  });

  app.post("/orders", { preHandler: requireInternal }, async (request, reply) => {
    const parsed = placeOrderSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const { items, sourceToken, idempotencyKey, ...customer } = parsed.data;
    const clientIp =
      (request.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      request.ip;

    try {
      const result = await placePaidOrder({
        idempotencyKey,
        lineInputs: items,
        sourceToken,
        ...customer,
        clientIp,
      });
      return result;
    } catch (err) {
      return await cloverErrorReply(reply, err);
    }
  });

  // Public capability-URL lookup for the order confirmation page. Only
  // non-sensitive fields are returned — never customer name/email/phone.
  app.get("/orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        cloverOrderId: true,
        subtotalCents: true,
        taxCents: true,
        totalCents: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unitPriceCents: true,
          },
        },
      },
    });

    if (!order) {
      return reply.status(404).send({ error: "Order not found" });
    }

    return order;
  });

  app.get("/payments/config", async (_request, reply) => {
    try {
      const appConfig = getCloverAppConfig();
      const auth = await getActiveCloverAuth();
      const merchantId = auth?.merchantId ?? (await getConnectedMerchantId());
      const demo = !appConfig || !merchantId || !auth;

      let pakmsPublicKey: string | null = appConfig?.ecommerceApiKey ?? null;

      if (!demo) {
        try {
          const { result } = await withClover((clover) =>
            clover.getEcommerceApiKey(),
          );
          pakmsPublicKey = result;
        } catch {
          pakmsPublicKey = appConfig?.ecommerceApiKey ?? null;
        }
      }

      const sdkUrl = appConfig?.sandbox
        ? "https://checkout.sandbox.dev.clover.com/sdk.js"
        : "https://checkout.clover.com/sdk.js";

      return {
        demo,
        sandbox: appConfig?.sandbox ?? true,
        merchantId,
        pakmsPublicKey,
        sdkUrl,
        iframeReady: Boolean(!demo && pakmsPublicKey && merchantId),
      };
    } catch (err) {
      return await cloverErrorReply(reply, err);
    }
  });

  try {
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`Forestea API listening on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

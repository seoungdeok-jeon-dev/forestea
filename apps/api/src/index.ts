import "./load-env.js";
import cors from "@fastify/cors";
import {
  getMenuCatalog,
  getMenuItemDetail,
  quoteCheckout,
} from "@forestea/menu";
import { prisma } from "@forestea/db";
import Fastify from "fastify";
import { z } from "zod";
import {
  confirmPaidOrder,
  preparePaidOrder,
} from "./services/order-placement.js";
import {
  getStripePublishableKey,
  isStripeConfigured,
} from "./services/stripe.js";
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

const prepareOrderSchema = checkoutSchema.extend({
  idempotencyKey: z.string().uuid(),
  userId: z.string().optional(),
});

const confirmOrderSchema = z.object({
  orderId: z.string().min(1),
});

const port = Number(process.env.PORT ?? 4000);

function errorReply(
  reply: { status: (code: number) => { send: (body: unknown) => unknown } },
  err: unknown,
  fallbackStatus = 502,
) {
  const message = err instanceof Error ? err.message : "Request failed";
  const status = message.includes("Unknown menu item")
    ? 400
    : message.includes("not found") || message.includes("Not found")
      ? 404
      : message.includes("STRIPE_SECRET_KEY")
        ? 503
        : fallbackStatus;
  return reply.status(status).send({ error: message });
}

function validateEnv() {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "INTERNAL_API_SECRET is required (min 16 chars) and must match the web app. " +
        "Add it to apps/api/.env.local (local) or Railway env vars (production).",
    );
  }
}

async function main() {
  validateEnv();
  const app = Fastify({ logger: true });

  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
  const corsOrigins = Array.from(
    new Set([
      webOrigin,
      "http://localhost:3000",
      "https://localhost:3000",
    ]),
  );

  await app.register(cors, {
    origin: corsOrigins,
    credentials: true,
  });

  app.get("/health", async () => ({
    ok: true,
    payments: isStripeConfigured() ? "stripe" : "unconfigured",
    stripeConfigured: isStripeConfigured(),
  }));

  app.get("/menu/items/:itemId", async (request, reply) => {
    const { itemId } = request.params as { itemId: string };
    const item = getMenuItemDetail(itemId);
    if (!item) {
      return reply.status(404).send({ error: `Menu item not found: ${itemId}` });
    }
    return item;
  });

  app.get("/menu", async () => getMenuCatalog());

  app.post("/checkout", async (request, reply) => {
    const parsed = checkoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    try {
      const { totals, lineItems } = quoteCheckout(parsed.data.items);
      return { totals, lineItems };
    } catch (err) {
      return errorReply(reply, err, 400);
    }
  });

  app.post(
    "/orders/prepare",
    { preHandler: requireInternal },
    async (request, reply) => {
      const parsed = prepareOrderSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const { items, idempotencyKey, ...customer } = parsed.data;

      try {
        const result = await preparePaidOrder({
          idempotencyKey,
          lineInputs: items,
          ...customer,
        });
        return result;
      } catch (err) {
        return errorReply(reply, err);
      }
    },
  );

  app.post(
    "/orders/confirm",
    { preHandler: requireInternal },
    async (request, reply) => {
      const parsed = confirmOrderSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      try {
        return await confirmPaidOrder(parsed.data.orderId);
      } catch (err) {
        return errorReply(reply, err);
      }
    },
  );

  app.get("/orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        cloverOrderId: true,
        stripePaymentIntentId: true,
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

  app.get("/payments/config", async () => {
    const publishableKey = getStripePublishableKey();
    const ready = isStripeConfigured();
    return {
      provider: "stripe" as const,
      publishableKey,
      ready,
      // Kept for older clients that still read these fields.
      demo: !ready,
      sandbox: Boolean(publishableKey?.startsWith("pk_test_")),
      iframeReady: ready,
    };
  });

  try {
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`Forestea API listening on http://localhost:${port}`);
    if (!isStripeConfigured()) {
      console.warn(
        "Stripe is not configured — set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to accept payments.",
      );
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

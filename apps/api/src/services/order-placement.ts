import { prisma, Prisma } from "@forestea/db";
import { withClover } from "./clover-runtime.js";
import { resolvePricedLineItems, type CartLineInput } from "./menu-pricing.js";
import { sendOrderNotifications } from "./order-notifications.js";

export interface PlaceOrderInput {
  idempotencyKey: string;
  lineInputs: CartLineInput[];
  sourceToken: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupNote?: string;
  clientIp?: string;
}

export interface PlaceOrderResult {
  success: boolean;
  order: {
    id: string;
    cloverOrderId: string | null;
    status: string;
    totalCents: number;
  };
  charge: { id: string; status: string };
}

function assertSourceToken(token: string): void {
  if (!/^clv_[A-Za-z0-9]+/.test(token)) {
    throw new Error("Invalid Clover payment token");
  }
}

export async function placePaidOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  assertSourceToken(input.sourceToken);

  const existing = await prisma.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });

  if (existing?.status === "PAID" && existing.cloverChargeId) {
    return {
      success: true,
      order: {
        id: existing.id,
        cloverOrderId: existing.cloverOrderId,
        status: existing.status,
        totalCents: existing.totalCents,
      },
      charge: { id: existing.cloverChargeId, status: "succeeded" },
    };
  }

  const { result: priced } = await withClover(async (clover) => {
    const lineItems = await resolvePricedLineItems(clover, input.lineInputs);
    const checkout = await clover.checkoutOrder(lineItems);
    return { lineItems, checkout };
  });

  let order =
    existing ??
    (await prisma.order.create({
      data: {
        idempotencyKey: input.idempotencyKey,
        status: "PENDING",
        userId: input.userId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        pickupNote: input.pickupNote,
        subtotalCents: priced.checkout.subtotal,
        taxCents: priced.checkout.tax,
        totalCents: priced.checkout.total,
        items: {
          create: priced.lineItems.map((li) => ({
            cloverItemId: li.itemId,
            name: li.name,
            quantity: li.quantity,
            unitPriceCents:
              li.price +
              (li.modifiers?.reduce((s, m) => s + m.price, 0) ?? 0),
            modifiers: (li.modifiers ?? []) as unknown as Prisma.InputJsonValue,
          })),
        },
      },
    }));

  if (existing && existing.status !== "PAID") {
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    order = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PENDING",
        userId: input.userId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        pickupNote: input.pickupNote,
        subtotalCents: priced.checkout.subtotal,
        taxCents: priced.checkout.tax,
        totalCents: priced.checkout.total,
        items: {
          create: priced.lineItems.map((li) => ({
            cloverItemId: li.itemId,
            name: li.name,
            quantity: li.quantity,
            unitPriceCents:
              li.price +
              (li.modifiers?.reduce((s, m) => s + m.price, 0) ?? 0),
            modifiers: (li.modifiers ?? []) as unknown as Prisma.InputJsonValue,
          })),
        },
      },
    });
  }

  let result: PlaceOrderResult;

  try {
    const { result: payment } = await withClover(async (clover) => {
      const atomicOrder = await clover.createAtomicOrder(priced.lineItems);
      const charge = await clover.createCharge(
        priced.checkout.total,
        input.sourceToken,
        {
          clientIp: input.clientIp,
          idempotencyKey: input.idempotencyKey,
        },
      );
      return { atomicOrder, charge };
    });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: payment.charge.paid ? "PAID" : "FAILED",
        cloverOrderId: payment.atomicOrder.id,
        cloverChargeId: payment.charge.id,
      },
    });

    result = {
      success: payment.charge.paid,
      order: {
        id: updated.id,
        cloverOrderId: updated.cloverOrderId,
        status: updated.status,
        totalCents: updated.totalCents,
      },
      charge: {
        id: payment.charge.id,
        status: payment.charge.status,
      },
    };
  } catch (err) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
    throw err;
  }

  // Runs outside the block above so a notification problem can never mark a
  // paid order as FAILED.
  if (result.success) {
    await sendOrderNotifications(result.order.id);
  }

  return result;
}

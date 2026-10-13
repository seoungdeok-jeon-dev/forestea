import { prisma, Prisma } from "@forestea/db";
import {
  lineUnitCents,
  quoteCheckout,
  type CartLineInput,
} from "@forestea/menu";
import { sendOrderNotifications } from "./order-notifications.js";
import { getStripe } from "./stripe.js";

export interface PrepareOrderInput {
  idempotencyKey: string;
  lineInputs: CartLineInput[];
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupNote?: string;
}

export interface PrepareOrderResult {
  orderId: string;
  clientSecret: string;
  totals: { subtotal: number; tax: number; total: number };
}

export interface ConfirmOrderResult {
  success: boolean;
  order: {
    id: string;
    status: string;
    totalCents: number;
    stripePaymentIntentId: string | null;
  };
}

function persistLineItems(
  lineItems: ReturnType<typeof quoteCheckout>["lineItems"],
) {
  return lineItems.map((li) => ({
    cloverItemId: li.itemId,
    name: li.name,
    quantity: li.quantity,
    unitPriceCents: lineUnitCents(li),
    modifiers: li.modifiers as unknown as Prisma.InputJsonValue,
  }));
}

/**
 * Creates (or refreshes) a PENDING order and a Stripe PaymentIntent whose
 * amount matches the server-side quote. The client confirms the PaymentIntent
 * with Stripe.js, then calls confirmPaidOrder.
 */
export async function preparePaidOrder(
  input: PrepareOrderInput,
): Promise<PrepareOrderResult> {
  const { lineItems, totals } = quoteCheckout(input.lineInputs);
  const stripe = getStripe();

  const existing = await prisma.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });

  if (existing?.status === "PAID") {
    throw new Error("This order was already paid. Start a new checkout.");
  }

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
        subtotalCents: totals.subtotal,
        taxCents: totals.tax,
        totalCents: totals.total,
        items: { create: persistLineItems(lineItems) },
      },
    }));

  if (existing) {
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
        subtotalCents: totals.subtotal,
        taxCents: totals.tax,
        totalCents: totals.total,
        items: { create: persistLineItems(lineItems) },
      },
    });
  }

  const metadata = {
    orderId: order.id,
    idempotencyKey: input.idempotencyKey,
  };

  let paymentIntent;
  if (order.stripePaymentIntentId) {
    paymentIntent = await stripe.paymentIntents.update(
      order.stripePaymentIntentId,
      {
        amount: totals.total,
        currency: "usd",
        metadata,
        receipt_email: input.customerEmail || undefined,
      },
    );
  } else {
    paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totals.total,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata,
        receipt_email: input.customerEmail || undefined,
      },
      { idempotencyKey: `pi-${input.idempotencyKey}` },
    );
    order = await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });
  }

  if (!paymentIntent.client_secret) {
    throw new Error("Stripe did not return a client secret");
  }

  return {
    orderId: order.id,
    clientSecret: paymentIntent.client_secret,
    totals,
  };
}

/**
 * After the browser confirms the PaymentIntent, verify with Stripe and mark
 * the order paid. Safe to call more than once.
 */
export async function confirmPaidOrder(
  orderId: string,
): Promise<ConfirmOrderResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === "PAID") {
    return {
      success: true,
      order: {
        id: order.id,
        status: order.status,
        totalCents: order.totalCents,
        stripePaymentIntentId: order.stripePaymentIntentId,
      },
    };
  }

  if (!order.stripePaymentIntentId) {
    throw new Error("Order has no Stripe payment");
  }

  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

  if (intent.status !== "succeeded") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
    return {
      success: false,
      order: {
        id: order.id,
        status: "FAILED",
        totalCents: order.totalCents,
        stripePaymentIntentId: order.stripePaymentIntentId,
      },
    };
  }

  if (intent.amount !== order.totalCents) {
    throw new Error("Paid amount does not match order total");
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID" },
  });

  await sendOrderNotifications(updated.id);

  return {
    success: true,
    order: {
      id: updated.id,
      status: updated.status,
      totalCents: updated.totalCents,
      stripePaymentIntentId: updated.stripePaymentIntentId,
    },
  };
}

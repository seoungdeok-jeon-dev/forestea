"use server";

import { auth } from "@/auth";
import type { CartLineInput } from "@/lib/api";
import { internalApiFetch } from "@/lib/internal-api";

export interface PreparePaymentInput {
  items: CartLineInput[];
  idempotencyKey: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupNote?: string;
}

export interface PreparePaymentResult {
  success: boolean;
  error?: string;
  orderId?: string;
  clientSecret?: string;
  totals?: { subtotal: number; tax: number; total: number };
}

export interface ConfirmOrderResult {
  success: boolean;
  error?: string;
  order?: {
    id: string;
    status: string;
    totalCents: number;
    stripePaymentIntentId: string | null;
  };
}

/**
 * Creates / refreshes a Stripe PaymentIntent for the cart. The authenticated
 * user's id is taken from the session, never from the client.
 */
export async function preparePaymentAction(
  input: PreparePaymentInput,
): Promise<PreparePaymentResult> {
  const session = await auth();

  const res = await internalApiFetch("/orders/prepare", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      userId: session?.user?.id,
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    const message =
      typeof body.error === "string"
        ? body.error
        : `Could not start payment (${res.status})`;
    return { success: false, error: message };
  }

  const data = (await res.json()) as {
    orderId: string;
    clientSecret: string;
    totals: { subtotal: number; tax: number; total: number };
  };

  return {
    success: true,
    orderId: data.orderId,
    clientSecret: data.clientSecret,
    totals: data.totals,
  };
}

/** Verifies the PaymentIntent with Stripe and marks the order paid. */
export async function confirmOrderAction(
  orderId: string,
): Promise<ConfirmOrderResult> {
  const res = await internalApiFetch("/orders/confirm", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    const message =
      typeof body.error === "string"
        ? body.error
        : `Could not confirm order (${res.status})`;
    return { success: false, error: message };
  }

  const data = (await res.json()) as ConfirmOrderResult;
  return data;
}

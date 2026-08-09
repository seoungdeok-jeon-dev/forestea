"use server";

import { auth } from "@/auth";
import type { CartLineInput } from "@/lib/api";
import { internalApiFetch } from "@/lib/internal-api";

export interface PlaceOrderActionInput {
  items: CartLineInput[];
  sourceToken: string;
  idempotencyKey: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupNote?: string;
}

export interface PlaceOrderActionResult {
  success: boolean;
  error?: string;
  order?: {
    id: string;
    cloverOrderId: string | null;
    status: string;
    totalCents: number;
  };
}

/**
 * Places an order server-side so the authenticated user's id is trusted
 * (derived from the session, never from the client) and linked to the order.
 */
export async function placeOrderAction(
  input: PlaceOrderActionInput,
): Promise<PlaceOrderActionResult> {
  const session = await auth();

  const res = await internalApiFetch("/orders", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      // userId is taken from the verified session — client cannot spoof it.
      userId: session?.user?.id,
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    const message =
      typeof body.error === "string" ? body.error : `Order failed (${res.status})`;
    return { success: false, error: message };
  }

  const data = (await res.json()) as PlaceOrderActionResult;
  return data;
}

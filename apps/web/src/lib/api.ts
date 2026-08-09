import { progressDone, progressStart } from "./progress-bus";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  categoryIds?: string[];
  available?: boolean;
}

export interface MenuModifier {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface MenuModifierGroup {
  id: string;
  name: string;
  minRequired: number;
  maxAllowed: number;
  modifiers: MenuModifier[];
}

export interface MenuItemDetail extends MenuItem {
  modifierGroups: MenuModifierGroup[];
}

export interface CartModifier {
  id: string;
  groupId: string;
  groupName: string;
  name: string;
  price: number;
}

export interface CartItem {
  lineId: string;
  itemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  modifiers: CartModifier[];
}

/** Sent to API — prices resolved server-side from Clover. */
export interface CartLineInput {
  itemId: string;
  quantity: number;
  modifierIds?: string[];
}

export function toCartLineInputs(items: CartItem[]): CartLineInput[] {
  return items.map(({ itemId, quantity, modifiers }) => ({
    itemId,
    quantity,
    modifierIds: modifiers.map((m) => m.id),
  }));
}

export interface CheckoutTotals {
  subtotal: number;
  tax: number;
  total: number;
}

export interface PlaceOrderPayload {
  items: CartLineInput[];
  sourceToken: string;
  idempotencyKey: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupNote?: string;
}

export interface PaymentConfig {
  demo: boolean;
  sandbox: boolean;
  merchantId: string | null;
  pakmsPublicKey: string | null;
  sdkUrl: string;
  iframeReady: boolean;
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  progressStart();
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as {
        error?: string | { formErrors?: string[] };
      };
      const message =
        typeof body.error === "string"
          ? body.error
          : `Request failed: ${res.status}`;
      throw new Error(message);
    }

    return res.json() as Promise<T>;
  } finally {
    progressDone();
  }
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export async function getMenu(): Promise<{
  categories: MenuCategory[];
  items: MenuItem[];
}> {
  return fetchApi("/menu");
}

export async function getMenuItem(itemId: string): Promise<MenuItemDetail> {
  return fetchApi(`/menu/items/${encodeURIComponent(itemId)}`);
}

export async function checkoutOrder(payload: {
  items: CartLineInput[];
}): Promise<{ totals: CheckoutTotals }> {
  return fetchApi("/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<{
  success: boolean;
  order: { id: string; cloverOrderId: string | null; status: string; totalCents: number };
}> {
  return fetchApi("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface OrderRecord {
  id: string;
  cloverOrderId: string | null;
  cloverChargeId: string | null;
  status: string;
  totalCents: number;
  subtotalCents: number;
  taxCents: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPriceCents: number;
  }>;
}

export async function getOrder(id: string): Promise<OrderRecord> {
  return fetchApi<OrderRecord>(`/orders/${id}`);
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  return fetchApi("/payments/config");
}

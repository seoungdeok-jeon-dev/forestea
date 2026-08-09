import { fetchWithRetry } from "./http.js";
import {
  getEcommerceBaseUrl,
  getPlatformBaseUrl,
  getTokenBaseUrl,
} from "./urls.js";
import type {
  AtomicOrderResult,
  CardTokenRequest,
  CartLineItem,
  ChargeResult,
  CheckoutResult,
  CloverCategory,
  CloverConfig,
  CloverItem,
  MenuItemDetail,
} from "./types.js";

type CloverListResponse<T> = { elements?: T[] };

/**
 * Expand a cart line into Clover atomic line items.
 *
 * Fixed-price inventory items represent quantity as *repeated* line items —
 * `unitQty` only applies to per-unit (weighed) items, so sending `unitQty: 2`
 * on a fixed item is silently ignored and the order is priced as quantity 1.
 *
 * Each modification must carry the modifier reference *plus* a sibling `name`
 * and `amount` (cents). Sending only `modifier: { id }` — or nesting name/price
 * inside the modifier — triggers a 400 "data validation error" on
 * atomic_order/orders. `amount` must be explicit because the order endpoint
 * does not derive the modifier price from inventory.
 */
function formatAtomicLineItems(li: CartLineItem) {
  const modifications =
    li.modifiers?.map((m) => ({
      modifier: { id: m.id },
      name: m.name,
      amount: m.price,
    })) ?? [];

  const single = {
    item: { id: li.itemId },
    printed: false,
    ...(modifications.length > 0 ? { modifications } : {}),
  };

  const qty = Math.max(1, Math.round(li.quantity));
  return Array.from({ length: qty }, () => ({ ...single }));
}

export class CloverClient {
  constructor(private readonly config: CloverConfig) {}

  private get platformUrl(): string {
    return getPlatformBaseUrl(this.config.sandbox ?? true);
  }

  private get ecommerceUrl(): string {
    return getEcommerceBaseUrl(this.config.sandbox ?? true);
  }

  private get tokenUrl(): string {
    return getTokenBaseUrl(this.config.sandbox ?? true);
  }

  private async platformFetch<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const res = await fetchWithRetry(`${this.platformUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
        "User-Agent": "Forestea/1.0",
        ...init?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Clover Platform API ${res.status}: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  private async ecommerceFetch<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const res = await fetchWithRetry(`${this.ecommerceUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Clover Ecommerce API ${res.status}: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  async getCategories(): Promise<CloverCategory[]> {
    const data = await this.platformFetch<
      CloverListResponse<{ id: string; name: string; sortOrder?: number }>
    >(
      `/v3/merchants/${this.config.merchantId}/categories?limit=100`,
    );

    return (data.elements ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      sortOrder: c.sortOrder,
    }));
  }

  async getItems(): Promise<CloverItem[]> {
    const data = await this.platformFetch<
      CloverListResponse<{
        id: string;
        name: string;
        price?: number;
        description?: string;
        hidden?: boolean;
        available?: boolean;
        categories?: { elements?: Array<{ id: string }> };
      }>
    >(
      `/v3/merchants/${this.config.merchantId}/items?expand=categories&limit=100`,
    );

    return (data.elements ?? [])
      .filter((item) => !item.hidden)
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price ?? 0,
        description: item.description,
        categoryIds: item.categories?.elements?.map((c) => c.id),
        available: item.available !== false,
        hidden: item.hidden,
      }));
  }

  async getItem(itemId: string): Promise<MenuItemDetail> {
    const data = await this.platformFetch<{
      id: string;
      name: string;
      price?: number;
      description?: string;
      hidden?: boolean;
      available?: boolean;
      categories?: { elements?: Array<{ id: string }> };
      modifierGroups?: {
        elements?: Array<{
          id: string;
          name: string;
          minRequired?: number;
          maxAllowed?: number;
          modifiers?: {
            elements?: Array<{
              id: string;
              name: string;
              price?: number;
              available?: boolean;
            }>;
          };
        }>;
      };
    }>(
      `/v3/merchants/${this.config.merchantId}/items/${itemId}?expand=categories&expand=modifierGroups&expand=modifierGroups.modifiers`,
    );

    if (data.hidden) {
      throw new Error(`Menu item not found: ${itemId}`);
    }

    return {
      id: data.id,
      name: data.name,
      price: data.price ?? 0,
      description: data.description,
      categoryIds: data.categories?.elements?.map((c) => c.id),
      available: data.available !== false,
      hidden: data.hidden,
      modifierGroups: (data.modifierGroups?.elements ?? []).map((g) => ({
        id: g.id,
        name: g.name,
        minRequired: g.minRequired ?? 0,
        maxAllowed: g.maxAllowed ?? 0,
        modifiers: (g.modifiers?.elements ?? [])
          .filter((m) => m.available !== false)
          .map((m) => ({
            id: m.id,
            name: m.name,
            price: m.price ?? 0,
            available: m.available !== false,
          })),
      })),
    };
  }

  async checkoutOrder(lineItems: CartLineItem[]): Promise<CheckoutResult> {
    const orderCart = {
      lineItems: lineItems.flatMap(formatAtomicLineItems),
    };

    const result = await this.platformFetch<{
      subtotal?: number;
      totalTaxAmount?: number;
      total?: number;
      lineItems?: { elements?: Array<{ id: string; name: string; price: number; unitQty?: number }> };
    }>(
      `/v3/merchants/${this.config.merchantId}/atomic_order/checkouts`,
      {
        method: "POST",
        body: JSON.stringify({ orderCart }),
      },
    );

    return {
      subtotal: result.subtotal ?? 0,
      tax: result.totalTaxAmount ?? 0,
      total: result.total ?? 0,
      lineItems: (result.lineItems?.elements ?? []).map((li) => ({
        id: li.id,
        name: li.name,
        price: li.price,
        quantity: li.unitQty ?? 1,
      })),
    };
  }

  async createAtomicOrder(lineItems: CartLineItem[]): Promise<AtomicOrderResult> {
    const orderCart = {
      lineItems: lineItems.flatMap(formatAtomicLineItems),
    };

    const result = await this.platformFetch<{
      id: string;
      total?: number;
      state?: string;
    }>(
      `/v3/merchants/${this.config.merchantId}/atomic_order/orders`,
      {
        method: "POST",
        body: JSON.stringify({ orderCart }),
      },
    );

    return {
      id: result.id,
      total: result.total ?? 0,
      state: result.state ?? "open",
    };
  }

  /**
   * PAKMS key for card tokenization — must match the OAuth merchant.
   * Prefer live /pakms/apikey; fall back to CLOVER_ECOMMERCE_API_KEY from env.
   */
  async getEcommerceApiKey(): Promise<string> {
    const res = await fetch(`${this.ecommerceUrl}/pakms/apikey`, {
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
      },
    });

    if (res.ok) {
      const data = (await res.json()) as { apiAccessKey: string };
      if (data.apiAccessKey) return data.apiAccessKey;
    }

    if (this.config.ecommerceApiKey) {
      return this.config.ecommerceApiKey;
    }

    const body = res.ok ? "" : await res.text();
    throw new Error(
      `Failed to fetch PAKMS key (${res.status})${body ? `: ${body}` : ""}. Set CLOVER_ECOMMERCE_API_KEY or reconnect OAuth.`,
    );
  }

  private normalizeCardExpiry(expMonth: string, expYear: string) {
    const month = expMonth.padStart(2, "0").slice(-2);
    const year =
      expYear.length <= 2 ? `20${expYear.padStart(2, "0")}` : expYear.slice(-4);
    return { exp_month: month, exp_year: year };
  }

  async createCardToken(card: CardTokenRequest): Promise<string> {
    const apiKey = await this.getEcommerceApiKey();
    const expiry = this.normalizeCardExpiry(card.expMonth, card.expYear);

    const res = await fetch(`${this.tokenUrl}/v1/tokens`, {
      method: "POST",
      headers: {
        accept: "application/json",
        apikey: apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        card: {
          number: card.number.replace(/\s/g, ""),
          ...expiry,
          cvv: card.cvv,
          brand: card.brand,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Card tokenization failed: ${body}`);
    }

    const data = (await res.json()) as { id: string };
    return data.id;
  }

  async createCharge(
    amountCents: number,
    sourceToken: string,
    options?: { clientIp?: string; idempotencyKey?: string },
  ): Promise<ChargeResult> {
    const headers: Record<string, string> = {};
    if (options?.clientIp) headers["x-forwarded-for"] = options.clientIp;
    if (options?.idempotencyKey) {
      headers["idempotency-key"] = options.idempotencyKey;
    }

    const result = await this.ecommerceFetch<{
      id: string;
      amount: number;
      status: string;
      paid: boolean;
    }>("/v1/charges", {
      method: "POST",
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      body: JSON.stringify({
        amount: amountCents,
        currency: "usd",
        source: sourceToken,
      }),
    });

    return {
      id: result.id,
      amount: result.amount,
      status: result.status,
      paid: result.paid,
    };
  }

  async payForOrder(
    orderId: string,
    amountCents: number,
    sourceToken: string,
    clientIp?: string,
  ): Promise<ChargeResult> {
    const result = await this.ecommerceFetch<{
      id: string;
      amount: number;
      status: string;
      paid: boolean;
    }>(`/v1/orders/${orderId}/pay`, {
      method: "POST",
      headers: clientIp ? { "x-forwarded-for": clientIp } : undefined,
      body: JSON.stringify({
        amount: amountCents,
        currency: "usd",
        source: sourceToken,
      }),
    });

    return {
      id: result.id,
      amount: result.amount,
      status: result.status,
      paid: result.paid,
    };
  }
}

export type CloverService = CloverClient;

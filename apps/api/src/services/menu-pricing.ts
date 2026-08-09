import {
  buildLineItemDisplayName,
  resolveModifiers,
  type CartLineItem,
  type CloverService,
} from "@forestea/clover";

export interface CartLineInput {
  itemId: string;
  quantity: number;
  modifierIds?: string[];
}

/**
 * Resolve cart lines using Clover inventory (base price + validated modifiers).
 */
export async function resolvePricedLineItems(
  clover: CloverService,
  inputs: CartLineInput[],
): Promise<CartLineItem[]> {
  const detailCache = new Map<string, Awaited<ReturnType<CloverService["getItem"]>>>();

  return Promise.all(
    inputs.map(async (input) => {
      let detail = detailCache.get(input.itemId);
      if (!detail) {
        detail = await clover.getItem(input.itemId);
        detailCache.set(input.itemId, detail);
      }

      if (!detail.available) {
        throw new Error(`Menu item unavailable: ${detail.name}`);
      }
      if (input.quantity < 1) {
        throw new Error(`Invalid quantity for ${detail.name}`);
      }

      const modifiers = resolveModifiers(detail, input.modifierIds ?? []);

      return {
        itemId: detail.id,
        name: buildLineItemDisplayName(detail.name, modifiers),
        price: detail.price,
        quantity: input.quantity,
        modifiers,
      };
    }),
  );
}

import { getMenuItemDetail } from "./catalog.js";
import type {
  CartLineInput,
  CheckoutTotals,
  PricedLineItem,
  PricedModifier,
} from "./types.js";

function buildDisplayName(
  baseName: string,
  modifiers: PricedModifier[],
): string {
  if (modifiers.length === 0) return baseName;
  return `${baseName} (${modifiers.map((m) => m.name).join(", ")})`;
}

export function resolvePricedLineItems(
  inputs: CartLineInput[],
): PricedLineItem[] {
  return inputs.map((input) => {
    const detail = getMenuItemDetail(input.itemId);
    if (!detail) {
      throw new Error(`Unknown menu item: ${input.itemId}`);
    }
    if (detail.available === false) {
      throw new Error(`Menu item unavailable: ${detail.name}`);
    }
    if (input.quantity < 1) {
      throw new Error(`Invalid quantity for ${detail.name}`);
    }

    const selectedIds = new Set(input.modifierIds ?? []);
    const modifiers: PricedModifier[] = [];

    for (const group of detail.modifierGroups) {
      const picked = group.modifiers.filter((mod) => selectedIds.has(mod.id));

      if (picked.length < group.minRequired) {
        throw new Error(
          `Please choose ${group.minRequired} option(s) for "${group.name}" on ${detail.name}.`,
        );
      }
      if (group.maxAllowed > 0 && picked.length > group.maxAllowed) {
        throw new Error(`Too many options for "${group.name}" on ${detail.name}.`);
      }

      for (const mod of picked) {
        if (!mod.available) {
          throw new Error(`Modifier unavailable: ${mod.name}`);
        }
        modifiers.push({
          id: mod.id,
          groupId: group.id,
          groupName: group.name,
          name: mod.name,
          price: mod.price,
        });
      }
    }

    for (const id of selectedIds) {
      if (!modifiers.some((m) => m.id === id)) {
        throw new Error(`Unknown modifier: ${id}`);
      }
    }

    return {
      itemId: detail.id,
      name: buildDisplayName(detail.name, modifiers),
      price: detail.price,
      quantity: input.quantity,
      modifiers,
    };
  });
}

export function lineUnitCents(line: PricedLineItem): number {
  return (
    line.price + line.modifiers.reduce((sum, mod) => sum + mod.price, 0)
  );
}

export function quoteCheckout(
  inputs: CartLineInput[],
  taxRate = Number(process.env.TAX_RATE ?? "0.101"),
): { lineItems: PricedLineItem[]; totals: CheckoutTotals } {
  const lineItems = resolvePricedLineItems(inputs);
  const subtotal = lineItems.reduce(
    (sum, line) => sum + lineUnitCents(line) * line.quantity,
    0,
  );
  const rate = Number.isFinite(taxRate) && taxRate >= 0 ? taxRate : 0;
  const tax = Math.round(subtotal * rate);
  return {
    lineItems,
    totals: { subtotal, tax, total: subtotal + tax },
  };
}

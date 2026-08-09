import type { CartItem } from "@/lib/api";

export function cartUnitPrice(item: CartItem): number {
  return (
    item.basePrice +
    item.modifiers.reduce((sum, m) => sum + m.price, 0)
  );
}

export function cartLineTotal(item: CartItem): number {
  return cartUnitPrice(item) * item.quantity;
}

export function cartLineLabel(item: CartItem): string {
  if (item.modifiers.length === 0) return item.name;
  return `${item.name} · ${item.modifiers.map((m) => m.name).join(", ")}`;
}

export function modifierKey(modifierIds: string[]): string {
  return [...modifierIds].sort().join(",");
}

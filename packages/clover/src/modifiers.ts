import type {
  CartModifier,
  CloverModifierGroup,
  MenuItemDetail,
} from "./types.js";

export function buildLineItemDisplayName(
  baseName: string,
  modifiers: CartModifier[],
): string {
  if (modifiers.length === 0) return baseName;
  return `${baseName} (${modifiers.map((m) => m.name).join(", ")})`;
}

export function unitPriceWithModifiers(
  basePrice: number,
  modifiers: CartModifier[],
): number {
  return basePrice + modifiers.reduce((sum, m) => sum + m.price, 0);
}

/**
 * Resolve modifier IDs against item inventory; enforces min/max per group.
 */
export function resolveModifiers(
  item: MenuItemDetail,
  modifierIds: string[],
): CartModifier[] {
  const selectedByGroup = new Map<string, string[]>();

  for (const modId of modifierIds) {
    let found: { group: CloverModifierGroup; modifierId: string } | null = null;
    for (const group of item.modifierGroups) {
      const mod = group.modifiers.find((m) => m.id === modId);
      if (mod) {
        found = { group, modifierId: mod.id };
        break;
      }
    }
    if (!found) {
      throw new Error(`Invalid modifier for ${item.name}: ${modId}`);
    }
    const mod = found.group.modifiers.find((m) => m.id === found!.modifierId)!;
    if (!mod.available) {
      throw new Error(`Modifier unavailable: ${mod.name}`);
    }
    const list = selectedByGroup.get(found.group.id) ?? [];
    list.push(mod.id);
    selectedByGroup.set(found.group.id, list);
  }

  for (const group of item.modifierGroups) {
    const count = selectedByGroup.get(group.id)?.length ?? 0;
    if (count < group.minRequired) {
      throw new Error(
        `Required: choose at least ${group.minRequired} from "${group.name}"`,
      );
    }
    if (group.maxAllowed > 0 && count > group.maxAllowed) {
      throw new Error(
        `Too many options for "${group.name}" (max ${group.maxAllowed})`,
      );
    }
  }

  const resolved: CartModifier[] = [];
  for (const group of item.modifierGroups) {
    const ids = selectedByGroup.get(group.id) ?? [];
    for (const modId of ids) {
      const mod = group.modifiers.find((m) => m.id === modId)!;
      resolved.push({
        id: mod.id,
        groupId: group.id,
        name: mod.name,
        price: mod.price,
      });
    }
  }
  return resolved;
}

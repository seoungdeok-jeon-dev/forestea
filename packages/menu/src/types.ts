export interface MenuCategory {
  id: string;
  name: string;
  sortOrder?: number;
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

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  categoryIds?: string[];
  available?: boolean;
  image?: string;
}

export interface MenuItemDetail extends MenuItem {
  modifierGroups: MenuModifierGroup[];
}

export interface CartLineInput {
  itemId: string;
  quantity: number;
  modifierIds?: string[];
}

export interface PricedModifier {
  id: string;
  groupId: string;
  groupName: string;
  name: string;
  price: number;
}

export interface PricedLineItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: PricedModifier[];
}

export interface CheckoutTotals {
  subtotal: number;
  tax: number;
  total: number;
}

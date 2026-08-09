export interface CloverConfig {
  accessToken: string;
  merchantId: string;
  ecommerceApiKey?: string;
  sandbox?: boolean;
}

export interface CloverModifier {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface CloverModifierGroup {
  id: string;
  name: string;
  minRequired: number;
  maxAllowed: number;
  modifiers: CloverModifier[];
}

export interface CloverItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  categoryIds?: string[];
  available?: boolean;
  hidden?: boolean;
}

export interface MenuItemDetail extends CloverItem {
  modifierGroups: CloverModifierGroup[];
}

export interface CloverCategory {
  id: string;
  name: string;
  sortOrder?: number;
}

export interface CartModifier {
  id: string;
  groupId: string;
  name: string;
  price: number;
}

export interface CartLineItem {
  itemId: string;
  name: string;
  /** Base item price in cents (excludes modifier amounts). */
  price: number;
  quantity: number;
  modifiers?: CartModifier[];
}

export interface CheckoutResult {
  subtotal: number;
  tax: number;
  total: number;
  lineItems: Array<{ id: string; name: string; price: number; quantity: number }>;
}

export interface AtomicOrderResult {
  id: string;
  total: number;
  state: string;
}

export interface CardTokenRequest {
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  brand?: string;
}

export interface ChargeResult {
  id: string;
  amount: number;
  status: string;
  paid: boolean;
}

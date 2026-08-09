"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, CartModifier } from "@/lib/api";
import { cartLineTotal, modifierKey } from "@/lib/cart-utils";

export interface AddToCartPayload {
  itemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  modifiers: CartModifier[];
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  cartPulse: number;
  lastAddedLineId: string | null;
  addToCart: (payload: AddToCartPayload) => void;
  updateLine: (lineId: string, payload: AddToCartPayload) => void;
  removeLine: (lineId: string) => void;
  getLine: (lineId: string) => CartItem | undefined;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function buildLine(payload: AddToCartPayload, lineId?: string): CartItem {
  return {
    lineId: lineId ?? crypto.randomUUID(),
    itemId: payload.itemId,
    name: payload.name,
    basePrice: payload.basePrice,
    quantity: payload.quantity,
    modifiers: payload.modifiers,
  };
}

function lineSignature(item: Pick<CartItem, "itemId" | "modifiers">): string {
  return `${item.itemId}::${modifierKey(item.modifiers.map((m) => m.id))}`;
}

/** Collapse lines that share the same item + modifiers into one, summing qty. */
function consolidate(items: CartItem[]): CartItem[] {
  const bySignature = new Map<string, CartItem>();
  for (const item of items) {
    const sig = lineSignature(item);
    const existing = bySignature.get(sig);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      bySignature.set(sig, { ...item });
    }
  }
  return [...bySignature.values()];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartPulse, setCartPulse] = useState(0);
  const [lastAddedLineId, setLastAddedLineId] = useState<string | null>(null);
  const clearAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashLine = useCallback((lineId: string) => {
    setCartPulse((n) => n + 1);
    setLastAddedLineId(lineId);
    if (clearAddedTimer.current) clearTimeout(clearAddedTimer.current);
    clearAddedTimer.current = setTimeout(() => setLastAddedLineId(null), 650);
  }, []);

  const addToCart = useCallback(
    (payload: AddToCartPayload) => {
      const key = modifierKey(payload.modifiers.map((m) => m.id));
      let mergedLineId: string | null = null;

      setItems((prev) => {
        const existing = prev.find(
          (i) =>
            i.itemId === payload.itemId &&
            modifierKey(i.modifiers.map((m) => m.id)) === key,
        );
        if (existing) {
          mergedLineId = existing.lineId;
          return prev.map((i) =>
            i.lineId === existing.lineId
              ? { ...i, quantity: i.quantity + payload.quantity }
              : i,
          );
        }
        const line = buildLine(payload);
        mergedLineId = line.lineId;
        return [...prev, line];
      });

      if (mergedLineId) flashLine(mergedLineId);
    },
    [flashLine],
  );

  const updateLine = useCallback(
    (lineId: string, payload: AddToCartPayload) => {
      let targetLineId = lineId;

      setItems((prev) => {
        const next = prev.map((i) =>
          i.lineId === lineId ? buildLine(payload, lineId) : i,
        );
        const merged = consolidate(next);
        // After consolidation the surviving line for this signature may differ.
        const survivor = merged.find(
          (i) => lineSignature(i) === lineSignature(buildLine(payload, lineId)),
        );
        if (survivor) targetLineId = survivor.lineId;
        return merged;
      });

      flashLine(targetLineId);
    },
    [flashLine],
  );

  const removeLine = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const getLine = useCallback(
    (lineId: string) => items.find((i) => i.lineId === lineId),
    [items],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const subtotalCents = useMemo(
    () => items.reduce((sum, i) => sum + cartLineTotal(i), 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotalCents,
      cartPulse,
      lastAddedLineId,
      addToCart,
      updateLine,
      removeLine,
      getLine,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotalCents,
      cartPulse,
      lastAddedLineId,
      addToCart,
      updateLine,
      removeLine,
      getLine,
      clearCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

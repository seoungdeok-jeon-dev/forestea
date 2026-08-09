"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/api";
import { cartLineLabel, cartLineTotal } from "@/lib/cart-utils";

export function CartSummary() {
  const { items, itemCount, subtotalCents, updateLine, removeLine, lastAddedLineId } =
    useCart();

  if (itemCount === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
        <p className="text-ink-soft">Your cart is empty.</p>
        <Link
          href="/menu"
          className="mt-4 inline-block text-sm font-medium text-accent underline"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h2 className="font-display mb-6 text-2xl text-ink">Your order</h2>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.lineId}
            className={`flex flex-col gap-3 border-b border-line pb-4 last:border-0 sm:flex-row sm:items-center sm:justify-between ${
              lastAddedLineId === item.lineId ? "animate-cart-line" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{cartLineLabel(item)}</p>
              <p className="text-sm text-ink-soft">
                {formatPrice(item.basePrice)} base
                {item.modifiers.length > 0
                  ? ` · ${item.modifiers.map((m) => `${m.name} +${formatPrice(m.price)}`).join(", ")}`
                  : null}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  updateLine(item.lineId, {
                    ...item,
                    quantity: Math.max(1, item.quantity - 1),
                  })
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-subtle"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium text-ink">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateLine(item.lineId, {
                    ...item,
                    quantity: item.quantity + 1,
                  })
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-subtle"
                aria-label="Increase quantity"
              >
                +
              </button>
              <Link
                href={`/menu/${item.itemId}?edit=${item.lineId}&from=cart`}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-subtle"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => removeLine(item.lineId)}
                className="text-xs text-bark-600 hover:underline"
              >
                Remove
              </button>
              <span className="w-full text-right font-semibold text-ink sm:w-auto sm:pl-2">
                {formatPrice(cartLineTotal(item))}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <span className="text-ink-soft">Subtotal</span>
        <span className="text-xl font-semibold text-ink">
          {formatPrice(subtotalCents)}
        </span>
      </div>
    </div>
  );
}

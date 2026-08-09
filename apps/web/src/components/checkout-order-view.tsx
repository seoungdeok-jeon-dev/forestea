"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatPrice, type CheckoutTotals } from "@/lib/api";
import { cartLineTotal } from "@/lib/cart-utils";

interface Props {
  totals?: CheckoutTotals | null;
  totalsLoading?: boolean;
}

export function CheckoutOrderView({ totals, totalsLoading }: Props) {
  const { items, itemCount, subtotalCents, updateLine, removeLine, lastAddedLineId } =
    useCart();

  if (itemCount === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <p className="text-lg text-ink-soft">Your cart is empty.</p>
        <Link
          href="/menu"
          className="mt-6 rounded-full bg-accent px-8 py-3 text-sm font-semibold text-on-accent"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-ink-muted">
        Your order
      </p>

      <ul className="mt-5 divide-y divide-line">
        {items.map((item) => (
          <li
            key={item.lineId}
            className={`py-4 first:pt-0 ${
              lastAddedLineId === item.lineId ? "animate-cart-line" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg leading-tight text-ink">
                  {item.name}
                </h3>
                {item.modifiers.length > 0 ? (
                  <p className="mt-1 text-xs leading-snug text-ink-muted">
                    {item.modifiers.map((m) => m.name).join(" · ")}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 text-base font-semibold tabular-nums text-ink">
                {formatPrice(cartLineTotal(item))}
              </p>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-line bg-card">
                <button
                  type="button"
                  onClick={() =>
                    updateLine(item.lineId, {
                      ...item,
                      quantity: Math.max(1, item.quantity - 1),
                    })
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-l-full text-ink-soft hover:bg-subtle"
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="min-w-[1.75rem] text-center text-sm font-medium tabular-nums">
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
                  className="flex h-8 w-8 items-center justify-center rounded-r-full text-ink-soft hover:bg-subtle"
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
              <Link
                href={`/menu/${item.itemId}?edit=${item.lineId}&from=cart`}
                className="text-xs font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => removeLine(item.lineId)}
                className="text-xs text-ink-muted hover:text-bark-600"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 border-t border-line pt-5">
        <div className="flex justify-between text-sm text-ink-soft">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatPrice(subtotalCents)}</span>
        </div>
        {totalsLoading ? (
          <div className="flex justify-between text-sm text-ink-muted">
            <span>Tax</span>
            <span className="tabular-nums">Calculating…</span>
          </div>
        ) : totals ? (
          <div className="flex justify-between text-sm text-ink-soft">
            <span>Tax</span>
            <span className="tabular-nums">{formatPrice(totals.tax)}</span>
          </div>
        ) : null}
        <div className="flex justify-between pt-2 text-base font-semibold text-ink">
          <span>Total</span>
          <span className="tabular-nums">
            {formatPrice(totals?.total ?? subtotalCents)}
          </span>
        </div>
      </div>
    </div>
  );
}

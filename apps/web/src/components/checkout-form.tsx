"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CloverPaymentFields,
  type CloverPaymentHandle,
} from "@/components/clover-payment-fields";
import { CheckoutOrderView } from "@/components/checkout-order-view";
import { useCart } from "@/context/cart-context";
import {
  checkoutOrder,
  formatPrice,
  getPaymentConfig,
  toCartLineInputs,
  type CheckoutTotals,
  type PaymentConfig,
} from "@/lib/api";
import { placeOrderAction } from "@/app/checkout/actions";
import { cartLineTotal } from "@/lib/cart-utils";

interface Details {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  pickupNote: string;
}

const EMPTY_DETAILS: Details = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  streetAddress: "",
  city: "",
  state: "",
  postalCode: "",
  pickupNote: "",
};

export interface CheckoutFormProps {
  initialName?: string;
  initialEmail?: string;
}

const inputClass =
  "w-full rounded-xl border border-line bg-field px-4 py-3.5 text-[15px] text-ink placeholder:text-ink-muted transition focus:border-accent/40 focus:ring-2 focus:ring-forest-600/20 focus:outline-none";

function formatPickupNote(d: Details): string | undefined {
  const lines: string[] = [];
  if (d.pickupNote.trim()) lines.push(d.pickupNote.trim());
  const addr = [
    d.streetAddress.trim(),
    d.city.trim(),
    `${d.state.trim()} ${d.postalCode.trim()}`.trim(),
  ]
    .filter(Boolean)
    .join(", ");
  if (addr) lines.push(`Billing: ${addr}`);
  return lines.length > 0 ? lines.join("\n") : undefined;
}

function SectionLabel({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-on-accent">
        {step}
      </span>
      <h2 className="font-display text-xl text-ink">{title}</h2>
    </div>
  );
}

export function CheckoutForm({ initialName, initialEmail }: CheckoutFormProps = {}) {
  const router = useRouter();
  const { items, itemCount, clearCart } = useCart();
  const cloverRef = useRef<CloverPaymentHandle>(null);

  const [details, setDetails] = useState<Details>({
    ...EMPTY_DETAILS,
    customerName: initialName ?? "",
    customerEmail: initialEmail ?? "",
  });
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [totals, setTotals] = useState<CheckoutTotals | null>(null);
  const [totalsLoading, setTotalsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(partial: Partial<Details>) {
    setDetails((prev) => ({ ...prev, ...partial }));
  }

  useEffect(() => {
    getPaymentConfig()
      .then(setPaymentConfig)
      .catch(() =>
        setPaymentConfig({
          demo: true,
          sandbox: true,
          merchantId: null,
          pakmsPublicKey: null,
          sdkUrl: "https://checkout.sandbox.dev.clover.com/sdk.js",
          iframeReady: false,
        }),
      );
  }, []);

  // Pricing only depends on the cart contents — recompute (debounced) when the
  // line items change, never on contact/billing keystrokes.
  const lineKey = useMemo(
    () =>
      items
        .map(
          (i) =>
            `${i.itemId}:${i.quantity}:${i.modifiers
              .map((m) => m.id)
              .sort()
              .join(",")}`,
        )
        .join("|"),
    [items],
  );

  useEffect(() => {
    if (items.length === 0) {
      setTotals(null);
      return;
    }
    let cancelled = false;
    setTotalsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await checkoutOrder({ items: toCartLineInputs(items) });
        if (!cancelled) setTotals(result.totals);
      } catch {
        if (!cancelled) setTotals(null);
      } finally {
        if (!cancelled) setTotalsLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // lineKey captures the meaningful cart state; items ref is stable input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineKey]);

  const contactValid =
    details.customerName.trim().length > 0 &&
    details.customerEmail.trim().length > 0 &&
    details.customerPhone.trim().length > 0;

  const billingValid =
    details.streetAddress.trim().length > 0 &&
    details.city.trim().length > 0 &&
    details.state.trim().length >= 2 &&
    details.postalCode.trim().length >= 5;

  const canPay =
    contactValid && billingValid && Boolean(paymentConfig?.iframeReady) && !loading;

  const displayTotal =
    totals?.total ?? items.reduce((s, i) => s + cartLineTotal(i), 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!paymentConfig?.iframeReady) {
      setError("Payment is not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const sourceToken = await cloverRef.current!.createToken();
      const result = await placeOrderAction({
        items: toCartLineInputs(items),
        sourceToken,
        idempotencyKey: crypto.randomUUID(),
        customerName: details.customerName.trim(),
        customerEmail: details.customerEmail.trim(),
        customerPhone: details.customerPhone.trim(),
        pickupNote: formatPickupNote(details),
      });
      if (result.success && result.order) {
        clearCart();
        router.push(`/order/confirmation?id=${result.order.id}`);
      } else {
        setError(result.error ?? "Payment was not completed. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  if (itemCount === 0) {
    return <CheckoutOrderView totals={totals} totalsLoading={totalsLoading} />;
  }

  return (
    <>
      <form
        id="checkout-form"
        onSubmit={handleSubmit}
        className="grid gap-10 pb-28 lg:grid-cols-[1fr_minmax(320px,380px)] lg:gap-14 lg:pb-12"
      >
        {/* Form column */}
        <div className="order-2 space-y-12 lg:order-1">
          <section>
            <SectionLabel step={1} title="Pickup contact" />
            <p className="mb-4 -mt-2 text-sm text-ink-soft">
              We will notify you when your order is ready for pickup.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full name"
                value={details.customerName}
                onChange={(e) => patch({ customerName: e.target.value })}
                className={inputClass}
                autoComplete="name"
              />
              <input
                type="email"
                placeholder="Email"
                value={details.customerEmail}
                onChange={(e) => patch({ customerEmail: e.target.value })}
                className={inputClass}
                autoComplete="email"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={details.customerPhone}
                onChange={(e) => patch({ customerPhone: e.target.value })}
                className={inputClass}
                autoComplete="tel"
              />
            </div>
          </section>

          <section>
            <SectionLabel step={2} title="Billing address" />
            <p className="mb-4 -mt-2 text-sm text-ink-soft">
              For card verification and your receipt. Pickup is in-store at
              Forestea.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Street address"
                value={details.streetAddress}
                onChange={(e) => patch({ streetAddress: e.target.value })}
                className={inputClass}
                autoComplete="street-address"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={details.city}
                  onChange={(e) => patch({ city: e.target.value })}
                  className={inputClass}
                  autoComplete="address-level2"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={details.state}
                  onChange={(e) => patch({ state: e.target.value })}
                  className={inputClass}
                  autoComplete="address-level1"
                />
              </div>
              <input
                type="text"
                placeholder="ZIP / Postal code"
                value={details.postalCode}
                onChange={(e) => patch({ postalCode: e.target.value })}
                className={inputClass}
                autoComplete="postal-code"
              />
              <textarea
                placeholder="Pickup notes (optional)"
                value={details.pickupNote}
                onChange={(e) => patch({ pickupNote: e.target.value })}
                rows={2}
                className={inputClass}
              />
            </div>
          </section>

          <section>
            <SectionLabel step={3} title="Payment" />
            {paymentConfig ? (
              <CloverPaymentFields ref={cloverRef} config={paymentConfig} />
            ) : (
              <p className="text-sm text-ink-muted">Loading payment…</p>
            )}

            {error ? (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canPay}
              className="mt-6 hidden w-full rounded-full bg-accent py-4 text-sm font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-40 lg:block"
            >
              {loading ? "Processing…" : `Pay ${formatPrice(displayTotal)}`}
            </button>
          </section>
        </div>

        {/* Summary column */}
        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-3xl border border-line bg-card/60 p-6 lg:p-7">
              <CheckoutOrderView totals={totals} totalsLoading={totalsLoading} />
            </div>
          </div>
        </aside>
      </form>

      {/* Mobile sticky pay bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-6 py-4 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">
              Total
            </p>
            <p className="text-2xl font-semibold tabular-nums text-ink">
              {formatPrice(displayTotal)}
            </p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={!canPay}
            className="shrink-0 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-40"
          >
            {loading ? "Processing…" : "Pay"}
          </button>
        </div>
      </div>
    </>
  );
}

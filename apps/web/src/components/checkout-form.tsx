"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  StripePaymentFields,
  type StripePaymentHandle,
} from "@/components/stripe-payment-fields";
import { CheckoutOrderView } from "@/components/checkout-order-view";
import { useCart } from "@/context/cart-context";
import { useProgress } from "@/context/progress-context";
import {
  checkoutOrder,
  formatPrice,
  getPaymentConfig,
  toCartLineInputs,
  type CheckoutTotals,
  type PaymentConfig,
} from "@/lib/api";
import {
  confirmOrderAction,
  preparePaymentAction,
} from "@/app/checkout/actions";

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

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
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

let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise(publishableKey: string) {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

function checkoutKey(): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  const existing = sessionStorage.getItem("forestea-checkout-key");
  if (existing) return existing;
  const next = crypto.randomUUID();
  sessionStorage.setItem("forestea-checkout-key", next);
  return next;
}

export function CheckoutForm({
  initialName,
  initialEmail,
}: CheckoutFormProps = {}) {
  const router = useRouter();
  const { items, itemCount, clearCart } = useCart();
  const { begin, end } = useProgress();
  const paymentRef = useRef<StripePaymentHandle>(null);

  const [details, setDetails] = useState<Details>({
    ...EMPTY_DETAILS,
    customerName: initialName ?? "",
    customerEmail: initialEmail ?? "",
  });
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [totals, setTotals] = useState<CheckoutTotals | null>(null);
  const [totalsLoading, setTotalsLoading] = useState(false);
  const [totalsError, setTotalsError] = useState(false);
  const [quoteAttempt, setQuoteAttempt] = useState(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [intentLoading, setIntentLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(partial: Partial<Details>) {
    setDetails((prev) => ({ ...prev, ...partial }));
  }

  useEffect(() => {
    if (!loading) return;
    begin();
    return end;
  }, [loading, begin, end]);

  useEffect(() => {
    getPaymentConfig()
      .then(setPaymentConfig)
      .catch(() =>
        setPaymentConfig({
          provider: "stripe",
          publishableKey: null,
          ready: false,
          demo: true,
          sandbox: true,
          iframeReady: false,
        }),
      );
  }, []);

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
    setTotalsError(false);
    const timer = setTimeout(async () => {
      try {
        const result = await checkoutOrder({ items: toCartLineInputs(items) });
        if (!cancelled) setTotals(result.totals);
      } catch {
        if (!cancelled) {
          setTotals(null);
          setTotalsError(true);
        }
      } finally {
        if (!cancelled) setTotalsLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineKey, quoteAttempt]);

  const contactValid =
    details.customerName.trim().length > 0 &&
    details.customerEmail.trim().length > 0 &&
    details.customerPhone.trim().length > 0;

  const billingValid =
    details.streetAddress.trim().length > 0 &&
    details.city.trim().length > 0 &&
    details.state.trim().length >= 2 &&
    details.postalCode.trim().length >= 5;

  const totalsReady = totals !== null && !totalsLoading;
  const paymentsReady = Boolean(paymentConfig?.ready && paymentConfig.publishableKey);

  // Create / refresh the PaymentIntent once we have a total and contact email
  // (Stripe uses it for the receipt).
  useEffect(() => {
    if (!paymentsReady || !totalsReady || !contactValid || items.length === 0) {
      return;
    }

    let cancelled = false;
    setIntentLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      const result = await preparePaymentAction({
        items: toCartLineInputs(items),
        idempotencyKey: checkoutKey(),
        customerName: details.customerName.trim(),
        customerEmail: details.customerEmail.trim(),
        customerPhone: details.customerPhone.trim(),
        pickupNote: formatPickupNote(details),
      });

      if (cancelled) return;

      if (!result.success || !result.clientSecret || !result.orderId) {
        setClientSecret(null);
        setOrderId(null);
        setError(result.error ?? "Could not start payment.");
        setIntentLoading(false);
        return;
      }

      setClientSecret(result.clientSecret);
      setOrderId(result.orderId);
      if (result.totals) setTotals(result.totals);
      setIntentLoading(false);
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lineKey,
    totalsReady,
    paymentsReady,
    contactValid,
    details.customerEmail,
    details.customerName,
    details.customerPhone,
    details.streetAddress,
    details.city,
    details.state,
    details.postalCode,
    details.pickupNote,
  ]);

  const canPay =
    contactValid &&
    billingValid &&
    paymentsReady &&
    totalsReady &&
    Boolean(clientSecret && orderId) &&
    !intentLoading &&
    !loading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!paymentsReady) {
      setError("Payment is not configured. Add Stripe keys to the API env.");
      return;
    }
    if (!totalsReady || !clientSecret || !orderId) {
      setError("Please wait for your total to finish calculating.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await paymentRef.current!.confirm();
      const confirmed = await confirmOrderAction(orderId);
      if (confirmed.success && confirmed.order) {
        clearCart();
        sessionStorage.removeItem("forestea-checkout-key");
        router.push(`/order/confirmation?id=${confirmed.order.id}`);
        return;
      }
      setError(confirmed.error ?? "Payment was not completed. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    }
    setLoading(false);
  }

  if (itemCount === 0) {
    return <CheckoutOrderView totals={totals} totalsLoading={totalsLoading} />;
  }

  const paymentSection =
    !paymentsReady ? (
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Stripe is not configured yet. Add{" "}
        <code className="font-mono text-xs">STRIPE_SECRET_KEY</code> and{" "}
        <code className="font-mono text-xs">STRIPE_PUBLISHABLE_KEY</code> to the
        API environment, then restart the server.
      </p>
    ) : intentLoading || !clientSecret ? (
      <p className="text-sm text-ink-muted">
        {contactValid
          ? "Preparing secure payment…"
          : "Enter your contact details to unlock payment."}
      </p>
    ) : (
      <Elements
        stripe={getStripePromise(paymentConfig!.publishableKey!)}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#243d2e",
              colorBackground: "#ffffff",
              colorText: "#16271d",
              borderRadius: "12px",
            },
          },
        }}
      >
        <StripePaymentFields ref={paymentRef} />
      </Elements>
    );

  return (
    <>
      <form
        id="checkout-form"
        onSubmit={handleSubmit}
        autoComplete="off"
        className="grid gap-10 pb-28 lg:grid-cols-[1fr_minmax(320px,380px)] lg:gap-14 lg:pb-12"
      >
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
                autoComplete="off"
              />
              <input
                type="email"
                placeholder="Email"
                value={details.customerEmail}
                onChange={(e) => patch({ customerEmail: e.target.value })}
                className={inputClass}
                autoComplete="off"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={details.customerPhone}
                onChange={(e) => patch({ customerPhone: e.target.value })}
                className={inputClass}
                autoComplete="off"
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
                autoComplete="off"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={details.city}
                  onChange={(e) => patch({ city: e.target.value })}
                  className={inputClass}
                  autoComplete="off"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={details.state}
                  onChange={(e) => patch({ state: e.target.value })}
                  className={inputClass}
                  autoComplete="off"
                />
              </div>
              <input
                type="text"
                placeholder="ZIP / Postal code"
                value={details.postalCode}
                onChange={(e) => patch({ postalCode: e.target.value })}
                className={inputClass}
                autoComplete="off"
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
            {paymentSection}

            {error ? (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            ) : null}

            {totalsError && !loading ? (
              <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                We could not calculate your total right now.
                <button
                  type="button"
                  onClick={() => setQuoteAttempt((n) => n + 1)}
                  className="font-semibold underline underline-offset-2"
                >
                  Try again
                </button>
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canPay}
              aria-busy={loading}
              className="mt-6 hidden w-full rounded-full bg-accent py-4 text-sm font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-40 lg:block"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Processing…
                </span>
              ) : totalsLoading || intentLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Preparing…
                </span>
              ) : totals ? (
                `Pay ${formatPrice(totals.total)}`
              ) : (
                "Total unavailable"
              )}
            </button>

            {loading ? (
              <p
                aria-live="polite"
                className="mt-3 text-center text-xs text-ink-muted"
              >
                Confirming your payment — please keep this page open.
              </p>
            ) : null}
          </section>
        </div>

        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-3xl border border-line bg-card/60 p-5 sm:p-6 lg:p-7">
              <CheckoutOrderView totals={totals} totalsLoading={totalsLoading} />
            </div>
          </div>
        </aside>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-6 py-4 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">
              Total
            </p>
            {totalsLoading || intentLoading ? (
              <p
                aria-live="polite"
                className="text-base font-medium text-ink-muted"
              >
                Preparing…
              </p>
            ) : totals ? (
              <p className="text-2xl font-semibold tabular-nums text-ink">
                {formatPrice(totals.total)}
              </p>
            ) : (
              <p className="text-base font-medium text-ink-muted">Unavailable</p>
            )}
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={!canPay}
            aria-busy={loading}
            className="shrink-0 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-40"
          >
            {loading || totalsLoading || intentLoading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                {loading ? "Processing…" : "Preparing…"}
              </span>
            ) : (
              "Pay"
            )}
          </button>
        </div>
      </div>
    </>
  );
}

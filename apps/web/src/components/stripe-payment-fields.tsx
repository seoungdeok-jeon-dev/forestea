"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface StripePaymentHandle {
  confirm: () => Promise<{ paymentIntentId: string }>;
}

export const StripePaymentFields = forwardRef<StripePaymentHandle>(
  function StripePaymentFields(_props, ref) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      async confirm() {
        if (!stripe || !elements) {
          throw new Error("Payment form is still loading. Please try again.");
        }

        setMessage(null);
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
          confirmParams: {
            return_url:
              typeof window !== "undefined"
                ? `${window.location.origin}/order/confirmation`
                : undefined,
          },
        });

        if (error) {
          const text = error.message ?? "Payment failed. Please try again.";
          setMessage(text);
          throw new Error(text);
        }

        if (!paymentIntent || paymentIntent.status !== "succeeded") {
          throw new Error("Payment was not completed. Please try again.");
        }

        return { paymentIntentId: paymentIntent.id };
      },
    }));

    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-line bg-card px-4 py-4">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        </div>
        {message ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {message}
          </p>
        ) : null}
      </div>
    );
  },
);

"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { PaymentConfig } from "@/lib/api";

/** Styles inside Clover iframes — placeholders are SDK-controlled (Card Number, MM/YY, etc.). */
const FIELD_STYLE = {
  body: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "15px",
    margin: "0",
    padding: "0",
  },
  // line-height === container height (3rem) vertically centers the single line.
  input: {
    fontSize: "15px",
    lineHeight: "3rem",
    height: "3rem",
    color: "#1a2e22",
    margin: "0",
    padding: "0",
  },
};

const MOUNT_CLASS = "clover-field w-full rounded-lg border border-line bg-white";

function setFieldError(elementId: string, message: string | null) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message ?? "";
  el.classList.toggle("hidden", !message);
}

function bindFieldValidation(
  element: CloverElement,
  errorElementId: string,
  fieldKey: string,
) {
  const showErrors = (event: { errors?: Record<string, { error?: string }> }) => {
    const field = event.errors?.[fieldKey];
    setFieldError(
      errorElementId,
      field?.error && field.error.length > 0 ? field.error : null,
    );
  };
  element.addEventListener("change", showErrors);
  element.addEventListener("blur", showErrors);
}

export interface CloverPaymentHandle {
  createToken: () => Promise<string>;
}

interface Props {
  config: PaymentConfig;
}

function loadCloverSdk(sdkUrl: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Clover SDK requires a browser"));
  }

  if (window.Clover) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    `script[data-clover-sdk="${sdkUrl}"]`,
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Clover SDK")),
      );
      if (window.Clover) resolve();
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = sdkUrl;
    script.async = true;
    script.dataset.cloverSdk = sdkUrl;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Clover SDK"));
    document.head.appendChild(script);
  });
}

export const CloverPaymentFields = forwardRef<CloverPaymentHandle, Props>(
  function CloverPaymentFields({ config }, ref) {
    const cloverRef = useRef<CloverInstance | null>(null);
    const [initError, setInitError] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    useImperativeHandle(ref, () => ({
      async createToken() {
        const clover = cloverRef.current;
        if (!clover) {
          throw new Error("Payment form is not ready yet");
        }
        const result = await clover.createToken();
        if (result.errors) {
          const messages = Object.values(result.errors)
            .filter(Boolean)
            .join(" ");
          throw new Error(messages || "Please check your card details");
        }
        if (!result.token) {
          throw new Error("Could not process card. Please try again.");
        }
        return result.token;
      },
    }));

    useEffect(() => {
      if (!config.iframeReady || !config.pakmsPublicKey || !config.merchantId) {
        return;
      }

      let cancelled = false;

      async function init() {
        setInitError(null);
        setReady(false);
        await loadCloverSdk(config.sdkUrl);

        if (cancelled || !window.Clover) return;

        const clover = new window.Clover(config.pakmsPublicKey!, {
          merchantId: config.merchantId!,
          locale: "en-US",
        });
        cloverRef.current = clover;

        const elements = clover.elements();
        const cardNumber = elements.create("CARD_NUMBER", FIELD_STYLE);
        const cardDate = elements.create("CARD_DATE", FIELD_STYLE);
        const cardCvv = elements.create("CARD_CVV", FIELD_STYLE);
        const cardPostal = elements.create("CARD_POSTAL_CODE", FIELD_STYLE);

        cardNumber.mount("#clover-card-number");
        cardDate.mount("#clover-card-date");
        cardCvv.mount("#clover-card-cvv");
        cardPostal.mount("#clover-card-postal");

        bindFieldValidation(cardNumber, "clover-err-number", "CARD_NUMBER");
        bindFieldValidation(cardDate, "clover-err-date", "CARD_DATE");
        bindFieldValidation(cardCvv, "clover-err-cvv", "CARD_CVV");
        bindFieldValidation(cardPostal, "clover-err-postal", "CARD_POSTAL_CODE");

        setReady(true);
      }

      init().catch((err) => {
        if (!cancelled) {
          setInitError(
            err instanceof Error ? err.message : "Failed to load payment form",
          );
        }
      });

      return () => {
        cancelled = true;
        cloverRef.current = null;
        setReady(false);
      };
    }, [
      config.iframeReady,
      config.merchantId,
      config.pakmsPublicKey,
      config.sdkUrl,
    ]);

    if (!config.iframeReady) {
      return (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Card payments are unavailable. Connect Clover in{" "}
          <a href="/admin/setting" className="font-medium underline">
            settings
          </a>{" "}
          and enable Hosted iFrame in the Clover Developer dashboard.
        </p>
      );
    }

    if (initError) {
      return (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {initError}
        </p>
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-soft">
          Enter your card below. Card data is handled by Clover and never
          touches our servers.
        </p>

        <div className="space-y-1">
          <div id="clover-card-number" className={MOUNT_CLASS} />
          <p
            id="clover-err-number"
            className="hidden text-xs text-red-700"
            role="alert"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <div id="clover-card-date" className={MOUNT_CLASS} />
            <p
              id="clover-err-date"
              className="hidden text-xs text-red-700"
              role="alert"
            />
          </div>
          <div className="space-y-1">
            <div id="clover-card-cvv" className={MOUNT_CLASS} />
            <p
              id="clover-err-cvv"
              className="hidden text-xs text-red-700"
              role="alert"
            />
          </div>
          <div className="space-y-1">
            <div id="clover-card-postal" className={MOUNT_CLASS} />
            <p
              id="clover-err-postal"
              className="hidden text-xs text-red-700"
              role="alert"
            />
          </div>
        </div>

        {!ready && (
          <p className="text-xs text-ink-muted">Loading secure card fields…</p>
        )}

        {config.sandbox ? (
          <details className="rounded-lg border border-line bg-subtle px-3 py-2 text-xs text-ink-soft">
            <summary className="cursor-pointer font-medium">
              Sandbox test card
            </summary>
            <p className="mt-2 font-mono leading-relaxed">
              6011361000006668 · 12/30 · CVV 123 · any ZIP
            </p>
          </details>
        ) : null}
      </div>
    );
  },
);

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { OnvoIntent } from "@/hooks/use-checkout";
import { formatPrice, formatShippingCost } from "@/utils/formatPrice";

const SDK_SRC = "https://sdk.onvopay.com/sdk.js";

interface OnvoSdk {
  pay: (config: {
    publicKey: string;
    paymentIntentId: string;
    paymentType?: string;
    locale?: string;
    onSuccess?: (data: unknown) => void;
    onError?: (data: unknown) => void;
  }) => { render: (selector: string) => void };
}

declare global {
  interface Window {
    onvo?: OnvoSdk;
  }
}

let sdkLoading: Promise<OnvoSdk> | null = null;

function loadOnvoSdk(): Promise<OnvoSdk> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("ONVO SDK requires a browser"));
  }
  if (window.onvo) return Promise.resolve(window.onvo);
  if (sdkLoading) return sdkLoading;

  sdkLoading = new Promise<OnvoSdk>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SDK_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.onvo) resolve(window.onvo);
        else reject(new Error("ONVO SDK loaded but window.onvo missing"));
      });
      existing.addEventListener("error", () => reject(new Error("ONVO SDK failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => {
      if (window.onvo) resolve(window.onvo);
      else reject(new Error("ONVO SDK loaded but window.onvo missing"));
    };
    script.onerror = () => reject(new Error("ONVO SDK failed to load"));
    document.head.appendChild(script);
  });
  return sdkLoading;
}

interface CheckoutOnvoStepProps {
  intent: OnvoIntent | null;
  ensureIntent: () => Promise<OnvoIntent | null>;
  totalPrice: number;
  locale?: string;
  usdToCrc?: number;
  shippingCost?: number;
  shippingToConvenir?: boolean;
  hasReservation?: boolean;
  hasCustomSession?: boolean;
  reservationPrice?: number;
  formErrors: Record<string, string>;
  onSuccess: () => void;
  onError: (message?: string) => void;
  onBack: () => void;
}

export function CheckoutOnvoStep({
  intent,
  ensureIntent,
  totalPrice,
  locale = "en",
  usdToCrc,
  shippingCost = 0,
  shippingToConvenir = false,
  hasReservation,
  hasCustomSession,
  reservationPrice = 60,
  formErrors,
  onSuccess,
  onError,
  onBack,
}: CheckoutOnvoStepProps) {
  const { t } = useTranslation();
  const totalFormatted = formatPrice(totalPrice, locale, usdToCrc);
  const shippingFormatted = formatShippingCost(shippingCost, locale, usdToCrc);

  const mountRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  // Step 1: ensure intent fetched (lazy — runs once on mount).
  useEffect(() => {
    let cancelled = false;
    if (!intent) {
      ensureIntent().then((result) => {
        if (cancelled) return;
        if (!result) setSdkError("intent_fetch_failed");
      });
    }
    return () => {
      cancelled = true;
    };
  }, [intent, ensureIntent]);

  // Step 2: once intent is ready, load SDK and render into mount div.
  useEffect(() => {
    if (!intent || mounted.current || !mountRef.current) return;
    mounted.current = true;

    loadOnvoSdk()
      .then((sdk) => {
        if (!mountRef.current) return;
        const widget = sdk.pay({
          publicKey: intent.publishableKey,
          paymentIntentId: intent.paymentIntentId,
          paymentType: "one_time",
          locale: locale.startsWith("es") ? "es" : "en",
          onSuccess: () => onSuccess(),
          onError: (data) => {
            const msg =
              typeof data === "object" && data !== null && "message" in data
                ? String((data as { message?: unknown }).message ?? "")
                : "";
            onError(msg || undefined);
          },
        });
        widget.render("#onvo-mount");
      })
      .catch((err: Error) => setSdkError(err.message));
  }, [intent, locale, onSuccess, onError]);

  return (
    <motion.div
      key="onvo-payment-step"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      {hasReservation && (
        <div className="mb-6 p-4 border border-white/20 bg-white/5">
          <p className="text-sm text-gray-300">
            {t("checkout.reservationNoticePayment", { price: formatPrice(reservationPrice, locale, usdToCrc) })}
          </p>
        </div>
      )}
      {hasCustomSession && !hasReservation && (
        <div className="mb-6 p-4 border border-white/20 bg-white/5">
          <p className="text-sm text-gray-300">{t("checkout.customSessionNotice")}</p>
        </div>
      )}

      <div className="border border-white/20 bg-white/[0.02] p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-gray-400" />
            <span className="text-xs uppercase tracking-widest text-gray-300">
              {t("checkout.securePayment")}
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg text-white font-medium" data-testid="text-payment-total">
              {totalFormatted}
            </span>
            {shippingCost > 0 && (
              <span className="block text-sm text-gray-300 mt-0.5">
                + {shippingFormatted} {t("checkout.shipping")}
              </span>
            )}
            {shippingToConvenir && (
              <span className="block text-sm text-gray-300 mt-0.5">
                {t("checkout.shippingToConvenir")}
              </span>
            )}
          </div>
        </div>

        {sdkError && (
          <p className="text-red-400 text-sm mb-4" data-testid="error-onvo-sdk">
            {sdkError === "intent_fetch_failed"
              ? formErrors._api ?? "No se pudo iniciar el pago. Volvé al paso anterior."
              : sdkError}
          </p>
        )}
        {formErrors._api && !sdkError && (
          <p className="text-red-400 text-sm mb-4">{formErrors._api}</p>
        )}

        <div
          id="onvo-mount"
          ref={mountRef}
          className="min-h-[280px]"
          data-testid="onvo-mount"
        />

        {!intent && !sdkError && (
          <p className="text-sm text-gray-400 mt-2">
            {t("checkout.preparingPayment")}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 text-sm uppercase tracking-widest border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
          data-testid="button-back-to-method"
        >
          {t("checkout.back")}
        </button>
      </div>
    </motion.div>
  );
}

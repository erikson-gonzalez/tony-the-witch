import { motion } from "framer-motion";
import { CreditCard, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CardForm } from "@/types";
import { formatCardNumber, formatExpiry } from "@/utils/format-payment";
import { formatPrice, formatShippingCost } from "@/utils/formatPrice";
import { inputClass, labelClass } from "./cart-items-list";

interface CheckoutPaymentStepProps {
  card: CardForm;
  totalPrice: number;
  locale?: string;
  usdToCrc?: number;
  shippingCost?: number;
  shippingToConvenir?: boolean;
  formErrors: Record<string, string>;
  hasReservation?: boolean;
  hasCustomSession?: boolean;
  reservationPrice?: number;
  onUpdateCard: (updates: Partial<CardForm>) => void;
  onValidate: () => void;
  onBack: () => void;
}

function formatCvcInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

export function CheckoutPaymentStep({
  card,
  totalPrice,
  locale = "en",
  usdToCrc,
  shippingCost = 0,
  shippingToConvenir = false,
  formErrors,
  hasReservation,
  hasCustomSession,
  reservationPrice = 60,
  onUpdateCard,
  onValidate,
  onBack,
}: CheckoutPaymentStepProps) {
  const { t } = useTranslation();
  const totalFormatted = formatPrice(totalPrice, locale, usdToCrc);
  const shippingFormatted = formatShippingCost(shippingCost, locale, usdToCrc);

  return (
    <motion.div
      key="payment-step"
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
          <p className="text-sm text-gray-300">
            {t("checkout.customSessionNotice")}
          </p>
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

        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t("checkout.cardNumber")}</label>
            <div className="relative">
              <input
                type="text"
                value={card.number}
                onChange={(e) => onUpdateCard({ number: formatCardNumber(e.target.value) })}
                className={`${inputClass} pr-12`}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                data-testid="input-card-number"
              />
              <CreditCard
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
              />
            </div>
            {formErrors.number && (
              <p className="text-red-400 text-xs mt-1" data-testid="error-card-number">
                {formErrors.number}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>{t("checkout.holder")}</label>
            <input
              type="text"
              value={card.holder}
              onChange={(e) => onUpdateCard({ holder: e.target.value })}
              className={inputClass}
              placeholder={t("checkout.holderPlaceholder")}
              data-testid="input-card-holder"
            />
            {formErrors.holder && (
              <p className="text-red-400 text-xs mt-1" data-testid="error-card-holder">
                {formErrors.holder}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className={labelClass}>{t("checkout.expiry")}</label>
              <input
                type="text"
                value={card.expiry}
                onChange={(e) => onUpdateCard({ expiry: formatExpiry(e.target.value) })}
                className={inputClass}
                placeholder="MM / YY"
                maxLength={7}
                data-testid="input-card-expiry"
              />
              {formErrors.expiry && (
                <p className="text-red-400 text-xs mt-1" data-testid="error-card-expiry">
                  {formErrors.expiry}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className={labelClass}>{t("checkout.cvc")}</label>
              <input
                type="text"
                value={card.cvc}
                onChange={(e) => onUpdateCard({ cvc: formatCvcInput(e.target.value) })}
                className={inputClass}
                placeholder="123"
                maxLength={4}
                data-testid="input-card-cvc"
              />
              {formErrors.cvc && (
                <p className="text-red-400 text-xs mt-1" data-testid="error-card-cvc">
                  {formErrors.cvc}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 text-sm uppercase tracking-widest border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
          data-testid="button-back-to-info"
        >
          {t("checkout.back")}
        </button>
        <button
          onClick={onValidate}
          className="flex-1 py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all"
          data-testid="button-pay-now"
        >
          {shippingCost > 0
            ? t("checkout.payWithShipping", { total: totalFormatted, shipping: shippingFormatted })
            : shippingToConvenir
              ? t("checkout.payShippingConvenir", { total: totalFormatted })
              : t("checkout.pay", { total: totalFormatted })}
        </button>
      </div>
    </motion.div>
  );
}

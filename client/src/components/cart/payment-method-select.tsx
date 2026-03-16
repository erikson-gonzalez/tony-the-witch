import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaymentMethodSelectProps {
  isSubmitting: boolean;
  error?: string;
  onSelect: (method: "sinpe" | "card") => void;
  onBack: () => void;
}

export function PaymentMethodSelect({
  isSubmitting,
  error,
  onSelect,
  onBack,
}: PaymentMethodSelectProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<"sinpe" | "card" | null>(null);

  return (
    <motion.div
      key="payment-method-step"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-sm uppercase tracking-widest text-gray-400 mb-6">
        {t("checkout.selectPaymentMethod")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setSelected("card")}
          className={`p-6 border text-left transition-all ${
            selected === "card"
              ? "border-amber-400 bg-amber-400/5"
              : "border-white/20 hover:border-white/40"
          }`}
        >
          <CreditCard size={28} className="text-gray-300 mb-3" />
          <p className="text-white font-medium">{t("checkout.card")}</p>
        </button>

        <button
          onClick={() => setSelected("sinpe")}
          className={`p-6 border text-left transition-all ${
            selected === "sinpe"
              ? "border-amber-400 bg-amber-400/5"
              : "border-white/20 hover:border-white/40"
          }`}
        >
          <Smartphone size={28} className="text-gray-300 mb-3" />
          <p className="text-white font-medium">{t("checkout.sinpe")}</p>
          <p className="text-xs text-gray-500 mt-1">
            {t("checkout.sinpePopular")}
          </p>
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{t(error)}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3 text-sm uppercase tracking-widest border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors disabled:opacity-50"
        >
          {t("checkout.back")}
        </button>
        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected || isSubmitting}
          className="flex-1 py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t("checkoutProcessing") : t("checkout.continuePayment")}
        </button>
      </div>
    </motion.div>
  );
}

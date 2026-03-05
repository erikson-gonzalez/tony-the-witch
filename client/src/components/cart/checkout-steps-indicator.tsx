import { useTranslation } from "react-i18next";
import type { CheckoutStep } from "@/types";

interface CheckoutStepsIndicatorProps {
  step: CheckoutStep;
}

export function CheckoutStepsIndicator({ step }: CheckoutStepsIndicatorProps) {
  const { t } = useTranslation();
  const showInfo = step === "info" || step === "payment";
  const showPayment = step === "payment";

  return (
    <div className="flex items-center gap-3 mb-10" data-testid="checkout-steps">
      <div
        className={`h-0.5 flex-1 ${showInfo ? "bg-white" : "bg-white/20"}`}
      />
      <span
        className={`text-xs uppercase tracking-widest ${
          step === "info" ? "text-white font-medium" : "text-gray-400"
        }`}
      >
        {t("checkout.info")}
      </span>
      <div
        className={`h-0.5 flex-1 ${showPayment ? "bg-white" : "bg-white/20"}`}
      />
      <span
        className={`text-xs uppercase tracking-widest ${
          step === "payment" ? "text-white font-medium" : "text-gray-400"
        }`}
      >
        {t("checkout.payment")}
      </span>
      <div className="h-0.5 flex-1 bg-white/20" />
    </div>
  );
}

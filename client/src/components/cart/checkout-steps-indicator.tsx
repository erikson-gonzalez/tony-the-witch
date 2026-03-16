import { useTranslation } from "react-i18next";
import type { CheckoutStep } from "@/types";

interface CheckoutStepsIndicatorProps {
  step: CheckoutStep;
}

export function CheckoutStepsIndicator({ step }: CheckoutStepsIndicatorProps) {
  const { t } = useTranslation();

  const steps: { key: string; label: string; active: boolean }[] = [
    {
      key: "info",
      label: t("checkout.info"),
      active: step === "info" || step === "payment_method" || step === "payment" || step === "sinpe_instructions" || step === "sinpe_proof",
    },
    {
      key: "payment",
      label: t("checkout.payment"),
      active: step === "payment_method" || step === "payment" || step === "sinpe_instructions" || step === "sinpe_proof",
    },
  ];

  return (
    <div className="flex items-center gap-3 mb-10" data-testid="checkout-steps">
      {steps.map((s, i) => (
        <div key={s.key} className="contents">
          <div
            className={`h-0.5 flex-1 ${s.active ? "bg-white" : "bg-white/20"}`}
          />
          <span
            className={`text-xs uppercase tracking-widest ${
              s.active && !steps[i + 1]?.active ? "text-white font-medium" : "text-gray-400"
            }`}
          >
            {s.label}
          </span>
        </div>
      ))}
      <div className="h-0.5 flex-1 bg-white/20" />
    </div>
  );
}

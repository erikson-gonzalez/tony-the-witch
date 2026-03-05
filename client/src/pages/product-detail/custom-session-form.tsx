import { useTranslation } from "react-i18next";
import { formatAmountWithCommas } from "@/utils/format-amount-input";

interface CustomSessionFormProps {
  description: string;
  customAmount: string;
  onAmountChange: (v: string) => void;
  payInUsd: boolean;
  onPayInUsdChange: (v: boolean) => void;
}

export function CustomSessionForm({
  description,
  customAmount,
  onAmountChange,
  payInUsd,
  onPayInUsdChange,
}: CustomSessionFormProps) {
  const { t } = useTranslation();

  const handleInputChange = (value: string) => {
    const raw = payInUsd
      ? value.replace(/,/g, "").replace(/[^\d.]/g, "").replace(/(\.\d*)\./g, "$1")
      : value.replace(/\D/g, "");
    onAmountChange(formatAmountWithCommas(raw, payInUsd));
  };

  return (
    <div className="mb-8">
      <p className="text-gray-400 text-sm leading-relaxed mb-6">{description}</p>
      <div className="mb-6 space-y-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={payInUsd}
            onChange={(e) => onPayInUsdChange(e.target.checked)}
            className="w-4 h-4 accent-white"
            data-testid="checkbox-pay-usd"
          />
          <span className="text-sm text-gray-300">{t("product.payInUsd")}</span>
        </label>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
            {payInUsd ? t("product.customSessionAmountUsd") : t("product.customSessionAmountCrc")}
          </label>
          <input
            type="text"
            value={customAmount}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={payInUsd ? "60" : "30,000"}
            className="w-full px-4 py-3 bg-white/5 border border-white/30 text-white placeholder-gray-500 focus:border-white focus:outline-none text-lg"
            data-testid="input-custom-amount"
          />
        </div>
      </div>
    </div>
  );
}

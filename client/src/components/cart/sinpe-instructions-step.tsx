import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SinpeInstructionsStepProps {
  orderNumber: string;
  totalCrc: number;
  sinpePhone: string;
  sinpeAccountHolder: string;
  sinpeBankName?: string;
  onContinue: () => void;
}

export function SinpeInstructionsStep({
  orderNumber,
  totalCrc,
  sinpePhone,
  sinpeAccountHolder,
  sinpeBankName,
  onContinue,
}: SinpeInstructionsStepProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyPhone = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sinpePhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }, [sinpePhone]);

  const crcFormatted = `₡${totalCrc.toLocaleString("es-CR")}`;

  return (
    <motion.div
      key="sinpe-instructions-step"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border border-white/20 bg-white/[0.02] p-6 md:p-8 mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-6">
          {t("checkout.sinpeInstructions")}
        </p>

        {/* Phone number */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-1">{t("checkout.sinpePhone")}</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl font-mono text-white tracking-wider">
              {sinpePhone}
            </span>
            <button
              onClick={copyPhone}
              className="p-2 border border-white/20 hover:border-white/40 text-gray-400 hover:text-white transition-colors"
              title="Copiar"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-400 mt-1">{t("checkout.sinpeCopied")}</p>
          )}
        </div>

        {/* Account holder */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">{t("checkout.sinpeAccountHolder")}</p>
          <p className="text-white">{sinpeAccountHolder}</p>
          {sinpeBankName && (
            <p className="text-sm text-gray-400">{sinpeBankName}</p>
          )}
        </div>

        {/* Amount */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">{t("checkout.sinpeAmount")}</p>
          <p className="text-2xl font-bold text-amber-400">{crcFormatted}</p>
        </div>

        {/* Reference */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-1">{t("checkout.sinpeStep5")}</p>
          <p className="text-white font-mono font-medium">{orderNumber}</p>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex gap-3">
            <span className="text-amber-400 font-medium">1.</span>
            <span>{t("checkout.sinpeStep1")}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-medium">2.</span>
            <span>{t("checkout.sinpeStep2")}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-medium">3.</span>
            <span>{t("checkout.sinpeStep3")}: <span className="text-white font-mono">{sinpePhone}</span></span>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-medium">4.</span>
            <span>{t("checkout.sinpeStep4")}: <span className="text-white font-bold">{crcFormatted}</span></span>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-medium">5.</span>
            <span>{t("checkout.sinpeStep5")}: <span className="text-white font-mono">{orderNumber}</span></span>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-medium">6.</span>
            <span>{t("checkout.sinpeStep6")}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all"
      >
        {t("checkout.sinpeDoneTransfer")}
      </button>
    </motion.div>
  );
}

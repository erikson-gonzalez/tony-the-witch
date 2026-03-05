import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function CheckoutProcessingStep() {
  const { t } = useTranslation();

  return (
    <motion.div
      key="processing-step"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-24"
    >
      <div className="relative w-12 h-12 mx-auto mb-8">
        <motion.div
          className="absolute inset-0 border border-white/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 border-t border-white"
          animate={{ rotate: -360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <p
        className="text-sm uppercase tracking-widest text-gray-400"
        data-testid="text-processing"
      >
        {t("checkoutProcessing")}
      </p>
    </motion.div>
  );
}

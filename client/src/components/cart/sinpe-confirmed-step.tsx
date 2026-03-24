import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

interface SinpeConfirmedStepProps {
  orderNumber: string;
  customerEmail: string;
}

export function SinpeConfirmedStep({ orderNumber, customerEmail }: SinpeConfirmedStepProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      key="sinpe-confirmed-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-16 h-16 border border-amber-400/40 flex items-center justify-center mx-auto mb-6"
      >
        <Check size={28} className="text-amber-400" />
      </motion.div>
      <h2
        className="text-2xl md:text-3xl uppercase tracking-widest mb-4"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t("checkout.sinpeConfirmedTitle")}
      </h2>
      <p className="text-xl font-mono text-white mb-2">{orderNumber}</p>
      <p className="text-gray-500 mb-8">
        {t("checkout.sinpeConfirmedMessage")}
      </p>

      <div className="flex flex-col gap-4 items-center">
        <Link
          href={`/order/${orderNumber}?email=${encodeURIComponent(customerEmail)}`}
          className="text-sm uppercase tracking-widest border-b border-amber-400/50 pb-1 text-amber-400 hover:border-amber-400 transition-colors"
        >
          {t("checkout.sinpeViewStatus")}
        </Link>
        <Link
          href="/shop"
          className="text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors text-gray-400 hover:text-white"
        >
          {t("checkout.backToShop")}
        </Link>
      </div>
    </motion.div>
  );
}

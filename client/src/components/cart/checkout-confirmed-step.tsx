import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

interface CheckoutConfirmedStepProps {
  customerName: string;
  customerEmail: string;
}

export function CheckoutConfirmedStep({
  customerName,
  customerEmail,
}: CheckoutConfirmedStepProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      key="confirmed-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-16 h-16 border border-white/20 flex items-center justify-center mx-auto mb-6"
      >
        <Check size={28} className="text-white" />
      </motion.div>
      <h2
        className="text-2xl md:text-3xl uppercase tracking-widest mb-4"
        style={{ fontFamily: "var(--font-display)" }}
        data-testid="text-order-confirmed"
      >
        {t("checkout.confirmed")}
      </h2>
      <p className="text-gray-500 mb-2" data-testid="text-order-message">
        {t("checkout.confirmedMessage", { name: customerName })}{" "}
        <span className="text-gray-300">{customerEmail}</span>.
      </p>
      <p className="text-xs text-gray-600 mb-8">
        {t("checkout.confirmedSimulated")}
      </p>
      <Link
        href="/shop"
        className="text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors text-gray-400 hover:text-white"
        data-testid="link-back-to-shop"
      >
        {t("common.continueShopping")}
      </Link>
    </motion.div>
  );
}

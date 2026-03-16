import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

interface CheckoutConfirmedStepProps {
  customerName: string;
  customerEmail: string;
  orderNumber?: string | null;
}

export function CheckoutConfirmedStep({
  customerName,
  customerEmail,
  orderNumber,
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
      {orderNumber && (
        <p className="text-xl font-mono text-white mb-2">{orderNumber}</p>
      )}
      <p className="text-gray-500 mb-8" data-testid="text-order-message">
        {t("checkout.confirmedMessage", { name: customerName })}{" "}
        <span className="text-gray-300">{customerEmail}</span>.
      </p>
      <div className="flex flex-col gap-4 items-center">
        {orderNumber && (
          <Link
            href={`/order/${orderNumber}`}
            className="text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors text-gray-400 hover:text-white"
          >
            {t("checkout.sinpeViewStatus")}
          </Link>
        )}
        <Link
          href="/shop"
          className="text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors text-gray-400 hover:text-white"
          data-testid="link-back-to-shop"
        >
          {t("common.continueShopping")}
        </Link>
      </div>
    </motion.div>
  );
}

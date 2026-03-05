import { ShoppingCart, Check, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProductActionsProps {
  isCustomSession: boolean;
  added: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ProductActions({
  isCustomSession,
  added,
  onAddToCart,
  onBuyNow,
}: ProductActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-3 mt-auto">
      {!isCustomSession && (
        <button
          onClick={onAddToCart}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm uppercase tracking-widest border transition-all ${
            added
              ? "border-green-500 text-green-500 bg-green-500/10"
              : "border-white text-white hover:bg-white hover:text-black"
          }`}
          data-testid="button-add-to-cart"
        >
          {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          {added ? t("product.added") : t("product.addToCart")}
        </button>
      )}
      <button
        onClick={onBuyNow}
        className={`flex items-center justify-center gap-2 py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all ${
          isCustomSession ? "w-full" : "flex-1"
        }`}
        data-testid="button-buy-now"
      >
        <Zap size={16} />
        {t("product.buyNow")}
      </button>
    </div>
  );
}

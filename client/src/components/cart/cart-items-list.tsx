import { memo } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, Share2 } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/utils/formatPrice";
import { isCustomSession } from "@/utils/shipping";
import { getReservationShareUrl } from "@/constants/reservation-share";
import { useToast } from "@/hooks/use-toast";
import type { CartItem } from "@/lib/cart";

const INPUT_BASE =
  "w-full bg-white/5 border border-white/30 px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-white focus:bg-white/10 focus:outline-none transition-colors";
const LABEL_BASE = "block text-xs uppercase tracking-widest text-gray-300 mb-2";

export const inputClass = INPUT_BASE;
export const labelClass = LABEL_BASE;

interface CartItemsListProps {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  locale?: string;
  usdToCrc?: number;
  hasReservation?: boolean;
  onUpdateQuantity: (productId: number, quantity: number, size?: string, color?: string) => void;
  onRemoveItem: (productId: number, size?: string, color?: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

interface CartLineItemProps {
  item: CartItem;
  locale?: string;
  usdToCrc?: number;
  onUpdateQuantity: (productId: number, quantity: number, size?: string, color?: string) => void;
  onRemoveItem: (productId: number, size?: string, color?: string) => void;
}

const CartLineItem = memo(function CartLineItem({
  item,
  locale = "en",
  usdToCrc,
  onUpdateQuantity,
  onRemoveItem,
}: CartLineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 md:gap-6 py-6 border-b border-white/10"
      data-testid={`cart-item-${item.slug}`}
    >
      {item.isReservation || isCustomSession(item) ? (
        <div className="shrink-0">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-900 overflow-hidden">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
        </div>
      ) : (
        <Link href={`/shop/${item.slug}`} className="shrink-0">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-900 overflow-hidden">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
        </Link>
      )}

      <div className="flex-1 min-w-0">
        {item.isReservation || isCustomSession(item) ? (
          <h3 className="text-sm uppercase tracking-wider text-white" data-testid={`text-cart-item-name-${item.slug}`}>
            {item.name}
          </h3>
        ) : (
          <Link href={`/shop/${item.slug}`}>
            <h3
              className="text-sm uppercase tracking-wider text-white hover:text-gray-300 transition-colors"
              data-testid={`text-cart-item-name-${item.slug}`}
            >
              {item.name}
            </h3>
          </Link>
        )}
        {!item.isReservation && !isCustomSession(item) && (item.size || item.color) && (
          <p className="text-xs text-gray-500 mt-1">
            {[item.size, item.color].filter(Boolean).join(" / ")}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-1">{formatPrice(item.price, locale, usdToCrc)}</p>

        <div className="flex items-center gap-3 mt-3">
          {!item.isReservation && !isCustomSession(item) && (
            <>
              <button
                onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                className="w-7 h-7 flex items-center justify-center border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                data-testid={`button-decrease-${item.slug}`}
              >
                <Minus size={12} />
              </button>
              <span className="text-sm w-6 text-center" data-testid={`text-quantity-${item.slug}`}>
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                className="w-7 h-7 flex items-center justify-center border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                data-testid={`button-increase-${item.slug}`}
              >
                <Plus size={12} />
              </button>
            </>
          )}
          <button
            onClick={() => onRemoveItem(item.productId, item.size, item.color)}
            className="ml-auto text-gray-500 hover:text-red-400 transition-colors"
            data-testid={`button-remove-${item.slug}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="text-sm text-white shrink-0" data-testid={`text-subtotal-${item.slug}`}>
        {formatPrice(item.price * item.quantity, locale, usdToCrc)}
      </div>
    </motion.div>
  );
});

export function CartItemsList({
  items,
  totalPrice,
  totalItems,
  locale = "en",
  usdToCrc,
  hasReservation,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: CartItemsListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const hasReservationVal = hasReservation ?? items.some((i) => i.isReservation);
  const hasCustomSession = items.some((i) => isCustomSession(i));

  const handleShareReservation = async () => {
    const url = getReservationShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: t("cart.shareLinkCopied") });
    } catch {
      toast({ title: t("cart.shareLinkError"), variant: "destructive" });
    }
  };
  const reservePrice =
    Number(items.find((i) => i.isReservation)?.price) || 60;
  const formattedReservePrice = formatPrice(reservePrice, locale, usdToCrc);

  return (
    <>
      {hasReservationVal && (
        <div className="mb-6 p-4 border border-white/20 bg-white/5 space-y-3">
          <p className="text-sm text-gray-300">
            {t("cart.reservationNotice", { price: formattedReservePrice })}
          </p>
          <button
            type="button"
            onClick={handleShareReservation}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            data-testid="button-share-reservation"
          >
            <Share2 size={14} />
            {t("cart.shareReservation")}
          </button>
        </div>
      )}
      {hasCustomSession && !hasReservationVal && (
        <div className="mb-6 p-4 border border-white/20 bg-white/5">
          <p className="text-sm text-gray-300">
            {t("cart.customSessionNotice")}
          </p>
        </div>
      )}
      <div className="border-b border-white/10 mb-6" />

      {items.map((item) => (
        <CartLineItem
          key={`${item.productId}-${item.size}-${item.color}`}
          item={item}
          locale={locale}
          usdToCrc={usdToCrc}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
        />
      ))}

      <div className="flex items-center justify-between gap-4 py-6">
        <button
          onClick={onClearCart}
          className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          data-testid="button-clear-cart"
        >
          {t("cart.clearCart")}
        </button>
        <div className="text-right">
          <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">
            {t("cart.total")}
          </span>
          <span className="text-2xl text-white" data-testid="text-cart-total">
            {formatPrice(totalPrice, locale, usdToCrc)}
          </span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all mt-4"
        data-testid="button-checkout"
      >
        {t("cart.checkoutButton")}
      </button>
    </>
  );
}

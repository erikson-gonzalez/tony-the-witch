import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { useContent } from "@/hooks/use-content";
import { getUsdToCrc } from "@/utils/formatPrice";
import { needsShipping, getShippingCost, isCustomSession } from "@/utils/shipping";
import {
  CartItemsList,
  CheckoutInfoStep,
  CheckoutPaymentStep,
  CheckoutProcessingStep,
  CheckoutConfirmedStep,
  CheckoutStepsIndicator,
} from "@/components/cart";
import { useCheckout } from "@/hooks/use-checkout";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { RESERVA_QUERY } from "@/constants/reservation-share";

export default function Cart() {
  const { t, i18n } = useTranslation();
  const { config } = useContent();
  const usdToCrc = getUsdToCrc(config);
  const [location, setLocation] = useLocation();
  const {
    items,
    updateQuantity,
    removeItem,
    totalItems,
    totalPrice,
    clearCart,
    addReservation,
  } = useCart();

  const {
    step,
    form,
    card,
    formErrors,
    goToStep,
    updateForm,
    updateCard,
    validateInfo,
    validatePayment,
  } = useCheckout(clearCart, needsShipping(items));

  // Buy Now: skip cart view and go directly to checkout
  useEffect(() => {
    if (location.includes("buyNow=1") && items.length > 0 && step === "cart") {
      goToStep("info");
      setLocation("/cart");
    }
  }, [location, items.length, step, goToStep, setLocation]);

  // Shareable reserva link: /cart?reserva=1 adds reservation and shows cart
  useEffect(() => {
    if (location.includes(RESERVA_QUERY) && !items.some((i) => i.isReservation)) {
      addReservation();
      setLocation("/cart");
    }
  }, [location, items, addReservation, setLocation]);

  const showStepsIndicator =
    step !== "cart" && step !== "processing" && step !== "confirmed";
  const showTitle = step !== "processing" && step !== "confirmed";

  const getTitle = () => {
    if (step === "cart") return `${t("cart.title")} (${totalItems})`;
    if (step === "info") return t("cart.checkout");
    if (step === "payment") return t("cart.payment");
    return "";
  };

  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="mb-8">
            <Link href="/shop" data-testid="link-back-shop">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                {t("common.shop")}
              </motion.span>
            </Link>
          </div>

          {showTitle && (
            <h1
              className="text-3xl md:text-4xl text-white mb-12"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-cart-title"
            >
              {getTitle()}
            </h1>
          )}

          {showStepsIndicator && <CheckoutStepsIndicator step={step} />}

          <AnimatePresence mode="wait">
            {step === "cart" && items.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <p
                  className="text-gray-500 mb-6"
                  data-testid="text-cart-empty"
                >
                  {t("cart.empty")}
                </p>
                <Link
                  href="/shop"
                  className="text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors text-gray-400 hover:text-white"
                  data-testid="link-continue-shopping"
                >
                  {t("cart.continueShopping")}
                </Link>
              </motion.div>
            )}

            {step === "cart" && items.length > 0 && (
              <motion.div
                key="cart-items"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CartItemsList
                  items={items}
                  totalPrice={totalPrice}
                  totalItems={totalItems}
                  locale={i18n.language}
                  usdToCrc={usdToCrc}
                  hasReservation={items.some((i) => i.isReservation)}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeItem}
                  onClearCart={clearCart}
                  onCheckout={() => goToStep("info")}
                />
              </motion.div>
            )}

            {step === "info" && (
              <CheckoutInfoStep
                form={form}
                totalPrice={totalPrice}
                totalItems={totalItems}
                locale={i18n.language}
                usdToCrc={usdToCrc}
                reservationPrice={
                  (() => {
                    const fromItem = items.find((i) => i.isReservation)?.price;
                    if (typeof fromItem === "number" && Number.isFinite(fromItem))
                      return fromItem;
                    const raw = config?.reservation?.price;
                    const n = Number(raw);
                    if (!Number.isFinite(n)) return 60;
                    const usdToCrc = config?.pricing?.usdToCrc ?? 500;
                    return n >= 1000 ? Math.round(n / usdToCrc) : n;
                  })()
                }
                formErrors={formErrors}
                hasReservation={items.some((i) => i.isReservation)}
                hasCustomSession={items.some((i) => isCustomSession(i))}
                needsShipping={needsShipping(items)}
                onUpdateForm={updateForm}
                onValidate={validateInfo}
                onBack={() => goToStep("cart")}
              />
            )}

            {step === "payment" && (
              <CheckoutPaymentStep
                card={card}
                totalPrice={totalPrice}
                locale={i18n.language}
                usdToCrc={usdToCrc}
                reservationPrice={
                  (() => {
                    const fromItem = items.find((i) => i.isReservation)?.price;
                    if (typeof fromItem === "number" && Number.isFinite(fromItem))
                      return fromItem;
                    const raw = config?.reservation?.price;
                    const n = Number(raw);
                    if (!Number.isFinite(n)) return 60;
                    const usdToCrc = config?.pricing?.usdToCrc ?? 500;
                    return n >= 1000 ? Math.round(n / usdToCrc) : n;
                  })()
                }
                shippingCost={
                  needsShipping(items) && form.shippingZone && form.shippingMethod
                    ? getShippingCost(form.shippingZone, form.shippingMethod)
                    : 0
                }
                shippingToConvenir={
                  needsShipping(items) && form.shippingZone === "INTERNATIONAL"
                }
                formErrors={formErrors}
                hasReservation={items.some((i) => i.isReservation)}
                hasCustomSession={items.some((i) => isCustomSession(i))}
                onUpdateCard={updateCard}
                onValidate={validatePayment}
                onBack={() => goToStep("info")}
              />
            )}

            {step === "processing" && <CheckoutProcessingStep />}

            {step === "confirmed" && (
              <CheckoutConfirmedStep
                customerName={form.name}
                customerEmail={form.email}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

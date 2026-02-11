import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Minus, Plus, Trash2, Check, CreditCard, Lock } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

type CheckoutStep = "cart" | "info" | "payment" | "processing" | "confirmed";

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + " / " + digits.slice(2);
  return digits;
}

export default function Cart() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [form, setForm] = useState({ name: "", email: "", note: "" });
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", holder: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateInfo = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStep("payment");
    setFormErrors({});
  };

  const validatePayment = () => {
    const errors: Record<string, string> = {};
    const digits = card.number.replace(/\D/g, "");
    if (digits.length < 16) errors.number = "Enter a valid card number";
    if (!card.holder.trim()) errors.holder = "Cardholder name is required";
    const expiryDigits = card.expiry.replace(/\D/g, "");
    if (expiryDigits.length < 4) errors.expiry = "Enter a valid expiry";
    if (card.cvc.replace(/\D/g, "").length < 3) errors.cvc = "Enter a valid CVC";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStep("processing");
    setTimeout(() => {
      clearCart();
      setStep("confirmed");
    }, 2200);
  };

  const inputClass = "w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors";
  const labelClass = "block text-xs uppercase tracking-widest text-gray-500 mb-2";

  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">
      <Navigation />

      <main className="pt-24 pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="mb-8">
            <Link href="/shop" data-testid="link-back-shop">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                Shop
              </motion.span>
            </Link>
          </div>

          {step !== "processing" && step !== "confirmed" && (
            <h1
              className="text-3xl md:text-4xl text-white mb-12"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-cart-title"
            >
              {step === "cart" && `Cart (${totalItems})`}
              {step === "info" && "Checkout"}
              {step === "payment" && "Payment"}
            </h1>
          )}

          {step !== "cart" && step !== "processing" && step !== "confirmed" && (
            <div className="flex items-center gap-3 mb-10" data-testid="checkout-steps">
              <div className={`h-0.5 flex-1 ${step === "info" || step === "payment" ? "bg-white" : "bg-white/10"}`} />
              <span className={`text-xs uppercase tracking-widest ${step === "info" ? "text-white" : "text-gray-500"}`}>Info</span>
              <div className={`h-0.5 flex-1 ${step === "payment" ? "bg-white" : "bg-white/10"}`} />
              <span className={`text-xs uppercase tracking-widest ${step === "payment" ? "text-white" : "text-gray-500"}`}>Payment</span>
              <div className="h-0.5 flex-1 bg-white/10" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "cart" && items.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <p className="text-gray-500 mb-6" data-testid="text-cart-empty">Your cart is empty</p>
                <Link href="/shop" className="text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors text-gray-400 hover:text-white" data-testid="link-continue-shopping">
                  Continue Shopping
                </Link>
              </motion.div>
            )}

            {step === "cart" && items.length > 0 && (
              <motion.div key="cart-items" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="border-b border-white/10 mb-6" />

                {items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 md:gap-6 py-6 border-b border-white/10"
                    data-testid={`cart-item-${item.slug}`}
                  >
                    <Link href={`/shop/${item.slug}`} className="shrink-0">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-900 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/${item.slug}`}>
                        <h3 className="text-sm uppercase tracking-wider text-white hover:text-gray-300 transition-colors" data-testid={`text-cart-item-name-${item.slug}`}>
                          {item.name}
                        </h3>
                      </Link>
                      {(item.size || item.color) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {[item.size, item.color].filter(Boolean).join(" / ")}
                        </p>
                      )}
                      <p className="text-sm text-gray-400 mt-1">${item.price}</p>

                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                          className="w-7 h-7 flex items-center justify-center border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                          data-testid={`button-decrease-${item.slug}`}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm w-6 text-center" data-testid={`text-quantity-${item.slug}`}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                          className="w-7 h-7 flex items-center justify-center border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                          data-testid={`button-increase-${item.slug}`}
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          className="ml-auto text-gray-500 hover:text-red-400 transition-colors"
                          data-testid={`button-remove-${item.slug}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-white shrink-0" data-testid={`text-subtotal-${item.slug}`}>
                      ${item.price * item.quantity}
                    </div>
                  </motion.div>
                ))}

                <div className="flex items-center justify-between gap-4 py-6">
                  <button
                    onClick={clearCart}
                    className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                    data-testid="button-clear-cart"
                  >
                    Clear Cart
                  </button>
                  <div className="text-right">
                    <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Total</span>
                    <span className="text-2xl text-white" data-testid="text-cart-total">${totalPrice}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep("info")}
                  className="w-full py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all mt-4"
                  data-testid="button-checkout"
                >
                  Checkout
                </button>
              </motion.div>
            )}

            {step === "info" && (
              <motion.div
                key="info-step"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <div className="border border-white/10 p-6 md:p-8 mb-6">
                  <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                    <span className="text-xs uppercase tracking-widest text-gray-500">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                    <span className="text-lg text-white" data-testid="text-checkout-total">${totalPrice}</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormErrors({ ...formErrors, name: "" }); }}
                        className={inputClass}
                        placeholder="Your name"
                        data-testid="input-checkout-name"
                      />
                      {formErrors.name && <p className="text-red-400 text-xs mt-1" data-testid="error-checkout-name">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => { setForm({ ...form, email: e.target.value }); setFormErrors({ ...formErrors, email: "" }); }}
                        className={inputClass}
                        placeholder="your@email.com"
                        data-testid="input-checkout-email"
                      />
                      {formErrors.email && <p className="text-red-400 text-xs mt-1" data-testid="error-checkout-email">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>Note (optional)</label>
                      <textarea
                        value={form.note}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                        rows={3}
                        className={`${inputClass} resize-none`}
                        placeholder="Any special requests..."
                        data-testid="input-checkout-note"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep("cart"); setFormErrors({}); }}
                    className="flex-1 py-3 text-sm uppercase tracking-widest border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                    data-testid="button-checkout-back"
                  >
                    Back
                  </button>
                  <button
                    onClick={validateInfo}
                    className="flex-1 py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all"
                    data-testid="button-continue-payment"
                  >
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                key="payment-step"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <div className="border border-white/10 p-6 md:p-8 mb-6">
                  <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-gray-500" />
                      <span className="text-xs uppercase tracking-widest text-gray-500">Secure payment</span>
                    </div>
                    <span className="text-lg text-white" data-testid="text-payment-total">${totalPrice}</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Card number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={card.number}
                          onChange={(e) => { setCard({ ...card, number: formatCardNumber(e.target.value) }); setFormErrors({ ...formErrors, number: "" }); }}
                          className={`${inputClass} pr-12`}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          data-testid="input-card-number"
                        />
                        <CreditCard size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" />
                      </div>
                      {formErrors.number && <p className="text-red-400 text-xs mt-1" data-testid="error-card-number">{formErrors.number}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>Cardholder name</label>
                      <input
                        type="text"
                        value={card.holder}
                        onChange={(e) => { setCard({ ...card, holder: e.target.value }); setFormErrors({ ...formErrors, holder: "" }); }}
                        className={inputClass}
                        placeholder="Name on card"
                        data-testid="input-card-holder"
                      />
                      {formErrors.holder && <p className="text-red-400 text-xs mt-1" data-testid="error-card-holder">{formErrors.holder}</p>}
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className={labelClass}>Expiry</label>
                        <input
                          type="text"
                          value={card.expiry}
                          onChange={(e) => { setCard({ ...card, expiry: formatExpiry(e.target.value) }); setFormErrors({ ...formErrors, expiry: "" }); }}
                          className={inputClass}
                          placeholder="MM / YY"
                          maxLength={7}
                          data-testid="input-card-expiry"
                        />
                        {formErrors.expiry && <p className="text-red-400 text-xs mt-1" data-testid="error-card-expiry">{formErrors.expiry}</p>}
                      </div>
                      <div className="flex-1">
                        <label className={labelClass}>CVC</label>
                        <input
                          type="text"
                          value={card.cvc}
                          onChange={(e) => { setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }); setFormErrors({ ...formErrors, cvc: "" }); }}
                          className={inputClass}
                          placeholder="123"
                          maxLength={4}
                          data-testid="input-card-cvc"
                        />
                        {formErrors.cvc && <p className="text-red-400 text-xs mt-1" data-testid="error-card-cvc">{formErrors.cvc}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep("info"); setFormErrors({}); }}
                    className="flex-1 py-3 text-sm uppercase tracking-widest border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                    data-testid="button-back-to-info"
                  >
                    Back
                  </button>
                  <button
                    onClick={validatePayment}
                    className="flex-1 py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all"
                    data-testid="button-pay-now"
                  >
                    Pay ${totalPrice}
                  </button>
                </div>
              </motion.div>
            )}

            {step === "processing" && (
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
                <p className="text-sm uppercase tracking-widest text-gray-400" data-testid="text-processing">Processing payment...</p>
              </motion.div>
            )}

            {step === "confirmed" && (
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
                  Payment Successful
                </h2>
                <p className="text-gray-500 mb-2" data-testid="text-order-message">
                  Thanks, {form.name}. A confirmation has been sent to <span className="text-gray-300">{form.email}</span>.
                </p>
                <p className="text-xs text-gray-600 mb-8">This is a simulated payment — no real charge was made.</p>
                <Link href="/shop" className="text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors text-gray-400 hover:text-white" data-testid="link-back-to-shop">
                  Continue Shopping
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

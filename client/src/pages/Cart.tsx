import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Minus, Plus, Trash2, Check } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", note: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateAndSubmit = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setOrderPlaced(true);
    clearCart();
  };

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

          <h1
            className="text-3xl md:text-4xl text-white mb-12"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-cart-title"
          >
            Cart ({totalItems})
          </h1>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-gray-500 mb-6" data-testid="text-cart-empty">Your cart is empty</p>
              <Link href="/shop" className="text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors text-gray-400 hover:text-white" data-testid="link-continue-shopping">
                Continue Shopping
              </Link>
            </motion.div>
          ) : (
            <div>
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

              <div className="flex items-center justify-between py-6">
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

              <AnimatePresence mode="wait">
                {!showCheckout ? (
                  <motion.button
                    key="checkout-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all mt-4"
                    data-testid="button-checkout"
                  >
                    Checkout
                  </motion.button>
                ) : (
                  <motion.div
                    key="checkout-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-8 border-t border-white/10 pt-8"
                  >
                    <h2
                      className="text-xl uppercase tracking-widest mb-6"
                      style={{ fontFamily: "var(--font-display)" }}
                      data-testid="text-checkout-title"
                    >
                      Checkout
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Name</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormErrors({ ...formErrors, name: "" }); }}
                          className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors"
                          placeholder="Your name"
                          data-testid="input-checkout-name"
                        />
                        {formErrors.name && <p className="text-red-400 text-xs mt-1" data-testid="error-checkout-name">{formErrors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => { setForm({ ...form, email: e.target.value }); setFormErrors({ ...formErrors, email: "" }); }}
                          className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors"
                          placeholder="your@email.com"
                          data-testid="input-checkout-email"
                        />
                        {formErrors.email && <p className="text-red-400 text-xs mt-1" data-testid="error-checkout-email">{formErrors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Note (optional)</label>
                        <textarea
                          value={form.note}
                          onChange={(e) => setForm({ ...form, note: e.target.value })}
                          rows={3}
                          className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors resize-none"
                          placeholder="Any special requests..."
                          data-testid="input-checkout-note"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowCheckout(false)}
                        className="flex-1 py-3 text-sm uppercase tracking-widest border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                        data-testid="button-checkout-back"
                      >
                        Back
                      </button>
                      <button
                        onClick={validateAndSubmit}
                        className="flex-1 py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all"
                        data-testid="button-place-order"
                      >
                        Place Order
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <AnimatePresence>
            {orderPlaced && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 border border-white/20 flex items-center justify-center mx-auto mb-6">
                  <Check size={28} className="text-white" />
                </div>
                <h2
                  className="text-2xl md:text-3xl uppercase tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                  data-testid="text-order-confirmed"
                >
                  Order Received
                </h2>
                <p className="text-gray-500 mb-2" data-testid="text-order-message">
                  Thanks, {form.name}. We'll reach out to <span className="text-gray-300">{form.email}</span> with next steps.
                </p>
                <p className="text-xs text-gray-600 mb-8">This is a demo — no payment was processed.</p>
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

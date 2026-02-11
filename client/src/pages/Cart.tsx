import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice, clearCart } = useCart();

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

              <button
                className="w-full py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all mt-4"
                data-testid="button-checkout"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

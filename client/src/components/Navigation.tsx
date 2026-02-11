import { useState, useEffect } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-transparent",
          isScrolled ? "bg-black/90 backdrop-blur-md border-white/5 py-4" : "bg-transparent py-6"
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between gap-4">
          <Link href="/" className="font-display text-xl tracking-wider font-bold text-white z-50 relative" data-testid="link-home-logo">
            TTW
          </Link>

          <nav className="hidden md:flex items-center space-x-12">
            <Link href="/portfolio" className="text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-300" data-testid="link-nav-portfolio">
              Portfolio
            </Link>
            <Link href="/shop" className="text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-300" data-testid="link-nav-shop">
              Shop
            </Link>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-300" data-testid="link-nav-contact">
              Contact
            </a>
            <Link href="/cart" className="relative text-gray-400 hover:text-white transition-colors duration-300" data-testid="link-nav-cart">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-white text-black text-[10px] flex items-center justify-center" data-testid="badge-cart-count">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          <div className="flex items-center gap-4 md:hidden z-50 relative">
            <Link href="/cart" className="relative text-white" data-testid="link-mobile-cart">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-white text-black text-[10px] flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="text-white"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="button-mobile-menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black z-40 flex items-center justify-center md:hidden"
          >
            <nav className="flex flex-col items-center space-y-8">
              <Link href="/portfolio" onClick={() => setIsOpen(false)} className="text-2xl text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "var(--font-display)" }} data-testid="link-mobile-portfolio">
                Portfolio
              </Link>
              <Link href="/shop" onClick={() => setIsOpen(false)} className="text-2xl text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "var(--font-display)" }} data-testid="link-mobile-shop">
                Shop
              </Link>
              <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="text-2xl text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "var(--font-display)" }} data-testid="link-mobile-contact">
                Contact
              </a>
              <a href="https://instagram.com/tonythewitch" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="text-2xl text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "var(--font-display)" }} data-testid="link-mobile-instagram">
                Instagram
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

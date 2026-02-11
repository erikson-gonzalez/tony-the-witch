import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { getProductBySlug } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, ShoppingCart, Check } from "lucide-react";
import { Link, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  const { addItem } = useCart();
  const { toast } = useToast();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4" style={{ fontFamily: "var(--font-display)" }}>Product not found</h1>
          <Link href="/shop" className="text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors" data-testid="link-back-shop">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({ title: "Please select a color", variant: "destructive" });
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });

    setAdded(true);
    toast({ title: "Added to cart" });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">
      <Navigation />

      <main className="pt-24 pb-24">
        <div className="container mx-auto px-4 md:px-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-square overflow-hidden bg-neutral-900 mb-3">
                <img
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  data-testid="img-product-main"
                />
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-20 h-20 overflow-hidden bg-neutral-900 border transition-colors ${
                        activeImage === i ? "border-white" : "border-white/10"
                      }`}
                      data-testid={`button-thumbnail-${i}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col"
            >
              <span className="text-xs uppercase tracking-widest text-gray-500 mb-2" data-testid="text-product-category">
                {product.category}
              </span>
              <h1
                className="text-3xl md:text-4xl text-white mb-4"
                style={{ fontFamily: "var(--font-display)" }}
                data-testid="text-product-detail-name"
              >
                {product.name}
              </h1>
              <p className="text-2xl text-white mb-6" data-testid="text-product-detail-price">
                ${product.price}
              </p>

              <p className="text-gray-400 text-sm leading-relaxed mb-8" data-testid="text-product-description">
                {product.description}
              </p>

              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-widest text-gray-500 block mb-3">Size</span>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all ${
                          selectedSize === size
                            ? "border-white text-white bg-white/10"
                            : "border-white/10 text-gray-500 hover:text-white hover:border-white/30"
                        }`}
                        data-testid={`button-size-${size.toLowerCase()}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div className="mb-8">
                  <span className="text-xs uppercase tracking-widest text-gray-500 block mb-3">Color</span>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all ${
                          selectedColor === color
                            ? "border-white text-white bg-white/10"
                            : "border-white/10 text-gray-500 hover:text-white hover:border-white/30"
                        }`}
                        data-testid={`button-color-${color.toLowerCase().replace(/\s/g, '-')}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm uppercase tracking-widest border transition-all ${
                    added
                      ? "border-green-500 text-green-500 bg-green-500/10"
                      : "border-white text-white hover:bg-white hover:text-black"
                  }`}
                  data-testid="button-add-to-cart"
                >
                  {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                  {added ? "Added" : "Add to Cart"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

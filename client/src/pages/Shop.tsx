import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/use-content";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { formatPrice, getUsdToCrc } from "@/utils/formatPrice";
import { getCategoryKey } from "@/utils/category-i18n";
import { CUSTOM_SESSION_SLUG } from "@/constants/custom-session";
import type { ProductItem } from "@/types/content";

/** Virtual product for custom tattoo session - always first in Otros */
function getCustomSessionProduct(config: { tattooSession?: { name?: string; imageUrl?: string }; pricing?: { usdToCrc?: number } }): ProductItem {
  const ts = config?.tattooSession;
  return {
    id: -2,
    slug: CUSTOM_SESSION_SLUG,
    name: ts?.name ?? "TTW Tattoo Session",
    category: "Otros",
    price: 0,
    description: "",
    images: [ts?.imageUrl ?? "/logo-ttw.png"],
    sortOrder: -1,
  };
}

export default function Shop() {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const { products, shopCategories, config, isLoading } = useContent();

  const usdToCrc = getUsdToCrc(config);
  const filtered = useMemo(() => {
    const base =
      activeCategory === "All"
        ? products
        : products.filter((p) => p.category === activeCategory);
    if (activeCategory === "Otros" && config?.tattooSession) {
      const customSession = getCustomSessionProduct(config);
      return [customSession, ...base.filter((p) => p.slug !== CUSTOM_SESSION_SLUG)];
    }
    return base;
  }, [products, activeCategory, config?.tattooSession]);

  const categories = shopCategories.length > 0 ? shopCategories : ["All"];
  const title = config?.shop?.title ?? "Shop";

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="w-8 h-8 border border-white/30 border-t-white animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black flex flex-col">
      <Navigation />

      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center mb-16">
            <span className="text-sm uppercase tracking-widest text-gray-500 mb-2">
              {t("shop.brand")}
            </span>
            <h1
              className="text-4xl md:text-5xl text-white"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-shop-title"
            >
              {title}
            </h1>
          </div>

          <div
            className="flex justify-center gap-2 md:gap-4 mb-12 flex-wrap"
            data-testid="shop-tabs"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs md:text-sm uppercase tracking-widest px-4 py-2 transition-all border ${
                  activeCategory === cat
                    ? "border-white text-white"
                    : "border-white/10 text-gray-500 hover:text-white hover:border-white/30"
                }`}
                data-testid={`tab-shop-${cat.toLowerCase().replace(/\s/g, "-")}`}
              >
                {t(getCategoryKey(cat), cat)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {filtered.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                locale={i18n.language}
                usdToCrc={usdToCrc}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <p
              className="text-center text-gray-500 py-20"
              data-testid="text-shop-empty"
            >
              {t("shop.empty")}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ProductCard({
  product,
  index,
  locale,
  usdToCrc,
}: {
  product: ProductItem;
  index: number;
  locale?: string;
  usdToCrc?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      viewport={{ once: true }}
    >
      <Link href={`/shop/${product.slug}`} data-testid={`link-product-${product.slug}`}>
        <div className="group cursor-pointer">
          <div className="relative aspect-square overflow-hidden bg-neutral-900 mb-3">
            <img
              src={product.images[0]}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                product.slug === CUSTOM_SESSION_SLUG ? "" : "group-hover:opacity-0"
              }`}
              loading="lazy"
            />
            {product.images[1] && (
              <img
                src={product.images[1]}
                alt={`${product.name} alternate`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                loading="lazy"
              />
            )}
          </div>
          <h3
            className="text-sm text-white uppercase tracking-wider mb-1"
            data-testid={`text-product-name-${product.slug}`}
          >
            {product.name}
          </h3>
          <p
            className="text-sm text-gray-500"
            data-testid={`text-product-price-${product.slug}`}
          >
            {product.slug === CUSTOM_SESSION_SLUG
              ? (locale?.startsWith("es") ? "Monto personalizado" : "Custom amount")
              : formatPrice(product.price, locale || "en", usdToCrc)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

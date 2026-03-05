import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/utils/formatPrice";
import { CustomSessionForm } from "./custom-session-form";
import { ProductOptions } from "./product-options";
import { ProductActions } from "./product-actions";
import type { ProductItem } from "@/types/content";

interface ProductDetailContentProps {
  isCustomSession: boolean;
  product: ProductItem | null;
  customSessionConfig: { name?: string; imageUrl?: string; description?: string; descriptionEs?: string; descriptionEn?: string } | undefined;
  displayName: string;
  usdToCrc: number;
  locale: string;
  activeImage: number;
  setActiveImage: (i: number) => void;
  selectedSize: string;
  selectedColor: string;
  setSelectedSize: (s: string) => void;
  setSelectedColor: (c: string) => void;
  added: boolean;
  customAmount: string;
  setCustomAmount: (v: string) => void;
  payInUsd: boolean;
  setPayInUsd: (v: boolean) => void;
  handleAddToCart: () => void;
  handleBuyNow: () => void;
}

export function ProductDetailContent({
  isCustomSession,
  product,
  customSessionConfig,
  displayName,
  usdToCrc,
  locale,
  activeImage,
  setActiveImage,
  selectedSize,
  selectedColor,
  setSelectedSize,
  setSelectedColor,
  added,
  customAmount,
  setCustomAmount,
  payInUsd,
  setPayInUsd,
  handleAddToCart,
  handleBuyNow,
}: ProductDetailContentProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("es") ? "es" : "en";
  const description =
    (lang === "es" ? customSessionConfig?.descriptionEs : customSessionConfig?.descriptionEn) ||
    customSessionConfig?.description ||
    t("product.customSessionDescription");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex flex-col"
    >
      <span
        className="text-xs uppercase tracking-widest text-gray-500 mb-2"
        data-testid="text-product-category"
      >
        {isCustomSession ? "Otros" : product?.category ?? ""}
      </span>
      <h1
        className="text-3xl md:text-4xl text-white mb-4"
        style={{ fontFamily: "var(--font-display)" }}
        data-testid="text-product-detail-name"
      >
        {displayName}
      </h1>

      {!isCustomSession && product && (
        <p
          className="text-2xl text-white mb-6"
          data-testid="text-product-detail-price"
        >
          {formatPrice(product.price, locale, usdToCrc)}
        </p>
      )}

      {isCustomSession ? (
        <CustomSessionForm
          description={description}
          customAmount={customAmount}
          onAmountChange={setCustomAmount}
          payInUsd={payInUsd}
          onPayInUsdChange={setPayInUsd}
        />
      ) : (
        product && (
          <p
            className="text-gray-400 text-sm leading-relaxed mb-8"
            data-testid="text-product-description"
          >
            {product.description}
          </p>
        )
      )}

      {!isCustomSession && product && (
        <ProductOptions
          sizes={product.sizes ?? []}
          colors={product.colors ?? []}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          onSelectSize={setSelectedSize}
          onSelectColor={setSelectedColor}
        />
      )}

      <ProductActions
        isCustomSession={isCustomSession}
        added={added}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </motion.div>
  );
}

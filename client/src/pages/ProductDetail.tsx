import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  useProductDetail,
  ProductDetailImage,
  ProductDetailContent,
} from "./product-detail";

export default function ProductDetail() {
  const { t, i18n } = useTranslation();
  const {
    isLoading,
    isCustomSession,
    product,
    customSessionConfig,
    notFound,
    displayName,
    displayImage,
    usdToCrc,
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
  } = useProductDetail();

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="w-8 h-8 border border-white/30 border-t-white animate-spin rounded-full" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-2xl mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("product.notFound")}
          </h1>
          <Link
            href="/shop"
            className="text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            data-testid="link-back-shop"
          >
            {t("product.backToShop")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-24">
        <div className="container mx-auto px-4 md:px-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <ProductDetailImage
              displayImage={displayImage}
              displayName={displayName}
              images={product?.images ?? []}
              activeImage={activeImage}
              onSelectImage={setActiveImage}
              showThumbnails={!isCustomSession}
            />

            <ProductDetailContent
              isCustomSession={isCustomSession}
              product={product}
              customSessionConfig={customSessionConfig}
              displayName={displayName}
              usdToCrc={usdToCrc}
              locale={i18n.language}
              activeImage={activeImage}
              setActiveImage={setActiveImage}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              setSelectedSize={setSelectedSize}
              setSelectedColor={setSelectedColor}
              added={added}
              customAmount={customAmount}
              setCustomAmount={setCustomAmount}
              payInUsd={payInUsd}
              setPayInUsd={setPayInUsd}
              handleAddToCart={handleAddToCart}
              handleBuyNow={handleBuyNow}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

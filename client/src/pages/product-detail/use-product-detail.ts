import { useState, useMemo, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useContent } from "@/hooks/use-content";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { getUsdToCrc } from "@/utils/formatPrice";
import { CUSTOM_SESSION_SLUG } from "@/constants/custom-session";
import type { ProductItem } from "@/types/content";

export interface UseProductDetailReturn {
  isLoading: boolean;
  isCustomSession: boolean;
  product: ProductItem | null;
  customSessionConfig: { name?: string; imageUrl?: string; description?: string; descriptionEs?: string; descriptionEn?: string } | undefined;
  notFound: boolean;
  displayName: string;
  displayImage: string;
  usdToCrc: number;
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

export function useProductDetail(): UseProductDetailReturn {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { products, config, isLoading } = useContent();
  const { addItem, clearCart } = useCart();
  const { toast } = useToast();

  const usdToCrc = getUsdToCrc(config);
  const isCustomSession = (slug ?? "") === CUSTOM_SESSION_SLUG;
  const customSessionConfig = config?.tattooSession;

  const product = useMemo(
    () =>
      isCustomSession ? null : (products.find((p) => p.slug === slug || "") ?? null),
    [products, slug, isCustomSession]
  );

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [payInUsd, setPayInUsd] = useState(false);

  const notFound = !product && !(isCustomSession && customSessionConfig);
  const displayName = isCustomSession
    ? (customSessionConfig?.name ?? "TTW Tattoo Session")
    : product?.name ?? "";
  const displayImage = isCustomSession
    ? (customSessionConfig?.imageUrl ?? "/logo-ttw.png")
    : product?.images[activeImage] ?? product?.images[0] ?? "";

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) {
      toast({ title: t("product.selectSize"), variant: "destructive" });
      return;
    }
    if (product.colors?.length && !selectedColor) {
      toast({ title: t("product.selectColor"), variant: "destructive" });
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
    toast({ title: t("product.addedToCart") });
    setTimeout(() => setAdded(false), 2000);
  }, [product, selectedSize, selectedColor, addItem, toast, t]);

  const handleBuyNow = useCallback(() => {
    if (isCustomSession && customSessionConfig) {
      const raw = payInUsd
        ? parseFloat(customAmount.replace(",", ".").replace(/[^\d.]/g, "")) || 0
        : parseInt(customAmount.replace(/\D/g, ""), 10) || 0;
      let priceUsd: number;
      if (payInUsd) {
        priceUsd = raw;
        if (priceUsd < 1) {
          toast({ title: t("product.customSessionMinAmount"), variant: "destructive" });
          return;
        }
      } else {
        if (raw < 1000) {
          toast({ title: t("product.customSessionMinAmount"), variant: "destructive" });
          return;
        }
        priceUsd = raw / usdToCrc;
      }
      clearCart();
      addItem({
        productId: -2,
        slug: CUSTOM_SESSION_SLUG,
        name: customSessionConfig.name ?? "TTW Tattoo Session",
        price: priceUsd,
        image: customSessionConfig.imageUrl ?? "/logo-ttw.png",
      });
      setLocation("/cart?buyNow=1");
      return;
    }
    if (!product) return;
    if (product.sizes?.length && !selectedSize) {
      toast({ title: t("product.selectSize"), variant: "destructive" });
      return;
    }
    if (product.colors?.length && !selectedColor) {
      toast({ title: t("product.selectColor"), variant: "destructive" });
      return;
    }
    clearCart();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    setLocation("/cart?buyNow=1");
  }, [
    isCustomSession,
    customSessionConfig,
    payInUsd,
    customAmount,
    usdToCrc,
    product,
    selectedSize,
    selectedColor,
    clearCart,
    addItem,
    setLocation,
    toast,
    t,
  ]);

  return {
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
  };
}

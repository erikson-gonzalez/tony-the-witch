import { useTranslation } from "react-i18next";

interface ProductOptionsProps {
  sizes: string[];
  colors: string[];
  selectedSize: string;
  selectedColor: string;
  onSelectSize: (s: string) => void;
  onSelectColor: (c: string) => void;
}

export function ProductOptions({
  sizes,
  colors,
  selectedSize,
  selectedColor,
  onSelectSize,
  onSelectColor,
}: ProductOptionsProps) {
  const { t } = useTranslation();

  if (sizes.length === 0 && colors.length === 0) return null;

  return (
    <>
      {sizes.length > 0 && (
        <div className="mb-6">
          <span className="text-xs uppercase tracking-widest text-gray-500 block mb-3">
            {t("product.size")}
          </span>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSelectSize(size)}
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
      {colors.length > 0 && (
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-gray-500 block mb-3">
            {t("product.color")}
          </span>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onSelectColor(color)}
                className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all ${
                  selectedColor === color
                    ? "border-white text-white bg-white/10"
                    : "border-white/10 text-gray-500 hover:text-white hover:border-white/30"
                }`}
                data-testid={`button-color-${color.toLowerCase().replace(/\s/g, "-")}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

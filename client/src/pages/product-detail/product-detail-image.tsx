import { motion } from "framer-motion";

interface ProductDetailImageProps {
  displayImage: string;
  displayName: string;
  images: string[];
  activeImage: number;
  onSelectImage: (i: number) => void;
  showThumbnails: boolean;
}

export function ProductDetailImage({
  displayImage,
  displayName,
  images,
  activeImage,
  onSelectImage,
  showThumbnails,
}: ProductDetailImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="aspect-square overflow-hidden bg-neutral-900 mb-3">
        <img
          src={displayImage}
          alt={displayName}
          className="w-full h-full object-cover"
          data-testid="img-product-main"
        />
      </div>
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onSelectImage(i)}
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
  );
}

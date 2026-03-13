import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/optimized-image";

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
        <OptimizedImage
          src={displayImage}
          alt={displayName}
          className="w-full h-full object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
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
              <OptimizedImage src={img} alt="" className="w-full h-full object-cover" width={96} height={96} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

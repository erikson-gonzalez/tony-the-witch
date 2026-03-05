import { memo } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { GALLERY_HEIGHT_CLASS } from "@/utils/gallery";
import type { GalleryWorkItem } from "@/types/content";

interface GalleryItemProps {
  work: GalleryWorkItem;
  index: number;
  onOpen: (image: string) => void;
}

export const GalleryItem = memo(function GalleryItem({
  work,
  index,
  onOpen,
}: GalleryItemProps) {
  const aspectClass = GALLERY_HEIGHT_CLASS[work.height ?? "medium"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      viewport={{ once: true }}
      className={`group relative overflow-hidden bg-neutral-900 cursor-pointer ${aspectClass}`}
      onClick={() => onOpen(work.image)}
      data-testid={`gallery-item-${work.id}`}
    >
      <img
        src={work.image}
        alt="Tattoo artwork"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
          <Eye size={32} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
});

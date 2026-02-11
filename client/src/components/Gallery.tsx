import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, X } from "lucide-react";

const categories = ["All", "Blackwork", "Fine Line", "Traditional", "Realism"] as const;

const allWorks = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=1200&auto=format&fit=crop",
    category: "Fine Line",
    height: "tall",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=1200&auto=format&fit=crop",
    category: "Blackwork",
    height: "short",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=1200&auto=format&fit=crop",
    category: "Traditional",
    height: "medium",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=1200&auto=format&fit=crop",
    category: "Blackwork",
    height: "tall",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=1200&auto=format&fit=crop",
    category: "Realism",
    height: "short",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1598371839696-5c5bb3524346?q=80&w=1200&auto=format&fit=crop",
    category: "Blackwork",
    height: "medium",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=1200&auto=format&fit=crop",
    category: "Traditional",
    height: "tall",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=800&auto=format&fit=crop",
    category: "Fine Line",
    height: "medium",
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=800&auto=format&fit=crop",
    category: "Realism",
    height: "short",
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=800&auto=format&fit=crop",
    category: "Blackwork",
    height: "tall",
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=800&auto=format&fit=crop",
    category: "Fine Line",
    height: "medium",
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=800&auto=format&fit=crop",
    category: "Traditional",
    height: "short",
  },
];

const ITEMS_PER_PAGE = 6;

const heightClass: Record<string, string> = {
  short: "aspect-[4/3]",
  medium: "aspect-square",
  tall: "aspect-[3/4]",
};

export function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const filtered = activeCategory === "All"
    ? allWorks
    : allWorks.filter((w) => w.category === activeCategory);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
    }
  }, [hasMore]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loadMore]);

  const distributeColumns = (items: typeof visible, cols: number) => {
    const columns: (typeof visible)[] = Array.from({ length: cols }, () => []);
    items.forEach((item, i) => {
      columns[i % cols].push(item);
    });
    return columns;
  };

  return (
    <section id="work" className="py-24 bg-black relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-16">
          <span className="text-sm uppercase tracking-widest text-gray-500 mb-2">Selected Works</span>
          <h2 className="text-4xl md:text-5xl font-display text-white" style={{ fontFamily: "var(--font-display)" }}>Portfolio</h2>
        </div>

        <div className="flex justify-center gap-2 md:gap-4 mb-12 flex-wrap" data-testid="gallery-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs md:text-sm uppercase tracking-widest px-4 py-2 transition-all border ${
                activeCategory === cat
                  ? "border-white text-white"
                  : "border-white/10 text-gray-500 hover:text-white hover:border-white/30"
              }`}
              data-testid={`tab-${cat.toLowerCase().replace(/\s/g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="hidden md:grid grid-cols-3 gap-2">
          {distributeColumns(visible, 3).map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-2">
              {col.map((work, idx) => (
                <GalleryItem key={work.id} work={work} index={idx} onOpen={setLightboxImage} />
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 md:hidden">
          {distributeColumns(visible, 2).map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-2">
              {col.map((work, idx) => (
                <GalleryItem key={work.id} work={work} index={idx} onOpen={setLightboxImage} />
              ))}
            </div>
          ))}
        </div>

        {hasMore && (
          <div ref={loaderRef} className="flex justify-center py-12">
            <div className="w-6 h-6 border border-white/30 border-t-white animate-spin" />
          </div>
        )}

        {!hasMore && (
          <div className="text-center mt-16">
            <a
              href="https://instagram.com/tonythewitch"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors text-gray-400 hover:text-white"
              data-testid="link-gallery-instagram"
            >
              View More on Instagram
            </a>
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightboxImage(null)}
            data-testid="lightbox-overlay"
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white z-50"
              onClick={() => setLightboxImage(null)}
              data-testid="button-close-lightbox"
            >
              <X size={28} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxImage}
              alt="Tattoo artwork"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function GalleryItem({
  work,
  index,
  onOpen,
}: {
  work: { id: number; image: string; category: string; height: string };
  index: number;
  onOpen: (img: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      viewport={{ once: true }}
      className={`group relative overflow-hidden bg-neutral-900 cursor-pointer ${heightClass[work.height]}`}
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
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useContent } from "@/hooks/use-content";
import { useGalleryFilter } from "@/hooks/use-gallery-filter";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { distributeColumns } from "@/utils/gallery";
import { getCategoryKey } from "@/utils/category-i18n";
import { GalleryItem } from "./gallery-item";
import { Lightbox } from "./lightbox";

export function Gallery() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const { galleryWorks, galleryCategories, config } = useContent();
  const { visible, hasMore, loadMore } = useGalleryFilter(
    galleryWorks,
    activeCategory
  );
  const loaderRef = useInfiniteScroll(loadMore, hasMore);

  const desktopColumns = distributeColumns(visible, 3);
  const mobileColumns = distributeColumns(visible, 2);

  const categories =
    galleryCategories.length > 0 ? galleryCategories : ["All"];
  const subtitle = config?.gallery?.subtitle ?? "Selected Works";
  const title = config?.gallery?.title ?? "Portfolio";
  const instagramUrl = config?.gallery?.instagramUrl ?? "";
  const viewMoreText = config?.gallery?.viewMoreText ?? "View More on Instagram";

  return (
    <section id="work" className="py-24 bg-black relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-16">
          <span className="text-sm uppercase tracking-widest text-gray-500 mb-2">
            {subtitle}
          </span>
          <h2
            className="text-4xl md:text-5xl font-display text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
        </div>

        <div
          className="flex justify-center gap-2 md:gap-4 mb-12 flex-wrap"
          data-testid="gallery-tabs"
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
              data-testid={`tab-${cat.toLowerCase().replace(/\s/g, "-")}`}
            >
              {t(getCategoryKey(cat), cat)}
            </button>
          ))}
        </div>

        <div className="hidden md:grid grid-cols-3 gap-2">
          {desktopColumns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-2">
              {col.map((work, idx) => (
                <GalleryItem
                  key={work.id}
                  work={work}
                  index={idx}
                  onOpen={setLightboxImage}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 md:hidden">
          {mobileColumns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-2">
              {col.map((work, idx) => (
                <GalleryItem
                  key={work.id}
                  work={work}
                  index={idx}
                  onOpen={setLightboxImage}
                />
              ))}
            </div>
          ))}
        </div>

        {hasMore && (
          <div ref={loaderRef} className="flex justify-center py-12">
            <div className="w-6 h-6 border border-white/30 border-t-white animate-spin" />
          </div>
        )}

        {!hasMore && instagramUrl && (
          <div className="text-center mt-16">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors text-gray-400 hover:text-white"
              data-testid="link-gallery-instagram"
            >
              {viewMoreText}
            </a>
          </div>
        )}
      </div>

      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </section>
  );
}

import { useState, useCallback, useEffect } from "react";
import type { GalleryWorkItem } from "@/types/content";

const ITEMS_PER_PAGE = 6;

export function useGalleryFilter(
  works: GalleryWorkItem[],
  activeCategory: string
) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filtered =
    activeCategory === "All"
      ? works
      : works.filter((w) => w.category === activeCategory);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    if (hasMore) setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  }, [hasMore]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeCategory]);

  return { visible, hasMore, loadMore };
}

import type { GalleryWork } from "@/types";

export const GALLERY_CATEGORIES = ["All", "Tatuajes", "Pinturas", "Cinematografía"] as const;
export const ITEMS_PER_PAGE = 6;

export const GALLERY_HEIGHT_CLASS: Record<string, string> = {
  short: "aspect-[4/3]",
  medium: "aspect-square",
  tall: "aspect-[3/4]",
};

export const allWorks: GalleryWork[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=1200&auto=format&fit=crop",
    category: "Tatuajes",
    height: "tall",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=1200&auto=format&fit=crop",
    category: "Pinturas",
    height: "short",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=1200&auto=format&fit=crop",
    category: "Cinematografía",
    height: "medium",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=1200&auto=format&fit=crop",
    category: "Tatuajes",
    height: "tall",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=1200&auto=format&fit=crop",
    category: "Pinturas",
    height: "short",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1598371839696-5c5bb3524346?q=80&w=1200&auto=format&fit=crop",
    category: "Tatuajes",
    height: "medium",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=1200&auto=format&fit=crop",
    category: "Cinematografía",
    height: "tall",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=800&auto=format&fit=crop",
    category: "Pinturas",
    height: "medium",
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=800&auto=format&fit=crop",
    category: "Tatuajes",
    height: "short",
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=800&auto=format&fit=crop",
    category: "Cinematografía",
    height: "tall",
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=800&auto=format&fit=crop",
    category: "Pinturas",
    height: "medium",
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=800&auto=format&fit=crop",
    category: "Tatuajes",
    height: "short",
  },
];

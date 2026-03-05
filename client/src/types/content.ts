export interface SiteConfig {
  hero: { videoUrl: string; logoUrl: string; title: string };
  artist: {
    imageUrl: string;
    badgeText: string;
    bio?: string;
    bioEs?: string;
    bioEn?: string;
  };
  footer: {
    imageUrl: string;
    ctaText: string;
    whatsappUrl: string;
    brandText: string;
    copyrightText: string;
    eclipticUrl: string;
  };
  booking: { subtitle: string; title: string; description: string };
  contact: { whatsappUrl: string; instagramUrl: string };
  meta: { siteTitle: string; siteDescription: string };
  reservation: { name: string; price: number; imageUrl: string };
  tattooSession?: { name: string; imageUrl: string; description?: string; descriptionEs?: string; descriptionEn?: string };
  pricing?: { usdToCrc?: number };
  gallery: {
    categories: string[];
    instagramUrl: string;
    subtitle: string;
    title: string;
    viewMoreText: string;
  };
  shop: { title: string; categories: string[] };
}

export interface NavCardItem {
  id: number;
  title: string;
  subtitle: string;
  href: string;
  external: boolean;
  image: string;
  sortOrder: number;
}

export interface GalleryWorkItem {
  id: number;
  image: string;
  category: string;
  height: "short" | "medium" | "tall";
  sortOrder: number;
}

export interface ProductItem {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  sizes?: string[];
  colors?: string[];
  images: string[];
  sortOrder: number;
}

export interface ContentResponse {
  config: SiteConfig;
  navCards: NavCardItem[];
  galleryWorks: GalleryWorkItem[];
  products: ProductItem[];
}

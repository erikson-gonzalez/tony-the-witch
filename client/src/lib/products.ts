export type Product = {
  id: number;
  slug: string;
  name: string;
  category: "Apparel" | "Art" | "Tattoo Gift Cards" | "Otros";
  price: number;
  description: string;
  sizes?: string[];
  colors?: string[];
  images: string[];
};

export const products: Product[] = [
  {
    id: 1,
    slug: "ttw-black-tee",
    name: "TTW Black Tee",
    category: "Apparel",
    price: 35,
    description: "Premium heavyweight cotton tee featuring the Tony The Witch sigil on the front. Oversized fit with dropped shoulders. Screen-printed with water-based inks for a soft hand feel that lasts.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Charcoal"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
    ],
  },
  {
    id: 2,
    slug: "occult-hoodie",
    name: "Occult Hoodie",
    category: "Apparel",
    price: 65,
    description: "Thick fleece hoodie with embroidered occult symbols on the chest and back print. Relaxed fit with kangaroo pocket. Perfect for studio sessions and late nights.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Dark Grey"],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?q=80&w=800&auto=format&fit=crop",
    ],
  },
  {
    id: 3,
    slug: "serpent-art-print",
    name: "Serpent Art Print",
    category: "Art",
    price: 40,
    description: "Limited edition giclée print on 300gsm cotton rag paper. Featuring the iconic serpent illustration by Tony. Each print is signed and numbered. Edition of 50.",
    sizes: ["A4", "A3", "A2"],
    images: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=800&auto=format&fit=crop",
    ],
  },
  {
    id: 4,
    slug: "moth-illustration-print",
    name: "Moth Illustration",
    category: "Art",
    price: 45,
    description: "Hand-drawn moth illustration printed on museum-quality archival paper. Intricate dotwork detail captures the delicacy of the subject. Signed by the artist.",
    sizes: ["A4", "A3"],
    images: [
      "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop",
    ],
  },
  {
    id: 5,
    slug: "tattoo-gift-card-100",
    name: "Gift Card $100",
    category: "Tattoo Gift Cards",
    price: 100,
    description: "Give the gift of ink. This digital gift card can be redeemed for any tattoo session with Tony The Witch. Valid for 12 months from purchase date. Non-refundable.",
    images: [
      "https://images.unsplash.com/photo-1612404459571-ff01bee72364?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
    ],
  },
  {
    id: 6,
    slug: "tattoo-gift-card-250",
    name: "Gift Card $250",
    category: "Tattoo Gift Cards",
    price: 250,
    description: "Premium gift card for larger pieces. Redeemable for any tattoo session with Tony The Witch. Valid for 12 months. The perfect gift for someone ready for their next piece.",
    images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1612404459571-ff01bee72364?q=80&w=800&auto=format&fit=crop",
    ],
  },
  {
    id: 7,
    slug: "ttw-beanie",
    name: "TTW Beanie",
    category: "Apparel",
    price: 28,
    description: "Ribbed knit beanie with embroidered TTW logo. One size fits all. Acrylic blend for warmth and durability.",
    colors: ["Black", "Dark Grey"],
    images: [
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?q=80&w=800&auto=format&fit=crop",
    ],
  },
  {
    id: 8,
    slug: "sticker-pack",
    name: "Sticker Pack",
    category: "Otros",
    price: 12,
    description: "Set of 6 vinyl die-cut stickers featuring original Tony The Witch illustrations. Waterproof and UV resistant. Perfect for laptops, bottles, and sketchbooks.",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=800&auto=format&fit=crop",
    ],
  },
];

export const shopCategories = ["All", "Apparel", "Art", "Tattoo Gift Cards", "Otros"] as const;

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/**
 * Plantillas por defecto para recuperar tarjetas eliminadas.
 * Debe coincidir con getDefaultNavCards en server/routes-admin.ts
 */
export const DEFAULT_NAV_CARDS = [
  {
    title: "View Portfolio",
    subtitle: "Selected Works",
    href: "/portfolio",
    external: false,
    image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Shop",
    subtitle: "Merch & Prints",
    href: "/shop",
    external: false,
    image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Contact",
    subtitle: "WhatsApp",
    href: "https://wa.me/50671280996",
    external: true,
    image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Instagram",
    subtitle: "@tonythewitch",
    href: "https://instagram.com/tonythewitch",
    external: true,
    image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=800&auto=format&fit=crop",
  },
] as const;

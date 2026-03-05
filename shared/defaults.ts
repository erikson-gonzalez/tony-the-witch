import type { SiteConfigData } from "./schema";

/** Default site config when DB has no data (matches current app constants) */
export const DEFAULT_SITE_CONFIG: SiteConfigData = {
  hero: {
    videoUrl: "/home-video.mp4",
    logoUrl: "/logo-ttw.png",
    title: "TONY THE WITCH",
  },
  artist: {
    imageUrl:
      "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=1600&auto=format&fit=crop",
    badgeText: "Tattoo Artist",
    bio: "Meet Tony, a tattoo artist and visual storyteller with a passion for the dark and the sacred. With a background in illustration and fine art, he brings a unique perspective to every piece — blending occult symbolism, botanical elements, and blackwork precision. From intimate script work to full sleeves, Tony has spent the last decade refining his craft across studios in Latin America and beyond. He collaborates closely with each client to create meaningful, one-of-a-kind tattoos that carry deep personal significance. Currently based in his private studio, Tony is available for bookings and custom commissions worldwide.",
    bioEs: "Conocé a Tony, artista de tatuajes y narrador visual con pasión por lo oscuro y lo sagrado. Con formación en ilustración y bellas artes, aporta una perspectiva única a cada pieza, combinando simbolismo oculto, elementos botánicos y precisión en blackwork. Desde trabajos de script íntimos hasta mangas completas, Tony ha refinado su oficio durante la última década en estudios de América Latina y más allá. Colabora estrechamente con cada cliente para crear tatuajes significativos y únicos. Actualmente en su estudio privado, está disponible para bookings y encargos personalizados en todo el mundo.",
    bioEn: "Meet Tony, a tattoo artist and visual storyteller with a passion for the dark and the sacred. With a background in illustration and fine art, he brings a unique perspective to every piece — blending occult symbolism, botanical elements, and blackwork precision. From intimate script work to full sleeves, Tony has spent the last decade refining his craft across studios in Latin America and beyond. He collaborates closely with each client to create meaningful, one-of-a-kind tattoos that carry deep personal significance. Currently based in his private studio, Tony is available for bookings and custom commissions worldwide.",
  },
  footer: {
    imageUrl:
      "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=1600&auto=format&fit=crop",
    ctaText: "Let's Talk",
    whatsappUrl: "https://wa.me/1234567890",
    brandText: "TTW",
    copyrightText: "Tony the Witch",
    eclipticUrl: "https://eclipticsolutions.com",
  },
  booking: {
    subtitle: "Appointments",
    title: "Start Your Project",
    description:
      "Please fill out the form below with your ideas. I am currently booking for next month.",
  },
  contact: {
    whatsappUrl: "https://wa.me/1234567890",
    instagramUrl: "https://instagram.com/tonythewitch",
  },
  meta: {
    siteTitle: "Tony The Witch",
    siteDescription:
      "Tattoo artist and visual storyteller. Custom tattoos, occult symbolism, blackwork. Bookings worldwide.",
  },
  reservation: {
    name: "Reserva de sesión de tattoo",
    price: 60,
    imageUrl: "/logo-ttw.png",
  },
  tattooSession: {
    name: "TTW Tattoo Session",
    imageUrl: "/logo-ttw.png",
    descriptionEs: "Gracias por tatuarte con Tony The Witch. Te esperamos pronto.",
    descriptionEn: "Thanks for getting tattooed with Tony The Witch. See you soon.",
  },
  gallery: {
    categories: ["All", "Tatuajes", "Pinturas", "Cinematografía"],
    instagramUrl: "https://instagram.com/tonythewitch",
    subtitle: "Selected Works",
    title: "Portfolio",
    viewMoreText: "View More on Instagram",
  },
  shop: {
    title: "Shop",
    categories: ["All", "Apparel", "Art", "Tattoo Gift Cards", "Otros"],
  },
  pricing: {
    usdToCrc: 500,
  },
};

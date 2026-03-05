import express from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DEFAULT_CONFIG = {
  hero: { videoUrl: "/home-video.mp4", logoUrl: "/logo-ttw.png", title: "TONY THE WITCH" },
  artist: {
    imageUrl: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=1600&auto=format&fit=crop",
    badgeText: "Tattoo Artist",
    bio: "Meet Tony, a tattoo artist and visual storyteller with a passion for the dark and the sacred. With a background in illustration and fine art, he brings a unique perspective to every piece — blending occult symbolism, botanical elements, and blackwork precision. From intimate script work to full sleeves, Tony has spent the last decade refining his craft across studios in Latin America and beyond. He collaborates closely with each client to create meaningful, one-of-a-kind tattoos that carry deep personal significance. Currently based in his private studio, Tony is available for bookings and custom commissions worldwide.",
    bioEs: "Conocé a Tony, artista de tatuajes y narrador visual con pasión por lo oscuro y lo sagrado. Con formación en ilustración y bellas artes, aporta una perspectiva única a cada pieza, combinando simbolismo oculto, elementos botánicos y precisión en blackwork. Desde trabajos de script íntimos hasta mangas completas, Tony ha refinado su oficio durante la última década en estudios de América Latina y más allá. Colabora estrechamente con cada cliente para crear tatuajes significativos y únicos. Actualmente en su estudio privado, está disponible para bookings y encargos personalizados en todo el mundo.",
    bioEn: "Meet Tony, a tattoo artist and visual storyteller with a passion for the dark and the sacred. With a background in illustration and fine art, he brings a unique perspective to every piece — blending occult symbolism, botanical elements, and blackwork precision. From intimate script work to full sleeves, Tony has spent the last decade refining his craft across studios in Latin America and beyond. He collaborates closely with each client to create meaningful, one-of-a-kind tattoos that carry deep personal significance. Currently based in his private studio, Tony is available for bookings and custom commissions worldwide.",
  },
  footer: {
    imageUrl: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=1600&auto=format&fit=crop",
    ctaText: "Let's Talk",
    whatsappUrl: "https://wa.me/1234567890",
    brandText: "TTW",
    copyrightText: "Tony the Witch",
    eclipticUrl: "https://eclipticsolutions.com",
  },
  booking: {
    subtitle: "Appointments",
    title: "Start Your Project",
    description: "Please fill out the form below with your ideas. I am currently booking for next month.",
  },
  contact: { whatsappUrl: "https://wa.me/1234567890", instagramUrl: "https://instagram.com/tonythewitch" },
  meta: { siteTitle: "Tony The Witch", siteDescription: "Tattoo artist and visual storyteller. Custom tattoos, occult symbolism, blackwork. Bookings worldwide." },
  reservation: { name: "Reserva de sesión de tattoo", price: 60, imageUrl: "/logo-ttw.png" },
  tattooSession: {
    name: "TTW Tattoo Session",
    imageUrl: "/logo-ttw.png",
    descriptionEs: "Gracias por tatuarte con Tony The Witch. Te esperamos pronto.",
    descriptionEn: "Thanks for getting tattooed with Tony The Witch. See you soon.",
  },
  pricing: { usdToCrc: 500 },
  gallery: {
    categories: ["All", "Tatuajes", "Pinturas", "Cinematografía"],
    instagramUrl: "https://instagram.com/tonythewitch",
    subtitle: "Selected Works",
    title: "Portfolio",
    viewMoreText: "View More on Instagram",
  },
  shop: { title: "Shop", categories: ["All", "Apparel", "Art", "Tattoo Gift Cards", "Otros"] },
};

const DEFAULT_NAV_CARDS = [
  { id: 1, title: "View Portfolio", subtitle: "Selected Works", href: "/portfolio", external: false, image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=800&auto=format&fit=crop", sortOrder: 0 },
  { id: 2, title: "Shop", subtitle: "Merch & Prints", href: "/shop", external: false, image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=800&auto=format&fit=crop", sortOrder: 1 },
  { id: 3, title: "Contact", subtitle: "WhatsApp", href: "https://wa.me/1234567890", external: true, image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=800&auto=format&fit=crop", sortOrder: 2 },
  { id: 4, title: "Instagram", subtitle: "@tonythewitch", href: "https://instagram.com/tonythewitch", external: true, image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=800&auto=format&fit=crop", sortOrder: 3 },
];

const DEFAULT_GALLERY = [
  { id: 1, image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=1200&auto=format&fit=crop", category: "Tatuajes", height: "tall", sortOrder: 0 },
  { id: 2, image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=1200&auto=format&fit=crop", category: "Pinturas", height: "short", sortOrder: 1 },
  { id: 3, image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=1200&auto=format&fit=crop", category: "Cinematografía", height: "medium", sortOrder: 2 },
  { id: 4, image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=1200&auto=format&fit=crop", category: "Tatuajes", height: "tall", sortOrder: 3 },
  { id: 5, image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=1200&auto=format&fit=crop", category: "Pinturas", height: "short", sortOrder: 4 },
  { id: 6, image: "https://images.unsplash.com/photo-1598371839696-5c5bb3524346?q=80&w=1200&auto=format&fit=crop", category: "Tatuajes", height: "medium", sortOrder: 5 },
  { id: 7, image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=1200&auto=format&fit=crop", category: "Cinematografía", height: "tall", sortOrder: 6 },
  { id: 8, image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=800&auto=format&fit=crop", category: "Pinturas", height: "medium", sortOrder: 7 },
  { id: 9, image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=800&auto=format&fit=crop", category: "Tatuajes", height: "short", sortOrder: 8 },
  { id: 10, image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=800&auto=format&fit=crop", category: "Cinematografía", height: "tall", sortOrder: 9 },
  { id: 11, image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=800&auto=format&fit=crop", category: "Pinturas", height: "medium", sortOrder: 10 },
  { id: 12, image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=800&auto=format&fit=crop", category: "Tatuajes", height: "short", sortOrder: 11 },
];

app.get("/api/content", (_req, res) => {
  res.json({
    config: DEFAULT_CONFIG,
    navCards: DEFAULT_NAV_CARDS,
    galleryWorks: DEFAULT_GALLERY,
    products: [],
  });
});

app.post("/api/inquiries", (_req, res) => {
  res.status(201).json({ message: "Inquiry received" });
});

export default app;

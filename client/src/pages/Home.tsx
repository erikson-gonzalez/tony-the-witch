import { Navigation } from "@/components/Navigation";
import { ParallaxHero } from "@/components/ParallaxHero";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { useRef } from "react";

const navCards = [
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
    href: "#",
    external: true,
    image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Contact",
    subtitle: "WhatsApp",
    href: "https://wa.me/1234567890",
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
];

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">
      <Navigation />

      <main>
        <ParallaxHero />

        {/* Navigation Cards Grid */}
        <section className="py-16 md:py-32 bg-black">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-start">
              {navCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={index % 2 === 1 ? "mt-12 md:mt-20" : ""}
                >
                  {card.external ? (
                    <a
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-nav-card-${card.title.toLowerCase().replace(/\s/g, '-')}`}
                      className="group block relative aspect-[3/4] overflow-hidden bg-neutral-900 cursor-pointer"
                    >
                      <CardContent card={card} />
                    </a>
                  ) : (
                    <Link
                      href={card.href}
                      data-testid={`link-nav-card-${card.title.toLowerCase().replace(/\s/g, '-')}`}
                      className="group block relative aspect-[3/4] overflow-hidden bg-neutral-900 cursor-pointer"
                    >
                      <CardContent card={card} />
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* Artist Parallax Image + Bio */}
        <div className="pt-16 md:pt-32" />
        <ArtistSection />
      </main>

      <footer className="relative">
        <div className="relative h-[28vh] md:h-[35vh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=1600&auto=format&fit=crop"
            alt="Tony The Witch"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black from-30% via-black/80 via-60% to-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group mb-8"
              data-testid="link-footer-whatsapp"
            >
              <span
                className="text-2xl md:text-4xl lg:text-5xl text-white tracking-wider"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Let's Talk
              </span>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-10 md:h-10 text-white/80 group-hover:text-green-400 transition-colors">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
            <div style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-bold tracking-wider text-white mb-3">TTW</div>
            <div className="text-gray-400 text-xs tracking-wider">
              &copy; {new Date().getFullYear()} Tony the Witch &nbsp;/&nbsp; Powered by{" "}
              <a
                href="https://eclipticsolutions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                data-testid="link-footer-ecliptic"
              >
                Ecliptic Solutions
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ArtistSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref}>
      <div className="relative h-[36vh] md:h-[42vh] overflow-hidden">
        <motion.img
          src="https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=1600&auto=format&fit=crop"
          alt="Tony The Witch at work"
          className="absolute inset-0 w-full h-[120%] object-cover"
          style={{ y }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/30 flex items-center justify-center"
            data-testid="badge-artist-title"
          >
            <span
              className="text-[8px] md:text-[10px] uppercase tracking-[0.25em] text-white/70 text-center leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Tattoo<br />Artist
            </span>
          </div>
        </div>
      </div>

      <div className="bg-black py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p
              className="text-gray-400 text-sm md:text-base leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
              data-testid="text-artist-bio"
            >
              Meet Tony, a tattoo artist and visual storyteller with a passion for the dark and the
              sacred. With a background in illustration and fine art, he brings a unique perspective
              to every piece — blending occult symbolism, botanical elements, and blackwork precision.
              From intimate script work to full sleeves, Tony has spent the last decade refining his
              craft across studios in Latin America and beyond. He collaborates closely with each
              client to create meaningful, one-of-a-kind tattoos that carry deep personal significance.
              Currently based in his private studio, Tony is available for bookings and custom
              commissions worldwide.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CardContent({ card }: { card: typeof navCards[number] }) {
  const isExternal = card.external;
  return (
    <>
      <img
        src={card.image}
        alt={card.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
        <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 block mb-1">
          {card.subtitle}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base uppercase tracking-widest text-white font-medium">
            {card.title}
          </span>
          {isExternal ? (
            <ArrowUpRight size={14} className="text-white/70 group-hover:text-white transition-colors" />
          ) : (
            <ArrowRight size={14} className="text-white/70 group-hover:translate-x-1 group-hover:text-white transition-all" />
          )}
        </div>
      </div>
    </>
  );
}

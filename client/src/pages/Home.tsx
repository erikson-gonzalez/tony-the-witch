import { Navigation } from "@/components/Navigation";
import { ParallaxHero } from "@/components/ParallaxHero";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

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
    image: "https://images.unsplash.com/photo-1598371839696-5c5bb1bddec5?q=80&w=800&auto=format&fit=crop",
  },
];

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">
      <Navigation />

      <main>
        <ParallaxHero />

        {/* Navigation Cards Grid */}
        <section className="py-16 md:py-24 bg-black">
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
      </main>

      <footer className="bg-black py-12 border-t border-white/5">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-bold tracking-wider">TTW</div>
          <div className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Tony The Witch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
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

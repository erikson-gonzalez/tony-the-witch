import { Navigation } from "@/components/Navigation";
import { ParallaxHero } from "@/components/ParallaxHero";
import { Footer } from "@/components/Footer";
import { NavCardComponent } from "@/components/home/nav-card";
import { ArtistSection } from "@/components/home/artist-section";
import { useContent } from "@/hooks/use-content";
import { motion } from "framer-motion";

export default function Home() {
  const { navCards, isLoading } = useContent();

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="w-8 h-8 border border-white/30 border-t-white animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black flex flex-col">
      <Navigation />

      <main className="flex-1">
        <ParallaxHero />

        <section className="py-16 md:py-32 bg-black">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-start">
              {navCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={index % 2 === 1 ? "mt-12 md:mt-20" : ""}
                >
                  <NavCardComponent card={card} index={index} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="pt-16 md:pt-32" />
        <ArtistSection />
      </main>

      <Footer />
    </div>
  );
}

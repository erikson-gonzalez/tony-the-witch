import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useContent } from "@/hooks/use-content";

const FALLBACK_ARTIST = {
  imageUrl:
    "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=1600&auto=format&fit=crop",
  badgeText: "Tattoo Artist",
  bio: "Meet Tony, a tattoo artist and visual storyteller.",
  bioEs: "",
  bioEn: "",
};

export function ArtistSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { i18n } = useTranslation();
  const { config } = useContent();
  const artist = config?.artist ?? FALLBACK_ARTIST;
  const locale = i18n.language?.slice(0, 2) || "en";
  const bioRaw =
    locale === "es"
      ? (artist.bioEs ?? artist.bio ?? "")
      : (artist.bioEn ?? artist.bio ?? "");
  const bioHtml = bioRaw || FALLBACK_ARTIST.bio;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref}>
      <div className="relative h-[36vh] md:h-[42vh] overflow-hidden">
        <motion.img
          src={artist.imageUrl}
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
              {artist.badgeText.split(" ").map((word, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {word}
                </span>
              ))}
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
            <div
              className="text-gray-400 text-sm md:text-base leading-relaxed [&_a]:text-gray-300 [&_a]:underline [&_a]:hover:text-white [&_strong]:text-gray-300"
              style={{ fontFamily: "var(--font-body)" }}
              data-testid="text-artist-bio"
              dangerouslySetInnerHTML={{ __html: bioHtml }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

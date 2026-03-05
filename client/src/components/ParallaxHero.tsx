import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useContent } from "@/hooks/use-content";

const FALLBACK_HERO = {
  videoUrl: "/home-video.mp4",
  logoUrl: "/logo-ttw.png",
  title: "TONY THE WITCH",
};

export function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { config } = useContent();
  const hero = config?.hero ?? FALLBACK_HERO;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div
      ref={ref}
      className="relative h-[110vh] w-full overflow-hidden flex items-center justify-center bg-black"
    >
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/40 z-10" />
        <video
          src={hero.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-80"
        />
      </motion.div>

      <motion.div
        style={{
          y: textY,
          opacity: useTransform(scrollYProgress, [0, 0.5], [1, 0]),
        }}
        className="relative z-20 flex flex-col items-center justify-center w-full max-w-full px-4"
      >
        <div className="flex md:hidden flex-col items-center w-full">
          <h2 className="text-sm tracking-[0.5em] uppercase text-gray-400 font-medium text-center w-full pt-[35vh] relative z-10">
            {hero.title}
          </h2>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center">
              <img
                src={hero.logoUrl}
                alt={hero.title}
                className="h-[min(768px,72vh)] w-auto block mb-8 drop-shadow-2xl object-contain"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="text-white/50 animate-bounce"
                aria-hidden
              >
                <ChevronDown size={32} strokeWidth={1} />
              </motion.div>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-center">
          <h2 className="text-sm md:text-base tracking-[0.5em] uppercase text-gray-400 mb-2 font-medium text-center">
            {hero.title}
          </h2>
          <img
            src={hero.logoUrl}
            alt={hero.title}
            className="h-[min(1024px,72vh)] lg:h-[min(1280px,68vh)] w-auto block mb-8 drop-shadow-2xl object-contain"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-white/50 animate-bounce"
            aria-hidden
          >
            <ChevronDown size={32} strokeWidth={1} />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        style={{ y: foregroundY }}
        className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none h-2/3 bg-gradient-to-t from-black via-black/50 via-black/20 via-black/5 to-transparent"
      />
    </div>
  );
}

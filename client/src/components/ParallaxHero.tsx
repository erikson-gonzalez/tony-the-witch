import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
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
      {/* Background Layer - Furthest */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/40 z-10" />
        {/* Atmospheric misty forest background */}
        <img 
          src="https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=2560&auto=format&fit=crop" 
          alt="Dark atmospheric forest"
          className="w-full h-full object-cover opacity-80"
        />
      </motion.div>

      {/* Mid Layer - Text Content */}
      <motion.div 
        style={{ y: textY, opacity: useTransform(scrollYProgress, [0, 0.5], [1, 0]) }}
        className="relative z-20 text-center px-4"
      >
        <h2 className="text-sm md:text-base tracking-[0.5em] uppercase text-gray-400 mb-6 font-medium">
          Fine Line • Blackwork • Occult
        </h2>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-medium text-white mb-6 tracking-tight drop-shadow-2xl">
          TONY THE WITCH
        </h1>
        <div className="w-px h-24 bg-gradient-to-b from-white to-transparent mx-auto mt-12" />
      </motion.div>

      {/* Foreground Layer - Closest */}
      <motion.div 
        style={{ y: foregroundY }}
        className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent"
      />
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 text-white/50 animate-bounce"
      >
        <ChevronDown size={32} strokeWidth={1} />
      </motion.div>
    </div>
  );
}

import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full text-center"
        >
          <span
            className="text-7xl md:text-9xl font-medium tracking-tighter text-white/10"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("notFound.title")}
          </span>
          <h1
            className="text-2xl md:text-3xl font-medium text-white mt-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("notFound.message")}
          </h1>
          <p className="mt-3 text-gray-400 text-sm md:text-base">
            {t("notFound.joke")}
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              <Home size={16} />
              {t("notFound.backHome")}
            </motion.button>
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

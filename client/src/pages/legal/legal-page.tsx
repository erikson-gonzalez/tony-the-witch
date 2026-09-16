import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalContent {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}

export function LegalPage({ es, en }: { es: LegalContent; en: LegalContent }) {
  const { i18n } = useTranslation();
  const content = i18n.language?.startsWith("es") ? es : en;

  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black flex flex-col">
      <Navigation />
      <main id="main-content" className="flex-1 pt-28 pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1
              className="text-3xl md:text-4xl text-white mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {content.title}
            </h1>
            <p className="text-xs text-gray-500 mb-10">{content.updated}</p>

            {content.intro && (
              <p className="text-gray-300 leading-relaxed mb-8">{content.intro}</p>
            )}

            <div className="space-y-8">
              {content.sections.map((s, i) => (
                <section key={i}>
                  <h2 className="text-sm uppercase tracking-widest text-amber-400 mb-3">
                    {s.heading}
                  </h2>
                  {s.paragraphs.map((p, j) => (
                    <p key={j} className="text-gray-300 text-sm leading-relaxed mb-3">
                      {p}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { Navigation } from "@/components/Navigation";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Portfolio() {
  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">
      <Navigation />

      <main className="pt-24">
        <div className="container mx-auto px-6 mb-8">
          <Link href="/" data-testid="link-back-home">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back
            </motion.span>
          </Link>
        </div>

        <Gallery />
      </main>

      <Footer />
    </div>
  );
}

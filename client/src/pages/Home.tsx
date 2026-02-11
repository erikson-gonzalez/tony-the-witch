import { Navigation } from "@/components/Navigation";
import { ParallaxHero } from "@/components/ParallaxHero";
import { Gallery } from "@/components/Gallery";
import { BookingForm } from "@/components/BookingForm";
import { motion } from "framer-motion";
import { MapPin, Mail, Instagram, Twitter } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">
      <Navigation />
      
      <main>
        <ParallaxHero />
        
        {/* About Section */}
        <section id="artist" className="py-24 md:py-32 relative container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              {/* Unsplash: Tattoo artist working in studio, moody lighting */}
              <img 
                src="https://images.unsplash.com/photo-1598371839696-5c5bb3524346?q=80&w=1200&auto=format&fit=crop" 
                alt="Tony The Witch working" 
                className="w-full h-[600px] object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2 space-y-8"
            >
              <div>
                <span className="text-sm uppercase tracking-widest text-gray-500 mb-2 block">The Artist</span>
                <h2 className="text-4xl md:text-5xl font-display text-white mb-6">Dark Arts & <br/>Fine Line</h2>
              </div>
              
              <p className="text-gray-400 leading-relaxed text-lg font-light">
                Tony "The Witch" specializes in fine line blackwork with occult, botanical, and anatomical themes. 
                With over a decade of experience, his work explores the intersection of life, death, and nature.
              </p>
              
              <p className="text-gray-400 leading-relaxed text-lg font-light">
                Each piece is custom designed to flow with the body's natural anatomy. 
                Based in a private studio in downtown, offering a calm and safe environment for your transformation.
              </p>

              <div className="pt-8 grid grid-cols-2 gap-8 border-t border-white/10">
                <div>
                  <h4 className="font-display text-xl mb-2">Location</h4>
                  <p className="text-gray-500 font-light flex items-center gap-2">
                    <MapPin size={16} /> 123 Dark Street, City
                  </p>
                </div>
                <div>
                  <h4 className="font-display text-xl mb-2">Contact</h4>
                  <p className="text-gray-500 font-light flex items-center gap-2">
                    <Mail size={16} /> booking@tonythewitch.com
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Gallery />
        
        <BookingForm />
      </main>

      <footer className="bg-black py-12 border-t border-white/5">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-display text-2xl font-bold tracking-wider">TTW</div>
          
          <div className="flex gap-8">
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Mail size={20} /></a>
          </div>
          
          <div className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Tony The Witch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

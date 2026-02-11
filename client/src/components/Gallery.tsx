import { motion } from "framer-motion";

const works = [
  {
    id: 1,
    title: "Occult Hand",
    // Unsplash: Detailed blackwork tattoo style illustration
    image: "https://images.unsplash.com/photo-1598371839696-5c5bb3524346?q=80&w=1200&auto=format&fit=crop",
    category: "Blackwork"
  },
  {
    id: 2,
    title: "Floral Spine",
    // Unsplash: Delicate floral tattoo back piece
    image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=1200&auto=format&fit=crop",
    category: "Fine Line"
  },
  {
    id: 3,
    title: "Moth Chest",
    // Unsplash: Moth tattoo sketch/art
    image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=1200&auto=format&fit=crop",
    category: "Illustration"
  },
  {
    id: 4,
    title: "Serpent Arm",
    // Unsplash: Snake tattoo art
    image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=1200&auto=format&fit=crop",
    category: "Traditional"
  },
  {
    id: 5,
    title: "Geometric Sleeve",
    // Unsplash: Geometric tattoo patterns
    image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=1200&auto=format&fit=crop",
    category: "Geometric"
  },
  {
    id: 6,
    title: "Skull Study",
    // Unsplash: Skull tattoo sketch
    image: "https://images.unsplash.com/photo-1590246130725-2c801d9f041b?q=80&w=1200&auto=format&fit=crop",
    category: "Realism"
  }
];

export function Gallery() {
  return (
    <section id="work" className="py-24 bg-black relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-16">
          <span className="text-sm uppercase tracking-widest text-gray-500 mb-2">Selected Works</span>
          <h2 className="text-4xl md:text-5xl font-display text-white">Portfolio</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {works.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative aspect-[3/4] overflow-hidden bg-neutral-900 cursor-pointer"
            >
              <img
                src={work.image}
                alt={work.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-2xl font-display text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {work.title}
                </h3>
                <span className="text-xs uppercase tracking-widest text-gray-300 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {work.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <a 
            href="https://instagram.com/tonythewitch" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors text-gray-400 hover:text-white"
            data-testid="link-gallery-instagram"
          >
            View More on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

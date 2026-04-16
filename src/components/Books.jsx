import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bookList = [
  { id: 1, title: "How Tyrants Fall", cover: "/images/books/p1.jpg" },
  { id: 2, title: "The Value of Everything", cover: "/images/books/p2.jpg" },
  { id: 3, title: "Why Nations Fail", cover: "/images/books/p3.jpg" },
  { id: 4, title: "Big Lies", cover: "/images/books/p4.jpg" },
  { id: 5, title: "The Bottom Billion", cover: "/images/books/p5.jpg" },
  { id: 6, title: "Power Without Glory", cover: "/images/books/p6.jpg" },
  { id: 7, title: "Scorched Earth", cover: "/images/books/p7.jpg" },
  { id: 8, title: "Original Sin", cover: "/images/books/p8.jpg" },
  { id: 9, title: "KEYNES", cover: "/images/books/p9.jpg" },
  { id: 10, title: "Letters from a Stoic", cover: "/images/books/p10.jpg" },
];

const Books = () => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section id="books" className="py-32 px-6 md:px-12 bg-black min-h-screen relative overflow-visible">
      <div className="max-w-6xl mx-auto relative overflow-visible">
        
        <div className="flex items-center gap-4 mb-20 opacity-30">
          <span className="w-8 h-px bg-white"></span>
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-white">Library Vault</span>
        </div>

        <div className="flex flex-wrap justify-center gap-5 md:gap-8 relative overflow-visible">
          {bookList.map((book, index) => (
            <div 
              key={book.id} 
              className="relative"
              style={{ zIndex: hoveredId === book.id ? 50 : 10 }} // Critical fix for layering
            >
              <motion.button
                onMouseEnter={() => setHoveredId(book.id)}
                onMouseLeave={() => setHoveredId(null)}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: index * 0.2, ease: "easeInOut" }}
                style={{ fontFamily: "'Lexend', sans-serif" }}
                className={`relative z-30 px-8 py-4 rounded-full border transition-all duration-500 text-[11px] tracking-[0.2em] uppercase whitespace-nowrap
                  ${hoveredId === book.id 
                    ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
                    : 'bg-black text-white border-white/20 hover:border-white/50'}`}
              >
                {book.title}
              </motion.button>

              <AnimatePresence>
                {hoveredId === book.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.8, rotateX: -20 }}
                    animate={{ opacity: 1, y: 25, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: 0, scale: 0.8, rotateX: -20 }}
                    transition={{ type: "spring", stiffness: 150, damping: 18 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4 pointer-events-none"
                    style={{ perspective: "1000px" }}
                  >
                    <div className="relative w-56 md:w-64 aspect-[2/3] overflow-hidden rounded-md border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.8)] bg-zinc-900">
                      <img 
                        src={book.cover} 
                        alt={book.title} 
                        className="w-full h-full object-cover grayscale-0 brightness-110" 
                      />
                      
                      {/* Glass Numbering Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-md backdrop-blur-xl bg-black/40 border border-white/10 z-40">
                        <span className="font-mono text-[10px] text-white tracking-tighter">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Books;
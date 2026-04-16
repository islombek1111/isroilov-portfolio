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
    <section id="books" className="py-32 px-6 md:px-12 bg-black min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* Section Label */}
        <div className="flex items-center gap-4 mb-20 opacity-30">
          <span className="w-8 h-px bg-white"></span>
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-white">Library Vault</span>
        </div>

        {/* The Brick Wall */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {bookList.map((book, index) => (
            <div key={book.id} className="relative">
              
              {/* The Book Title Button (The Brick) */}
              <motion.button
                onMouseEnter={() => setHoveredId(book.id)}
                onMouseLeave={() => setHoveredId(null)}
                animate={{
                  y: [0, -4, 0], // Subtle constant floating motion
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: index * 0.2, // Offset so they don't move together
                  ease: "easeInOut"
                }}
                style={{ fontFamily: "'Lexend', sans-serif" }}
                className={`relative z-20 px-6 py-3 rounded-full border transition-all duration-500 text-[11px] tracking-widest uppercase
                  ${hoveredId === book.id 
                    ? 'bg-white text-black border-white' 
                    : 'bg-black text-white border-white/20'}`}
              >
                {book.title}
              </motion.button>

              {/* The Cover Slide-Out */}
              <AnimatePresence>
                {hoveredId === book.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 15, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                  >
                    <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
                      <img 
                        src={book.cover} 
                        alt={book.title} 
                        className="w-40 md:w-48 h-auto rounded-sm"
                      />
                      
                      {/* Glass Numbering Badge */}
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-md backdrop-blur-md bg-white/10 border border-white/20">
                        <span className="font-mono text-[9px] text-white/90">
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
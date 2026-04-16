import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const books = [
  { id: 1, title: "How Tyrants Fail", author: "Marcel Dirsus", cover: "/images/books/p1.jpg", note: "tyrants always crumble" },
  { id: 2, title: "The Value of Everything", author: "Mariana Mazzucato", cover: "/images/books/p2.jpg", note: "value is total bullsh*t" },
  { id: 3, title: "Why Nations Fail", author: "Daron & James", cover: "/images/books/p3.jpg", note: "nations fail on purpose" },
  { id: 4, title: "Big Lies", author: "Joe Conason", cover: "/images/books/p4.jpg", note: "right-wing lies exposed" },
  { id: 5, title: "The Bottom Billion", author: "Paul Collier", cover: "/images/books/p5.jpg", note: "poorest countries stay screwed" },
  
];

const Books = () => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section id="books" className="py-32 px-6 md:px-12 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-16 opacity-50">
          <span className="w-8 h-px bg-white"></span>
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-white">Intellectual Archive</span>
        </div>

        {/* The Shelf Container */}
        <div className="relative flex items-end gap-2 md:gap-4 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
          {books.map((book) => (
            <motion.div
              key={book.id}
              className="relative flex-shrink-0 cursor-crosshair group"
              onMouseEnter={() => setHoveredId(book.id)}
              onMouseLeave={() => setHoveredId(null)}
              initial={{ rotate: -2 }}
              whileHover={{ 
                rotate: 0, 
                y: -15,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              {/* Book Image */}
              <motion.img
                src={book.cover}
                alt={book.title}
                className="h-48 md:h-64 w-auto object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 ease-out shadow-2xl"
                style={{ boxShadow: hoveredId === book.id ? '0 20px 40px rgba(255,255,255,0.1)' : 'none' }}
              />
            </motion.div>
          ))}
        </div>

        {/* The "Note" Display Area */}
        <div className="h-32 mt-12 relative">
          <AnimatePresence mode="wait">
            {hoveredId ? (
              <motion.div
                key={hoveredId}
                initial={{ opacity: 0, y: 10, letterSpacing: "0.1em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.2em" }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="max-w-xl"
              >
                <p className="font-mono text-[10px] text-white/30 uppercase mb-2 tracking-widest">
                  {books.find(b => b.id === hoveredId).author}
                </p>
                <p className="font-display italic text-white/80 text-xl md:text-2xl leading-relaxed">
                  "{books.find(b => b.id === hoveredId).note}"
                </p>
              </motion.div>
            ) : (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-[10px] text-white/10 uppercase tracking-[0.5em]"
              >
                Select a volume to read notes
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Books;
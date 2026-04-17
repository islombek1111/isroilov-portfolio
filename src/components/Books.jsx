import React, { useState, useEffect, useRef } from 'react';
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
  const [activeId, setActiveId] = useState(bookList[0].id);
  const [loadingId, setLoadingId] = useState(null);
  
  const currentBook = bookList.find(b => b.id === activeId);
  const premiumEase = [0.16, 1, 0.3, 1];

  const handleHover = (id) => {
    setLoadingId(id);
  };

  // Logic to "throw" the book once the bar is full
  useEffect(() => {
    if (loadingId && loadingId !== activeId) {
      const timer = setTimeout(() => {
        setActiveId(loadingId);
      }, 400); // Speed of the "load"
      return () => clearTimeout(timer);
    }
  }, [loadingId, activeId]);

  return (
    <section id="books" className="py-32 px-6 md:px-12 bg-black relative">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-start">
        
        {/* LEFT: Scrollable Title List */}
        <div className="w-full md:w-3/5 space-y-1">
          <div className="flex items-center gap-4 mb-16 opacity-20">
            <span className="w-8 h-px bg-white"></span>
            <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-white">Archive Index</span>
          </div>

          {bookList.map((book) => (
            <div 
              key={book.id}
              className="relative group py-5 cursor-crosshair"
              onMouseEnter={() => handleHover(book.id)}
              onMouseLeave={() => setLoadingId(null)}
            >
              <span className={`block font-display text-xs md:text-sm tracking-[0.3em] uppercase transition-all duration-700
                ${activeId === book.id ? 'text-white translate-x-3' : 'text-white/20 group-hover:text-white/50'}`}
                style={{ fontFamily: "'Lexend', sans-serif" }}>
                {book.title}
              </span>

              {/* The "Launcher" Loading Bar */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: loadingId === book.id ? "100%" : (activeId === book.id ? "100%" : "0%"),
                    opacity: loadingId === book.id || activeId === book.id ? 1 : 0
                  }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="h-full bg-white shadow-[0_0_10px_#fff]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Fixed Preview Panel */}
        <div className="w-full md:w-2/5 sticky top-32 flex justify-center">
          <div className="relative w-full max-w-[320px] aspect-[3/4] group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, x: -30, scale: 0.9, filter: 'blur(15px)' }}
                animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 30, scale: 1.1, filter: 'blur(15px)' }}
                transition={{ duration: 0.7, ease: premiumEase }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative w-full h-full overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] bg-zinc-900">
                  <img 
                    src={currentBook.cover} 
                    alt="" 
                    className="w-full h-full object-contain p-4" // object-contain ensures no cropping
                  />
                  {/* Subtle inner light */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black/20 via-transparent to-white/5" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Books;
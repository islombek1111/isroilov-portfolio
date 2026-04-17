import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (loadingId && loadingId !== activeId) {
      const timer = setTimeout(() => {
        setActiveId(loadingId);
      }, 350); 
      return () => clearTimeout(timer);
    }
  }, [loadingId, activeId]);

  return (
    <section id="books" className="py-24 md:py-32 px-6 md:px-12 bg-black min-h-screen">
      {/* Centered Minimalist Divider instead of Archive Index */}
      <div className="flex flex-col items-center mb-24 opacity-20">
        <div className="w-px h-12 bg-white mb-4"></div>
        <span className="font-mono text-[9px] tracking-[0.5em] uppercase text-white">The Collection</span>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-20 items-center justify-between">
        
        {/* LEFT: Independent Scrollable Title List */}
        <div className="w-full md:w-1/2 h-[500px] overflow-y-auto no-scrollbar pr-4">
          <div className="space-y-1">
            {bookList.map((book) => (
              <div 
                key={book.id}
                className="relative group py-6 cursor-crosshair"
                onMouseEnter={() => setLoadingId(book.id)}
                onMouseLeave={() => setLoadingId(null)}
              >
                <span className={`block font-display text-xs md:text-sm tracking-[0.35em] uppercase transition-all duration-700
                  ${activeId === book.id ? 'text-white translate-x-4' : 'text-white/15 group-hover:text-white/40'}`}
                  style={{ fontFamily: "'Lexend', sans-serif" }}>
                  {book.title}
                </span>

                {/* The Launcher Bar */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: loadingId === book.id ? "100%" : (activeId === book.id ? "100%" : "0%"),
                      opacity: loadingId === book.id || activeId === book.id ? 1 : 0
                    }}
                    transition={{ duration: 0.35, ease: "circOut" }}
                    className="h-full bg-white shadow-[0_0_15px_#fff]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Truly Fixed Preview Area */}
        <div className="w-full md:w-2/5 flex justify-center">
          <div className="relative w-full max-w-[300px] aspect-[3/4.5]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, scale: 1.05, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: premiumEase }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative w-full h-full bg-zinc-950 border border-white/5 shadow-[0_60px_100px_-30px_rgba(0,0,0,1)] rounded-sm overflow-hidden p-6">
                  <img 
                    src={currentBook.cover} 
                    alt="" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10" />
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
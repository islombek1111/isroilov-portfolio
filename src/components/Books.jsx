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
  // Default to the first book
  const [selectedBook, setSelectedBook] = useState(bookList[0]);

  // Luxurious easing curve
  const premiumEase = [0.16, 1, 0.3, 1];

  return (
    <section id="books" className="py-24 md:py-40 px-6 md:px-12 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-24 items-start">
        
        {/* LEFT COLUMN: The List */}
        <div className="w-full md:w-1/2 order-2 md:order-1">
          <div className="flex items-center gap-4 mb-12 opacity-30">
            <span className="w-8 h-px bg-white"></span>
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-white">Select Volume</span>
          </div>

          <div className="flex flex-col gap-2">
            {bookList.map((book, index) => (
              <button
                key={book.id}
                onMouseEnter={() => setSelectedBook(book)}
                onClick={() => setSelectedBook(book)}
                style={{ fontFamily: "'Lexend', sans-serif" }}
                className="group relative flex items-center py-4 text-left border-b border-white/5 transition-all duration-500"
              >
                {/* Active Dot Indicator */}
                <motion.span 
                  animate={{ 
                    opacity: selectedBook.id === book.id ? 1 : 0,
                    scale: selectedBook.id === book.id ? 1 : 0 
                  }}
                  className="absolute -left-6 w-1.5 h-1.5 bg-white rounded-full"
                />

                <span className={`text-xs md:text-sm tracking-[0.2em] uppercase transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${selectedBook.id === book.id ? 'text-white translate-x-2' : 'text-white/20 group-hover:text-white/60'}`}>
                  {book.title}
                </span>

                {/* Subtle underline progress on hover */}
                <div className={`absolute bottom-0 left-0 h-[1px] bg-white/20 transition-all duration-1000 
                  ${selectedBook.id === book.id ? 'w-full' : 'w-0'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: The Preview Panel */}
        <div className="w-full md:w-1/2 order-1 md:order-2 md:sticky md:top-40 flex flex-col items-center">
          <div className="relative w-full aspect-[4/5] max-w-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedBook.id}
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: premiumEase }}
                className="absolute inset-0"
              >
                <div className="relative w-full h-full shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-white/10 rounded-sm overflow-hidden">
                  <img 
                    src={selectedBook.cover} 
                    alt={selectedBook.title}
                    className="w-full h-full object-cover brightness-110"
                  />
                  
                  {/* Glassmorphism Badge */}
                  <div className="absolute top-6 right-6 px-4 py-2 backdrop-blur-2xl bg-black/40 border border-white/10 rounded-md">
                    <span className="font-mono text-[10px] text-white/90 tracking-[0.3em]">
                      VOL. {String(selectedBook.id).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Metadata under image */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mt-8 text-center"
                >
                  <p className="font-mono text-[9px] tracking-[0.5em] uppercase text-white/30 mb-2">Author</p>
                  <p className="font-display italic text-lg text-white/80">{selectedBook.author}</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Books;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bookList = [
  { 
    id: 1, 
    title: "How Tyrants Fall", 
    cover: "/images/books/p1.jpg",
    readDate: "March 2026",
    verdict: "A chillingly precise anatomy of power and its inevitable decay.",
    thoughts: "Dirsussen's analysis of modern autocracies is a wake-up call. It's not just about the dictators, but the systems that sustain them. Essential for understanding the current global shift."
  },
  { 
    id: 2, 
    title: "The Value of Everything", 
    cover: "/images/books/p2.jpg",
    readDate: "February 2026",
    verdict: "The most important economic rethink of the decade.",
    thoughts: "Mazzucato successfully argues that we've confused price with value. It completely changed how I look at the 'innovation' claims of big tech versus the foundational role of the state."
  },
  // Add more books with thoughts...
];

const Books = () => {
  const [activeId, setActiveId] = useState(bookList[0].id);
  const [loadingId, setLoadingId] = useState(null);
  const [viewMode, setViewMode] = useState('cover'); // 'cover' or 'notes'
  const [isFlipped, setIsFlipped] = useState(false);

  const currentBook = bookList.find(b => b.id === activeId);
  const premiumEase = [0.16, 1, 0.3, 1];

  // Sync flip state with the master switch
  useEffect(() => {
    setIsFlipped(viewMode === 'notes');
  }, [viewMode]);

  useEffect(() => {
    if (loadingId && loadingId !== activeId) {
      const timer = setTimeout(() => setActiveId(loadingId), 350);
      return () => clearTimeout(timer);
    }
  }, [loadingId, activeId]);

  return (
    <section id="books" className="py-24 md:py-32 px-6 md:px-12 bg-black min-h-screen font-['Lexend']">
      
      {/* 1. MASTER SWITCHER */}
      <div className="flex flex-col items-center mb-20">
        <div className="flex items-center gap-6 bg-zinc-900/50 p-1.5 rounded-full border border-white/5 shadow-inner">
          <button 
            onClick={() => setViewMode('cover')}
            className={`px-6 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase transition-all duration-500 ${viewMode === 'cover' ? 'bg-white text-black shadow-lg' : 'text-white/30'}`}
          >
            Covers
          </button>
          <button 
            onClick={() => setViewMode('notes')}
            className={`px-6 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase transition-all duration-500 ${viewMode === 'notes' ? 'bg-white text-black shadow-lg' : 'text-white/30'}`}
          >
            Notes
          </button>
        </div>
        <p className="mt-4 font-mono text-[9px] tracking-[0.3em] uppercase text-white/20 italic">
          Tip: Click the card to flip manually
        </p>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-20 items-center justify-between">
        
        {/* 2. LEFT: Scrollable Title List */}
        <div className="w-full md:w-1/2 h-[450px] overflow-y-auto no-scrollbar pr-4 order-2 md:order-1">
          <div className="space-y-1">
            {bookList.map((book) => (
              <div 
                key={book.id}
                className="relative group py-6 cursor-crosshair"
                onMouseEnter={() => setLoadingId(book.id)}
              >
                <span className={`block text-xs md:text-sm tracking-[0.3em] uppercase transition-all duration-700
                  ${activeId === book.id ? 'text-white translate-x-4' : 'text-white/15 group-hover:text-white/40'}`}>
                  {book.title}
                </span>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: loadingId === book.id || activeId === book.id ? "100%" : "0%" }}
                    transition={{ duration: 0.35 }}
                    className="h-full bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. RIGHT: 3D Flip Preview Panel */}
        <div className="w-full md:w-2/5 flex justify-center order-1 md:order-2 perspective-1000">
          <div 
            className="relative w-full max-w-[320px] aspect-[3/4.5] cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.8, ease: premiumEase }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full h-full"
            >
              {/* FRONT: Cover View */}
              <div className="absolute inset-0 w-full h-full backface-hidden rounded-sm border border-white/5 bg-zinc-950 p-6 shadow-2xl">
                 <AnimatePresence mode="wait">
                    <motion.img
                      key={`cover-${activeId}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      src={currentBook.cover}
                      className="w-full h-full object-contain"
                    />
                 </AnimatePresence>
              </div>

              {/* BACK: Notes View */}
              <div 
                className="absolute inset-0 w-full h-full backface-hidden rounded-sm border border-white/10 bg-zinc-950 p-8 shadow-2xl overflow-y-auto no-scrollbar"
                style={{ transform: "rotateY(180deg)" }}
              >
                <div className="space-y-6 text-left">
                  <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/30 border-b border-white/10 pb-2">
                    Read in: {currentBook.readDate}
                  </p>
                  <div>
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Verdict</h3>
                    <p className="text-white text-lg leading-snug font-light italic">"{currentBook.verdict}"</p>
                  </div>
                  <div className="pt-4">
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Personal Thoughts</h3>
                    <p className="text-white/70 text-sm leading-relaxed font-light">
                      {currentBook.thoughts}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Books;
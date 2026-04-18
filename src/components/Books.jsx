import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bookList = [
  { 
    id: 1, 
    title: "How Tyrants Fall", 
    cover: "/images/books/p1.jpg",
    readDate: "February 2026",
    verdict: "Really solid breakdown of how dictators actually lose power these days.",
    thoughts: "Really good look at how modern dictators actually lose power. I expected it to be dry but the real-world examples kept it interesting. Shows how fragile these regimes are once fear and loyalty fade. Made me see current events differently."
  },
  { 
    id: 2, 
    title: "The Value of Everything", 
    cover: "/images/books/p2.jpg",
    readDate: "January 2026",
    verdict: 'Eye-opening book about how we completely mess up what we call "value" in the economy.',
    thoughts: 'This book messed with my head about what we actually value in the economy. Mazzucato makes a strong case that a lot of "value" is just rich people extracting money. Some parts dragged but the main idea is powerful and stuck with me.'
  },
  { 
    id: 3, 
    title: "Why Nations Fail", 
    cover: "/images/books/p3.jpg",
    readDate: "December 2025",
    verdict: "One of the best big-picture books I’ve read on why some countries get rich and others stay poor.",
    thoughts: "The institutions argument is super convincing. Got a bit repetitive but the historical examples are excellent. Definitely changed how I view politics and economics."
  },
    { 
    id: 4, 
    title: "Big Lies", 
    cover: "/images/books/p4.jpg",
    readDate: "March 2026",
    verdict: "Sharp look at how lies and propaganda shape politics.",
    thoughts: "Felt a bit one-sided at times but it’s well-researched and made me more aware of how narratives get pushed. Eye-opening, especially in today’s climate."
  },
    { 
    id: 5, 
    title: "The Bottom Billion", 
    cover: "/images/books/p5.jpg",
    readDate: "February 2026",
    verdict: 'Still one of the smartest books on why the poorest countries stay stuck.',
    thoughts: 'Colliers four traps make a lot of sense. Not the most exciting read but honest and practical. Changed how I think about global poverty.'
  },
    { 
    id: 6, 
    title: "Power Without Glory", 
    cover: "/images/books/p6.jpg",
    readDate: "March 2026",
    verdict: "Dark, gripping novel about power, corruption and ambition.",
    thoughts: "Based on real politics but reads like a slow train wreck. Long but worth it — really shows how power changes people. Underrated classic"
  },
    { 
    id: 7, 
    title: "Scorched Earth", 
    cover: "/images/books/p7.jpg",
    readDate: "April 2026",
    verdict: "Angry but very readable take on how the left is destroying the country.",
    thoughts: "Captures a lot of the frustration with the left’s cultural changes. More rant than deep analysis but quick and entertaining if you’re in the mood for it."
  },
    { 
    id: 8, 
    title: "Original Sin", 
    cover: "/images/books/p8.jpg",
    readDate: "March 2026",
    verdict: "A slow-burn crime novel with real psychological depth.",
    thoughts: "The psychological side and exploration of guilt is what I loved most. Not fast-paced but very well done. Proper literary crime novel."
  },
    { 
    id: 9, 
    title: "KEYNES", 
    cover: "/images/books/p9.jpg",
    readDate: "January 2026",
    verdict: "Heavy but incredibly influential book that shaped modern economics.",
    thoughts: "Keynes’ ideas still shape modern economics and government policy. More of a “need to know” book than enjoyable one."
  },
    { 
    id: 10, 
    title: "Letters from a Stoic", 
    cover: "/images/books/p10.jpg",
    readDate: "February 2026",
    verdict: "Ancient wisdom that still feels surprisingly useful today.",
    thoughts: "Seneca’s letters are full of practical ancient wisdom that still hits today. Some parts feel repetitive but many lines are gold. I keep coming back to it when life gets stressful."
  }
];

const Books = () => {
  const [activeId, setActiveId] = useState(bookList[0]?.id);
  const [loadingId, setLoadingId] = useState(null);
  const [viewMode, setViewMode] = useState('cover'); 
  const [isFlipped, setIsFlipped] = useState(false);

  const currentBook = bookList.find(b => b.id === activeId);
  const premiumEase = [0.16, 1, 0.3, 1];

  useEffect(() => {
    setIsFlipped(viewMode === 'notes');
  }, [viewMode]);

  useEffect(() => {
    if (loadingId && loadingId !== activeId) {
      const timer = setTimeout(() => setActiveId(loadingId), 350);
      return () => clearTimeout(timer);
    }
  }, [loadingId, activeId]);

  if (!currentBook) return null;

  return (
    <section id="books" className="scroll-mt-20 pt-0 pb-24 md:pb-32 px-6 md:px-12 bg-black min-h-screen">
      
      {/* MASTER SWITCHER */}
      <div className="flex flex-col items-center mb-20 pt-20">
        <div className="flex items-center gap-6 bg-zinc-900/50 p-1.5 rounded-full border border-white/5 shadow-inner transition-all duration-500 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
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
        
        {/* LEFT: Scrollable Title List */}
        <div className="w-full md:w-1/2 h-[450px] overflow-y-auto no-scrollbar pr-4 order-2 md:order-1">
          <div className="space-y-1">
            {bookList.map((book) => (
              <div 
                key={book.id}
                className="relative group py-6 cursor-crosshair"
                onMouseEnter={() => setLoadingId(book.id)}
              >
     <AnimatePresence>
             {(activeId === book.id || loadingId === book.id) && (
               <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] z-10"
            />
          )}
        </AnimatePresence>
                <span className={`block text-xs md:text-sm tracking-[0.3em] uppercase transition-all duration-700 font-['Lexend']
                  ${activeId === book.id ? 'text-white translate-x-4' : 'text-white/15 group-hover:text-white/40'}`}>
                  {book.title}
                </span>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: loadingId === book.id || activeId === book.id ? "100%" : "0%" }}
                    transition={{ duration: 0.35 }}
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: 3D Flip Preview Panel */}
        <div className="w-full md:w-2/5 flex justify-center order-1 md:order-2" style={{ perspective: '1000px' }}>
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
              <div className="absolute inset-0 w-full h-full rounded-sm border border-white/5 bg-zinc-950 p-6 shadow-2xl" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                 <AnimatePresence mode="wait">
                    <motion.img
                      key={`cover-${activeId}`}
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      src={currentBook.cover}
                      className="w-full h-full object-contain"
                    />
                 </AnimatePresence>
              </div>

              {/* BACK: Notes View */}
              <div 
                className="absolute inset-0 w-full h-full rounded-sm border border-white/10 bg-zinc-950 p-8 shadow-2xl overflow-y-auto no-scrollbar font-['Lexend']"
                style={{ transform: "rotateY(180deg)", backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div className="space-y-6 text-left">
                  <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/30 border-b border-white/10 pb-2">
                    Read in: {currentBook.readDate}
                  </p>
                  <div>
                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Verdict</h3>
                    <p className="text-white text-lg leading-snug font-light italic">"{currentBook.verdict}"</p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
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
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const certData = [
  { id: 'google', logo: '/images/logos/google-logo.png', images: ['/images/certs/Google.jpg'], title: 'Google Data Analytics' },
  { id: 'powerbi', logo: '/images/logos/powerbi-logo.png', images: ['/images/certs/PowerBI.jpg'], title: 'PowerBI: DAX language' },
  { id: 'cfi', logo: '/images/logos/cfi-logo.png', images: ['/images/certs/CFI.jpg'], title: 'Financial Modeling & Valuation Analyst' },
  { 
    id: 'ielts', 
    logo: '/images/logos/IELTS-logo.png', 
    images: [
      { img: '/images/certs/IELTS1.jpg', score: '7.5' },
      { img: '/images/certs/IELTS2.jpg', score: '6.5' },
      { img: '/images/certs/IELTS3.jpg', score: '6.0' }
    ], 
    title: 'IELTS Academic' 
  },
];

const Certs = () => {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const premiumEase = [0.16, 1, 0.3, 1];

  return (
    <section id="certs" className="py-20 px-4 bg-black min-h-screen flex flex-col items-center">
      
      {/* LOGO NAV */}
      <motion.div 
        animate={{ y: selectedOrg ? 0 : 100, scale: selectedOrg ? 0.8 : 1 }}
        transition={{ duration: 0.8, ease: premiumEase }}
        className="flex flex-wrap justify-center gap-8 md:gap-16 z-30 mb-12"
      >
        {certData.map((org) => (
          <button
            key={org.id}
            onClick={() => setSelectedOrg(selectedOrg === org.id ? null : org.id)}
            className={`relative w-16 h-16 transition-all duration-500 ${selectedOrg && selectedOrg !== org.id ? 'opacity-20' : 'opacity-100'}`}
          >
            <img 
              src={org.logo} 
              className="w-full h-full object-contain filter invert brightness-200 contrast-0 hover:contrast-100 transition-all"
              alt={org.id}
              onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=Logo"; }}
            />
          </button>
        ))}
      </motion.div>

      {/* VIEWING AREA */}
      <div className="w-full max-w-7xl flex-grow flex items-center justify-center">
        <AnimatePresence mode="wait">
          {selectedOrg && (
            <motion.div
              key={selectedOrg}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-row flex-wrap md:flex-nowrap justify-center gap-6 w-full overflow-visible"
            >
              {certData.find(o => o.id === selectedOrg).images.map((item, idx) => {
                const isIELTS = typeof item === 'object';
                const imgSrc = isIELTS ? item.img : item;

                return (
                  <motion.div 
                    key={idx}
                    className="relative group flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {/* SHINY BORDER FRAME */}
                    <div className="relative p-[1px] rounded-sm bg-gradient-to-b from-white/20 to-transparent group-hover:from-white/50 transition-all duration-1000">
                      <div className="relative bg-zinc-900 overflow-hidden shadow-2xl">
                        <img 
                          src={imgSrc} 
                          loading="lazy"
                          className="h-[350px] md:h-[500px] w-auto object-contain transition-all duration-700 group-hover:opacity-30 group-hover:blur-[2px]" 
                        />
                        
                        {/* SCORE REVEAL */}
                        {isIELTS && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <span className="text-7xl font-light text-white tracking-tighter mix-blend-difference">{item.score}</span>
                            <div className="w-8 h-[1px] bg-white/30 mt-2" />
                          </div>
                        )}

                        {/* HOVER TITLE */}
                        <div className="absolute bottom-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-black/60 backdrop-blur-md border-t border-white/10">
                          <p className="text-[9px] tracking-[0.3em] text-white/70 uppercase text-center font-mono">
                            {certData.find(o => o.id === selectedOrg).title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* CLOSE BUTTON */}
      {selectedOrg && (
        <button 
          onClick={() => setSelectedOrg(null)}
          className="mt-12 text-[9px] tracking-[0.4em] text-white/20 hover:text-white uppercase transition-all"
        >
          [ Close Archive ]
        </button>
      )}
    </section>
  );
};

export default Certs;
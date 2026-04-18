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
    title: 'English Language Proficiency' 
  },
];

const Certs = () => {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const premiumEase = [0.16, 1, 0.3, 1];

  return (
    <section id="certs" className="py-24 md:py-32 px-6 md:px-12 bg-black min-h-screen flex flex-col items-center justify-start overflow-hidden">
      
      {/* 1. LOGO GRID (The Vault Entry) */}
      <motion.div 
        animate={{ 
          y: selectedOrg ? 0 : 150,
          scale: selectedOrg ? 0.75 : 1
        }}
        transition={{ duration: 0.8, ease: premiumEase }}
        className="flex flex-wrap justify-center gap-10 md:gap-20 z-30"
      >
        {certData.map((org) => (
          <button
            key={org.id}
            onClick={() => setSelectedOrg(selectedOrg === org.id ? null : org.id)}
            className={`relative group w-16 h-16 md:w-24 md:h-24 transition-all duration-700
              ${selectedOrg && selectedOrg !== org.id ? 'opacity-10 grayscale blur-[2px]' : 'opacity-100'}`}
          >
            <img 
              src={org.logo} 
              className="w-full h-full object-contain filter grayscale invert brightness-200 contrast-0 group-hover:contrast-125 transition-all duration-500"
              alt={org.id}
            />
            {selectedOrg === org.id && (
              <motion.div layoutId="activeDot" className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
            )}
          </button>
        ))}
      </motion.div>

      {/* 2. THE STAGE (Certificate Reveal) */}
      <div className="w-full flex-grow flex items-center justify-center mt-12">
        <AnimatePresence mode="wait">
          {selectedOrg && (
            <motion.div
              key={selectedOrg}
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
              transition={{ duration: 0.8, ease: premiumEase }}
              className="w-full flex flex-row flex-nowrap justify-center items-center gap-6 md:gap-12 overflow-x-auto no-scrollbar py-10 px-4"
            >
              {certData.find(o => o.id === selectedOrg).images.map((item, idx) => {
                const isIELTS = typeof item === 'object';
                const imgSrc = isIELTS ? item.img : item;

                return (
                  <motion.div 
                    key={idx}
                    className="relative flex-shrink-0 group cursor-crosshair"
                  >
                    {/* The Certificate Frame */}
                    <div className="relative shadow-[0_40px_100px_rgba(0,0,0,0.7)] border border-white/5 bg-zinc-950 overflow-hidden">
                      <img 
                        src={imgSrc} 
                        className="h-[450px] md:h-[550px] w-auto transition-all duration-1000 group-hover:scale-105 group-hover:opacity-40" 
                      />
                      
                      {/* Typographic Reveal (Instead of Glass) */}
                      {isIELTS ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none">
                          <span className="font-display text-8xl text-white font-extralight tracking-tighter mix-blend-difference">
                            {item.score}
                          </span>
                          <span className="font-lexend text-[9px] tracking-[0.5em] uppercase text-white/40 mt-4">
                            Overall Band Score
                          </span>
                        </div>
                      ) : (
                         <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      )}
                    </div>

                    {/* Minimalist Title Tag */}
                    <div className="mt-6 overflow-hidden">
                      <motion.p 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        className="font-lexend text-[10px] tracking-[0.3em] text-white/20 uppercase text-center group-hover:text-white/60 transition-colors duration-500"
                      >
                        {certData.find(o => o.id === selectedOrg).title}
                      </motion.p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Close Instruction */}
      <AnimatePresence>
        {selectedOrg && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrg(null)}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 font-lexend text-[9px] tracking-[0.4em] uppercase text-white/20 hover:text-white transition-colors duration-500"
          >
            [ Click Logo to Close ]
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Certs;
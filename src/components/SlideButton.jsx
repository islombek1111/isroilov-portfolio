import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const SlideButton = () => {
  const x = useMotionValue(0);
  const maxWidth = 140; // Total slide distance
  
  // Dynamic styles based on drag position
  const backgroundWidth = useTransform(x, [0, maxWidth], ["0%", "100%"]);
  const color = useTransform(x, [0, maxWidth], ["#666", "#000"]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x >= maxWidth - 10) {
      window.open("https://book.isroilov.com", "_blank");
      // Snap back after a short delay
      setTimeout(() => animate(x, 0), 500);
    } else {
      animate(x, 0); // Snap back if incomplete
    }
  };

  return (
    <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full w-[200px] h-[42px] overflow-hidden">
      {/* Liquid Fill Effect */}
      <motion.div 
        style={{ width: backgroundWidth }}
        className="absolute left-0 top-0 h-full bg-white"
      />
      
      {/* Label Text */}
      <motion.span 
        style={{ color }}
        className="absolute w-full text-center text-[9px] tracking-[0.3em] font-mono uppercase z-10 pointer-events-none"
      >
        Slide PoorCopy
      </motion.span>

      {/* Draggable Handle */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: maxWidth }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="z-20 cursor-grab active:cursor-grabbing flex items-center justify-center w-[34px] h-[34px] ml-[4px] bg-white rounded-full shadow-xl"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </motion.div>
    </div>
  );
};

export default SlideButton;
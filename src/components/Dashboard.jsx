import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DASHBOARD DATA CONFIGURATION
 * Update this object to change your metrics.
 */
const dashboardData = {
  months: ["January", "February", "March", "April"],
  gym: {
    April: [
      { date: 1, mins: 75 }, { date: 3, mins: 120 }, { date: 5, mins: 65 },
      { date: 7, mins: 180 }, { date: 10, mins: 90 }, { date: 12, mins: 115 },
      { date: 14, mins: 160 }, { date: 17, mins: 70 }, { date: 20, mins: 130 },
    ],
    March: [
      { date: 2, mins: 80 }, { date: 5, mins: 110 }, { date: 10, mins: 140 },
      { date: 15, mins: 180 }, { date: 20, mins: 60 }, { date: 25, mins: 95 },
    ],
    February: [
      { date: 1, mins: 120 }, { date: 14, mins: 180 }, { date: 28, mins: 75 }
    ]
  },
  currently: {
    book: {
      title: "MADE to STICK",
      author: "Chip & Dan Heath",
      progress: 65,
      cover: "/images/books/madetostick.jpg"
    },
    podcast: {
      title: "Norman Ohler: Hitler, Nazis, Drugs, WW2, Blitzkrieg, LSD, MKUltra & CIA",
      source: "Lex Fridman",
      url: "https://youtu.be/SvKv7D4pBjE?si=DX5oSmja5-kCF36m",
      // Using YouTube's high-res thumbnail endpoint
      thumbnail: "https://img.youtube.com/vi/SvKv7D4pBjE/maxresdefault.jpg"
    }
  }
};

const ease = [0.16, 1, 0.3, 1]; // "Expensive" transition curve

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#080808] border border-white/10 rounded-xl overflow-hidden relative ${className}`}>
    {children}
  </div>
);

export default function Dashboard() {
  const [activeMonth, setActiveMonth] = useState("April");
  const [hoveredDay, setHoveredDay] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // Calculate Weekly Average for the active month
  const weeklyAvg = useMemo(() => {
    const monthData = dashboardData.gym[activeMonth] || [];
    if (monthData.length === 0) return "00:00";
    
    const totalMins = monthData.reduce((acc, curr) => acc + curr.mins, 0);
    const avgPerWeek = totalMins / 4; 
    const hh = Math.floor(avgPerWeek / 60);
    const mm = Math.floor(avgPerWeek % 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }, [activeMonth]);

  return (
    <section id="dashboard" className="min-h-screen bg-black py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h2 className="font-['Lexend'] text-[10px] tracking-[0.4em] text-white/30 uppercase mb-4">Life Metrics</h2>
            <h3 className="text-4xl font-light text-white tracking-tight">Personal Dashboard</h3>
          </div>
          
          <div className="flex items-center gap-8 font-['JetBrains_Mono'] text-[10px] tracking-widest text-white/40 uppercase">
            <div className="flex flex-col gap-1">
              <span className="text-white/20">Weekly Avg</span>
              <span className="text-white text-sm">{weeklyAvg}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-white/20">Select Month</span>
              <select 
                value={activeMonth} 
                onChange={(e) => setActiveMonth(e.target.value)}
                className="bg-transparent text-white border-none outline-none cursor-pointer hover:text-white/80 transition-colors appearance-none"
              >
                {dashboardData.months.map(m => (
                  <option key={m} value={m} className="bg-[#080808]">{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          
          {/* CARD 1: GYM HEATMAP */}
          <Card className="md:col-span-2 p-8 flex flex-col justify-between min-h-[400px]">
            <div>
              <p className="font-['JetBrains_Mono'] text-[10px] tracking-[0.3em] text-white/30 uppercase mb-8 text-center md:text-left">
                Gym Activity Log
              </p>
              
              <div className="grid grid-cols-7 gap-2 md:gap-4 max-w-2xl mx-auto md:mx-0">
                {Array.from({ length: 31 }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayData = (dashboardData.gym[activeMonth] || []).find(d => d.date === dayNum);
                  
                  // Intensity Logic: 60min = Light, 180min = Deep
                  // Hex #13265C mapped to intensity
                  const intensity = dayData ? Math.min(1, Math.max(0.3, (dayData.mins - 60) / 120)) : 0;
                  
                  return (
                    <motion.div
                      key={i}
                      onMouseEnter={() => dayData && setHoveredDay(dayData)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className="aspect-square rounded-[2px] relative cursor-crosshair transition-colors duration-500"
                      style={{ 
                        backgroundColor: dayData ? `rgba(19, 38, 92, ${intensity + 0.2})` : '#161b22',
                        boxShadow: dayData ? `0 0 20px rgba(19, 38, 92, ${intensity * 0.4})` : 'none',
                        border: dayData ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
                      }}
                    >
                      <AnimatePresence>
                        {hoveredDay && hoveredDay.date === dayNum && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: -10 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 text-[9px] font-['JetBrains_Mono'] whitespace-nowrap z-50 rounded font-bold"
                          >
                            {dayData.mins} MIN
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 pt-6 font-['JetBrains_Mono'] text-[9px] text-white/20 tracking-widest uppercase">
              <div className="flex gap-4">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Intensity</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#161b22]" />
                  <div className="w-2 h-2 bg-[rgba(19,38,92,0.4)]" />
                  <div className="w-2 h-2 bg-[rgba(19,38,92,0.7)]" />
                  <div className="w-2 h-2 bg-[rgba(19,38,92,1)]" />
                </div>
              </div>
            </div>
          </Card>

          {/* CARD 2: NON-LINEAR READING */}
          <Card className="p-8 flex flex-col items-center">
            <div className="w-full flex justify-between items-start mb-10">
              <p className="font-['JetBrains_Mono'] text-[10px] tracking-[0.3em] text-white/30 uppercase">Reading</p>
              
              <div className="relative">
                <motion.div 
                  onMouseEnter={() => setShowWarning(true)}
                  onMouseLeave={() => setShowWarning(false)}
                  whileHover={{ scale: 1.1, color: '#fff' }}
                  className="w-6 h-6 border border-white/10 rounded-full flex items-center justify-center cursor-help text-[10px] text-white/40 transition-all"
                >
                  !
                </motion.div>
                
                <AnimatePresence>
                  {showWarning && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="absolute top-0 right-10 w-48 p-4 bg-black/60 backdrop-blur-xl border border-white/10 z-50 rounded-lg shadow-2xl"
                    >
                      <p className="text-[10px] font-['JetBrains_Mono'] leading-relaxed text-white/80 italic">
                        "I do not read books to completion. I start from a random page, skip chapters, and stuck on a paragraph indefinitely"
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="relative group mb-8">
              <img 
                src={dashboardData.currently.book.cover} 
                className="w-32 h-48 object-cover rounded shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-700 group-hover:scale-105" 
                alt="Book Cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <h4 className="font-['Lexend'] text-lg text-white mb-1 text-center font-light">{dashboardData.currently.book.title}</h4>
            <p className="text-white/30 text-[10px] text-center mb-10 uppercase tracking-[0.2em] font-['JetBrains_Mono']">
              {dashboardData.currently.book.author}
            </p>
            
            <div className="w-full mt-auto">
              <div className="flex justify-between text-[9px] font-['JetBrains_Mono'] text-white/40 mb-3 uppercase tracking-tighter">
                <span>Progress Tracking</span>
                <span>{dashboardData.currently.book.progress}%</span>
              </div>
              <div className="h-[1px] w-full bg-white/10 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${dashboardData.currently.book.progress}%` }}
                  transition={{ duration: 1.5, ease }}
                  className="absolute inset-0 bg-white/50"
                />
              </div>
            </div>
          </Card>

          {/* CARD 3: PODCAST/VIDEO */}
          <a 
            href={dashboardData.currently.podcast.url} 
            target="_blank" 
            rel="noreferrer" 
            className="md:col-span-3 lg:col-span-1 group"
          >
            <Card className="h-full p-8 transition-all duration-500 group-hover:border-white/20">
              <div className="flex justify-between items-center mb-8">
                <p className="font-['JetBrains_Mono'] text-[10px] tracking-[0.3em] text-white/30 uppercase">Last Watched</p>
                <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-full border border-white/5">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-[8px] font-['JetBrains_Mono'] text-white/60 uppercase">Streaming</span>
                </div>
              </div>

              <div className="relative aspect-video rounded-lg overflow-hidden mb-6 bg-white/5">
                <img 
                  src={dashboardData.currently.podcast.thumbnail} 
                  className="w-full h-full object-cover filter grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-75 transition-all duration-1000" 
                  alt="Video Thumbnail"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                      <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[12px] border-l-white border-b-[7px] border-b-transparent ml-1" />
                   </div>
                </div>
              </div>

              <h4 className="font-['JetBrains_Mono'] text-[11px] text-white/90 leading-relaxed mb-3 uppercase tracking-tight group-hover:text-white transition-colors">
                {dashboardData.currently.podcast.title}
              </h4>
              <p className="font-['JetBrains_Mono'] text-[9px] text-white/30 uppercase tracking-[0.1em]">
                via {dashboardData.currently.podcast.source}
              </p>
            </Card>
          </a>

        </div>
      </div>
    </section>
  );
}
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DASHBOARD DATA CONFIGURATION
 * Update this object to change your metrics.
 */
const dashboardData = {
  months: ["February", "March", "April"],
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
      cover: "/images/books/madetostick.jpg"
    },
    watching: {
      current: {
        title: "Norman Ohler: Hitler, Nazis, Drugs, WW2, Blitzkrieg, LSD, MKUltra & CIA",
        source: "Lex Fridman",
        url: "https://youtu.be/SvKv7D4pBjE?si=DX5oSmja5-kCF36m",
        thumbnail: "https://img.youtube.com/vi/SvKv7D4pBjE/maxresdefault.jpg"
      },
      history: [
        { title: "Three Scientists on the Origins of Everything", url: "https://youtu.be/JW9gcjpt89o?si=csHWoqXQTfN8tR8c" },
        { title: "Reading and the art of conversation", url: "https://youtu.be/B7yr4WfDKiY?si=lw_Nwdqbli7mB5xC" }
      ]
    }
  }
};


const ease = [0.16, 1, 0.3, 1];

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#080808] border border-white/10 rounded-xl overflow-hidden relative ${className}`}>
    {children}
  </div>
);

export default function Dashboard() {
  const [activeMonth, setActiveMonth] = useState("April");
  const [activeWeek, setActiveWeek] = useState("All");
  const [hoveredDay, setHoveredDay] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Logic to calculate days in the grid
  const daysInMonth = 31; 
  const weeklyAvg = useMemo(() => {
    const monthData = dashboardData.gym[activeMonth] || [];
    const filteredData = activeWeek === "All" 
      ? monthData 
      : monthData.filter(d => Math.ceil(d.date / 7) === parseInt(activeWeek));
    
    if (filteredData.length === 0) return "00:00";
    const totalMins = filteredData.reduce((acc, curr) => acc + curr.mins, 0);
    const divisor = activeWeek === "All" ? 4 : 1;
    const avg = totalMins / divisor;
    return `${String(Math.floor(avg / 60)).padStart(2, '0')}:${String(Math.floor(avg % 60)).padStart(2, '0')}`;
  }, [activeMonth, activeWeek]);

  return (
    <section id="dashboard" className="min-h-screen bg-black py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
          <div>
            <h2 className="font-['Lexend'] text-[10px] tracking-[0.4em] text-white/20 uppercase mb-2">Internal Metrics</h2>
            <h3 className="text-2xl font-light text-white tracking-tight">System Status</h3>
          </div>
          <div className="flex gap-10 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest">
            <div className="flex flex-col items-end"><span className="text-white/20 mb-1">Weekly Avg</span><span className="text-white">{weeklyAvg}</span></div>
            <div className="flex flex-col items-end">
              <span className="text-white/20 mb-1">Period</span>
              <div className="flex gap-3">
                <select value={activeMonth} onChange={(e) => setActiveMonth(e.target.value)} className="bg-transparent text-white outline-none cursor-pointer hover:text-white/60 appearance-none text-right">
                  {dashboardData.months.map(m => <option key={m} value={m} className="bg-black">{m}</option>)}
                </select>
                <select value={activeWeek} onChange={(e) => setActiveWeek(e.target.value)} className="bg-transparent text-white outline-none cursor-pointer hover:text-white/60 appearance-none text-right">
                  <option value="All" className="bg-black">All Weeks</option>
                  {[1, 2, 3, 4, 5].map(w => <option key={w} value={w} className="bg-black">Week {w}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 1. GYM LOG - FULL WIDTH TOP */}
        <Card className="p-10">
          <p className="font-['JetBrains_Mono'] text-[10px] tracking-[0.3em] text-white/20 uppercase mb-10">Activity Heatmap</p>
          <div className="grid grid-cols-7 md:grid-cols-14 lg:grid-cols-21 gap-2">
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isDimmed = activeWeek !== "All" && Math.ceil(dayNum / 7) !== parseInt(activeWeek);
              const dayData = (dashboardData.gym[activeMonth] || []).find(d => d.date === dayNum);
              const intensity = dayData ? Math.min(1, Math.max(0.2, (dayData.mins - 60) / 120)) : 0;

              return (
                <div key={i} className="relative aspect-square">
                  <motion.div
                    onMouseEnter={() => dayData && setHoveredDay(dayData)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="w-full h-full rounded-[1px] transition-all duration-700"
                    style={{ 
                      backgroundColor: dayData ? `rgba(19, 38, 92, ${intensity + 0.1})` : '#111',
                      opacity: isDimmed ? 0.15 : 1,
                      border: dayData ? '1px solid rgba(255,255,255,0.05)' : 'none'
                    }}
                  />
                  <AnimatePresence>
                    {hoveredDay?.date === dayNum && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: -10 }} exit={{ opacity: 0 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 text-[8px] font-bold font-['JetBrains_Mono'] z-50 rounded"
                      >
                        {dayData.mins}M
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-8 font-['JetBrains_Mono'] text-[8px] text-white/10 uppercase tracking-widest">
            <div className="flex gap-4"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
            <span>Scale: 60m — 180m</span>
          </div>
        </Card>

        {/* BOTTOM ROW: READING & WATCHING */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          {/* 2. READING - SMALLER */}
          <Card className="md:col-span-2 p-8 flex flex-col items-center">
            <div className="w-full flex justify-between mb-8">
              <span className="font-['JetBrains_Mono'] text-[10px] text-white/20 uppercase tracking-widest">Currently Reading</span>
              <button onMouseEnter={() => setShowWarning(true)} onMouseLeave={() => setShowWarning(false)} className="text-white/20 hover:text-white transition-colors text-xs">!</button>
            </div>
            <AnimatePresence>
              {showWarning && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md p-8 flex items-center justify-center text-center">
                  <p className="font-['JetBrains_Mono'] text-[10px] leading-relaxed text-white/60 italic">
                    "I do not read books to completion. I start from a random page, skip chapters, and stuck on a paragraph indefinitely"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <img src={dashboardData.currently.book.cover} className="w-24 h-36 object-cover rounded shadow-2xl mb-6 grayscale hover:grayscale-0 transition-all duration-700" />
            <h4 className="font-['Lexend'] text-md text-white font-light text-center">{dashboardData.currently.book.title}</h4>
            <p className="text-white/30 text-[9px] uppercase font-['JetBrains_Mono'] mt-2 tracking-widest">{dashboardData.currently.book.author}</p>
          </Card>

          {/* 3. WATCHING - BIGGER */}
          <Card className="md:col-span-3 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="font-['JetBrains_Mono'] text-[10px] text-white/20 uppercase tracking-widest">Watching</span>
              <div className="relative">
                <button onClick={() => setShowHistory(!showHistory)} className="font-['JetBrains_Mono'] text-[9px] text-white/40 hover:text-white transition-colors uppercase tracking-widest">History ▾</button>
                <AnimatePresence>
                  {showHistory && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 mt-2 w-64 bg-[#0A0A0A] border border-white/10 rounded-lg shadow-3xl z-50 overflow-hidden">
                      {dashboardData.currently.watching.history.map((vid, i) => (
                        <a key={i} href={vid.url} target="_blank" className="block px-4 py-3 text-[9px] font-['JetBrains_Mono'] text-white/40 hover:text-white hover:bg-white/5 border-b border-white/5 transition-colors uppercase">
                          {vid.title}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <a href={dashboardData.currently.watching.current.url} target="_blank" className="group relative aspect-video rounded-lg overflow-hidden bg-white/5">
              <img src={dashboardData.currently.watching.current.thumbnail} className="w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-all duration-700 filter grayscale group-hover:grayscale-0" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all duration-500 bg-black/20 backdrop-blur-sm">
                  <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1" />
                </div>
              </div>
            </a>
            <div className="mt-6">
              <h4 className="font-['JetBrains_Mono'] text-[10px] text-white/80 uppercase tracking-tight">{dashboardData.currently.watching.current.title}</h4>
              <p className="text-white/20 text-[9px] uppercase font-['JetBrains_Mono'] mt-1">Source: {dashboardData.currently.watching.current.source}</p>
            </div>
          </Card>

        </div>
      </div>
    </section>
  );
}
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


const Card = ({ children, className = "" }) => (
  <div className={`bg-[#080808] border border-white/10 rounded-lg relative ${className}`}>
    {children}
  </div>
);

export default function Dashboard() {
  const [activeMonth, setActiveMonth] = useState("April");
  const [activeWeek, setActiveWeek] = useState("All");
  const [hoveredDay, setHoveredDay] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const weeklyAvg = useMemo(() => {
    const monthData = dashboardData.gym[activeMonth] || [];
    const filtered = activeWeek === "All" ? monthData : monthData.filter(d => Math.ceil(d.date / 7) === parseInt(activeWeek));
    if (!filtered.length) return "00:00";
    const avg = filtered.reduce((acc, curr) => acc + curr.mins, 0) / (activeWeek === "All" ? 4 : 1);
    return `${String(Math.floor(avg / 60)).padStart(2, '0')}:${String(Math.floor(avg % 60)).padStart(2, '0')}`;
  }, [activeMonth, activeWeek]);

  return (
    <section id="dashboard" className="bg-black py-20 px-6 md:px-12 font-['JetBrains_Mono']">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        
        {/* GYM LOG - COMPACT HEATMAP */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] tracking-[0.3em] text-white/40 uppercase">Gym Activity</h3>
            <div className="flex gap-6 text-[9px] items-center uppercase tracking-widest text-white/60">
              <div className="flex flex-col items-end"><span className="text-white/20 text-[8px]">AVG</span>{weeklyAvg}</div>
              <select value={activeMonth} onChange={(e) => setActiveMonth(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer">
                {dashboardData.months.map(m => <option key={m} value={m} className="bg-black">{m}</option>)}
              </select>
              <select value={activeWeek} onChange={(e) => setActiveWeek(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer">
                <option value="All" className="bg-black">All Weeks</option>
                {[1, 2, 3, 4, 5].map(w => <option key={w} value={w} className="bg-black">W{w}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-[3px] flex-wrap">
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const isDimmed = activeWeek !== "All" && Math.ceil(dayNum / 7) !== parseInt(activeWeek);
              const dayData = (dashboardData.gym[activeMonth] || []).find(d => d.date === dayNum);
              const intensity = dayData ? Math.min(1, Math.max(0.2, (dayData.mins - 60) / 120)) : 0;

              return (
                <div key={i} className="relative group">
                  <div 
                    onMouseEnter={() => dayData && setHoveredDay(dayData)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="w-[11px] h-[11px] rounded-[1px] transition-colors duration-300"
                    style={{ 
                      backgroundColor: dayData ? `rgba(19, 38, 92, ${intensity + 0.2})` : '#161b22',
                      opacity: isDimmed ? 0.1 : 1
                    }}
                  />
                  {hoveredDay?.date === dayNum && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-white text-black text-[8px] font-bold z-50 rounded-sm">
                      {dayData.mins}M
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* READING */}
          <Card className="p-5 flex gap-5 items-center">
            <div className="relative flex-shrink-0 group">
              <img src={dashboardData.currently.book.cover} className="w-16 h-24 object-cover rounded shadow-lg" />
              <button 
                onMouseEnter={() => setShowWarning(true)} 
                onMouseLeave={() => setShowWarning(false)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-black/80 border border-white/20 rounded-full text-[8px] flex items-center justify-center text-white/50 hover:text-white"
              >!</button>
              <AnimatePresence>
                {showWarning && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-black/95 border border-white/10 text-[9px] leading-relaxed text-white/60 rounded shadow-2xl z-50"
                  >
                    "I do not read books to completion. I start from a random page, skip chapters, and stuck on a paragraph indefinitely"
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] mb-1">CURRENTLY READING</span>
              <h4 className="text-[11px] text-white leading-tight uppercase">{dashboardData.currently.book.title}</h4>
              <p className="text-[9px] text-white/40 mt-1 uppercase tracking-tighter">{dashboardData.currently.book.author}</p>
            </div>
          </Card>

          {/* WATCHING */}
          <Card className="p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[8px] text-white/20 uppercase tracking-[0.2em]">WATCHING</span>
              <div className="relative">
                <button 
                  onClick={() => setShowHistory(!showHistory)} 
                  className="px-3 py-1 border border-white/10 rounded-full text-[8px] uppercase tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-all bg-white/5"
                >HISTORY ▾</button>
                <AnimatePresence>
                  {showHistory && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute right-0 mt-2 w-56 bg-[#0A0A0A] border border-white/10 rounded overflow-hidden z-50"
                    >
                      {dashboardData.currently.watching.history.map((vid, i) => (
                        <a key={i} href={vid.url} target="_blank" className="block px-3 py-2 text-[8px] text-white/40 hover:text-white hover:bg-white/5 border-b border-white/5 last:border-none uppercase tracking-tighter transition-colors">
                          {vid.title}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <a href={dashboardData.currently.watching.current.url} target="_blank" className="group flex items-center gap-4">
              <div className="relative w-24 aspect-video rounded overflow-hidden flex-shrink-0 bg-white/5">
                <img src={dashboardData.currently.watching.current.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent" />
                </div>
              </div>
              <div>
                <h4 className="text-[10px] text-white/80 uppercase tracking-tighter leading-tight group-hover:text-white transition-colors">
                  {dashboardData.currently.watching.current.title}
                </h4>
                <p className="text-[8px] text-white/20 uppercase mt-1">Source: {dashboardData.currently.watching.current.source}</p>
              </div>
            </a>
          </Card>

        </div>
      </div>
    </section>
  );
}
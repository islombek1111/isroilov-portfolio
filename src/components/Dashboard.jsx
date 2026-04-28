import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────
//  DASHBOARD DATA
// ─────────────────────────────────────────────────────────────
//  HOW TO UPDATE:
//  1. GYM: add/edit entries. Key = "YYYY-MM-DD", value = minutes (60–180).
//  2. BOOK: change `title`, `author`, `coverImg` (put file in /public/images/books/).
//  3. VIDEO: change `videoId` (YouTube ID), `title`, `source`.
//     First copy current video into `history`, then update the top fields.

const dashboardData = {
  gym: {
    "2026-04": {
      days: {
        "2026-04-02": 153, "2026-04-05": 108, "2026-04-06": 126,
        "2026-04-11": 87,  "2026-04-12": 71,  "2026-04-16": 75,
        "2026-04-19": 67,  "2026-04-23": 77, "2026-04-24": 82,
        "2026-04-28": 116,
      },
    },
    "2026-03": {
      days: {
        "2026-03-02": 94,  "2026-03-05": 124, "2026-03-07": 156,
        "2026-03-11": 98,  "2026-03-12": 128, "2026-03-14": 79,
        "2026-03-18": 110, "2026-03-25": 87,  "2026-03-30": 94,
        "2026-03-31": 147,
      },
    },
    "2026-02": {
      days: {
        "2026-02-21": 151, "2026-02-23": 124,
        "2026-02-27": 98,  "2026-02-28": 137,
      },
    },
  },

  book: {
    title: "MADE to Stick",
    author: "Chip & Dan Heath",
    coverImg: "/images/books/madetostick.jpg",
  },

  video: {
    videoId: "SvKv7D4pBjE",
    title: "Norman Ohler: Hitler, Nazis, Drugs, WW2, Blitzkrieg, LSD, MKUltra & CIA",
    source: "Lex Fridman",
    history: [
      { videoId: "JW9gcjpt89o", title: "Three Scientists on the Origins of Everything", source: "Hoover Institution" },
      { videoId: "B7yr4WfDKiY", title: "Reading and the art of conversation", source: "Woanderings" },
      { videoId: "n6HFghr9DGQ", title: "The Middle Class Is COLLAPSING", source: "Novara Media" },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) { return new Date(y, m, 1).getDay(); }

function minutesToColor(min) {
  if (!min) return "#111418";
  const t = Math.max(0, Math.min(1, (min - 60) / 120));
  return `rgba(${Math.round(26 - 16 * t)},${Math.round(37 - 9 * t)},${Math.round(64 + 68 * t)},${0.55 + t * 0.45})`;
}

function fmtDuration(min) {
  if (!min) return "—";
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function weeklyAvg(days, year, month, week) {
  const vals = [];
  const start = week * 7 + 1;
  const end = Math.min(start + 6, getDaysInMonth(year, month));
  for (let d = start; d <= end; d++) {
    const k = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    if (days[k]) vals.push(days[k]);
  }
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
}

function monthlyAvg(days) {
  const vals = Object.values(days).filter(Boolean);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
}

function formatAvg(min) {
  if (!min) return "--:--";
  return `${String(Math.floor(min / 60)).padStart(2,"0")}:${String(min % 60).padStart(2,"0")}`;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function parseMonthKey(k) {
  const [y, m] = k.split("-").map(Number);
  return { year: y, month: m - 1 };
}

// ─────────────────────────────────────────────────────────────
//  VOICE NOTE  (right panel of GymCard)
// ─────────────────────────────────────────────────────────────

const N_BARS = 16;

function VoiceNotePlayer() {
  const [playing,  setPlaying]  = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const rafRef   = useRef(null);
  const seeds    = useRef(Array.from({ length: N_BARS }, () => 0.28 + Math.random() * 0.72));

  useEffect(() => {
    const audio = new Audio("/audio/voicenote.mp3");
    audio.preload = "metadata";
    audio.onended = () => { setPlaying(false); setProgress(0); };
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause(); setPlaying(false);
      cancelAnimationFrame(rafRef.current);
    } else {
      a.play().catch(() => {});
      setPlaying(true);
      const tick = () => {
        setProgress(a.duration ? a.currentTime / a.duration : 0);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", gap: 22, height:"100%", padding:"0 4px" }}>

      <p style={{ fontFamily:"JetBrains Mono, monospace", fontSize:8, letterSpacing:"0.3em",
        textTransform:"uppercase", color:"rgba(255,255,255,0.18)", margin:0,
        textAlign:"center", whiteSpace:"nowrap" }}>WHY?</p>

      {/* Waveform bars */}
      <div style={{ display:"flex", alignItems:"center", gap:3, height:40 }}>
        {seeds.current.map((s, i) => {
          const passed = (i / N_BARS) < progress;
          return (
            <motion.div key={i}
              animate={playing
                ? { scaleY: [s*0.3, s, s*0.5, s*0.8, s*0.25, s] }
                : { scaleY: s * 0.2 + 0.06 }
              }
              transition={playing
                ? { duration: 0.5 + s * 0.5, repeat: Infinity, ease:"easeInOut", delay:(i*0.038)%0.28 }
                : { duration: 0.3, ease:"easeOut" }
              }
              style={{ width:3, height:34, borderRadius:2,
                background: passed ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)",
                transformOrigin:"center", flexShrink:0, transition:"background 0.2s ease" }}
            />
          );
        })}
      </div>

      {/* Heartbeat button */}
      <motion.button onClick={togglePlay}
        animate={playing
          ? { scale:[1,1.07,0.96,1.04,1] }
          : { scale:[1,1.04,0.98,1] }
        }
        transition={playing
          ? { duration:0.72, repeat:Infinity, ease:"easeInOut" }
          : { duration:1.15, repeat:Infinity, ease:"easeInOut" }
        }
        style={{ position:"relative", padding:"9px 20px", borderRadius:9999,
          border:`1px solid ${playing ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)"}`,
          background: playing ? "rgba(255,255,255,0.05)" : "transparent",
          cursor:"pointer", outline:"none",
          display:"flex", alignItems:"center", gap:7,
          transition:"background 0.3s ease, border-color 0.3s ease",
        }}
      >
        {playing && (
          <>
            {[0, 0.6].map(delay => (
              <motion.span key={delay}
                initial={{ scale:0.85, opacity:0.5 }}
                animate={{ scale:2.6, opacity:0 }}
                transition={{ duration:1.5, delay, repeat:Infinity, ease:"easeOut" }}
                style={{ position:"absolute", inset:0, borderRadius:9999,
                  border:"1px solid rgba(255,255,255,0.2)", pointerEvents:"none" }}
              />
            ))}
          </>
        )}
        <motion.span
          animate={playing
            ? { opacity:[1,0.2,1], scale:[1,0.6,1] }
            : { opacity:[0.35,0.85,0.35] }
          }
          transition={{ duration: playing ? 0.72 : 1.8, repeat:Infinity }}
          style={{ width:5, height:5, borderRadius:"50%",
            background: playing ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.38)",
            display:"inline-block", flexShrink:0, position:"relative", zIndex:1 }}
        />
        <span style={{ fontFamily:"JetBrains Mono, monospace", fontSize:9,
          letterSpacing:"0.26em", textTransform:"uppercase",
          color: playing ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)",
          transition:"color 0.3s ease", position:"relative", zIndex:1, whiteSpace:"nowrap" }}>
          {playing ? "Playing" : "Voice Note"}
        </span>
      </motion.button>

      {/* Progress track */}
      <div style={{ width:"85%", height:1, borderRadius:1,
        background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${progress*100}%`,
          background:"linear-gradient(90deg,rgba(255,255,255,0.18),rgba(255,255,255,0.48))",
          borderRadius:1, transition:"width 0.1s linear" }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  GYM CARD  —  heatmap LEFT  |  voice note RIGHT
// ─────────────────────────────────────────────────────────────

function GymCard() {
  const availableMonths = Object.keys(dashboardData.gym);
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0]);
  const [selectedWeek,  setSelectedWeek]  = useState("all");
  const [tooltip,       setTooltip]       = useState(null);
  const [monthOpen,     setMonthOpen]     = useState(false);
  const [weekOpen,      setWeekOpen]      = useState(false);
  const containerRef = useRef(null);

  const { year, month } = parseMonthKey(selectedMonth);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayMon = (getFirstDayOfMonth(year, month) + 6) % 7;
  const monthData   = dashboardData.gym[selectedMonth]?.days || {};

  const prevKey       = availableMonths[availableMonths.indexOf(selectedMonth) + 1] || null;
  const prevData      = prevKey ? dashboardData.gym[prevKey]?.days || {} : null;
  const currMonthAvg  = monthlyAvg(monthData);
  const prevMonthAvg  = prevData ? monthlyAvg(prevData) : null;

  const numWeeks = Math.ceil((firstDayMon + daysInMonth) / 7);
  const weeks    = Array.from({ length: numWeeks }, (_, w) => w);

  const curWkAvg  = selectedWeek !== "all" ? weeklyAvg(monthData, year, month, parseInt(selectedWeek)) : null;
  const prevWkAvg = selectedWeek !== "all" && parseInt(selectedWeek) > 0
    ? weeklyAvg(monthData, year, month, parseInt(selectedWeek) - 1) : null;

  const avgToShow     = selectedWeek !== "all" ? curWkAvg    : currMonthAvg;
  const prevAvgToShow = selectedWeek !== "all" ? prevWkAvg   : prevMonthAvg;
  const delta = avgToShow != null && prevAvgToShow != null ? avgToShow - prevAvgToShow : null;

  const grid = weeks.map(w => Array.from({ length: 7 }, (_, d) => {
    const dn = w * 7 + d - firstDayMon + 1;
    if (dn < 1 || dn > daysInMonth) return null;
    const k = `${year}-${String(month+1).padStart(2,"0")}-${String(dn).padStart(2,"0")}`;
    const inWeek = selectedWeek === "all" || Math.floor((dn-1+firstDayMon)/7) === parseInt(selectedWeek);
    return { day: dn, key: k, minutes: monthData[k] || 0, inWeek };
  }));

  const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const CELL = 28, GAP = 4;

  function onEnter(cell, e) {
    if (!cell?.minutes) return;
    const r  = e.currentTarget.getBoundingClientRect();
    const cr = containerRef.current?.getBoundingClientRect();
    setTooltip({ day:`${MONTHS[month]} ${cell.day}`, minutes:cell.minutes,
      x: r.left - (cr?.left||0) + CELL/2, y: r.top - (cr?.top||0) - 36 });
  }

 // Detect mobile — hook inside the component is fine
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 700 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }} transition={{ duration:0.7, ease }}
      style={{
        background:"#060606", border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:16, padding:"28px 28px 24px",
        position:"relative", overflow:"hidden",
        display:"flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems:"stretch", gap:0,
      }}
    >
      {/* Ambient glow */}
      <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(19,38,92,0.18) 0%,transparent 70%)", pointerEvents:"none" }} />

      {/* ── LEFT / TOP: heatmap ── */}
      <div style={{ flex:"1 1 auto", minWidth:0 }}>

        {/* Header — on mobile, dropdowns stack below title */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
          marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <p style={{ fontFamily:"JetBrains Mono, monospace", fontSize:9, letterSpacing:"0.32em",
              textTransform:"uppercase", color:"rgba(255,255,255,0.2)", margin:"0 0 6px" }}>Consistency</p>
            <h3 style={{ fontFamily:"Lexend, sans-serif", fontWeight:300, fontSize:18,
              color:"rgba(255,255,255,0.88)", margin:0, letterSpacing:"-0.01em" }}>Gym Heatmap</h3>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            {/* Month */}
            <div style={{ position:"relative" }}>
              <button onClick={() => { setMonthOpen(v=>!v); setWeekOpen(false); }} style={{...dropdownBtn}}>
                {MONTHS[month]} {year}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
              </button>
              <AnimatePresence>
                {monthOpen && (
                  <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.18}}
                    style={{...dropdownMenu, minWidth:110}}>
                    {availableMonths.map(mk => {
                      const {year:y2,month:m2} = parseMonthKey(mk);
                      return (
                        <button key={mk} onClick={() => { setSelectedMonth(mk); setMonthOpen(false); setSelectedWeek("all"); }}
                          style={{...dropdownItem, color: mk===selectedMonth?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.4)"}}>
                          {MONTHS[m2]} {y2}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Week */}
            <div style={{ position:"relative" }}>
              <button onClick={() => { setWeekOpen(v=>!v); setMonthOpen(false); }} style={{...dropdownBtn}}>
                {selectedWeek === "all" ? "All Weeks" : `Week ${parseInt(selectedWeek)+1}`}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
              </button>
              <AnimatePresence>
                {weekOpen && (
                  <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.18}}
                    style={{...dropdownMenu, minWidth:110}}>
                    <button onClick={() => { setSelectedWeek("all"); setWeekOpen(false); }}
                      style={{...dropdownItem, color: selectedWeek==="all"?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.4)"}}>All Weeks</button>
                    {weeks.map(w => (
                      <button key={w} onClick={() => { setSelectedWeek(String(w)); setWeekOpen(false); }}
                        style={{...dropdownItem, color: selectedWeek===String(w)?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.4)"}}>
                        Week {w+1}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
          <div style={{...statCard}}>
            <p style={{...statLabel}}>{selectedWeek!=="all" ? `Week ${parseInt(selectedWeek)+1} avg` : "Monthly avg"}</p>
            <p style={{...statValue}}>{formatAvg(avgToShow)}</p>
          </div>
          {prevAvgToShow !== null && (
            <div style={{...statCard}}>
              <p style={{...statLabel}}>vs {selectedWeek!=="all" ? "prev week" : "prev month"}</p>
              <p style={{...statValue, color: delta>=0?"rgba(100,200,120,0.85)":"rgba(220,100,100,0.85)"}}>
                {delta>=0?"+":""}{formatAvg(Math.abs(delta))}
              </p>
            </div>
          )}
          <div style={{...statCard}}>
            <p style={{...statLabel}}>Sessions</p>
            <p style={{...statValue}}>{Object.values(monthData).filter(Boolean).length}</p>
          </div>
        </div>

        {/* Grid */}
        <div ref={containerRef} style={{ position:"relative", overflowX:"auto" }}>
          <div style={{ display:"inline-block", minWidth:"100%" }}>
            <div style={{ display:"flex", gap:GAP, marginBottom:6, paddingLeft:36 }}>
              {DAYS.map(d => (
                <div key={d} style={{ width:CELL, textAlign:"center", fontFamily:"JetBrains Mono, monospace",
                  fontSize:8, color:"rgba(255,255,255,0.2)", letterSpacing:"0.06em" }}>{d}</div>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:GAP }}>
              {grid.map((row, w) => (
                <div key={w} style={{ display:"flex", gap:GAP, alignItems:"center" }}>
                  <div style={{ width:30, fontFamily:"JetBrains Mono, monospace", fontSize:8,
                    color:"rgba(255,255,255,0.15)", textAlign:"right", paddingRight:6, flexShrink:0 }}>W{w+1}</div>
                  {row.map((cell, d) => {
                    const dim = selectedWeek!=="all" && cell && !cell.inWeek;
                    return (
                      <motion.div key={d}
                        onMouseEnter={e => cell && onEnter(cell, e)}
                        onMouseLeave={() => setTooltip(null)}
                        animate={{ opacity: dim ? 0.25 : 1 }}
                        transition={{ duration:0.25 }}
                        style={{ width:CELL, height:CELL, borderRadius:5,
                          background: cell ? minutesToColor(cell.minutes) : "transparent",
                          border: cell ? "1px solid rgba(255,255,255,0.04)" : "none",
                          cursor: cell?.minutes ? "crosshair" : "default",
                          flexShrink:0, transition:"background 0.3s ease" }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:14, paddingLeft:36 }}>
              <span style={{ fontFamily:"JetBrains Mono, monospace", fontSize:8, color:"rgba(255,255,255,0.2)" }}>Less</span>
              {[0,0.25,0.5,0.75,1].map(t => (
                <div key={t} style={{ width:12, height:12, borderRadius:3,
                  background: minutesToColor(t===0?0:Math.round(60+120*t)) }} />
              ))}
              <span style={{ fontFamily:"JetBrains Mono, monospace", fontSize:8, color:"rgba(255,255,255,0.2)" }}>More</span>
            </div>
          </div>

          <AnimatePresence>
            {tooltip && (
              <motion.div initial={{opacity:0,y:4,scale:0.96}} animate={{opacity:1,y:0,scale:1}}
                exit={{opacity:0,scale:0.94}} transition={{duration:0.15}}
                style={{ position:"absolute", left:tooltip.x, top:tooltip.y, transform:"translateX(-50%)",
                  background:"rgba(10,10,10,0.92)", backdropFilter:"blur(14px)",
                  border:"1px solid rgba(255,255,255,0.1)", borderRadius:8,
                  padding:"6px 12px", pointerEvents:"none", zIndex:99, whiteSpace:"nowrap" }}>
                <p style={{ fontFamily:"JetBrains Mono, monospace", fontSize:9,
                  color:"rgba(255,255,255,0.5)", margin:"0 0 2px", letterSpacing:"0.08em" }}>{tooltip.day}</p>
                <p style={{ fontFamily:"Lexend, sans-serif", fontWeight:300, fontSize:13,
                  color:"rgba(255,255,255,0.9)", margin:0 }}>{fmtDuration(tooltip.minutes)}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── DIVIDER — horizontal on mobile, vertical on desktop ── */}
      <div style={{
        width:   isMobile ? "100%" : 1,
        height:  isMobile ? 1      : "auto",
        background:"rgba(255,255,255,0.055)",
        margin:  isMobile ? "24px 0" : "0 28px",
        flexShrink:0,
      }} />

      {/* ── BOTTOM / RIGHT: voice note ── */}
      <div style={{
        width:      isMobile ? "100%" : 170,
        height:     isMobile ? 180    : "auto",
        flexShrink: 0,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <VoiceNotePlayer />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
//  BOOK CARD — full cover, title + author at bottom flush
// ─────────────────────────────────────────────────────────────

function BookCard() {
  const [warningHov, setWarningHov] = useState(false);
  const { title, author, coverImg } = dashboardData.book;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.08, ease }}
      style={{
        background: "#060606",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Warning triangle — top-right, always visible above cover */}
      <div style={{ position: "absolute", top: 14, right: 14, zIndex: 30 }}>
        <motion.div
          onMouseEnter={() => setWarningHov(true)}
          onMouseLeave={() => setWarningHov(false)}
          whileHover={{ scale: 1.15 }}
          style={{ cursor: "help", position: "relative" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L16.5 15H1.5L9 2Z" stroke="rgba(255,200,60,0.55)" strokeWidth="1.2" fill="rgba(255,200,60,0.08)" strokeLinejoin="round"/>
            <path d="M9 7.5V10.5" stroke="rgba(255,200,60,0.65)" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="9" cy="12.5" r="0.7" fill="rgba(255,200,60,0.65)"/>
          </svg>
          <AnimatePresence>
            {warningHov && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  width: 220,
                  background: "rgba(8,8,8,0.88)",
                  backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,200,60,0.15)",
                  borderRadius: 10, padding: "12px 14px",
                  pointerEvents: "none", zIndex: 100,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <svg width="11" height="11" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2L16.5 15H1.5L9 2Z" stroke="rgba(255,200,60,0.7)" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,200,60,0.6)" }}>Reader Notice</span>
                </div>
                <p style={{ fontFamily: "Lexend, sans-serif", fontWeight: 200, fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>
                  I do not read books to completion. I start from a random page, skip chapters, and get stuck on a paragraph indefinitely.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Eyebrow */}
      <div style={{ padding: "16px 18px 0", flexShrink: 0 }}>
        <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: 0 }}>Currently Reading</p>
      </div>

{/* Book cover — blurred bg fills gaps, sharp cover shown in full */}
      <div style={{ flexShrink: 0, height: 220, position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0" }}>

        {/* Blurred background — fills dark corners around cover */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `url(${coverImg})`,
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "blur(22px) brightness(0.22) saturate(0.5)",
          transform: "scale(1.15)",
        }} />

        {/* Soft vignette */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(6,6,6,0.65) 100%)",
        }} />

        {/* Actual cover — objectFit:contain so full image always visible */}
        <motion.img
          src={coverImg}
          alt={title}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.4, ease }}
          style={{
            position: "relative", zIndex: 2,
            maxWidth: "82%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            display: "block",
            objectFit: "contain",
            borderRadius: 6,
            boxShadow: "0 16px 52px rgba(0,0,0,0.9), 0 2px 0 rgba(255,255,255,0.05)",
          }}
          onError={e => { e.currentTarget.style.display = "none"; }}
        />
      </div>

      {/* Title + author — bottom, same visual weight as video card's title/source */}
      <div style={{ padding: "14px 18px 18px", flexShrink: 0 }}>
        <h4 style={{
          fontFamily: "Lexend, sans-serif", fontWeight: 300, fontSize: 14,
          color: "rgba(255,255,255,0.85)", margin: "0 0 4px",
          lineHeight: 1.35, letterSpacing: "-0.01em",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{title}</h4>
        <p style={{
          fontFamily: "JetBrains Mono, monospace", fontSize: 9,
          color: "rgba(255,255,255,0.3)", margin: 0, letterSpacing: "0.08em",
        }}>{author}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
//  VIDEO CARD  (unchanged)
// ─────────────────────────────────────────────────────────────

function VideoCard() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const { videoId, title, source, history } = dashboardData.video;
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const ytLink   = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
      viewport={{once:true}} transition={{duration:0.7,delay:0.14,ease}}
      style={{ background:"#060606", border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:16, padding:"24px 22px", position:"relative",
        display:"flex", flexDirection:"column", gap:0,
        height:"100%", boxSizing:"border-box" }}>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <p style={{ fontFamily:"JetBrains Mono, monospace", fontSize:9, letterSpacing:"0.32em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)", margin:0 }}>Watching</p>
        <div style={{ position:"relative" }}>
          <button onClick={() => setHistoryOpen(v=>!v)} style={{...dropdownBtn, gap:5}}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v5l3 3" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2"/>
            </svg>
            History
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
          <AnimatePresence>
            {historyOpen && (
              <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.18}}
                style={{...dropdownMenu, right:0, left:"auto", minWidth:220, maxHeight:280, overflowY:"auto"}}>
                {history.length===0
                  ? <p style={{fontFamily:"JetBrains Mono, monospace",fontSize:9,color:"rgba(255,255,255,0.25)",padding:"8px 12px",margin:0}}>No history yet</p>
                  : history.map((item,i) => (
                    <a key={i} href={`https://www.youtube.com/watch?v=${item.videoId}`} target="_blank" rel="noopener noreferrer"
                      style={{display:"block",padding:"8px 12px",textDecoration:"none",borderBottom:i<history.length-1?"1px solid rgba(255,255,255,0.04)":"none",transition:"background 0.2s ease"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <p style={{fontFamily:"Lexend, sans-serif",fontWeight:300,fontSize:11,color:"rgba(255,255,255,0.7)",margin:"0 0 3px",lineHeight:1.35}}>{item.title}</p>
                      <p style={{fontFamily:"JetBrains Mono, monospace",fontSize:8,color:"rgba(255,255,255,0.25)",margin:0,letterSpacing:"0.08em"}}>{item.source}</p>
                    </a>
                  ))
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <a href={ytLink} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"block"}}>
        <motion.div whileHover={{scale:1.015}} transition={{duration:0.35}}
          style={{borderRadius:10,overflow:"hidden",position:"relative",aspectRatio:"16/9",background:"#111",marginBottom:12}}>
          <img src={thumbUrl} alt={title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
            onError={e=>{e.target.style.background="#1a1a1a";e.target.src="";}}/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0)",transition:"background 0.3s ease"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.3)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0)"}>
            <motion.div whileHover={{scale:1.12}} style={{width:40,height:40,borderRadius:"50%",background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.2)"}}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M5 3L13 8L5 13V3Z" fill="rgba(255,255,255,0.9)"/></svg>
            </motion.div>
          </div>
        </motion.div>
        <h4 style={{fontFamily:"Lexend, sans-serif",fontWeight:300,fontSize:14,color:"rgba(255,255,255,0.85)",margin:"0 0 5px",lineHeight:1.35,letterSpacing:"-0.01em"}}>{title}</h4>
        <p style={{fontFamily:"JetBrains Mono, monospace",fontSize:9,color:"rgba(255,255,255,0.3)",margin:0,letterSpacing:"0.08em"}}>{source}</p>
      </a>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SHARED STYLES
// ─────────────────────────────────────────────────────────────

const dropdownBtn = {
  display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px",
  borderRadius:9999, border:"1px solid rgba(255,255,255,0.1)",
  background:"rgba(255,255,255,0.03)", cursor:"pointer",
  fontFamily:"JetBrains Mono, monospace", fontSize:9, letterSpacing:"0.15em",
  textTransform:"uppercase", color:"rgba(255,255,255,0.45)",
  transition:"border-color 0.2s ease, color 0.2s ease", outline:"none", whiteSpace:"nowrap",
};
const dropdownMenu = {
  position:"absolute", top:"calc(100% + 6px)", left:0,
  background:"rgba(8,8,8,0.95)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
  border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, overflow:"hidden", zIndex:200, minWidth:130,
};
const dropdownItem = {
  display:"block", width:"100%", padding:"8px 14px", background:"transparent", border:"none",
  cursor:"pointer", fontFamily:"JetBrains Mono, monospace", fontSize:9, letterSpacing:"0.14em",
  textTransform:"uppercase", textAlign:"left", transition:"background 0.15s ease, color 0.15s ease",
};
const statCard  = { background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 14px" };
const statLabel = { fontFamily:"JetBrains Mono, monospace", fontSize:8, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.22)", margin:"0 0 4px" };
const statValue = { fontFamily:"Lexend, sans-serif", fontWeight:300, fontSize:18, color:"rgba(255,255,255,0.82)", margin:0, letterSpacing:"-0.01em" };

// ─────────────────────────────────────────────────────────────
//  ROOT
// ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <section id="dashboard" style={{ background:"#000", minHeight:"100vh",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"clamp(72px,10vh,120px) clamp(20px,5vw,60px)", boxSizing:"border-box" }}>

      <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}}
        viewport={{once:true}} transition={{duration:0.7,ease}}
        style={{display:"flex",alignItems:"center",gap:12,marginBottom:48}}>
        <div style={{width:28,height:1,background:"rgba(255,255,255,0.12)"}}/>
        <span style={{fontFamily:"JetBrains Mono, monospace",fontSize:10,letterSpacing:"0.38em",color:"rgba(255,255,255,0.2)",textTransform:"uppercase"}}>Personal Dashboard</span>
        <div style={{width:28,height:1,background:"rgba(255,255,255,0.12)"}}/>
      </motion.div>

      <div style={{width:"100%",maxWidth:960,display:"flex",flexDirection:"column",gap:16}}>
        <GymCard />
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"stretch"}}>
          <BookCard />
          <VideoCard />
        </div>
      </div>

      <style>{`
        @media(max-width:700px){
          #dashboard > div > div:last-child{grid-template-columns:1fr!important;}
        }
        button:hover{opacity:0.85;}
      `}</style>
    </section>
  );
}

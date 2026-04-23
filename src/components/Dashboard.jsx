import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────
//  DASHBOARD DATA — update this object to reflect your life
// ─────────────────────────────────────────────────────────────
//
//  HOW TO UPDATE:
//
//  1. GYM DATA
//     Find the month entry in gymData (e.g. "2026-04") and add / edit
//     entries in the `days` object. Key = "YYYY-MM-DD", value = minutes (0-180).
//     Example:  "2026-04-14": 90
//
//  2. CURRENT BOOK
//     Change `title`, `author`, `pages`, `progress` (0-100), and `coverImg`.
//     coverImg path: put the image in /public/images/books/ and use "/images/books/pic.jpg"
//
//  3. CURRENT VIDEO / PODCAST
//     Change `videoId` to the YouTube video ID (the part after ?v= in the URL).
//     Change `title` and `source` (channel / podcast name).
//     When you move to a new video, copy the current entry into `history` array first,
//     then update the top-level fields.
//
// ─────────────────────────────────────────────────────────────

const dashboardData = {
  gym: {
    // Each month: key = "YYYY-MM", days = { "YYYY-MM-DD": minutes }
    "2026-04": {
      days: {
        "2026-04-02": 153,
        "2026-04-05": 108,
        "2026-04-06": 126,
        "2026-04-11": 87,
        "2026-04-12": 71,
        "2026-04-16": 75,
        "2026-04-19": 67,
        "2026-04-23": 77,
      },
    },
    "2026-03": {
      days: {
        "2026-03-02": 94,
        "2026-03-05": 124,
        "2026-03-07": 156,
        "2026-03-11": 98,
        "2026-03-12": 128,
        "2026-03-14": 79,
        "2026-03-18": 110,
        "2026-03-25": 87,
        "2026-03-30": 94,
        "2026-03-31": 147,
      },
    },
 "2026-02": {
      days: {
        "2026-02-21": 151,
        "2026-02-23": 124,
        "2026-02-27": 98,
        "2026-02-28": 137,
      },
    },
  },

  book: {
    title: "MADE to Stick",
    author: "Chip & Dan Heath",
    pages: 279,
    progress: 56,
    coverImg: "/images/books/madetostick.jpg",
    startedAt: "Apr 2026",
  },

  video: {
    videoId: "SvKv7D4pBjE", // YouTube video ID
    title: "Norman Ohler: Hitler, Nazis, Drugs, WW2, Blitzkrieg, LSD, MKUltra & CIA",
    source: "Lex Fridman",
    history: [
      {
        videoId: "JW9gcjpt89o",
        title: "Three Scientists on the Origins of Everything",
        source: "Hoover Institution",
      },
      {
        videoId: "B7yr4WfDKiY",
        title: "Reading and the art of conversation",
        source: "Woanderings",
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

function minutesToColor(minutes) {
  if (!minutes) return "#111418";
  const MIN = 60, MAX = 180;
  const t = Math.max(0, Math.min(1, (minutes - MIN) / (MAX - MIN)));
  // Navy scale: low = desaturated #1a2540, high = vibrant #13265C deep
  const r = Math.round(26 + (10 - 26) * t);   // 26 → 10
  const g = Math.round(37 + (28 - 37) * t);   // 37 → 28
  const b = Math.round(64 + (92 - 64) * t);   // 64 → 92  (deeper blue)
  // Also increase opacity-like brightness
  const brightness = 0.5 + t * 0.5;
  return `rgba(${r},${g},${b + Math.round(40 * t)},${0.55 + t * 0.45})`;
}

function fmtDuration(min) {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function weeklyAvg(days, year, month, week) {
  // week: 0-based (0 = first 7 days, etc.)
  const vals = [];
  const start = week * 7 + 1;
  const end = Math.min(start + 6, getDaysInMonth(year, month));
  for (let d = start; d <= end; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (days[key]) vals.push(days[key]);
  }
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function monthlyAvg(days) {
  const vals = Object.values(days).filter(Boolean);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function formatAvg(min) {
  if (!min) return "--:--";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_KEYS = ["2026-04", "2026-03"]; // available months

function parseMonthKey(key) {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m - 1 };
}

// ─────────────────────────────────────────────────────────────
//  GYM HEATMAP CARD
// ─────────────────────────────────────────────────────────────

function GymCard() {
  const availableMonths = Object.keys(dashboardData.gym);
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0]);
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [tooltip, setTooltip] = useState(null); // { day, minutes, x, y }
  const [monthOpen, setMonthOpen] = useState(false);
  const [weekOpen, setWeekOpen] = useState(false);
  const containerRef = useRef(null);

  const { year, month } = parseMonthKey(selectedMonth);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0=Sun
  // Shift so Monday = 0
  const firstDayMon = (firstDay + 6) % 7;
  const monthData = dashboardData.gym[selectedMonth]?.days || {};

  // Previous month for comparison
  const prevKey = availableMonths[availableMonths.indexOf(selectedMonth) + 1] || null;
  const prevData = prevKey ? dashboardData.gym[prevKey]?.days || {} : null;
  const currMonthAvg = monthlyAvg(monthData);
  const prevMonthAvg = prevData ? monthlyAvg(prevData) : null;

  // Number of weeks
  const totalCells = firstDayMon + daysInMonth;
  const numWeeks = Math.ceil(totalCells / 7);
  const weeks = Array.from({ length: numWeeks }, (_, w) => w);

  const currentWeekAvg = selectedWeek !== "all"
    ? weeklyAvg(monthData, year, month, parseInt(selectedWeek))
    : null;
  const prevWeekAvg = selectedWeek !== "all" && parseInt(selectedWeek) > 0
    ? weeklyAvg(monthData, year, month, parseInt(selectedWeek) - 1)
    : null;

  const avgToShow = selectedWeek !== "all" ? currentWeekAvg : currMonthAvg;
  const prevAvgToShow = selectedWeek !== "all" ? prevWeekAvg : prevMonthAvg;
  const delta = avgToShow !== null && prevAvgToShow !== null
    ? avgToShow - prevAvgToShow : null;

  // Build grid: [week][day] = { date, minutes }
  const grid = weeks.map((w) => {
    return Array.from({ length: 7 }, (_, d) => {
      const dayNum = w * 7 + d - firstDayMon + 1;
      if (dayNum < 1 || dayNum > daysInMonth) return null;
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const minutes = monthData[key] || 0;
      // Is this day in selected week?
      const inWeek = selectedWeek === "all" || Math.floor((dayNum - 1 + firstDayMon) / 7) === parseInt(selectedWeek);
      return { day: dayNum, key, minutes, inWeek };
    });
  });

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const CELL = 28; // px — slightly bigger than GitHub
  const GAP = 4;

  function handleMouseEnter(cell, e) {
    if (!cell || !cell.minutes) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    setTooltip({
      day: `${MONTHS[month]} ${cell.day}`,
      minutes: cell.minutes,
      x: rect.left - (containerRect?.left || 0) + CELL / 2,
      y: rect.top - (containerRect?.top || 0) - 36,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease }}
      style={{
        background: "#060606",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "28px 28px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle ambient */}
      <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(19,38,92,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: "0 0 6px" }}>Consistency</p>
          <h3 style={{ fontFamily: "Lexend, sans-serif", fontWeight: 300, fontSize: 18, color: "rgba(255,255,255,0.88)", margin: 0, letterSpacing: "-0.01em" }}>Gym Heatmap</h3>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Month dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setMonthOpen(v => !v); setWeekOpen(false); }}
              style={{ ...dropdownBtn }}
            >
              {MONTHS[month]} {year}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
            <AnimatePresence>
              {monthOpen && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                  style={{ ...dropdownMenu, minWidth: 110 }}>
                  {availableMonths.map(mk => {
                    const { year: y2, month: m2 } = parseMonthKey(mk);
                    return (
                      <button key={mk} onClick={() => { setSelectedMonth(mk); setMonthOpen(false); setSelectedWeek("all"); }}
                        style={{ ...dropdownItem, color: mk === selectedMonth ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>
                        {MONTHS[m2]} {y2}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Week dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setWeekOpen(v => !v); setMonthOpen(false); }}
              style={{ ...dropdownBtn }}
            >
              {selectedWeek === "all" ? "All Weeks" : `Week ${parseInt(selectedWeek) + 1}`}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
            <AnimatePresence>
              {weekOpen && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                  style={{ ...dropdownMenu, minWidth: 110 }}>
                  <button onClick={() => { setSelectedWeek("all"); setWeekOpen(false); }}
                    style={{ ...dropdownItem, color: selectedWeek === "all" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>All Weeks</button>
                  {weeks.map(w => (
                    <button key={w} onClick={() => { setSelectedWeek(String(w)); setWeekOpen(false); }}
                      style={{ ...dropdownItem, color: selectedWeek === String(w) ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>
                      Week {w + 1}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Weekly/Monthly Avg */}
        <div style={{ ...statCard }}>
          <p style={{ ...statLabel }}>{selectedWeek !== "all" ? `Week ${parseInt(selectedWeek) + 1} avg` : "Monthly avg"}</p>
          <p style={{ ...statValue }}>{formatAvg(avgToShow)}</p>
        </div>
        {/* Comparison */}
        {prevAvgToShow !== null && (
          <div style={{ ...statCard }}>
            <p style={{ ...statLabel }}>vs {selectedWeek !== "all" ? "prev week" : "prev month"}</p>
            <p style={{ ...statValue, color: delta >= 0 ? "rgba(100,200,120,0.85)" : "rgba(220,100,100,0.85)" }}>
              {delta >= 0 ? "+" : ""}{formatAvg(Math.abs(delta))}
            </p>
          </div>
        )}
        {/* Session count */}
        <div style={{ ...statCard }}>
          <p style={{ ...statLabel }}>Sessions</p>
          <p style={{ ...statValue }}>
            {Object.values(monthData).filter(Boolean).length}
          </p>
        </div>
      </div>

      {/* Heatmap */}
      <div ref={containerRef} style={{ position: "relative", overflowX: "auto" }}>
        <div style={{ display: "inline-block", minWidth: "100%" }}>
          {/* Day labels */}
          <div style={{ display: "flex", gap: GAP, marginBottom: 6, paddingLeft: 36 }}>
            {DAYS.map(d => (
              <div key={d} style={{ width: CELL, textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>{d}</div>
            ))}
          </div>

          {/* Grid rows = weeks */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
            {grid.map((row, w) => (
              <div key={w} style={{ display: "flex", gap: GAP, alignItems: "center" }}>
                {/* Week label */}
                <div style={{ width: 30, fontFamily: "JetBrains Mono, monospace", fontSize: 8, color: "rgba(255,255,255,0.15)", textAlign: "right", paddingRight: 6, flexShrink: 0 }}>
                  W{w + 1}
                </div>
                {row.map((cell, d) => {
                  const dim = selectedWeek !== "all" && cell && !cell.inWeek;
                  const color = cell ? minutesToColor(cell.minutes) : "transparent";
                  return (
                    <motion.div
                      key={d}
                      onMouseEnter={e => cell && handleMouseEnter(cell, e)}
                      onMouseLeave={() => setTooltip(null)}
                      animate={{ opacity: dim ? 0.25 : 1 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 5,
                        background: cell ? color : "transparent",
                        border: cell ? "1px solid rgba(255,255,255,0.04)" : "none",
                        cursor: cell?.minutes ? "crosshair" : "default",
                        flexShrink: 0,
                        transition: "background 0.3s ease",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, paddingLeft: 36 }}>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 8, color: "rgba(255,255,255,0.2)" }}>Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map(t => (
              <div key={t} style={{ width: 12, height: 12, borderRadius: 3, background: minutesToColor(t === 0 ? 0 : Math.round(60 + (180 - 60) * t)) }} />
            ))}
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 8, color: "rgba(255,255,255,0.2)" }}>More</span>
          </div>
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                left: tooltip.x,
                top: tooltip.y,
                transform: "translateX(-50%)",
                background: "rgba(10,10,10,0.92)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "6px 12px",
                pointerEvents: "none",
                zIndex: 99,
                whiteSpace: "nowrap",
              }}
            >
              <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.5)", margin: "0 0 2px", letterSpacing: "0.08em" }}>{tooltip.day}</p>
              <p style={{ fontFamily: "Lexend, sans-serif", fontWeight: 300, fontSize: 13, color: "rgba(255,255,255,0.9)", margin: 0 }}>{fmtDuration(tooltip.minutes)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
//  BOOK CARD
// ─────────────────────────────────────────────────────────────

function BookCard() {
  const [warningHov, setWarningHov] = useState(false);
  const { title, author, pages, progress, coverImg, startedAt } = dashboardData.book;

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
        padding: "24px 22px",
        position: "relative",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Warning triangle */}
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 30 }}>
        <motion.div
          onMouseEnter={() => setWarningHov(true)}
          onMouseLeave={() => setWarningHov(false)}
          whileHover={{ scale: 1.15 }}
          style={{ cursor: "help", position: "relative" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L16.5 15H1.5L9 2Z" stroke="rgba(255,200,60,0.5)" strokeWidth="1.2" fill="rgba(255,200,60,0.06)" strokeLinejoin="round"/>
            <path d="M9 7.5V10.5" stroke="rgba(255,200,60,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="9" cy="12.5" r="0.7" fill="rgba(255,200,60,0.6)"/>
          </svg>

          {/* Glass tooltip */}
          <AnimatePresence>
            {warningHov && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: 220,
                  background: "rgba(8,8,8,0.82)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,200,60,0.15)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  pointerEvents: "none",
                  zIndex: 100,
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
      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: 0 }}>Currently Reading</p>

      {/* Cover + Info */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Book cover */}
        <motion.div
          whileHover={{ scale: 1.03, rotateY: 6 }}
          transition={{ duration: 0.4, ease }}
          style={{
            flexShrink: 0,
            width: 72,
            height: 100,
            borderRadius: 5,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.8), 2px 0 0 rgba(255,255,255,0.04)",
            background: "#111",
          }}
        >
          <img
            src={coverImg}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={e => { e.target.style.background = "#1a1a1a"; e.target.src = ""; }}
          />
        </motion.div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontFamily: "Lexend, sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(255,255,255,0.88)", margin: "0 0 5px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>{title}</h4>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", margin: "0 0 12px", letterSpacing: "0.08em" }}>{author}</p>

          {/* Progress bar */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: "100%", background: "linear-gradient(90deg, rgba(19,38,92,0.9), rgba(60,100,200,0.7))", borderRadius: 2 }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 8, color: "rgba(255,255,255,0.25)" }}>~pg {Math.round(pages * progress / 100)} of {pages}</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{progress}%</span>
            </div>
          </div>

          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 8, color: "rgba(255,255,255,0.18)", margin: 0, letterSpacing: "0.08em" }}>Started {startedAt}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
//  VIDEO CARD
// ─────────────────────────────────────────────────────────────

function VideoCard() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const { videoId, title, source, history } = dashboardData.video;
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const ytLink = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.14, ease }}
      style={{
        background: "#060606",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "24px 22px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: 0 }}>Watching</p>

        {/* History button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setHistoryOpen(v => !v)}
            style={{
              ...dropdownBtn,
              gap: 5,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v5l3 3" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2"/>
            </svg>
            History
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>

          <AnimatePresence>
            {historyOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                style={{ ...dropdownMenu, right: 0, left: "auto", minWidth: 220, maxHeight: 280, overflowY: "auto" }}
              >
                {history.length === 0 ? (
                  <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", padding: "8px 12px", margin: 0 }}>No history yet</p>
                ) : history.map((item, i) => (
                  <a
                    key={i}
                    href={`https://www.youtube.com/watch?v=${item.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      padding: "8px 12px",
                      textDecoration: "none",
                      borderBottom: i < history.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <p style={{ fontFamily: "Lexend, sans-serif", fontWeight: 300, fontSize: 11, color: "rgba(255,255,255,0.7)", margin: "0 0 3px", lineHeight: 1.35 }}>{item.title}</p>
                    <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 8, color: "rgba(255,255,255,0.25)", margin: 0, letterSpacing: "0.08em" }}>{item.source}</p>
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* YouTube-style card */}
      <a
        href={ytLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", display: "block" }}
      >
        {/* Thumbnail */}
        <motion.div
          whileHover={{ scale: 1.015 }}
          transition={{ duration: 0.35 }}
          style={{
            borderRadius: 10,
            overflow: "hidden",
            position: "relative",
            aspectRatio: "16/9",
            background: "#111",
            marginBottom: 12,
          }}
        >
          <img
            src={thumbUrl}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={e => { e.target.style.background = "#1a1a1a"; e.target.src = ""; }}
          />
          {/* Play button overlay */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0)",
            transition: "background 0.3s ease",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.3)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}
          >
            <motion.div
              whileHover={{ scale: 1.12 }}
              style={{
                width: 40, height: 40,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M5 3L13 8L5 13V3Z" fill="rgba(255,255,255,0.9)"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Title + Source */}
        <h4 style={{ fontFamily: "Lexend, sans-serif", fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.85)", margin: "0 0 5px", lineHeight: 1.35, letterSpacing: "-0.01em" }}>{title}</h4>
        <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", margin: 0, letterSpacing: "0.08em" }}>{source}</p>
      </a>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SHARED STYLES
// ─────────────────────────────────────────────────────────────

const dropdownBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 9999,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.03)",
  cursor: "pointer",
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 9,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
  transition: "border-color 0.2s ease, color 0.2s ease",
  outline: "none",
  whiteSpace: "nowrap",
};

const dropdownMenu = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: 0,
  background: "rgba(8,8,8,0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  overflow: "hidden",
  zIndex: 200,
  minWidth: 130,
};

const dropdownItem = {
  display: "block",
  width: "100%",
  padding: "8px 14px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 9,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  textAlign: "left",
  transition: "background 0.15s ease, color 0.15s ease",
};

const statCard = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10,
  padding: "10px 14px",
};

const statLabel = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 8,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.22)",
  margin: "0 0 4px",
};

const statValue = {
  fontFamily: "Lexend, sans-serif",
  fontWeight: 300,
  fontSize: 18,
  color: "rgba(255,255,255,0.82)",
  margin: 0,
  letterSpacing: "-0.01em",
};

// ─────────────────────────────────────────────────────────────
//  ROOT EXPORT
// ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <section
      id="dashboard"
      style={{
        background: "#000",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(72px,10vh,120px) clamp(20px,5vw,60px)",
        boxSizing: "border-box",
      }}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease }}
        style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}
      >
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.12)" }} />
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.38em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Personal Dashboard</span>
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.12)" }} />
      </motion.div>

      {/* Bento grid */}
      <div style={{ width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Row 1: Gym heatmap — full width */}
        <GymCard />

        {/* Row 2: Book + Video side by side */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}>
          <BookCard />
          <VideoCard />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          #dashboard > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
        button:hover { opacity: 0.85; }
      `}</style>
    </section>
  );
}

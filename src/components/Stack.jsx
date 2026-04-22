import { useState } from "react";
import { motion } from "framer-motion";

// ─── Inline SVGs for tools not on SimpleIcons ─────────────────
// Excel and Power BI are owned by Microsoft and not on simpleicons.org.
// We use clean hand-drawn SVG equivalents that match their real logos.

function ExcelSVG({ colored }) {
  // Microsoft Excel: green X mark on white/dark grid
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="52" rx="8" fill={colored ? "#217346" : "rgba(255,255,255,0.06)"} style={{ transition: "fill 0.4s ease" }} />
      <rect x="28" y="4" width="20" height="44" rx="2" fill={colored ? "#ffffff" : "rgba(255,255,255,0.12)"} style={{ transition: "fill 0.4s ease" }} />
      {/* Grid lines */}
      <line x1="28" y1="18" x2="48" y2="18" stroke={colored ? "#217346" : "rgba(255,255,255,0.2)"} strokeWidth="1" />
      <line x1="28" y1="30" x2="48" y2="30" stroke={colored ? "#217346" : "rgba(255,255,255,0.2)"} strokeWidth="1" />
      <line x1="38" y1="4" x2="38" y2="48" stroke={colored ? "#217346" : "rgba(255,255,255,0.2)"} strokeWidth="1" />
      {/* X mark */}
      <text x="6" y="34" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="26" fill={colored ? "#ffffff" : "rgba(255,255,255,0.5)"} style={{ transition: "fill 0.4s ease" }}>X</text>
    </svg>
  );
}

function PowerBISVG({ colored }) {
  // Power BI: three ascending bars (yellow/gold)
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tall bar */}
      <rect x="30" y="8" width="12" height="36" rx="3" fill={colored ? "#F2C811" : "rgba(255,255,255,0.35)"} style={{ transition: "fill 0.4s ease" }} />
      {/* Medium bar */}
      <rect x="15" y="18" width="12" height="26" rx="3" fill={colored ? "#F2C811" : "rgba(255,255,255,0.22)"} style={{ opacity: colored ? 0.85 : 1, transition: "fill 0.4s ease, opacity 0.4s ease" }} />
      {/* Short bar */}
      <rect x="0" y="28" width="12" height="16" rx="3" fill={colored ? "#F2C811" : "rgba(255,255,255,0.12)"} style={{ opacity: colored ? 0.65 : 1, transition: "fill 0.4s ease, opacity 0.4s ease" }} />
    </svg>
  );
}

// ─── Tool list ────────────────────────────────────────────────
const TOOLS = [
  {
    id: "powerbi",
    name: "Power BI",
    src: null,
    svgComponent: PowerBISVG,
    color: "#F2C811",
  },
  {
    id: "excel",
    name: "Excel",
    src: null,
    svgComponent: ExcelSVG,
    color: "#217346",
  },
  {
    id: "figma",
    name: "Figma",
    // SimpleIcons Figma — use a specific known good URL
    src: "https://cdn.simpleicons.org/figma/F24E1E",
    color: "#F24E1E",
  },
  {
    id: "notion",
    name: "Notion",
    src: "https://cdn.simpleicons.org/notion/FFFFFF",
    color: "#FFFFFF",
  },
  {
    id: "appsscript",
    name: "Apps Script",
    src: "https://cdn.simpleicons.org/googleappsscript/4285F4",
    color: "#4285F4",
  },
  {
    id: "sql",
    name: "SQL",
    src: "https://cdn.simpleicons.org/mysql/4479A1",
    color: "#4479A1",
  },
  {
    id: "vba",
    name: "VBA",
    src: null,
    svgComponent: null, // text badge
    color: "#78C150",
  },
];

// ─── Single logo tile ─────────────────────────────────────────
function ToolTile({ tool, index }) {
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      custom={index}
      animate={{
        y: [0, -10, 0],
        transition: {
          y: { duration: 3.5 + index * 0.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 },
        },
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onTouchStart={() => setHov(true)}
      onTouchEnd={() => setTimeout(() => setHov(false), 600)}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, cursor: "default", WebkitTapHighlightColor: "transparent" }}
    >
      <motion.div
        animate={{ scale: hov ? 1.2 : 1, opacity: hov ? 1 : 0.38 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
      >
        {tool.svgComponent ? (
          // Inline SVG — passes hov as "colored" prop for color switching
          <tool.svgComponent colored={hov} />
        ) : tool.src ? (
          <img
            src={tool.src}
            alt={tool.name}
            draggable={false}
            style={{
              width: 52, height: 52,
              objectFit: "contain",
              display: "block",
              // B&W → original color on hover
              // Use saturate+brightness instead of grayscale so original hues appear
              filter: hov
                ? "grayscale(0%) brightness(1) saturate(1)"
                : "grayscale(100%) brightness(0.85) saturate(0)",
              transition: "filter 0.4s ease",
              mixBlendMode: "screen",
            }}
          />
        ) : (
          // VBA text badge
          <div style={{
            width: 52, height: 52, borderRadius: 10,
            border: hov ? `1.5px solid ${tool.color}` : "1.5px solid rgba(255,255,255,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border-color 0.4s ease",
          }}>
            <span style={{
              fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 500, letterSpacing: "0.06em",
              color: hov ? tool.color : "rgba(255,255,255,0.5)",
              transition: "color 0.4s ease",
            }}>VBA</span>
          </div>
        )}
      </motion.div>

      {/* Name label */}
      <motion.span
        animate={{ opacity: hov ? 0.85 : 0.2 }}
        transition={{ duration: 0.35 }}
        style={{ fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "white" }}
      >
        {tool.name}
      </motion.span>
    </motion.div>
  );
}

// ─── Root ─────────────────────────────────────────────────────
export default function Stack() {
  return (
    <section id="notes" style={{ background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", boxSizing: "border-box" }}>

      {/* Eyebrow */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 10, letterSpacing: "0.38em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Stack</span>
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.15)" }} />
      </div>

      {/* Subtext — matches warning-box aesthetic */}
      <p style={{
        fontFamily: "'Lexend', sans-serif",
        fontWeight: 200,
        fontSize: "clamp(0.65rem, 1.1vw, 0.76rem)",
        color: "rgba(255,255,255,0.28)",
        letterSpacing: "0.02em",
        textAlign: "center",
        maxWidth: 380,
        lineHeight: 1.65,
        marginBottom: 64,
      }}>
        The tools I use to build things, plus ones I'm learning to build more.
      </p>

      {/* Logo grid */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "clamp(28px, 5vw, 64px)", maxWidth: 720 }}>
        {TOOLS.map((tool, i) => (
          <ToolTile key={tool.id} tool={tool} index={i} />
        ))}
      </div>

      <p style={{ marginTop: 72, fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 8, letterSpacing: "0.32em", color: "rgba(255,255,255,0.07)", textTransform: "uppercase" }}>
        Hover to reveal
      </p>
    </section>
  );
}

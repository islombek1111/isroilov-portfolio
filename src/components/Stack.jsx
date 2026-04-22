import { useState } from "react";
import { motion } from "framer-motion";

// ─── Tool data ────────────────────────────────────────────────────────────────
// Each tool has a CDN logo URL and its name.
// SVG logos are used where possible for crisp rendering at all sizes.
const TOOLS = [
  {
    id: "figma",
    name: "Figma",
    // Official Microsoft Power BI icon via SimpleIcons CDN
    src: "https://cdn.simpleicons.org/figma/F24E1E",
    color: "##F24E1E",
  },
  {
    id: "appsscript",
    name: "Apps Script",
    src: "https://cdn.simpleicons.org/googleappsscript/4285F4",
    color: "#4285F4",
  },
  {
    id: "notion",
    name: "Notion",
    src: "https://cdn.simpleicons.org/notion/FFFFFF",
    color: "#FFFFFF",
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
    // No SimpleIcons entry for VBA — use a clean text badge rendered inline
    src: null,
    color: "#78C150",
  },
];

const floatVariants = {
  animate: (i) => ({
    y: [0, -10, 0],
    transition: {
      duration: 3.5 + i * 0.4,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 0.5,
    },
  }),
};

// ─── Single logo tile ─────────────────────────────────────────────────────────
function ToolTile({ tool, index }) {
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      custom={index}
      variants={floatVariants}
      animate="animate"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onTouchStart={() => setHov(true)}
      onTouchEnd={() => setHov(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        cursor: "default",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Logo container */}
      <motion.div
        animate={{
          scale: hov ? 1.22 : 1,
          opacity: hov ? 1 : 0.38,
        }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 72,
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {tool.src ? (
          <img
            src={tool.src}
            alt={tool.name}
            draggable={false}
            style={{
              width: 56,
              height: 56,
              objectFit: "contain",
              display: "block",
              // B&W default → color on hover via filter
              filter: hov
                ? "grayscale(0%) brightness(1)"
                : "grayscale(1) brightness(0.9)",
              transition: "filter 0.4s ease",
              // mix-blend-mode removes any white backgrounds from logo PNGs
              mixBlendMode: "screen",
            }}
          />
        ) : (
          // VBA — rendered as a text badge since no icon exists
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              border: hov
                ? `1px solid ${tool.color}`
                : "1px solid rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "border-color 0.4s ease",
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.06em",
                color: hov ? tool.color : "rgba(255,255,255,0.5)",
                transition: "color 0.4s ease",
              }}
            >
              VBA
            </span>
          </div>
        )}
      </motion.div>

      {/* Name label */}
      <motion.span
        animate={{ opacity: hov ? 0.85 : 0.2 }}
        transition={{ duration: 0.35 }}
        style={{
          fontFamily: "JetBrains Mono, Courier New, monospace",
          fontSize: 9,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "white",
        }}
      >
        {tool.name}
      </motion.span>
    </motion.div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
export default function Stack() {
  return (
    <section
      id="notes"
      style={{
        background: "#000",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 72,
        }}
      >
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.15)" }} />
        <span
          style={{
            fontFamily: "JetBrains Mono, Courier New, monospace",
            fontSize: 10,
            letterSpacing: "0.38em",
            color: "rgba(255,255,255,0.2)",
            textTransform: "uppercase",
          }}
        >
          Stack
        </span>
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.15)" }} />
      </div>

      {/* Logo grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "clamp(32px, 6vw, 72px)",
          maxWidth: 700,
        }}
      >
        {TOOLS.map((tool, i) => (
          <ToolTile key={tool.id} tool={tool} index={i} />
        ))}
      </div>

      {/* Subtle hint */}
      <p
        style={{
          marginTop: 80,
          fontFamily: "JetBrains Mono, Courier New, monospace",
          fontSize: 8,
          letterSpacing: "0.32em",
          color: "rgba(255,255,255,0.08)",
          textTransform: "uppercase",
        }}
      >
        Tools I use
      </p>
    </section>
  );
}

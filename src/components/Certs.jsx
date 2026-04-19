import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Cert data ───────────────────────────────────────────────
// Each org has: id, name, logo path, and one or more certs.
// For IELTS, each cert has a score shown on hover.
const CERTS = [
  {
    id: "google",
    name: "Google",
    logo: "/images/logos/google-logo.png",
    certs: [
      { img: "/images/certs/Google.jpg", title: "Data Analytics Professional Certificate" },
    ],
  },
  {
    id: "powerbi",
    name: "Microsoft",
    logo: "/images/logos/powerbi-logo.png",
    certs: [
      { img: "/images/certs/PowerBI.jpg", title: "Power BI — DAX Language" },
    ],
  },
  {
    id: "cfi",
    name: "CFI",
    logo: "/images/logos/cfi-logo.png",
    certs: [
      { img: "/images/certs/CFI.jpg", title: "Financial Modeling & Valuation Analyst" },
    ],
  },
  {
    id: "ielts",
    name: "IELTS",
    logo: "/images/logos/IELTS-logo.png",
    certs: [
      { img: "/images/certs/IELTS1.jpg", title: "IELTS Academic", score: "7.5" },
      { img: "/images/certs/IELTS2.jpg", title: "IELTS Academic", score: "6.5" },
      { img: "/images/certs/IELTS3.jpg", title: "IELTS Academic", score: "6.0" },
    ],
  },
];

const ease = [0.16, 1, 0.3, 1];

export default function Certs() {
  const [active, setActive] = useState(null); // id of selected org
  const [hoveredLogo, setHoveredLogo] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const sectionRef = useRef(null);

  const activeCert = CERTS.find((c) => c.id === active);
  const isOpen = active !== null;

  function toggle(id) {
    setActive((prev) => (prev === id ? null : id));
    setHoveredCard(null);
  }

  return (
    <section
      id="certs"
      ref={sectionRef}
      style={{ background: "#000", minHeight: "100vh", overflow: "hidden" }}
      className="relative flex flex-col items-center justify-center py-24 px-4"
    >
      {/* ── Ambient glow behind cert cards ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(255,255,255,0.03) 0%, transparent 100%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Section eyebrow ── */}
      <motion.div
        animate={{ opacity: isOpen ? 0 : 1, y: isOpen ? -12 : 0 }}
        transition={{ duration: 0.6, ease }}
        style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, zIndex: 10, position: "relative" }}
      >
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.18)" }} />
        <span style={{
          fontFamily: "JetBrains Mono, Courier New, monospace",
          fontSize: 10,
          letterSpacing: "0.38em",
          color: "rgba(255,255,255,0.22)",
          textTransform: "uppercase",
        }}>
          Credentials
        </span>
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.18)" }} />
      </motion.div>

      {/* ── Section title ── */}
      <motion.h2
        animate={{ opacity: isOpen ? 0 : 1, y: isOpen ? -16 : 0, scale: isOpen ? 0.96 : 1 }}
        transition={{ duration: 0.7, ease }}
        style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontWeight: 300,
          fontSize: "clamp(2.8rem, 8vw, 6rem)",
          letterSpacing: "0.14em",
          color: "white",
          marginBottom: 72,
          position: "relative",
          zIndex: 10,
          lineHeight: 1,
        }}
      >
        Certs
      </motion.h2>

      {/* ══ LOGO ROW ══════════════════════════════════════════ */}
      <motion.div
        animate={{
          y: isOpen ? -20 : 0,
          scale: isOpen ? 0.78 : 1,
          marginBottom: isOpen ? 0 : 0,
        }}
        transition={{ duration: 0.9, ease }}
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 48,
          zIndex: 20,
          position: "relative",
        }}
      >
        {CERTS.map((org) => {
          const isActive = active === org.id;
          const isDimmed = isOpen && !isActive;
          const isHov    = hoveredLogo === org.id;

          return (
            <motion.button
              key={org.id}
              onClick={() => toggle(org.id)}
              onMouseEnter={() => setHoveredLogo(org.id)}
              onMouseLeave={() => setHoveredLogo(null)}
              animate={{
                opacity: isDimmed ? 0.12 : 1,
                scale: isActive ? 1.08 : isHov ? 1.06 : 1,
              }}
              transition={{ duration: 0.5, ease }}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                position: "relative",
              }}
            >
              {/* Logo image */}
              <div style={{
                width: 64,
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}>
                <img
                  src={org.logo}
                  alt={org.name}
                  onError={(e) => { e.target.style.display = "none"; }}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    // B&W treatment: invert makes dark logos white, then grayscale keeps it neutral
                    filter: isActive
                      ? "grayscale(1) invert(1) brightness(1.1) contrast(1.2)"
                      : isHov
                      ? "grayscale(1) invert(1) brightness(0.95) contrast(1.1)"
                      : "grayscale(1) invert(1) brightness(0.6) contrast(1.05)",
                    transition: "filter 0.5s ease",
                    display: "block",
                  }}
                />
              </div>

              {/* Org name label */}
              <span style={{
                fontFamily: "JetBrains Mono, Courier New, monospace",
                fontSize: 9,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: isActive
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(255,255,255,0.2)",
                transition: "color 0.4s ease",
              }}>
                {org.name}
              </span>

              {/* Active indicator dot */}
              <motion.div
                animate={{ opacity: isActive ? 1 : 0, scaleX: isActive ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: "absolute",
                  bottom: -18,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 20,
                  height: 1,
                  background: "rgba(255,255,255,0.5)",
                  transformOrigin: "center",
                }}
              />
            </motion.button>
          );
        })}
      </motion.div>

      {/* ══ CERT CARDS ════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {isOpen && activeCert && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 60, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.8, ease }}
            style={{
              marginTop: 72,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 20,
              width: "100%",
              maxWidth: 1100,
              zIndex: 10,
              position: "relative",
            }}
          >
            {activeCert.certs.map((cert, idx) => {
              const isCardHov = hoveredCard === `${active}-${idx}`;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease }}
                  onMouseEnter={() => setHoveredCard(`${active}-${idx}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    cursor: "default",
                  }}
                >
                  {/* Outer glow border */}
                  <motion.div
                    animate={{
                      boxShadow: isCardHov
                        ? "0 0 0 1px rgba(255,255,255,0.22), 0 32px 80px rgba(0,0,0,0.95)"
                        : "0 0 0 1px rgba(255,255,255,0.06), 0 16px 48px rgba(0,0,0,0.85)",
                    }}
                    transition={{ duration: 0.5 }}
                    style={{ borderRadius: 6, overflow: "hidden" }}
                  >
                    {/* Card inner */}
                    <div style={{ position: "relative", background: "#0a0a0a" }}>
                      {/* Cert image */}
                      <motion.img
                        src={cert.img}
                        alt={cert.title}
                        loading="lazy"
                        animate={{
                          filter: isCardHov && cert.score
                            ? "grayscale(1) brightness(0.25) blur(2px)"
                            : "grayscale(1) brightness(0.88) contrast(1.05)",
                          scale: isCardHov ? 1.03 : 1,
                        }}
                        transition={{ duration: 0.6 }}
                        style={{
                          height: "clamp(260px, 35vw, 420px)",
                          width: "auto",
                          display: "block",
                          objectFit: "contain",
                          maxWidth: "420px",
                        }}
                      />

                      {/* Score reveal (IELTS only) */}
                      {cert.score && (
                        <motion.div
                          animate={{ opacity: isCardHov ? 1 : 0 }}
                          transition={{ duration: 0.4 }}
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                            gap: 8,
                          }}
                        >
                          <span style={{
                            fontFamily: "Cormorant Garamond, Georgia, serif",
                            fontSize: "clamp(4rem,10vw,7rem)",
                            fontWeight: 200,
                            color: "white",
                            letterSpacing: "0.04em",
                            lineHeight: 1,
                          }}>
                            {cert.score}
                          </span>
                          <span style={{
                            fontFamily: "JetBrains Mono, Courier New, monospace",
                            fontSize: 9,
                            letterSpacing: "0.3em",
                            color: "rgba(255,255,255,0.35)",
                            textTransform: "uppercase",
                          }}>
                            Overall Band
                          </span>
                        </motion.div>
                      )}

                      {/* Bottom title strip */}
                      <motion.div
                        animate={{ y: isCardHov ? 0 : "100%" }}
                        transition={{ duration: 0.45, ease }}
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "14px 16px",
                          background: "rgba(0,0,0,0.75)",
                          backdropFilter: "blur(12px)",
                          borderTop: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <p style={{
                          fontFamily: "JetBrains Mono, Courier New, monospace",
                          fontSize: 9,
                          letterSpacing: "0.26em",
                          color: "rgba(255,255,255,0.55)",
                          textTransform: "uppercase",
                          textAlign: "center",
                          margin: 0,
                        }}>
                          {cert.title}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Card index number */}
                  {activeCert.certs.length > 1 && (
                    <div style={{
                      position: "absolute",
                      top: -20,
                      right: 0,
                      fontFamily: "JetBrains Mono, Courier New, monospace",
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      color: "rgba(255,255,255,0.18)",
                    }}>
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Close / hint text ── */}
      <AnimatePresence>
        {isOpen ? (
          <motion.button
            key="close"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => setActive(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              marginTop: 52,
              fontFamily: "JetBrains Mono, Courier New, monospace",
              fontSize: 9,
              letterSpacing: "0.4em",
              color: "rgba(255,255,255,0.18)",
              textTransform: "uppercase",
              transition: "color 0.3s",
              zIndex: 20,
              position: "relative",
            }}
            onMouseEnter={(e) => (e.target.style.color = "rgba(255,255,255,0.55)")}
            onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.18)")}
          >
            [ close ]
          </motion.button>
        ) : (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              marginTop: 56,
              fontFamily: "JetBrains Mono, Courier New, monospace",
              fontSize: 9,
              letterSpacing: "0.32em",
              color: "rgba(255,255,255,0.13)",
              textTransform: "uppercase",
            }}
          >
            Select an organisation
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

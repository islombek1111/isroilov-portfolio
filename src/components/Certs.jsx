import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    id: "microsoft",
    name: "Microsoft",
    logo: "/images/logos/microsoft-logo.png",
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

// ── Floating logo with shimmer glow + autonomous float ──────
function FloatingLogo({ org, isActive, isDimmed, isOpen, onClick }) {
  const [hov, setHov] = useState(false);
  const idx = CERTS.findIndex((c) => c.id === org.id);
  const floatDuration = 3.8 + idx * 0.55;
  const floatDelay = idx * 0.65;
  const shimmerDuration = 3.2 + idx * 0.45;

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      animate={{
        opacity: isDimmed ? 0.09 : 1,
        scale: isActive ? 1.12 : hov ? 1.07 : 1,
      }}
      transition={{ duration: 0.55, ease }}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        position: "relative",
      }}
    >
      {/* Shimmer disc — only when section is resting */}
      <motion.div
        animate={
          !isOpen
            ? { opacity: [0.0, 0.2, 0.0], scale: [0.7, 1.2, 0.7] }
            : { opacity: 0, scale: 1 }
        }
        transition={{
          duration: shimmerDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatDelay,
        }}
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(22px)",
          zIndex: 0,
        }}
      />

      {/* Floating logo wrapper */}
      <motion.div
        animate={!isOpen ? { y: [0, -8, 0] } : { y: 0 }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatDelay,
        }}
        style={{
          width: 88,
          height: 88,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <img
          src={org.logo}
          alt={org.name}
          onError={(e) => { e.target.style.opacity = "0"; }}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            display: "block",
            // B&W: grayscale + invert turns any colored logo white-on-black
            filter: isActive
              ? "grayscale(1) invert(1) brightness(1.15) contrast(1.3)"
              : hov
              ? "grayscale(1) invert(1) brightness(1.0) contrast(1.15)"
              : "grayscale(1) invert(1) brightness(0.72) contrast(1.1)",
            transition: "filter 0.5s ease",
          }}
        />
      </motion.div>

      {/* Name label */}
      <span
        style={{
          fontFamily: "JetBrains Mono, Courier New, monospace",
          fontSize: 9,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: isActive
            ? "rgba(255,255,255,0.75)"
            : "rgba(255,255,255,0.2)",
          transition: "color 0.4s ease",
          position: "relative",
          zIndex: 1,
        }}
      >
        {org.name}
      </span>

      {/* Active underline */}
      <motion.div
        animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "absolute",
          bottom: -6,
          left: "50%",
          translateX: "-50%",
          width: 22,
          height: 1,
          background: "rgba(255,255,255,0.5)",
          transformOrigin: "center",
        }}
      />
    </motion.button>
  );
}

// ── Horizontal drag-scroll cert strip ──────────────────────
function CertScroller({ certs, activeId, hoveredCard, setHoveredCard }) {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const touchStartX = useRef(0);

  function onMouseDown(e) {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
  }
  function endDrag() {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  }
  function onMouseMove(e) {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeftStart.current - (x - startX.current) * 1.3;
  }
  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchMove(e) {
    const diff = touchStartX.current - e.touches[0].clientX;
    scrollRef.current.scrollLeft += diff * 0.65;
    touchStartX.current = e.touches[0].clientX;
  }

  return (
    <>
      <style>{`.cert-scroll::-webkit-scrollbar { display: none; }`}</style>
      <div
        ref={scrollRef}
        className="cert-scroll"
        onMouseDown={onMouseDown}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 20,
          overflowX: "auto",
          overflowY: "visible",
          cursor: "grab",
          width: "100%",
          padding: "16px 48px 8px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          userSelect: "none",
          WebkitOverflowScrolling: "touch",
          // Centre single cards
          justifyContent: certs.length === 1 ? "center" : "flex-start",
          boxSizing: "border-box",
        }}
      >
        {certs.map((cert, idx) => {
          const cardKey = `${activeId}-${idx}`;
          const isCardHov = hoveredCard === cardKey;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.55, delay: idx * 0.1, ease }}
              onMouseEnter={() => setHoveredCard(cardKey)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ position: "relative", flexShrink: 0 }}
            >
              {/* idx label */}
              {certs.length > 1 && (
                <div style={{
                  position: "absolute", top: -20, right: 4,
                  fontFamily: "JetBrains Mono, Courier New, monospace",
                  fontSize: 9, letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.18)", zIndex: 2,
                }}>
                  {String(idx + 1).padStart(2, "0")} / {String(certs.length).padStart(2, "0")}
                </div>
              )}

              {/* Card shell */}
              <motion.div
                animate={{
                  boxShadow: isCardHov
                    ? "0 0 0 1px rgba(255,255,255,0.22), 0 40px 90px rgba(0,0,0,0.95)"
                    : "0 0 0 1px rgba(255,255,255,0.07), 0 16px 50px rgba(0,0,0,0.8)",
                }}
                transition={{ duration: 0.5 }}
                style={{ borderRadius: 8, overflow: "hidden", background: "#080808", position: "relative" }}
              >
                {/* FIX 5: cert image in full color — no grayscale */}
                <motion.img
                  src={cert.img}
                  alt={cert.title}
                  loading="lazy"
                  draggable={false}
                  animate={{
                    filter: isCardHov && cert.score
                      ? "brightness(0.18) blur(3px)"
                      : "brightness(1) saturate(1)",
                    scale: isCardHov ? 1.04 : 1,
                  }}
                  transition={{ duration: 0.55 }}
                  style={{
                    // FIX 4: fit in viewport
                    height: "clamp(240px, 36vh, 400px)",
                    width: "auto",
                    maxWidth: "440px",
                    display: "block",
                    objectFit: "contain",
                    pointerEvents: "none",
                  }}
                />

                {/* FIX 3: IELTS score in Lexend */}
                {cert.score && (
                  <motion.div
                    animate={{ opacity: isCardHov ? 1 : 0 }}
                    transition={{ duration: 0.38 }}
                    style={{
                      position: "absolute", inset: 0,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      pointerEvents: "none", gap: 10,
                    }}
                  >
                    <span style={{
                      fontFamily: "'Lexend', sans-serif",
                      fontSize: "clamp(4rem, 10vw, 7rem)",
                      fontWeight: 200,
                      color: "white",
                      letterSpacing: "-0.01em",
                      lineHeight: 1,
                    }}>
                      {cert.score}
                    </span>
                    <span style={{
                      fontFamily: "'Lexend', sans-serif",
                      fontWeight: 300,
                      fontSize: 10,
                      letterSpacing: "0.32em",
                      color: "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                    }}>
                      Overall Band
                    </span>
                  </motion.div>
                )}

                {/* Title strip slides up on hover */}
                <motion.div
                  animate={{ y: isCardHov ? 0 : "110%" }}
                  transition={{ duration: 0.42, ease }}
                  style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "15px 18px",
                    background: "rgba(0,0,0,0.84)",
                    backdropFilter: "blur(14px)",
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p style={{
                    fontFamily: "JetBrains Mono, Courier New, monospace",
                    fontSize: 9, letterSpacing: "0.26em",
                    color: "rgba(255,255,255,0.62)",
                    textTransform: "uppercase",
                    textAlign: "center", margin: 0,
                  }}>
                    {cert.title}
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* FIX 7: drag hint, no arrows */}
      {certs.length > 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            textAlign: "center",
            fontFamily: "JetBrains Mono, Courier New, monospace",
            fontSize: 8, letterSpacing: "0.3em",
            color: "rgba(255,255,255,0.1)",
            textTransform: "uppercase",
            marginTop: 12,
          }}
        >
          drag to explore
        </motion.p>
      )}
    </>
  );
}

// ── Root component ──────────────────────────────────────────
export default function Certs() {
  const [active, setActive] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const sectionRef = useRef(null);

  const activeCert = CERTS.find((c) => c.id === active);
  const isOpen = active !== null;

  function toggle(id) {
    const opening = active !== id;
    setActive(opening ? id : null);
    setHoveredCard(null);
    // FIX 4: scroll section top into view when opening
    if (opening) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  }

  return (
    <section
      id="certs"
      ref={sectionRef}
      style={{
        background: "#000",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // FIX 4: start near top, not dead-center, so certs are visible
        justifyContent: isOpen ? "flex-start" : "center",
        overflow: "hidden",
        padding: isOpen ? "72px 0 40px" : "0 0 0",
        transition: "padding 0.8s cubic-bezier(0.16,1,0.3,1)",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Ambient glow */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse 55% 35% at 50% 50%, rgba(255,255,255,0.025) 0%, transparent 100%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* FIX 1: no "Certs" heading — only eyebrow label */}
      <motion.div
        animate={{ opacity: isOpen ? 0 : 1, y: isOpen ? -10 : 0 }}
        transition={{ duration: 0.55, ease }}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 60, zIndex: 10, position: "relative",
          pointerEvents: isOpen ? "none" : "auto",
        }}
      >
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.15)" }} />
        <span style={{
          fontFamily: "JetBrains Mono, Courier New, monospace",
          fontSize: 10, letterSpacing: "0.38em",
          color: "rgba(255,255,255,0.2)", textTransform: "uppercase",
        }}>
          Credentials
        </span>
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.15)" }} />
      </motion.div>

      {/* ── FIX 2: Bigger logos (88px) with float + shimmer ── */}
      <motion.div
        animate={{ scale: isOpen ? 0.7 : 1, y: isOpen ? 0 : 0 }}
        transition={{ duration: 0.85, ease }}
        style={{
          display: "flex", flexWrap: "wrap",
          justifyContent: "center", gap: 56,
          zIndex: 20, position: "relative", padding: "0 24px",
        }}
      >
        {CERTS.map((org) => (
          <FloatingLogo
            key={org.id}
            org={org}
            isActive={active === org.id}
            isDimmed={isOpen && active !== org.id}
            isOpen={isOpen}
            onClick={() => toggle(org.id)}
          />
        ))}
      </motion.div>

      {/* ── Cert cards ── */}
      <AnimatePresence mode="wait">
        {isOpen && activeCert && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.75, ease }}
            style={{
              width: "100%", marginTop: 44,
              position: "relative", zIndex: 10,
            }}
          >
            <CertScroller
              certs={activeCert.certs}
              activeId={active}
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIX 6: Premium "Close Archive" pill button / idle hint */}
      <AnimatePresence>
        {isOpen ? (
          <motion.button
            key="close"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            onClick={() => setActive(null)}
            style={{
              marginTop: 32,
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 26px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 9999,
              background: "transparent",
              cursor: "pointer",
              fontFamily: "JetBrains Mono, Courier New, monospace",
              fontSize: 10, letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.42)",
              textTransform: "uppercase",
              position: "relative", zIndex: 20,
              transition: "border-color 0.3s ease, color 0.3s ease, background 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.38)";
              e.currentTarget.style.color = "rgba(255,255,255,0.88)";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "rgba(255,255,255,0.42)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "rgba(255,255,255,0.38)",
              display: "inline-block", flexShrink: 0,
            }} />
            Close Archive
          </motion.button>
        ) : (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              marginTop: 56,
              fontFamily: "JetBrains Mono, Courier New, monospace",
              fontSize: 9, letterSpacing: "0.32em",
              color: "rgba(255,255,255,0.1)",
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

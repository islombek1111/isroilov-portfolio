import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CERTS = [
  { id: "google",    name: "Google",    logo: "/images/logos/google-logo.png",    certs: [{ img: "/images/certs/Google.jpg",  title: "Data Analytics Professional Certificate" }] },
  { id: "microsoft", name: "Microsoft", logo: "/images/logos/microsoft-logo.png", certs: [{ img: "/images/certs/PowerBI.jpg", title: "Power BI — DAX Language" }] },
  { id: "cfi",       name: "CFI",       logo: "/images/logos/cfi-logo.png",       certs: [{ img: "/images/certs/CFI.jpg",     title: "Financial Modeling & Valuation Analyst" }] },
  { id: "ielts",     name: "IELTS",     logo: "/images/logos/IELTS-logo.png",     certs: [
    { img: "/images/certs/IELTS3.jpg", title: "IELTS Academic", score: "6.0" },
    { img: "/images/certs/IELTS2.jpg", title: "IELTS Academic", score: "6.5" },
    { img: "/images/certs/IELTS1.jpg", title: "IELTS Academic", score: "7.5" },
  ]},
];

const ease = [0.16, 1, 0.3, 1];
function lerp(a, b, t) { return a + (b - a) * t; }

// ── Premium zoom button ───────────────────────────────────────
function ZoomToggleButton({ zoomOn, onToggle }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={zoomOn ? "Zoom off" : "Zoom on"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "9px 20px", borderRadius: 9999, border: "none",
        cursor: "pointer", background: "transparent", position: "relative",
        outline: "none", WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
        transition: "transform 0.2s ease", transform: hov ? "scale(1.04)" : "scale(1)",
      }}
    >
      <span style={{
        position: "absolute", inset: 0, borderRadius: 9999,
        background: zoomOn
          ? "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.35) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.14) 100%)",
        padding: 1,
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor", maskComposite: "exclude", transition: "background 0.4s ease",
      }} />
      <span style={{
        position: "absolute", inset: 0, borderRadius: 9999,
        background: zoomOn ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.02)",
        transition: "background 0.4s ease",
      }} />
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ position: "relative", zIndex: 1 }}>
        <rect x="1" y="1" width="18" height="18" rx="3" stroke={zoomOn ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.42)"} strokeWidth="1.4"/>
        <rect x="5" y="5" width="10" height="10" rx="1.5" stroke={zoomOn ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.42)"} strokeWidth="1.4"/>
        <circle cx="10" cy="10" r="1.2" fill={zoomOn ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.42)"} />
      </svg>
      <span style={{
        position: "relative", zIndex: 1, fontFamily: "JetBrains Mono, Courier New, monospace",
        fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
        color: zoomOn ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.35)", transition: "color 0.4s ease",
      }}>
        {zoomOn ? "Zoom · ON" : "Zoom · OFF"}
      </span>
    </button>
  );
}

// ── Per-image zoom lens (self-contained, mounted inside each image wrapper) ──
// This fixes the bug: each image has its OWN lens element, so there is no
// shared ref confusion when the cursor moves between different cert images.
function ZoomLens({ imgSrc, imgEl }) {
  const lensRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const display = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);
  const running = useRef(false);

  const LENS = 110;
  const ZOOM = 3.2;

  const startLoop = useCallback(() => {
    if (running.current) return;
    running.current = true;
    const tick = () => {
      if (!lensRef.current || !imgEl) { running.current = false; return; }
      display.current.x = lerp(display.current.x, target.current.x, 0.14);
      display.current.y = lerp(display.current.y, target.current.y, 0.14);
      const { x, y } = display.current;
      const W = imgEl.offsetWidth;
      const H = imgEl.offsetHeight;
      const half = LENS / 2;
      const cx = Math.max(half, Math.min(W - half, x));
      const cy = Math.max(half, Math.min(H - half, y));
      lensRef.current.style.left = (cx - half) + "px";
      lensRef.current.style.top = (cy - half) + "px";
      lensRef.current.style.backgroundPosition = `${-(cx * ZOOM - half)}px ${-(cy * ZOOM - half)}px`;
      lensRef.current.style.backgroundSize = `${W * ZOOM}px ${H * ZOOM}px`;
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
  }, [imgEl]);

  const stopLoop = useCallback(() => {
    running.current = false;
    if (rafId.current) cancelAnimationFrame(rafId.current);
  }, []);

  useEffect(() => () => stopLoop(), [stopLoop]);

  // Expose imperative API via ref so parent can call show/hide/move
  // Instead, we use a custom event system on the parent div.
  // The parent div's onMouseMove calls updateTarget, onMouseEnter shows lens.
  const [visible, setVisible] = useState(false);

  // Attach to parent wrapper via passed-in wrapperRef pattern
  // We call these from the wrapper's event handlers (passed as props below)
  ZoomLens.instances = ZoomLens.instances || new Map();

  useEffect(() => {
    // Store ref so parent image wrapper can call show/hide/move
    return () => {};
  }, []);

  function show(x, y) {
    display.current = { x, y };
    target.current = { x, y };
    setVisible(true);
    startLoop();
  }
  function hide() {
    setVisible(false);
    stopLoop();
  }
  function move(x, y) {
    target.current = { x, y };
  }

  // Expose via forwarded ref pattern (we use a callback approach instead)
  ZoomLens._api = { show, hide, move }; // overwritten per instance — use lensApiRef below

  return (
    <div
      ref={lensRef}
      style={{
        display: visible ? "block" : "none",
        position: "absolute",
        width: LENS, height: LENS,
        borderRadius: 12,
        pointerEvents: "none",
        zIndex: 50,
        backgroundImage: `url(${imgSrc})`,
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.28)",
        boxShadow: "0 0 0 3px rgba(0,0,0,0.65), 0 16px 48px rgba(0,0,0,0.9), inset 0 0 12px rgba(0,0,0,0.25)",
        transition: "opacity 0.15s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "28%", background: "linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)", borderRadius: "12px 12px 0 0", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.35) 100%)", zIndex: 3, pointerEvents: "none" }} />
    </div>
  );
}

// ── Single cert image wrapper with its own lens ───────────────
function CertImageWithZoom({ cert, zoomOn, isHov }) {
  const imgRef = useRef(null);
  const lensApiRef = useRef(null);
  const [lensKey, setLensKey] = useState(0); // force remount on img change

  // We use a simpler approach: manage lens state inside this component
  const lensTargetRef = useRef({ x: 0, y: 0 });
  const lensDisplayRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const runningRef = useRef(false);
  const lensElRef = useRef(null);
  const [lensVisible, setLensVisible] = useState(false);

  const LENS = 110;
  const ZOOM = 3.2;

  function startLoop() {
    if (runningRef.current) return;
    runningRef.current = true;
    const tick = () => {
      const lensEl = lensElRef.current;
      const imgEl = imgRef.current;
      if (!lensEl || !imgEl) { runningRef.current = false; return; }
      lensDisplayRef.current.x = lerp(lensDisplayRef.current.x, lensTargetRef.current.x, 0.14);
      lensDisplayRef.current.y = lerp(lensDisplayRef.current.y, lensTargetRef.current.y, 0.14);
      const { x, y } = lensDisplayRef.current;
      const W = imgEl.offsetWidth;
      const H = imgEl.offsetHeight;
      const half = LENS / 2;
      const cx = Math.max(half, Math.min(W - half, x));
      const cy = Math.max(half, Math.min(H - half, y));
      lensEl.style.left = (cx - half) + "px";
      lensEl.style.top = (cy - half) + "px";
      lensEl.style.backgroundPosition = `${-(cx * ZOOM - half)}px ${-(cy * ZOOM - half)}px`;
      lensEl.style.backgroundSize = `${W * ZOOM}px ${H * ZOOM}px`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function stopLoop() {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  useEffect(() => {
    if (!zoomOn) {
      setLensVisible(false);
      stopLoop();
    }
    return stopLoop;
  }, [zoomOn]);

  function handleMouseEnter(e) {
    if (!zoomOn || !imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    lensTargetRef.current = { x, y };
    lensDisplayRef.current = { x, y };
    setLensVisible(true);
    startLoop();
  }

  function handleMouseMove(e) {
    if (!zoomOn || !imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect();
    lensTargetRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function handleMouseLeave() {
    setLensVisible(false);
    stopLoop();
  }

  return (
    <div
      style={{ position: "relative", display: "inline-block", lineHeight: 0, cursor: zoomOn ? "crosshair" : "default" }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        ref={imgRef}
        src={cert.img}
        alt={cert.title}
        loading="lazy"
        draggable={false}
        className="cert-img"
        style={{
          height: "clamp(210px, 32vh, 390px)",
          width: "auto",
          maxWidth: 340,
          display: "block",
          objectFit: "contain",
          userSelect: "none",
          filter: isHov && cert.score && !zoomOn ? "brightness(0.15) blur(3px)" : "brightness(1) saturate(1)",
          transform: isHov && !zoomOn ? "scale(1.03)" : "scale(1)",
          transition: "filter 0.5s ease, transform 0.5s ease",
          pointerEvents: "none",
        }}
      />

      {/* Lens — lives INSIDE the image wrapper so position:absolute is relative to the image */}
      {zoomOn && (
        <div
          ref={lensElRef}
          style={{
            display: lensVisible ? "block" : "none",
            position: "absolute",
            width: LENS, height: LENS,
            borderRadius: 12,
            pointerEvents: "none",
            zIndex: 50,
            backgroundImage: `url(${cert.img})`,
            backgroundRepeat: "no-repeat",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 0 0 3px rgba(0,0,0,0.65), 0 16px 48px rgba(0,0,0,0.9), inset 0 0 12px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "28%", background: "linear-gradient(to bottom, rgba(255,255,255,0.07), transparent)", borderRadius: "12px 12px 0 0", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.38) 100%)", zIndex: 3, pointerEvents: "none" }} />
        </div>
      )}
    </div>
  );
}

// ── Cert scroller ─────────────────────────────────────────────
function CertScroller({ certs, activeId, hoveredCard, setHoveredCard, zoomOn }) {
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
  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function onTouchMove(e) {
    const diff = touchStartX.current - e.touches[0].clientX;
    scrollRef.current.scrollLeft += diff * 0.7;
    touchStartX.current = e.touches[0].clientX;
  }

  return (
    <>
      <style>{`.cert-scroll::-webkit-scrollbar{display:none}@media(max-width:640px){.cert-img{height:190px!important;max-width:240px!important}}`}</style>
      <div style={{ position: "relative", width: "100%" }}>
        <div
          ref={scrollRef}
          className="cert-scroll"
          onMouseDown={onMouseDown} onMouseUp={endDrag} onMouseLeave={endDrag} onMouseMove={onMouseMove}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove}
          style={{
            display: "flex", justifyContent: "safe center", gap: 16,
            overflowX: "auto", overflowY: "visible",
            cursor: certs.length > 1 ? "grab" : "default",
            width: "100%", padding: "20px 32px 8px",
            scrollbarWidth: "none", msOverflowStyle: "none",
            userSelect: "none", WebkitOverflowScrolling: "touch", boxSizing: "border-box",
          }}
        >
          {certs.map((cert, idx) => {
            const cardKey = activeId + "-" + idx;
            const isCardHov = hoveredCard === cardKey;
            return (
              <div key={idx} style={{ position: "relative", flexShrink: 0, touchAction: "pan-x" }}>
                {certs.length > 1 && (
                  <div style={{ position: "absolute", top: -22, right: 4, fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", zIndex: 2 }}>
                    {String(idx + 1).padStart(2, "0")} / {String(certs.length).padStart(2, "0")}
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: idx * 0.09, ease }}
                  onMouseEnter={() => setHoveredCard(cardKey)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onTouchEnd={() => setHoveredCard(isCardHov ? null : cardKey)}
                >
                  <motion.div
                    animate={{ boxShadow: isCardHov ? "0 0 0 1px rgba(255,255,255,0.2), 0 36px 80px rgba(0,0,0,0.95)" : "0 0 0 1px rgba(255,255,255,0.07), 0 14px 44px rgba(0,0,0,0.8)" }}
                    transition={{ duration: 0.5 }}
                    style={{ borderRadius: 8, overflow: "hidden", background: "#080808", position: "relative" }}
                  >
                    {/* Image with its own embedded zoom lens */}
                    <CertImageWithZoom cert={cert} zoomOn={zoomOn} isHov={isCardHov} />

                    {/* IELTS score overlay */}
                    {cert.score && !zoomOn && (
                      <motion.div animate={{ opacity: isCardHov ? 1 : 0 }} transition={{ duration: 0.35 }}
                        style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", gap: 8 }}>
                        <span style={{ fontFamily: "'Lexend', sans-serif", fontSize: "clamp(3.5rem, 8vw, 6.5rem)", fontWeight: 200, color: "white", letterSpacing: "-0.01em", lineHeight: 1 }}>{cert.score}</span>
                        <span style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 300, fontSize: 10, letterSpacing: "0.32em", color: "rgba(255,255,255,0.38)", textTransform: "uppercase" }}>Overall Band</span>
                      </motion.div>
                    )}

                    {/* Title strip */}
                    <motion.div animate={{ y: isCardHov && !zoomOn ? 0 : "110%" }} transition={{ duration: 0.4, ease }}
                      style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(14px)", borderTop: "1px solid rgba(255,255,255,0.07)", zIndex: 10 }}>
                      <p style={{ fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 9, letterSpacing: "0.24em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", textAlign: "center", margin: 0 }}>{cert.title}</p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {certs.length > 1 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
            style={{ textAlign: "center", fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 8, letterSpacing: "0.3em", color: "rgba(255,255,255,0.1)", textTransform: "uppercase", marginTop: 10 }}>
            drag to explore
          </motion.p>
        )}
      </div>
    </>
  );
}

// ── FloatingLogo ─────────────────────────────────────────────
function FloatingLogo({ org, isActive, isDimmed, isOpen, onClick }) {
  const [hov, setHov] = useState(false);
  const idx = CERTS.findIndex(c => c.id === org.id);
  return (
    <motion.button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      animate={{ opacity: isDimmed ? 0.35 : 1, scale: isActive ? 1.12 : hov ? 1.06 : 1 }}
      transition={{ duration: 0.55, ease }}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, position: "relative", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}>
      <motion.div
        animate={!isOpen ? { opacity: [0, 0.18, 0], scale: [0.7, 1.25, 0.7] } : { opacity: 0, scale: 1 }}
        transition={{ duration: 3.2 + idx * 0.45, repeat: Infinity, ease: "easeInOut", delay: idx * 0.65 }}
        style={{ position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)", width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)", pointerEvents: "none", filter: "blur(24px)", zIndex: 0 }} />
      <motion.div
        animate={!isOpen ? { y: [0, -8, 0] } : { y: 0 }}
        transition={{ duration: 3.8 + idx * 0.55, repeat: Infinity, ease: "easeInOut", delay: idx * 0.65 }}
        style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <img src={org.logo} alt={org.name} onError={e => { e.target.style.opacity = "0"; }}
          style={{
            maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block",
            filter: isActive
              ? "grayscale(1) invert(1) brightness(1.15) contrast(1.3)"
              : isDimmed
              ? "grayscale(1) invert(1) brightness(0.65) contrast(1.05)"
              : hov
              ? "grayscale(1) invert(1) brightness(1.0) contrast(1.15)"
              : "grayscale(1) invert(1) brightness(0.85) contrast(1.1)",
            transition: "filter 0.5s ease",
          }} />
      </motion.div>
      <span style={{ fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", color: isActive ? "rgba(255,255,255,0.85)" : isDimmed ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.45)", transition: "color 0.4s ease", position: "relative", zIndex: 1 }}>{org.name}</span>
      <motion.div animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }} transition={{ duration: 0.4 }}
        style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 22, height: 1, background: "rgba(255,255,255,0.5)", transformOrigin: "center" }} />
    </motion.button>
  );
}

// ── Root ──────────────────────────────────────────────────────
export default function Certs() {
  const [active, setActive] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [zoomOn, setZoomOn] = useState(false);
  const sectionRef = useRef(null);
  const activeCert = CERTS.find(c => c.id === active);
  const isOpen = active !== null;

  function toggle(id) {
    const opening = active !== id;
    setActive(opening ? id : null);
    setHoveredCard(null);
    if (!opening) setZoomOn(false);
    if (opening) setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  return (
    <section id="certs" ref={sectionRef}
      style={{ background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isOpen ? "flex-start" : "center", overflow: "hidden", padding: isOpen ? "clamp(52px,8vh,84px) 0 40px" : "0", transition: "padding 0.8s cubic-bezier(0.16,1,0.3,1)", boxSizing: "border-box", position: "relative", touchAction: "pan-y" }}>

      <AnimatePresence>
        {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.4 }} style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 55% 35% at 50% 50%, rgba(255,255,255,0.025) 0%, transparent 100%)" }} />}
      </AnimatePresence>

      <motion.div animate={{ opacity: isOpen ? 0 : 1, y: isOpen ? -10 : 0 }} transition={{ duration: 0.55, ease }}
        style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 56, zIndex: 10, position: "relative", pointerEvents: isOpen ? "none" : "auto" }}>
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 10, letterSpacing: "0.38em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Credentials</span>
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.15)" }} />
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: 24 }}>
        <motion.div animate={{ scale: isOpen ? 0.68 : 1 }} transition={{ duration: 0.85, ease }}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "clamp(24px, 5vw, 56px)", zIndex: 20, position: "relative", padding: "0 16px", width: "100%" }}>
          {CERTS.map(org => (
            <FloatingLogo key={org.id} org={org} isActive={active === org.id} isDimmed={isOpen && active !== org.id} isOpen={isOpen} onClick={() => toggle(org.id)} />
          ))}
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.4, delay: 0.2 }} style={{ zIndex: 20, position: "relative" }}>
              <ZoomToggleButton zoomOn={zoomOn} onToggle={() => setZoomOn(v => !v)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {isOpen && activeCert && (
          <motion.div key={active} initial={{ opacity: 0, y: 44, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }} transition={{ duration: 0.72, ease }}
            style={{ width: "100%", marginTop: 32, position: "relative", zIndex: 10 }}>
            <CertScroller certs={activeCert.certs} activeId={active} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} zoomOn={zoomOn} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen ? (
          <motion.button key="close" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.5, delay: 0.32 }} onClick={() => { setActive(null); setZoomOn(false); }}
            style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 26px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9999, background: "transparent", cursor: "pointer", fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 10, letterSpacing: "0.22em", color: "rgba(255,255,255,0.42)", textTransform: "uppercase", position: "relative", zIndex: 20, transition: "border-color 0.3s ease, color 0.3s ease, background 0.3s ease", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.38)"; e.currentTarget.style.color = "rgba(255,255,255,0.88)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.42)"; e.currentTarget.style.background = "transparent"; }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.38)", display: "inline-block", flexShrink: 0 }} />
            Close Archive
          </motion.button>
        ) : (
          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ marginTop: 52, fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 9, letterSpacing: "0.32em", color: "rgba(255,255,255,0.1)", textTransform: "uppercase" }}>
            Select an organisation
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

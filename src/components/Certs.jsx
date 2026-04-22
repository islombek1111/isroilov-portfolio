import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CERTS = [
  { id: "google", name: "Google", logo: "/images/logos/google-logo.png", certs: [{ img: "/images/certs/Google.jpg", title: "Data Analytics Professional Certificate" }] },
  { id: "microsoft", name: "Microsoft", logo: "/images/logos/microsoft-logo.png", certs: [{ img: "/images/certs/PowerBI.jpg", title: "Power BI — DAX Language" }] },
  { id: "cfi", name: "CFI", logo: "/images/logos/cfi-logo.png", certs: [{ img: "/images/certs/CFI.jpg", title: "Financial Modeling & Valuation Analyst" }] },
  { id: "ielts", name: "IELTS", logo: "/images/logos/IELTS-logo.png", certs: [
    { img: "/images/certs/IELTS3.jpg", title: "IELTS Academic", score: "6.0" },
    { img: "/images/certs/IELTS2.jpg", title: "IELTS Academic", score: "6.5" },
    { img: "/images/certs/IELTS1.jpg", title: "IELTS Academic", score: "7.5" },
  ]},
];

const ease = [0.16, 1, 0.3, 1];
function lerp(a, b, t) { return a + (b - a) * t; }

function MagnifierIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" />
      <line x1="11" y1="8.5" x2="11" y2="13.5" strokeWidth="1.6" />
      <line x1="8.5" y1="11" x2="13.5" y2="11" strokeWidth="1.6" />
    </svg>
  );
}

function ZoomCard({ cert, isCardHov, cardKey, setHoveredCard, certLength, idx }) {
  const [zoomOn, setZoomOn] = useState(false);
  const [lensVisible, setLensVisible] = useState(false);
  const containerRef = useRef(null);
  const lensRef = useRef(null);
  const imgRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const display = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);
  const running = useRef(false);
  const ZOOM = 2.6;
  const LENS = 144;

  const startLoop = useCallback(() => {
    if (running.current) return;
    running.current = true;
    const tick = () => {
      if (!lensRef.current || !imgRef.current) { running.current = false; return; }
      display.current.x = lerp(display.current.x, target.current.x, 0.13);
      display.current.y = lerp(display.current.y, target.current.y, 0.13);
      const { x, y } = display.current;
      const W = imgRef.current.offsetWidth;
      const H = imgRef.current.offsetHeight;
      const half = LENS / 2;
      const cx = Math.max(half, Math.min(W - half, x));
      const cy = Math.max(half, Math.min(H - half, y));
      lensRef.current.style.left = cx - half + "px";
      lensRef.current.style.top = cy - half + "px";
      lensRef.current.style.backgroundPosition = -(cx * ZOOM - half) + "px " + -(cy * ZOOM - half) + "px";
      lensRef.current.style.backgroundSize = W * ZOOM + "px " + H * ZOOM + "px";
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
  }, []);

  const stopLoop = useCallback(() => {
    running.current = false;
    if (rafId.current) cancelAnimationFrame(rafId.current);
  }, []);

  useEffect(() => () => stopLoop(), [stopLoop]);
  useEffect(() => { if (!zoomOn) { setLensVisible(false); stopLoop(); } }, [zoomOn, stopLoop]);

  function handleMouseMove(e) {
    if (!zoomOn || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function handleMouseEnter(e) {
    if (!zoomOn || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    display.current = { x, y }; target.current = { x, y };
    setLensVisible(true); startLoop();
  }
  function handleMouseLeave() { setLensVisible(false); stopLoop(); }
  function handleImgEnter(e) { if (zoomOn) handleMouseEnter(e); setHoveredCard(cardKey); }
  function handleImgLeave() { handleMouseLeave(); setHoveredCard(null); }

  return (
    <motion.div key={idx}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: idx * 0.09, ease }}
      onTouchEnd={() => setHoveredCard(isCardHov ? null : cardKey)}
      style={{ position: "relative", flexShrink: 0, touchAction: "pan-x" }}
    >
      {certLength > 1 && (
        <div style={{ position: "absolute", top: -22, right: 4, fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", zIndex: 2 }}>
          {String(idx + 1).padStart(2, "0")} / {String(certLength).padStart(2, "0")}
        </div>
      )}
      <motion.div
        animate={{ boxShadow: isCardHov ? "0 0 0 1px rgba(255,255,255,0.2), 0 36px 80px rgba(0,0,0,0.95)" : "0 0 0 1px rgba(255,255,255,0.07), 0 14px 44px rgba(0,0,0,0.8)" }}
        transition={{ duration: 0.5 }}
        style={{ borderRadius: 8, overflow: "hidden", background: "#080808", position: "relative" }}
      >
        <div ref={containerRef} onMouseMove={handleMouseMove}
          style={{ position: "relative", display: "inline-block", lineHeight: 0, cursor: zoomOn ? "crosshair" : "default" }}>
          <motion.img ref={imgRef} src={cert.img} alt={cert.title} loading="lazy" draggable={false} className="cert-img"
            onMouseEnter={handleImgEnter} onMouseLeave={handleImgLeave}
            animate={{ filter: isCardHov && cert.score && !zoomOn ? "brightness(0.15) blur(3px)" : "brightness(1) saturate(1)", scale: isCardHov && !zoomOn ? 1.04 : 1 }}
            transition={{ duration: 0.5 }}
            style={{ height: "clamp(210px, 32vh, 390px)", width: "auto", maxWidth: 340, display: "block", objectFit: "contain", userSelect: "none", pointerEvents: "auto" }}
          />
          {zoomOn && (
            <div ref={lensRef}
              style={{ display: lensVisible ? "block" : "none", position: "absolute", width: LENS, height: LENS, borderRadius: 14, pointerEvents: "none", zIndex: 50, backgroundImage: "url(" + cert.img + ")", backgroundRepeat: "no-repeat", border: "1px solid rgba(255,255,255,0.26)", boxShadow: "0 20px 60px rgba(0,0,0,0.92), 0 4px 20px rgba(0,0,0,0.7), inset 0 0 18px rgba(0,0,0,0.35)", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "28%", background: "linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)", borderRadius: "14px 14px 0 0", pointerEvents: "none", zIndex: 2 }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.42) 100%)", pointerEvents: "none", zIndex: 3 }} />
              <div style={{ position: "absolute", inset: 2, borderRadius: 12, border: "0.5px solid rgba(255,255,255,0.12)", pointerEvents: "none", zIndex: 4 }} />
            </div>
          )}
        </div>
        {cert.score && !zoomOn && (
          <motion.div animate={{ opacity: isCardHov ? 1 : 0 }} transition={{ duration: 0.35 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", gap: 8 }}>
            <span style={{ fontFamily: "'Lexend', sans-serif", fontSize: "clamp(3.5rem, 8vw, 6.5rem)", fontWeight: 200, color: "white", letterSpacing: "-0.01em", lineHeight: 1 }}>{cert.score}</span>
            <span style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 300, fontSize: 10, letterSpacing: "0.32em", color: "rgba(255,255,255,0.38)", textTransform: "uppercase" }}>Overall Band</span>
          </motion.div>
        )}
        <motion.div animate={{ y: isCardHov && !zoomOn ? 0 : "110%" }} transition={{ duration: 0.4, ease }}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(14px)", borderTop: "1px solid rgba(255,255,255,0.07)", zIndex: 10 }}>
          <p style={{ fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 9, letterSpacing: "0.24em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", textAlign: "center", margin: 0 }}>{cert.title}</p>
        </motion.div>
        <button onClick={() => setZoomOn(v => !v)} title={zoomOn ? "Zoom off" : "Zoom in"}
          style={{ position: "absolute", bottom: 10, right: 10, width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, background: zoomOn ? "radial-gradient(circle at 38% 32%, rgba(65,65,65,0.98), rgba(12,12,12,0.98))" : "radial-gradient(circle at 38% 32%, rgba(42,42,42,0.96), rgba(8,8,8,0.96))", boxShadow: zoomOn ? "0 0 0 1px rgba(255,255,255,0.22), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.85), 0 0 12px rgba(255,255,255,0.05)" : "0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.5), 0 4px 14px rgba(0,0,0,0.75)", transition: "box-shadow 0.3s ease, background 0.3s ease", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}>
          <MagnifierIcon active={zoomOn} />
        </button>
      </motion.div>
    </motion.div>
  );
}

function CertScroller({ certs, activeId, hoveredCard, setHoveredCard }) {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const touchStartX = useRef(0);
  function onMouseDown(e) { isDragging.current = true; startX.current = e.pageX - scrollRef.current.offsetLeft; scrollLeftStart.current = scrollRef.current.scrollLeft; scrollRef.current.style.cursor = "grabbing"; }
  function endDrag() { isDragging.current = false; if (scrollRef.current) scrollRef.current.style.cursor = "grab"; }
  function onMouseMove(e) { if (!isDragging.current) return; e.preventDefault(); const x = e.pageX - scrollRef.current.offsetLeft; scrollRef.current.scrollLeft = scrollLeftStart.current - (x - startX.current) * 1.3; }
  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function onTouchMove(e) { const diff = touchStartX.current - e.touches[0].clientX; scrollRef.current.scrollLeft += diff * 0.7; touchStartX.current = e.touches[0].clientX; }
  return (
    <>
      <style>{`.cert-scroll::-webkit-scrollbar{display:none}@media(max-width:640px){.cert-img{height:190px!important;max-width:240px!important}}`}</style>
      <div ref={scrollRef} className="cert-scroll" onMouseDown={onMouseDown} onMouseUp={endDrag} onMouseLeave={endDrag} onMouseMove={onMouseMove} onTouchStart={onTouchStart} onTouchMove={onTouchMove}
        style={{ display: "flex", justifyContent: "safe center", gap: 16, overflowX: "auto", overflowY: "visible", cursor: certs.length > 1 ? "grab" : "default", width: "100%", padding: "20px 32px 8px", scrollbarWidth: "none", msOverflowStyle: "none", userSelect: "none", WebkitOverflowScrolling: "touch", boxSizing: "border-box" }}>
        {certs.map((cert, idx) => {
          const cardKey = activeId + "-" + idx;
          return <ZoomCard key={idx} cert={cert} idx={idx} certLength={certs.length} cardKey={cardKey} isCardHov={hoveredCard === cardKey} setHoveredCard={setHoveredCard} />;
        })}
      </div>
      {certs.length > 1 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          style={{ textAlign: "center", fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 8, letterSpacing: "0.3em", color: "rgba(255,255,255,0.1)", textTransform: "uppercase", marginTop: 10 }}>
          drag to explore
        </motion.p>
      )}
    </>
  );
}

function FloatingLogo({ org, isActive, isDimmed, isOpen, onClick }) {
  const [hov, setHov] = useState(false);
  const idx = CERTS.findIndex(c => c.id === org.id);
  return (
    <motion.button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      animate={{ opacity: isDimmed ? 0.07 : 1, scale: isActive ? 1.1 : hov ? 1.06 : 1 }}
      transition={{ duration: 0.55, ease }}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, position: "relative", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}>
      <motion.div animate={!isOpen ? { opacity: [0, 0.18, 0], scale: [0.7, 1.25, 0.7] } : { opacity: 0, scale: 1 }}
        transition={{ duration: 3.2 + idx * 0.45, repeat: Infinity, ease: "easeInOut", delay: idx * 0.65 }}
        style={{ position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)", width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)", pointerEvents: "none", filter: "blur(24px)", zIndex: 0 }} />
      <motion.div animate={!isOpen ? { y: [0, -8, 0] } : { y: 0 }}
        transition={{ duration: 3.8 + idx * 0.55, repeat: Infinity, ease: "easeInOut", delay: idx * 0.65 }}
        style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <img src={org.logo} alt={org.name} onError={e => { e.target.style.opacity = "0"; }}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block", filter: isActive ? "grayscale(1) invert(1) brightness(1.15) contrast(1.3)" : hov ? "grayscale(1) invert(1) brightness(1.0) contrast(1.15)" : "grayscale(1) invert(1) brightness(0.72) contrast(1.1)", transition: "filter 0.5s ease" }} />
      </motion.div>
      <span style={{ fontFamily: "JetBrains Mono, Courier New, monospace", fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", color: isActive ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)", transition: "color 0.4s ease", position: "relative", zIndex: 1 }}>{org.name}</span>
      <motion.div animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }} transition={{ duration: 0.4 }}
        style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 22, height: 1, background: "rgba(255,255,255,0.5)", transformOrigin: "center" }} />
    </motion.button>
  );
}

export default function Certs() {
  const [active, setActive] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const sectionRef = useRef(null);
  const activeCert = CERTS.find(c => c.id === active);
  const isOpen = active !== null;

  function toggle(id) {
    const opening = active !== id;
    setActive(opening ? id : null);
    setHoveredCard(null);
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
      <motion.div animate={{ scale: isOpen ? 0.68 : 1 }} transition={{ duration: 0.85, ease }}
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "clamp(24px, 5vw, 56px)", zIndex: 20, position: "relative", padding: "0 16px", width: "100%" }}>
        {CERTS.map(org => <FloatingLogo key={org.id} org={org} isActive={active === org.id} isDimmed={isOpen && active !== org.id} isOpen={isOpen} onClick={() => toggle(org.id)} />)}
      </motion.div>
      <AnimatePresence mode="wait">
        {isOpen && activeCert && (
          <motion.div key={active} initial={{ opacity: 0, y: 44, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }} transition={{ duration: 0.72, ease }}
            style={{ width: "100%", marginTop: 40, position: "relative", zIndex: 10 }}>
            <CertScroller certs={activeCert.certs} activeId={active} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen ? (
          <motion.button key="close" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.5, delay: 0.32 }} onClick={() => setActive(null)}
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

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

const PHOTOS = [
  { id: 1, label: "w/Dad", src: "/images/p1.jpg" },
  { id: 2, label: "10km",  src: "/images/p2.jpg" },
  { id: 3, label: "w/Sis", src: "/images/p3.jpg" },
  { id: 4, label: "Sea",   src: "/images/p4.jpg" },
  { id: 5, label: "w/Bro", src: "/images/p5.jpg" },
];

// Fan positions — left to right
const FAN = [
  { rotateY: -35, x: -340, z: -100 },
  { rotateY: -18, x: -170, z:  -50 },
  { rotateY:   0, x:    0, z:    0 },
  { rotateY:  18, x:  170, z:  -50 },
  { rotateY:  35, x:  340, z: -100 },
];

// On mobile: stack cards in a simple centered stack, no 3D
// FAN_MOBILE keeps cards close together so they fit a phone screen
const FAN_MOBILE = [
  { rotateY: -18, x: -120, z: -40 },
  { rotateY:  -9, x:  -60, z: -20 },
  { rotateY:   0, x:    0, z:   0 },
  { rotateY:   9, x:   60, z: -20 },
  { rotateY:  18, x:  120, z: -40 },
];

const spring = { type: "spring", stiffness: 130, damping: 22, mass: 0.9 };

export default function FannedGallery() {
  const [active, setActive] = useState(null); // which card is "focused"

  // Detect mobile (touch) — used to decide fan scale & touch behaviour
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const fan = isMobile ? FAN_MOBILE : FAN;
  const cardW = isMobile ? 140 : 240;
  const cardH = isMobile ? 210 : 360;

  // Toggle active on tap/click
  const handleCardPress = useCallback((id) => {
    setActive((prev) => (prev === id ? null : id));
  }, []);

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .fan-stage { height: 280px !important; perspective: 900px !important; }
        }
        @media (min-width: 768px) {
          .fan-stage { height: 500px !important; perspective: 1800px !important; }
        }
      `}</style>

      <section
        id="pics"
        style={{
          background: "#000000",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          scrollMarginTop: "80px",
          overflowX: "hidden",
          padding: "32px 0",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 24, position: "relative", zIndex: 10,
        }}>
          <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.2)" }} />
          <span style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10, letterSpacing: "0.45em",
            color: "rgba(255,255,255,0.28)", textTransform: "uppercase",
          }}>
            Visual Archive
          </span>
          <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* 3D Stage */}
        <div
          className="fan-stage"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {PHOTOS.map((photo, i) => {
            const f = fan[i];
            const isActive = active === photo.id;
            const isAnyActive = active !== null;
            const isPassive = isAnyActive && !isActive;

            return (
              <motion.div
                key={photo.id}
                // Click / tap handler — works on both desktop and mobile
                onClick={() => handleCardPress(photo.id)}
                // Desktop hover: treat same as active for simplicity + color
                onHoverStart={() => !isMobile && setActive(photo.id)}
                onHoverEnd={() => !isMobile && setActive(null)}
                animate={{
                  rotateY: isActive ? 0 : f.rotateY,
                  x:       isActive ? 0 : f.x,
                  z:       isActive ? (isMobile ? 80 : 250) : f.z,
                  scale:   isActive ? (isMobile ? 1.15 : 1.25) : 1,
                  opacity: isPassive ? 0.15 : 1,
                }}
                transition={spring}
                style={{
                  position: "absolute",
                  width: cardW,
                  height: cardH,
                  transformStyle: "preserve-3d",
                  zIndex: isActive ? 100 : i,
                  cursor: "pointer",
                  // Mobile: remove hover effect bleed
                  WebkitTapHighlightColor: "transparent",
                  touchAction: "manipulation",
                }}
              >
                <div style={{
                  width: "100%", height: "100%",
                  borderRadius: isMobile ? 16 : 24,
                  overflow: "hidden", position: "relative",
                  boxShadow: isActive
                    ? "0 50px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.2)"
                    : "0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
                }}>
                  <img
                    src={photo.src}
                    alt={photo.label}
                    draggable={false}
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover",
                      // FIX: color on active (tap/hover), B&W otherwise
                      // Uses CSS transition — works on both mobile and desktop
                      filter: isActive
                        ? "grayscale(0%) contrast(1.08) brightness(1.0)"
                        : "grayscale(100%) brightness(0.58)",
                      transition: "filter 0.55s ease",
                      // Prevent iOS long-press save dialog
                      WebkitUserSelect: "none",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Label pill — shows when active */}
                  <div style={{
                    position: "absolute", bottom: 16, left: "50%",
                    transform: "translateX(-50%)",
                    padding: "5px 14px",
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 100,
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "white",
                    fontSize: isMobile ? 9 : 10,
                    fontFamily: "JetBrains Mono, monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    whiteSpace: "nowrap",
                    opacity: isActive ? 1 : 0,
                    transition: "opacity 0.3s ease",
                    pointerEvents: "none",
                  }}>
                    {photo.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress dashes */}
        <div style={{ display: "flex", gap: 8, marginTop: 36 }}>
          {PHOTOS.map((p) => (
            <motion.div
              key={p.id}
              animate={{
                width: active === p.id ? 28 : 16,
                background: active === p.id ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.12)",
              }}
              transition={{ duration: 0.3 }}
              style={{ height: 2, borderRadius: 1 }}
            />
          ))}
        </div>

        {/* Hint text */}
        <p style={{
          marginTop: 16,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 8, letterSpacing: "0.3em",
          color: "rgba(255,255,255,0.12)",
          textTransform: "uppercase",
        }}>
          {isMobile ? "tap a card" : "hover a card"}
        </p>
      </section>
    </>
  );
}

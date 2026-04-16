import { useState } from "react";
import { motion } from "framer-motion";

const PHOTOS = [
  { id: 1, label: "w/Dad", src: "/images/p1.jpg" },
  { id: 2, label: "10km", src: "/images/p2.jpg" },
  { id: 3, label: "w/Sis", src: "/images/p3.jpg" },
  { id: 4, label: "Sea", src: "/images/p4.jpg" },
  { id: 5, label: "w/Bro", src: "/images/p5.jpg" },
];

const FAN = [
  { rotateY: -35, x: -340, z: -100 },
  { rotateY: -18, x: -170, z: -50 },
  { rotateY:   0, x:    0, z:   0 },
  { rotateY:  18, x:  170, z: -50 },
  { rotateY:  35, x:  340, z: -100 },
];

export default function FannedGallery() {
  const [hovered, setHovered] = useState(null);

  const smoothTransition = { 
    type: "spring", 
    stiffness: 120, 
    damping: 25, 
    mass: 0.8 
  };

  return (
     <section
      id="pics"
      style={{ 
        background: "#000000", 
        minHeight: "100vh", // Full viewport height
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center", // Ensures vertical centering
        scrollMarginTop: "80px" // Prevents the header from being cut off when clicking the link
      }}
      className="relative overflow-hidden px-4"
    >
      {/* Header Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, position: "relative", zIndex: 10 }}>
        <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.2)" }} />
        <span style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
          letterSpacing: "0.5em",
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
        }}>
          Visual Archive
        </span>
        <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.2)" }} />
      </div>

      {/* 3D Fan Stage */}
      <div style={{
        perspective: "1800px",
        perspectiveOrigin: "50% 50%",
        height: 500,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        {PHOTOS.map((photo, i) => {
          const fan = FAN[i];
          const isHov = hovered === photo.id;
          const isAnyHov = hovered !== null;
          const isPass = isAnyHov && !isHov;

          return (
            <motion.div
              key={photo.id}
              onHoverStart={() => setHovered(photo.id)}
              onHoverEnd={() => setHovered(null)}
              // The "animate" block handles the main Fan logic + Scale
              animate={{
                rotateY: isHov ? 0 : fan.rotateY,
                x: isHov ? 0 : fan.x,
                z: isHov ? 250 : fan.z,
                scale: isHov ? 1.25 : 1,
                opacity: isPass ? 0.15 : 1, // Significant drop for focus
              }}
              // The "whileInView" block handles the continuous smooth drift
              whileInView={!isAnyHov ? {
                x: [fan.x - 30, fan.x + 30, fan.x - 30],
                y: [0, -15, 0],
              } : {}}
              transition={{
                x: !isAnyHov ? { repeat: Infinity, duration: 8, ease: "easeInOut" } : smoothTransition,
                y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                default: smoothTransition
              }}
              style={{
                position: "absolute",
                width: 240,
                height: 360,
                transformStyle: "preserve-3d",
                zIndex: isHov ? 100 : i,
                cursor: "pointer",
              }}
            >
              <div style={{
                width: "100%", height: "100%",
                borderRadius: 24, overflow: "hidden",
                position: "relative",
                boxShadow: isHov
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
                    filter: isHov 
                      ? "grayscale(0%) contrast(1.1)" 
                      : "grayscale(100%) brightness(0.6)",
                    transition: "filter 0.6s ease",
                  }}
                />

                {/* Premium Floating Label */}
                <div style={{
                  position: "absolute", bottom: 20, left: "50%",
                  transform: "translateX(-50%)",
                  padding: "6px 16px",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 100,
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: 10,
                  fontFamily: "JetBrains Mono, monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  opacity: isHov ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  whiteSpace: "nowrap"
                }}>
                  {photo.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Dashes */}
      <div style={{ display: "flex", gap: 10, marginTop: 40 }}>
        {PHOTOS.map((p) => (
          <div 
            key={p.id}
            style={{ 
              width: 20, height: 2, 
              background: hovered === p.id ? "white" : "rgba(255,255,255,0.1)",
              transition: "all 0.3s ease"
            }} 
          />
        ))}
      </div>
    </section>
  );
}
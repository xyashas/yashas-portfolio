"use client";

import { motion } from "framer-motion";

export default function HeroName() {
  return (
    /*
     * inline-flex shrink-wraps to the natural text width.
     * This keeps the gold line directly beneath the name
     * regardless of viewport size, without relying on any
     * parent container's width.
     */
    <div
      className="select-none"
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}
    >
      <motion.h1
        className="font-bebas text-ash-white leading-none tracking-[0.15em]"
        style={{
          fontSize: "clamp(80px, 21vw, 420px)",
          whiteSpace: "nowrap",
          willChange: "opacity, filter",
        }}
        initial={{ opacity: 0, filter: "blur(48px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{
          opacity: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
          filter:  { duration: 1.5, ease: [0.08, 0.92, 0.22, 1] },
        }}
      >
        YASHAS
      </motion.h1>

      {/* Gold accent — width matches the inline-flex container = natural text width */}
      <motion.div
        className="bg-gold"
        style={{
          height: "1px",
          width: "100%",
          transformOrigin: "center center",
          willChange: "transform, opacity",
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{
          delay: 0.85,
          duration: 0.75,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </div>
  );
}

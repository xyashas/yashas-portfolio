"use client";

import { motion } from "framer-motion";

export default function HeroName() {
  return (
    <div className="relative flex flex-col items-center select-none">
      {/* The name — resolves from ink-diffuse to sharp over 1.2s */}
      <motion.h1
        className="font-bebas text-ash-white leading-none tracking-[0.15em]"
        style={{
          fontSize: "clamp(160px, 28vw, 580px)",
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

      {/* Single gold accent line — draws in after name lands */}
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

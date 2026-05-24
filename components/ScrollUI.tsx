"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useScroll } from "@react-three/drei"

// Fade in at [inStart..inEnd], hold, fade out at [outStart..outEnd]
function fade(t: number, inS: number, inE: number, outS: number, outE: number) {
  if (t < inS) return 0
  if (t < inE) return (t - inS) / (inE - inS)
  if (t < outS) return 1
  if (t < outE) return 1 - (t - outS) / (outE - outS)
  return 0
}

export default function ScrollUI() {
  const scroll = useScroll()

  const bioRef      = useRef<HTMLDivElement>(null!)
  const actWorkRef  = useRef<HTMLDivElement>(null!)
  const actConRef   = useRef<HTMLDivElement>(null!)

  useFrame(() => {
    const t = scroll.offset

    // Act 2 bio — in at 27%, hold, out at 47%
    bioRef.current.style.opacity     = String(fade(t, 0.27, 0.33, 0.44, 0.50))
    // Act 3 heading — in at 50%, out at 73%
    actWorkRef.current.style.opacity = String(fade(t, 0.50, 0.56, 0.70, 0.76))
    // Act 4 heading — in at 76%, stays
    actConRef.current.style.opacity  = String(fade(t, 0.76, 0.82, 0.96, 1.01))
  })

  const baseText: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    opacity: 0,
    transition: "none",
  }

  const bebasFont: React.CSSProperties = {
    fontFamily: "var(--font-bebas), sans-serif",
    letterSpacing: "0.12em",
    color: "#e8e6e0",
    textShadow: "0 0 40px rgba(201,168,76,0.3)",
  }

  return (
    // 4 pages × 100vh
    <div style={{ height: "400vh", position: "relative", width: "100vw" }}>

      {/* ── Act 2 — Who Yashas is (top ≈ 130vh = 32.5% of 400vh) ── */}
      <div ref={bioRef} style={{ ...baseText, top: "128vh" }}>
        <p style={{ ...bebasFont, fontSize: "clamp(13px, 1.8vw, 22px)", color: "#9999bb",
                    letterSpacing: "0.28em", marginBottom: "10px" }}>
          FULL-STACK DEVELOPER · CREATIVE TECHNOLOGIST
        </p>
        <h2 style={{ ...bebasFont, fontSize: "clamp(32px, 5vw, 68px)", margin: "0 0 12px",
                     color: "#e8e6e0" }}>
          Building at the intersection<br />of engineering and design.
        </h2>
        <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "clamp(13px, 1.2vw, 16px)",
                    color: "#9999bb", maxWidth: "460px", lineHeight: 1.7, margin: "0 auto" }}>
          Crafting digital experiences that feel alive — from systems architecture
          to motion-rich interfaces.
        </p>
      </div>

      {/* ── Act 3 — Selected Work heading (top ≈ 215vh) ── */}
      <div ref={actWorkRef} style={{ ...baseText, top: "213vh" }}>
        <p style={{ ...bebasFont, fontSize: "clamp(11px, 1.4vw, 16px)", color: "#c9a84c",
                    letterSpacing: "0.35em", marginBottom: "8px" }}>
          SELECTED WORK
        </p>
        <h2 style={{ ...bebasFont, fontSize: "clamp(38px, 6vw, 78px)", margin: 0,
                     color: "#e8e6e0" }}>
          Carved in Stone
        </h2>
      </div>

      {/* ── Act 4 — Contact heading (top ≈ 315vh) ── */}
      <div ref={actConRef} style={{ ...baseText, top: "314vh" }}>
        <p style={{ ...bebasFont, fontSize: "clamp(11px, 1.4vw, 16px)", color: "#c9a84c",
                    letterSpacing: "0.35em", marginBottom: "8px" }}>
          WHAT COMES NEXT
        </p>
        <h2 style={{ ...bebasFont, fontSize: "clamp(38px, 6vw, 78px)", margin: 0,
                     color: "#e8e6e0" }}>
          Leave a Mark
        </h2>
      </div>
    </div>
  )
}

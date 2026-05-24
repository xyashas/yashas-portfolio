"use client"

import { Canvas } from "@react-three/fiber"
import { ScrollControls, Scroll } from "@react-three/drei"
import { Suspense } from "react"
import World from "./World"
import PostEffects from "./PostEffects"
import ScrollUI from "./ScrollUI"

export default function Scene() {
  return (
    <Canvas
      camera={{ fov: 70, near: 0.1, far: 300, position: [0, 1.2, 25] }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      shadows={false}
      style={{ position: "fixed", inset: 0 }}
    >
      <Suspense fallback={null}>
        <ScrollControls pages={4} damping={0.18} distance={1}>
          <World />
          <Scroll html>
            <ScrollUI />
          </Scroll>
        </ScrollControls>
        <PostEffects />
      </Suspense>
    </Canvas>
  )
}

"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useScroll, Text } from "@react-three/drei"
import * as THREE from "three"

export default function RockFormation() {
  const scroll = useScroll()
  const textRef = useRef<THREE.Mesh & { material: THREE.MeshBasicMaterial }>(null!)
  const glowRef = useRef<THREE.PointLight>(null!)

  // Act 1 progress (0→1 as scroll goes 0→0.28)
  const act1 = useRef(0)

  useFrame(() => {
    const t = scroll.offset
    act1.current = Math.min(t / 0.28, 1)
    const p = act1.current

    // Name etched into rock: starts nearly invisible, resolves gold
    if (textRef.current?.material) {
      const c = new THREE.Color()
      c.setRGB(0.788 * p, 0.659 * p, 0.298 * p)
      textRef.current.material.color.copy(c)
    }

    // Point light near the carving flickers on as we approach
    if (glowRef.current) {
      glowRef.current.intensity = p * 1.6
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Main dark rock mass */}
      <mesh position={[0, 3.2, -0.5]} rotation={[0, 0, 0.04]} castShadow={false}>
        <boxGeometry args={[9, 6.5, 1.8]} />
        <meshStandardMaterial color="#0f0f1e" roughness={0.97} metalness={0.06} />
      </mesh>

      {/* Left boulder */}
      <mesh position={[-6.5, 1.5, 0.8]} rotation={[0.1, 0.35, 0.12]}>
        <boxGeometry args={[3.5, 3.2, 2]} />
        <meshStandardMaterial color="#0c0c18" roughness={0.98} metalness={0.02} />
      </mesh>

      {/* Right cluster */}
      <mesh position={[6, 1.0, 0.5]} rotation={[-0.08, -0.25, 0.08]}>
        <boxGeometry args={[4, 2.5, 1.8]} />
        <meshStandardMaterial color="#0e0e1c" roughness={0.99} metalness={0.0} />
      </mesh>

      {/* Smaller foreground rocks */}
      <mesh position={[-3, 0.4, 2]} rotation={[0.05, 0.6, 0.1]}>
        <boxGeometry args={[1.5, 0.9, 1]} />
        <meshStandardMaterial color="#11111f" roughness={0.99} />
      </mesh>
      <mesh position={[4.5, 0.5, 1.8]} rotation={[-0.05, -0.4, -0.08]}>
        <boxGeometry args={[2, 1.1, 1.2]} />
        <meshStandardMaterial color="#0d0d1b" roughness={0.99} />
      </mesh>

      {/* YASHAS — carved into the rock face */}
      <Text
        ref={textRef}
        font="https://fonts.gstatic.com/s/bebas-neue/v9/JTUSjIg69CK48gW7PXoo9Wdhyzbi.woff"
        fontSize={1.9}
        letterSpacing={0.12}
        anchorX="center"
        anchorY="middle"
        position={[0, 3.3, 0.42]}
        color="#000000"   // colour animated in useFrame
      >
        YASHAS
      </Text>

      {/* Warm glow from the carved name */}
      <pointLight
        ref={glowRef}
        position={[0, 3.3, 1.5]}
        color="#c9a84c"
        intensity={0}
        distance={8}
        decay={2}
      />
    </group>
  )
}

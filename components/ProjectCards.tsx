"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useScroll, Html, Text } from "@react-three/drei"
import * as THREE from "three"
import { PROJECTS } from "@/lib/data"

const CARD_POSITIONS: [number, number, number][] = [
  [-5.5, 0, -21],
  [0,    0, -23],
  [5.5,  0, -21],
]

const CARD_ROTATIONS: [number, number, number][] = [
  [0,  0.28, 0],
  [0,  0,    0],
  [0, -0.28, 0],
]

function Card({ project, position, rotation, index }: {
  project: typeof PROJECTS[0]
  position: [number, number, number]
  rotation: [number, number, number]
  index: number
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const lightRef = useRef<THREE.PointLight>(null!)
  const scroll   = useScroll()

  useFrame(() => {
    const t = scroll.offset
    // Appear at act 3 (t≈0.5) — cards rise from ground and gain opacity
    const act3 = Math.max(0, Math.min(1, (t - 0.48 - index * 0.02) / 0.14))
    const targetY = position[1] + act3 * 1.2
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.08
    )
    groupRef.current.position.x = position[0]
    groupRef.current.position.z = position[2]
    if (lightRef.current) lightRef.current.intensity = act3 * 1.0
  })

  return (
    <group ref={groupRef} position={[position[0], position[1] - 2, position[2]]} rotation={rotation}>
      {/* Stone tablet */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[3.6, 4.5, 0.28]} />
        <meshStandardMaterial color="#0f0f22" roughness={0.95} metalness={0.08} />
      </mesh>

      {/* Engraved border */}
      <mesh position={[0, 2.2, 0.15]}>
        <boxGeometry args={[3.2, 4.1, 0.02]} />
        <meshStandardMaterial color="#1a1a35" roughness={0.9} />
      </mesh>

      {/* Warm edge glow light */}
      <pointLight
        ref={lightRef}
        position={[0, 2.2, 1.2]}
        color="#c9a84c"
        intensity={0}
        distance={4.5}
        decay={2}
      />

      {/* Title etched in gold */}
      <Text
        font="/fonts/BebasNeue.woff2"
        fontSize={0.5}
        letterSpacing={0.08}
        color="#c9a84c"
        anchorX="center"
        anchorY="top"
        position={[0, 4.1, 0.16]}
      >
        {project.title}
      </Text>

      {/* HTML card content */}
      <Html
        position={[0, 2.0, 0.16]}
        transform
        occlude
        center
        style={{ pointerEvents: "auto" }}
      >
        <div className="card-inner">
          <h3>{project.title}</h3>
          <p className="category">{project.category}</p>
          <p>{project.description}</p>
          <div className="tags">
            {project.tech.map(t => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>
      </Html>
    </group>
  )
}

export default function ProjectCards() {
  return (
    <>
      {PROJECTS.map((p, i) => (
        <Card
          key={p.id}
          project={p}
          position={CARD_POSITIONS[i]}
          rotation={CARD_ROTATIONS[i]}
          index={i}
        />
      ))}
    </>
  )
}

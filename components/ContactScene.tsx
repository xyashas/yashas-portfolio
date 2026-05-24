"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useScroll, Html, Text } from "@react-three/drei"
import * as THREE from "three"

export default function ContactScene() {
  const groupRef = useRef<THREE.Group>(null!)
  const scroll   = useScroll()

  useFrame(() => {
    const t = scroll.offset
    const act4 = Math.max(0, Math.min(1, (t - 0.75) / 0.25))

    // Fade in with Act 4
    if (groupRef.current) {
      groupRef.current.children.forEach(child => {
        if ((child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
          if (mat.opacity !== undefined) mat.opacity = act4
        }
      })
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, -36]}>
      {/* Torii silhouette — two uprights, one crossbeam */}
      {[[-3.2, 0], [3.2, 0]].map(([x], i) => (
        <mesh key={i} position={[x, 3.5, 0]}>
          <boxGeometry args={[0.18, 7.0, 0.18]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
        </mesh>
      ))}
      {/* Top beam */}
      <mesh position={[0, 7.2, 0]}>
        <boxGeometry args={[7.2, 0.35, 0.35]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
      </mesh>
      {/* Sub-beam */}
      <mesh position={[0, 6.5, 0]}>
        <boxGeometry args={[6.0, 0.22, 0.22]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
      </mesh>

      {/* Ambient gold light */}
      <pointLight position={[0, 4, 2]} color="#c9a84c" intensity={1.2} distance={14} decay={2} />

      {/* GET IN TOUCH */}
      <Text
        font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf"
        fontSize={1.1}
        letterSpacing={0.18}
        color="#e8e6e0"
        anchorX="center"
        anchorY="middle"
        position={[0, 3.6, 0.1]}
      >
        GET IN TOUCH
      </Text>

      {/* Contact HTML — email link */}
      <Html position={[0, 2.4, 0.1]} center transform>
        <div className="contact-inner">
          <a href="mailto:yashasm1299@gmail.com">
            yashasm1299@gmail.com
          </a>
        </div>
      </Html>

      {/* Ground mist plane */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0.35}
          roughness={1}
        />
      </mesh>
    </group>
  )
}

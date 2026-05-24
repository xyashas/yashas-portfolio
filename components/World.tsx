"use client"

import { useMemo, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useScroll } from "@react-three/drei"
import * as THREE from "three"
import GrassField from "./GrassField"
import InkSky from "./InkSky"
import EmberParticles from "./EmberParticles"
import RockFormation from "./RockFormation"
import ProjectCards from "./ProjectCards"
import ContactScene from "./ContactScene"

// ─── Camera & look-at spline ─────────────────────────────────────────────────
const CAM_POINTS = [
  new THREE.Vector3(0, 1.2, 25),
  new THREE.Vector3(0, 1.8, 18),
  new THREE.Vector3(0, 2.2, 10),
  new THREE.Vector3(0, 2.8, 4),
  new THREE.Vector3(2, 3.5, 0),
  new THREE.Vector3(-1, 4.0, -5),
  new THREE.Vector3(0, 4.5, -10),
  new THREE.Vector3(-2, 4.8, -15),
  new THREE.Vector3(0, 5.0, -20),
  new THREE.Vector3(0, 4.5, -26),
  new THREE.Vector3(0, 4.0, -31),
  new THREE.Vector3(0, 3.5, -37),
]

const LOOK_POINTS = [
  new THREE.Vector3(0, 2.0, 8),
  new THREE.Vector3(0, 2.0, 2),
  new THREE.Vector3(0, 2.0, -2),
  new THREE.Vector3(0, 2.0, -6),
  new THREE.Vector3(0, 1.5, -8),
  new THREE.Vector3(0, 2.0, -12),
  new THREE.Vector3(0, 2.0, -16),
  new THREE.Vector3(0, 1.5, -20),
  new THREE.Vector3(0, 2.0, -24),
  new THREE.Vector3(0, 2.0, -29),
  new THREE.Vector3(0, 2.0, -33),
  new THREE.Vector3(0, 1.5, -43),
]

export default function World() {
  const scroll = useScroll()
  const { camera, scene } = useThree()

  const camCurve = useMemo(
    () => new THREE.CatmullRomCurve3(CAM_POINTS, false, "catmullrom", 0.5),
    []
  )
  const lookCurve = useMemo(
    () => new THREE.CatmullRomCurve3(LOOK_POINTS, false, "catmullrom", 0.5),
    []
  )

  const tmpCam = useMemo(() => new THREE.Vector3(), [])
  const tmpLook = useMemo(() => new THREE.Vector3(), [])

  // Warm exponential fog — colour and density driven by scroll
  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x0d0d1c, 0.022)
    return () => { scene.fog = null }
  }, [scene])

  useFrame(() => {
    const t = scroll.offset

    camCurve.getPoint(t, tmpCam)
    lookCurve.getPoint(t, tmpLook)

    camera.position.copy(tmpCam)
    camera.lookAt(tmpLook)

    // Fog: warm dark-amber → deep indigo → near-black as world fades
    if (scene.fog instanceof THREE.FogExp2) {
      const act4 = Math.max(0, (t - 0.72) / 0.28)
      const act2 = Math.max(0, Math.min(1, (t - 0.22) / 0.3))
      scene.fog.color.setRGB(
        THREE.MathUtils.lerp(0.08, 0.02, act4),
        THREE.MathUtils.lerp(0.07, 0.02, act4),
        THREE.MathUtils.lerp(0.14, 0.06, act4) + act2 * 0.04
      )
      scene.fog.density = THREE.MathUtils.lerp(0.022, 0.055, act4)
    }
  })

  return (
    <>
      {/* Lighting — golden hour */}
      <ambientLight color="#c9a84c" intensity={0.35} />
      <directionalLight position={[-8, 14, 12]} color="#ffb347" intensity={1.4} />
      <directionalLight position={[10, 5, -5]} color="#1a1a4e" intensity={0.3} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0c0c18" roughness={1} metalness={0} />
      </mesh>

      <InkSky />
      <GrassField />
      <EmberParticles />
      <RockFormation />
      <ProjectCards />
      <ContactScene />
    </>
  )
}

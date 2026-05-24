"use client"

import { useMemo, useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const BLADE_COUNT = 3000

// Tapered grass blade: 5 verts, 3 tris
function createBladeGeometry(): THREE.BufferGeometry {
  const positions = new Float32Array([
    -0.04, 0.0, 0,
     0.04, 0.0, 0,
    -0.025, 0.5, 0,
     0.025, 0.5, 0,
     0.0,   1.0, 0,
  ])
  const uvs = new Float32Array([
    0, 0,  1, 0,
    0, 0.5, 1, 0.5,
    0.5, 1,
  ])
  const indices = new Uint16Array([0, 1, 2,  1, 3, 2,  2, 3, 4])

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(new THREE.BufferAttribute(indices, 1))
  return geo
}

const vertexShader = /* glsl */ `
  uniform float uTime;

  varying float vHeight;
  varying float vColorJitter;

  void main() {
    vHeight     = uv.y;             // 0 = base, 1 = tip
    // Per-blade color variation from instance world position
    vec3 wPos   = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
    vColorJitter = fract(sin(wPos.x * 127.1 + wPos.z * 311.7) * 43758.5453);

    vec3 pos    = position;
    float h2    = pos.y * pos.y;    // quadratic: tip moves most

    // LOD: wind fades with camera distance
    float dist  = length(wPos - cameraPosition);
    float lod   = 1.0 - smoothstep(18.0, 40.0, dist);

    // Phase unique to each blade
    float phase = wPos.x * 0.38 + wPos.z * 0.29;
    float t     = uTime * 1.6;

    float gust  = 0.65 + 0.35 * sin(uTime * 0.4 + wPos.x * 0.08);
    pos.x += (sin(t * 0.72 + phase) * 0.55 + sin(t * 1.34 + phase * 1.6) * 0.2)
             * h2 * gust * lod;
    pos.z += cos(t * 0.55 + phase * 0.9) * 0.14 * h2 * gust * lod;
    pos.x += 0.08 * gust * h2; // constant lean into wind

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying float vHeight;
  varying float vColorJitter;

  void main() {
    vec3 base = vec3(0.22, 0.15, 0.06);
    vec3 mid  = vec3(0.72, 0.52, 0.18);
    vec3 tip  = vec3(0.90, 0.72, 0.36);

    float t = vHeight + vColorJitter * 0.15;
    vec3 col = t < 0.5
      ? mix(base, mid, t * 2.0)
      : mix(mid,  tip, (t - 0.5) * 2.0);

    // Slight fade at very base to blend with ground
    float alpha = smoothstep(0.0, 0.08, vHeight);
    gl_FragColor = vec4(col, alpha);
  }
`

export default function GrassField() {
  const meshRef  = useRef<THREE.InstancedMesh>(null!)
  const matRef   = useRef<THREE.ShaderMaterial>(null!)
  const timerRef = useRef(new THREE.Timer())

  const geo = useMemo(() => createBladeGeometry(), [])

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  // Place instances — weighted toward Act 1 z-range
  useEffect(() => {
    const dummy = new THREE.Object3D()
    for (let i = 0; i < BLADE_COUNT; i++) {
      const inAct1 = Math.random() < 0.78
      const x = (Math.random() - 0.5) * 52
      const z = inAct1
        ? 4 + Math.random() * 22           // z=4…26 (grass field)
        : -10 + Math.random() * 14         // z=-10…4 (sparse in Act 2)

      const h = (0.55 + Math.random() * 0.65) * (inAct1 ? 1 : 0.6)
      dummy.position.set(x, 0, z)
      dummy.rotation.set(0, Math.random() * Math.PI * 2, 0)
      dummy.scale.setScalar(h)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [])

  useFrame(() => {
    timerRef.current.update()
    matRef.current.uniforms.uTime.value = timerRef.current.getElapsed()
  })

  return (
    <instancedMesh ref={meshRef} args={[geo, undefined, BLADE_COUNT]}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        transparent
        alphaTest={0.05}
      />
    </instancedMesh>
  )
}

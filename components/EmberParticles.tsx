"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const COUNT = 1400

const vertexShader = /* glsl */ `
  attribute float aLife;
  attribute float aSpeed;
  attribute float aSize;
  attribute vec3  aOrigin;

  uniform float uTime;

  varying float vProgress;

  void main() {
    float t = mod(uTime * aSpeed + aLife, 1.0);
    vProgress = t;

    float x = aOrigin.x
      + sin(uTime * 0.9 + aLife * 7.3) * 0.6
      + t * 4.5 * 0.28;                        // drift slightly in +x (wind)
    float y = aOrigin.y + t * 3.8              // rise upward
      + sin(uTime * 1.2 + aLife * 5.1) * 0.4;
    float z = aOrigin.z
      + cos(uTime * 0.7 + aLife * 6.2) * 0.5
      - t * 2.2 * 0.3;                         // slight -z wind component

    vec4 mvPos = modelViewMatrix * vec4(x, y, z, 1.0);
    float fadeAlpha = sin(t * 3.14159);
    gl_PointSize = aSize * fadeAlpha * (280.0 / -mvPos.z);
    gl_Position  = projectionMatrix * mvPos;
  }
`

const fragmentShader = /* glsl */ `
  varying float vProgress;

  void main() {
    vec2 coord = gl_PointCoord - 0.5;
    float d    = length(coord);
    if (d > 0.5) discard;

    float core  = exp(-d * d * 7.0);
    float life  = sin(vProgress * 3.14159);
    float alpha = core * life * 0.85;

    // Hot core → amber glow → dark edge
    vec3 hotCore = vec3(1.0, 0.85, 0.55);
    vec3 amber   = vec3(0.85, 0.52, 0.12);
    vec3 color   = mix(amber, hotCore, exp(-d * 6.0));

    gl_FragColor = vec4(color, alpha);
  }
`

export default function EmberParticles() {
  const matRef   = useRef<THREE.ShaderMaterial>(null!)
  const timerRef = useRef(new THREE.Timer())

  const [geo, uniforms] = useMemo(() => {
    const positions = new Float32Array(COUNT * 3) // all zeros — shader handles position
    const aOrigin   = new Float32Array(COUNT * 3)
    const aLife     = new Float32Array(COUNT)
    const aSpeed    = new Float32Array(COUNT)
    const aSize     = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Spread across full scene, concentrated in Acts 1-2
      const inAct12 = Math.random() < 0.68
      aOrigin[i * 3 + 0] = (Math.random() - 0.5) * 44
      aOrigin[i * 3 + 1] = 0.4 + Math.random() * 8
      aOrigin[i * 3 + 2] = inAct12
        ? -8 + Math.random() * 32   // z=-8…24
        : -30 + Math.random() * 22  // z=-30…-8

      aLife[i]  = Math.random()
      aSpeed[i] = 0.04 + Math.random() * 0.08
      aSize[i]  = 1.5 + Math.random() * 3.5
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    g.setAttribute("aOrigin",  new THREE.BufferAttribute(aOrigin, 3))
    g.setAttribute("aLife",    new THREE.BufferAttribute(aLife, 1))
    g.setAttribute("aSpeed",   new THREE.BufferAttribute(aSpeed, 1))
    g.setAttribute("aSize",    new THREE.BufferAttribute(aSize, 1))

    const u = { uTime: { value: 0 } }
    return [g, u]
  }, [])

  useFrame(() => {
    timerRef.current.update()
    matRef.current.uniforms.uTime.value = timerRef.current.getElapsed()
  })

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

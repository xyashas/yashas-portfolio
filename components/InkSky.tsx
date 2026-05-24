"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const vertexShader = /* glsl */ `
  varying vec3 vWorldDir;
  void main() {
    vWorldDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorldDir;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.1 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vWorldDir);
    float elev = dir.y;

    // Palette
    vec3 amberHorizon = vec3(0.788, 0.659, 0.298); // #c9a84c
    vec3 deepIndigo   = vec3(0.102, 0.102, 0.180); // #1a1a2e
    vec3 inkBlack     = vec3(0.039, 0.039, 0.059); // #0a0a0f

    // Base gradient
    vec3 sky = mix(amberHorizon, deepIndigo, smoothstep(-0.08, 0.55, elev));
    sky      = mix(sky, inkBlack, smoothstep(0.38, 0.95, elev));

    // Sun disc
    float sunElevation = -0.05;
    float sunAngle     = dot(dir, normalize(vec3(-0.6, sunElevation, -0.5)));
    float sun          = smoothstep(0.994, 0.999, sunAngle);
    float glow         = smoothstep(0.88, 0.994, sunAngle) * 0.4;
    sky += vec3(1.0, 0.75, 0.35) * (sun + glow);

    // Ink-wash cloud layer near horizon
    float horizonMask = 1.0 - smoothstep(-0.05, 0.42, elev);
    vec2 inkUV = vec2(atan(dir.x, dir.z) * 0.3 + uTime * 0.012, elev * 1.5) * 3.0;
    float ink  = fbm(inkUV) * horizonMask;
    sky += ink * 0.16 * mix(amberHorizon, vec3(0.0), smoothstep(0.0, 0.4, elev));

    gl_FragColor = vec4(sky, 1.0);
  }
`

export default function InkSky() {
  const matRef   = useRef<THREE.ShaderMaterial>(null!)
  const timerRef = useRef(new THREE.Timer())

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 } }),
    []
  )

  useFrame(() => {
    timerRef.current.update()
    matRef.current.uniforms.uTime.value = timerRef.current.getElapsed()
  })

  return (
    <mesh scale={[200, 200, 200]}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  )
}

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 420;

// Camera sits at z=4, FOV=60. Visible half-height at z=0: tan(30°)*4 ≈ 2.31
const CAM_Z = 4.0;
const VHH = Math.tan(THREE.MathUtils.degToRad(30)) * CAM_Z; // ~2.31

const vertexShader = /* glsl */ `
  attribute float aLife;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aDriftX;
  attribute float aStartX;
  attribute float aDepth;

  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uAspect;
  uniform float uDPR;

  varying float vProgress;
  varying float vDepth;

  void main() {
    // t in [0,1): position along lifetime cycle
    float t = mod(uTime * aSpeed + aLife, 1.0);
    vProgress = t;
    vDepth    = aDepth;

    // World position — particles travel bottom to top across 2×VHH
    float VHH = ${VHH.toFixed(4)};
    float x = aStartX * uAspect * VHH
              + sin(t * 6.2832 + aLife * 11.3) * aDriftX
              + uMouse.x * VHH * 0.18 * (1.0 - aDepth);

    float y = -VHH + t * VHH * 2.0
              + uMouse.y * VHH * 0.09 * (1.0 - aDepth);

    // Depth spread: front (aDepth≈1) slightly closer to camera
    float z = (aDepth - 0.5) * 1.2;

    vec4 mvPos = modelViewMatrix * vec4(x, y, z, 1.0);

    // aSize is in CSS pixels at the reference distance (CAM_Z)
    gl_PointSize = aSize * uDPR * (${CAM_Z.toFixed(1)} / -mvPos.z);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vProgress;
  varying float vDepth;

  void main() {
    vec2  coord = gl_PointCoord - 0.5;
    float d     = length(coord);
    if (d > 0.5) discard;

    // Soft circular falloff
    float shape = 1.0 - smoothstep(0.15, 0.5, d);

    // Bell-curve opacity over lifetime: fade in at bottom, dissolve at top
    float life  = sin(vProgress * 3.14159);
    float alpha = shape * life * 0.52 * (0.4 + vDepth * 0.6);

    // Ash-white (#e8e6e0) blended toward warm gold (#c9a84c) by depth
    vec3 ashWhite = vec3(0.910, 0.902, 0.878);
    vec3 warmGold = vec3(0.788, 0.659, 0.298);
    vec3 color    = mix(ashWhite, warmGold, vDepth * 0.38);

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function InkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ──────────────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    // ── Camera ────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.z = CAM_Z;

    const scene = new THREE.Scene();

    // ── Geometry ──────────────────────────────────────────────────────────
    const positions = new Float32Array(PARTICLE_COUNT * 3); // all zeros — positions computed in shader
    const aLife    = new Float32Array(PARTICLE_COUNT);
    const aSpeed   = new Float32Array(PARTICLE_COUNT);
    const aSize    = new Float32Array(PARTICLE_COUNT);
    const aDriftX  = new Float32Array(PARTICLE_COUNT);
    const aStartX  = new Float32Array(PARTICLE_COUNT);
    const aDepth   = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      aLife[i]   = Math.random();                        // stagger start phase
      aSpeed[i]  = 0.022 + Math.random() * 0.032;       // very slow drift
      aSize[i]   = 2.5 + Math.random() * 5.5;           // CSS px at reference dist
      aDriftX[i] = (Math.random() - 0.5) * 0.25;        // horizontal oscillation amplitude
      aStartX[i] = (Math.random() - 0.5) * 2.1;         // normalized x, scaled by aspect in shader
      aDepth[i]  = Math.random();                        // 0=far/dim, 1=near/bright
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aLife",   new THREE.BufferAttribute(aLife, 1));
    geo.setAttribute("aSpeed",  new THREE.BufferAttribute(aSpeed, 1));
    geo.setAttribute("aSize",   new THREE.BufferAttribute(aSize, 1));
    geo.setAttribute("aDriftX", new THREE.BufferAttribute(aDriftX, 1));
    geo.setAttribute("aStartX", new THREE.BufferAttribute(aStartX, 1));
    geo.setAttribute("aDepth",  new THREE.BufferAttribute(aDepth, 1));

    const uniforms = {
      uTime:   { value: 0 },
      uMouse:  { value: new THREE.Vector2(0, 0) },
      uAspect: { value: camera.aspect },
      uDPR:    { value: dpr },
    };

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false; // positions live in shader, CPU bbox is zero
    scene.add(points);

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      uniforms.uAspect.value = camera.aspect;
    };
    onResize();
    window.addEventListener("resize", onResize);

    // ── Mouse ─────────────────────────────────────────────────────────────
    const targetMouse = new THREE.Vector2(0, 0);
    const smoothMouse = new THREE.Vector2(0, 0);

    const onMouseMove = (e: MouseEvent) => {
      targetMouse.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
      targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Loop ──────────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      smoothMouse.lerp(targetMouse, 0.04);
      uniforms.uTime.value  = clock.getElapsedTime();
      uniforms.uMouse.value.copy(smoothMouse);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}

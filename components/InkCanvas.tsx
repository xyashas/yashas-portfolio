"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 650;
const CAM_Z = 4.0;
const VHH = Math.tan(THREE.MathUtils.degToRad(30)) * CAM_Z; // ~2.31

function gauss(): number {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

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
  varying float vCenterFade;

  void main() {
    float t = mod(uTime * aSpeed + aLife, 1.0);
    vProgress   = t;
    vDepth      = aDepth;
    // Exponential center fade — particles far from center are dimmer
    vCenterFade = exp(-aStartX * aStartX * 5.0);

    float VHH = ${VHH.toFixed(4)};

    float px = 0.08 + aDepth * 0.42;

    float x = aStartX * uAspect * VHH
              + sin(t * 6.2832 + aLife * 11.3) * aDriftX
              + uMouse.x * VHH * px;

    float y = -VHH + t * VHH * 2.0
              + uMouse.y * VHH * px * 0.5;

    float z = (aDepth - 0.5) * 1.2;

    vec4 mvPos = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_PointSize = aSize * uDPR * (${CAM_Z.toFixed(1)} / -mvPos.z);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vProgress;
  varying float vDepth;
  varying float vCenterFade;

  void main() {
    vec2 coord = gl_PointCoord - 0.5;

    // Angular wobble breaks the perfect circle into an irregular ink blob
    float angle   = atan(coord.y, coord.x);
    float wobble  = 1.0
      + 0.28 * sin(angle * 2.3 + vDepth  * 4.7)
      + 0.13 * sin(angle * 3.8 + vProgress * 2.1);
    float d = length(coord) * wobble;

    // Soft gaussian — no hard discard, ink bleeds at edges naturally
    float shape = exp(-d * d * 9.5);

    // Bell-curve opacity over lifetime
    float life  = sin(vProgress * 3.14159);

    // Dense center, sparse edges; near particles more opaque than far
    float alpha = shape * life * vCenterFade * (0.42 + vDepth * 0.44);

    // Warm amber → muted gold — ink pigment, not starlight
    vec3 amber = vec3(0.820, 0.560, 0.180);
    vec3 gold  = vec3(0.788, 0.659, 0.298);
    vec3 color = mix(amber, gold, vDepth * 0.65);

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function InkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.z = CAM_Z;
    const scene = new THREE.Scene();

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const aLife    = new Float32Array(PARTICLE_COUNT);
    const aSpeed   = new Float32Array(PARTICLE_COUNT);
    const aSize    = new Float32Array(PARTICLE_COUNT);
    const aDriftX  = new Float32Array(PARTICLE_COUNT);
    const aStartX  = new Float32Array(PARTICLE_COUNT);
    const aDepth   = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      aLife[i]  = Math.random();
      aSpeed[i] = 0.018 + Math.random() * 0.026;
      // No tiny sparkle-sized particles — minimum 4px, mix of medium blobs and large drops
      aSize[i]  = Math.random() < 0.70
        ? 4  + Math.random() * 7   // medium blobs: 4–11 CSS px
        : 11 + Math.random() * 10; // ink drops: 11–21 CSS px
      aDriftX[i] = (Math.random() - 0.5) * 0.20;
      // Layered Gaussian: tight core (65%) + wider halo (35%)
      aStartX[i] = Math.max(-1.05, Math.min(1.05,
        gauss() * (Math.random() < 0.65 ? 0.26 : 0.52)
      ));
      aDepth[i]  = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aLife",    new THREE.BufferAttribute(aLife, 1));
    geo.setAttribute("aSpeed",   new THREE.BufferAttribute(aSpeed, 1));
    geo.setAttribute("aSize",    new THREE.BufferAttribute(aSize, 1));
    geo.setAttribute("aDriftX",  new THREE.BufferAttribute(aDriftX, 1));
    geo.setAttribute("aStartX",  new THREE.BufferAttribute(aStartX, 1));
    geo.setAttribute("aDepth",   new THREE.BufferAttribute(aDepth, 1));

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
      // NormalBlending: particles composite as warm pigment over the dark background,
      // not as additive light sources — eliminates the star/sparkle appearance
      blending: THREE.NormalBlending,
    });

    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    scene.add(points);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      uniforms.uAspect.value = camera.aspect;
    };
    onResize();
    window.addEventListener("resize", onResize);

    const targetMouse = new THREE.Vector2(0, 0);
    const smoothMouse = new THREE.Vector2(0, 0);

    const onMouseMove = (e: MouseEvent) => {
      targetMouse.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
      targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    const clock = new THREE.Clock();
    let animId: number;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      smoothMouse.lerp(targetMouse, 0.10);
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

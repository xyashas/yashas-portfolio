"use client"

import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import * as THREE from "three"

export default function PostEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.55}
        luminanceSmoothing={0.85}
        intensity={0.65}
        mipmapBlur
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.0008, 0.0008)}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.028}
      />
      <Vignette
        darkness={0.45}
        offset={0.45}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}

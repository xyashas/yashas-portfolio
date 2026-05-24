import dynamic from "next/dynamic"

// Canvas must be client-only (no SSR)
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false })

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#0a0a0f" }}>
      <Scene />
    </main>
  )
}

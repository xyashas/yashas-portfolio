import InkCanvas from "@/components/InkCanvas";
import HeroName from "@/components/HeroName";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-midnight flex items-center justify-center">
      {/* Three.js ink particle layer — behind everything */}
      <InkCanvas />

      {/* Centered name, layered above the canvas */}
      <div className="relative z-10 px-6">
        <HeroName />
      </div>
    </main>
  );
}

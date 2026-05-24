export interface Project {
  id: number
  title: string
  category: string
  description: string
  tech: string[]
  url?: string
}

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Horizon",
    category: "Full-Stack Platform",
    description:
      "Real-time collaborative workspace built with Next.js and WebSockets. Handles 10k+ concurrent sessions.",
    tech: ["Next.js", "TypeScript", "WebSocket", "PostgreSQL"],
  },
  {
    id: 2,
    title: "Atlas",
    category: "Data Visualization",
    description:
      "Interactive geospatial analytics dashboard processing millions of data points with sub-100ms queries.",
    tech: ["React", "D3.js", "Python", "FastAPI"],
  },
  {
    id: 3,
    title: "Cipher",
    category: "Security Infrastructure",
    description:
      "End-to-end encrypted file system with zero-knowledge architecture. Deployed across three regions.",
    tech: ["Rust", "WebAssembly", "React", "Cryptography"],
  },
]

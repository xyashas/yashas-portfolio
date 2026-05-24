import type { Metadata } from "next"
import { Bebas_Neue } from "next/font/google"
import "./globals.css"

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
})

export const metadata: Metadata = {
  title: "Yashas M",
  description: "Portfolio of Yashas M — Full-Stack Developer & Creative Technologist",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bebasNeue.variable}`}>{children}</body>
    </html>
  )
}

import type { Metadata } from "next"
import { EB_Garamond, Inter, JetBrains_Mono } from "next/font/google"
import "legacy/styles/tailwind.css"

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Scorta — ExitIQ Liquid Engine",
  description:
    "See what buyers would pay before you ever talk to a broker. AI-guided valuation, buyer pool, and deal risk assessment for Main Street businesses.",
  twitter: { card: "summary_large_image" },
}

const fontVariables = `${ebGaramond.variable} ${inter.variable} ${jetbrainsMono.variable}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}

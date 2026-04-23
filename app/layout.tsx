import type { Metadata } from "next"
import { DM_Sans, Space_Mono } from "next/font/google"
import "styles/tailwind.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Scorta — AI-Native Business Deals",
  description:
    "AI-guided deals for Main Street businesses. Exit IQ assessment, AI valuation, and broker-free deal closing.",
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceMono.variable}`}>
      <body style={{ fontFamily: "var(--font-dm-sans, 'DM Sans'), Arial, sans-serif" }}>{children}</body>
    </html>
  )
}

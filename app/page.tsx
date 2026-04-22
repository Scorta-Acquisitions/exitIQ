"use client"

import { useRef } from "react"
import { FAQ } from "@/components/landing/FAQ"
import { Features } from "@/components/landing/Features"
import { Footer } from "@/components/landing/Footer"
import { Hero } from "@/components/landing/Hero"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Nav } from "@/components/landing/Nav"
import { SavingsStrip } from "@/components/landing/SavingsStrip"
import { TrustStrip } from "@/components/landing/TrustStrip"

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div style={{ background: "#faf9f7", color: "#000", overflowX: "hidden" }}>
      <Nav onStartWidget={scrollToTop} />
      <div ref={heroRef}>
        <Hero />
      </div>
      <TrustStrip />
      <HowItWorks />
      <Features />
      <SavingsStrip />
      <FAQ />
      <Footer onStart={scrollToTop} />
    </div>
  )
}

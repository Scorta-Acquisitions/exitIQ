"use client"

import { useEffect, useState } from "react"
import { ExitIQWidget } from "@/components/landing/ExitIQWidget"

const WORDS = ["your exit.", "your timeline.", "your number.", "your next move."]

export function Hero() {
  const [_wordIdx, setWordIdx] = useState(0)
  const [_fade, setFade] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % WORDS.length)
        setFade(true)
      }, 250)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      style={{
        background: "#02492a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "120px",
        paddingBottom: "80px",
        paddingLeft: "24px",
        paddingRight: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative rings */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          border: "1px solid rgba(132,231,165,0.1)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "900px",
          height: "900px",
          borderRadius: "50%",
          border: "1px solid rgba(132,231,165,0.05)",
          pointerEvents: "none",
        }}
      />

      {/* Badge */}
      <div
        className="animate-fade-up-1"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          background: "rgba(132,231,165,0.12)",
          border: "1px solid rgba(132,231,165,0.25)",
          borderRadius: "1584px",
          padding: "6px 14px 6px 8px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#84e7a5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "9px",
            fontWeight: 800,
            color: "#02492a",
          }}
        >
          AI
        </div>
        <span style={{ fontSize: "13px", fontWeight: 500, color: "#84e7a5", letterSpacing: "0.2px" }}>
          AI-native deal intelligence
        </span>
      </div>

      {/* Headline */}
      <div className="animate-fade-up-2" style={{ textAlign: "center", marginBottom: "16px", lineHeight: 1.25 }}>
        <div
          style={{
            fontSize: "clamp(22px, 3vw, 28px)",
            fontWeight: 700,
            letterSpacing: "-0.8px",
            color: "#84e7a5",
            whiteSpace: "nowrap",
          }}
        >
          Know your exit.
        </div>
        <div
          style={{
            fontSize: "clamp(22px, 3vw, 28px)",
            fontWeight: 700,
            letterSpacing: "-0.8px",
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          Before you need to.
        </div>
      </div>

      <p
        className="animate-fade-up-3"
        style={{
          fontSize: "15px",
          fontWeight: 400,
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.6)",
          textAlign: "center",
          maxWidth: "400px",
          marginBottom: "32px",
        }}
      >
        Scorta replaces the business broker. AI-guided deals for Main Street businesses — from listing to close.
      </p>

      {/* Widget */}
      <div
        className="animate-fade-up-4"
        style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative", zIndex: 10 }}
      >
        <ExitIQWidget />
      </div>

      {/* Scroll hint */}
      <div
        className="animate-float"
        style={{
          marginTop: "48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          opacity: 0.35,
        }}
      >
        <div style={{ width: "1px", height: "24px", background: "#84e7a5" }} />
        <div
          style={{
            fontSize: "10px",
            fontWeight: 500,
            color: "#84e7a5",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Scroll
        </div>
      </div>
    </section>
  )
}

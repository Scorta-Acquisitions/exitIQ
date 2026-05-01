"use client"

import React from "react"
import { ExitIQApp } from "@/components/exitiq/ExitIQApp"

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  canvas: "#f5f5f5",
  canvasSoft: "#fafafa",
  ink: "#0c0a09",
  primary: "#292524",
  body: "#4e4e4e",
  muted: "#777169",
  mutedSoft: "#a8a29e",
  hairline: "#e7e5e4",
  hairlineStrong: "#d6d3d1",
  surfaceCard: "#ffffff",
  surfaceStrong: "#f0efed",
  onPrimary: "#ffffff",
  gradMint: "#a7e5d3",
  gradPeach: "#f4c5a8",
  gradLavender: "#c8b8e0",
  gradSky: "#a8c8e8",
  gradRose: "#e8b8c4",
}

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"

// ── Shared style helpers ─────────────────────────────────────────────────────
function displayStyle(size: number): React.CSSProperties {
  const spacing = size >= 56 ? "-1.92px" : size >= 44 ? "-0.96px" : size >= 34 ? "-0.36px" : "-0.32px"
  return {
    fontFamily: garamond,
    fontSize: size,
    fontWeight: 300,
    lineHeight: 1.05,
    letterSpacing: spacing,
    color: C.ink,
    margin: 0,
  }
}

const pillPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 40,
  padding: "0 20px",
  background: C.primary,
  color: C.onPrimary,
  borderRadius: 9999,
  fontFamily: inter,
  fontSize: 15,
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
  letterSpacing: 0,
}

const pillOutline: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 40,
  padding: "0 19px",
  background: "transparent",
  color: C.ink,
  borderRadius: 9999,
  fontFamily: inter,
  fontSize: 15,
  fontWeight: 500,
  border: `1px solid ${C.hairlineStrong}`,
  cursor: "pointer",
}

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  background: C.surfaceStrong,
  borderRadius: 9999,
  fontFamily: inter,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.96px",
  textTransform: "uppercase",
  color: C.muted,
}

// ── ExitIQ Overlay ───────────────────────────────────────────────────────────
function ExitIQOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        // transform creates containing block for fixed children (the WebGL canvas)
        transform: "translateZ(0)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <button
        onClick={onClose}
        title="Return to Scorta"
        style={{
          position: "absolute",
          top: 22,
          left: 22,
          zIndex: 2100,
          height: 34,
          padding: "0 14px",
          background: "rgba(245,245,245,0.1)",
          color: "rgba(245,245,245,0.85)",
          border: "1px solid rgba(245,245,245,0.18)",
          borderRadius: 9999,
          fontFamily: inter,
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
          <path d="M8 1L3 6l5 5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Scorta
      </button>
      <ExitIQApp />
    </div>
  )
}

// ── ExitIQ product preview card ──────────────────────────────────────────────
function ExitIQPreviewCard({ onOpen }: { onOpen: () => void }) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div style={{ position: "relative", marginTop: 16 }}>
      {/* Atmospheric gradient orbs behind the card */}
      <div
        style={{
          position: "absolute",
          inset: "-60px",
          background:
            "radial-gradient(ellipse at 25% 40%, rgba(167,229,211,0.45) 0%, transparent 55%)," +
            "radial-gradient(ellipse at 75% 35%, rgba(244,197,168,0.38) 0%, transparent 50%)," +
            "radial-gradient(ellipse at 50% 80%, rgba(200,184,224,0.3) 0%, transparent 50%)",
          pointerEvents: "none",
          borderRadius: "50%",
          filter: "blur(20px)",
        }}
      />

      <div
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          maxWidth: 920,
          margin: "0 auto",
          borderRadius: 20,
          overflow: "hidden",
          background: "#0c0a09",
          border: hovered ? "1px solid rgba(167,229,211,0.35)" : "1px solid rgba(245,245,245,0.1)",
          boxShadow: hovered
            ? "0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(167,229,211,0.12), 0 0 60px rgba(167,229,211,0.08)"
            : "0 24px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(245,245,245,0.04)",
          cursor: "pointer",
          transform: hovered ? "scale(1.008) translateY(-2px)" : "scale(1) translateY(0)",
          transition: "all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)",
          userSelect: "none",
        }}
      >
        {/* Fake nav bar */}
        <div
          style={{
            height: 52,
            padding: "0 20px",
            borderBottom: "1px solid rgba(245,245,245,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(245,245,245,0.03)",
          }}
        >
          <span style={{ fontFamily: garamond, fontSize: 17, fontWeight: 300, color: "rgba(245,245,245,0.9)", letterSpacing: "-0.2px" }}>
            Scorta
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {["How it works", "For sellers"].map((l) => (
              <span key={l} style={{ fontFamily: inter, fontSize: 13, fontWeight: 500, color: "rgba(245,245,245,0.35)" }}>
                {l}
              </span>
            ))}
          </div>
          <div
            style={{
              height: 30,
              padding: "0 14px",
              background: "rgba(245,245,245,0.08)",
              border: "1px solid rgba(245,245,245,0.12)",
              borderRadius: 9999,
              fontFamily: inter,
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(245,245,245,0.6)",
              display: "flex",
              alignItems: "center",
            }}
          >
            Start ExitIQ
          </div>
        </div>

        {/* Main content area */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 0, minHeight: 340 }}>
          {/* Left — question panel */}
          <div style={{ padding: "28px 28px 24px", borderRight: "1px solid rgba(245,245,245,0.06)" }}>
            {/* Label */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.96px",
                textTransform: "uppercase",
                color: "rgba(167,229,211,0.65)",
                fontFamily: inter,
                marginBottom: 14,
              }}
            >
              ExitIQ Liquid Engine
            </div>
            {/* Headline */}
            <h2
              style={{
                fontFamily: garamond,
                fontSize: 28,
                fontWeight: 300,
                color: "rgba(245,245,245,0.92)",
                lineHeight: 1.08,
                letterSpacing: "-0.6px",
                marginBottom: 10,
              }}
            >
              See what buyers would pay — before you ever talk to a broker.
            </h2>
            <p
              style={{
                fontFamily: inter,
                fontSize: 13,
                fontWeight: 400,
                color: "rgba(245,245,245,0.42)",
                lineHeight: 1.6,
                letterSpacing: "0.1px",
                marginBottom: 24,
              }}
            >
              ExitIQ analyzes your valuation range, likely buyer pool, broker-fee exposure, and deal risks through an AI-guided assessment.
            </p>

            {/* Sample question */}
            <div
              style={{
                background: "rgba(245,245,245,0.04)",
                border: "1px solid rgba(245,245,245,0.09)",
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 12,
              }}
            >
              <div style={{ fontFamily: inter, fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(245,245,245,0.35)", marginBottom: 8 }}>
                Question 1 of 6
              </div>
              <div style={{ fontFamily: garamond, fontSize: 18, fontWeight: 300, color: "rgba(245,245,245,0.85)", marginBottom: 14, lineHeight: 1.3, letterSpacing: "-0.2px" }}>
                What industry is your business in?
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Retail / E-commerce", "Food & Beverage", "Professional Services", "Healthcare"].map((opt, i) => (
                  <div
                    key={opt}
                    style={{
                      padding: "7px 13px",
                      borderRadius: 9999,
                      fontFamily: inter,
                      fontSize: 12,
                      fontWeight: 500,
                      color: i === 2 ? "rgba(167,229,211,0.85)" : "rgba(245,245,245,0.5)",
                      background: i === 2 ? "rgba(167,229,211,0.1)" : "rgba(245,245,245,0.05)",
                      border: `1px solid ${i === 2 ? "rgba(167,229,211,0.3)" : "rgba(245,245,245,0.1)"}`,
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>

            {/* Answer chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Professional Services", "12 employees"].map((chip) => (
                <div
                  key={chip}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 9999,
                    fontFamily: inter,
                    fontSize: 11,
                    fontWeight: 500,
                    color: "rgba(245,245,245,0.4)",
                    background: "rgba(245,245,245,0.04)",
                    border: "1px solid rgba(245,245,245,0.08)",
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>
          </div>

          {/* Right — dashboard panel */}
          <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 10, background: "rgba(245,245,245,0.015)" }}>
            {/* Score row */}
            <div
              style={{
                background: "rgba(245,245,245,0.04)",
                border: "1px solid rgba(245,245,245,0.08)",
                borderRadius: 12,
                padding: "13px 14px",
              }}
            >
              <div style={{ fontFamily: inter, fontSize: 9, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(245,245,245,0.3)", marginBottom: 6 }}>
                Exit Readiness Score
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 4, background: "rgba(245,245,245,0.08)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: "67%", height: "100%", background: "linear-gradient(90deg, rgba(167,229,211,0.7), rgba(167,229,211,0.4))", borderRadius: 2 }} />
                </div>
                <span style={{ fontFamily: garamond, fontSize: 16, fontWeight: 300, color: "#a7e5d3", letterSpacing: "-0.1px" }}>67%</span>
              </div>
            </div>

            {/* Valuation */}
            <div
              style={{
                background: "rgba(245,245,245,0.04)",
                border: "1px solid rgba(245,245,245,0.08)",
                borderRadius: 12,
                padding: "13px 14px",
              }}
            >
              <div style={{ fontFamily: inter, fontSize: 9, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(245,245,245,0.3)", marginBottom: 5 }}>
                Est. Valuation Range
              </div>
              <div style={{ fontFamily: garamond, fontSize: 20, fontWeight: 300, color: "rgba(245,245,245,0.88)", letterSpacing: "-0.3px" }}>
                $1.2M – $2.4M
              </div>
              <div style={{ fontFamily: inter, fontSize: 10, color: "#10b981", fontWeight: 500, marginTop: 2 }}>
                3.1× SDE multiple
              </div>
            </div>

            {/* Broker fee */}
            <div
              style={{
                background: "rgba(244,197,168,0.06)",
                border: "1px solid rgba(244,197,168,0.15)",
                borderRadius: 12,
                padding: "13px 14px",
              }}
            >
              <div style={{ fontFamily: inter, fontSize: 9, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(244,197,168,0.45)", marginBottom: 5 }}>
                Broker Fee Exposure
              </div>
              <div style={{ fontFamily: garamond, fontSize: 20, fontWeight: 300, color: "#f4c5a8", letterSpacing: "-0.3px" }}>
                $96K – $192K
              </div>
              <div style={{ fontFamily: inter, fontSize: 10, color: "rgba(244,197,168,0.45)", fontWeight: 400, marginTop: 2, lineHeight: 1.4 }}>
                8–10% of deal value
              </div>
            </div>

            {/* SBA */}
            <div
              style={{
                background: "rgba(200,184,224,0.06)",
                border: "1px solid rgba(200,184,224,0.15)",
                borderRadius: 12,
                padding: "13px 14px",
              }}
            >
              <div style={{ fontFamily: inter, fontSize: 9, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(200,184,224,0.45)", marginBottom: 5 }}>
                SBA Financeability
              </div>
              <div style={{ fontFamily: inter, fontSize: 13, fontWeight: 400, color: "rgba(245,245,245,0.65)", lineHeight: 1.4 }}>
                Likely qualifies for SBA 7(a)
              </div>
              <div style={{ fontFamily: inter, fontSize: 10, color: "rgba(200,184,224,0.45)", marginTop: 2 }}>
                DSCR within lender range
              </div>
            </div>

            {/* Locked row */}
            <div
              style={{
                background: "rgba(245,245,245,0.03)",
                border: "1px solid rgba(245,245,245,0.07)",
                borderRadius: 10,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
                  <rect x={1} y={4.5} width={9} height={6} rx={1.5} fill="rgba(245,245,245,0.15)" />
                  <path d="M3 4.5V3.2a2.5 2.5 0 0 1 5 0v1.3" stroke="rgba(245,245,245,0.25)" strokeWidth={1} fill="none" />
                </svg>
                <span style={{ fontFamily: inter, fontSize: 11, fontWeight: 500, color: "rgba(245,245,245,0.3)" }}>90-day roadmap</span>
              </div>
              <span style={{ fontFamily: inter, fontSize: 9, fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase", color: "rgba(245,245,245,0.22)" }}>Locked</span>
            </div>
          </div>
        </div>

        {/* Click-to-start CTA */}
        <div
          style={{
            borderTop: "1px solid rgba(245,245,245,0.07)",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(245,245,245,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px rgba(16,185,129,0.8)",
                animation: "liveBlink 2s infinite",
              }}
            />
            <span style={{ fontFamily: inter, fontSize: 13, fontWeight: 500, color: "rgba(245,245,245,0.55)", letterSpacing: "0.1px" }}>
              Free assessment · No login · No broker call
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: inter,
              fontSize: 14,
              fontWeight: 500,
              color: hovered ? "rgba(167,229,211,0.9)" : "rgba(245,245,245,0.7)",
              transition: "color 0.2s",
            }}
          >
            Start your assessment
            <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7.5 4l3.5 3-3.5 3" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Subtle "click to try" label below */}
      <p
        style={{
          fontFamily: inter,
          fontSize: 13,
          color: C.mutedSoft,
          textAlign: "center",
          marginTop: 16,
          letterSpacing: "0.1px",
        }}
      >
        Click anywhere on the card to try ExitIQ live
      </p>
    </div>
  )
}

// ── Top Navigation ────────────────────────────────────────────────────────────
function TopNav({ onStart }: { onStart: () => void }) {
  return (
    <nav
      style={{
        height: 64,
        background: C.canvas,
        borderBottom: `1px solid ${C.hairline}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          fontFamily: garamond,
          fontSize: 22,
          fontWeight: 300,
          color: C.ink,
          letterSpacing: "-0.3px",
        }}
      >
        Scorta
      </div>
      <div style={{ display: "flex", gap: 32 }}>
        {["Features", "How it works", "For sellers"].map((l) => (
          <span
            key={l}
            style={{
              fontFamily: inter,
              fontSize: 15,
              fontWeight: 500,
              color: C.body,
              cursor: "pointer",
            }}
          >
            {l}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontFamily: inter, fontSize: 15, fontWeight: 500, color: C.body, cursor: "pointer" }}>
          Sign in
        </span>
        <button
          onClick={onStart}
          style={pillPrimary}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.ink)}
          onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
        >
          Try free
        </button>
      </div>
    </nav>
  )
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <section
      style={{
        padding: "96px 48px 72px",
        textAlign: "center",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Atmospheric gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "-5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 480,
          background:
            "radial-gradient(ellipse at 30% 35%, rgba(167,229,211,0.32) 0%, transparent 52%)," +
            "radial-gradient(ellipse at 72% 28%, rgba(244,197,168,0.28) 0%, transparent 48%)," +
            "radial-gradient(ellipse at 50% 75%, rgba(200,184,224,0.22) 0%, transparent 50%)",
          pointerEvents: "none",
          filter: "blur(8px)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <span style={badgeStyle}>Exit Intelligence · AI-native</span>
        </div>

        {/* Headline */}
        <h1
          style={{
            ...displayStyle(60),
            maxWidth: 780,
            margin: "0 auto 24px",
            lineHeight: 1.04,
          }}
        >
          Know what your business is worth — before you need to sell.
        </h1>

        {/* Subhead */}
        <p
          style={{
            fontFamily: inter,
            fontSize: 18,
            fontWeight: 400,
            lineHeight: 1.55,
            letterSpacing: "0.15px",
            color: C.muted,
            maxWidth: 580,
            margin: "0 auto 44px",
          }}
        >
          Scorta turns raw business details into a valuation range, Exit Readiness Score, SBA financeability view, and personalized improvement roadmap — in minutes.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", marginBottom: 72 }}>
          <button
            onClick={onStart}
            style={{ ...pillPrimary, height: 48, padding: "0 28px", fontSize: 16 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.ink)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
          >
            Start free assessment →
          </button>
          <button style={{ ...pillOutline, height: 48, padding: "0 27px", fontSize: 16 }}>
            See how it works
          </button>
        </div>

        {/* ExitIQ preview */}
        <ExitIQPreviewCard onOpen={onStart} />
      </div>
    </section>
  )
}

// ── Trust / Stats Bar ────────────────────────────────────────────────────────
function StatsBand() {
  const stats = [
    { value: "6", label: "quick questions to your Exit IQ Report" },
    { value: "No broker", label: "call or login required to start" },
    { value: "<$10M", label: "built for Main Street businesses" },
  ]

  return (
    <div
      style={{
        borderTop: `1px solid ${C.hairline}`,
        borderBottom: `1px solid ${C.hairline}`,
        background: C.canvasSoft,
        padding: "40px 48px",
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 32,
        }}
      >
        {stats.map(({ value, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 36,
                fontWeight: 300,
                color: C.ink,
                letterSpacing: "-0.5px",
                marginBottom: 6,
              }}
            >
              {value}
            </div>
            <div
              style={{
                fontFamily: inter,
                fontSize: 14,
                fontWeight: 400,
                color: C.muted,
                lineHeight: 1.5,
                letterSpacing: "0px",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Feature Icons ─────────────────────────────────────────────────────────────
function IconValuation() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <circle cx={11} cy={11} r={9.5} stroke={C.hairlineStrong} strokeWidth={1.2} />
      <path d="M11 6v2M11 14v2M8 10.5h2a1 1 0 0 1 0 2h2a1 1 0 0 1 0 2H8" stroke={C.muted} strokeWidth={1.3} strokeLinecap="round" />
      <path d="M14 10.5h-2" stroke={C.muted} strokeWidth={1.3} strokeLinecap="round" />
    </svg>
  )
}
function IconScore() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <path d="M4 13a8 8 0 1 1 14 0" stroke={C.hairlineStrong} strokeWidth={1.2} strokeLinecap="round" />
      <path d="M4 13a8 8 0 0 1 8-8" stroke={C.muted} strokeWidth={1.3} strokeLinecap="round" />
      <circle cx={11} cy={13} r={1.8} fill={C.muted} />
      <path d="M11 11V8" stroke={C.muted} strokeWidth={1.3} strokeLinecap="round" />
    </svg>
  )
}
function IconSBA() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <rect x={2.5} y={8.5} width={17} height={11} rx={1.5} stroke={C.hairlineStrong} strokeWidth={1.2} />
      <path d="M2.5 10l8.5-6 8.5 6" stroke={C.muted} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={8.5} y={13} width={5} height={6.5} rx={0.8} stroke={C.muted} strokeWidth={1.2} />
    </svg>
  )
}
function IconBroker() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <path d="M5 16L17 6" stroke={C.hairlineStrong} strokeWidth={1.2} strokeLinecap="round" />
      <circle cx={6.5} cy={7} r={2.5} stroke={C.muted} strokeWidth={1.2} />
      <circle cx={15.5} cy={15} r={2.5} stroke={C.muted} strokeWidth={1.2} />
    </svg>
  )
}
function IconRisk() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <path d="M11 3l8.5 15H2.5L11 3z" stroke={C.hairlineStrong} strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M11 9v4" stroke={C.muted} strokeWidth={1.4} strokeLinecap="round" />
      <circle cx={11} cy={15.5} r={0.9} fill={C.muted} />
    </svg>
  )
}
function IconRoadmap() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <path d="M3 11h6M13 11h6" stroke={C.hairlineStrong} strokeWidth={1.2} strokeLinecap="round" />
      <circle cx={11} cy={11} r={2.5} stroke={C.muted} strokeWidth={1.2} />
      <path d="M11 4v3M11 15v3M5 5l2 2M15 15l2 2M5 17l2-2M15 7l2-2" stroke={C.muted} strokeWidth={1} strokeLinecap="round" />
    </svg>
  )
}

// ── Feature Section ───────────────────────────────────────────────────────────
function FeatureSection() {
  const features = [
    {
      icon: <IconValuation />,
      title: "Instant Valuation Range",
      desc: "Turn raw revenue and profit figures into a credible SDE-based valuation range — in six questions, not six months.",
    },
    {
      icon: <IconScore />,
      title: "Exit Readiness Score",
      desc: "A single score that tells you exactly how buyers, lenders, and advisors will assess your business today.",
    },
    {
      icon: <IconSBA />,
      title: "SBA Financeability View",
      desc: "Know if SBA-backed buyers can finance your deal before a lender tells you 'no' in due diligence.",
    },
    {
      icon: <IconBroker />,
      title: "Broker-Fee Impact",
      desc: "See the exact dollar cost of a traditional broker vs. what you keep in a direct or advisor-assisted sale.",
    },
    {
      icon: <IconRisk />,
      title: "Risk Radar",
      desc: "Surface owner dependency, customer concentration, and documentation gaps before buyers walk in the door.",
    },
    {
      icon: <IconRoadmap />,
      title: "Improvement Roadmap",
      desc: "A personalized 90-day action plan showing exactly what to fix to increase your multiple before you list.",
    },
  ]

  return (
    <section style={{ padding: "96px 48px", background: C.canvas }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={badgeStyle}>Platform</span>
          <h2
            style={{
              ...displayStyle(42),
              marginTop: 20,
              marginBottom: 16,
            }}
          >
            The intelligence layer for your exit
          </h2>
          <p
            style={{
              fontFamily: inter,
              fontSize: 16,
              fontWeight: 400,
              color: C.muted,
              lineHeight: 1.55,
              letterSpacing: "0.16px",
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            Everything a business owner needs to understand, prepare, and command a stronger exit — long before going to market.
          </p>
        </div>

        {/* 3×2 grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: C.surfaceCard,
                borderRadius: 16,
                padding: "24px 24px 28px",
                border: `1px solid ${C.hairline}`,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: C.surfaceStrong,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </div>
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 17,
                  fontWeight: 500,
                  color: C.ink,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 15,
                  fontWeight: 400,
                  color: C.body,
                  lineHeight: 1.55,
                  letterSpacing: "0.15px",
                }}
              >
                {desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Product Detail Section ────────────────────────────────────────────────────
function GradientOrbCard({
  orb1,
  orb2,
  badge: badgeText,
  headline,
  body: bodyText,
  bullets,
}: {
  orb1: string
  orb2: string
  badge: string
  headline: string
  body: string
  bullets: string[]
}) {
  return (
    <div
      style={{
        background: C.canvasSoft,
        borderRadius: 24,
        padding: 40,
        border: `1px solid ${C.hairline}`,
        position: "relative",
        overflow: "hidden",
        flex: 1,
      }}
    >
      {/* Atmospheric orb */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 280,
          height: 280,
          background: `radial-gradient(ellipse at 40% 40%, ${orb1}55 0%, transparent 60%), radial-gradient(ellipse at 65% 65%, ${orb2}44 0%, transparent 55%)`,
          borderRadius: "50%",
          pointerEvents: "none",
          filter: "blur(2px)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <span style={badgeStyle}>{badgeText}</span>
        <h3
          style={{
            ...displayStyle(30),
            marginTop: 20,
            marginBottom: 16,
            lineHeight: 1.15,
          }}
        >
          {headline}
        </h3>
        <p
          style={{
            fontFamily: inter,
            fontSize: 15,
            fontWeight: 400,
            color: C.body,
            lineHeight: 1.6,
            letterSpacing: "0.15px",
            marginBottom: 24,
          }}
        >
          {bodyText}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bullets.map((b) => (
            <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: C.surfaceStrong,
                  border: `1px solid ${C.hairlineStrong}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <svg width={9} height={9} viewBox="0 0 9 9" fill="none">
                  <path d="M2 4.5l2 2 3-3" stroke={C.muted} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: inter,
                  fontSize: 14,
                  fontWeight: 400,
                  color: C.body,
                  lineHeight: 1.5,
                  letterSpacing: "0.1px",
                }}
              >
                {b}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductDetailSection() {
  return (
    <section style={{ padding: "0 48px 96px", background: C.canvas }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 24 }}>
        <GradientOrbCard
          orb1={C.gradLavender}
          orb2={C.gradMint}
          badge="Surface risks early"
          headline="Find out what buyers would say — before they say it."
          body="Most owners discover their biggest deal risks during diligence — when it's too late to fix them. Scorta's AI surfaces the issues early, in plain language, and tells you exactly what to do about each one."
          bullets={[
            "Owner-dependency risk flagged before it becomes a buyer objection",
            "Customer concentration and revenue quality assessed in real time",
            "Missing documents and compliance gaps identified before diligence",
          ]}
        />
        <GradientOrbCard
          orb1={C.gradPeach}
          orb2={C.gradRose}
          badge="Your exit path"
          headline="Map the path from 'I wonder' to 'I know.'"
          body="Whether you're curious about your number or actively planning an exit, Scorta gives you the intelligence layer that transforms an owner-operated company into a buyer-ready asset."
          bullets={[
            "Personalized 90-day roadmap showing what to improve — and in what order",
            "SBA loan qualification check so you know what buyers can actually pay",
            "Broker-free path guidance from first interest to signed deal",
          ]}
        />
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Answer six quick signals",
      desc: "Share your industry, annual revenue, seller's discretionary earnings, growth trend, owner dependency, and sale timeline. Takes about two minutes.",
    },
    {
      num: "02",
      title: "ExitIQ runs the analysis",
      desc: "The AI engine compares your inputs against real transaction data to model your valuation range, buyer fit, SBA financeability, and top risk factors.",
    },
    {
      num: "03",
      title: "Get your Exit IQ Report",
      desc: "Download a personalized breakdown of what your business is worth, what buyers will scrutinize, and exactly how to improve your position before going to market.",
    },
  ]

  return (
    <section style={{ padding: "96px 48px", background: C.canvasSoft, borderTop: `1px solid ${C.hairline}` }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={badgeStyle}>How it works</span>
          <h2
            style={{
              ...displayStyle(42),
              marginTop: 20,
            }}
          >
            From signal to strategy in minutes
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, position: "relative" }}>
          {/* Connector line */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: "16.6%",
              right: "16.6%",
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.hairlineStrong} 20%, ${C.hairlineStrong} 80%, transparent)`,
              pointerEvents: "none",
            }}
          />

          {steps.map(({ num, title, desc }) => (
            <div key={num} style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: C.surfaceCard,
                  border: `1px solid ${C.hairlineStrong}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: inter,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.muted,
                  letterSpacing: "0.5px",
                }}
              >
                {num}
              </div>
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 17,
                  fontWeight: 500,
                  color: C.ink,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 15,
                  fontWeight: 400,
                  color: C.body,
                  lineHeight: 1.6,
                  letterSpacing: "0.15px",
                }}
              >
                {desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA Band ──────────────────────────────────────────────────────────────────
function CTABand({ onOpen }: { onOpen: () => void }) {
  return (
    <section
      style={{
        padding: "96px 48px",
        background: C.canvas,
        borderTop: `1px solid ${C.hairline}`,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Orbs */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 400,
          background:
            "radial-gradient(ellipse at 35% 50%, rgba(168,200,232,0.3) 0%, transparent 55%)," +
            "radial-gradient(ellipse at 65% 50%, rgba(232,184,196,0.25) 0%, transparent 50%)",
          pointerEvents: "none",
          filter: "blur(12px)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <h2
          style={{
            ...displayStyle(42),
            maxWidth: 640,
            margin: "0 auto 20px",
            lineHeight: 1.1,
          }}
        >
          Ready to know what your business is worth?
        </h2>
        <p
          style={{
            fontFamily: inter,
            fontSize: 16,
            fontWeight: 400,
            color: C.muted,
            lineHeight: 1.55,
            letterSpacing: "0.16px",
            marginBottom: 40,
          }}
        >
          Start your Exit IQ assessment free — no login, no broker call required.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
          <button
            onClick={onOpen}
            style={{ ...pillPrimary, height: 48, padding: "0 28px", fontSize: 16 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.ink)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
          >
            Start free assessment →
          </button>
          <button style={{ ...pillOutline, height: 48, padding: "0 27px", fontSize: 16 }}>
            Learn more
          </button>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function FooterSection() {
  const cols = [
    { heading: "Platform", links: ["ExitIQ Assessment", "Valuation Range", "Readiness Score", "SBA Financeability"] },
    { heading: "Company", links: ["About Scorta", "For sellers", "How it works", "Pricing"] },
    { heading: "Legal", links: ["Privacy policy", "Terms of service", "Disclaimer"] },
  ]

  return (
    <footer
      style={{
        background: C.canvas,
        borderTop: `1px solid ${C.hairline}`,
        padding: "64px 48px 40px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }}>
          {/* Brand column */}
          <div>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 22,
                fontWeight: 300,
                color: C.ink,
                letterSpacing: "-0.3px",
                marginBottom: 14,
              }}
            >
              Scorta
            </div>
            <p
              style={{
                fontFamily: inter,
                fontSize: 14,
                fontWeight: 400,
                color: C.muted,
                lineHeight: 1.6,
                maxWidth: 260,
              }}
            >
              The AI-native exit intelligence platform for Main Street businesses. Know what your business is worth before you need to sell.
            </p>
          </div>
          {/* Link columns */}
          {cols.map(({ heading, links }) => (
            <div key={heading}>
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  color: C.mutedSoft,
                  marginBottom: 16,
                }}
              >
                {heading}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map((l) => (
                  <span
                    key={l}
                    style={{
                      fontFamily: inter,
                      fontSize: 14,
                      fontWeight: 400,
                      color: C.body,
                      cursor: "pointer",
                      lineHeight: 1.5,
                    }}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: `1px solid ${C.hairline}`,
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: inter,
              fontSize: 13,
              color: C.mutedSoft,
            }}
          >
            © 2025 Scorta. For informational purposes only. Not financial advice.
          </span>
          <span
            style={{
              fontFamily: inter,
              fontSize: 13,
              color: C.mutedSoft,
            }}
          >
            Built for the next generation of Main Street ownership transfers.
          </span>
        </div>
      </div>
    </footer>
  )
}

// ── Root Export ───────────────────────────────────────────────────────────────
export function ScortaLanding() {
  const [appOpen, setAppOpen] = React.useState(false)

  return (
    <>
      {appOpen && <ExitIQOverlay onClose={() => setAppOpen(false)} />}

      <div
        style={{
          background: C.canvas,
          color: C.ink,
          fontFamily: inter,
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <TopNav onStart={() => setAppOpen(true)} />
        <HeroSection onStart={() => setAppOpen(true)} />
        <StatsBand />
        <FeatureSection />
        <ProductDetailSection />
        <HowItWorksSection />
        <CTABand onOpen={() => setAppOpen(true)} />
        <FooterSection />
      </div>
    </>
  )
}

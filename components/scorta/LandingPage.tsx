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
  dark: "#0c0a09",
  darkElevated: "#1c1917",
  darkBorder: "rgba(245,245,245,0.08)",
  darkBorderStrong: "rgba(245,245,245,0.14)",
  onDark: "rgba(245,245,245,0.92)",
  onDarkBody: "rgba(245,245,245,0.55)",
  onDarkMuted: "rgba(245,245,245,0.32)",
}

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"

// ── Shared style helpers ──────────────────────────────────────────────────────
function displayStyle(size: number, dark = false): React.CSSProperties {
  const sp = size >= 56 ? "-1.92px" : size >= 44 ? "-0.96px" : size >= 34 ? "-0.36px" : "-0.32px"
  return {
    fontFamily: garamond,
    fontSize: size,
    fontWeight: 300,
    lineHeight: 1.05,
    letterSpacing: sp,
    color: dark ? C.onDark : C.ink,
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

function badge(dark = false): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    background: dark ? "rgba(245,245,245,0.07)" : C.surfaceStrong,
    borderRadius: 9999,
    fontFamily: inter,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.96px",
    textTransform: "uppercase",
    color: dark ? C.onDarkMuted : C.muted,
    border: dark ? `1px solid ${C.darkBorder}` : "none",
  }
}

function dotGrid(): React.CSSProperties {
  return {
    backgroundImage: "radial-gradient(circle, rgba(245,245,245,0.055) 1px, transparent 1px)",
    backgroundSize: "28px 28px",
  }
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

// ── ExitIQ Overlay ────────────────────────────────────────────────────────────
function ExitIQOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        transform: "translateZ(0)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <button
        onClick={onClose}
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

// ── Announcement Bar ──────────────────────────────────────────────────────────
function AnnouncementBar({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      style={{
        background: C.primary,
        color: "rgba(245,245,245,0.85)",
        padding: "10px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        position: "relative",
        zIndex: 101,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: C.gradMint,
          boxShadow: `0 0 8px ${C.gradMint}`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: inter,
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.1px",
          textAlign: "center",
        }}
      >
        Most owners discover deal-killing issues too late.{" "}
        <span style={{ color: C.gradMint }}>Scorta surfaces them before buyers do.</span>
      </span>
      <button
        onClick={onDismiss}
        style={{
          position: "absolute",
          right: 20,
          background: "none",
          border: "none",
          color: "rgba(245,245,245,0.45)",
          cursor: "pointer",
          fontSize: 18,
          lineHeight: 1,
          padding: "0 4px",
        }}
      >
        ×
      </button>
    </div>
  )
}

// ── Top Navigation ────────────────────────────────────────────────────────────
function TopNav({ onStart, hasBar }: { onStart: () => void; hasBar: boolean }) {
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
        top: hasBar ? 37 : 0,
        zIndex: 100,
      }}
    >
      <div
        style={{ fontFamily: garamond, fontSize: 22, fontWeight: 300, color: C.ink, letterSpacing: "-0.3px", cursor: "default" }}
      >
        Scorta
      </div>
      <div style={{ display: "flex", gap: 32 }}>
        {[
          { label: "Features", id: "features" },
          { label: "How it works", id: "how-it-works" },
          { label: "For sellers", id: "for-sellers" },
          { label: "Vision", id: "vision" },
        ].map(({ label, id }) => (
          <span
            key={id}
            onClick={() => scrollTo(id)}
            style={{ fontFamily: inter, fontSize: 15, fontWeight: 500, color: C.body, cursor: "pointer" }}
          >
            {label}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontFamily: inter, fontSize: 15, fontWeight: 500, color: C.body, cursor: "pointer" }}>Sign in</span>
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

// ── ExitIQ Preview Card (unchanged from original) ─────────────────────────────
function ExitIQPreviewCard({ onOpen }: { onOpen: () => void }) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div style={{ position: "relative", marginTop: 16 }}>
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
        {/* Fake nav */}
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
              height: 30, padding: "0 14px", background: "rgba(245,245,245,0.08)",
              border: "1px solid rgba(245,245,245,0.12)", borderRadius: 9999,
              fontFamily: inter, fontSize: 12, fontWeight: 500, color: "rgba(245,245,245,0.6)",
              display: "flex", alignItems: "center",
            }}
          >
            Start ExitIQ
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 0, minHeight: 340 }}>
          {/* Left */}
          <div style={{ padding: "28px 28px 24px", borderRight: "1px solid rgba(245,245,245,0.06)" }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.96px", textTransform: "uppercase", color: "rgba(167,229,211,0.65)", fontFamily: inter, marginBottom: 14 }}>
              ExitIQ Liquid Engine
            </div>
            <h2 style={{ fontFamily: garamond, fontSize: 28, fontWeight: 300, color: "rgba(245,245,245,0.92)", lineHeight: 1.08, letterSpacing: "-0.6px", marginBottom: 10 }}>
              See what buyers would pay — before you ever talk to a broker.
            </h2>
            <p style={{ fontFamily: inter, fontSize: 13, fontWeight: 400, color: "rgba(245,245,245,0.42)", lineHeight: 1.6, letterSpacing: "0.1px", marginBottom: 24 }}>
              ExitIQ analyzes your valuation range, likely buyer pool, broker-fee exposure, and deal risks through an AI-guided assessment.
            </p>
            <div style={{ background: "rgba(245,245,245,0.04)", border: "1px solid rgba(245,245,245,0.09)", borderRadius: 14, padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ fontFamily: inter, fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(245,245,245,0.35)", marginBottom: 8 }}>
                Question 1 of 6
              </div>
              <div style={{ fontFamily: garamond, fontSize: 18, fontWeight: 300, color: "rgba(245,245,245,0.85)", marginBottom: 14, lineHeight: 1.3, letterSpacing: "-0.2px" }}>
                What industry is your business in?
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Retail / E-commerce", "Food & Beverage", "Professional Services", "Healthcare"].map((opt, i) => (
                  <div key={opt} style={{ padding: "7px 13px", borderRadius: 9999, fontFamily: inter, fontSize: 12, fontWeight: 500,
                    color: i === 2 ? "rgba(167,229,211,0.85)" : "rgba(245,245,245,0.5)",
                    background: i === 2 ? "rgba(167,229,211,0.1)" : "rgba(245,245,245,0.05)",
                    border: `1px solid ${i === 2 ? "rgba(167,229,211,0.3)" : "rgba(245,245,245,0.1)"}`,
                  }}>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Professional Services", "12 employees"].map((chip) => (
                <div key={chip} style={{ padding: "3px 10px", borderRadius: 9999, fontFamily: inter, fontSize: 11, fontWeight: 500, color: "rgba(245,245,245,0.4)", background: "rgba(245,245,245,0.04)", border: "1px solid rgba(245,245,245,0.08)" }}>
                  {chip}
                </div>
              ))}
            </div>
          </div>

          {/* Right — dashboard */}
          <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 10, background: "rgba(245,245,245,0.015)" }}>
            <div style={{ background: "rgba(245,245,245,0.04)", border: "1px solid rgba(245,245,245,0.08)", borderRadius: 12, padding: "13px 14px" }}>
              <div style={{ fontFamily: inter, fontSize: 9, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(245,245,245,0.3)", marginBottom: 6 }}>Exit Readiness Score</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 4, background: "rgba(245,245,245,0.08)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: "67%", height: "100%", background: "linear-gradient(90deg, rgba(167,229,211,0.7), rgba(167,229,211,0.4))", borderRadius: 2 }} />
                </div>
                <span style={{ fontFamily: garamond, fontSize: 16, fontWeight: 300, color: "#a7e5d3", letterSpacing: "-0.1px" }}>67%</span>
              </div>
            </div>
            <div style={{ background: "rgba(245,245,245,0.04)", border: "1px solid rgba(245,245,245,0.08)", borderRadius: 12, padding: "13px 14px" }}>
              <div style={{ fontFamily: inter, fontSize: 9, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(245,245,245,0.3)", marginBottom: 5 }}>Est. Valuation Range</div>
              <div style={{ fontFamily: garamond, fontSize: 20, fontWeight: 300, color: "rgba(245,245,245,0.88)", letterSpacing: "-0.3px" }}>$1.2M – $2.4M</div>
              <div style={{ fontFamily: inter, fontSize: 10, color: "#10b981", fontWeight: 500, marginTop: 2 }}>3.1× SDE multiple</div>
            </div>
            <div style={{ background: "rgba(244,197,168,0.06)", border: "1px solid rgba(244,197,168,0.15)", borderRadius: 12, padding: "13px 14px" }}>
              <div style={{ fontFamily: inter, fontSize: 9, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(244,197,168,0.45)", marginBottom: 5 }}>Broker Fee Exposure</div>
              <div style={{ fontFamily: garamond, fontSize: 20, fontWeight: 300, color: "#f4c5a8", letterSpacing: "-0.3px" }}>$96K – $192K</div>
              <div style={{ fontFamily: inter, fontSize: 10, color: "rgba(244,197,168,0.45)", fontWeight: 400, marginTop: 2 }}>8–10% of deal value</div>
            </div>
            <div style={{ background: "rgba(200,184,224,0.06)", border: "1px solid rgba(200,184,224,0.15)", borderRadius: 12, padding: "13px 14px" }}>
              <div style={{ fontFamily: inter, fontSize: 9, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(200,184,224,0.45)", marginBottom: 5 }}>SBA Financeability</div>
              <div style={{ fontFamily: inter, fontSize: 13, fontWeight: 400, color: "rgba(245,245,245,0.65)", lineHeight: 1.4 }}>Likely qualifies for SBA 7(a)</div>
              <div style={{ fontFamily: inter, fontSize: 10, color: "rgba(200,184,224,0.45)", marginTop: 2 }}>DSCR within lender range</div>
            </div>
            <div style={{ background: "rgba(245,245,245,0.03)", border: "1px solid rgba(245,245,245,0.07)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: inter, fontSize: 11, fontWeight: 500, color: "rgba(245,245,245,0.3)" }}>90-day roadmap</span>
              <span style={{ fontFamily: inter, fontSize: 9, fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase", color: "rgba(245,245,245,0.22)" }}>Locked</span>
            </div>
          </div>
        </div>

        {/* Click CTA */}
        <div style={{ borderTop: "1px solid rgba(245,245,245,0.07)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(245,245,245,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.8)", animation: "liveBlink 2s infinite" }} />
            <span style={{ fontFamily: inter, fontSize: 13, fontWeight: 500, color: "rgba(245,245,245,0.55)", letterSpacing: "0.1px" }}>
              Free assessment · No login · No broker call
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: inter, fontSize: 14, fontWeight: 500, color: hovered ? "rgba(167,229,211,0.9)" : "rgba(245,245,245,0.7)", transition: "color 0.2s" }}>
            Start your assessment
            <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7.5 4l3.5 3-3.5 3" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <p style={{ fontFamily: inter, fontSize: 13, color: C.mutedSoft, textAlign: "center", marginTop: 16, letterSpacing: "0.1px" }}>
        Click anywhere on the card to try ExitIQ live
      </p>
    </div>
  )
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <section style={{ padding: "88px 48px 64px", textAlign: "center", position: "relative", overflow: "visible" }}>
      <div
        style={{
          position: "absolute", top: "-5%", left: "50%", transform: "translateX(-50%)",
          width: 900, height: 480,
          background:
            "radial-gradient(ellipse at 30% 35%, rgba(167,229,211,0.32) 0%, transparent 52%)," +
            "radial-gradient(ellipse at 72% 28%, rgba(244,197,168,0.28) 0%, transparent 48%)," +
            "radial-gradient(ellipse at 50% 75%, rgba(200,184,224,0.22) 0%, transparent 50%)",
          pointerEvents: "none", filter: "blur(8px)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <span style={badge()}>AI Exit Intelligence for Main Street Businesses</span>
        </div>
        <h1 style={{ ...displayStyle(60), maxWidth: 820, margin: "0 auto 24px", lineHeight: 1.04 }}>
          Know if your business is ready to sell — before buyers find the problems.
        </h1>
        <p style={{ fontFamily: inter, fontSize: 18, fontWeight: 400, lineHeight: 1.55, letterSpacing: "0.15px", color: C.muted, maxWidth: 620, margin: "0 auto 16px" }}>
          Scorta helps small-business owners understand what their business may be worth, what could reduce its value, and what to fix before going to market.
        </p>
        <p style={{ fontFamily: inter, fontSize: 15, fontWeight: 400, lineHeight: 1.6, letterSpacing: "0.15px", color: C.mutedSoft, maxWidth: 580, margin: "0 auto 40px" }}>
          Take the free ExitIQ assessment to get a valuation range, Exit Readiness Score, SBA financeability view, broker-fee impact, and personalized roadmap showing what buyers, lenders, and advisors would want to see before a deal.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
          <button
            onClick={onStart}
            style={{ ...pillPrimary, height: 48, padding: "0 28px", fontSize: 16 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.ink)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
          >
            Start Free ExitIQ Assessment
          </button>
          <button
            onClick={() => scrollTo("features")}
            style={{ ...pillOutline, height: 48, padding: "0 27px", fontSize: 16 }}
          >
            See what Scorta analyzes
          </button>
        </div>
        <p style={{ fontFamily: inter, fontSize: 13, color: C.mutedSoft, marginBottom: 72 }}>
          Private assessment. No public listing. No broker commitment.
        </p>
        <ExitIQPreviewCard onOpen={onStart} />
      </div>
    </section>
  )
}

// ── Value Cards Strip ─────────────────────────────────────────────────────────
function ValueCardsStrip() {
  const cards = [
    {
      orb: C.gradMint,
      title: "Valuation Clarity",
      desc: "Understand your likely valuation range before you speak to buyers or brokers.",
      num: "01",
    },
    {
      orb: C.gradPeach,
      title: "Buyer Readiness",
      desc: "See what serious buyers would question, request, or use to discount your price.",
      num: "02",
    },
    {
      orb: C.gradLavender,
      title: "Financing Insight",
      desc: "Learn whether your business may be attractive to SBA-financed acquisition buyers.",
      num: "03",
    },
    {
      orb: C.gradSky,
      title: "Exit Roadmap",
      desc: "Get a personalized action plan to improve transferability and buyer confidence.",
      num: "04",
    },
  ]

  return (
    <div style={{ background: C.surfaceCard, borderTop: `1px solid ${C.hairline}`, borderBottom: `1px solid ${C.hairline}`, padding: "52px 48px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
        {cards.map(({ orb, title, desc, num }, idx) => (
          <div
            key={title}
            style={{
              padding: "28px 28px",
              borderRight: idx < cards.length - 1 ? `1px solid ${C.hairline}` : "none",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute", top: -30, right: -30, width: 100, height: 100,
                background: `radial-gradient(circle at 50% 50%, ${orb}50 0%, transparent 65%)`,
                pointerEvents: "none",
              }}
            />
            <div style={{ fontFamily: inter, fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", color: C.mutedSoft, marginBottom: 16 }}>
              {num}
            </div>
            <div style={{ fontFamily: inter, fontSize: 16, fontWeight: 500, color: C.ink, marginBottom: 10, lineHeight: 1.3 }}>
              {title}
            </div>
            <div style={{ fontFamily: inter, fontSize: 14, fontWeight: 400, color: C.body, lineHeight: 1.6, letterSpacing: "0.1px" }}>
              {desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Problem Section (dark) ────────────────────────────────────────────────────
function ProblemSection() {
  const questions = [
    "What is my business actually worth?",
    "Would serious buyers trust my numbers?",
    "Could a buyer get financing for this acquisition?",
    "What would cause buyers to discount my business?",
    "What documents am I missing?",
    "Is my business too dependent on me?",
    "Should I sell now, wait, or fix key issues first?",
    "How can I improve valuation before going to market?",
  ]

  return (
    <section
      id="problem"
      style={{ background: C.dark, padding: "96px 48px", position: "relative", overflow: "hidden", ...dotGrid() }}
    >
      {/* Mint orb */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, background: "radial-gradient(ellipse at 50% 50%, rgba(167,229,211,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "5%", width: 400, height: 400, background: "radial-gradient(ellipse at 50% 50%, rgba(200,184,224,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start", position: "relative", zIndex: 1 }}>
        {/* Left */}
        <div>
          <span style={badge(true)}>The hidden cost of being unprepared</span>
          <h2 style={{ ...displayStyle(42, true), marginTop: 24, marginBottom: 24, lineHeight: 1.1 }}>
            Most owners do not know their business is not buyer-ready until it is too late.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 16, fontWeight: 400, color: C.onDarkBody, lineHeight: 1.7, letterSpacing: "0.15px", marginBottom: 20 }}>
            Selling a small business is not just about finding a buyer. It is about proving that the business is transferable, financeable, and worth the price.
          </p>
          <p style={{ fontFamily: inter, fontSize: 16, fontWeight: 400, color: C.onDarkBody, lineHeight: 1.7, letterSpacing: "0.15px", marginBottom: 20 }}>
            Buyers want clean financials, clear operations, low owner dependence, reliable employees, strong margins, stable customers, assignable leases, and a story they can believe.
          </p>
          <p style={{ fontFamily: inter, fontSize: 15, fontWeight: 400, color: C.onDarkMuted, lineHeight: 1.7, letterSpacing: "0.15px" }}>
            Most owners only discover these requirements after the process begins. By then, missing documents, messy books, customer concentration, or owner-dependence risk can lead to delays, lower offers, and failed diligence.
          </p>
        </div>

        {/* Right — questions */}
        <div>
          <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, letterSpacing: "0.96px", textTransform: "uppercase", color: C.onDarkMuted, marginBottom: 20 }}>
            Questions Scorta helps you answer
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {questions.map((q, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 16px",
                  borderBottom: `1px solid ${C.darkBorder}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: C.gradMint,
                    boxShadow: `0 0 6px ${C.gradMint}80`,
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
                <span style={{ fontFamily: inter, fontSize: 15, fontWeight: 400, color: C.onDark, lineHeight: 1.5, letterSpacing: "0.1px" }}>
                  {q}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(167,229,211,0.06)", border: "1px solid rgba(167,229,211,0.15)", borderRadius: 10 }}>
            <span style={{ fontFamily: inter, fontSize: 13, fontWeight: 500, color: "rgba(167,229,211,0.7)", lineHeight: 1.5 }}>
              Scorta surfaces these answers before buyers use them against you.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── What Scorta Gives You ─────────────────────────────────────────────────────
function WhatScortaGivesYou({ onStart }: { onStart: () => void }) {
  const products = [
    {
      num: "01", orb: C.gradMint,
      title: "AI Valuation Range",
      desc: "See a directional valuation range based on industry, revenue, profit, business quality, and transferability signals.",
    },
    {
      num: "02", orb: C.gradPeach,
      title: "Exit Readiness Score",
      desc: "Understand how prepared your business is for buyer conversations, diligence, and a future transaction.",
    },
    {
      num: "03", orb: C.gradLavender,
      title: "Buyer Risk Analysis",
      desc: "Identify the issues buyers may use to discount value, delay the process, or walk away from the deal.",
    },
    {
      num: "04", orb: C.gradSky,
      title: "SBA Financeability View",
      desc: "Learn whether your business may be attractive to acquisition buyers relying on SBA financing.",
    },
    {
      num: "05", orb: C.gradRose,
      title: "Document Readiness Checklist",
      desc: "Know what financial, legal, operational, lease, employee, and customer information buyers may request.",
    },
    {
      num: "06", orb: C.gradMint,
      title: "Value Optimization Roadmap",
      desc: "Get clear next steps to improve sellability, reduce friction, and prepare for a stronger exit.",
    },
  ]

  return (
    <section id="features" style={{ padding: "96px 48px", background: C.canvas }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ maxWidth: 700, marginBottom: 64 }}>
          <span style={badge()}>What Scorta gives you</span>
          <h2 style={{ ...displayStyle(44), marginTop: 20, marginBottom: 20, lineHeight: 1.08 }}>
            A smarter way to prepare your business for its most important transaction.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 16, fontWeight: 400, color: C.body, lineHeight: 1.7, letterSpacing: "0.15px", marginBottom: 12 }}>
            Scorta turns fragmented business information into a clear exit-readiness profile. Instead of guessing what your company is worth or waiting for buyers to uncover weaknesses, our AI analyzes the factors that influence valuation, buyer confidence, and deal completion.
          </p>
          <p style={{ fontFamily: inter, fontSize: 16, fontWeight: 400, color: C.body, lineHeight: 1.7, letterSpacing: "0.15px" }}>
            The result is a practical, owner-friendly roadmap showing where your business stands today, what could increase or reduce value, and what to prepare before you ever list, negotiate, or enter diligence.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {products.map(({ num, orb, title, desc }) => (
            <div
              key={title}
              style={{
                background: C.surfaceCard,
                borderRadius: 16,
                padding: "28px 26px 32px",
                border: `1px solid ${C.hairline}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute", top: -24, right: -24, width: 100, height: 100,
                  background: `radial-gradient(circle at 50% 50%, ${orb}55 0%, transparent 65%)`,
                  pointerEvents: "none",
                }}
              />
              <div style={{ fontFamily: inter, fontSize: 11, fontWeight: 600, letterSpacing: "0.96px", color: C.mutedSoft, marginBottom: 16 }}>
                {num}
              </div>
              <div style={{ fontFamily: inter, fontSize: 17, fontWeight: 500, color: C.ink, marginBottom: 10, lineHeight: 1.3 }}>
                {title}
              </div>
              <div style={{ fontFamily: inter, fontSize: 14, fontWeight: 400, color: C.body, lineHeight: 1.65, letterSpacing: "0.1px" }}>
                {desc}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <button
            onClick={onStart}
            style={{ ...pillPrimary, height: 48, padding: "0 28px", fontSize: 16 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.ink)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
          >
            Start Free ExitIQ Assessment
          </button>
          <p style={{ fontFamily: inter, fontSize: 13, color: C.mutedSoft, marginTop: 12 }}>
            Free assessment. No broker commitment. No public listing. Your information stays private.
          </p>
        </div>
      </div>
    </section>
  )
}

// ── How ExitIQ Works ──────────────────────────────────────────────────────────
function HowExitIQWorks({ onStart }: { onStart: () => void }) {
  const steps = [
    {
      num: "01",
      title: "Answer a few targeted questions",
      desc: "Tell ExitIQ about your industry, revenue, profit, owner involvement, employees, customers, lease, documents, and exit timeline. You do not need perfect numbers — ExitIQ is designed to help you identify what is missing, what matters, and what could impact your future sale.",
    },
    {
      num: "02",
      title: "Get your AI-powered readiness profile",
      desc: "ExitIQ analyzes the signals buyers, lenders, and advisors care about most — valuation, transferability, financeability, documentation, and operational risk. The analysis runs instantly against real deal benchmarks.",
    },
    {
      num: "03",
      title: "See what to fix before going to market",
      desc: "Receive a personalized roadmap showing what could hurt value, what is missing, and where to focus before listing or speaking with buyers. Clear, prioritized, and actionable.",
    },
    {
      num: "04",
      title: "Prepare for a stronger exit",
      desc: "Use Scorta to build toward a cleaner, more confident, more buyer-ready transaction long before diligence begins. Return as you make improvements to track your readiness over time.",
    },
  ]

  return (
    <section id="how-it-works" style={{ padding: "96px 48px", background: C.canvasSoft, borderTop: `1px solid ${C.hairline}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <span style={badge()}>Free AI assessment</span>
          <h2 style={{ ...displayStyle(44), marginTop: 20, marginBottom: 16, lineHeight: 1.08 }}>
            From business details to exit intelligence in minutes.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 16, color: C.muted, lineHeight: 1.55, maxWidth: 480, margin: "0 auto" }}>
            Built for owners who want clarity before making a life-changing decision.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {steps.map(({ num, title, desc }) => (
            <div
              key={num}
              style={{
                background: C.surfaceCard,
                borderRadius: 16,
                padding: "32px",
                border: `1px solid ${C.hairline}`,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: `1px solid ${C.hairlineStrong}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: inter,
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.muted,
                    letterSpacing: "0.5px",
                    flexShrink: 0,
                  }}
                >
                  {num}
                </div>
                <div style={{ fontFamily: inter, fontSize: 17, fontWeight: 500, color: C.ink, lineHeight: 1.3 }}>
                  {title}
                </div>
              </div>
              <div style={{ fontFamily: inter, fontSize: 15, fontWeight: 400, color: C.body, lineHeight: 1.65, letterSpacing: "0.15px" }}>
                {desc}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <button
            onClick={onStart}
            style={{ ...pillPrimary, height: 48, padding: "0 28px", fontSize: 16 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.ink)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
          >
            Start Free ExitIQ Assessment
          </button>
        </div>
      </div>
    </section>
  )
}

// ── What Buyers Care About (dark terminal) ────────────────────────────────────
function WhatBuyersCareAbout() {
  const criteria = [
    { label: "Financials", desc: "Are revenue, expenses, profit, and add-backs clear enough to trust?", orb: C.gradMint },
    { label: "Owner Dependence", desc: "Can the business run without the owner being involved in every decision?", orb: C.gradPeach },
    { label: "Customer Quality", desc: "Is revenue diversified, recurring, repeatable, or overly concentrated?", orb: C.gradLavender },
    { label: "Employees", desc: "Are key people likely to stay after a transaction closes?", orb: C.gradSky },
    { label: "Lease & Location", desc: "Can the buyer assume or renegotiate the lease without major risk?", orb: C.gradRose },
    { label: "Growth Story", desc: "Are there believable ways for a buyer to grow the business after acquisition?", orb: C.gradMint },
    { label: "Documentation", desc: "Are tax returns, P&Ls, payroll, contracts, and operational records ready?", orb: C.gradPeach },
    { label: "Financing Eligibility", desc: "Would a lender understand and support the acquisition structure?", orb: C.gradLavender },
  ]

  return (
    <section
      id="what-buyers-see"
      style={{ background: C.dark, padding: "96px 48px", position: "relative", overflow: "hidden", ...dotGrid() }}
    >
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 800, height: 500, background: "radial-gradient(ellipse at 40% 50%, rgba(168,200,232,0.07) 0%, transparent 55%), radial-gradient(ellipse at 65% 40%, rgba(200,184,224,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={badge(true)}>What buyers see</span>
          <h2 style={{ ...displayStyle(44, true), marginTop: 20, marginBottom: 20, lineHeight: 1.08 }}>
            Buyers are not just buying your revenue. They are buying proof.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 16, fontWeight: 400, color: C.onDarkBody, lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
            A profitable business can still be difficult to sell if buyers cannot understand the numbers, trust the operations, or see how the company runs without the current owner.
          </p>
        </div>

        {/* Terminal-style grid */}
        <div
          style={{
            background: "rgba(245,245,245,0.02)",
            border: `1px solid ${C.darkBorder}`,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {/* Terminal header */}
          <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.darkBorder}`, display: "flex", alignItems: "center", gap: 10, background: "rgba(245,245,245,0.025)" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[C.gradRose, C.gradPeach, C.gradMint].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: `${c}60`, border: `1px solid ${c}40` }} />
              ))}
            </div>
            <span style={{ fontFamily: inter, fontSize: 11, fontWeight: 600, letterSpacing: "0.9px", textTransform: "uppercase", color: C.onDarkMuted, marginLeft: 8 }}>
              Buyer Due Diligence Scan · 8 evaluation criteria
            </span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gradMint, boxShadow: `0 0 6px ${C.gradMint}` }} />
              <span style={{ fontFamily: inter, fontSize: 11, color: "rgba(167,229,211,0.6)", fontWeight: 500 }}>Scorta analyzes all of these</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {criteria.map(({ label, desc, orb }, idx) => {
              const isLastRow = idx >= 4
              const isLastCol = idx % 4 === 3
              return (
                <div
                  key={label}
                  style={{
                    padding: "24px 22px",
                    borderRight: isLastCol ? "none" : `1px solid ${C.darkBorder}`,
                    borderBottom: isLastRow ? "none" : `1px solid ${C.darkBorder}`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, background: `radial-gradient(circle at 50% 50%, ${orb}25 0%, transparent 65%)`, pointerEvents: "none" }} />
                  <div style={{ fontFamily: inter, fontSize: 11, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase", color: `${orb}80`, marginBottom: 8 }}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontFamily: inter, fontSize: 14, fontWeight: 600, color: C.onDark, marginBottom: 8, lineHeight: 1.3 }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: inter, fontSize: 13, fontWeight: 400, color: C.onDarkBody, lineHeight: 1.6 }}>
                    {desc}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p style={{ fontFamily: inter, fontSize: 15, fontWeight: 400, color: C.onDarkMuted, textAlign: "center", marginTop: 28, lineHeight: 1.6 }}>
          Scorta helps you prepare around every factor that drives buyer confidence — long before the conversation starts.
        </p>
      </div>
    </section>
  )
}

// ── Cost of Waiting ───────────────────────────────────────────────────────────
function CostOfWaiting({ onStart }: { onStart: () => void }) {
  return (
    <section id="cost-of-waiting" style={{ padding: "96px 48px", background: C.canvas, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 800, height: 500, background: "radial-gradient(ellipse at 40% 50%, rgba(244,197,168,0.2) 0%, transparent 55%), radial-gradient(ellipse at 65% 40%, rgba(232,184,196,0.18) 0%, transparent 50%)", pointerEvents: "none", filter: "blur(8px)" }} />

      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <span style={badge()}>The cost of waiting</span>
        <h2 style={{ ...displayStyle(48), marginTop: 24, marginBottom: 28, lineHeight: 1.07 }}>
          The best time to prepare your business for sale is before you need to sell.
        </h2>
        <p style={{ fontFamily: inter, fontSize: 17, fontWeight: 400, color: C.body, lineHeight: 1.7, letterSpacing: "0.15px", marginBottom: 16 }}>
          If you wait until you are ready to exit, your options may already be limited. The issues that hurt valuation are often fixable — but only if you find them early. Messy books, unclear roles, weak documentation, customer concentration, and owner dependence can take months or years to improve.
        </p>
        <p style={{ fontFamily: inter, fontSize: 17, fontWeight: 400, color: C.body, lineHeight: 1.7, letterSpacing: "0.15px", marginBottom: 40 }}>
          Scorta helps you see those issues now, while you still have time to increase transferability, strengthen buyer confidence, and protect the value you have built.
        </p>
        <div
          style={{
            background: C.surfaceCard,
            border: `1px solid ${C.hairlineStrong}`,
            borderRadius: 16,
            padding: "28px 36px",
            marginBottom: 44,
            position: "relative",
          }}
        >
          <p style={{ fontFamily: garamond, fontSize: 26, fontWeight: 300, color: C.ink, lineHeight: 1.2, letterSpacing: "-0.3px", margin: 0 }}>
            "Do not wait until diligence to learn what your business should have been preparing all along."
          </p>
        </div>
        <button
          onClick={onStart}
          style={{ ...pillPrimary, height: 48, padding: "0 28px", fontSize: 16 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.ink)}
          onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
        >
          Start Free ExitIQ Assessment
        </button>
        <p style={{ fontFamily: inter, fontSize: 13, color: C.mutedSoft, marginTop: 12 }}>
          Find out what your business may be worth, what buyers would flag, and what to fix.
        </p>
      </div>
    </section>
  )
}

// ── Who It's For ──────────────────────────────────────────────────────────────
function WhoItsFor() {
  const profiles = [
    {
      title: "Owners considering retirement",
      desc: "You want to understand what the business is worth and what needs to happen before your next chapter.",
      orb: C.gradMint,
    },
    {
      title: "Burned-out operators",
      desc: "You are wondering whether to sell, step back, hire management, or make the business less dependent on you.",
      orb: C.gradPeach,
    },
    {
      title: "Owners approached by buyers",
      desc: "Someone expressed interest, but you do not know how to respond, what to share, or what the business is worth.",
      orb: C.gradLavender,
    },
    {
      title: "Owners preparing years ahead",
      desc: "You want to increase value, clean up risks, and make the business more transferable before going to market.",
      orb: C.gradSky,
    },
    {
      title: "Family-owned businesses",
      desc: "You need clarity around succession, sale options, or whether the next generation actually wants to operate the company.",
      orb: C.gradRose,
    },
    {
      title: "Service business owners",
      desc: "Your company generates strong cash flow, but buyers may care about owner dependence, contracts, margins, and repeatability.",
      orb: C.gradMint,
    },
  ]

  return (
    <section id="for-sellers" style={{ padding: "96px 48px", background: C.canvasSoft, borderTop: `1px solid ${C.hairline}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ maxWidth: 700, marginBottom: 64 }}>
          <span style={badge()}>Built for owners with something valuable to protect</span>
          <h2 style={{ ...displayStyle(44), marginTop: 20, marginBottom: 20, lineHeight: 1.08 }}>
            For business owners who want clarity before making a life-changing decision.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 16, fontWeight: 400, color: C.body, lineHeight: 1.7, letterSpacing: "0.15px" }}>
            Scorta is designed for owners who are not necessarily ready to sell tomorrow, but know their business may be their largest asset — and want to understand how prepared it really is.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {profiles.map(({ title, desc, orb }) => (
            <div
              key={title}
              style={{
                background: C.surfaceCard,
                borderRadius: 16,
                padding: "28px 26px",
                border: `1px solid ${C.hairline}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: -20, left: -20, width: 80, height: 80, background: `radial-gradient(circle at 50% 50%, ${orb}40 0%, transparent 65%)`, pointerEvents: "none" }} />
              <div style={{ fontFamily: inter, fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 10, lineHeight: 1.3 }}>
                {title}
              </div>
              <div style={{ fontFamily: inter, fontSize: 14, fontWeight: 400, color: C.body, lineHeight: 1.65, letterSpacing: "0.1px" }}>
                {desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Broker Leverage Section ───────────────────────────────────────────────────
function BrokerLeverageSection() {
  const bullets = [
    "Know what your business may be worth before relying on someone else's opinion.",
    "Understand the risks that could reduce buyer confidence.",
    "Prepare the documents buyers and lenders are likely to request.",
    "Decide whether you are ready to sell now or should improve the business first.",
    "Avoid entering the market unprepared and losing leverage from day one.",
  ]

  return (
    <section style={{ padding: "96px 48px", background: C.canvas, borderTop: `1px solid ${C.hairline}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <div>
          <span style={badge()}>Before you hire anyone</span>
          <h2 style={{ ...displayStyle(40), marginTop: 24, marginBottom: 20, lineHeight: 1.1 }}>
            Go into every broker, buyer, lender, or advisor conversation with more leverage.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 16, fontWeight: 400, color: C.body, lineHeight: 1.7, letterSpacing: "0.15px", marginBottom: 16 }}>
            Scorta is not a public listing site or a broker directory. It is the intelligence layer that helps you understand your business before the market does. Whether you eventually work with a broker, sell privately, bring in an advisor, or wait another year, Scorta helps you know where you stand first.
          </p>
          <p style={{ fontFamily: inter, fontSize: 16, fontWeight: 400, color: C.body, lineHeight: 1.7, letterSpacing: "0.15px" }}>
            When you understand your valuation, readiness gaps, financing risks, and buyer concerns upfront, you can make better decisions, avoid unnecessary confusion, and protect more of the outcome.
          </p>
        </div>

        <div
          style={{
            background: C.surfaceCard,
            borderRadius: 20,
            padding: "36px",
            border: `1px solid ${C.hairline}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, background: `radial-gradient(circle at 50% 50%, ${C.gradSky}35 0%, transparent 65%)`, pointerEvents: "none" }} />
          <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, letterSpacing: "0.96px", textTransform: "uppercase", color: C.mutedSoft, marginBottom: 24 }}>
            Scorta gives you
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {bullets.map((b, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: i < bullets.length - 1 ? `1px solid ${C.hairline}` : "none", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx={8} cy={8} r={7} stroke={C.hairlineStrong} strokeWidth={1} />
                  <path d="M5 8l2.5 2.5L11 5.5" stroke={C.muted} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: inter, fontSize: 14, fontWeight: 400, color: C.body, lineHeight: 1.6, letterSpacing: "0.1px" }}>
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Value Proposition ─────────────────────────────────────────────────────────
function ValuePropositionSection() {
  const bullets = [
    "Improve buyer confidence before going to market.",
    "Reduce diligence friction by preparing key documents early.",
    "Identify valuation risks before buyers use them against you.",
    "Understand whether the business may be SBA-financeable.",
    "See what operational changes could improve transferability.",
    "Avoid wasting months in a process the business was not ready for.",
    "Approach brokers, buyers, lenders, and advisors with more leverage.",
    "Build toward a higher-value exit instead of reacting under pressure.",
  ]

  return (
    <section style={{ padding: "96px 48px", background: C.dark, position: "relative", overflow: "hidden", ...dotGrid() }}>
      <div style={{ position: "absolute", top: "20%", right: "10%", width: 400, height: 400, background: `radial-gradient(ellipse at 50% 50%, ${C.gradLavender}12 0%, transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 350, height: 350, background: `radial-gradient(ellipse at 50% 50%, ${C.gradMint}10 0%, transparent 60%)`, pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start", position: "relative", zIndex: 1 }}>
        <div>
          <span style={badge(true)}>Why it matters</span>
          <h2 style={{ ...displayStyle(40, true), marginTop: 24, marginBottom: 20, lineHeight: 1.1 }}>
            Better-prepared businesses can command stronger buyer confidence — and stronger outcomes.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 16, fontWeight: 400, color: C.onDarkBody, lineHeight: 1.7, letterSpacing: "0.15px", marginBottom: 16 }}>
            Buyers do not only pay for profit. They pay for trust, transferability, clean operations, and confidence that the business can continue performing after the owner exits. When those signals are missing, buyers hesitate, lenders slow down, advisors ask more questions, and valuation pressure increases.
          </p>
          <p style={{ fontFamily: inter, fontSize: 16, fontWeight: 400, color: C.onDarkBody, lineHeight: 1.7, letterSpacing: "0.15px" }}>
            Scorta helps owners improve the areas that matter most before the business goes to market — giving them a better shot at faster conversations, fewer surprises, and higher-quality offers.
          </p>
        </div>

        <div>
          <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, letterSpacing: "0.96px", textTransform: "uppercase", color: C.onDarkMuted, marginBottom: 20 }}>
            Scorta helps owners
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {bullets.map((b, i) => (
              <div key={i} style={{ padding: "13px 0", borderBottom: i < bullets.length - 1 ? `1px solid ${C.darkBorder}` : "none", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gradLavender, boxShadow: `0 0 5px ${C.gradLavender}80`, flexShrink: 0, marginTop: 6 }} />
                <span style={{ fontFamily: inter, fontSize: 15, fontWeight: 400, color: C.onDark, lineHeight: 1.55, letterSpacing: "0.1px" }}>
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Platform Vision ───────────────────────────────────────────────────────────
function PlatformVisionSection() {
  const vision = [
    "AI-powered business valuation and readiness analysis.",
    "Buyer-ready company profiles and data rooms.",
    "SBA and lender-readiness workflows.",
    "Confidential listing preparation and distribution.",
    "Buyer qualification and intake management.",
    "Due diligence coordination.",
    "Deal-risk detection.",
    "Future buyer matching through verified Buyer Passports.",
  ]

  return (
    <section id="vision" style={{ padding: "96px 48px", background: C.darkElevated, position: "relative", overflow: "hidden", ...dotGrid() }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 900, height: 600, background: `radial-gradient(ellipse at 40% 50%, ${C.gradMint}08 0%, transparent 55%), radial-gradient(ellipse at 65% 45%, ${C.gradSky}07 0%, transparent 50%)`, pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start", position: "relative", zIndex: 1 }}>
        <div>
          <span style={badge(true)}>The future of Main Street exits</span>
          <h2 style={{ ...displayStyle(40, true), marginTop: 24, marginBottom: 20, lineHeight: 1.1 }}>
            Scorta is building the operating system for small-business ownership transfer.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 16, fontWeight: 400, color: C.onDarkBody, lineHeight: 1.7, letterSpacing: "0.15px", marginBottom: 16 }}>
            Small-business exits are still managed through spreadsheets, PDFs, email chains, fragmented advisors, outdated listing sites, and slow manual workflows. Scorta brings intelligence, structure, and automation to the process — starting with exit readiness.
          </p>
          <p style={{ fontFamily: inter, fontSize: 16, fontWeight: 400, color: C.onDarkBody, lineHeight: 1.7, letterSpacing: "0.15px" }}>
            Our long-term platform will help owners prepare, package, list, manage buyer intake, coordinate diligence, evaluate financing, and move toward a cleaner transaction from one AI-native command center. ExitIQ is the first step.
          </p>
        </div>

        <div>
          <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, letterSpacing: "0.96px", textTransform: "uppercase", color: C.onDarkMuted, marginBottom: 20 }}>
            Scorta is building toward
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {vision.map((v, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: i < vision.length - 1 ? `1px solid ${C.darkBorder}` : "none", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontFamily: inter, fontSize: 11, fontWeight: 600, letterSpacing: "0.6px", color: C.onDarkMuted, marginTop: 2, flexShrink: 0, minWidth: 24 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: inter, fontSize: 15, fontWeight: 400, color: C.onDark, lineHeight: 1.55, letterSpacing: "0.1px" }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── FAQ Section ───────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = React.useState<number | null>(null)

  const faqs = [
    {
      q: "Is Scorta a broker?",
      a: "No. Scorta is an AI-native exit intelligence platform. We help business owners understand valuation, readiness, buyer concerns, financing potential, and preparation steps before they go to market. Scorta does not require you to list your business or sign a broker agreement.",
    },
    {
      q: "Do I need to be ready to sell right now?",
      a: "No. Scorta is most useful before you are ready to sell. The earlier you understand what buyers and lenders would care about, the more time you have to improve the business, prepare documents, reduce risks, and potentially increase exit value.",
    },
    {
      q: "What does the ExitIQ assessment include?",
      a: "ExitIQ provides a directional valuation range, Exit Readiness Score, SBA financeability view, broker-fee impact, buyer-risk analysis, document-readiness checklist, and personalized roadmap for improving sellability.",
    },
    {
      q: "Will my business be publicly listed?",
      a: "No. Completing the ExitIQ assessment does not list your business publicly. The assessment is designed to help you understand your business privately before deciding if, when, or how to go to market.",
    },
    {
      q: "How does Scorta help increase valuation?",
      a: "Scorta identifies the factors that buyers may use to discount your business — such as messy financials, owner dependence, customer concentration, missing documents, weak growth story, or financing risk. By surfacing those issues early, Scorta helps you focus on the improvements that can increase buyer confidence and support a stronger exit.",
    },
    {
      q: "Is this a formal appraisal?",
      a: "No. ExitIQ provides a directional valuation and readiness analysis based on the information you provide. It is not a certified appraisal, legal advice, tax advice, or financial advice. It is designed to help owners understand where they stand and what to prepare before a future transaction.",
    },
    {
      q: "Who is Scorta built for?",
      a: "Scorta is built for small-business owners, especially owner-operated and family-owned businesses, who want to understand their valuation, prepare for a future exit, reduce buyer risk, and approach the sale process with more confidence and leverage.",
    },
  ]

  return (
    <section id="faq" style={{ padding: "96px 48px", background: C.surfaceCard, borderTop: `1px solid ${C.hairline}` }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={badge()}>FAQ</span>
          <h2 style={{ ...displayStyle(40), marginTop: 20, lineHeight: 1.1 }}>
            Common questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {faqs.map(({ q, a }, i) => (
            <div
              key={i}
              style={{ borderTop: `1px solid ${C.hairline}`, cursor: "pointer" }}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div style={{ padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
                <span style={{ fontFamily: inter, fontSize: 16, fontWeight: 500, color: C.ink, lineHeight: 1.4, flex: 1 }}>
                  {q}
                </span>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: `1px solid ${C.hairlineStrong}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    marginTop: 1,
                  }}
                >
                  <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                    <path d="M6 2v8M2 6h8" stroke={C.muted} strokeWidth={1.3} strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              {open === i && (
                <div style={{ paddingBottom: 24, animation: "slideUp 0.2s ease" }}>
                  <p style={{ fontFamily: inter, fontSize: 15, fontWeight: 400, color: C.body, lineHeight: 1.7, letterSpacing: "0.15px", margin: 0 }}>
                    {a}
                  </p>
                </div>
              )}
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.hairline}` }} />
        </div>
      </div>
    </section>
  )
}

// ── Final CTA Section ─────────────────────────────────────────────────────────
function FinalCTASection({ onStart }: { onStart: () => void }) {
  return (
    <section style={{ padding: "96px 48px", background: C.canvas, position: "relative", overflow: "hidden", textAlign: "center" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 800, height: 500, background: `radial-gradient(ellipse at 35% 50%, ${C.gradSky}28 0%, transparent 55%), radial-gradient(ellipse at 68% 48%, ${C.gradMint}25 0%, transparent 50%), radial-gradient(ellipse at 52% 70%, ${C.gradPeach}20 0%, transparent 50%)`, pointerEvents: "none", filter: "blur(6px)" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{ ...displayStyle(48), marginBottom: 24, lineHeight: 1.07 }}>
          Your business may be your biggest asset. Know how ready it is.
        </h2>
        <p style={{ fontFamily: inter, fontSize: 17, fontWeight: 400, color: C.body, lineHeight: 1.65, letterSpacing: "0.15px", marginBottom: 12 }}>
          Take the free ExitIQ assessment and get a clear view of your valuation range, exit readiness, buyer risks, SBA financeability, and next steps.
        </p>
        <p style={{ fontFamily: inter, fontSize: 14, fontWeight: 500, color: C.mutedSoft, marginBottom: 36 }}>
          Valuation. Readiness. Buyer risks. Financing insight. Exit roadmap.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
          <button
            onClick={onStart}
            style={{ ...pillPrimary, height: 52, padding: "0 32px", fontSize: 17 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.ink)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
          >
            Get Your Free ExitIQ Score
          </button>
        </div>
        <p style={{ fontFamily: inter, fontSize: 13, color: C.mutedSoft }}>
          Private, fast, and built for owners who want clarity before making their next move.
        </p>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function FooterSection() {
  const cols = [
    { heading: "Platform", links: ["ExitIQ Assessment", "Valuation Range", "Exit Readiness Score", "SBA Financeability", "Document Checklist"] },
    { heading: "Company", links: ["About Scorta", "How it works", "For sellers", "Platform vision"] },
    { heading: "Legal", links: ["Privacy policy", "Terms of service", "Disclaimer"] },
  ]

  return (
    <footer style={{ background: C.canvas, borderTop: `1px solid ${C.hairline}`, padding: "64px 48px 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }}>
          <div>
            <div style={{ fontFamily: garamond, fontSize: 22, fontWeight: 300, color: C.ink, letterSpacing: "-0.3px", marginBottom: 14 }}>
              Scorta
            </div>
            <p style={{ fontFamily: inter, fontSize: 14, fontWeight: 400, color: C.muted, lineHeight: 1.65, maxWidth: 280 }}>
              The AI-native exit intelligence platform for Main Street businesses. Helping owners turn their company into a buyer-ready asset — before they need to sell.
            </p>
          </div>
          {cols.map(({ heading, links }) => (
            <div key={heading}>
              <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: C.mutedSoft, marginBottom: 16 }}>
                {heading}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map((l) => (
                  <span key={l} style={{ fontFamily: inter, fontSize: 14, fontWeight: 400, color: C.body, cursor: "pointer", lineHeight: 1.5 }}>
                    {l}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: inter, fontSize: 13, color: C.mutedSoft }}>
            © 2025 Scorta. For informational purposes only. Not financial advice.
          </span>
          <span style={{ fontFamily: inter, fontSize: 13, color: C.mutedSoft }}>
            See what buyers will see before they see it.
          </span>
        </div>
      </div>
    </footer>
  )
}

// ── Root Export ───────────────────────────────────────────────────────────────
export function ScortaLanding() {
  const [appOpen, setAppOpen] = React.useState(false)
  const [announcementVisible, setAnnouncementVisible] = React.useState(true)

  const open = () => setAppOpen(true)

  return (
    <>
      <style>{`html { scroll-behavior: smooth; }`}</style>
      {appOpen && <ExitIQOverlay onClose={() => setAppOpen(false)} />}

      <div style={{ background: C.canvas, color: C.ink, fontFamily: inter, minHeight: "100vh", overflowX: "hidden" }}>
        {announcementVisible && <AnnouncementBar onDismiss={() => setAnnouncementVisible(false)} />}
        <TopNav onStart={open} hasBar={announcementVisible} />
        <HeroSection onStart={open} />
        <ValueCardsStrip />
        <ProblemSection />
        <WhatScortaGivesYou onStart={open} />
        <HowExitIQWorks onStart={open} />
        <WhatBuyersCareAbout />
        <CostOfWaiting onStart={open} />
        <WhoItsFor />
        <BrokerLeverageSection />
        <ValuePropositionSection />
        <PlatformVisionSection />
        <FAQSection />
        <FinalCTASection onStart={open} />
        <FooterSection />
      </div>
    </>
  )
}

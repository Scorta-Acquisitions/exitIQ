// use client: interactive nav state (ExitIQ overlay toggle)
"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { ExitIQApp } from "@/components/exitiq/ExitIQApp"

// ── Design tokens (mirrors LandingPage.tsx) ───────────────────────────────────
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
  textDecoration: "none",
}

// Liquid glass — cream-theme values from tailwind.css, inlined for this light-mode page
const glassLight: React.CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(24px) saturate(160%)",
  WebkitBackdropFilter: "blur(24px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.90)",
  boxShadow: "0 8px 32px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,.03)",
}

// ── ExitIQ Overlay ────────────────────────────────────────────────────────────
function ExitIQOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1160,
          height: "90vh",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,245,245,0.08)",
          animation: "slideUp 0.35s cubic-bezier(0.34,1.15,0.64,1)",
        }}
      >
        <ExitIQApp onClose={onClose} />
      </div>
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
      <Link
        href="/"
        style={{
          fontFamily: garamond,
          fontSize: 22,
          fontWeight: 300,
          color: C.ink,
          letterSpacing: "-0.3px",
          textDecoration: "none",
        }}
      >
        Scorta
      </Link>
      <div style={{ display: "flex", gap: 32 }}>
        {[
          { label: "Features", href: "/#features" },
          { label: "How it works", href: "/#how-it-works" },
          { label: "About", href: "/about" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            style={{
              fontFamily: inter,
              fontSize: 15,
              fontWeight: 500,
              color: label === "About" ? C.ink : C.body,
              textDecoration: "none",
            }}
          >
            {label}
          </Link>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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

// ── Photo Avatar ──────────────────────────────────────────────────────────────
function PhotoAvatar({ src, name }: { src: string; name: string }) {
  return (
    <div
      style={{
        width: 88,
        height: 88,
        borderRadius: "50%",
        flexShrink: 0,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 0 0 2px rgba(0,0,0,0.06)",
        position: "relative",
      }}
    >
      <Image src={src} alt={name} fill sizes="88px" style={{ objectFit: "cover", objectPosition: "center top" }} />
    </div>
  )
}

// ── Founder Card ──────────────────────────────────────────────────────────────
function FounderCard({
  photo,
  name,
  title,
  bio,
  linkedIn,
}: {
  photo: string
  name: string
  title: string
  bio: string[]
  linkedIn: string
}) {
  return (
    <div
      style={{
        ...glassLight,
        borderRadius: 20,
        padding: "40px 40px 36px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <PhotoAvatar src={photo} name={name} />
        <div>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 26,
              fontWeight: 300,
              color: C.ink,
              letterSpacing: "-0.3px",
              lineHeight: 1.1,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: 13,
              fontWeight: 500,
              color: C.muted,
              marginTop: 4,
              letterSpacing: "0.2px",
            }}
          >
            {title}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {bio.map((line, i) => (
          <p
            key={i}
            style={{
              fontFamily: inter,
              fontSize: 15,
              fontWeight: 400,
              color: C.body,
              lineHeight: 1.7,
              letterSpacing: "0.1px",
              margin: 0,
            }}
          >
            {line}
          </p>
        ))}
      </div>

      <a
        href={linkedIn}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontFamily: inter,
          fontSize: 13,
          fontWeight: 500,
          color: C.muted,
          textDecoration: "none",
          marginTop: 4,
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = C.ink)}
        onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
      >
        <LinkedInIcon />
        LinkedIn
      </a>
    </div>
  )
}

function LinkedInIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" fillOpacity={0.12} />
      <path
        d="M8.5 10v6M8.5 8v-.5M12 16v-3a2 2 0 0 1 4 0v3M12 10v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Stat Badge ────────────────────────────────────────────────────────────────
function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 24, height: 2, background: C.gradMint, margin: "0 auto 18px", borderRadius: 1 }} />
      <div
        style={{
          fontFamily: garamond,
          fontSize: 44,
          fontWeight: 300,
          color: C.ink,
          letterSpacing: "-1.2px",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: inter,
          fontSize: 13,
          fontWeight: 500,
          color: C.muted,
          marginTop: 8,
          letterSpacing: "0.2px",
          lineHeight: 1.5,
        }}
      >
        {label}
      </div>
    </div>
  )
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      style={{
        padding: "96px 48px 80px",
        background: C.surfaceCard,
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Ambient gradient orbs — larger and more vivid so colour bleeds through the glass panel */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1200,
          height: 700,
          background:
            `radial-gradient(ellipse at 28% 50%, ${C.gradMint}70 0%, transparent 52%),` +
            `radial-gradient(ellipse at 74% 46%, ${C.gradLavender}66 0%, transparent 48%),` +
            `radial-gradient(ellipse at 50% 80%, ${C.gradPeach}55 0%, transparent 50%)`,
          pointerEvents: "none",
          filter: "blur(6px)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 760,
          margin: "0 auto",
          ...glassLight,
          borderRadius: 28,
          padding: "52px 64px 56px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 10px",
            background: "rgba(255,255,255,0.60)",
            borderRadius: 9999,
            fontFamily: inter,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.96px",
            textTransform: "uppercase",
            color: C.muted,
            marginBottom: 28,
          }}
        >
          About Scorta
        </div>

        <h1 style={{ ...displayStyle(60), lineHeight: 1.04, marginBottom: 24 }}>
          Your business,
          <br />
          made acquisition-ready.
        </h1>

        <p
          style={{
            fontFamily: inter,
            fontSize: 18,
            fontWeight: 400,
            color: C.body,
            lineHeight: 1.68,
            letterSpacing: "0.1px",
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          We go further than any broker — AI-powered exit prep, deal packaging, and SBA-ready financials that turn your
          business into an asset buyers compete for. Flat fee. No commission.
        </p>
      </div>
    </section>
  )
}

// ── Origin Story ──────────────────────────────────────────────────────────────
function OriginSection() {
  return (
    <section
      style={{
        padding: "80px 48px",
        background: C.dark,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(245,245,245,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "60%",
          width: 600,
          height: 400,
          background: `radial-gradient(ellipse, ${C.gradMint}12 0%, transparent 70%)`,
          pointerEvents: "none",
          filter: "blur(40px)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: inter,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.96px",
            textTransform: "uppercase",
            color: C.onDarkMuted,
            marginBottom: 32,
          }}
        >
          The origin
        </div>

        <h2 style={{ ...displayStyle(44, true), lineHeight: 1.1, marginBottom: 40 }}>
          "We watched deal after deal collapse — not because the business was bad, but because no one had prepared it."
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            "Suyash spent three years on the buy side, running a micro-PE fund focused on Main Street acquisitions. He saw the same pattern repeat: a good business, a motivated seller, and a deal that fell apart in diligence. Not because of the business — because of the paperwork. No clean financials. No addback schedule. No SBA package. The seller lost the deal and didn't know why.",
            "The brokers weren't helping. The average broker won't even take a listing under $2M in revenue. They list and pray. They never tell the owner what's actually killing their deal value — because fixing it costs human time, and human time doesn't pencil on small transactions.",
            "There are 2.9 million businesses like that. Ten thousand new ones enter the exit market every day as baby boomers retire. Most of them will never sell — not because there's no buyer, but because no one built the infrastructure to get them ready.",
            "That's why we built Scorta. AI does the repeatable work — financials, CIM, buyer materials, SBA prep — so we can serve the $500K–$5M deal that a traditional broker won't touch. Sellers pay a flat fee instead of a 10% commission. And ExitIQ is the intake: a two-minute assessment that tells any owner exactly where they stand.",
          ].map((p, i) => (
            <p
              key={i}
              style={{
                fontFamily: inter,
                fontSize: 16,
                fontWeight: 400,
                color: i === 0 ? C.onDark : "rgba(245,245,245,0.60)",
                lineHeight: 1.75,
                letterSpacing: "0.1px",
                margin: 0,
                transition: "color 0.2s",
              }}
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Founders Section ──────────────────────────────────────────────────────────
function FoundersSection() {
  const founders = [
    {
      photo: "/suyash.jpeg",
      name: "Suyash Agrawal",
      title: "Co-founder & CEO · Buy-side operator, ex-micro-PE",
      bio: [
        "Three years running a micro-PE fund acquiring Main Street businesses. Saw the brokerage problem from the inside — deals collapsing in diligence because sellers had never been told what buyers actually look for.",
        "Scorta is the firm he wished existed when he was on the buy side. Deal prep, SBA packaging, and honest valuation — available to every seller, not just the ones with $5M+ in revenue.",
      ],
      linkedIn: "https://www.linkedin.com/in/suyash-agrawal-20/",
    },
    {
      photo: "/puneet.jpeg",
      name: "Puneet Gupta",
      title: "Co-founder & CTO · Product engineer",
      bio: [
        "Builder focused on AI-native product experiences. Designed and engineered ExitIQ — the assessment engine that surfaces deal risks and buyer signals in real time, the way an M&A advisor thinks.",
        "Believes the best software makes complex decisions feel obvious. Bringing that principle to the part of an owner's life that matters most: what their business is actually worth.",
      ],
      linkedIn: "https://www.linkedin.com/in/puneetguptaa1",
    },
  ]

  return (
    <section style={{ padding: "96px 48px", background: C.surfaceCard, position: "relative", overflow: "hidden" }}>
      {/* Subtle orbs give the glass cards something to blur against */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1100,
          height: 650,
          background:
            `radial-gradient(ellipse at 18% 42%, ${C.gradLavender}30 0%, transparent 50%),` +
            `radial-gradient(ellipse at 82% 58%, ${C.gradSky}26 0%, transparent 50%)`,
          pointerEvents: "none",
          filter: "blur(12px)",
        }}
      />
      <div style={{ maxWidth: 1040, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div
            style={{
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
              marginBottom: 20,
            }}
          >
            The team
          </div>
          <h2 style={{ ...displayStyle(44), lineHeight: 1.1 }}>Two operators, one conviction.</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 28,
          }}
        >
          {founders.map((f) => (
            <FounderCard key={f.name} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Traction Section ──────────────────────────────────────────────────────────
function TractionSection() {
  return (
    <section
      style={{
        padding: "80px 48px",
        background: C.surfaceCard,
        borderTop: `1px solid ${C.hairline}`,
        borderBottom: `1px solid ${C.hairline}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient gradient — mirrors HeroSection treatment */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 500,
          background:
            `radial-gradient(ellipse at 28% 52%, ${C.gradMint}28 0%, transparent 55%),` +
            `radial-gradient(ellipse at 74% 48%, ${C.gradPeach}22 0%, transparent 50%)`,
          pointerEvents: "none",
          filter: "blur(10px)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            fontFamily: inter,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.96px",
            textTransform: "uppercase",
            color: C.mutedSoft,
            marginBottom: 52,
          }}
        >
          Traction
        </div>

        <div
          style={{
            ...glassLight,
            borderRadius: 24,
            padding: "40px 48px",
            marginBottom: 52,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40 }}>
            <StatBadge value="50+" label="Exit assessments completed" />
            <StatBadge value="3+" label="Businesses in active exit process" />
            <StatBadge value="3 yrs" label="Buy-side M&A deal experience" />
            <StatBadge value="100%" label="Referral & inbound only" />
          </div>
        </div>

        <p
          style={{
            fontFamily: inter,
            fontSize: 15,
            fontWeight: 400,
            color: C.body,
            lineHeight: 1.75,
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          Our sellers find us at their most uncertain moment — not knowing what their business is worth, who would buy
          it, or whether their financials will hold up in diligence. ExitIQ gives them the clarity to move forward with
          confidence.
        </p>
      </div>
    </section>
  )
}

// ── Mission Section ───────────────────────────────────────────────────────────
function MissionSection() {
  return (
    <section
      style={{
        padding: "96px 48px",
        background: C.canvas,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 500,
          background:
            `radial-gradient(ellipse at 32% 50%, ${C.gradSky}50 0%, transparent 55%),` +
            `radial-gradient(ellipse at 70% 48%, ${C.gradMint}46 0%, transparent 50%)`,
          pointerEvents: "none",
          filter: "blur(8px)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 700,
          margin: "0 auto",
          textAlign: "center",
          ...glassLight,
          borderRadius: 28,
          padding: "60px 64px 56px",
        }}
      >
        <h2 style={{ ...displayStyle(48), lineHeight: 1.07, marginBottom: 24 }}>
          Making every Main Street
          <br />
          business sellable.
        </h2>
        <p
          style={{
            fontFamily: inter,
            fontSize: 17,
            fontWeight: 400,
            color: C.body,
            lineHeight: 1.68,
            letterSpacing: "0.1px",
            marginBottom: 40,
          }}
        >
          2.9 million businesses. 10,000 new exits entering the market every day. Most will never sell — not because
          there's no buyer, but because no one built the infrastructure to get them ready. That's what we're building.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{ ...pillPrimary, height: 48, padding: "0 28px", fontSize: 16 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.ink)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
          >
            Try ExitIQ free
          </Link>
          <a
            href="mailto:hello@scorta.co"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 48,
              padding: "0 27px",
              background: "transparent",
              color: C.ink,
              borderRadius: 9999,
              fontFamily: inter,
              fontSize: 16,
              fontWeight: 500,
              border: `1px solid ${C.hairlineStrong}`,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Say hello
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function FooterSection() {
  return (
    <footer style={{ background: C.canvas, borderTop: `1px solid ${C.hairline}`, padding: "48px 48px 32px" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: garamond,
            fontSize: 20,
            fontWeight: 300,
            color: C.ink,
            letterSpacing: "-0.3px",
            textDecoration: "none",
          }}
        >
          Scorta
        </Link>
        <span style={{ fontFamily: inter, fontSize: 13, color: C.mutedSoft }}>
          © 2025 Scorta. For informational purposes only. Not financial advice.
        </span>
      </div>
    </footer>
  )
}

// ── Root Export ───────────────────────────────────────────────────────────────
export function AboutPage() {
  const [appOpen, setAppOpen] = React.useState(false)

  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
      {appOpen && <ExitIQOverlay onClose={() => setAppOpen(false)} />}

      <div style={{ background: C.canvas, color: C.ink, fontFamily: inter, minHeight: "100vh", overflowX: "hidden" }}>
        <TopNav onStart={() => setAppOpen(true)} />
        <HeroSection />
        <OriginSection />
        <FoundersSection />
        <TractionSection />
        <MissionSection />
        <FooterSection />
      </div>
    </>
  )
}

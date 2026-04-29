"use client"

import React from "react"

interface BentoCard {
  title: string
  desc: string
  icon: React.ReactNode
  accent: string
  bg: string
}

const BENTO_CARDS: BentoCard[] = [
  {
    title: "AI-generated listing",
    desc: "Scorta drafts your full business listing — financials, narrative, and buyer pitch — in minutes.",
    icon: (
      <svg
        width={22}
        height={22}
        viewBox="0 0 22 22"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h14v2H4zM4 8h10M4 11h8M4 14h6M14 12l4 4-4 4" />
      </svg>
    ),
    accent: "rgba(167,229,211,.55)",
    bg: "rgba(167,229,211,.04)",
  },
  {
    title: "Buyer management",
    desc: "Track all buyer interest, NDAs, and communications in one confidential pipeline.",
    icon: (
      <svg
        width={22}
        height={22}
        viewBox="0 0 22 22"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx={8} cy={7} r={3} />
        <circle cx={15} cy={9} r={2} />
        <path d="M2 18c0-3 2.7-5 6-5s6 2 6 5" />
        <path d="M15 14c2 0 4 1 4 3" />
      </svg>
    ),
    accent: "rgba(200,184,224,.55)",
    bg: "rgba(200,184,224,.04)",
  },
  {
    title: "Document vault",
    desc: "Secure, organized storage for financials, leases, and due diligence materials.",
    icon: (
      <svg
        width={22}
        height={22}
        viewBox="0 0 22 22"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x={3} y={3} width={16} height={18} rx={2} />
        <path d="M7 7h8M7 11h8M7 15h4" />
        <circle cx={16} cy={15} r={3} fill="rgba(168,200,232,.2)" stroke="currentColor" />
        <path d="M15 15l.8.8 1.6-1.6" />
      </svg>
    ),
    accent: "rgba(168,200,232,.55)",
    bg: "rgba(168,200,232,.04)",
  },
  {
    title: "NDA workflow",
    desc: "Automated NDA generation, tracking, and e-signature — no lawyer required for the basics.",
    icon: (
      <svg
        width={22}
        height={22}
        viewBox="0 0 22 22"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12l2 2 4-4" />
        <rect x={3} y={3} width={14} height={18} rx={2} />
        <path d="M7 7h8M7 11h3" />
        <path d="M15 16c1.5-1 3-.5 3 1s-1.5 2-3 1" />
      </svg>
    ),
    accent: "rgba(244,197,168,.55)",
    bg: "rgba(244,197,168,.04)",
  },
  {
    title: "Deal timeline",
    desc: "A live, AI-generated roadmap from first conversation to close — updated as your deal evolves.",
    icon: (
      <svg
        width={22}
        height={22}
        viewBox="0 0 22 22"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx={11} cy={11} r={8} />
        <path d="M11 7v4l3 2" />
      </svg>
    ),
    accent: "rgba(167,229,211,.55)",
    bg: "rgba(167,229,211,.04)",
  },
  {
    title: "Broker-free guidance",
    desc: "Step-by-step coaching from offer to close. Know exactly what to do — and when.",
    icon: (
      <svg
        width={22}
        height={22}
        viewBox="0 0 22 22"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    accent: "rgba(200,184,224,.55)",
    bg: "rgba(200,184,224,.04)",
  },
]

function BentoCardItem({ card, index }: { card: BentoCard; index: number }) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? card.bg : "var(--s2)",
        border: `1px solid ${hovered ? card.accent.replace(".55", ".3") : "var(--b3)"}`,
        borderRadius: 20,
        padding: "28px 28px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        transition: "all .35s cubic-bezier(.34,1.1,.64,1)",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? `0 12px 40px rgba(0,0,0,.3), 0 0 30px ${card.accent.replace(".55", ".06")}` : "none",
        animation: `slideUp .6s ${index * 80}ms cubic-bezier(.34,1.2,.64,1) both`,
      }}
    >
      <div
        style={{
          color: card.accent,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: card.bg,
          borderRadius: 10,
          border: `1px solid ${card.accent.replace(".55", ".2")}`,
          flexShrink: 0,
        }}
      >
        {card.icon}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: 20,
            fontWeight: 300,
            color: "var(--t1)",
            letterSpacing: "-.15px",
            lineHeight: 1.2,
          }}
        >
          {card.title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--t3)",
            lineHeight: 1.65,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {card.desc}
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          alignSelf: "flex-start",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".9px",
          textTransform: "uppercase",
          color: card.accent,
          fontFamily: "Inter, sans-serif",
          opacity: hovered ? 1 : 0.5,
          transition: "opacity .3s",
        }}
      >
        Coming soon
      </div>

      {hovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,.03) 50%, transparent 60%)",
            animation: "shimmer 1.8s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  )
}

export function BentoSection() {
  return (
    <section
      style={{
        background: "var(--footer-bg)",
        padding: "96px 20px",
        position: "relative",
        overflow: "hidden",
        transition: "background .5s ease",
      }}
    >
      {/* Gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "15%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,229,211,.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,184,224,.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", flexDirection: "column", gap: 56 }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".96px",
              textTransform: "uppercase",
              color: "var(--t3)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Coming soon
          </div>
          <h2
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: "clamp(32px,3.5vw,48px)",
              fontWeight: 300,
              color: "var(--t1)",
              lineHeight: 1.08,
              letterSpacing: "-.8px",
              margin: 0,
            }}
          >
            The AI-native platform to prepare, list, and sell your business end-to-end.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--t3)",
              lineHeight: 1.65,
              fontFamily: "Inter, sans-serif",
              margin: 0,
              maxWidth: 520,
            }}
          >
            No brokers. No 10% commissions. Just intelligent guidance from valuation to close.
          </p>
        </div>

        {/* Bento grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {BENTO_CARDS.map((card, i) => (
            <BentoCardItem key={card.title} card={card} index={i} />
          ))}
        </div>

        {/* Bottom join CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 32px",
            background: "var(--s2)",
            border: "1px solid var(--b3)",
            borderRadius: 20,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 24,
                fontWeight: 300,
                color: "var(--t1)",
                letterSpacing: "-.2px",
                marginBottom: 4,
              }}
            >
              Be the first to access the full platform.
            </div>
            <div style={{ fontSize: 13, color: "var(--t3)", fontFamily: "Inter, sans-serif" }}>
              Join the waitlist — free for early members.
            </div>
          </div>
          <button
            style={{
              height: 44,
              padding: "0 28px",
              flexShrink: 0,
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all .2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)"
              e.currentTarget.style.boxShadow = "0 0 24px rgba(0,0,0,.12)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            Join waitlist →
          </button>
        </div>
      </div>
    </section>
  )
}

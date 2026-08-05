"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React from "react"

import { AUDIT_TRAIL } from "@/lib/auditTrail"
import { getDealClock } from "@/lib/dealClock"
import { type Station, STATIONS, type StationStatus } from "@/lib/persona"
import { createClient } from "@/lib/supabase/client"

import { AgentActivityPanel } from "./AgentActivityPanel"
import { AgentFleetProvider } from "./AgentFleetContext"
import { AuditTrailModal } from "./AuditTrailModal"
import { CASEChat } from "./CASEChat"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

export type Seller = {
  displayName: string
  firstName: string
  email: string
  avatarInitials: string
  avatarColor: string
  avatarBg: string
  businessName: string
  scorePill: { value: number; label: string }
}

export function AppShell({ children, seller }: { children: React.ReactNode; seller: Seller }) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = React.useState(false)
  const [auditOpen, setAuditOpen] = React.useState(false)

  async function onSignOut() {
    if (signingOut) return
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <AgentFleetProvider>
    <div
      data-theme="cream"
      style={{
        background: "var(--page-bg)",
        minHeight: "100vh",
        display: "flex",
        fontFamily: inter,
        color: "var(--t1)",
        paddingRight: 44,
      }}
    >
      <ScopedStyles />

      {/* ── Left rail ─────────────────────────────────────────────────── */}
      <aside
        style={{
          width: 280,
          flexShrink: 0,
          padding: "24px 18px 24px 24px",
          borderRight: "1px solid var(--div)",
          background: "rgba(255,255,255,.50)",
          backdropFilter: "blur(20px) saturate(160%)",
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          overflowX: "hidden",
        }}
      >
        {/* Wordmark */}
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: garamond,
              fontWeight: 500,
              fontSize: 17,
              letterSpacing: "-.4px",
            }}
          >
            S
          </div>
          <div>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 19,
                fontWeight: 500,
                color: "var(--t1)",
                letterSpacing: "-.3px",
                lineHeight: 1,
              }}
            >
              Scorta
            </div>
            <div
              style={{
                fontSize: 9.5,
                color: "var(--t3)",
                fontFamily: mono,
                letterSpacing: ".8px",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              Boardroom · Beta
            </div>
          </div>
        </Link>

        {/* CASE status strip */}
        <div
          style={{
            padding: "11px 13px",
            borderRadius: 12,
            background: "rgba(255,255,255,.65)",
            border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            aria-hidden
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
              boxShadow: "0 0 8px rgba(44,140,112,.55)",
              animation: "casePulse 3.2s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)", fontFamily: inter, lineHeight: 1.2 }}>
              CASE
            </div>
            <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 1, fontFamily: inter }}>
              Case Manager · coordinating
            </div>
          </div>
        </div>

        {/* Stations list */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: 4,
            marginRight: -4,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <RailGroup
            heading="Exit Prep & Readiness"
            stations={STATIONS.filter((s) => s.group === "underwriting")}
            pathname={pathname}
          />
          <div style={{ height: 1, background: "var(--div)", margin: "0 4px" }} aria-hidden />
          <RailGroup
            heading="Brokerage Services"
            stations={STATIONS.filter((s) => s.group === "brokerage")}
            pathname={pathname}
          />
        </nav>

        {/* Seller footer */}
        <div
          style={{
            padding: "11px 13px",
            borderRadius: 12,
            background: "rgba(255,255,255,.7)",
            border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
            display: "flex",
            alignItems: "center",
            gap: 11,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: seller.avatarBg,
              color: seller.avatarColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 12,
              flexShrink: 0,
              fontFamily: inter,
            }}
          >
            {seller.avatarInitials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--t1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {seller.displayName}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "var(--t3)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: mono,
                letterSpacing: ".3px",
              }}
            >
              {seller.email}
            </div>
          </div>
          <button
            onClick={onSignOut}
            disabled={signingOut}
            title="Sign out"
            aria-label="Sign out"
            className="scorta-iconbtn"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "transparent",
              border: "1px solid var(--glass-edge, rgba(0,0,0,.08))",
              color: "var(--t2)",
              cursor: signingOut ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 180ms ease-out, border-color 180ms ease-out, color 180ms ease-out",
            }}
          >
            {signingOut ? (
              <span
                style={{
                  display: "inline-block",
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  border: "2px solid rgba(12,10,9,.18)",
                  borderTopColor: "var(--t1)",
                  animation: "spin .8s linear infinite",
                }}
              />
            ) : (
              <svg width={13} height={13} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 4V2.5A1.5 1.5 0 0 0 7.5 1h-5A1.5 1.5 0 0 0 1 2.5v9A1.5 1.5 0 0 0 2.5 13h5A1.5 1.5 0 0 0 9 11.5V10" />
                <path d="M5 7h8m0 0l-2-2m2 2l-2 2" />
              </svg>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main column ───────────────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar
          seller={seller}
          onOpenAudit={() => setAuditOpen(true)}
          auditCount={AUDIT_TRAIL.length}
        />
        <div style={{ flex: 1, padding: "28px 36px 72px", maxWidth: 1320, width: "100%", margin: "0 auto" }}>
          {children}
        </div>
      </main>

      <AgentActivityPanel />
      <CASEChat currentRoute={pathname} />
      <AuditTrailModal open={auditOpen} onClose={() => setAuditOpen(false)} />
    </div>
    </AgentFleetProvider>
  )
}

// ── Rail group (header + list) ──────────────────────────────────────────
function RailGroup({
  heading,
  stations,
  pathname,
}: {
  heading: string
  stations: ReadonlyArray<Station>
  pathname: string
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "1.1px",
          textTransform: "uppercase",
          color: "var(--t3)",
          marginBottom: 10,
          paddingLeft: 4,
          fontFamily: inter,
        }}
      >
        {heading}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        {stations.map((s) => {
          const isActive = pathname === s.href
          const effective: StationStatus = isActive ? "active" : s.state
          return (
            <li key={s.href}>
              <RailItem station={s} effective={effective} isActive={isActive} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ── Rail row ────────────────────────────────────────────────────────────
function RailItem({
  station,
  effective,
  isActive,
}: {
  station: Station
  effective: StationStatus
  isActive: boolean
}) {
  const locked = effective === "locked"

  const inner = (
    <>
      <StationIndicator status={effective} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: isActive ? 600 : 500,
            color: locked ? "var(--t3)" : "var(--t1)",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {station.label}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--t3)",
            fontFamily: mono,
            letterSpacing: ".4px",
            marginTop: 2,
          }}
        >
          {station.sublabel} · {station.agent}
        </div>
      </div>
      {locked && (
        <svg width={11} height={11} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--t3)", flexShrink: 0 }}>
          <rect x="2.5" y="5.5" width="7" height="5" rx="1" />
          <path d="M4 5.5V4a2 2 0 014 0v1.5" />
        </svg>
      )}
    </>
  )

  const baseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "10px 11px",
    borderRadius: 10,
    textDecoration: "none",
    background: isActive ? "rgba(44,140,112,.08)" : "transparent",
    border: `1px solid ${isActive ? "var(--mint-edge, rgba(44,140,112,.28))" : "transparent"}`,
    boxShadow: isActive ? "0 4px 14px rgba(44,140,112,.10)" : "none",
    transition: "background 180ms ease-out, border-color 180ms ease-out, box-shadow 180ms ease-out",
    position: "relative",
    cursor: locked ? "not-allowed" : "pointer",
  }

  if (locked) {
    return (
      <div
        role="button"
        aria-disabled
        aria-label={`${station.label} — locked`}
        tabIndex={0}
        className="scorta-rail-locked"
        style={baseStyle}
      >
        {inner}
        <RailTooltip prereq={station.prereq ?? "the previous station is complete"} />
      </div>
    )
  }

  return (
    <Link href={station.href} className="scorta-rail-link-row" style={baseStyle}>
      {inner}
    </Link>
  )
}

// Hover-only tooltip (180ms fade) — used on locked rail items.
function RailTooltip({ prereq }: { prereq: string }) {
  return (
    <span
      className="scorta-rail-tooltip"
      role="tooltip"
      style={{
        position: "absolute",
        left: "calc(100% + 10px)",
        top: "50%",
        transform: "translateY(-50%)",
        padding: "8px 11px",
        borderRadius: 10,
        background: "rgba(12,10,9,.92)",
        color: "rgba(245,245,245,.95)",
        fontSize: 11.5,
        lineHeight: 1.4,
        fontFamily: inter,
        whiteSpace: "normal",
        width: 220,
        boxShadow: "0 10px 30px rgba(0,0,0,.18)",
        opacity: 0,
        pointerEvents: "none",
        transition: "opacity 180ms ease-out",
        zIndex: 60,
      }}
    >
      CASE will unlock this once {prereq}.
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          width: 0,
          height: 0,
          borderTop: "6px solid transparent",
          borderBottom: "6px solid transparent",
          borderRight: "6px solid rgba(12,10,9,.92)",
        }}
      />
    </span>
  )
}

// ── Station indicator (✓ shipped · ● active · ○ locked) ────────────────
function StationIndicator({ status }: { status: StationStatus }) {
  if (status === "active") {
    return (
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "rgba(44,140,112,.16)",
          border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--mint, #2c8c70)",
            boxShadow: "0 0 6px var(--mint, #2c8c70)",
            animation: "liveBlink 1.8s ease-in-out infinite",
          }}
        />
      </div>
    )
  }
  if (status === "shipped") {
    return (
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "var(--mint, #2c8c70)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width={10} height={10} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 5.2L4.2 7.4 8 3.2" />
        </svg>
      </div>
    )
  }
  return (
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: "1px dashed var(--t4)",
        flexShrink: 0,
      }}
    />
  )
}

// ── Top bar ────────────────────────────────────────────────────────────
function TopBar({
  seller,
  onOpenAudit,
  auditCount,
}: {
  seller: Seller
  onOpenAudit: () => void
  auditCount: number
}) {
  return (
    <header
      style={{
        height: 64,
        padding: "0 36px",
        borderBottom: "1px solid var(--div)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        background: "rgba(255,255,255,.40)",
        backdropFilter: "blur(16px) saturate(160%)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 19,
            fontWeight: 500,
            color: "var(--t1)",
            letterSpacing: "-.3px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {seller.businessName}
        </div>
        <div
          style={{
            padding: "3px 9px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".6px",
            textTransform: "uppercase",
            color: "var(--peach, #b86a3e)",
            background: "var(--peach-soft, rgba(184,106,62,.10))",
            border: "1px solid var(--peach-edge, rgba(184,106,62,.28))",
            borderRadius: 9999,
            fontFamily: inter,
          }}
        >
          Hot Seller · 6–12 mo
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={onOpenAudit}
          className="scorta-audit-pill"
          aria-label={`View audit trail · ${auditCount} entries`}
          style={{
            padding: "5px 12px",
            borderRadius: 9999,
            border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
            background: "rgba(255,255,255,.7)",
            color: "var(--t1)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: inter,
            transition:
              "background 180ms ease-out, border-color 180ms ease-out, transform 180ms ease-out, box-shadow 180ms ease-out",
          }}
        >
          <svg
            width={12}
            height={12}
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 1.5h6.5L11.5 3.5V12A.5.5 0 0 1 11 12.5H3a.5.5 0 0 1-.5-.5V2A.5.5 0 0 1 3 1.5z" />
            <path d="M9.5 1.5V3.5h2" />
            <path d="M4.5 6h5M4.5 8h5M4.5 10h3" />
          </svg>
          <span style={{ fontSize: 11.5, fontWeight: 600, lineHeight: 1 }}>Audit Trail</span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              color: "var(--t3)",
              letterSpacing: ".4px",
              lineHeight: 1,
            }}
          >
            {auditCount}
          </span>
        </button>
        <DealClockPill />
        <div
          style={{
            padding: "5px 12px",
            borderRadius: 9999,
            border: "1px solid var(--mint-edge, rgba(44,140,112,.32))",
            background: "rgba(255,255,255,.85)",
            boxShadow: "0 4px 12px rgba(44,140,112,.10)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              color: "var(--t3)",
              letterSpacing: ".6px",
              textTransform: "uppercase",
            }}
          >
            Exit IQ
          </div>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 16,
              fontWeight: 500,
              color: "var(--t1)",
              lineHeight: 1,
            }}
          >
            {seller.scorePill.value}
          </div>
          <div style={{ fontSize: 11, color: "var(--t2)" }}>· {seller.scorePill.label}</div>
        </div>
      </div>
    </header>
  )
}

// ── Deal Clock pill — the "speed to close" claim, on screen on every station ──
function DealClockPill() {
  const clock = getDealClock()
  return (
    <div
      title={`Traditional-broker benchmark: ~${clock.brokerAvgDaysToClose} days to close and ~${clock.brokerAvgHumanHours} human hours on a deal this size.`}
      style={{
        padding: "5px 12px",
        borderRadius: 9999,
        border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
        background: "rgba(255,255,255,.7)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 10,
          color: "var(--t3)",
          letterSpacing: ".6px",
          textTransform: "uppercase",
        }}
      >
        Day
      </div>
      <div style={{ fontFamily: garamond, fontSize: 16, fontWeight: 500, color: "var(--t1)", lineHeight: 1 }}>
        {clock.dayNumber}
      </div>
      <div style={{ fontSize: 11, color: "var(--t2)" }}>· vs {clock.brokerAvgDaysToClose}-day broker avg</div>
    </div>
  )
}

// ── Scoped styles ──────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes casePulse {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.12); opacity: .9; }
      }
      .scorta-rail-link-row:hover {
        background: rgba(12,10,9,.045);
        border-color: rgba(12,10,9,.07);
      }
      .scorta-rail-locked:hover .scorta-rail-tooltip,
      .scorta-rail-locked:focus-visible .scorta-rail-tooltip {
        opacity: 1;
      }
      .scorta-rail-locked:hover {
        background: rgba(12,10,9,.025);
      }
      .scorta-iconbtn:hover:not(:disabled) {
        background: rgba(12,10,9,.04);
        border-color: rgba(12,10,9,.14);
        color: var(--t1);
      }
      .scorta-audit-pill:hover {
        background: #fff;
        border-color: var(--mint-edge, rgba(44,140,112,.32));
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(12,10,9,.06);
      }
      .scorta-audit-pill:focus-visible {
        outline: 2px solid var(--mint, #2c8c70);
        outline-offset: 2px;
      }
    `}</style>
  )
}

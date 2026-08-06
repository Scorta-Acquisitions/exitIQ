"use client"

import React from "react"

import {
  BUYER_ARCHETYPE_LABEL,
  type BuyerArchetype,
  daysAgoLabel,
  getMandateMatches,
  getNetworkFunnel,
  getShortlistedBuyers,
  matchesMandate,
  NETWORK_BUYERS,
  type NetworkBuyer,
} from "@/lib/buyerNetwork"
import { getDealClock } from "@/lib/dealClock"
import type { PERSONA as PersonaShape } from "@/lib/persona"

import { BUYER_META, BUYERS as OUTREACH_BUYERS, type Buyer as OutreachBuyer } from "./OutreachStation"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

type Persona = typeof PersonaShape

const ARCHETYPE_ACCENT: Record<BuyerArchetype, { accent: string; soft: string; edge: string }> = {
  sba: { accent: "var(--mint, #2c8c70)", soft: "rgba(44,140,112,.10)", edge: "var(--mint-edge, rgba(44,140,112,.28))" },
  micro_pe: { accent: "var(--peach, #b86a3e)", soft: "rgba(184,106,62,.10)", edge: "var(--peach-edge, rgba(184,106,62,.28))" },
  search: { accent: "var(--sky, #4a7ba8)", soft: "rgba(74,123,168,.10)", edge: "var(--sky-edge, rgba(74,123,168,.26))" },
  independent_sponsor: { accent: "var(--lav, #6b5db0)", soft: "rgba(107,93,176,.10)", edge: "var(--lav-edge, rgba(107,93,176,.26))" },
}

const ARCHETYPE_FILTERS: ReadonlyArray<"all" | BuyerArchetype> = [
  "all",
  "sba",
  "search",
  "micro_pe",
  "independent_sponsor",
]

function formatEv(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  return `$${Math.round(n / 1000)}K`
}

export function NetworkStation({ persona }: { persona: Persona }) {
  const funnel = getNetworkFunnel()
  const shortlisted = getShortlistedBuyers()
  const matchIds = React.useMemo(() => new Set(getMandateMatches().map((b) => b.id)), [])

  const [archetypeFilter, setArchetypeFilter] = React.useState<"all" | BuyerArchetype>("all")
  const [matchesOnly, setMatchesOnly] = React.useState(false)

  const pool = NETWORK_BUYERS.filter((b) => b.tier === "pool")
  const filteredPool = pool.filter((b) => {
    if (archetypeFilter !== "all" && b.archetype !== archetypeFilter) return false
    if (matchesOnly && !matchesMandate(b)) return false
    return true
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ScopedStyles />
      <StationHeader />
      <CaseIntroBanner persona={persona} funnel={funnel} />

      <FunnelStrip funnel={funnel} />

      <ShortlistedSection shortlisted={shortlisted} outreachBuyers={OUTREACH_BUYERS} />

      <PoolSection
        pool={filteredPool}
        totalPool={pool.length}
        archetypeFilter={archetypeFilter}
        onArchetypeFilter={setArchetypeFilter}
        matchesOnly={matchesOnly}
        onMatchesOnly={setMatchesOnly}
        matchIds={matchIds}
      />
    </div>
  )
}

// ── Station header ──────────────────────────────────────────────────────────
function StationHeader() {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: "var(--t3)",
            fontWeight: 500,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          Station 11 · /network
        </div>
        <div style={{ height: 1, width: 22, background: "var(--div)" }} />
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "var(--t2)",
            fontFamily: inter,
          }}
        >
          Outreach Agent
        </div>
      </div>
      <h1
        style={{
          fontFamily: garamond,
          fontWeight: 400,
          fontSize: 38,
          lineHeight: 1.08,
          letterSpacing: "-.6px",
          color: "var(--t1)",
          marginTop: 4,
        }}
      >
        Buyer Network
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--t2)",
          lineHeight: 1.6,
          maxWidth: 720,
          fontFamily: inter,
        }}
      >
        The capital-verified buyer pool the Outreach Agent draws from — proof-of-funds or SBA
        pre-qualification confirmed before a single introduction is made. Filter against Fieldstone&apos;s
        own mandate to see who qualifies.
      </p>
    </header>
  )
}

// ── CASE intro banner ───────────────────────────────────────────────────────
function CaseIntroBanner({
  persona,
  funnel,
}: {
  persona: Persona
  funnel: ReturnType<typeof getNetworkFunnel>
}) {
  const clock = getDealClock()
  const businessShort = persona.identity.shortName
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 13,
        padding: "14px 16px",
        borderRadius: 14,
        background: "rgba(255,255,255,.7)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          flexShrink: 0,
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 8px rgba(44,140,112,.45)",
          marginTop: 1,
          animation: "networkCasePulse 3.2s ease-in-out infinite",
        }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--t2)",
            fontWeight: 500,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          CASE · Case Manager
        </div>
        <div style={{ fontSize: 13.5, color: "var(--t1)", lineHeight: 1.55, fontFamily: inter }}>
          {funnel.totalBuyers} capital-verified buyers were already in the network before{" "}
          {persona.identity.firstName} signed — {funnel.mandateMatches} of them match{" "}
          {businessShort}&apos;s own mandate on industry, geography, and deal size.{" "}
          {funnel.shortlisted} are already shortlisted and {funnel.sequencesLive} sequences are live
          today, on day {clock.dayNumber} of this deal — against a {clock.brokerAvgDaysToClose}-day
          broker average. That head start on
          verification is a real part of why this deal is moving faster than the benchmark.
        </div>
      </div>
    </div>
  )
}

// ── Funnel strip ─────────────────────────────────────────────────────────────
function FunnelStrip({ funnel }: { funnel: ReturnType<typeof getNetworkFunnel> }) {
  const steps: ReadonlyArray<{ value: number; label: string }> = [
    { value: funnel.mandateMatches, label: "Mandate matches" },
    { value: funnel.shortlisted, label: "Shortlisted" },
    { value: funnel.sequencesLive, label: "Sequences live" },
  ]
  return (
    <section
      style={{
        padding: "20px 24px",
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderTop: "3px solid var(--mint, #2c8c70)",
        borderRadius: 18,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 12px 32px rgba(12,10,9,.06)",
        display: "flex",
        alignItems: "center",
        gap: 18,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 10.5,
          color: "var(--t3)",
          fontWeight: 600,
          letterSpacing: ".7px",
          textTransform: "uppercase",
          marginRight: 6,
        }}
      >
        Pool of {funnel.totalBuyers}
      </div>
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          {i > 0 && (
            <span aria-hidden style={{ color: "var(--t3)", fontSize: 16 }}>
              →
            </span>
          )}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <div style={{ fontFamily: garamond, fontSize: 26, fontWeight: 500, color: "var(--t1)", letterSpacing: "-.3px" }}>
              {step.value}
            </div>
            <div style={{ fontFamily: inter, fontSize: 12, color: "var(--t2)" }}>{step.label}</div>
          </div>
        </React.Fragment>
      ))}
    </section>
  )
}

// ── Shortlisted section ──────────────────────────────────────────────────────
function ShortlistedSection({
  shortlisted,
  outreachBuyers,
}: {
  shortlisted: ReadonlyArray<NetworkBuyer>
  outreachBuyers: ReadonlyArray<OutreachBuyer>
}) {
  const outreachById = React.useMemo(
    () => new Map(outreachBuyers.map((b) => [b.id, b])),
    [outreachBuyers],
  )
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <SectionLabel>Shortlisted &amp; in sequence for Fieldstone</SectionLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {shortlisted.map((buyer) => {
          const outreach = outreachById.get(buyer.id)
          const meta = outreach ? BUYER_META[outreach.buyerType] : ARCHETYPE_ACCENT[buyer.archetype]
          return (
            <div
              key={buyer.id}
              style={{
                padding: "16px 18px",
                background: "rgba(255,255,255,.85)",
                border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
                borderTop: `3px solid ${meta.accent}`,
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontFamily: garamond, fontSize: 18, fontWeight: 500, color: "var(--t1)" }}>
                  {buyer.name}
                </div>
                <ArchetypeChip archetype={buyer.archetype} />
              </div>
              <div style={{ fontSize: 12.5, color: "var(--t2)", fontFamily: inter, lineHeight: 1.55 }}>
                {buyer.descriptor}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <VerifiedBadge buyer={buyer} />
                <span style={{ fontFamily: mono, fontSize: 10.5, color: "var(--t3)" }}>
                  Active {daysAgoLabel(buyer.lastActiveDaysAgo)}
                </span>
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".3px",
                  color: outreach?.held ? "var(--t3)" : "var(--mint, #2c8c70)",
                }}
              >
                {outreach?.held ? "Sequence held" : "Sequence live"}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── Pool section (filterable) ────────────────────────────────────────────────
function PoolSection({
  pool,
  totalPool,
  archetypeFilter,
  onArchetypeFilter,
  matchesOnly,
  onMatchesOnly,
  matchIds,
}: {
  pool: ReadonlyArray<NetworkBuyer>
  totalPool: number
  archetypeFilter: "all" | BuyerArchetype
  onArchetypeFilter: (a: "all" | BuyerArchetype) => void
  matchesOnly: boolean
  onMatchesOnly: (v: boolean) => void
  matchIds: ReadonlySet<string>
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <SectionLabel>Full pool · {totalPool} additional buyers</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <FilterPills value={archetypeFilter} onChange={onArchetypeFilter} />
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: inter,
              fontSize: 12,
              color: "var(--t2)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={matchesOnly}
              onChange={(e) => onMatchesOnly(e.target.checked)}
            />
            Mandate matches only
          </label>
        </div>
      </div>

      {pool.length === 0 ? (
        <div
          style={{
            padding: "26px",
            textAlign: "center",
            color: "var(--t3)",
            fontFamily: inter,
            fontSize: 13,
            background: "rgba(255,255,255,.6)",
            border: "1px dashed var(--glass-edge, rgba(0,0,0,.12))",
            borderRadius: 14,
          }}
        >
          No buyers match this filter combination.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          {pool.map((buyer) => (
            <PoolBuyerCard key={buyer.id} buyer={buyer} isMandateMatch={matchIds.has(buyer.id)} />
          ))}
        </div>
      )}
    </section>
  )
}

function PoolBuyerCard({ buyer, isMandateMatch }: { buyer: NetworkBuyer; isMandateMatch: boolean }) {
  const accent = ARCHETYPE_ACCENT[buyer.archetype]
  return (
    <div
      style={{
        padding: "13px 15px",
        background: "rgba(255,255,255,.7)",
        border: `1px solid ${isMandateMatch ? accent.edge : "var(--glass-edge, rgba(0,0,0,.07))"}`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontFamily: garamond, fontSize: 15.5, fontWeight: 500, color: "var(--t1)" }}>
          {buyer.name}
        </div>
        <ArchetypeChip archetype={buyer.archetype} />
      </div>
      <div style={{ fontSize: 11.5, color: "var(--t2)", fontFamily: inter, lineHeight: 1.5 }}>
        {buyer.mandate.industries.join(" · ")}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--t3)", fontFamily: inter }}>
        {buyer.mandate.geographies.join(" · ")} · {formatEv(buyer.mandate.evLow)}–{formatEv(buyer.mandate.evHigh)}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <VerifiedBadge buyer={buyer} compact />
        <span style={{ fontFamily: mono, fontSize: 10, color: "var(--t3)" }}>
          {daysAgoLabel(buyer.lastActiveDaysAgo)}
        </span>
      </div>
      {isMandateMatch && (
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".4px",
            textTransform: "uppercase",
            color: accent.accent,
          }}
        >
          Mandate match
        </div>
      )}
    </div>
  )
}

// ── Shared bits ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 10.5,
        color: "var(--t3)",
        fontWeight: 600,
        letterSpacing: ".7px",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  )
}

function ArchetypeChip({ archetype }: { archetype: BuyerArchetype }) {
  const meta = ARCHETYPE_ACCENT[archetype]
  return (
    <span
      style={{
        padding: "3px 9px",
        borderRadius: 9999,
        background: meta.soft,
        border: `1px solid ${meta.edge}`,
        fontFamily: mono,
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: ".4px",
        textTransform: "uppercase",
        color: meta.accent,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {BUYER_ARCHETYPE_LABEL[archetype]}
    </span>
  )
}

function VerifiedBadge({ buyer, compact }: { buyer: NetworkBuyer; compact?: boolean }) {
  const label = buyer.verification.kind === "sba_prequal" ? "SBA Pre-Qualified" : "Proof of Funds"
  return (
    <span
      title={buyer.verification.detail}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: compact ? "2px 8px" : "3px 9px",
        borderRadius: 9999,
        background: "rgba(44,140,112,.08)",
        border: "1px solid var(--mint-edge, rgba(44,140,112,.24))",
        fontFamily: inter,
        fontSize: compact ? 10 : 11,
        fontWeight: 600,
        color: "var(--mint, #2c8c70)",
        whiteSpace: "nowrap",
      }}
    >
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2.5 6.2l2.3 2.3 4.7-5" />
      </svg>
      {label}
    </span>
  )
}

function FilterPills({
  value,
  onChange,
}: {
  value: "all" | BuyerArchetype
  onChange: (v: "all" | BuyerArchetype) => void
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: 3,
        background: "rgba(12,10,9,.04)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 9999,
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      {ARCHETYPE_FILTERS.map((key) => {
        const active = value === key
        const label = key === "all" ? "All" : BUYER_ARCHETYPE_LABEL[key]
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            style={{
              all: "unset",
              padding: "6px 12px",
              borderRadius: 9999,
              fontFamily: inter,
              fontSize: 11.5,
              fontWeight: 600,
              color: active ? "var(--t1)" : "var(--t3)",
              background: active ? "rgba(255,255,255,.95)" : "transparent",
              boxShadow: active ? "0 2px 8px rgba(12,10,9,.08)" : "none",
              cursor: "pointer",
              transition: "background 180ms ease-out, color 180ms ease-out",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── Scoped styles ────────────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes networkCasePulse {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.12); opacity: .9; }
      }
    `}</style>
  )
}

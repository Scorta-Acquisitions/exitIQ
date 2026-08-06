"use client"

import Link from "next/link"
import React from "react"

import {
  type AttentionItem,
  getAttentionQueue,
  getOperatorDeals,
  type OperatorDeal,
  type OperatorVertical,
  VERTICAL_ACCENT,
  VERTICAL_LABEL,
} from "@/lib/operatorDeals"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

export function OperatorDealsStation() {
  const deals = React.useMemo(() => getOperatorDeals(), [])
  const attention = React.useMemo(() => getAttentionQueue(), [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <StationHeader dealCount={deals.length} />
      <AttentionNeededQueue items={attention} />
      <DealGrid deals={deals} />
      <style>{`
        .scorta-deal-card:hover {
          box-shadow: 0 8px 22px rgba(12,10,9,.08);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}

// ── Station header ──────────────────────────────────────────────────────────
function StationHeader({ dealCount }: { dealCount: number }) {
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
          Operator Console · /deals
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
          {dealCount} active
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
        Deal Portfolio
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--t2)",
          lineHeight: 1.6,
          maxWidth: 760,
          fontFamily: inter,
        }}
      >
        Every active engagement, its current stage, and its open blocker. Click into a deal to
        open its own workspace.
      </p>
    </header>
  )
}

// ── Attention Needed queue ───────────────────────────────────────────────────
// Every deal's existing `blocker` string, oldest-stuck first (`elapsedDays`
// descending — see `getAttentionQueue()` in `lib/operatorDeals.ts`). No new
// data model: this is the same blocker each `DealCard` below already shows,
// just surfaced as a scannable triage list before the grid.
function AttentionNeededQueue({ items }: { items: ReadonlyArray<AttentionItem> }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionLabel>Attention needed · oldest-stuck first</SectionLabel>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderRadius: 16,
          border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
          background: "rgba(255,255,255,.82)",
          overflow: "hidden",
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "13px 20px",
              borderTop: i === 0 ? "none" : "1px solid var(--glass-edge, rgba(0,0,0,.06))",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 46,
                textAlign: "right",
                fontFamily: garamond,
                fontSize: 17,
                fontWeight: 500,
                color: "var(--peach, #b86a3e)",
              }}
              title={`Day ${item.elapsedDays} — elapsed time since intake`}
            >
              d{item.elapsedDays}
            </div>
            <div style={{ flexShrink: 0, width: 190, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--t1)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.businessName}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--t2)", fontFamily: inter, lineHeight: 1.5 }}>
              {item.blocker}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Deal grid ─────────────────────────────────────────────────────────────
function DealGrid({ deals }: { deals: ReadonlyArray<OperatorDeal> }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionLabel>All active deals</SectionLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 14,
        }}
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </section>
  )
}

function DealCard({ deal }: { deal: OperatorDeal }) {
  const accent = VERTICAL_ACCENT[deal.vertical]
  return (
    <Link
      href={`/deals/${deal.id}`}
      className="scorta-deal-card"
      style={{
        padding: "18px 20px",
        background: deal.isLiveDeal ? "rgba(44,140,112,.05)" : "rgba(255,255,255,.85)",
        border: `1px solid ${deal.isLiveDeal ? "var(--mint-edge, rgba(44,140,112,.32))" : "var(--glass-edge, rgba(0,0,0,.07))"}`,
        borderTop: `3px solid ${accent.accent}`,
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: deal.isLiveDeal ? "0 4px 14px rgba(44,140,112,.10)" : "none",
        textDecoration: "none",
        cursor: "pointer",
        transition: "box-shadow 180ms ease-out, transform 180ms ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: garamond, fontSize: 19, fontWeight: 500, color: "var(--t1)", lineHeight: 1.15 }}>
            {deal.businessName}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--t3)", fontFamily: inter, marginTop: 3 }}>
            {deal.industry}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <VerticalChip vertical={deal.vertical} />
        <span
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--t3)",
            letterSpacing: ".3px",
          }}
        >
          {deal.stage} · {deal.agent}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 7,
          paddingTop: 2,
        }}
      >
        <span style={{ fontFamily: mono, fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".5px" }}>
          Day
        </span>
        <span style={{ fontFamily: garamond, fontSize: 20, fontWeight: 500, color: "var(--t1)" }}>
          {deal.elapsedDays}
        </span>
      </div>

      <div
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          background: "rgba(184,106,62,.06)",
          border: "1px solid var(--peach-edge, rgba(184,106,62,.18))",
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 9.5,
            fontWeight: 600,
            letterSpacing: ".5px",
            textTransform: "uppercase",
            color: "var(--peach, #b86a3e)",
            marginBottom: 4,
          }}
        >
          Current blocker
        </div>
        <div style={{ fontSize: 12, color: "var(--t2)", fontFamily: inter, lineHeight: 1.5 }}>
          {deal.blocker}
        </div>
      </div>
    </Link>
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

export function VerticalChip({ vertical }: { vertical: OperatorVertical }) {
  const meta = VERTICAL_ACCENT[vertical]
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
      }}
    >
      {VERTICAL_LABEL[vertical]}
    </span>
  )
}

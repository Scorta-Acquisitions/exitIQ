"use client"

/**
 * The pipeline board — DealIQ's home surface.
 *
 * Board-first and dense on purpose. The seller workspace tells one deal's story
 * in glass cards; a searcher needs to see twelve at once and find the two worth
 * opening, so this is a four-column board with a derived funnel above it and no
 * per-section chrome.
 *
 * Every number is computed: the funnel counts, the shares behind the bars, and
 * the card order all come from `lib/dealiq/pipeline.ts` reading the deal list.
 * Nothing on this screen was typed by hand.
 */

import Link from "next/link"
import React from "react"

import { VerdictChip } from "@/components/dealiq/DealContextBar"
import { usePipelineDeals } from "@/components/dealiq/usePipelineDeals"
import { PIPELINE_COPY } from "@/lib/dealiq/data/copy"
import { formatCompactCurrency, formatDayCount, formatScore } from "@/lib/dealiq/format"
import { dealPath, PIPELINE_STAGES } from "@/lib/dealiq/navigation"
import { dealsInStage, funnel, orderedDeals } from "@/lib/dealiq/pipeline"
import type { PipelineDeal } from "@/lib/dealiq/types"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

export function PipelineBoard() {
  const { deals, screenedId, hydrated } = usePipelineDeals()
  const steps = React.useMemo(() => funnel(deals), [deals])
  const ordered = React.useMemo(() => orderedDeals(deals), [deals])

  if (deals.length === 0) {
    return <EmptyPipeline />
  }

  return (
    <div style={{ padding: "26px 22px 48px", fontFamily: inter }}>
      {/* Funnel — counts derived from the deal list, never stored */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--t3)",
            }}
          >
            {PIPELINE_COPY.eyebrow}
          </div>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: "-.3px",
              color: "var(--t1)",
              marginTop: 3,
            }}
          >
            {deals.length} deals in flight
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, flex: 1, minWidth: 320 }}>
          {steps.map((step) => (
            <div key={step.key} style={{ flex: 1, minWidth: 72 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: mono, fontSize: 17, color: "var(--t1)" }}>{step.count}</span>
                <span style={{ fontSize: 11, color: "var(--t2)" }}>{step.label}</span>
              </div>
              <div
                style={{ height: 3, borderRadius: 2, background: "var(--s1)", marginTop: 6, overflow: "hidden" }}
                aria-hidden
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.round(step.share * 100)}%`,
                    background: "var(--dq-accent)",
                    opacity: 0.55,
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Board */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 14,
          alignItems: "start",
        }}
      >
        {PIPELINE_STAGES.map((stage) => {
          // Filtering the *ordered* list keeps each column in canonical order, so
          // the stepper's "4 of 12" walks the board exactly as it reads.
          const inStage = dealsInStage(ordered, stage.key)
          return (
            <section key={stage.key} aria-label={stage.label} style={{ minWidth: 0 }}>
              <header style={{ padding: "0 2px 9px", borderBottom: "1px solid var(--div)", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                  <h2 style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: "var(--t1)" }}>{stage.label}</h2>
                  <span style={{ fontFamily: mono, fontSize: 11, color: "var(--t3)" }}>{inStage.length}</span>
                </div>
                <p style={{ margin: "3px 0 0", fontSize: 10.5, color: "var(--t3)", lineHeight: 1.35 }}>
                  {stage.meaning}
                </p>
              </header>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {inStage.map((deal) => (
                  <DealCard key={deal.id} deal={deal} isNew={hydrated && deal.id === screenedId} />
                ))}
                {inStage.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 11, color: "var(--t4)", padding: "10px 2px" }}>Nothing here.</p>
                ) : null}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function DealCard({ deal, isNew }: { deal: PipelineDeal; isNew: boolean }) {
  // Built as an array rather than a template literal: prettier-plugin-tailwindcss
  // rewrites class strings inside template literals and eats the separator.
  const className = ["dq-card", "dq-focus", isNew ? "dq-enter" : null].filter(Boolean).join(" ")
  return (
    <Link
      href={dealPath(deal.id)}
      className={className}
      style={{
        display: "block",
        textDecoration: "none",
        padding: "11px 12px 12px",
        borderRadius: 10,
        border: `1px solid ${isNew ? "var(--dq-accent-edge)" : "var(--b3)"}`,
        background: isNew ? "var(--dq-accent-soft)" : "var(--glass-bg)",
        boxShadow: "0 1px 2px rgba(20,15,8,.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span
          title={deal.name}
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--t1)",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {deal.name}
        </span>
        {isNew ? (
          <span
            style={{
              fontFamily: mono,
              fontSize: 8.5,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--dq-accent)",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            {PIPELINE_COPY.justScreenedBadge}
          </span>
        ) : null}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 3 }}>
        {deal.industry} · {deal.geography}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: mono, fontSize: 11.5, color: "var(--t1)" }}>{formatCompactCurrency(deal.ask)}</span>
        <span style={{ fontFamily: mono, fontSize: 10.5, color: "var(--t3)" }}>
          {formatCompactCurrency(deal.claimedSde)} SDE
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginTop: 9,
          paddingTop: 8,
          borderTop: "1px solid var(--div)",
        }}
      >
        {deal.score === null || deal.verdict === null ? (
          <span style={{ fontFamily: mono, fontSize: 10, color: "var(--t4)" }}>Unscored</span>
        ) : (
          <>
            <span style={{ fontFamily: mono, fontSize: 13, color: "var(--t1)" }}>{formatScore(deal.score)}</span>
            <VerdictChip verdict={deal.verdict} />
          </>
        )}
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: mono, fontSize: 9.5, color: "var(--t4)" }}>{formatDayCount(deal.daysInStage)}</span>
      </div>

      <p style={{ margin: "7px 0 0", fontSize: 10.5, color: "var(--t2)", lineHeight: 1.42 }}>{deal.lastAgentAction}</p>

      {deal.killReason ? (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 10.5,
            lineHeight: 1.42,
            color: "var(--crit)",
            borderLeft: "2px solid var(--crit-edge)",
            paddingLeft: 7,
          }}
        >
          {deal.killReason}
        </p>
      ) : null}
    </Link>
  )
}

function EmptyPipeline() {
  return (
    <div
      style={{
        padding: "96px 22px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        fontFamily: inter,
      }}
    >
      <h1 style={{ margin: 0, fontFamily: garamond, fontSize: 24, fontWeight: 500, color: "var(--t1)" }}>
        {PIPELINE_COPY.emptyTitle}
      </h1>
      <p style={{ margin: "8px 0 20px", fontSize: 13, color: "var(--t2)", maxWidth: 380, lineHeight: 1.5 }}>
        {PIPELINE_COPY.emptyBody}
      </p>
      <Link
        href="/dealiq/screen"
        className="dq-primary dq-focus"
        style={{
          padding: "9px 16px",
          borderRadius: 8,
          background: "var(--dq-accent)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {PIPELINE_COPY.emptyCta}
      </Link>
    </div>
  )
}

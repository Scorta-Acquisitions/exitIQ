"use client"

/**
 * Returns Model — the subscription surface. Capital stack, DSCR against its
 * floor, cash-on-cash, payback, and a sensitivity slider that recomputes every
 * metric live through `computeReturns`.
 *
 * All figures are pure `useMemo` over the engine — no effects, no state sync,
 * no per-frame state writes beyond the slider's own value. Scenarios are input
 * modifiers through `applyScenario`, never UI branches.
 */

import React from "react"

import { RETURNS_COPY } from "@/lib/dealiq/data/copy"
import { formatCurrency, formatDscr, formatPercent, formatYears } from "@/lib/dealiq/format"
import { applyScenario, computeReturns, SCENARIOS } from "@/lib/dealiq/returns"
import type { CapitalStackKey, FinancingTerms, ScenarioKey } from "@/lib/dealiq/types"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

const SLIDER_STEP = 10_000

const STACK_COLOR: Record<CapitalStackKey, string> = {
  sba: "var(--dq-accent)",
  seller_note: "var(--dq-agent)",
  buyer_cash: "var(--gold)",
}

function roundToStep(n: number): number {
  return Math.round(n / SLIDER_STEP) * SLIDER_STEP
}

export function ReturnsPanel({
  ask,
  fairValue,
  defensibleSde,
  terms,
  uncoveredOccupancy,
}: {
  ask: number
  fairValue: number
  defensibleSde: number
  terms: FinancingTerms
  uncoveredOccupancy: number
}) {
  // ±25% off the ask, widened downward if fair value sits below the band so its
  // tick is always on the track.
  const min = roundToStep(Math.min(ask * 0.75, fairValue))
  const max = roundToStep(ask * 1.25)

  const [price, setPrice] = React.useState(roundToStep(ask))
  const [scenarioKey, setScenarioKey] = React.useState<ScenarioKey>("base")

  const scenario = SCENARIOS.find((candidate) => candidate.key === scenarioKey) ?? SCENARIOS[0]!

  const returns = React.useMemo(
    () => computeReturns(applyScenario({ price, defensibleSde, terms }, scenario, uncoveredOccupancy)),
    [price, defensibleSde, terms, scenario, uncoveredOccupancy]
  )

  const tickShare = (value: number) => (max === min ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min))))

  return (
    <div style={{ padding: "26px 22px 48px", fontFamily: inter, maxWidth: 880 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {RETURNS_COPY.eyebrow}
      </div>
      <h1
        style={{
          margin: "3px 0 0",
          fontFamily: garamond,
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: "-.3px",
          color: "var(--t1)",
        }}
      >
        {RETURNS_COPY.title}
      </h1>

      {/* Sensitivity slider */}
      <section style={{ marginTop: 22, maxWidth: 620 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <label
            htmlFor="dq-price"
            style={{
              fontFamily: mono,
              fontSize: 10.5,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--t3)",
            }}
          >
            {RETURNS_COPY.sliderLabel}
          </label>
          <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 600, color: "var(--t1)" }}>
            {formatCurrency(price)}
          </span>
        </div>
        <div style={{ position: "relative", marginTop: 10 }}>
          <input
            id="dq-price"
            type="range"
            min={min}
            max={max}
            step={SLIDER_STEP}
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
            aria-valuetext={formatCurrency(price)}
            className="dq-focus"
            style={{ width: "100%", accentColor: "var(--dq-accent)", cursor: "pointer" }}
          />
          {/* Ticks at fair value and ask */}
          <div aria-hidden style={{ position: "relative", height: 26 }}>
            {[
              { label: RETURNS_COPY.tickFair, value: fairValue },
              { label: RETURNS_COPY.tickAsk, value: ask },
            ].map((tick) => (
              <div
                key={tick.label}
                style={{
                  position: "absolute",
                  left: `${tickShare(tick.value) * 100}%`,
                  transform: "translateX(-50%)",
                  textAlign: "center",
                }}
              >
                <div style={{ width: 1, height: 7, background: "var(--t3)", margin: "0 auto" }} />
                <div style={{ fontFamily: mono, fontSize: 9, color: "var(--t3)", whiteSpace: "nowrap" }}>
                  {tick.label} · {formatCurrency(tick.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenario chips */}
      <section style={{ marginTop: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="group" aria-label="Scenario">
          {SCENARIOS.map((candidate) => {
            const active = candidate.key === scenario.key
            return (
              <button
                key={candidate.key}
                type="button"
                aria-pressed={active}
                onClick={() => setScenarioKey(candidate.key)}
                className="dq-focus"
                style={{
                  padding: "7px 13px",
                  borderRadius: 8,
                  border: `1px solid ${active ? "var(--dq-accent-edge)" : "var(--b2)"}`,
                  background: active ? "var(--dq-accent-soft)" : "transparent",
                  color: active ? "var(--dq-accent)" : "var(--t2)",
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  fontFamily: inter,
                  cursor: "pointer",
                }}
              >
                {candidate.label}
              </button>
            )
          })}
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 11.5, lineHeight: 1.5, color: "var(--t2)" }}>{scenario.description}</p>
      </section>

      {/* Capital stack */}
      <section style={{ marginTop: 22 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--t3)",
          }}
        >
          {RETURNS_COPY.stackTitle}
        </div>
        <div
          aria-hidden
          style={{
            display: "flex",
            marginTop: 10,
            height: 26,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--b3)",
          }}
        >
          {returns.stack.map((segment) =>
            segment.share > 0 ? (
              <div
                key={segment.key}
                style={{ width: `${segment.share * 100}%`, background: STACK_COLOR[segment.key], opacity: 0.85 }}
                title={`${segment.label} ${formatPercent(segment.share)}`}
              />
            ) : null
          )}
        </div>
        <dl
          style={{
            margin: "12px 0 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {returns.stack.map((segment) => (
            <div key={segment.key} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span
                aria-hidden
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 3,
                  background: STACK_COLOR[segment.key],
                  marginTop: 3,
                  flexShrink: 0,
                }}
              />
              <div>
                <dt style={{ fontSize: 11.5, fontWeight: 500, color: "var(--t1)" }}>
                  {segment.label} · {formatPercent(segment.share)}
                </dt>
                <dd
                  style={{ margin: "1px 0 0", fontFamily: mono, fontSize: 12.5, fontWeight: 600, color: "var(--t1)" }}
                >
                  {formatCurrency(segment.amount)}
                </dd>
                <dd style={{ margin: "1px 0 0", fontFamily: mono, fontSize: 9.5, color: "var(--t3)" }}>
                  {segment.terms}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* Metric row */}
      <section
        style={{
          marginTop: 22,
          padding: "16px 18px",
          borderRadius: 11,
          border: "1px solid var(--b3)",
          background: "var(--glass-bg)",
        }}
      >
        <dl
          style={{
            margin: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 14,
          }}
        >
          <Metric label={RETURNS_COPY.metricDebtService} value={formatCurrency(returns.monthlyDebtService)} />
          <Metric
            label={RETURNS_COPY.metricDscr}
            value={`${formatDscr(returns.dscr)} vs ${formatDscr(returns.dscrFloor)}`}
            color={returns.meetsDscrFloor ? "var(--dq-accent)" : "var(--crit)"}
          />
          <Metric label={RETURNS_COPY.metricCoc} value={formatPercent(returns.cashOnCash, 1)} />
          <Metric
            label={RETURNS_COPY.metricPayback}
            value={
              returns.yearsToPayback === null ? `— ${RETURNS_COPY.neverRecovers}` : formatYears(returns.yearsToPayback)
            }
            color={returns.yearsToPayback === null ? "var(--crit)" : undefined}
          />
          <Metric label={RETURNS_COPY.metricSalary} value={formatCurrency(returns.buyerCompensation)} />
          <Metric label={RETURNS_COPY.metricCashRequired} value={formatCurrency(returns.cashRequired)} />
        </dl>
      </section>

      {/* Constraint line */}
      <section
        style={{
          marginTop: 16,
          padding: "12px 16px",
          borderRadius: 10,
          border: "1px solid var(--dq-accent-edge)",
          background: "var(--dq-accent-soft)",
          fontSize: 12,
          lineHeight: 1.55,
        }}
      >
        <span style={{ fontWeight: 600, color: "var(--t1)" }}>
          {RETURNS_COPY.constraintTitle}: {formatCurrency(returns.maxPriceAtDscrFloor)}.
        </span>{" "}
        <span style={{ color: "var(--t2)" }}>{RETURNS_COPY.constraintBody}</span>
      </section>
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <dt style={{ fontSize: 10.5, lineHeight: 1.4, color: "var(--t3)" }}>{label}</dt>
      <dd style={{ margin: "3px 0 0", fontFamily: mono, fontSize: 15, fontWeight: 600, color: color ?? "var(--t1)" }}>
        {value}
      </dd>
    </div>
  )
}

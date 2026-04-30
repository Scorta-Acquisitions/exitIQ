// use client: hooks, state, real-time updates
"use client"

import React from "react"
import type { Derived } from "@/lib/exitiq/calculations"
import { BUYER_CARDS } from "@/lib/exitiq/data"
import { ConfidenceMeter, Divider, LiveBadge, RadarRings, ScanLine, useSpring } from "./ui"

// ── Odometer number ───────────────────────────────────────────────────────────
function OdometerNum({
  target,
  prefix = "$",
  color = "var(--emerald)",
  size = 26,
}: {
  target: number
  prefix?: string
  color?: string
  size?: number
}) {
  const val = useSpring(target, 0.055, 0.8)
  const disp =
    target >= 1_000_000
      ? (val / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
      : target >= 1_000
        ? Math.round(val / 1_000) + "K"
        : Math.round(val).toString()

  return (
    <span
      style={{
        color,
        fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
        fontSize: size,
        fontWeight: 300,
        letterSpacing: "-.5px",
        lineHeight: 1,
      }}
    >
      {prefix}
      {disp}
    </span>
  )
}

function ZoneLabel({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div
      style={{
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: "1px",
        textTransform: "uppercase",
        color: accent ?? "var(--t3)",
        fontFamily: "Inter, sans-serif",
        paddingBottom: 2,
      }}
    >
      {children}
    </div>
  )
}

// ── Zone 1: Current diagnosis ─────────────────────────────────────────────────
function DiagnosisZone({
  derived,
  processing,
  recalcMsg,
}: {
  derived: Derived
  processing: boolean
  recalcMsg: string | null
}) {
  const { confidence } = derived
  const label =
    confidence === 0
      ? "Awaiting your first signal"
      : confidence < 30
        ? "Calibrating early signals…"
        : confidence < 55
          ? "Pattern detected — keep going"
          : confidence < 75
            ? "Strong buyer signal emerging"
            : "High confidence — signal formed"

  return (
    <div className="flex flex-col gap-2.5">
      <ZoneLabel accent="rgba(var(--mint-rgb),.5)">Current Diagnosis</ZoneLabel>
      <ConfidenceMeter value={confidence} />
      <div style={{ minHeight: 18 }}>
        {processing || recalcMsg ? (
          <div
            key={recalcMsg ?? "proc"}
            className="flex items-center gap-[7px]"
            style={{ animation: "fadeIn .3s ease" }}
          >
            <div className="flex gap-[3px]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "var(--mint)",
                    animation: `dotBounce .9s ${i * 0.18}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 11, color: "rgba(var(--mint-rgb),.65)", fontFamily: "Inter, sans-serif" }}>
              {recalcMsg ?? "Recalculating…"}
            </span>
          </div>
        ) : (
          <div
            key={label}
            style={{
              fontSize: 11,
              color: "var(--t3)",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.5,
              animation: "fadeIn .4s ease",
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Zone 2: Key signals ───────────────────────────────────────────────────────
function SignalsZone({ derived }: { derived: Derived }) {
  const { valuationRange, multiple, brokerFee } = derived

  return (
    <div className="flex flex-col gap-[14px]">
      <ZoneLabel>Key Signals</ZoneLabel>

      {/* Valuation */}
      <div className="flex flex-col gap-1">
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".8px",
            textTransform: "uppercase",
            color: "var(--t3)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Valuation Signal
        </div>
        {!valuationRange ? (
          <div
            style={{
              fontSize: 14,
              color: "var(--t5)",
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontWeight: 300,
            }}
          >
            Not calibrated
          </div>
        ) : (
          <div key={valuationRange.text} style={{ animation: "numRoll .55s cubic-bezier(.34,1.3,.64,1)" }}>
            <div className="flex items-baseline flex-wrap">
              <OdometerNum target={valuationRange.low} color="var(--t1)" size={26} />
              <span
                style={{
                  color: "var(--t4)",
                  margin: "0 5px",
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 22,
                }}
              >
                –
              </span>
              <OdometerNum target={valuationRange.high} color="var(--t1)" size={26} />
            </div>
            {multiple && (
              <div
                style={{
                  fontSize: 10,
                  color: "var(--emerald)",
                  fontWeight: 500,
                  marginTop: 3,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {multiple} SDE multiple
              </div>
            )}
          </div>
        )}
      </div>

      {/* Broker fee */}
      <div className="flex flex-col gap-1">
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".8px",
            textTransform: "uppercase",
            color: "rgba(var(--peach-rgb),.55)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Broker Fee Exposure
        </div>
        {!brokerFee ? (
          <div
            style={{
              fontSize: 14,
              color: "var(--t5)",
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontWeight: 300,
            }}
          >
            $0 estimated
          </div>
        ) : (
          <div key={brokerFee.text} style={{ animation: "numRoll .5s cubic-bezier(.34,1.3,.64,1)" }}>
            <div className="flex items-baseline">
              <OdometerNum target={brokerFee.low} color="var(--peach)" size={26} />
              <span
                style={{
                  color: "rgba(var(--peach-rgb),.35)",
                  margin: "0 5px",
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 22,
                }}
              >
                –
              </span>
              <OdometerNum target={brokerFee.high} color="var(--peach)" size={26} />
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(var(--peach-rgb),.5)",
                marginTop: 3,
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.45,
              }}
            >
              Before you pay this, see what buyers will question.
            </div>
          </div>
        )}
      </div>

      {/* Buyer match */}
      {derived.industry && (
        <div className="flex flex-col gap-1.5">
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".8px",
              textTransform: "uppercase",
              color: "rgba(var(--mint-rgb),.5)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Buyer Match
          </div>
          {BUYER_CARDS.map(({ type, icon, color }, i) => {
            const likelihood = i === 0 ? "High" : i === 1 ? "Medium" : i === 2 ? "Medium" : "Unlikely"
            return (
              <div
                key={type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: i === 3 ? 0.3 : 1,
                  animation: `slideUp .35s ${i * 65}ms ease both`,
                }}
              >
                <div className="flex items-center gap-[7px]">
                  <span style={{ color, fontSize: 11 }}>{icon}</span>
                  <span style={{ fontSize: 11, color: "var(--t2)", fontFamily: "Inter, sans-serif" }}>{type}</span>
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: ".6px",
                    textTransform: "uppercase",
                    fontFamily: "Inter, sans-serif",
                    color: i === 0 ? "var(--emerald)" : i <= 2 ? "var(--mint)" : "var(--t4)",
                  }}
                >
                  {likelihood}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Zone 3: Still needed ──────────────────────────────────────────────────────
function StillNeededZone({ step }: { step: number }) {
  const needs: { label: string; desc: string }[] = []
  if (step < 4) needs.push({ label: "Owner dependency", desc: "Buyers will discount for this" })
  if (step < 3) needs.push({ label: "Customer concentration", desc: "Key risk for buyer confidence" })
  if (step < 5) needs.push({ label: "Financial documentation", desc: "Required for SBA financing" })
  needs.push({ label: "Legal / lease risk", desc: "Locked in full report" })

  if (needs.length === 0) return null

  return (
    <div className="flex flex-col gap-2.5">
      <ZoneLabel accent="rgba(var(--peach-rgb),.5)">Still Needed for Full Report</ZoneLabel>
      <div className="flex flex-col gap-1.5">
        {needs.slice(0, 3).map(({ label, desc }, i) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
              animation: `slideUp .35s ${i * 55}ms ease both`,
            }}
          >
            <div className="flex items-start gap-[7px]">
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "rgba(var(--peach-rgb),.4)",
                  flexShrink: 0,
                  marginTop: 4,
                }}
              />
              <div>
                <div style={{ fontSize: 11, color: "var(--t2)", fontFamily: "Inter, sans-serif" }}>{label}</div>
                <div style={{ fontSize: 10, color: "var(--t4)", fontFamily: "Inter, sans-serif", marginTop: 1 }}>
                  {desc}
                </div>
              </div>
            </div>
            <svg
              width={12}
              height={12}
              viewBox="0 0 12 12"
              fill="none"
              style={{ opacity: 0.3, flexShrink: 0, marginTop: 3 }}
            >
              <rect x={1} y={5} width={10} height={7} rx={1.5} fill="currentColor" stroke="var(--t3)" />
              <path d="M3.5 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="var(--t3)" strokeWidth={1} fill="none" />
            </svg>
          </div>
        ))}
      </div>
      {step < 6 && (
        <div
          style={{
            background: "rgba(var(--emerald-rgb),.05)",
            border: "1px solid rgba(var(--emerald-rgb),.14)",
            borderRadius: 10,
            padding: "10px 12px",
            marginTop: 2,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".8px",
              textTransform: "uppercase",
              color: "rgba(var(--emerald-rgb),.6)",
              fontFamily: "Inter, sans-serif",
              marginBottom: 5,
            }}
          >
            Continue to unlock:
          </div>
          {["Buyer discount factors", "Deal risk scan", "90-day prep plan"].map((l, i) => (
            <div
              key={l}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 3,
                animation: `slideUp .3s ${i * 50}ms ease both`,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "rgba(var(--emerald-rgb),.5)",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "Inter, sans-serif" }}>{l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Market conditions ─────────────────────────────────────────────────────────
function MarketConditions({ derived }: { derived: Derived }) {
  const hot = derived.isHotState
  return (
    <div className="glass flex flex-col gap-[9px] p-[13px_15px]">
      <div
        className="flex items-center gap-1.5"
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--t3)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--mint)",
            animation: "liveBlink 1.6s ease-in-out infinite",
          }}
        />
        Live Market
      </div>
      {[
        { label: "Active strategic buyers", val: "2,847", delta: "+12%" },
        { label: "Avg deal close", val: `${hot ? 74 : 87} days`, delta: hot ? "−13 days" : "−4 days" },
        { label: "M&A volume Q2 '25", val: "$4.2B", delta: "+8% QoQ" },
      ].map((r, i) => (
        <div key={i} className="flex justify-between items-center">
          <span style={{ fontSize: 10, color: "var(--t3)", fontFamily: "Inter, sans-serif" }}>{r.label}</span>
          <div className="flex gap-[5px] items-center">
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--t2)", fontFamily: "Inter, sans-serif" }}>
              {r.val}
            </span>
            <span style={{ fontSize: 9, fontWeight: 600, color: "var(--mint)", fontFamily: "Inter, sans-serif" }}>
              {r.delta}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Master DashboardPanel ─────────────────────────────────────────────────────
interface DashboardPanelProps {
  step: number
  derived: Derived
  processing: boolean
  recalcMsg: string | null
}

export function DashboardPanel({ step, derived, processing, recalcMsg }: DashboardPanelProps) {
  return (
    <div className="flex flex-col gap-2.5 relative">
      <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 z-0 pointer-events-none">
        <RadarRings active={processing || step >= 3} />
      </div>

      <div
        className="glass-panel p-[22px] flex flex-col gap-[18px] relative z-[1] overflow-hidden"
        style={{ animation: "panelGlow 5s ease-in-out infinite" }}
      >
        <ScanLine speed={4} />
        <LiveBadge />
        <DiagnosisZone derived={derived} processing={processing} recalcMsg={recalcMsg} />
        <Divider />
        <SignalsZone derived={derived} />
        {step > 0 && (
          <>
            <Divider />
            <StillNeededZone step={step} />
          </>
        )}
      </div>

      <MarketConditions derived={derived} />

      {step === 0 && (
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "var(--t4)",
            letterSpacing: ".2px",
            animation: "liveBlink 3.5s ease-in-out infinite",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Answer to activate valuation engine
        </div>
      )}
    </div>
  )
}

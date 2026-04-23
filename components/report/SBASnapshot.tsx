"use client"

import type { SBASnapshot as SBASnapshotType } from "@/lib/assessment/sba"
import { fmt } from "@/lib/assessment/scoring"

interface SBASnapshotProps {
  snapshot: SBASnapshotType
}

export function SBASnapshot({ snapshot }: SBASnapshotProps) {
  if (!snapshot.eligible) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1.5px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(251,189,65,0.12)",
              border: "1.5px solid #fbbd41",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              flexShrink: 0,
            }}
          >
            ⚠
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>SBA 7(a) Financing</div>
            <div style={{ fontSize: "12px", color: "#fbbd41" }}>Not eligible for this business</div>
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>{snapshot.note}</p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: "rgba(132,231,165,0.06)",
        border: "1.5px solid rgba(132,231,165,0.25)",
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "rgba(132,231,165,0.15)",
            border: "1.5px solid #84e7a5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            flexShrink: 0,
          }}
        >
          ✓
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>SBA 7(a) Eligible</div>
          <div style={{ fontSize: "12px", color: "#84e7a5" }}>Buyer pool: {snapshot.buyerPoolLabel}</div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {[
          { label: "Loan Amount", value: fmt(snapshot.loanAmount), sub: "Up to" },
          { label: "Down Payment", value: fmt(snapshot.downPayment), sub: "Buyer needs" },
          { label: "Monthly Payment", value: `~${fmt(snapshot.monthlyPayment)}`, sub: "Estimated" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              padding: "14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>{stat.sub}</div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#84e7a5",
                fontFamily: "var(--font-space-mono, monospace)",
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>{snapshot.note}</p>
    </div>
  )
}

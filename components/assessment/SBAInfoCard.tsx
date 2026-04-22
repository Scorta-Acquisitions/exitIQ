"use client"

import type { SBASnapshot } from "@/lib/assessment/sba"
import { fmt } from "@/lib/assessment/scoring"

interface SBAInfoCardProps {
  snapshot: SBASnapshot
}

export function SBAInfoCard({ snapshot }: SBAInfoCardProps) {
  if (!snapshot.eligible) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.06)",
        border: "1.5px solid rgba(255,255,255,0.12)",
        borderRadius: "14px",
        padding: "18px 20px",
        marginBottom: "24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "rgba(251,189,65,0.15)", border: "1.5px solid #fbbd41",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", flexShrink: 0,
          }}>⚠</div>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#fbbd41" }}>SBA 7(a) Financing</span>
        </div>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, margin: 0 }}>
          {snapshot.note}
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: "rgba(132,231,165,0.08)",
      border: "1.5px solid rgba(132,231,165,0.3)",
      borderRadius: "14px",
      padding: "18px 20px",
      marginBottom: "24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "50%",
          background: "rgba(132,231,165,0.2)", border: "1.5px solid #84e7a5",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", flexShrink: 0,
        }}>✓</div>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#84e7a5" }}>SBA 7(a) Eligible — Wider Buyer Pool</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
        {[
          { label: "Loan Amount", value: fmt(snapshot.loanAmount) },
          { label: "Down Payment", value: fmt(snapshot.downPayment) },
          { label: "Monthly Payment", value: `~${fmt(snapshot.monthlyPayment)}` },
        ].map((item) => (
          <div key={item.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#84e7a5", fontFamily: "var(--font-space-mono, monospace)" }}>
              {item.value}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{item.label}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>
        {snapshot.buyerPoolLabel} buyer pool. Based on 10.5% APR / 10-year term.
      </p>
    </div>
  )
}

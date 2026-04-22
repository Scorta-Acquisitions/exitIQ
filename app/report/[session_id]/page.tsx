"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FlagColumns } from "@/components/report/FlagColumns"
import { GrowthLevers } from "@/components/report/GrowthLevers"
import { NinetyDayChecklist } from "@/components/report/NinetyDayChecklist"
import { RadarChart } from "@/components/report/RadarChart"
import { ReportCTA } from "@/components/report/ReportCTA"
import { SBASnapshot } from "@/components/report/SBASnapshot"
import { ValuationBar } from "@/components/report/ValuationBar"
import { computeSBASnapshot } from "@/lib/assessment/sba"
import type { SBASnapshot as SBASnapshotType } from "@/lib/assessment/sba"
import type { ScoreResult } from "@/lib/assessment/scoring"
import { computeScore } from "@/lib/assessment/scoring"
import { loadSession } from "@/lib/assessment/session"
import type { AssessmentSession } from "@/lib/assessment/session"

const GRADE_COLORS: Record<string, string> = {
  A: "#84e7a5",
  B: "#84e7a5",
  C: "#fbbd41",
  D: "#ff6b6b",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "48px" }}>
      <h2 style={{
        fontSize: "18px", fontWeight: 700, color: "rgba(255,255,255,0.5)",
        textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px",
        paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function ReportPage() {
  const router = useRouter()
  const [session, setSession] = useState<Partial<AssessmentSession> | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [sba, setSba] = useState<SBASnapshotType | null>(null)

  useEffect(() => {
    const s = loadSession()
    if (!s.stage1) {
      router.replace("/")
      return
    }
    setSession(s)
    setScore(computeScore(s))
    setSba(computeSBASnapshot(s.stage1 ?? {}))
  }, [router])

  if (!session || !score || !sba) {
    return (
      <div style={{
        minHeight: "100vh", background: "#02492a",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>Loading report…</div>
      </div>
    )
  }

  const gradeColor = GRADE_COLORS[score.grade] ?? "#84e7a5"
  const firstName = session.gate?.firstName
  const growthLevers = (session.stage3?.growthLevers as string | undefined) ?? ""

  return (
    <div style={{ minHeight: "100vh", background: "#02492a", fontFamily: "var(--font-sans, sans-serif)" }}>
      {/* Header */}
      <header style={{
        background: "rgba(2,73,42,0.95)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 24px",
      }}>
        <div style={{
          maxWidth: "800px", margin: "0 auto", height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "50%", background: "#84e7a5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "9px", fontWeight: 700, color: "#02492a",
            }}>IQ</div>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Exit IQ Report</span>
          </div>
          <div style={{
            background: "rgba(132,231,165,0.1)", border: "1px solid rgba(132,231,165,0.2)",
            borderRadius: "1584px", padding: "4px 12px",
            fontSize: "12px", fontWeight: 600, color: "#84e7a5",
          }}>
            Confidential
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Hero score block */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "36px",
          marginBottom: "48px",
          display: "flex",
          gap: "32px",
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          {/* Score circle */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              width: "120px", height: "120px", borderRadius: "50%",
              background: `rgba(132,231,165,0.08)`,
              border: `4px solid ${gradeColor}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <div style={{
                fontSize: "42px", fontWeight: 700, color: gradeColor,
                fontFamily: "var(--font-space-mono, monospace)", lineHeight: 1,
              }}>{score.composite}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>/100</div>
            </div>
            <div style={{
              marginTop: "8px", fontSize: "14px", fontWeight: 700,
              color: gradeColor, letterSpacing: "1px",
            }}>Grade {score.grade}</div>
          </div>

          {/* Narrative */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h1 style={{
              fontSize: "clamp(18px, 3.5vw, 26px)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.5px",
              margin: "0 0 12px",
              lineHeight: 1.3,
            }}>
              {firstName ? `${firstName}'s` : "Your"} Exit IQ Report
            </h1>
            <p style={{
              fontSize: "14px", color: "rgba(255,255,255,0.65)",
              lineHeight: 1.65, margin: 0,
            }}>
              {score.narrative}
            </p>
            {score.distressed && (
              <div style={{
                marginTop: "12px",
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)",
                borderRadius: "1584px", padding: "4px 12px",
                fontSize: "11px", fontWeight: 600, color: "#ff6b6b",
              }}>
                ⚠ Distressed sale context
              </div>
            )}
          </div>
        </div>

        {/* Radar chart */}
        <Section title="Exit IQ Dimensions">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <RadarChart dimensions={score.dimensions} size={300} />
          </div>
        </Section>

        {/* Valuation */}
        <Section title="Valuation Range">
          <ValuationBar s1={session.stage1 ?? {}} askingPrice={session.stage4?.askingPrice} />
        </Section>

        {/* Flags */}
        <Section title="Risk & Readiness Flags">
          <FlagColumns flags={score.flags} />
        </Section>

        {/* SBA */}
        <Section title="SBA Financing Snapshot">
          <SBASnapshot snapshot={sba} />
        </Section>

        {/* Growth levers */}
        <Section title="Growth Opportunities">
          <GrowthLevers growthText={growthLevers} />
        </Section>

        {/* 90-day checklist */}
        <Section title="90-Day Action Plan">
          <NinetyDayChecklist items={score.checklist} />
        </Section>

        {/* CTA */}
        <Section title="Next Steps">
          <ReportCTA score={score} session={session} />
        </Section>

      </main>
    </div>
  )
}

// use client: progress bar state derived from stageNum + questionIdx props
"use client"

import Link from "next/link"

interface AssessmentShellProps {
  stageNum: 2 | 3 | 4
  questionIdx: number
  totalQuestions: number
  children: React.ReactNode
}

const STAGE_LABELS: Record<number, string> = {
  2: "Health Check",
  3: "Buyer Lens",
  4: "Goals",
}

export function AssessmentShell({ stageNum, questionIdx, totalQuestions, children }: AssessmentShellProps) {
  const overallTotal = 7 + 5 + 4 // S2 + S3 + S4
  const overallOffset = stageNum === 2 ? 0 : stageNum === 3 ? 7 : 12
  const overallProgress = ((overallOffset + questionIdx) / overallTotal) * 100

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#02492a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(2,73,42,0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            height: "60px",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#84e7a5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "#02492a",
                }}
              >
                IQ
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>Exit IQ</span>
            </div>
          </Link>

          {/* Stage label */}
          <div
            style={{
              background: "rgba(132,231,165,0.12)",
              border: "1px solid rgba(132,231,165,0.2)",
              borderRadius: "1584px",
              padding: "3px 10px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#84e7a5",
              letterSpacing: "0.3px",
            }}
          >
            Stage {stageNum}: {STAGE_LABELS[stageNum]}
          </div>

          <div style={{ flex: 1 }} />

          {/* Question counter */}
          <span
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "var(--font-space-mono, monospace)",
            }}
          >
            {questionIdx + 1}/{totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: "2px", background: "rgba(255,255,255,0.08)" }}>
          <div
            style={{
              height: "100%",
              width: `${overallProgress}%`,
              background: "#84e7a5",
              transition: "width 400ms cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          maxWidth: "680px",
          margin: "0 auto",
          width: "100%",
          padding: "48px 24px 80px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  )
}

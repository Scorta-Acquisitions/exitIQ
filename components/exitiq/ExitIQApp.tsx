// use client: manages assessment state machine, WebGL canvas lifecycle via useEffect/useRef, and all user interaction handlers
"use client"

import React from "react"
import { fetchReport, persistSession } from "@/lib/assessment/api"
import { computeTag } from "@/lib/assessment/segmentation"
import type { SegmentTag } from "@/lib/assessment/session"
import { generateSessionId, loadSession } from "@/lib/assessment/session"
import { TIMELINE_LABEL_TO_SLUG } from "@/lib/assessment/transform"
import { calcDerived } from "@/lib/exitiq/calculations"
import { ANSWER_KEYS, INSIGHTS, RECALC_MESSAGES } from "@/lib/exitiq/data"
import { setupWebGL, type WebGLControls } from "@/lib/exitiq/webgl"
import { BentoSection } from "./bento"
import { DashboardPanel } from "./dashboard"
import { EmailGateModal, PreviewCard } from "./preview"
import { QuestionPanel } from "./questions"
import { AIInsight, Ripple, ScanLine, SignalOrb } from "./ui"

const ORB_SIZE = 120

// Maps frontend year-bucket labels to representative year numbers for Stage1Answers.years
const YEAR_LABEL_TO_NUMBER: Record<string, number> = {
  "Under 2 years": 1,
  "2 – 5 years": 3,
  "5 – 10 years": 7,
  "10+ years": 15,
}

export function ExitIQApp() {
  const [step, setStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [processing, setProcessing] = React.useState(false)
  const [insight, setInsight] = React.useState<string | null>(null)
  const [ripple, setRipple] = React.useState<{ x: number; y: number } | null>(null)
  const [transitioning, setTransitioning] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [recalcMsg, setRecalcMsg] = React.useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(null)
  const [reportReady, setReportReady] = React.useState(false)

  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const glRef = React.useRef<WebGLControls | null>(null)

  const derived = React.useMemo(() => calcDerived(answers), [answers])
  const stepCount = step < 6 ? step : 6

  // ── WebGL init ───────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!canvasRef.current) return
    const gl = setupWebGL(canvasRef.current)
    glRef.current = gl
    setTimeout(() => setMounted(true), 140)
    return gl.cleanup
  }, [])

  // ── Confidence → WebGL uniform ───────────────────────────────────────────────
  React.useEffect(() => {
    glRef.current?.setConf(derived.confidence / 100)
  }, [derived.confidence])

  // ── Report polling — 5s interval, max 12 retries (~60s) ─────────────────────
  React.useEffect(() => {
    if (!submitted || !currentSessionId || reportReady) return

    let attempts = 0
    let timer: ReturnType<typeof setTimeout>

    const poll = async () => {
      if (attempts >= 12) return
      attempts++
      const result = await fetchReport(currentSessionId)
      if (result?.status === "ready") {
        setReportReady(true)
        return
      }
      timer = setTimeout(poll, 5000)
    }

    timer = setTimeout(poll, 5000)
    return () => clearTimeout(timer)
  }, [submitted, currentSessionId, reportReady])

  // ── Answer handler ───────────────────────────────────────────────────────────
  const handleAnswer = React.useCallback(
    (value: string, e: React.MouseEvent) => {
      if (transitioning) return

      const rect = e.currentTarget.getBoundingClientRect()
      setRipple({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

      const key = ANSWER_KEYS[step]
      if (!key) return

      setTransitioning(true)
      setProcessing(true)
      setInsight(null)

      const msg = RECALC_MESSAGES[key] ?? "Recalculating…"
      setRecalcMsg(msg)
      setTimeout(() => setRecalcMsg(null), 1600)

      const insightSource = INSIGHTS[key]
      const insightText =
        typeof insightSource === "function"
          ? insightSource(value)
          : ((insightSource as Record<string, string>)?.[value] ?? null)

      setTimeout(() => {
        setProcessing(false)
        if (insightText) setInsight(insightText)
        setAnswers((prev) => ({ ...prev, [key]: value }))
      }, 660)

      setTimeout(() => {
        if (step >= 5) {
          setStep(6)
        } else {
          setStep((s) => s + 1)
        }
        setTransitioning(false)
      }, 1320)
    },
    [step, transitioning]
  )

  const reset = React.useCallback(() => {
    setStep(0)
    setAnswers({})
    setInsight(null)
    setTransitioning(false)
    setProcessing(false)
    setShowModal(false)
    setSubmitted(false)
    setCurrentSessionId(null)
    setReportReady(false)
    glRef.current?.setConf(0)
  }, [])

  const handleUnlock = () => setShowModal(true)

  const handleSubmit = (data: { firstName: string; email: string; timeline: string }) => {
    const timelineSlug = TIMELINE_LABEL_TO_SLUG[data.timeline] ?? "curious"
    const tag = computeTag(timelineSlug) as SegmentTag

    const YEAR_TO_NUMBER = YEAR_LABEL_TO_NUMBER
    const session = loadSession()
    const sid = session.sessionId ?? generateSessionId()

    setCurrentSessionId(sid)
    setShowModal(false)
    setSubmitted(true)

    void persistSession({
      sessionId: sid,
      stage1: {
        industry: answers.industry ?? "",
        years: YEAR_TO_NUMBER[answers.years] ?? 5,
        revenue: answers.revenue ?? "",
        sde: answers.sde ?? "",
        employees: answers.employees ?? "",
        state: answers.state ?? "",
      },
      gate: {
        firstName: data.firstName,
        email: data.email,
        sellingTimeline: timelineSlug,
        tag,
      },
      completedAt: Date.now(),
    })
  }

  return (
    <>
      {/* WebGL canvas — fixed behind everything */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
          transition: "opacity .5s ease",
        }}
      />

      {/* App root */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          opacity: mounted ? 1 : 0,
          transition: "opacity .9s ease",
        }}
      >
        {/* Ripple overlay */}
        {ripple && <Ripple x={ripple.x} y={ripple.y} onDone={() => setRipple(null)} />}

        {/* Processing flash */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 40,
            background: "radial-gradient(ellipse at 50% 50%, rgba(16,185,129,.06) 0%, transparent 60%)",
            opacity: processing ? 1 : 0,
            transition: "opacity .4s ease",
          }}
        />

        {/* Email modal */}
        {showModal && <EmailGateModal derived={derived} onClose={() => setShowModal(false)} onSubmit={handleSubmit} />}

        {/* ── Nav ── */}
        <nav
          className="glass"
          style={{
            margin: "14px 20px 0",
            padding: "0 24px",
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 20,
              fontWeight: 300,
              color: "var(--t1)",
              letterSpacing: "-.3px",
            }}
          >
            Scorta
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {["How it works", "Coming soon", "For sellers"].map((l) => (
              <div
                key={l}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--t3)",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "color .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--t1)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
              >
                {l}
              </div>
            ))}
          </div>
          <button
            style={{
              height: 36,
              padding: "0 18px",
              background: "var(--s1)",
              color: "var(--t2)",
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 9999,
              border: "1px solid var(--b2)",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--s2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--s1)")}
          >
            Start ExitIQ
          </button>
        </nav>

        {/* ── Hero layout (2 columns) ── */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr minmax(320px,400px)",
            gap: 20,
            padding: "28px 20px",
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
            alignItems: "start",
            minHeight: "calc(100vh - 100px)",
          }}
        >
          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingRight: 16 }}>
            {/* Orb + headline */}
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <SignalOrb phase={stepCount} size={ORB_SIZE} active={processing || !!recalcMsg} />
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".96px",
                    textTransform: "uppercase",
                    color: "rgba(167,229,211,.65)",
                    marginBottom: 10,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  ExitIQ Liquid Engine
                </div>
                <h1
                  style={{
                    fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                    fontSize: "clamp(32px,3.2vw,50px)",
                    fontWeight: 300,
                    color: "var(--t1)",
                    lineHeight: 1.05,
                    letterSpacing: "-1.2px",
                    margin: 0,
                  }}
                >
                  See what buyers would pay — before you ever talk to a broker.
                </h1>
              </div>
            </div>

            <div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  color: "var(--t3)",
                  lineHeight: 1.65,
                  letterSpacing: ".15px",
                  maxWidth: 480,
                  fontFamily: "Inter, sans-serif",
                  margin: 0,
                }}
              >
                ExitIQ analyzes your valuation range, likely buyer pool, broker-fee exposure, and deal risks through an
                AI-guided assessment.
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--t4)",
                  marginTop: 8,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                No login. No broker call. Start with six quick signals.
              </p>
            </div>

            {/* ── Question or Preview ── */}
            {!submitted ? (
              step < 6 ? (
                <QuestionPanel step={step} onAnswer={handleAnswer} processing={processing} disabled={transitioning} />
              ) : (
                <PreviewCard derived={derived} answers={answers} onUnlock={handleUnlock} />
              )
            ) : (
              <PostSubmitCard onReset={reset} reportReady={reportReady} />
            )}

            {/* AI Insight */}
            {insight && !submitted && <AIInsight key={insight} text={insight} />}

            {/* Answer trail chips */}
            {Object.keys(answers).length > 0 && !submitted && step < 6 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, animation: "fadeIn .4s ease" }}>
                {Object.values(answers).map((a, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--t3)",
                      background: "var(--s2)",
                      border: "1px solid var(--b3)",
                      borderRadius: 9999,
                      padding: "3px 10px",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {a}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right column: Dashboard ── */}
          <DashboardPanel step={stepCount} derived={derived} processing={processing} recalcMsg={recalcMsg} />
        </div>

        {/* ── Bento section ── */}
        <BentoSection />

        {/* ── Footer ── */}
        <footer
          style={{
            background: "var(--footer-bg)",
            borderTop: "1px solid var(--footer-border)",
            padding: "28px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "background .5s ease",
          }}
        >
          <div
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 16,
              fontWeight: 300,
              color: "var(--t3)",
              letterSpacing: "-.1px",
            }}
          >
            Scorta
          </div>
          <div style={{ fontSize: 12, color: "var(--t4)", fontFamily: "Inter, sans-serif" }}>
            © 2025 Scorta. For informational purposes only. Not financial advice.
          </div>
        </footer>
      </div>
    </>
  )
}

// ── Post-submit confirmation card ─────────────────────────────────────────────
function PostSubmitCard({ onReset, reportReady }: { onReset: () => void; reportReady: boolean }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        animation: "slideUp .6s cubic-bezier(.34,1.2,.64,1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ScanLine />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: reportReady ? "#10b981" : "#f59e0b",
            boxShadow: reportReady ? "0 0 12px rgba(16,185,129,.9)" : "0 0 12px rgba(245,158,11,.9)",
            animation: "liveBlink 2s infinite",
          }}
        />
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".96px",
            textTransform: "uppercase",
            color: reportReady ? "rgba(16,185,129,.8)" : "rgba(245,158,11,.8)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {reportReady ? "Report ready" : "Report generating"}
        </div>
      </div>
      <h2
        style={{
          fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
          fontSize: 28,
          fontWeight: 300,
          color: "var(--t1)",
          letterSpacing: "-.4px",
          lineHeight: 1.2,
          margin: 0,
        }}
      >
        {reportReady ? "Your ExitIQ Report is ready." : "Your full ExitIQ Report is on its way."}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--t3)",
          lineHeight: 1.65,
          fontFamily: "Inter, sans-serif",
          margin: 0,
        }}
      >
        {reportReady
          ? "Check your inbox — your valuation breakdown, buyer risk scan, and 90-day exit prep plan have been sent."
          : "Check your inbox for your valuation breakdown, buyer risk scan, and personalized 90-day exit prep plan. In the meantime, Scorta is preparing your full assessment."}
      </p>
      <button
        onClick={onReset}
        style={{
          alignSelf: "flex-start",
          height: 40,
          padding: "0 20px",
          background: "var(--s1)",
          border: "1px solid var(--b2)",
          borderRadius: 9999,
          color: "var(--t2)",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Restart assessment
      </button>
    </div>
  )
}

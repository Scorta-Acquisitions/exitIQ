// use client: manages assessment state machine, WebGL canvas lifecycle via useEffect/useRef, and all user interaction handlers
"use client"

import React from "react"
import { persistSession, requestGenerate, requestTeaser, type TeaserResult } from "@/lib/assessment/api"
import { computeTag } from "@/lib/assessment/segmentation"
import type { SegmentTag } from "@/lib/assessment/session"
import {
  clearPartialProgress,
  generateSessionId,
  loadPartialProgress,
  loadSession,
  savePartialProgress,
} from "@/lib/assessment/session"
import { TIMELINE_LABEL_TO_SLUG } from "@/lib/assessment/transform"
import { calcDerived } from "@/lib/exitiq/calculations"
import { ANSWER_KEYS, INSIGHTS, RECALC_MESSAGES } from "@/lib/exitiq/data"
import { setupWebGL, type WebGLControls } from "@/lib/exitiq/webgl"
import { DashboardPanel } from "./dashboard"
import { EmailGateModal, GateTeaserCard, PreviewCard } from "./preview"
import { QuestionPanel } from "./questions"
import { FullReportCard, ReportGeneratingCard } from "./report"
import { AIInsight, Ripple, ScanLine, SignalOrb } from "./ui"

const ORB_SIZE = 120

const CHIP_QUESTION_LABELS: Record<string, string> = {
  industry: "Industry",
  years: "Tenure",
  facilityType: "Facility",
  revenue: "Revenue",
  sde: "SDE",
  docReadiness: "Doc Readiness",
  customerConc: "Cust. Conc.",
  employees: "Team Size",
  keyMan: "Key-Man",
  recurringRev: "Recurring Rev.",
}

function formatChipAnswer(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    setMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [breakpoint])
  return mobile
}

// Maps frontend year-bucket labels to representative year numbers for Stage1Answers.years
const YEAR_LABEL_TO_NUMBER: Record<string, number> = {
  "Under 2 years": 1,
  "2 – 5 years": 3,
  "5 – 10 years": 7,
  "10+ years": 15,
}

function ExitConfirmDialog({ onStay, onExit }: { onStay: () => void; onExit: () => void }) {
  const stayRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    stayRef.current?.focus()
  }, [])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onStay()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onStay])

  return (
    <div
      onClick={onStay}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 210,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-dialog-title"
        style={{
          maxWidth: 440,
          width: "calc(100% - 48px)",
          padding: "32px 32px 28px",
          borderRadius: 16,
          animation: "slideUp 0.22s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <ScanLine />
        <div style={{ marginBottom: 16 }}>
          <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            <path
              d="M14 3L2.5 24h23L14 3z"
              stroke="rgba(251,191,36,.7)"
              strokeWidth={1.5}
              strokeLinejoin="round"
              fill="rgba(251,191,36,.08)"
            />
            <line
              x1="14"
              y1="10.5"
              x2="14"
              y2="17.5"
              stroke="rgba(251,191,36,.8)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <circle cx="14" cy="21" r="1.2" fill="rgba(251,191,36,.8)" />
          </svg>
        </div>
        <h2
          id="exit-dialog-title"
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: 26,
            fontWeight: 400,
            color: "var(--t1)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}
        >
          Leave assessment?
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--t3)",
            lineHeight: 1.65,
            fontFamily: "Inter, sans-serif",
            margin: "0 0 28px",
          }}
        >
          Your progress has been saved. You can return anytime to continue where you left off.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            ref={stayRef}
            onClick={onStay}
            style={{
              height: 38,
              padding: "0 20px",
              background: "var(--s1)",
              color: "var(--t2)",
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 9999,
              border: "1px solid var(--b2)",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--t1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t2)")}
          >
            Stay
          </button>
          <button
            onClick={onExit}
            style={{
              height: 38,
              padding: "0 20px",
              background: "rgba(239,68,68,.1)",
              color: "rgba(252,165,165,.9)",
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 9999,
              border: "1px solid rgba(239,68,68,.3)",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,.18)"
              e.currentTarget.style.color = "rgba(252,165,165,1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,.1)"
              e.currentTarget.style.color = "rgba(252,165,165,.9)"
            }}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  )
}

export function ExitIQApp({ onClose }: { onClose?: () => void } = {}) {
  const isMobile = useIsMobile()
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
  const [teaserData, setTeaserData] = React.useState<TeaserResult | null>(null)
  const [reportMd, setReportMd] = React.useState("")
  const [reportStreaming, setReportStreaming] = React.useState(false)
  const [gateFirstName, setGateFirstName] = React.useState("")
  const [showExitConfirm, setShowExitConfirm] = React.useState(false)

  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const glRef = React.useRef<WebGLControls | null>(null)

  const derived = React.useMemo(() => calcDerived(answers), [answers])
  const stepCount = step < 10 ? step : 10

  // ── WebGL init ────────────────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!canvasRef.current) return
    const gl = setupWebGL(canvasRef.current)
    glRef.current = gl
    setTimeout(() => setMounted(true), 140)
    return gl.cleanup
  }, [])

  // ── Restore partial progress from a previous mid-assessment exit ───────────────────────────
  React.useEffect(() => {
    const partial = loadPartialProgress()
    const session = loadSession()
    if (partial && !session.completedAt && partial.step > 0) {
      setAnswers(partial.answers)
      setStep(partial.step)
    }
  }, [])

  // ── Answer handler ────────────────────────────────────────────────────────────────────────────
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
        if (step >= 9) {
          setStep(10)
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
    setTeaserData(null)
    setReportMd("")
    setReportStreaming(false)
    setGateFirstName("")
    glRef.current?.setConf(0)
  }, [])

  const handleCloseRequest = React.useCallback(() => {
    if (submitted) {
      onClose?.()
      return
    }
    savePartialProgress(answers, step)
    setShowExitConfirm(true)
  }, [submitted, answers, step, onClose])

  // ── Escape key: context-aware dismiss ───────────────────────────────────────────────────────────
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (showExitConfirm) return // ExitConfirmDialog handles its own Escape
      if (showModal) {
        setShowModal(false)
        return
      }
      handleCloseRequest()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [showExitConfirm, showModal, handleCloseRequest])

  // ── Back navigation ──────────────────────────────────────────────────────────────────────────
  const handleBack = React.useCallback(() => {
    if (submitted) {
      setSubmitted(false)
      return
    }
    if (step === 0) {
      onClose?.()
      return
    }
    setStep((s) => s - 1)
    setInsight(null)
    setTransitioning(false)
    setProcessing(false)
  }, [step, submitted, onClose])

  const handleUnlock = () => setShowModal(true)

  const handleSubmit = (data: { firstName: string; email: string; timeline: string }) => {
    const timelineSlug = TIMELINE_LABEL_TO_SLUG[data.timeline] ?? "curious"
    const tag = computeTag(timelineSlug) as SegmentTag

    const YEAR_TO_NUMBER = YEAR_LABEL_TO_NUMBER
    const session = loadSession()
    const sid = session.sessionId ?? generateSessionId()

    setGateFirstName(data.firstName)
    setShowModal(false)
    setSubmitted(true)
    clearPartialProgress()

    void persistSession({
      sessionId: sid,
      stage1: {
        industry: answers.industry ?? "",
        years: (answers.years ? YEAR_TO_NUMBER[answers.years] : undefined) ?? 5,
        revenue: answers.revenue ?? "",
        sde: answers.sde ?? "",
        employees: answers.employees ?? "",
        state: answers.state ?? "",
        facilityType: answers.facilityType ?? "",
        docReadiness: answers.docReadiness ?? "",
        customerConc: answers.customerConc ?? "",
        keyMan: answers.keyMan ?? "",
        recurringRev: answers.recurringRev ?? "",
      } as Parameters<typeof persistSession>[0]["stage1"],
      gate: {
        firstName: data.firstName,
        email: data.email,
        sellingTimeline: timelineSlug,
        tag,
      },
      completedAt: Date.now(),
    }).then(() => {
      // Teaser: fast (Haiku, ~2–5s) — enriches preview card immediately
      void requestTeaser(sid).then((teaser) => {
        if (teaser) setTeaserData(teaser)
      })

      // Full report: stream from Sonnet (~20–40s) — shown below teaser when complete
      setReportStreaming(true)
      void requestGenerate(sid).then(async (res) => {
        if (!res?.body) {
          setReportStreaming(false)
          return
        }
        const reader = res.body.getReader()
        const dec = new TextDecoder()
        let acc = ""
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            acc += dec.decode(value, { stream: true })
          }
          setReportMd(acc)
        } finally {
          setReportStreaming(false)
        }
      })
    })
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* WebGL canvas — absolute so it fills the card container, not the viewport */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
          transition: "opacity .5s ease",
        }}
      />

      {/* App root — scrollable within the card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          overflowY: "auto",
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
            position: "absolute",
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

        {/* Exit confirmation dialog */}
        {showExitConfirm && (
          <ExitConfirmDialog
            onStay={() => setShowExitConfirm(false)}
            onExit={() => {
              setShowExitConfirm(false)
              onClose?.()
            }}
          />
        )}

        {/* ── Nav ── */}
        <nav
          className="glass"
          style={{
            margin: isMobile ? "0" : "14px 20px 0",
            padding: isMobile ? "0 16px" : "0 24px",
            height: 52,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleBack}
            style={{
              justifySelf: "start",
              height: 32,
              padding: "0 14px",
              background: "var(--s1)",
              color: "var(--t3)",
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 9999,
              border: "1px solid var(--b2)",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--t1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
          >
            <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
              <path
                d="M7 1.5L3 5.5l4 4"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".96px",
              textTransform: "uppercase",
              color: "rgba(167,229,211,.65)",
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            ExitIQ Liquid Engine
          </div>
          <div style={{ justifySelf: "end" }}>
            <button
              onClick={handleCloseRequest}
              aria-label="Close assessment"
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--s1)",
                color: "var(--t3)",
                borderRadius: 9999,
                border: "1px solid var(--b2)",
                cursor: "pointer",
                transition: "all .15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--t1)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
            >
              <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </nav>


        {/* ── Hero layout (2 columns desktop / 1 column mobile) ── */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr minmax(320px,400px)",
            gap: 20,
            padding: isMobile ? "16px 16px" : "28px 20px",
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
            alignItems: "start",
          }}
        >
          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 16 : 24, paddingRight: isMobile ? 0 : 16 }}>
            {/* Orb + headline */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 12 : 24 }}>
              <SignalOrb phase={stepCount} size={isMobile ? 72 : ORB_SIZE} active={processing || !!recalcMsg} />
              <div>
                {/* <div
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
                </div> */}
                <h1
                  style={{
                    fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                    fontSize: isMobile ? "clamp(26px,7vw,34px)" : "clamp(32px,3.2vw,50px)",
                    fontWeight: 300,
                    color: "var(--t1)",
                    lineHeight: 1.1,
                    letterSpacing: "-1px",
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
                No login. No broker call. Three-part assessment, under two minutes.
              </p>
            </div>

            {/* ── Question → Gate Teaser → [email gate] → Detailed AI Report ── */}
            {!submitted ? (
              step < 10 ? (
                <QuestionPanel step={step} onAnswer={handleAnswer} processing={processing} disabled={transitioning} />
              ) : (
                // Pre-gate: blurred teaser that motivates email submission
                <GateTeaserCard derived={derived} answers={answers} onUnlock={handleUnlock} />
              )
            ) : (
              // Post-gate: teaser preview immediately, then full Sonnet report when ready
              <>
                <PreviewCard derived={derived} answers={answers} onUnlock={() => {}} teaserData={teaserData} />
                {reportStreaming && <ReportGeneratingCard />}
                {!reportStreaming && reportMd && <FullReportCard reportMd={reportMd} firstName={gateFirstName} />}
              </>
            )}

            {/* AI Insight */}
            {insight && !submitted && <AIInsight key={insight} text={insight} />}

            {/* Answer trail chips */}
            {Object.keys(answers).length > 0 && !submitted && step < 10 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "fadeIn .4s ease" }}>
                <div
                  style={{
                    fontSize: 9.5,
                    color: "var(--t5)",
                    fontFamily: "Inter, sans-serif",
                    letterSpacing: ".4px",
                  }}
                >
                  tap any answer to revise
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ANSWER_KEYS.filter((k) => !!answers[k]).map((key) => {
                    const targetStep = ANSWER_KEYS.indexOf(key)
                    const disabled = processing || transitioning
                    const questionLabel = CHIP_QUESTION_LABELS[key] ?? key
                    const answerLabel = formatChipAnswer(answers[key] ?? "")
                    return (
                      <button
                        key={key}
                        onClick={() => !disabled && setStep(targetStep)}
                        title="Edit this answer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11,
                          fontWeight: 500,
                          color: "var(--t3)",
                          background: "var(--s2)",
                          border: "1px solid var(--b3)",
                          borderRadius: 9999,
                          padding: "3px 10px",
                          fontFamily: "Inter, sans-serif",
                          cursor: disabled ? "default" : "pointer",
                          transition: "border-color .15s, color .15s",
                          outline: "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!disabled) {
                            e.currentTarget.style.borderColor = "rgba(167,229,211,.45)"
                            e.currentTarget.style.color = "var(--t2)"
                            const icon = e.currentTarget.querySelector<SVGSVGElement>(".chip-edit-icon")
                            if (icon) icon.style.opacity = "0.65"
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--b3)"
                          e.currentTarget.style.color = "var(--t3)"
                          const icon = e.currentTarget.querySelector<SVGSVGElement>(".chip-edit-icon")
                          if (icon) icon.style.opacity = "0.28"
                        }}
                      >
                        <span style={{ color: "var(--t5)", fontWeight: 400 }}>{questionLabel}</span>
                        <span style={{ color: "var(--t5)", opacity: 0.5, margin: "0 1px" }}>·</span>
                        {answerLabel}
                        <svg
                          className="chip-edit-icon"
                          width={9}
                          height={9}
                          viewBox="0 0 9 9"
                          fill="none"
                          style={{ opacity: 0.28, flexShrink: 0, transition: "opacity .15s" }}
                        >
                          <path
                            d="M1.5 7L6 2.5a1 1 0 0 1 1.5 1.5L3 8.5H1.5V7Z"
                            stroke="currentColor"
                            strokeWidth={1}
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column: Dashboard — hidden on mobile ── */}
          {!isMobile && <DashboardPanel step={stepCount} derived={derived} answers={answers} processing={processing} recalcMsg={recalcMsg} />}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { SELLER_QUESTIONS } from "@/components/onboarding/questions"
import { calcScore } from "@/components/onboarding/scoring"
import { QuestionStep } from "@/components/onboarding/QuestionStep"
import { ProcessingScreen } from "@/components/onboarding/ProcessingScreen"
import { ResultsScreen } from "@/components/onboarding/ResultsScreen"
import type { Answers, AnswerValue, Phase } from "@/components/onboarding/types"

const STORAGE_KEY = "scorta-onboarding"

export function OnboardingApp() {
  const searchParams = useSearchParams()
  const initRole = searchParams.get("role")
  const initRevenue = searchParams.get("revenue")
  const initEmail = searchParams.get("email") ?? ""

  const [stepIdx, setStepIdx] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward")
  const [phase, setPhase] = useState<Phase>("questions")
  const [score, setScore] = useState<number | null>(null)

  const total = SELLER_QUESTIONS.length

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, unknown>
      if (saved.answers) setAnswers(saved.answers as Answers)
      if (saved.stepIdx !== undefined && saved.phase === "questions") setStepIdx(saved.stepIdx as number)
      if (saved.phase === "results" && saved.score != null) {
        setScore(saved.score as number)
        setPhase("results")
      }
    } catch {}

    if (initRole) {
      setAnswers((prev) => ({
        ...prev,
        role: {
          value: initRole,
          label: initRole === "seller" ? "I want to sell my business" : "I want to buy a business",
        },
      }))
    }
    if (initRevenue) {
      setAnswers((prev) => ({ ...prev, revenue: { value: initRevenue, label: initRevenue } }))
    }
  }, [initRole, initRevenue])

  const save = (nextAnswers: Answers, nextIdx: number, nextPhase?: Phase, nextScore?: number) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers: nextAnswers, stepIdx: nextIdx, phase: nextPhase ?? "questions", score: nextScore })
      )
    } catch {}
  }

  const currentQ = SELLER_QUESTIONS[stepIdx]!

  const goNext = (val: AnswerValue) => {
    const key = currentQ.id
    const newAnswers: Answers = { ...answers, [key]: val }
    setAnswers(newAnswers)
    setAnimDir("forward")

    if (stepIdx < total - 1) {
      const nextIdx = stepIdx + 1
      setStepIdx(nextIdx)
      save(newAnswers, nextIdx)
    } else {
      save(newAnswers, stepIdx, "processing")
      setPhase("processing")
    }
  }

  const goBack = () => {
    if (stepIdx === 0) {
      window.location.href = "/"
      return
    }
    setAnimDir("back")
    const prevIdx = stepIdx - 1
    setStepIdx(prevIdx)
    save(answers, prevIdx)
  }

  const handleProcessingDone = useCallback(() => {
    const s = calcScore(answers)
    setScore(s)
    setPhase("results")
    save(answers, stepIdx, "results", s)
  }, [answers, stepIdx])

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#02492a",
        fontFamily: "var(--font-dm-sans, 'DM Sans'), Arial, sans-serif",
        color: "#fff",
        WebkitFontSmoothing: "antialiased",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 28px",
          flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z" fill="#84e7a5" />
            </svg>
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>Scorta</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#84e7a5",
              background: "rgba(132,231,165,0.15)",
              padding: "2px 8px",
              borderRadius: "1584px",
              letterSpacing: "0.3px",
            }}
          >
            Exit IQ
          </span>
        </Link>

        {phase === "questions" && (
          <div
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "var(--font-space-mono, 'Space Mono'), monospace",
            }}
          >
            {stepIdx + 1} / {total}
          </div>
        )}
        {phase === "results" && (
          <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", color: "#84e7a5" }}>
            Report ready
          </div>
        )}
      </div>

      {/* Progress bar */}
      {phase !== "results" && (
        <div style={{ height: "2px", background: "rgba(255,255,255,0.08)", flexShrink: 0 }}>
          <div
            style={{
              height: "100%",
              background: "#84e7a5",
              width: phase === "processing" ? "100%" : `${(stepIdx / total) * 100}%`,
              transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {phase === "questions" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 24px",
              overflow: "auto",
            }}
          >
            {/* Back button for card-type steps */}
            {stepIdx > 0 && currentQ.type === "cards" && (
              <div style={{ width: "100%", maxWidth: "560px", marginBottom: "16px" }}>
                <button
                  onClick={goBack}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "13px",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "inherit",
                  }}
                >
                  ← Back
                </button>
              </div>
            )}
            <QuestionStep
              key={currentQ.id}
              q={currentQ}
              value={answers[currentQ.id] ?? null}
              onChange={(val) => setAnswers((prev) => ({ ...prev, [currentQ.id]: val }))}
              onNext={goNext}
              onBack={goBack}
              isFirst={stepIdx === 0}
              animDir={animDir}
              initEmail={initEmail}
            />
          </div>
        )}

        {phase === "processing" && <ProcessingScreen onDone={handleProcessingDone} />}

        {phase === "results" && score !== null && <ResultsScreen answers={answers} score={score} />}
      </div>
    </div>
  )
}

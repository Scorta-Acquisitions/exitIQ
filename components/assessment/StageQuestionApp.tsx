"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AssessmentShell } from "@/components/assessment/AssessmentShell"
import { FreeTextInput } from "@/components/assessment/FreeTextInput"
import { MultiCheckbox } from "@/components/assessment/MultiCheckbox"
import { RadioCards } from "@/components/assessment/RadioCards"
import { SBAInfoCard } from "@/components/assessment/SBAInfoCard"
import { persistSession } from "@/lib/assessment/api"
import type { StageAnswer, StageQuestion } from "@/lib/assessment/questions"
import { computeSBASnapshot } from "@/lib/assessment/sba"
import { loadSession, saveStage } from "@/lib/assessment/session"

interface StageQuestionAppProps {
  stageNum: 2 | 3 | 4
  questions: StageQuestion[]
  sessionKey: "stage2" | "stage3" | "stage4"
  nextRoute: string
  prevRoute: string
}

export function StageQuestionApp({ stageNum, questions, sessionKey, nextRoute, prevRoute }: StageQuestionAppProps) {
  const router = useRouter()
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, StageAnswer>>({})
  const [exiting, setExiting] = useState(false)
  const [exitDir, setExitDir] = useState<"forward" | "back">("forward")

  useEffect(() => {
    const session = loadSession()
    const saved = session[sessionKey]
    if (saved) setAnswers(saved as Record<string, StageAnswer>)
  }, [sessionKey])

  const currentQ = questions[idx]!
  const currentAnswer = answers[currentQ.id]

  const canAdvance =
    currentQ.type === "free-text"
      ? ((currentAnswer as string | undefined)?.trim().length ?? 0 > 0)
      : currentQ.type === "multi-checkbox"
        ? ((currentAnswer as string[] | undefined)?.length ?? 0) > 0
        : currentAnswer !== undefined && currentAnswer !== ""

  const transition = (nextIdx: number, direction: "forward" | "back") => {
    setExiting(true)
    setExitDir(direction)
    setTimeout(() => {
      setIdx(nextIdx)
      setExiting(false)
    }, 200)
  }

  const handleAnswer = (value: StageAnswer) => {
    const updated = { ...answers, [currentQ.id]: value }
    setAnswers(updated)
    saveStage(sessionKey, updated as Record<string, string | string[]>)

    if (currentQ.type !== "free-text" && currentQ.type !== "multi-checkbox") {
      if (idx < questions.length - 1) {
        transition(idx + 1, "forward")
      } else {
        // Last auto-advance question in this stage — persist to DB then navigate.
        const { sessionId } = loadSession()
        if (sessionId) void persistSession({ sessionId, [sessionKey]: updated })
        router.push(nextRoute)
      }
    }
  }

  const handleNext = () => {
    if (!canAdvance) return
    if (idx < questions.length - 1) {
      transition(idx + 1, "forward")
    } else {
      // Last explicit-next question in this stage — persist to DB then navigate.
      saveStage(sessionKey, answers as Record<string, string | string[]>)
      const { sessionId } = loadSession()
      if (sessionId) void persistSession({ sessionId, [sessionKey]: answers })
      router.push(nextRoute)
    }
  }

  const handleBack = () => {
    if (idx > 0) {
      transition(idx - 1, "back")
    } else {
      router.push(prevRoute)
    }
  }

  const session = loadSession()
  const sbaSnapshot = stageNum === 3 && idx === 0 ? computeSBASnapshot(session.stage1 ?? {}) : null

  const stepStyles = {
    opacity: exiting ? 0 : 1,
    transform: exiting ? (exitDir === "forward" ? "translateY(-12px)" : "translateY(12px)") : "translateY(0)",
    transition: "opacity 180ms ease, transform 180ms ease",
  }

  const needsExplicitNext =
    currentQ.type === "free-text" || currentQ.type === "multi-checkbox" || currentQ.type === "sba-check"

  return (
    <AssessmentShell stageNum={stageNum} questionIdx={idx} totalQuestions={questions.length}>
      <div style={stepStyles}>
        {/* Back button */}
        <button
          onClick={handleBack}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            fontSize: "13px",
            fontWeight: 500,
            padding: 0,
            marginBottom: "32px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "inherit",
            transition: "color 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
        >
          ← Back
        </button>

        {/* Question headline */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "clamp(20px, 4vw, 28px)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.5px",
              lineHeight: 1.3,
              margin: "0 0 8px",
            }}
          >
            {currentQ.headline}
          </h1>
          {currentQ.sub && (
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.55 }}>
              {currentQ.sub}
            </p>
          )}
        </div>

        {/* SBA info card (Stage 3, Q1 only) */}
        {sbaSnapshot && <SBAInfoCard snapshot={sbaSnapshot} />}

        {/* Answer input */}
        {currentQ.type === "radio-cards" && (
          <RadioCards question={currentQ} value={currentAnswer ?? ""} onChange={(v) => handleAnswer(v)} />
        )}

        {currentQ.type === "sba-check" && (
          <RadioCards question={currentQ} value={currentAnswer ?? ""} onChange={(v) => handleAnswer(v)} />
        )}

        {currentQ.type === "multi-checkbox" && (
          <MultiCheckbox
            question={currentQ}
            value={(currentAnswer as string[]) ?? []}
            onChange={(v) => handleAnswer(v)}
          />
        )}

        {currentQ.type === "free-text" && (
          <FreeTextInput
            placeholder={currentQ.placeholder}
            value={(currentAnswer as string) ?? ""}
            onChange={(v) => handleAnswer(v)}
            isPrice={currentQ.id === "askingPrice"}
          />
        )}

        {/* Next button for explicit-advance types */}
        {needsExplicitNext && (
          <div style={{ marginTop: "28px" }}>
            <button onClick={handleNext} disabled={!canAdvance} className="scorta-next-btn">
              {idx === questions.length - 1 ? "Continue →" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </AssessmentShell>
  )
}

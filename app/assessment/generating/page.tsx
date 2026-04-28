// use client: useEffect polling interval for step animation + router.push on completion
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { persistSession, requestGenerate } from "@/lib/assessment/api"
import { loadSession, markComplete } from "@/lib/assessment/session"

const STEPS = [
  "Analyzing financial profile…",
  "Scoring operational independence…",
  "Calculating market positioning…",
  "Computing buyer accessibility…",
  "Generating your Exit IQ Report…",
]

export default function GeneratingPage() {
  const router = useRouter()
  const [stepIdx, setStepIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const session = loadSession()
    if (!session.stage4) {
      router.replace("/")
      return
    }

    let current = 0
    const interval = setInterval(() => {
      current++
      if (current < STEPS.length) {
        setStepIdx(current)
      } else {
        clearInterval(interval)
        markComplete()
        setDone(true)
        const sessionId = session.sessionId ?? "local"

        // Persist completion to DB with all stage data so the server can compute
        // score + SBA, then kick off background AI report generation.
        if (session.sessionId) {
          const completedAt = Date.now()
          void persistSession({
            sessionId: session.sessionId,
            stage1: session.stage1,
            gate: session.gate,
            stage2: session.stage2,
            stage3: session.stage3,
            stage4: session.stage4,
            completedAt,
          })
          void requestGenerate(session.sessionId)
        }

        setTimeout(() => {
          router.push(`/report/${sessionId}`)
        }, 600)
      }
    }, 900)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="bg-matcha-800 flex min-h-screen flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <div className="mb-12 flex items-center gap-2">
        <div
          className="bg-matcha-300 text-matcha-800 flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold"
          aria-hidden="true"
        >
          IQ
        </div>
        <span className="text-lg font-bold text-white">Exit IQ</span>
      </div>

      {/* Spinner / done indicator */}
      <div className="mb-9">
        {done ? (
          <div
            role="img"
            aria-label="Report complete"
            className="bg-matcha-300/15 border-matcha-300 flex h-16 w-16 items-center justify-center rounded-full border-2 text-[28px]"
          >
            ✓
          </div>
        ) : (
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            className="animate-spin-slow"
            aria-label="Generating report"
            role="img"
          >
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#84e7a5"
              strokeWidth="4"
              strokeDasharray="175"
              strokeDashoffset="120"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Steps */}
      <div role="list" aria-label="Report generation steps" className="flex w-full max-w-[360px] flex-col gap-3.5">
        {STEPS.map((label, i) => {
          const completed = i < stepIdx
          const active = i === stepIdx && !done
          const upcoming = i > stepIdx && !done
          return (
            <div
              key={i}
              role="listitem"
              aria-label={`${label} — ${completed || done ? "complete" : active ? "in progress" : "pending"}`}
              className={`flex items-center gap-3 transition-opacity duration-300 ${upcoming ? "opacity-30" : "opacity-100"}`}
            >
              <div
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all duration-[400ms] ${
                  completed || done
                    ? "bg-matcha-300 border-matcha-300 text-matcha-800"
                    : active
                      ? "bg-matcha-300/20 border-matcha-300"
                      : "border-white/15 bg-white/[8%]"
                }`}
              >
                {(completed || done) && "✓"}
              </div>
              <span
                className={`text-sm transition-all duration-300 ${
                  completed || done ? "text-matcha-300" : active ? "font-semibold text-white" : "text-white/40"
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

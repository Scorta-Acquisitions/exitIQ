"use client"

import { useEffect, useRef } from "react"
import type { AnswerValue, ContactValue, OptionValue, Question } from "@/components/onboarding/types"

interface QuestionStepProps {
  q: Question
  value: AnswerValue
  onChange: (val: AnswerValue) => void
  onNext: (val: AnswerValue) => void
  onBack: () => void
  isFirst: boolean
  animDir: "forward" | "back"
  initEmail?: string
}

export function QuestionStep({ q, value, onChange, onNext, onBack, isFirst, animDir, initEmail }: QuestionStepProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.className = animDir === "back" ? "animate-slide-down" : "animate-slide-up"
    }
  }, [q.id, animDir])

  const isValid =
    q.type === "contact"
      ? !!(
          (value as ContactValue)?.name?.trim().length &&
          (value as ContactValue)?.email?.includes("@")
        )
      : q.multi
        ? ((value as OptionValue[]) ?? []).length > 0
        : !!value

  const singleValue = value as OptionValue | null
  const multiValue = (value as OptionValue[]) ?? []
  const contactValue = (value as ContactValue) ?? {}

  return (
    <div ref={containerRef} className="animate-slide-up" style={{ width: "100%", maxWidth: "560px" }}>
      {/* Question headline */}
      <div style={{ marginBottom: "8px" }}>
        <div
          style={{
            fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 700,
            letterSpacing: "-0.8px",
            lineHeight: 1.15,
            marginBottom: "8px",
            color: "#fff",
          }}
        >
          {q.headline}
        </div>
        {q.sub && (
          <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{q.sub}</div>
        )}
      </div>

      <div style={{ height: "24px" }} />

      {/* Cards */}
      {q.type === "cards" && q.options && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: q.options.length > 4 ? "1fr 1fr" : "1fr",
            gap: "10px",
          }}
        >
          {q.options.map((opt) => (
            <button
              key={opt.value}
              className={`scorta-option-card${singleValue?.value === opt.value ? " selected" : ""}`}
              onClick={() => {
                onChange(opt)
                setTimeout(() => onNext(opt), 180)
              }}
              style={{ position: "relative" }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  border: `2px solid ${singleValue?.value === opt.value ? "#84e7a5" : "rgba(255,255,255,0.2)"}`,
                  background: singleValue?.value === opt.value ? "#84e7a5" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 150ms",
                }}
              >
                {singleValue?.value === opt.value && (
                  <div
                    style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#02492a" }}
                  />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>
                  {opt.label}
                </div>
                {opt.sub && (
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>
                    {opt.sub}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Chips (multi-select) */}
      {q.type === "chips" && q.options && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "28px" }}>
            {q.options.map((opt) => {
              const sel = multiValue.some((v) => v.value === opt.value)
              return (
                <button
                  key={opt.value}
                  className={`scorta-option-chip${sel ? " selected" : ""}`}
                  onClick={() => {
                    onChange(
                      sel ? multiValue.filter((v) => v.value !== opt.value) : [...multiValue, opt]
                    )
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
          <button className="scorta-next-btn" disabled={!isValid} onClick={() => onNext(value)}>
            Continue →
          </button>
        </>
      )}

      {/* Contact form */}
      {q.type === "contact" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            className="scorta-input"
            type="text"
            placeholder="Your name"
            value={contactValue.name ?? ""}
            onChange={(e) => onChange({ ...contactValue, name: e.target.value })}
          />
          <input
            className="scorta-input"
            type="email"
            placeholder="Work email"
            value={contactValue.email ?? initEmail ?? ""}
            onChange={(e) => onChange({ ...contactValue, email: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && isValid && onNext(value)}
          />
          <input
            className="scorta-input"
            type="text"
            placeholder="Business name (optional)"
            value={contactValue.biz ?? ""}
            onChange={(e) => onChange({ ...contactValue, biz: e.target.value })}
          />
          <div style={{ height: "4px" }} />
          <button
            className="scorta-next-btn"
            disabled={!isValid}
            onClick={() => onNext(value)}
            style={{ alignSelf: "flex-start" }}
          >
            Generate my Exit IQ →
          </button>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
            Free. No credit card. No broker pitch. No spam.
          </div>
        </div>
      )}

      {/* Back link — only for non-card types */}
      {!isFirst && q.type !== "cards" && (
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            fontSize: "13px",
            cursor: "pointer",
            marginTop: "16px",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          ← Back
        </button>
      )}
    </div>
  )
}

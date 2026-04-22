"use client"

import type { StageAnswer, StageQuestion } from "@/lib/assessment/questions"

interface RadioCardsProps {
  question: StageQuestion
  value: StageAnswer
  onChange: (value: string) => void
}

export function RadioCards({ question, value, onChange }: RadioCardsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {question.options?.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`scorta-option-card${selected ? " selected" : ""}`}
          >
            <div style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: `2px solid ${selected ? "#84e7a5" : "rgba(255,255,255,0.3)"}`,
              background: selected ? "#84e7a5" : "transparent",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 150ms ease",
            }}>
              {selected && (
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#02492a" }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: selected ? "#84e7a5" : "#fff" }}>
                {opt.label}
              </div>
              {opt.sub && (
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginTop: "3px", lineHeight: 1.4 }}>
                  {opt.sub}
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

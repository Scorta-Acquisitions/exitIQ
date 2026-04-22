"use client"

import type { StageQuestion } from "@/lib/assessment/questions"

interface MultiCheckboxProps {
  question: StageQuestion
  value: string[]
  onChange: (value: string[]) => void
}

export function MultiCheckbox({ question, value, onChange }: MultiCheckboxProps) {
  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {question.options?.map((opt) => {
        const selected = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`scorta-option-chip${selected ? " selected" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div style={{
              width: "16px",
              height: "16px",
              borderRadius: "4px",
              border: `2px solid ${selected ? "#84e7a5" : "rgba(255,255,255,0.3)"}`,
              background: selected ? "#84e7a5" : "transparent",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 150ms ease",
            }}>
              {selected && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#02492a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

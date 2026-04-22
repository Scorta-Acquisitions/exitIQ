"use client"

import { useState } from "react"
import { DropdownSelect } from "@/components/assessment/DropdownSelect"
import { EmailGateModal } from "@/components/assessment/EmailGateModal"
import { GridChips } from "@/components/assessment/GridChips"
import { SliderInput } from "@/components/assessment/SliderInput"
import { TeaserCard } from "@/components/assessment/TeaserCard"
import { INDUSTRY_OPTIONS } from "@/lib/assessment/industries"
import { saveStage1 } from "@/lib/assessment/session"
import type { Stage1Answers } from "@/lib/assessment/session"
import { US_STATES } from "@/lib/assessment/states"

const REVENUE_OPTIONS = [
  { value: "under_250", label: "Under $250K" },
  { value: "250_500", label: "$250K–$500K" },
  { value: "500_1m", label: "$500K–$1M" },
  { value: "1m_2m", label: "$1M–$2M" },
  { value: "2m_5m", label: "$2M–$5M" },
  { value: "5m_10m", label: "$5M–$10M" },
]

const SDE_OPTIONS = [
  { value: "under_250", label: "Under $100K" },
  { value: "250_500", label: "$100K–$250K" },
  { value: "500_1m", label: "$250K–$500K" },
  { value: "1m_2m", label: "$500K–$1M" },
  { value: "2m_5m", label: "$1M–$2.5M" },
  { value: "5m_10m", label: "$2.5M+" },
]

const EMPLOYEE_OPTIONS = [
  { value: "solo", label: "Just me" },
  { value: "1_5", label: "1–5" },
  { value: "6_15", label: "6–15" },
  { value: "16_50", label: "16–50" },
  { value: "50plus", label: "50+" },
]

const TOTAL_STEPS = 6

export function ExitIQWidget() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<Stage1Answers>>({
    industry: "",
    years: 5,
    revenue: "",
    sde: "",
    employees: "",
    state: "",
  })
  const [showTeaser, setShowTeaser] = useState(false)
  const [showGate, setShowGate] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [exitDir, setExitDir] = useState<"forward" | "back">("forward")

  const go = (nextStep: number, direction: "forward" | "back" = "forward") => {
    setExiting(true)
    setExitDir(direction)
    setTimeout(() => {
      setStep(nextStep)
      setExiting(false)
    }, 200)
  }

  const set = (key: keyof Stage1Answers, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const autoAdvance = (key: keyof Stage1Answers, value: string) => {
    set(key, value)
    if (step < TOTAL_STEPS - 1) {
      setTimeout(() => go(step + 1, "forward"), 130)
    } else {
      setTimeout(() => {
        saveStage1({ ...answers, [key]: value })
        setShowTeaser(true)
      }, 130)
    }
  }

  const handleFinalStep = (key: keyof Stage1Answers, value: string) => {
    const updated = { ...answers, [key]: value }
    setAnswers(updated)
    saveStage1(updated)
    setShowTeaser(true)
  }

  const _canAdvance = () => {
    if (step === 0) return !!answers.industry
    if (step === 1) return (answers.years ?? 0) > 0
    if (step === 2) return !!answers.revenue
    if (step === 3) return !!answers.sde
    if (step === 4) return !!answers.employees
    if (step === 5) return !!answers.state
    return false
  }

  const stepStyles = {
    opacity: exiting ? 0 : 1,
    transform: exiting
      ? exitDir === "forward" ? "translateY(-10px)" : "translateY(10px)"
      : "translateY(0)",
    transition: "opacity 180ms ease, transform 180ms ease",
  }

  const displayYears = (answers.years ?? 5) >= 30 ? "30+" : `${answers.years ?? 5}`

  if (showGate) {
    return (
      <div style={{ width: "100%", maxWidth: "580px" }}>
        <EmailGateModal onClose={() => setShowGate(false)} />
      </div>
    )
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "28px 28px 24px",
        border: "1px solid #dad4c8",
        boxShadow: "rgba(0,0,0,0.12) 0 8px 40px, rgba(0,0,0,0.04) 0 1px 1px inset",
        width: "100%",
        maxWidth: "580px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ExitIQ badge */}
      <div
        style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "#02492a", borderRadius: "1584px", padding: "4px 12px 4px 8px",
          marginBottom: "18px",
        }}
      >
        <div style={{
          width: "18px", height: "18px", borderRadius: "50%", background: "#84e7a5",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "9px", fontWeight: 700, color: "#02492a",
        }}>IQ</div>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#84e7a5", letterSpacing: "0.5px" }}>Exit IQ</span>
      </div>

      {/* Progress bar */}
      {!showTeaser && (
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              style={{
                height: "3px", flex: 1, borderRadius: "2px",
                background: i <= step ? "#02492a" : "#eee9df",
                transition: "background 300ms ease",
              }}
            />
          ))}
        </div>
      )}

      {/* Teaser card after all 6 steps */}
      {showTeaser ? (
        <TeaserCard s1={answers} onUnlock={() => setShowGate(true)} />
      ) : (
        <div style={stepStyles}>
          {step === 0 && (
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.4px", marginBottom: "4px" }}>
                What industry is your business in?
              </div>
              <div style={{ fontSize: "13px", color: "#9f9b93", marginBottom: "16px" }}>
                Used to determine your SDE multiple range.
              </div>
              <DropdownSelect
                id="industry"
                label=""
                value={answers.industry ?? ""}
                options={INDUSTRY_OPTIONS}
                placeholder="Select your industry…"
                onChange={(v) => autoAdvance("industry", v)}
              />
              {answers.industry && (
                <button
                  onClick={() => go(1, "forward")}
                  style={{
                    marginTop: "14px", background: "#02492a", color: "#84e7a5",
                    border: "none", borderRadius: "1584px", padding: "10px 22px",
                    fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "rotateZ(-3deg) translateY(-2px)"
                    e.currentTarget.style.boxShadow = "rgb(0,0,0) -4px 4px"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = ""
                    e.currentTarget.style.boxShadow = ""
                  }}
                >
                  Next →
                </button>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <BackButton onClick={() => go(0, "back")} />
              <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.4px", marginBottom: "4px" }}>
                How long have you owned the business?
              </div>
              <div style={{ fontSize: "13px", color: "#9f9b93", marginBottom: "20px" }}>
                Longer operating history increases buyer confidence.
              </div>
              <SliderInput
                label="Years in business"
                value={answers.years ?? 5}
                min={1}
                max={30}
                displayValue={displayYears}
                onChange={(v) => set("years", v)}
              />
              <button
                onClick={() => go(2, "forward")}
                style={{
                  marginTop: "20px", background: "#02492a", color: "#84e7a5",
                  border: "none", borderRadius: "1584px", padding: "10px 22px",
                  fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "rotateZ(-3deg) translateY(-2px)"
                  e.currentTarget.style.boxShadow = "rgb(0,0,0) -4px 4px"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ""
                  e.currentTarget.style.boxShadow = ""
                }}
              >
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <BackButton onClick={() => go(1, "back")} />
              <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.4px", marginBottom: "4px" }}>
                What is your annual revenue?
              </div>
              <div style={{ fontSize: "13px", color: "#9f9b93", marginBottom: "16px" }}>
                Most recent full fiscal year.
              </div>
              <GridChips
                label=""
                options={REVENUE_OPTIONS}
                value={answers.revenue ?? ""}
                onSelect={(v) => autoAdvance("revenue", v)}
                columns={3}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <BackButton onClick={() => go(2, "back")} />
              <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.4px", marginBottom: "4px" }}>
                What is your annual SDE?
              </div>
              <div style={{ fontSize: "13px", color: "#9f9b93", marginBottom: "4px" }}>
                Seller Discretionary Earnings — your net profit + owner compensation + add-backs.
              </div>
              <SDETooltip />
              <div style={{ marginTop: "14px" }}>
                <GridChips
                  label=""
                  options={SDE_OPTIONS}
                  value={answers.sde ?? ""}
                  onSelect={(v) => autoAdvance("sde", v)}
                  columns={3}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <BackButton onClick={() => go(3, "back")} />
              <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.4px", marginBottom: "4px" }}>
                How many full-time employees?
              </div>
              <div style={{ fontSize: "13px", color: "#9f9b93", marginBottom: "16px" }}>
                Including yourself.
              </div>
              <GridChips
                label=""
                options={EMPLOYEE_OPTIONS}
                value={answers.employees ?? ""}
                onSelect={(v) => autoAdvance("employees", v)}
                columns={3}
              />
            </div>
          )}

          {step === 5 && (
            <div>
              <BackButton onClick={() => go(4, "back")} />
              <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.4px", marginBottom: "4px" }}>
                What state is the business located in?
              </div>
              <div style={{ fontSize: "13px", color: "#9f9b93", marginBottom: "16px" }}>
                Market dynamics vary by region.
              </div>
              <DropdownSelect
                id="state"
                label=""
                value={answers.state ?? ""}
                options={US_STATES}
                placeholder="Select state…"
                onChange={(v) => handleFinalStep("state", v)}
              />
              {answers.state && (
                <button
                  onClick={() => handleFinalStep("state", answers.state ?? "")}
                  style={{
                    marginTop: "14px", background: "#02492a", color: "#84e7a5",
                    border: "none", borderRadius: "1584px", padding: "10px 22px",
                    fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "rotateZ(-3deg) translateY(-2px)"
                    e.currentTarget.style.boxShadow = "rgb(0,0,0) -4px 4px"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = ""
                    e.currentTarget.style.boxShadow = ""
                  }}
                >
                  See My Estimate →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none", border: "none", color: "#9f9b93", fontSize: "12px",
        fontWeight: 500, padding: 0, marginBottom: "12px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "4px", fontFamily: "inherit",
        transition: "color 150ms",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#55534e")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#9f9b93")}
    >
      ← Back
    </button>
  )
}

function SDETooltip() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "#f0faf5", border: "1px solid #02492a", borderRadius: "1584px",
          padding: "3px 10px", fontSize: "11px", fontWeight: 600, color: "#02492a",
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        What is SDE? {open ? "▲" : "▼"}
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 10,
          background: "#1a1917", color: "#fff", borderRadius: "10px", padding: "12px 14px",
          fontSize: "12px", lineHeight: 1.6, maxWidth: "280px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        }}>
          <strong style={{ color: "#84e7a5" }}>Seller Discretionary Earnings</strong> = Net profit + owner salary
          + owner perks + one-time expenses + non-cash charges. It&apos;s the true economic benefit to an owner-operator.
        </div>
      )}
    </div>
  )
}

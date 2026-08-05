import { describe, expect, it } from "vitest"

import { AUDIT_TRAIL } from "@/lib/auditTrail"
import { getDealClock, parseDateLabel } from "@/lib/dealClock"

describe("parseDateLabel", () => {
  it("parses a well-formed audit date label", () => {
    expect(parseDateLabel("May 17, 2026")).toBe(Date.UTC(2026, 4, 17))
  })

  it("throws on an unparseable label", () => {
    expect(() => parseDateLabel("not a date")).toThrow()
  })
})

describe("getDealClock", () => {
  it("computes the 1-indexed day span across the audit trail", () => {
    const clock = getDealClock()
    expect(clock.dayNumber).toBe(4)
  })

  it("counts every logged agent action", () => {
    const clock = getDealClock()
    expect(clock.agentActionCount).toBe(AUDIT_TRAIL.length)
  })

  it("exposes the broker benchmark constants unchanged", () => {
    const clock = getDealClock()
    expect(clock.brokerAvgDaysToClose).toBe(186)
    expect(clock.brokerAvgHumanHours).toBe(275)
  })
})

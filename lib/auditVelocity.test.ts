import { describe, expect, it } from "vitest"

import { AUDIT_TRAIL } from "@/lib/auditTrail"
import {
  getAuditVelocitySummary,
  getEntryMinutes,
  getVelocityById,
} from "@/lib/auditVelocity"

describe("getEntryMinutes", () => {
  it("assigns 15 minutes to a review entry", () => {
    expect(getEntryMinutes({ severity: "review" } as never)).toBe(15)
  })

  it("assigns 5 minutes to a flag entry", () => {
    expect(getEntryMinutes({ severity: "flag" } as never)).toBe(5)
  })

  it("assigns 2 minutes to an entry with no severity", () => {
    expect(getEntryMinutes({} as never)).toBe(2)
  })
})

describe("getVelocityById", () => {
  it("returns one entry per audit-trail row", () => {
    const velocity = getVelocityById()
    expect(velocity.size).toBe(AUDIT_TRAIL.length)
  })

  it("accumulates exactly in source (chronological) order", () => {
    const velocity = getVelocityById()
    let running = 0
    for (const entry of AUDIT_TRAIL) {
      const v = velocity.get(entry.id)
      expect(v).toBeDefined()
      running += v!.minutes
      expect(v!.cumulativeMinutes).toBe(running)
    }
  })

  it("the last entry's cumulative total equals the sum of all entries' minutes", () => {
    const velocity = getVelocityById()
    const lastEntry = AUDIT_TRAIL[AUDIT_TRAIL.length - 1]!
    const total = Array.from(velocity.values()).reduce((sum, v) => sum + v.minutes, 0)
    expect(velocity.get(lastEntry.id)!.cumulativeMinutes).toBe(total)
  })
})

describe("getAuditVelocitySummary", () => {
  it("counts every logged agent action", () => {
    expect(getAuditVelocitySummary().totalActions).toBe(AUDIT_TRAIL.length)
  })

  it("converts total minutes to hours, rounded to one decimal", () => {
    const summary = getAuditVelocitySummary()
    const expectedHours = Math.round((summary.totalHumanMinutes / 60) * 10) / 10
    expect(summary.totalHumanHours).toBe(expectedHours)
  })
})

import { describe, expect, it } from "vitest"

import { getDealClock } from "@/lib/dealClock"
import {
  getAttentionQueue,
  getDealSnapshot,
  getOperatorDeals,
  getStationProgress,
  isLiveDeal,
  VERTICAL_LABEL,
} from "@/lib/operatorDeals"
import { PERSONA, STATIONS } from "@/lib/persona"

describe("getOperatorDeals", () => {
  it("returns exactly 8 concurrent deals", () => {
    expect(getOperatorDeals()).toHaveLength(8)
  })

  it("has unique ids across all deals", () => {
    const ids = getOperatorDeals().map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("restricts every deal's vertical to the roadmap's 3 Phase-1 verticals", () => {
    const allowed = new Set(Object.keys(VERTICAL_LABEL))
    for (const deal of getOperatorDeals()) {
      expect(allowed.has(deal.vertical)).toBe(true)
    }
  })

  it("gives every deal a non-empty stage, agent, and blocker", () => {
    for (const deal of getOperatorDeals()) {
      expect(deal.stage.length).toBeGreaterThan(0)
      expect(deal.agent.length).toBeGreaterThan(0)
      expect(deal.blocker.length).toBeGreaterThan(0)
      expect(deal.elapsedDays).toBeGreaterThan(0)
    }
  })

  it("marks exactly one deal as the live Fieldstone tile", () => {
    const live = getOperatorDeals().filter((d) => d.isLiveDeal)
    expect(live).toHaveLength(1)
    expect(live[0]?.id).toBe("fieldstone-digital")
  })

  it("sources the live deal's business name and industry verbatim from PERSONA", () => {
    const live = getOperatorDeals().find((d) => d.id === "fieldstone-digital")
    expect(live?.businessName).toBe(PERSONA.identity.businessName)
    expect(live?.industry).toBe(PERSONA.business.industry)
  })

  it("sources the live deal's day count from getDealClock(), matching the AppShell's own Deal Clock pill", () => {
    const live = getOperatorDeals().find((d) => d.id === "fieldstone-digital")
    expect(live?.elapsedDays).toBe(getDealClock().dayNumber)
  })

  it("resolves the live deal's stage/agent from STATIONS' Buyer Outreach entry", () => {
    const live = getOperatorDeals().find((d) => d.id === "fieldstone-digital")
    expect(live?.stage).toBe("Buyer Outreach")
    expect(live?.agent).toBe("Outreach")
  })
})

describe("getAttentionQueue", () => {
  it("returns exactly one attention item per deal", () => {
    expect(getAttentionQueue()).toHaveLength(getOperatorDeals().length)
  })

  it("sorts by elapsedDays descending — oldest-stuck deal first", () => {
    const queue = getAttentionQueue()
    for (let i = 1; i < queue.length; i++) {
      expect(queue[i - 1]!.elapsedDays).toBeGreaterThanOrEqual(queue[i]!.elapsedDays)
    }
  })

  it("carries every deal's non-empty blocker string through unchanged", () => {
    const deals = getOperatorDeals()
    const queue = getAttentionQueue()
    for (const deal of deals) {
      const item = queue.find((q) => q.id === deal.id)
      expect(item?.blocker).toBe(deal.blocker)
      expect(item?.businessName).toBe(deal.businessName)
    }
  })
})

describe("isLiveDeal", () => {
  it("is true only for the Fieldstone id", () => {
    expect(isLiveDeal("fieldstone-digital")).toBe(true)
    expect(isLiveDeal("crestwood-electrical")).toBe(false)
    expect(isLiveDeal("not-a-real-id")).toBe(false)
  })
})

describe("getDealSnapshot", () => {
  it("resolves every non-live seed deal to a snapshot", () => {
    const nonLive = getOperatorDeals().filter((d) => !d.isLiveDeal)
    for (const deal of nonLive) {
      const snap = getDealSnapshot(deal.id)
      expect(snap).not.toBeNull()
      expect(snap?.businessName).toBe(deal.businessName)
      expect(snap?.financials.revenueDisplay.length).toBeGreaterThan(0)
      expect(snap?.nextSteps.length).toBeGreaterThan(0)
    }
  })

  it("resolves the live deal verbatim from PERSONA (moot for rendering, but correct)", () => {
    const snap = getDealSnapshot("fieldstone-digital")
    expect(snap).not.toBeNull()
    expect(snap?.ownerFirstName).toBe(PERSONA.identity.firstName)
    expect(snap?.score.overall).toBe(PERSONA.exitIQ.score)
  })

  it("returns null for an unknown id", () => {
    expect(getDealSnapshot("not-a-real-id")).toBeNull()
  })
})

describe("getStationProgress", () => {
  it("splits an early-stage deal (Crestwood · Platform Connectors) mostly into not-reached", () => {
    const { reached, notReached } = getStationProgress("Platform Connectors")
    expect(reached.map((s) => s.label)).toEqual(["Platform Connectors"])
    expect(notReached[0]?.label).toBe("Data Processing")
    expect(notReached).toHaveLength(STATIONS.length - 2) // total minus Seller Home minus reached
  })

  it("splits a late-stage deal (Summit Lawn · Lender Outreach) into most stations reached", () => {
    const { reached, notReached } = getStationProgress("Lender Outreach")
    expect(reached.map((s) => s.label)).toContain("The Boardroom")
    expect(reached[reached.length - 1]?.label).toBe("Lender Outreach")
    expect(notReached.map((s) => s.label)).toEqual(["Buyer Network", "Buyer Outreach"])
  })
})

import { describe, expect, it } from "vitest"

import {
  DEAL_TABS,
  DEALIQ_NAV,
  DEALIQ_ROOT,
  DEALIQ_SIGNIN_PATH,
  dealPath,
  PIPELINE_STAGES,
  pipelineStageLabel,
  resolveDealTab,
} from "@/lib/dealiq/navigation"
import { DEAL_TAB_KEYS, PIPELINE_STAGE_KEYS } from "@/lib/dealiq/types"

describe("DEALIQ_NAV", () => {
  it("has exactly the four global destinations", () => {
    expect(DEALIQ_NAV).toHaveLength(4)
    expect(DEALIQ_NAV.map((item) => item.label)).toEqual(["Pipeline", "Screen", "Flow", "Verify"])
  })

  it("keeps every destination inside the DealIQ URL space", () => {
    for (const item of DEALIQ_NAV) {
      expect(item.href.startsWith(DEALIQ_ROOT)).toBe(true)
    }
    expect(DEALIQ_SIGNIN_PATH.startsWith(DEALIQ_ROOT)).toBe(true)
  })

  it("uses a unique href and icon per destination", () => {
    expect(new Set(DEALIQ_NAV.map((i) => i.href)).size).toBe(DEALIQ_NAV.length)
    expect(new Set(DEALIQ_NAV.map((i) => i.icon)).size).toBe(DEALIQ_NAV.length)
  })

  it("never routes into the seller workspace", () => {
    const sellerPaths = ["/dashboard", "/login", "/connect", "/recast", "/buyers"]
    for (const item of DEALIQ_NAV) {
      expect(sellerPaths).not.toContain(item.href)
    }
  })
})

describe("DEAL_TABS", () => {
  it("covers every tab key exactly once, in workspace order", () => {
    expect(DEAL_TABS.map((tab) => tab.key)).toEqual([...DEAL_TAB_KEYS])
  })

  it("gives every tab a label and a short label", () => {
    for (const tab of DEAL_TABS) {
      expect(tab.label.length).toBeGreaterThan(0)
      expect(tab.shortLabel.length).toBeGreaterThan(0)
    }
  })
})

describe("resolveDealTab", () => {
  it("passes through every known tab key", () => {
    for (const key of DEAL_TAB_KEYS) {
      expect(resolveDealTab(key)).toBe(key)
    }
  })

  it("falls back to the score tab for anything unrecognised", () => {
    expect(resolveDealTab(null)).toBe("score")
    expect(resolveDealTab(undefined)).toBe("score")
    expect(resolveDealTab("")).toBe("score")
    expect(resolveDealTab("returns; drop table")).toBe("score")
    expect(resolveDealTab("RETURNS")).toBe("score")
  })
})

describe("dealPath", () => {
  it("deep links to a tab and defaults to the score tab", () => {
    expect(dealPath("abc", "recast")).toBe("/dealiq/deal/abc?tab=recast")
    expect(dealPath("abc")).toBe("/dealiq/deal/abc?tab=score")
  })

  it("encodes an id that would otherwise break the path", () => {
    expect(dealPath("a b/c?d")).toBe("/dealiq/deal/a%20b%2Fc%3Fd?tab=score")
  })
})

describe("PIPELINE_STAGES", () => {
  it("covers every stage key exactly once, in board order", () => {
    expect(PIPELINE_STAGES.map((stage) => stage.key)).toEqual([...PIPELINE_STAGE_KEYS])
  })

  it("gives every stage a label and a meaning line", () => {
    for (const stage of PIPELINE_STAGES) {
      expect(stage.label.length).toBeGreaterThan(0)
      expect(stage.meaning.length).toBeGreaterThan(0)
    }
  })

  it("resolves a label for every stage", () => {
    expect(pipelineStageLabel("loi")).toBe("LOI")
    expect(pipelineStageLabel("sourced")).toBe("Sourced")
  })
})

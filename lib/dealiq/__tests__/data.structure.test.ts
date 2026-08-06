/**
 * Seed integrity — the ONE test file permitted to import `lib/dealiq/data/`.
 *
 * Execution Plan §1 forbids engine tests from touching the data directory, so a
 * total content swap leaves them untouched. This file is the deliberate
 * exception, and it earns it by asserting only *structure*: uniqueness, union
 * membership, internal consistency, and the placeholder banner. It never asserts
 * a value. Rewriting every name and number in `lib/dealiq/data/` must leave every
 * expectation below passing.
 *
 * It also enforces two standing rules mechanically, so they cannot rot:
 * the banner is present on every data file, and DealIQ never imports the
 * sell-side persona.
 */

import { describe, expect, it } from "vitest"

import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { BUYER } from "@/lib/dealiq/data/buyer"
import { INGESTION_LOG, LOG_STEP_MS, SAMPLE_LISTING_TEXT } from "@/lib/dealiq/data/copy"
import { FOCUS_DEAL } from "@/lib/dealiq/data/deal"
import { DILIGENCE_BANK } from "@/lib/dealiq/data/diligence"
import { CERTIFIED_LISTINGS, FLOW_AS_OF } from "@/lib/dealiq/data/flow"
import { PIPELINE_DEALS } from "@/lib/dealiq/data/pipeline"
import { countByStage, funnel, orderedDeals } from "@/lib/dealiq/pipeline"
import {
  DOCUMENTATION_QUALITIES,
  PIPELINE_STAGE_KEYS,
  type PipelineDeal,
  type Verdict,
  VERDICTS,
} from "@/lib/dealiq/types"

const DATA_DIR = join(process.cwd(), "lib", "dealiq", "data")
const BANNER = "PLACEHOLDER CONTENT — provisional values, authored separately and swapped wholesale."

function ids<T extends { id: string }>(rows: ReadonlyArray<T>): ReadonlyArray<string> {
  return rows.map((row) => row.id)
}

function expectUniqueIds<T extends { id: string }>(rows: ReadonlyArray<T>): void {
  const all = ids(rows)
  expect(new Set(all).size).toBe(all.length)
}

// ─────────────────────────────────────────────────────────────────────────────

describe("the data seam itself", () => {
  const files = readdirSync(DATA_DIR).filter((name) => name.endsWith(".ts"))

  it("has data files to check", () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files)("%s carries the placeholder banner", (file) => {
    expect(readFileSync(join(DATA_DIR, file), "utf8")).toContain(BANNER)
  })

  it("imports nothing from the repo outside its own directory", () => {
    // Stronger than the sell-side persona rule it replaces, and it enforces the
    // whole of §2's "no component imports across products" at the lib layer:
    // a repo-internal specifier (`@/…`) is only legal if it stays inside
    // lib/dealiq. Third-party packages and node builtins are unrestricted.
    const specifier = /(?:from|import\()\s*["']([^"']+)["']/g
    const root = join(process.cwd(), "lib", "dealiq")
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(full)
          continue
        }
        if (!entry.name.endsWith(".ts")) continue
        const source = readFileSync(full, "utf8")
        specifier.lastIndex = 0
        let match = specifier.exec(source)
        while (match !== null) {
          const target = match[1] ?? ""
          if (target.startsWith("@/") && !target.startsWith("@/lib/dealiq/")) {
            offenders.push(`${full} → ${target}`)
          }
          match = specifier.exec(source)
        }
      }
    }
    walk(root)
    expect(offenders).toEqual([])
  })
})

describe("BUYER", () => {
  it("ranks inside its own pool", () => {
    expect(BUYER.poolRank).toBeGreaterThanOrEqual(1)
    expect(BUYER.poolRank).toBeLessThanOrEqual(BUYER.poolSize)
  })

  it("declares a coherent mandate", () => {
    expect(BUYER.mandate.industries.length).toBeGreaterThan(0)
    expect(BUYER.mandate.geographies.length).toBeGreaterThan(0)
    expect(BUYER.mandate.evBand.low).toBeLessThan(BUYER.mandate.evBand.high)
    expect(BUYER.mandate.sdeFloor).toBeGreaterThan(0)
    expect(BUYER.mandate.maxOwnerDependency).toBeGreaterThan(0)
    expect(BUYER.mandate.maxOwnerDependency).toBeLessThanOrEqual(100)
  })

  it("carries a parseable verification date", () => {
    expect(Number.isNaN(Date.parse(BUYER.verifiedOn))).toBe(false)
  })

  it("has capital above the floor it is willing to deploy against", () => {
    expect(BUYER.committedCapital).toBeGreaterThan(0)
  })
})

describe("PIPELINE_DEALS", () => {
  it("gives every deal a unique id", () => {
    expectUniqueIds(PIPELINE_DEALS)
  })

  it("uses only stages and verdicts from their unions", () => {
    for (const deal of PIPELINE_DEALS) {
      expect(PIPELINE_STAGE_KEYS).toContain(deal.stage)
      if (deal.verdict !== null) expect(VERDICTS).toContain(deal.verdict)
    }
  })

  it("pairs score and verdict — a deal has both or neither", () => {
    for (const deal of PIPELINE_DEALS) {
      expect(deal.score === null).toBe(deal.verdict === null)
    }
  })

  it("scores every deal that has moved past sourced", () => {
    for (const deal of PIPELINE_DEALS) {
      if (deal.stage !== "sourced") expect(deal.score).not.toBeNull()
    }
  })

  it("keeps scores inside 0-100 and day counts non-negative", () => {
    for (const deal of PIPELINE_DEALS) {
      if (deal.score !== null) {
        expect(deal.score).toBeGreaterThanOrEqual(0)
        expect(deal.score).toBeLessThanOrEqual(100)
      }
      expect(deal.daysInStage).toBeGreaterThanOrEqual(0)
      expect(deal.ask).toBeGreaterThan(0)
      expect(deal.claimedSde).toBeGreaterThan(0)
    }
  })

  it("orders verdicts monotonically against score, without hardcoding the bands", () => {
    // Band thresholds live in `screenScore.ts`. This asserts only that the seed
    // cannot contradict whatever they are: no PASS may outscore a DIG, and no
    // DIG may outscore a PURSUE.
    const scoresFor = (verdict: Verdict) =>
      PIPELINE_DEALS.filter(
        (d): d is PipelineDeal & { score: number } => d.verdict === verdict && d.score !== null
      ).map((d) => d.score)
    const pass = scoresFor("PASS")
    const dig = scoresFor("DIG")
    const pursue = scoresFor("PURSUE")
    if (pass.length && dig.length) expect(Math.max(...pass)).toBeLessThan(Math.min(...dig))
    if (dig.length && pursue.length) expect(Math.max(...dig)).toBeLessThan(Math.min(...pursue))
  })

  it("attaches a kill reason only where the verdict is PASS", () => {
    for (const deal of PIPELINE_DEALS) {
      if (deal.killReason !== undefined) expect(deal.verdict).toBe("PASS")
    }
  })

  it("is internally consistent with its derived counts", () => {
    const counts = countByStage(PIPELINE_DEALS)
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(PIPELINE_DEALS.length)
    expect(funnel(PIPELINE_DEALS).reduce((sum, step) => sum + step.count, 0)).toBe(PIPELINE_DEALS.length)
    expect(orderedDeals(PIPELINE_DEALS)).toHaveLength(PIPELINE_DEALS.length)
  })

  it("has the distribution shape a real search pipeline has — heaviest at screened", () => {
    const counts = countByStage(PIPELINE_DEALS)
    expect(counts.screened).toBeGreaterThanOrEqual(counts.sourced)
    expect(counts.screened).toBeGreaterThan(counts.loi)
  })

  it("populates every stage so the board never renders an empty column", () => {
    const counts = countByStage(PIPELINE_DEALS)
    for (const stage of PIPELINE_STAGE_KEYS) expect(counts[stage]).toBeGreaterThan(0)
  })
})

describe("FOCUS_DEAL", () => {
  it("is absent from the pipeline so the board visibly gains it during the demo", () => {
    expect(ids(PIPELINE_DEALS)).not.toContain(FOCUS_DEAL.card.id)
  })

  it("gives every claimed add-back a unique id and a positive amount", () => {
    expectUniqueIds(FOCUS_DEAL.addBacks)
    for (const line of FOCUS_DEAL.addBacks) expect(line.annualAmount).toBeGreaterThan(0)
  })

  it("uses only documentation qualities from the union", () => {
    for (const line of FOCUS_DEAL.addBacks) {
      expect(DOCUMENTATION_QUALITIES).toContain(line.documentation)
    }
  })

  it("keeps every optional share inside 0-1", () => {
    for (const line of FOCUS_DEAL.addBacks) {
      for (const share of [line.businessUseShare, line.roleVacatedShare]) {
        if (share !== undefined) {
          expect(share).toBeGreaterThanOrEqual(0)
          expect(share).toBeLessThanOrEqual(1)
        }
      }
    }
  })

  it("cannot claim an expense recurred more often than the history window allows", () => {
    expect(FOCUS_DEAL.historyWindowYears).toBeGreaterThan(0)
    for (const line of FOCUS_DEAL.addBacks) {
      if (line.recurredYears !== undefined) {
        expect(line.recurredYears).toBeGreaterThanOrEqual(0)
        expect(line.recurredYears).toBeLessThanOrEqual(FOCUS_DEAL.historyWindowYears)
      }
    }
  })

  it("claims add-backs that fit inside the claimed SDE", () => {
    const claimed = FOCUS_DEAL.addBacks.reduce((sum, line) => sum + line.annualAmount, 0)
    expect(claimed).toBeGreaterThan(0)
    expect(claimed).toBeLessThanOrEqual(FOCUS_DEAL.card.claimedSde)
  })

  it("gives each of the six challenge rules something to fire on", () => {
    const { addBacks, occupancy } = FOCUS_DEAL
    expect(addBacks.some((l) => l.roleVacatedShare !== undefined)).toBe(true) // role_split
    expect(addBacks.some((l) => l.businessUseShare !== undefined)).toBe(true) // mixed_use
    expect(addBacks.some((l) => l.documentation !== "verified")).toBe(true) // documentation
    expect(addBacks.some((l) => l.replacementCost !== undefined)).toBe(true) // replacement_cost
    expect(addBacks.some((l) => (l.recurredYears ?? 0) > 1)).toBe(true) // reserve
    expect(occupancy.costInPandL === 0 || occupancy.premisesOwnedBySeller).toBe(true) // occupancy
  })

  it("leaves at least one claim intact so the recast can visibly agree", () => {
    const unchallengeable = FOCUS_DEAL.addBacks.filter(
      (l) =>
        l.documentation === "verified" &&
        l.businessUseShare === undefined &&
        l.roleVacatedShare === undefined &&
        (l.recurredYears ?? 0) <= 1
    )
    expect(unchallengeable.length).toBeGreaterThan(0)
  })

  it("declares a coherent comp band and risk profile", () => {
    expect(FOCUS_DEAL.compMultiple.low).toBeLessThan(FOCUS_DEAL.compMultiple.high)
    const { risk } = FOCUS_DEAL
    for (const share of [risk.topCustomerShare, risk.topThreeCustomerShare, risk.recurringRevenueShare]) {
      expect(share).toBeGreaterThanOrEqual(0)
      expect(share).toBeLessThanOrEqual(1)
    }
    expect(risk.topCustomerShare).toBeLessThanOrEqual(risk.topThreeCustomerShare)
    expect(risk.employees).toBeGreaterThanOrEqual(risk.longTenuredStaff)
  })

  it("asserts no conclusion — no defensible SDE, fair value, score, or verdict in the seed", () => {
    const seed = JSON.stringify(FOCUS_DEAL)
    for (const forbidden of ["defensibleSde", "fairValue", "verdict", "score", "impliedMultiple"]) {
      expect(seed).not.toContain(forbidden)
    }
  })
})

describe("DILIGENCE_BANK", () => {
  it("gives every question a unique id", () => {
    expectUniqueIds(DILIGENCE_BANK)
  })

  it("rates kill speed on the 1-5 scale", () => {
    for (const q of DILIGENCE_BANK) {
      expect(q.killSpeed).toBeGreaterThanOrEqual(1)
      expect(q.killSpeed).toBeLessThanOrEqual(5)
      expect(Number.isInteger(q.killSpeed)).toBe(true)
    }
  })

  it("gives every question a non-empty prompt and rationale", () => {
    for (const q of DILIGENCE_BANK) {
      expect(q.question.trim().length).toBeGreaterThan(0)
      expect(q.rationale.trim().length).toBeGreaterThan(0)
    }
  })

  it("covers every category, so a filter chip is never dead", () => {
    const categories = new Set(DILIGENCE_BANK.map((q) => q.category))
    expect(categories).toEqual(new Set(["financial", "customer", "operational", "legal", "people", "market"]))
  })

  it("tags at least one question to every recast rule that can promote it", () => {
    const tagged = new Set(DILIGENCE_BANK.flatMap((q) => (q.sourceFinding ? [q.sourceFinding] : [])))
    for (const rule of ["role_split", "mixed_use", "documentation", "replacement_cost", "reserve", "occupancy"]) {
      expect(tagged).toContain(rule)
    }
  })

  it("is large enough to rank meaningfully", () => {
    expect(DILIGENCE_BANK.length).toBeGreaterThanOrEqual(20)
  })
})

describe("CERTIFIED_LISTINGS", () => {
  it("gives every listing a unique id", () => {
    expectUniqueIds(CERTIFIED_LISTINGS)
  })

  it("releases to the open market after certification and after the seeded now", () => {
    const asOf = Date.parse(FLOW_AS_OF)
    expect(Number.isNaN(asOf)).toBe(false)
    for (const listing of CERTIFIED_LISTINGS) {
      const certified = Date.parse(listing.certifiedOn)
      const open = Date.parse(listing.openMarketOn)
      expect(Number.isNaN(certified)).toBe(false)
      expect(Number.isNaN(open)).toBe(false)
      expect(open).toBeGreaterThan(certified)
      // The countdown is `openMarketOn − FLOW_AS_OF`; a past date renders as released.
      expect(open).toBeGreaterThan(asOf)
    }
  })

  it("keeps scores and shares inside their ranges and states a certification basis", () => {
    for (const listing of CERTIFIED_LISTINGS) {
      expect(listing.scortaScore).toBeGreaterThanOrEqual(0)
      expect(listing.scortaScore).toBeLessThanOrEqual(100)
      expect(listing.ownerDependencyScore).toBeGreaterThanOrEqual(0)
      expect(listing.ownerDependencyScore).toBeLessThanOrEqual(100)
      expect(listing.topCustomerShare).toBeGreaterThanOrEqual(0)
      expect(listing.topCustomerShare).toBeLessThanOrEqual(1)
      expect(listing.ask).toBeGreaterThan(0)
      expect(listing.sde).toBeGreaterThan(0)
      expect(listing.certificationBasis.length).toBeGreaterThan(0)
    }
  })

  it("stores no match score — matching is computed against the mandate", () => {
    expect(JSON.stringify(CERTIFIED_LISTINGS)).not.toContain("matchScore")
  })

  it("spans enough mandate fit to make the ranking visible", () => {
    const industries = new Set(CERTIFIED_LISTINGS.map((l) => l.industry))
    const onMandate = CERTIFIED_LISTINGS.filter((l) => BUYER.mandate.industries.includes(l.industry))
    expect(industries.size).toBeGreaterThan(1)
    expect(onMandate.length).toBeGreaterThan(0)
    expect(onMandate.length).toBeLessThan(CERTIFIED_LISTINGS.length)
  })
})

describe("copy", () => {
  it("runs a log script long enough to mask model latency", () => {
    expect(INGESTION_LOG.length).toBeGreaterThanOrEqual(12)
    expect(INGESTION_LOG.length * LOG_STEP_MS).toBeGreaterThanOrEqual(4000)
  })

  it("gives every log line a timestamp and text", () => {
    for (const line of INGESTION_LOG) {
      expect(line.ts).toMatch(/^\d{2}:\d{2}$/)
      expect(line.text.trim().length).toBeGreaterThan(0)
    }
  })

  it("states no figure in the log — every number on screen is derived", () => {
    for (const line of INGESTION_LOG) {
      expect(line.text).not.toMatch(/\$\s?[\d.]/)
    }
  })

  it("builds the sample listing from the seed rather than restating it", () => {
    expect(SAMPLE_LISTING_TEXT).toContain(FOCUS_DEAL.card.name)
    for (const line of FOCUS_DEAL.addBacks) {
      expect(SAMPLE_LISTING_TEXT).toContain(line.label)
    }
    expect(SAMPLE_LISTING_TEXT.length).toBeGreaterThan(200)
  })
})

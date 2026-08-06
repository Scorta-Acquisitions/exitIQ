/**
 * Diligence ranking — the ordering is the product (Execution Plan item 9).
 *
 * `killScore` is computed (`killSpeed × categoryWeight × unresolvedFlag`) and the
 * pack is sorted by it — never hand-ordered. Questions whose `sourceFinding`
 * matches a recast rule that actually fired are promoted by the unresolved
 * multiplier, which is what floats them to the top: the linkage that proves the
 * pack was generated rather than templated, and it works under any seed.
 *
 * Pure and content-free: the bank arrives as an argument. Callers pass
 * `DILIGENCE_BANK` from `lib/dealiq/data/`; this module never imports it.
 */

import { RULE_LABEL } from "@/lib/dealiq/reverseRecast"
import type {
  DiligenceAskOf,
  DiligenceCategory,
  DiligenceQuestion,
  RankedDiligenceQuestion,
  RecastRule,
  ReverseRecastResult,
} from "@/lib/dealiq/types"

/**
 * How much a category's unfavourable answer matters relative to the others.
 * Financial claims kill fastest because everything else is priced off them.
 */
export const CATEGORY_WEIGHT: Record<DiligenceCategory, number> = {
  financial: 1,
  customer: 0.95,
  legal: 0.9,
  operational: 0.85,
  people: 0.8,
  market: 0.75,
}

/**
 * The `unresolvedFlag` term: a question tied to a recast finding that fired and
 * has not been answered yet outranks its resting position. Chosen so a promoted
 * mid-speed question overtakes an unpromoted one of the same category without
 * letting a promoted kill-speed-1 outrank an unpromoted kill-speed-5.
 */
export const UNRESOLVED_FINDING_MULTIPLIER = 2

export const CATEGORY_LABEL: Record<DiligenceCategory, string> = {
  financial: "Financial",
  customer: "Customer",
  operational: "Operational",
  legal: "Legal",
  people: "People",
  market: "Market",
}

export const ASK_OF_LABEL: Record<DiligenceAskOf, string> = {
  seller: "the seller",
  broker: "the broker",
  accountant: "the accountant",
  lender: "the lender",
}

/**
 * The recast rules that actually fired: every rule behind a challenged line
 * (partial or rejected — an accepted claim resolved its question) plus every
 * rule behind a flag. Order follows first appearance; duplicates collapse.
 */
export function firedRules(recast: ReverseRecastResult): ReadonlyArray<RecastRule> {
  const fired: RecastRule[] = []
  const push = (rule: RecastRule) => {
    if (!fired.includes(rule)) fired.push(rule)
  }
  for (const line of recast.lines) {
    if (line.verdict !== "accepted") push(line.rule)
  }
  for (const flag of recast.flags) {
    push(flag.rule)
  }
  return fired
}

/**
 * Ranks the bank by computed `killScore`, descending. The sort is stable —
 * questions with equal scores keep their bank order — and the input array is
 * never mutated. Adding a question to the bank must require no change here.
 */
export function rankQuestions(
  bank: ReadonlyArray<DiligenceQuestion>,
  fired: ReadonlyArray<RecastRule>
): ReadonlyArray<RankedDiligenceQuestion> {
  const ranked = bank.map((question): RankedDiligenceQuestion => {
    const promoted = question.sourceFinding !== undefined && fired.includes(question.sourceFinding)
    const killScore =
      question.killSpeed * CATEGORY_WEIGHT[question.category] * (promoted ? UNRESOLVED_FINDING_MULTIPLIER : 1)
    return { ...question, killScore, promoted }
  })
  return ranked.sort((a, b) => b.killScore - a.killScore)
}

/**
 * The "Copy pack" payload — the ranked list as markdown, ready for an email or
 * a deal memo. Clipboard only; nothing is sent anywhere (Execution Plan §7).
 */
export function diligencePackMarkdown(ranked: ReadonlyArray<RankedDiligenceQuestion>, title: string): string {
  const lines: string[] = [`# ${title}`, ""]
  ranked.forEach((question, index) => {
    lines.push(`${index + 1}. **${question.question}**`)
    const meta = [
      `kill speed ${question.killSpeed}/5`,
      CATEGORY_LABEL[question.category],
      `ask ${ASK_OF_LABEL[question.askOf]}`,
    ]
    if (question.promoted && question.sourceFinding) {
      meta.push(`promoted by the ${RULE_LABEL[question.sourceFinding]} finding`)
    }
    lines.push(`   - ${meta.join(" · ")}`)
    lines.push(`   - Why: ${question.rationale}`)
  })
  return lines.join("\n")
}

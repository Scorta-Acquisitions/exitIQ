import { z } from "zod"
import { ADVISOR_QUESTION_IDS } from "@/lib/site/advisor/data"
import { ADVISOR_DONE_STEP } from "@/lib/site/advisor/intake"
import { QUESTION_COUNT, QUESTIONS } from "@/lib/site/exitiq/questions"
import {
  type HeroPath,
  type HeroStage,
  pathForStage,
  SELL_REVENUE_CHIPS,
  SELL_TIMING_CHIPS,
  type SellRevenue,
  type SellTiming,
  STAGE_PROGRESS_LABEL,
} from "@/lib/site/hero/funnel"
import type { PersistedSiteState } from "@/lib/site/state/reducer"

/**
 * Schema for the state the provider keeps in `sessionStorage`.
 *
 * Anything under that key is external input — another script in the tab, an extension, or a hand-edited
 * dev-tools entry can leave any JSON there — so it is parsed, not trusted (engineering contract rule 2).
 * The schema mirrors exactly what `persistableState` writes: all three slices, every field it stores (the
 * flags `hydrate` sets itself are neither written nor required), the question
 * ids as unions, the exitIQ answers confined to their own chip values, and the two indices bounded where
 * the code assumes them (`QUESTIONS[phase]`, and `heroGeometry`, which reads `SELL[(i + tick) % 12]` and
 * would fault on a negative or fractional tick).
 *
 * Unknown keys are dropped at every level (Zod objects strip), so a key from an older build — a stale
 * `advisor.flow`, or the `iq.busy` / `funnel.boot` / `advisor.open` / `advisor.busy` flags a build before
 * this one wrote — is ignored instead of being carried into the reducer and written back. Anything
 * that does not fit the shape makes `parsePersistedState` return null, and the visitor starts from
 * `INITIAL_SITE_STATE` exactly as they do after unparsable JSON.
 *
 * Advisor answer values stay plain strings on purpose: the prefill carries the hero funnel's own revenue
 * ranges (`1-3`, `3-10`, `10+`) into the advisor's `rev`, so they are not confined to the advisor chips.
 */

/** What the provider stores, which is exactly what `persistableState` writes (drift is a compile error). */
export type PersistedState = PersistedSiteState

type OptionalShape<K extends string, V extends z.ZodTypeAny> = { [P in K]: z.ZodOptional<V> }

/** `{ [id]?: value }` over the entries given: an id from another build is dropped, a wrong type rejected. */
function optionalById<K extends string, V extends z.ZodTypeAny>(
  entries: ReadonlyArray<readonly [K, V]>
): OptionalShape<K, V> {
  const shape = {} as OptionalShape<K, V>
  for (const [id, value] of entries) shape[id] = value.optional()
  return shape
}

/** One of the chip values a question offers; the exitIQ run never stores anything else. */
function chipValue(values: readonly string[]): z.ZodType<string> {
  const allowed = new Set(values)
  return z.string().refine((v) => allowed.has(v))
}

// The closed sets the funnel stores, read from the funnel's own tables so a new stage needs no edit here.
const STAGES = Object.keys(STAGE_PROGRESS_LABEL) as [HeroStage, ...HeroStage[]]
const PATHS = Array.from(new Set(STAGES.map(pathForStage))) as [HeroPath, ...HeroPath[]]
const TIMINGS = SELL_TIMING_CHIPS.map(([v]) => v) as [SellTiming, ...SellTiming[]]
const REVENUES = SELL_REVENUE_CHIPS.map(([v]) => v) as [SellRevenue, ...SellRevenue[]]

/** `bumpTick` wraps at 12, so a stored tick is an integer 0..11. */
const TICK_MAX = 11

const advisorAnswers = z.object(optionalById(ADVISOR_QUESTION_IDS.map((id) => [id, z.string()] as const)))

const persistedSchema = z.object({
  iq: z.object({
    phase: z.number().int().min(0).max(QUESTION_COUNT),
    answers: z.object(optionalById(QUESTIONS.map((q) => [q.id, chipValue(q.chips.map((c) => c.v))] as const))),
    insight: z.string().nullable(),
    done: z.boolean(),
    started: z.boolean(),
  }),
  funnel: z.object({
    stage: z.enum(STAGES),
    path: z.enum(PATHS),
    tick: z.number().int().min(0).max(TICK_MAX),
    sellTiming: z.enum(TIMINGS).nullable(),
    sellRevenue: z.enum(REVENUES).nullable(),
  }),
  advisor: z.object({
    step: z.number().int().min(0).max(ADVISOR_DONE_STEP),
    answers: advisorAnswers,
    labels: advisorAnswers,
    prefilled: z.object(optionalById(ADVISOR_QUESTION_IDS.map((id) => [id, z.literal(true)] as const))),
    ack: z.string().nullable(),
    note: z.string(),
    emailed: z.boolean(),
  }),
})

/**
 * Parse one stored record. Returns the state to hydrate, or null for anything that does not fit — an
 * array, a primitive, a missing field, a wrong type, a value outside its union — so the caller can fall
 * back to the initial state. Never throws.
 */
export function parsePersistedState(raw: unknown): PersistedState | null {
  const parsed = persistedSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

import { ADVISOR_ACK, ADVISOR_QUESTIONS, type AdvisorQuestionId } from "@/lib/site/advisor/data"
import {
  ADVISOR_DONE_STEP,
  ADVISOR_NOTE_STEP,
  type AdvisorState,
  INITIAL_ADVISOR_STATE,
  nextStep,
  openAdvisor,
  type PrefillContext,
  prevStep,
} from "@/lib/site/advisor/intake"
import { insightFor, QUESTION_COUNT, type QuestionId, QUESTIONS } from "@/lib/site/exitiq/questions"
import type { ExitIqAnswers } from "@/lib/site/exitiq/scoring"
import { type HeroPath, type HeroStage, pathForStage, type SellRevenue, type SellTiming } from "@/lib/site/hero/funnel"

/**
 * Site-wide client state shared across routes: the exitIQ run, the hero funnel, and the advisor
 * intake dialog. Kept as a pure reducer so every transition is unit-testable.
 */

export interface ExitIqState {
  phase: number
  answers: ExitIqAnswers
  busy: boolean
  insight: string | null
  done: boolean
  started: boolean
}

export interface FunnelState {
  stage: HeroStage
  path: HeroPath
  tick: number
  boot: boolean
  sellTiming: SellTiming | null
  sellRevenue: SellRevenue | null
}

export interface SiteState {
  iq: ExitIqState
  funnel: FunnelState
  advisor: AdvisorState
}

/**
 * What the provider keeps in sessionStorage: the live state without the four fields `hydrate` overrides
 * anyway — the two in-flight `busy` flags, the dialog's `open`, and the hero's `boot`, which belong to the
 * tab that is running, not to the session. Writing them was harmless and misleading; a record from an
 * older build that still carries them parses all the same, because the schema strips what it does not know.
 */
export interface PersistedSiteState {
  iq: Omit<ExitIqState, "busy">
  funnel: Omit<FunnelState, "boot">
  advisor: Omit<AdvisorState, "open" | "busy">
}

/** What `hydrate` may be given: any slice, any subset of its fields, over the initial state. */
export interface HydratableState {
  iq?: Partial<ExitIqState>
  funnel?: Partial<FunnelState>
  advisor?: Partial<AdvisorState>
}

export const INITIAL_SITE_STATE: SiteState = {
  iq: { phase: 0, answers: {}, busy: false, insight: null, done: false, started: false },
  funnel: { stage: "route", path: "sell", tick: 0, boot: true, sellTiming: null, sellRevenue: null },
  advisor: INITIAL_ADVISOR_STATE,
}

export type SiteAction =
  | { type: "iq/start" }
  | { type: "iq/answer"; value: string }
  | { type: "iq/advance" }
  | { type: "iq/back" }
  | { type: "iq/restart" }
  | { type: "iq/edit"; index: number }
  | { type: "funnel/boot" }
  | { type: "funnel/hover"; path: HeroPath }
  | { type: "funnel/stage"; stage: HeroStage; sellTiming?: SellTiming; sellRevenue?: SellRevenue }
  | { type: "advisor/open"; ctx: Omit<PrefillContext, "stage" | "iqAnswers" | "sellTiming" | "sellRevenue"> }
  | { type: "advisor/close" }
  | { type: "advisor/answer"; id: AdvisorQuestionId; value: string }
  | { type: "advisor/advance" }
  | { type: "advisor/back" }
  | { type: "advisor/note"; note: string }
  | { type: "advisor/finish" }
  | { type: "advisor/emailed" }
  | { type: "advisor/restart" }
  | { type: "hydrate"; state: HydratableState }

const bumpTick = (t: number) => (t + 1) % 12

export function siteReducer(state: SiteState, action: SiteAction): SiteState {
  switch (action.type) {
    case "hydrate": {
      const next: SiteState = {
        iq: { ...state.iq, ...action.state.iq, busy: false },
        funnel: { ...state.funnel, ...action.state.funnel, boot: state.funnel.boot },
        advisor: { ...state.advisor, ...action.state.advisor, open: false, busy: false },
      }
      return next
    }

    case "iq/start":
      return { ...state, iq: { ...state.iq, started: true } }

    case "iq/answer": {
      if (state.iq.busy) return state
      const q = QUESTIONS[state.iq.phase]
      if (!q) return state
      const answers = { ...state.iq.answers, [q.id]: action.value }
      return {
        ...state,
        iq: { ...state.iq, busy: true, answers, insight: insightFor(q.id as QuestionId, action.value), started: true },
        funnel: { ...state.funnel, tick: bumpTick(state.funnel.tick) },
      }
    }

    case "iq/advance": {
      if (!state.iq.busy) return state
      const done = state.iq.phase + 1 >= QUESTION_COUNT
      return {
        ...state,
        iq: done ? { ...state.iq, done: true, busy: false } : { ...state.iq, phase: state.iq.phase + 1, busy: false },
      }
    }

    case "iq/back": {
      if (state.iq.done) return { ...state, iq: { ...state.iq, done: false, phase: QUESTION_COUNT - 1, insight: null } }
      if (state.iq.phase === 0) return state
      return { ...state, iq: { ...state.iq, phase: state.iq.phase - 1, insight: null } }
    }

    case "iq/restart":
      return { ...state, iq: { ...INITIAL_SITE_STATE.iq, started: state.iq.started } }

    case "iq/edit": {
      const index = Math.max(0, Math.min(QUESTION_COUNT - 1, action.index))
      return { ...state, iq: { ...state.iq, done: false, phase: index, insight: null } }
    }

    case "funnel/boot":
      return state.funnel.boot ? { ...state, funnel: { ...state.funnel, boot: false } } : state

    case "funnel/hover":
      return state.funnel.path === action.path ? state : { ...state, funnel: { ...state.funnel, path: action.path } }

    case "funnel/stage":
      return {
        ...state,
        funnel: {
          ...state.funnel,
          stage: action.stage,
          path: pathForStage(action.stage),
          tick: bumpTick(state.funnel.tick),
          sellTiming: action.sellTiming ?? state.funnel.sellTiming,
          sellRevenue: action.sellRevenue ?? state.funnel.sellRevenue,
        },
      }

    case "advisor/open":
      return {
        ...state,
        advisor: openAdvisor(state.advisor, {
          stage: state.funnel.stage,
          iqAnswers: state.iq.answers,
          sellTiming: state.funnel.sellTiming,
          sellRevenue: state.funnel.sellRevenue,
          onScorePage: action.ctx.onScorePage,
        }),
      }

    case "advisor/close":
      return state.advisor.open ? { ...state, advisor: { ...state.advisor, open: false } } : state

    case "advisor/answer": {
      if (state.advisor.busy) return state
      const answers = { ...state.advisor.answers, [action.id]: action.value }
      return {
        ...state,
        advisor: { ...state.advisor, busy: true, answers, ack: ADVISOR_ACK[`${action.id}:${action.value}`] ?? null },
      }
    }

    case "advisor/advance": {
      if (!state.advisor.busy) return state
      return {
        ...state,
        advisor: {
          ...state.advisor,
          busy: false,
          step: nextStep(state.advisor.step + 1, state.advisor.answers),
        },
      }
    }

    case "advisor/back": {
      const a = state.advisor
      if (a.step === ADVISOR_DONE_STEP) return { ...state, advisor: { ...a, step: ADVISOR_NOTE_STEP } }
      const prev = prevStep(a.step, a.prefilled)
      if (prev < 0) return state
      return { ...state, advisor: { ...a, step: prev, ack: null } }
    }

    case "advisor/note":
      return { ...state, advisor: { ...state.advisor, note: action.note } }

    case "advisor/finish":
      return { ...state, advisor: { ...state.advisor, step: ADVISOR_DONE_STEP, ack: null } }

    case "advisor/emailed":
      return { ...state, advisor: { ...state.advisor, emailed: true } }

    case "advisor/restart":
      // A fresh briefing: answers and note all go.
      return { ...state, advisor: { ...INITIAL_ADVISOR_STATE, open: true } }

    default:
      return state
  }
}

/** Whether the visitor can step back inside the advisor dialog. */
export function advisorCanGoBack(a: AdvisorState): boolean {
  return a.step === ADVISOR_DONE_STEP || (a.step > 0 && prevStep(a.step, a.prefilled) >= 0)
}

/** Count of answered advisor questions, capped at the question count (drives the progress ticks). */
export function advisorAnsweredCount(a: AdvisorState): number {
  return Math.min(ADVISOR_QUESTIONS.length, Object.keys(a.answers).length)
}

/**
 * Slice of state persisted to sessionStorage between routes and reloads. The fields `hydrate` sets itself
 * — `iq.busy`, `funnel.boot`, `advisor.open` and `advisor.busy` — are left out rather than written and
 * then ignored, so nothing in the store reads as a promise the restore does not keep.
 */
export function persistableState(s: SiteState): PersistedSiteState {
  const { busy: _iqBusy, ...iq } = s.iq
  const { boot: _boot, ...funnel } = s.funnel
  const { open: _open, busy: _advisorBusy, ...advisor } = s.advisor
  return { iq, funnel, advisor }
}

// use client: holds cross-route interactive state (exitIQ run, hero funnel, advisor dialog)
"use client"

import { usePathname } from "next/navigation"
import { createContext, type Dispatch, type ReactNode, useCallback, useContext, useEffect, useReducer } from "react"
import { ROUTES } from "@/lib/site/routes"
import {
  INITIAL_SITE_STATE,
  persistableState,
  type SiteAction,
  siteReducer,
  type SiteState,
} from "@/lib/site/state/reducer"

const STORAGE_KEY = "heirloom.site.v1"
const IQ_ADVANCE_MS = 380
const ADVISOR_ADVANCE_MS = 480
const HERO_BOOT_MS = 400

interface SiteContextValue {
  state: SiteState
  dispatch: Dispatch<SiteAction>
  openAdvisor: () => void
  closeAdvisor: () => void
}

const SiteContext = createContext<SiteContextValue | null>(null)

function readPersisted(): Partial<SiteState> | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    return parsed as Partial<SiteState>
  } catch {
    return null
  }
}

export function SiteStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(siteReducer, INITIAL_SITE_STATE)
  const pathname = usePathname()

  // Restore what the visitor already told us (answers survive navigation and reloads within the tab).
  useEffect(() => {
    const saved = readPersisted()
    if (saved) dispatch({ type: "hydrate", state: saved })
    const t = window.setTimeout(() => dispatch({ type: "funnel/boot" }), HERO_BOOT_MS)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persistableState(state)))
    } catch {
      /* storage may be unavailable; the page still works */
    }
  }, [state])

  // The short "reading your answer" pause before each exitIQ question advances.
  useEffect(() => {
    if (!state.iq.busy) return
    const t = window.setTimeout(() => dispatch({ type: "iq/advance" }), IQ_ADVANCE_MS)
    return () => window.clearTimeout(t)
  }, [state.iq.busy])

  useEffect(() => {
    if (!state.advisor.busy) return
    const t = window.setTimeout(() => dispatch({ type: "advisor/advance" }), ADVISOR_ADVANCE_MS)
    return () => window.clearTimeout(t)
  }, [state.advisor.busy])

  const openAdvisor = useCallback(() => {
    dispatch({ type: "advisor/open", ctx: { onScorePage: pathname === ROUTES.score } })
  }, [pathname])
  const closeAdvisor = useCallback(() => dispatch({ type: "advisor/close" }), [])

  return <SiteContext.Provider value={{ state, dispatch, openAdvisor, closeAdvisor }}>{children}</SiteContext.Provider>
}

export function useSiteState(): SiteContextValue {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error("useSiteState must be used inside <SiteStateProvider>")
  return ctx
}

export function useAdvisor() {
  const { state, openAdvisor, closeAdvisor, dispatch } = useSiteState()
  return { advisor: state.advisor, openAdvisor, closeAdvisor, dispatch }
}

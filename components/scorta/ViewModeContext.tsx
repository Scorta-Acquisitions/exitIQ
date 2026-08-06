"use client"

import { usePathname } from "next/navigation"
import React from "react"

export type ViewMode = "seller" | "operator"

type ViewModeState = {
  mode: ViewMode
}

const ViewModeContext = React.createContext<ViewModeState | null>(null)

/** The one route that renders the operator's cross-portfolio console — see `lib/operatorDeals.ts`. */
const OPERATOR_ROUTE = "/deals"

/**
 * View mode is derived from the current pathname, not stored as
 * independently-drifting state. `/deals` is the operator's cross-portfolio
 * console (`OperatorDealsStation`); every other `(app)` route is the seller's
 * own single-deal workspace. Deriving from pathname — rather than a toggle
 * persisted the way `AgentFleetContext` persists `dispatched` to
 * sessionStorage — guarantees a user who opens `/deals` directly via a fresh
 * URL (no prior "Operator View" click) still gets correct operator chrome:
 * there's no stored flag that can disagree with the actual route.
 *
 * The context still exists, matching the `AgentFleetProvider` precedent this
 * codebase already uses for shell-wide state, so any descendant component can
 * call `useViewMode()` instead of re-deriving its own pathname check.
 */
export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const mode: ViewMode = pathname === OPERATOR_ROUTE ? "operator" : "seller"

  const value = React.useMemo<ViewModeState>(() => ({ mode }), [mode])

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>
}

export function useViewMode(): ViewModeState {
  const ctx = React.useContext(ViewModeContext)
  if (!ctx) {
    // The provider always wraps the AppShell. If we land here, something is
    // rendering outside the shell — fall back to seller mode, the more
    // restrictive/default chrome, rather than throwing.
    return { mode: "seller" }
  }
  return ctx
}

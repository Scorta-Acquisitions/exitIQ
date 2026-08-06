"use client"

/**
 * DealIQ session state — sessionStorage-backed, copied in shape from
 * `AgentFleetContext.tsx` on the sell side.
 *
 * No database, no migrations: DealIQ is session-scoped by design (Execution Plan
 * §2). Two facts survive navigation — whether a deal has been screened, and
 * whether the buyer has verified capital.
 *
 * `hydrated` exists because both facts live in sessionStorage, which the server
 * cannot see. Any surface that renders differently once a deal is screened must
 * gate on `hydrated` or it will produce a hydration mismatch on first paint.
 */

import React from "react"

import type { SessionScreenedDeal } from "@/lib/dealiq/types"

const SCREENED_KEY = "scorta:dealiq:screened"
const VERIFIED_KEY = "scorta:dealiq:verified"

type DealIQSessionState = {
  /** The deal screened in this session, or `null` before the Inbox has run. */
  screened: SessionScreenedDeal | null
  setScreened: (deal: SessionScreenedDeal | null) => void
  capitalVerified: boolean
  setCapitalVerified: (verified: boolean) => void
  /** `false` until the sessionStorage read has run on the client. */
  hydrated: boolean
}

const DealIQSessionContext = React.createContext<DealIQSessionState | null>(null)

function readScreened(): SessionScreenedDeal | null {
  try {
    const raw = sessionStorage.getItem(SCREENED_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    // Shape-check rather than trust: a stale key from an earlier build would
    // otherwise crash a surface that expects a card.
    if (parsed && typeof parsed === "object" && "card" in parsed) return parsed as SessionScreenedDeal
    return null
  } catch {
    return null
  }
}

export function DealIQSessionProvider({ children }: { children: React.ReactNode }) {
  const [screened, setScreenedState] = React.useState<SessionScreenedDeal | null>(null)
  const [capitalVerified, setCapitalVerifiedState] = React.useState(false)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setScreenedState(readScreened())
    try {
      setCapitalVerifiedState(sessionStorage.getItem(VERIFIED_KEY) === "1")
    } catch {
      // sessionStorage may be unavailable; the session continues with defaults.
    }
    setHydrated(true)
  }, [])

  const setScreened = React.useCallback((deal: SessionScreenedDeal | null) => {
    setScreenedState(deal)
    try {
      if (deal) sessionStorage.setItem(SCREENED_KEY, JSON.stringify(deal))
      else sessionStorage.removeItem(SCREENED_KEY)
    } catch {
      // no-op
    }
  }, [])

  const setCapitalVerified = React.useCallback((verified: boolean) => {
    setCapitalVerifiedState(verified)
    try {
      if (verified) sessionStorage.setItem(VERIFIED_KEY, "1")
      else sessionStorage.removeItem(VERIFIED_KEY)
    } catch {
      // no-op
    }
  }, [])

  const value = React.useMemo<DealIQSessionState>(
    () => ({ screened, setScreened, capitalVerified, setCapitalVerified, hydrated }),
    [screened, setScreened, capitalVerified, setCapitalVerified, hydrated]
  )

  return <DealIQSessionContext.Provider value={value}>{children}</DealIQSessionContext.Provider>
}

export function useDealIQSession(): DealIQSessionState {
  const ctx = React.useContext(DealIQSessionContext)
  if (!ctx) {
    // The provider always wraps the workspace. Landing here means something is
    // rendering outside it — return an inert state rather than throwing mid-demo.
    return {
      screened: null,
      setScreened: () => {},
      capitalVerified: false,
      setCapitalVerified: () => {},
      hydrated: false,
    }
  }
  return ctx
}

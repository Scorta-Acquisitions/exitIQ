"use client"

import React from "react"

type AgentFleetState = {
  dispatched: boolean
  setDispatched: (v: boolean) => void
}

const AgentFleetContext = React.createContext<AgentFleetState | null>(null)

const STORAGE_KEY = "scorta:fleet:dispatched"

export function AgentFleetProvider({ children }: { children: React.ReactNode }) {
  const [dispatched, setDispatchedState] = React.useState(false)

  // Hydrate from sessionStorage on mount so the dispatched state survives
  // the BoardroomStation → /documents navigation and the rest of the demo.
  React.useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setDispatchedState(true)
      }
    } catch {
      // sessionStorage may be unavailable; demo continues with default state.
    }
  }, [])

  const setDispatched = React.useCallback((v: boolean) => {
    setDispatchedState(v)
    try {
      if (v) sessionStorage.setItem(STORAGE_KEY, "1")
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // no-op
    }
  }, [])

  const value = React.useMemo<AgentFleetState>(
    () => ({ dispatched, setDispatched }),
    [dispatched, setDispatched]
  )

  return <AgentFleetContext.Provider value={value}>{children}</AgentFleetContext.Provider>
}

export function useAgentFleet(): AgentFleetState {
  const ctx = React.useContext(AgentFleetContext)
  if (!ctx) {
    // The provider always wraps the AppShell. If we land here, something
    // is rendering outside the shell — surface a useful no-op for safety.
    return { dispatched: false, setDispatched: () => {} }
  }
  return ctx
}

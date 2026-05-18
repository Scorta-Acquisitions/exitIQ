/**
 * Agent Activity Panel — state machine for the live agent fleet view.
 *
 * Demo-only, hard-coded. The current route + a single `dispatched` flag drive
 * the visible state of each dispatched agent. Spec: .claude/bonus-feature1.md.
 *
 * Agents map 1:1 to the four Boardroom work orders (see BoardroomStation.tsx
 * WORK_ORDERS): Owner-Dependency, Concentration, Recast, Outreach.
 */

export type AgentKey = "owner_dep" | "concentration" | "recast" | "outreach"

export type AgentStatus = "running" | "waiting" | "reviewing" | "complete"

export type AgentDef = {
  readonly key: AgentKey
  readonly name: string
  readonly workOrderIndex: number
  readonly initialStatus: AgentStatus
  readonly initialTask: string
  readonly runningLines: ReadonlyArray<string>
  readonly waitingLines: ReadonlyArray<string>
}

export const AGENT_DEFS: ReadonlyArray<AgentDef> = [
  {
    key: "owner_dep",
    name: "Owner-Dependency Agent",
    workOrderIndex: 1,
    initialStatus: "running",
    initialTask: "Drafting SOP templates for 5 tasks",
    runningLines: [
      "Drafting SOP templates for 5 tasks",
      "Mapping catering sales process steps...",
      "Generating vendor negotiation SOP...",
    ],
    waitingLines: [],
  },
  {
    key: "concentration",
    name: "Concentration Agent",
    workOrderIndex: 2,
    initialStatus: "running",
    initialTask: "Drafting NJ Transit contract extension",
    runningLines: [
      "Drafting NJ Transit contract extension",
      "Reviewing 6-year account history...",
      "Preparing 3-year renewal terms...",
    ],
    waitingLines: [],
  },
  {
    key: "recast",
    name: "Recast Agent",
    workOrderIndex: 3,
    initialStatus: "running",
    initialTask: "Hardening personal travel add-back narrative",
    runningLines: [
      "Hardening personal travel add-back narrative",
      "Cross-referencing SBA SOP 50 10 8...",
      "Updating lender package narrative...",
    ],
    waitingLines: [],
  },
  {
    key: "outreach",
    name: "Outreach Agent",
    workOrderIndex: 4,
    initialStatus: "waiting",
    initialTask: "Queued · pending NJ Transit contract status",
    runningLines: [
      "Building SBA-Backed Operator sequences",
      "Drafting Micro-PE outreach cadence...",
      "Preparing buyer profile pitch decks...",
    ],
    waitingLines: [
      "Queued · pending NJ Transit contract status",
      "SBA-Backed Operator profile ready to sequence",
      "Micro-PE profile ready to sequence",
    ],
  },
]

/**
 * Route → ARIA task line. ARIA is always RUNNING during the demo;
 * her task copy reframes per station to match what the seller is doing.
 */
export const ARIA_TASKS: Record<string, string> = {
  "/dashboard": "Reviewing intake · 2 gaps identified",
  "/connect": "Waiting on account connection",
  "/ingestion": "Supervising Ingestion Agent run",
  "/recast": "Reviewing recast output",
  "/risk": "Tracking owner-dependency remediation",
  "/boardroom": "Coordinating Boardroom investment committee",
  "/documents": "Supervising CIM assembly",
  "/vdr": "Monitoring VDR access · 2 requests pending",
  "/score": "Calculating final Scorta Score",
  "/marketplace": "Routing lender package",
  "/outreach": "Managing buyer outreach cadence",
}

export function getAriaTask(route: string): string {
  return ARIA_TASKS[route] ?? "Coordinating deal state machine"
}

export type AgentRouteState = {
  status: AgentStatus
  /** Explicit task line override. When null, the row rotates `runningLines` / `waitingLines`. */
  task: string | null
  amber: boolean
}

/**
 * Pure projection: given the current route and whether the fleet has been
 * dispatched, return the visible state for each agent row.
 *
 * Once an agent transitions to REVIEWING or COMPLETE, it stays in that state
 * (or progresses further) as the seller advances through later stations.
 */
export function getAgentState(
  agentKey: AgentKey,
  route: string,
  dispatched: boolean
): AgentRouteState {
  if (!dispatched) {
    return { status: "waiting", task: "Standing by", amber: false }
  }

  // Treat unknown / pre-boardroom routes as the initial post-dispatch state.
  const phase = ROUTE_PHASE[route] ?? 0

  switch (agentKey) {
    case "recast":
      // Completes the moment the Score station opens.
      if (phase >= PHASE.SCORE) {
        return { status: "complete", task: "Add-back narrative hardened", amber: false }
      }
      return { status: "running", task: null, amber: false }

    case "concentration":
      // Reviewing once the lender/marketplace station opens, then completes by outreach.
      if (phase >= PHASE.OUTREACH) {
        return { status: "complete", task: "NJ Transit contract extension drafted", amber: false }
      }
      if (phase >= PHASE.MARKETPLACE) {
        return {
          status: "reviewing",
          task: "NJ Transit draft ready · awaiting your review",
          amber: true,
        }
      }
      return { status: "running", task: null, amber: false }

    case "owner_dep":
      // Reviewing once outreach station opens (SOPs ready for Chandan to fill in).
      if (phase >= PHASE.OUTREACH) {
        return {
          status: "reviewing",
          task: "SOP templates ready · Chandan to fill in",
          amber: true,
        }
      }
      return { status: "running", task: null, amber: false }

    case "outreach":
      // Activates once the Outreach station is opened.
      if (phase >= PHASE.OUTREACH) {
        return { status: "running", task: null, amber: false }
      }
      return { status: "waiting", task: null, amber: false }
  }
}

const PHASE = {
  DISPATCH: 1,
  DOCUMENTS: 2,
  SCORE: 3,
  MARKETPLACE: 4,
  OUTREACH: 5,
} as const

const ROUTE_PHASE: Record<string, number> = {
  "/boardroom": PHASE.DISPATCH,
  "/documents": PHASE.DOCUMENTS,
  "/score": PHASE.SCORE,
  "/marketplace": PHASE.MARKETPLACE,
  "/outreach": PHASE.OUTREACH,
}

/**
 * Whether the panel should render the fleet rows. Before /boardroom dispatch,
 * only ARIA is shown.
 */
export function shouldShowFleet(dispatched: boolean): boolean {
  return dispatched
}

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
      "Mapping client account management steps...",
      "Generating vendor negotiation SOP...",
    ],
    waitingLines: [],
  },
  {
    key: "concentration",
    name: "Concentration Agent",
    workOrderIndex: 2,
    initialStatus: "running",
    initialTask: "Drafting Garden State Auto Group contract extension",
    runningLines: [
      "Drafting Garden State Auto Group contract extension",
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
    initialTask: "Queued · pending Garden State Auto Group contract status",
    runningLines: [
      "Building SBA-Backed Operator sequences",
      "Drafting Micro-PE outreach cadence...",
      "Preparing buyer profile pitch decks...",
    ],
    waitingLines: [
      "Queued · pending Garden State Auto Group contract status",
      "SBA-Backed Operator profile ready to sequence",
      "Micro-PE profile ready to sequence",
    ],
  },
]

/**
 * Route → CASE task line. CASE is always RUNNING during the demo;
 * his task copy reframes per station to match what the seller is doing.
 */
export const CASE_TASKS: Record<string, string> = {
  "/dashboard": "Reviewing intake · 2 gaps identified",
  "/connect": "Waiting on account connection",
  "/ingestion": "Supervising Ingestion Agent run",
  "/recast": "Reviewing recast output",
  "/risk": "Tracking owner-dependency remediation",
  "/boardroom": "Coordinating Boardroom investment committee",
  "/score": "Calculating final Scorta Score",
  "/documents": "Supervising CIM assembly",
  "/vdr": "Monitoring VDR access · 2 requests pending",
  "/lenders": "Routing lender package",
  "/buyers": "Managing buyer outreach cadence",
}

export function getCaseTask(route: string): string {
  return CASE_TASKS[route] ?? "Coordinating deal state machine"
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
      // Reviewing once the lender station opens, then completes by buyer outreach.
      if (phase >= PHASE.BUYERS) {
        return { status: "complete", task: "Garden State Auto Group contract extension drafted", amber: false }
      }
      if (phase >= PHASE.LENDERS) {
        return {
          status: "reviewing",
          task: "Garden State Auto Group draft ready · awaiting your review",
          amber: true,
        }
      }
      return { status: "running", task: null, amber: false }

    case "owner_dep":
      // Reviewing once lender outreach opens (SOPs ready for Amara to fill in).
      if (phase >= PHASE.LENDERS) {
        return {
          status: "reviewing",
          task: "SOP templates ready · Amara to fill in",
          amber: true,
        }
      }
      return { status: "running", task: null, amber: false }

    case "outreach":
      // Activates once the Buyer Outreach station is opened.
      if (phase >= PHASE.BUYERS) {
        return { status: "running", task: null, amber: false }
      }
      return { status: "waiting", task: null, amber: false }
  }
}

const PHASE = {
  DISPATCH: 1,
  SCORE: 2,
  DOCUMENTS: 3,
  VDR: 4,
  LENDERS: 5,
  BUYERS: 6,
} as const

const ROUTE_PHASE: Record<string, number> = {
  "/boardroom": PHASE.DISPATCH,
  "/score": PHASE.SCORE,
  "/documents": PHASE.DOCUMENTS,
  "/vdr": PHASE.VDR,
  "/lenders": PHASE.LENDERS,
  "/buyers": PHASE.BUYERS,
}

/**
 * Whether the panel should render the fleet rows. Before /boardroom dispatch,
 * only CASE is shown.
 */
export function shouldShowFleet(dispatched: boolean): boolean {
  return dispatched
}

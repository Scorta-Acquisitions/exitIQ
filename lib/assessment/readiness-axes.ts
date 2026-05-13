// 7-axis Exit Readiness lookups, kept in a standalone client-safe module so
// they can be imported by both server-side report-transform and client-side
// report-visual without dragging in Node-only dependencies (fs/path).
// Order MUST match the radarScores array in lib/exitiq/calculations.ts and
// RADAR_AXES in lib/exitiq/data.ts.

export const READINESS_AXIS_KEYS = [
  "finDocs",
  "ownerDep",
  "revQuality",
  "custConc",
  "longevity",
  "opsDepth",
  "positioning",
] as const

export const READINESS_AXIS_LABELS: Record<string, string> = {
  finDocs:     "Financial Documentation",
  ownerDep:    "Owner Dependency",
  revQuality:  "Revenue Quality",
  custConc:    "Customer Concentration",
  longevity:   "Business Longevity",
  opsDepth:    "Operational Depth",
  positioning: "Market Positioning",
}

export const READINESS_AXIS_DESCRIPTIONS: Record<string, string> = {
  finDocs:     "How clean and lender-ready your financial statements look on a quality of earnings review.",
  ownerDep:    "How much of the business runs through you personally — owner involvement is what buyers discount most aggressively.",
  revQuality:  "How predictable your top line is — recurring, contracted, or repeat revenue scores higher than transactional.",
  custConc:    "How exposed the business is if a top customer leaves; concentration above 20% is a major buyer concern.",
  longevity:   "Years operating under current ownership — buyers and SBA lenders price longer track records higher.",
  opsDepth:    "Whether the business can run without a key person — documented SOPs, cross-trained staff, and a #2.",
  positioning: "How defensible your market position looks to a buyer — industry fundamentals, geography, and reputation.",
}

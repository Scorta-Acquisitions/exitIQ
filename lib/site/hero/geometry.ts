import type { HeroPath } from "./funnel"

/**
 * Geometry for the hero's "private market" SVG. Twelve buyer nodes orbit the protected business;
 * rings, evidence markers, and offer modules fade in per path. Pure and deterministic given
 * (path, tick, boot), so the SVG can be rendered on the server and animated with CSS transitions.
 */

export const HERO_CX = 520
export const HERO_CY = 310
const D2R = Math.PI / 180

export interface HeroNode {
  x: string
  y: string
  o: number
  r: number
  f: string
  s: string
  gr: number
  go: number
  tc: string
  l: string
  tip: string
  tier: number
}

export interface HeroEdge {
  d: string
  c: string
  o: number
}

export interface HeroRing {
  r: number
  ry: number
  ly: number
  l: string
  o: number
}

export interface HeroEvidence {
  x: string
  y: string
  o: number
  f: string
  go: number
  tx: number
  ta: "start" | "middle" | "end"
  tc: string
  l: string
}

export interface HeroModule {
  x: string
  y: string
  o: number
  l: string
  hs: string
}

export interface HeroGeometry {
  nodes: HeroNode[]
  edges: HeroEdge[]
  rings: HeroRing[]
  evidence: HeroEvidence[]
  modules: HeroModule[]
  offerOpacity: number
}

const FILAMENT = "#4CE27E"
const NODE = "#EAF4EC"
const DIM_FILL = "rgba(240,248,243,.14)"
const DIM_STROKE = "rgba(240,248,243,.55)"

const ANGLES = [-75, -58, -42, -27, -13, 0, 13, 27, 42, 58, 70, -68]
/** Per-node sell config: [radius, opacity, label, tier]. Tier: 0 faded · 1 matched · 2 NDA · 3 reviewed · 4 finalist · 5 offer. */
const SELL: Array<[number, number, string, number]> = [
  [258, 0.2, "", 0],
  [205, 0.5, "", 1],
  [120, 0.85, "", 3],
  [255, 0.2, "", 0],
  [205, 0.5, "", 1],
  [150, 0.72, "", 2],
  [70, 1, "OFFER", 5],
  [95, 0.95, "", 4],
  [150, 0.72, "", 2],
  [95, 0.95, "", 4],
  [250, 0.2, "", 0],
  [252, 0.2, "", 0],
]
const TIPS = [
  "Outside your criteria",
  "Matches the business",
  "Capacity range reviewed",
  "Outside your criteria",
  "Matches the business",
  "NDA signed",
  "Written offer received",
  "Approved for more detail",
  "NDA signed",
  "Approved for more detail",
  "Excluded by your rules",
  "Outside your criteria",
]
/** Four evidence markers, kept to the east and west so their labels never cross the ring captions above and below. */
const EVIDENCE: Array<[number, string, 0 | 1]> = [
  [-30, "FINANCIALS RECONCILED", 1],
  [30, "RECURRING REVENUE", 1],
  [150, "DOCUMENTATION GAPS", 0],
  [210, "OWNER DEPENDENCE", 0],
]
/** Offer modules sit in a two-by-two grid under the buyer edge, clear of the seal and its caption. */
const MODULES: Array<[number, number, string]> = [
  [650, 392, "PRICE"],
  [776, 392, "CASH AT CLOSING"],
  [650, 426, "FINANCING"],
  [776, 426, "CLOSING RISK"],
]

function pos(ang: number, R: number) {
  return { x: HERO_CX + Math.cos(ang * D2R) * R, y: HERO_CY + Math.sin(ang * D2R) * R * 0.82 }
}

export function heroGeometry(path: HeroPath, tick = 0, boot = false): HeroGeometry {
  let liveIdx = 6
  const nodes: HeroNode[] = ANGLES.map((ang, i) => {
    let R: number
    let o: number
    let l: string
    let tier: number
    if (path === "sell") {
      const cfg = SELL[(i + tick) % 12] as [number, number, string, number]
      ;[R, o, l, tier] = cfg
      if (tier === 5) liveIdx = i
    } else if (path === "offer") {
      if (i === 6) {
        R = 250
        o = 1
        l = "THE BUYER"
        tier = 5
      } else {
        R = 320
        o = 0
        l = ""
        tier = 0
      }
    } else {
      R = 320
      o = 0
      l = ""
      tier = 0
    }
    if (boot) {
      R = 290
      o = 0
    }
    const p = path === "offer" && i === 6 ? { x: HERO_CX + 222, y: HERO_CY } : pos(ang, R)
    const live = tier >= 5
    const adv = tier >= 3
    return {
      x: p.x.toFixed(1),
      y: p.y.toFixed(1),
      o,
      r: live ? 6 : adv ? 5 : 4,
      f: live ? FILAMENT : adv ? NODE : DIM_FILL,
      s: live ? FILAMENT : DIM_STROKE,
      gr: live ? 11 : 0,
      go: live ? 0.7 : 0,
      tc: live ? FILAMENT : DIM_STROKE,
      l,
      tip: TIPS[i] as string,
      tier,
    }
  })

  const edgePath = (i: number) => {
    const n = nodes[i] as HeroNode
    const x = +n.x
    const y = +n.y
    const dx = HERO_CX - x
    const dy = HERO_CY - y
    const len = Math.hypot(dx, dy) || 1
    const ex = x + dx * (1 - 66 / len)
    const ey = y + dy * (1 - 66 / len)
    return `M${x} ${y} L${ex.toFixed(1)} ${ey.toFixed(1)}`
  }
  const advIdx = nodes
    .map((n, i) => (n.tier >= 2 ? i : -1))
    .filter((i) => i >= 0)
    .slice(0, 6)
  while (advIdx.length < 6) advIdx.push(6)
  const edges: HeroEdge[] = advIdx.map((i) => {
    const live = i === liveIdx && path === "sell"
    let o = 0
    if (path === "sell" && !boot) o = live ? 0.55 : 0.22
    if (path === "offer" && i === 6) o = 0.6
    return { d: edgePath(i), c: live ? FILAMENT : NODE, o }
  })

  const ringO = boot ? 0 : 1
  const RINGS =
    path === "ready"
      ? [
          { r: 150, l: "BUYER VIEW", o: 0.8 },
          { r: 105, l: "EVIDENCE", o: 0.8 },
          { r: 205, l: "", o: 0 },
        ]
      : [
          { r: 205, l: "MATCHED", o: path === "sell" ? 0.9 : 0.07 },
          { r: 150, l: "NDA SIGNED", o: path === "sell" ? 0.9 : 0.07 },
          { r: 95, l: "FINALISTS", o: path === "sell" ? 0.9 : 0.07 },
        ]
  const rings: HeroRing[] = RINGS.map((r) => ({
    r: r.r,
    ry: Math.round(r.r * 0.82),
    ly: HERO_CY - Math.round(r.r * 0.82) - 8,
    l: r.l,
    o: r.o * ringO,
  }))

  const evidence: HeroEvidence[] = EVIDENCE.map(([ang, l, ok], vi) => {
    const p = pos(ang, path === "ready" ? 105 : 55)
    const west = Math.cos(ang * D2R) < -0.1
    const east = Math.cos(ang * D2R) > 0.1
    return {
      x: p.x.toFixed(1),
      y: p.y.toFixed(1),
      o: path === "ready" ? 1 : 0,
      f: ok ? FILAMENT : "rgba(240,248,243,.15)",
      go: path === "ready" && tick % EVIDENCE.length === vi ? 0.8 : 0,
      tx: east ? 14 : west ? -14 : 0,
      ta: east ? "start" : west ? "end" : "middle",
      tc: ok ? FILAMENT : DIM_STROKE,
      l,
    }
  })

  const modules: HeroModule[] = MODULES.map(([mx, my, l], i) => ({
    x: mx.toFixed(1),
    y: my.toFixed(1),
    o: path === "offer" ? 1 : 0,
    l,
    hs: path === "offer" && tick % MODULES.length === i ? FILAMENT : "rgba(240,248,243,.25)",
  }))

  return { nodes, edges, rings, evidence, modules, offerOpacity: path === "offer" ? 1 : 0 }
}

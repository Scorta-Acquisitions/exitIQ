// legacy exitIQ console: restored 2026-09-11 from the first build (e35fbbe) at the user's request; see styles/site.css
import type { HeroPath } from "@/lib/site/hero/funnel"
import { HERO_CX, HERO_CY, heroGeometry } from "@/lib/site/hero/geometry"

const MONO = "var(--font-mono)"
const DISPLAY = "var(--font-display)"
const ease = "var(--ease-e1)"

/**
 * The live map of a private transaction forming around one protected business, as the first build drew
 * it: mono caps labels, the sealed centre, dashed rings. Pure SVG; every position and opacity comes from
 * `heroGeometry` (whose colours are now token expressions), and CSS transitions carry the motion between states.
 */
export function HeroGraph({ path, tick, boot }: { path: HeroPath; tick: number; boot: boolean }) {
  const g = heroGeometry(path, tick, boot)
  return (
    <svg
      viewBox="240 100 600 460"
      role="img"
      aria-label="Diagram of a private buyer process around one business"
      className="hero-svg absolute inset-0 h-full w-full"
      data-testid="hero-graph"
    >
      <defs>
        <radialGradient id="hlSeal" cx="38%" cy="34%" r="80%">
          <stop offset="0%" stopColor="#1E6B47" />
          <stop offset="62%" stopColor="#0C3626" />
          <stop offset="100%" stopColor="#082418" />
        </radialGradient>
      </defs>
      {g.rings.map((r, i) => (
        <g key={i} style={{ opacity: r.o, transition: `opacity 1s ${ease}` }}>
          <ellipse
            cx={HERO_CX}
            cy={HERO_CY}
            rx={r.r}
            ry={r.ry}
            fill="none"
            stroke="#EAF4EC"
            strokeOpacity=".2"
            strokeDasharray="3 7"
            className="animate-dash motion-reduce:animate-none"
          />
          <text
            x={HERO_CX}
            y={r.ly}
            textAnchor="middle"
            style={{ font: `600 11.5px ${MONO}`, letterSpacing: "1.6px", fill: "rgba(240,248,243,.42)" }}
          >
            {r.l}
          </text>
        </g>
      ))}
      {g.edges.map((e, i) => (
        <path
          key={i}
          d={e.d}
          fill="none"
          stroke={e.c}
          strokeWidth="1.1"
          style={{ opacity: e.o, transition: `opacity .9s ${ease}` }}
        />
      ))}
      {g.nodes.map((n, i) => (
        <g
          key={i}
          style={{
            transform: `translate(${n.x}px,${n.y}px)`,
            opacity: n.o,
            transition: `transform 1.1s ${ease}, opacity .9s ${ease}`,
          }}
        >
          <circle r={n.r} fill={n.f} stroke={n.s} strokeWidth="1.1" />
          <circle r={n.gr} fill="none" stroke="#4CE27E" strokeOpacity={n.go} />
          <text
            x="0"
            y="-13"
            textAnchor="middle"
            style={{ font: `600 11px ${MONO}`, letterSpacing: "1.3px", fill: n.tc }}
          >
            {n.l}
          </text>
          <title>{n.tip}</title>
        </g>
      ))}
      {g.evidence.map((v, i) => (
        <g
          key={i}
          style={{
            transform: `translate(${v.x}px,${v.y}px)`,
            opacity: v.o,
            transition: `transform 1.1s ${ease}, opacity .9s ${ease}`,
          }}
        >
          <circle
            r="10"
            fill="none"
            stroke="#4CE27E"
            strokeOpacity={v.go}
            style={{ transition: `stroke-opacity .6s ${ease}` }}
          />
          <rect
            x="-4"
            y="-4"
            width="8"
            height="8"
            rx="1.5"
            transform="rotate(45)"
            fill={v.f}
            stroke="#EAF4EC"
            strokeOpacity=".5"
          />
          <text
            x={v.tx}
            y="3.5"
            textAnchor={v.ta}
            style={{ font: `600 11px ${MONO}`, letterSpacing: "1.1px", fill: v.tc }}
          >
            {v.l}
          </text>
        </g>
      ))}
      {g.modules.map((m, i) => (
        <g
          key={i}
          style={{
            transform: `translate(${m.x}px,${m.y}px)`,
            opacity: m.o,
            transition: `transform 1s ${ease}, opacity .8s ${ease}`,
          }}
        >
          <rect
            x="-60"
            y="-12"
            width="120"
            height="24"
            rx="12"
            fill="rgba(6,20,14,.75)"
            stroke={m.hs}
            style={{ transition: `stroke .6s ${ease}` }}
          />
          <text
            y="3.5"
            textAnchor="middle"
            style={{ font: `600 10px ${MONO}`, letterSpacing: "1.2px", fill: "rgba(240,248,243,.72)" }}
          >
            {m.l}
          </text>
        </g>
      ))}
      <g style={{ opacity: g.offerOpacity, transition: `opacity .9s ${ease}` }}>
        <text
          x="713"
          y="486"
          textAnchor="middle"
          style={{ font: `500 26px ${DISPLAY}`, fill: "rgba(240,248,243,.95)" }}
        >
          $4.8M{" "}
          <tspan style={{ font: `600 9.5px ${MONO}`, letterSpacing: "1.4px", fill: "rgba(240,248,243,.45)" }}>
            HEADLINE PRICE
          </tspan>
        </text>
        <text
          x="713"
          y="508"
          textAnchor="middle"
          style={{ font: `600 11px ${MONO}`, letterSpacing: ".8px", fill: "#4CE27E" }}
        >
          $3.6M CASH AT CLOSING
        </text>
      </g>
      <g style={{ transform: `translate(${HERO_CX}px,${HERO_CY}px)` }}>
        <circle r="64" fill="none" stroke="#EAF4EC" strokeOpacity=".35" />
        <circle
          r="52"
          fill="none"
          stroke="#EAF4EC"
          strokeOpacity=".18"
          strokeDasharray="2 6"
          className="animate-dash-fast motion-reduce:animate-none"
        />
        <line x1="0" y1="-64" x2="0" y2="-52" stroke="#EAF4EC" strokeOpacity=".4" />
        <line x1="0" y1="64" x2="0" y2="52" stroke="#EAF4EC" strokeOpacity=".4" />
        <line x1="-64" y1="0" x2="-52" y2="0" stroke="#EAF4EC" strokeOpacity=".4" />
        <line x1="64" y1="0" x2="52" y2="0" stroke="#EAF4EC" strokeOpacity=".4" />
        <circle r="19" fill="url(#hlSeal)" />
        <circle r="19" fill="none" stroke="#AEB4AC" strokeWidth="1.4" />
        <circle r="3" fill="#4CE27E" />
        <text
          y="90"
          textAnchor="middle"
          style={{ font: `600 11px ${MONO}`, letterSpacing: "1.8px", fill: "rgba(240,248,243,.72)" }}
        >
          YOUR BUSINESS
        </text>
      </g>
    </svg>
  )
}

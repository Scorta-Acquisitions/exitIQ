"use client"

import React from "react"

// ── Spring physics hook ───────────────────────────────────────────────────────
export function useSpring(target: number, stiffness = 0.09, damping = 0.78): number {
  const [val, setVal] = React.useState(target)
  const ref = React.useRef({ cur: target, vel: 0, raf: 0 })

  React.useEffect(() => {
    const tick = () => {
      const { cur, vel } = ref.current
      const force = (target - cur) * stiffness
      const newVel = (vel + force) * damping
      const newCur = cur + newVel
      ref.current = { cur: newCur, vel: newVel, raf: 0 }
      setVal(newCur)
      if (Math.abs(target - newCur) > 0.15) {
        ref.current.raf = requestAnimationFrame(tick)
      } else {
        setVal(target)
      }
    }
    cancelAnimationFrame(ref.current.raf)
    ref.current.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current.raf)
  }, [target, stiffness, damping])

  return val
}

// ── SignalOrb ─────────────────────────────────────────────────────────────────
const ORB_GRADS = [
  "radial-gradient(circle at 38% 36%, rgba(167,229,211,.95) 0%, rgba(200,184,224,.65) 42%, rgba(168,200,232,.3) 68%, transparent 85%)",
  "radial-gradient(circle at 40% 34%, rgba(167,229,211,1) 0%, rgba(200,184,224,.82) 40%, rgba(244,197,168,.38) 68%, transparent 85%)",
  "radial-gradient(circle at 37% 38%, rgba(168,200,232,.95) 0%, rgba(167,229,211,.72) 42%, rgba(200,184,224,.38) 68%, transparent 85%)",
  "radial-gradient(circle at 40% 36%, rgba(200,184,224,.95) 0%, rgba(168,200,232,.82) 40%, rgba(167,229,211,.38) 68%, transparent 85%)",
  "radial-gradient(circle at 38% 36%, rgba(167,229,211,1) 0%, rgba(200,184,224,.92) 35%, rgba(168,200,232,.58) 65%, transparent 82%)",
  "radial-gradient(circle at 42% 34%, rgba(244,197,168,.9) 0%, rgba(167,229,211,.75) 40%, rgba(200,184,224,.4) 68%, transparent 85%)",
  "radial-gradient(circle at 38% 36%, rgba(168,200,232,.95) 0%, rgba(167,229,211,.8) 38%, rgba(244,197,168,.35) 65%, transparent 83%)",
]

interface SignalOrbProps {
  phase: number
  size?: number
  active?: boolean
}

export function SignalOrb({ phase, size = 120, active = false }: SignalOrbProps) {
  const duration = active ? "1.4s" : "3.2s"
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: ORB_GRADS[phase % ORB_GRADS.length],
        animation: `orbBreathe ${duration} ease-in-out infinite, orbGlow ${duration} ease-in-out infinite`,
        filter: active ? "blur(.5px) brightness(1.25)" : "blur(.5px)",
        flexShrink: 0,
        position: "relative",
        transition: "background 1.4s ease, filter .4s ease",
        boxShadow: active ? "0 0 60px 20px rgba(167,229,211,.28), 0 0 120px 40px rgba(200,184,224,.15)" : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "18%",
          width: "28%",
          height: "18%",
          borderRadius: "50%",
          background: "rgba(255,255,255,.55)",
          filter: "blur(3px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: "58%",
          width: "14%",
          height: "14%",
          borderRadius: "50%",
          background: "rgba(255,255,255,.35)",
          filter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "22%",
          right: "24%",
          width: "8%",
          height: "8%",
          borderRadius: "50%",
          background: "rgba(255,255,255,.2)",
          filter: "blur(1px)",
        }}
      />
    </div>
  )
}

// ── RadarRings ────────────────────────────────────────────────────────────────
export function RadarRings({ active }: { active: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: `1px solid rgba(167,229,211,${active ? 0.6 : 0.22})`,
            animation: `radarPulse ${2.0 + i * 0.5}s ${i * 0.45}s ease-out infinite`,
            transition: "border-color .6s ease",
          }}
        />
      ))}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(167,229,211,.95)",
          boxShadow: "0 0 14px 5px rgba(167,229,211,.7)",
          animation: "glowDot 2.4s ease-in-out infinite",
        }}
      />
    </div>
  )
}

// ── AIInsight ─────────────────────────────────────────────────────────────────
export function AIInsight({ text }: { text: string }) {
  return (
    <div
      style={{
        background: "rgba(167,229,211,.055)",
        border: "1px solid rgba(167,229,211,.2)",
        borderRadius: 14,
        padding: "14px 18px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        boxShadow: "0 0 28px rgba(167,229,211,.08)",
        animation: "slideRight .55s cubic-bezier(.34,1.2,.64,1)",
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#a7e5d3",
          flexShrink: 0,
          marginTop: 6,
          boxShadow: "0 0 8px rgba(167,229,211,.9)",
          animation: "liveBlink 2.4s ease-in-out infinite",
        }}
      />
      <div
        style={{
          fontSize: 13,
          fontWeight: 400,
          color: "var(--t2)",
          lineHeight: 1.62,
          letterSpacing: ".13px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {text}
      </div>
    </div>
  )
}

// ── ProcessingDots ────────────────────────────────────────────────────────────
export function ProcessingDots({ label = "AI processing signal…" }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, animation: "fadeIn .3s ease" }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#a7e5d3",
              animation: `dotBounce .9s ${i * 0.18}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: 12,
          color: "rgba(167,229,211,.72)",
          fontWeight: 500,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ── Ripple ────────────────────────────────────────────────────────────────────
interface RippleProps {
  x: number
  y: number
  onDone: () => void
}

export function Ripple({ x, y, onDone }: RippleProps) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 950)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      {[
        { size: "160vmax", color: "rgba(167,229,211,.28)", delay: 0 },
        { size: "100vmax", color: "rgba(200,184,224,.18)", delay: 120 },
        { size: "60vmax", color: "rgba(168,200,232,.14)", delay: 200 },
      ].map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: r.size,
            height: r.size,
            borderRadius: "50%",
            border: `1px solid ${r.color}`,
            animation: `rippleOut .9s ${r.delay}ms cubic-bezier(.2,.8,.4,1) forwards`,
          }}
        />
      ))}
    </div>
  )
}

// ── ConfidenceMeter ───────────────────────────────────────────────────────────
export function ConfidenceMeter({ value }: { value: number }) {
  const disp = useSpring(value, 0.06, 0.82)
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(disp, 100) / 100)
  const color = disp > 70 ? "#10b981" : disp > 40 ? "#a7e5d3" : "#a8c8e8"
  const label =
    disp === 0
      ? "Awaiting input"
      : disp < 25
        ? "Calibrating…"
        : disp < 50
          ? "Signal detected"
          : disp < 75
            ? "Pattern matched"
            : "High confidence"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".96px",
          textTransform: "uppercase",
          color: "var(--t3)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        AI Confidence
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <svg width={88} height={88} viewBox="0 0 88 88">
          <circle cx={44} cy={44} r={r} fill="none" stroke="var(--s1)" strokeWidth={5} />
          <circle
            cx={44}
            cy={44}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 44 44)"
            style={{
              transition: "stroke-dashoffset 1.4s cubic-bezier(.34,1.1,.64,1), stroke .8s ease",
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
          <text
            x={44}
            y={44}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--t1)"
            fontSize={15}
            fontWeight={500}
            fontFamily="Inter"
          >
            {Math.round(disp)}%
          </text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--t3)",
              lineHeight: 1.5,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {label}
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: i < Math.floor(disp / 20) ? color : "var(--s1)",
                  boxShadow: i < Math.floor(disp / 20) ? `0 0 8px ${color}` : "none",
                  transition: "background .7s ease, box-shadow .7s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ScanLine ──────────────────────────────────────────────────────────────────
export function ScanLine({ speed = 3.5 }: { speed?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        pointerEvents: "none",
        background: "linear-gradient(90deg,transparent,var(--scan-color),transparent)",
        animation: `scanDown ${speed}s linear infinite`,
      }}
    />
  )
}

// ── LiveBadge ─────────────────────────────────────────────────────────────────
export function LiveBadge({ label = "Live Analysis" }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#a7e5d3",
          boxShadow: "0 0 8px rgba(167,229,211,.85)",
          animation: "liveBlink 2s ease-in-out infinite",
        }}
      />
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".96px",
          textTransform: "uppercase",
          color: "var(--t3)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {label}
      </div>
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider() {
  return <div style={{ height: 1, background: "var(--div)", flexShrink: 0 }} />
}

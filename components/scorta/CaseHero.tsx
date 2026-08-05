"use client"

import { useRouter } from "next/navigation"
import React from "react"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

// ── Timing reference ───────────────────────────────────────────────────────
// All timings tuned to the brief: agents think, then speak.
const T = {
  charDelayMs: 40, // typewriter
  greetingStartMs: 600, // pause before greeting starts typing
  subheadDelayMs: 400, // after greeting completes
  subheadFadeMs: 360,
  bodyDelayMs: 300, // after sub-heading appears
  bodyFadeMs: 360,
  stepCascadeMs: 250, // between steps
  stepRevealMs: 360,
  ctaRevealDelayMs: 220, // after last step lands
  statusOneMs: 800,
  statusTwoMs: 600,
  resultRevealMs: 320,
}

type Step = {
  title: string
  agent: string
  body: string
}

export type CaseHeroProps = {
  firstName: string
  greeting: string
  subheading: string
  body: string
  steps: [Step, Step, Step]
  ctaLabel: string
  /** Where the user is sent after the status flow completes. */
  nextHref: string
  /** What we tell the user we're unlocking — appears in the final result line. */
  nextLabel: string
}

export function CaseHero(props: CaseHeroProps) {
  const router = useRouter()

  // ── Cascade state machine ──────────────────────────────────────────
  const [greetingDone, setGreetingDone] = React.useState(false)
  const [subheadIn, setSubheadIn] = React.useState(false)
  const [bodyIn, setBodyIn] = React.useState(false)
  const [stepsIn, setStepsIn] = React.useState<number>(-1) // index of last step revealed
  const [ctaIn, setCtaIn] = React.useState(false)

  // Drive cascade once greeting completes
  React.useEffect(() => {
    if (!greetingDone) return
    const timers: Array<ReturnType<typeof setTimeout>> = []
    timers.push(setTimeout(() => setSubheadIn(true), T.subheadDelayMs))
    timers.push(setTimeout(() => setBodyIn(true), T.subheadDelayMs + T.bodyDelayMs))
    const stepsStart = T.subheadDelayMs + T.bodyDelayMs + T.bodyFadeMs
    for (let i = 0; i < props.steps.length; i++) {
      timers.push(setTimeout(() => setStepsIn((cur) => Math.max(cur, i)), stepsStart + i * T.stepCascadeMs))
    }
    timers.push(
      setTimeout(
        () => setCtaIn(true),
        stepsStart + props.steps.length * T.stepCascadeMs + T.ctaRevealDelayMs
      )
    )
    return () => timers.forEach(clearTimeout)
  }, [greetingDone, props.steps.length])

  // ── CTA → status flow → navigate ───────────────────────────────────
  const [ctaPhase, setCtaPhase] = React.useState<"idle" | "review" | "prepare" | "ready">("idle")

  function onCtaClick() {
    if (ctaPhase !== "idle") return
    setCtaPhase("review")
    setTimeout(() => setCtaPhase("prepare"), T.statusOneMs)
    setTimeout(() => setCtaPhase("ready"), T.statusOneMs + T.statusTwoMs)
    setTimeout(() => {
      router.push(props.nextHref)
    }, T.statusOneMs + T.statusTwoMs + T.resultRevealMs)
  }

  return (
    <section
      className="case-hero"
      style={{
        position: "relative",
        padding: "32px 36px 30px",
        borderRadius: 22,
        background: "rgba(255,255,255,.78)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.05) inset, 0 12px 36px rgba(12,10,9,.06), 0 2px 6px rgba(12,10,9,.03)",
        overflow: "hidden",
        animation: "caseHeroIn .55s cubic-bezier(.2,.7,.2,1)",
      }}
    >
      <ScopedStyles />

      <div style={{ display: "flex", gap: 28, alignItems: "stretch", minHeight: 280 }}>
        {/* ── Left rail: globe + CASE orb ───────────────────────────── */}
        <div
          style={{
            width: 200,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 18,
            paddingTop: 4,
          }}
        >
          <Globe />
          <CaseOrb />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 10.5,
                color: "var(--t2)",
                letterSpacing: ".8px",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              CASE
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--t3)",
                marginTop: 2,
                fontFamily: inter,
              }}
            >
              Case Manager · online
            </div>
          </div>
        </div>

        {/* ── Right rail: copy + steps + CTA ────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {/* Greeting */}
          <h1
            style={{
              fontFamily: garamond,
              fontWeight: 400,
              fontSize: 38,
              lineHeight: 1.08,
              letterSpacing: "-.6px",
              color: "var(--t1)",
              marginBottom: 14,
              minHeight: 42,
            }}
          >
            <Typewriter
              text={props.greeting}
              charDelay={T.charDelayMs}
              startDelay={T.greetingStartMs}
              onDone={() => setGreetingDone(true)}
            />
          </h1>

          {/* Sub-heading */}
          <FadeBlock visible={subheadIn} duration={T.subheadFadeMs}>
            <p
              style={{
                fontFamily: inter,
                fontSize: 14.5,
                lineHeight: 1.6,
                color: "var(--t1)",
                fontWeight: 500,
                marginBottom: 12,
                maxWidth: 620,
              }}
            >
              {props.subheading}
            </p>
          </FadeBlock>

          {/* Body */}
          <FadeBlock visible={bodyIn} duration={T.bodyFadeMs}>
            <p
              style={{
                fontFamily: inter,
                fontSize: 13.5,
                lineHeight: 1.65,
                color: "var(--t2)",
                marginBottom: 22,
                maxWidth: 620,
              }}
            >
              {props.body}
            </p>
          </FadeBlock>

          {/* Steps */}
          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 22px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {props.steps.map((s, i) => (
              <StepRow
                key={s.title}
                idx={i + 1}
                step={s}
                visible={stepsIn >= i}
                duration={T.stepRevealMs}
              />
            ))}
          </ol>

          {/* CTA + status */}
          <FadeBlock visible={ctaIn} duration={300}>
            <CtaCluster
              label={props.ctaLabel}
              nextLabel={props.nextLabel}
              phase={ctaPhase}
              onClick={onCtaClick}
            />
          </FadeBlock>
        </div>
      </div>
    </section>
  )
}

// ── Typewriter ────────────────────────────────────────────────────────────
function Typewriter({
  text,
  charDelay,
  startDelay,
  onDone,
}: {
  text: string
  charDelay: number
  startDelay: number
  onDone?: () => void
}) {
  const [n, setN] = React.useState(0)
  const onDoneRef = React.useRef(onDone)
  onDoneRef.current = onDone

  React.useEffect(() => {
    setN(0)
    const raf = 0
    let mounted = true
    const timers: Array<ReturnType<typeof setTimeout>> = []
    const start = setTimeout(() => {
      const step = (i: number) => {
        if (!mounted) return
        setN(i)
        if (i < text.length) {
          timers.push(setTimeout(() => step(i + 1), charDelay))
        } else {
          onDoneRef.current?.()
        }
      }
      step(1)
    }, startDelay)
    timers.push(start)
    return () => {
      mounted = false
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
    }
  }, [text, charDelay, startDelay])

  return (
    <>
      <span>{text.slice(0, n)}</span>
      {n < text.length && (
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: ".5em",
            height: "1em",
            verticalAlign: "-.12em",
            marginLeft: "2px",
            background: "var(--mint, #2c8c70)",
            opacity: 0.65,
            animation: "caseCaret 1s steps(1,end) infinite",
          }}
        />
      )}
    </>
  )
}

// ── Fade block (used for cascade reveals) ─────────────────────────────────
function FadeBlock({
  visible,
  duration,
  children,
}: {
  visible: boolean
  duration: number
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}

// ── Step row ──────────────────────────────────────────────────────────────
function StepRow({
  idx,
  step,
  visible,
  duration,
}: {
  idx: number
  step: Step
  visible: boolean
  duration: number
}) {
  return (
    <li
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,.7)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          flexShrink: 0,
          background: "rgba(12,10,9,.05)",
          color: "var(--t1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: mono,
          fontSize: 11,
          fontWeight: 600,
          marginTop: 1,
        }}
      >
        {idx}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--t1)",
              fontFamily: inter,
            }}
          >
            {step.title}
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 10.5,
              color: "var(--t3)",
              letterSpacing: ".4px",
              textTransform: "uppercase",
            }}
          >
            {step.agent}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.5 }}>{step.body}</div>
      </div>
    </li>
  )
}

// ── CTA cluster ───────────────────────────────────────────────────────────
function CtaCluster({
  label,
  nextLabel,
  phase,
  onClick,
}: {
  label: string
  nextLabel: string
  phase: "idle" | "review" | "prepare" | "ready"
  onClick: () => void
}) {
  const working = phase === "review" || phase === "prepare"
  const done = phase === "ready"
  return (
    <div>
      <button
        onClick={onClick}
        disabled={phase !== "idle"}
        className="case-cta"
        style={{
          height: 46,
          padding: "0 22px",
          background: done ? "rgba(44,140,112,.16)" : "var(--btn-bg)",
          color: done ? "var(--mint, #2c8c70)" : "var(--btn-fg)",
          border: done ? "1px solid rgba(44,140,112,.32)" : "none",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "-.1px",
          borderRadius: 9999,
          cursor: phase === "idle" ? "pointer" : "default",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          fontFamily: inter,
          boxShadow: done ? "none" : "0 6px 22px rgba(12,10,9,.18)",
          transition:
            "transform 180ms ease-out, box-shadow 180ms ease-out, background 180ms ease-out, color 180ms ease-out",
        }}
      >
        {working && <Spinner />}
        {done && (
          <svg width={13} height={13} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6.4L4.6 9 10 3.4" />
          </svg>
        )}
        <span>
          {phase === "idle" && label}
          {working && "CASE is working…"}
          {done && "Unlocked"}
        </span>
        {phase === "idle" && <span style={{ transform: "translateY(-1px)" }}>→</span>}
      </button>

      {/* Status bar */}
      <div
        style={{
          marginTop: 12,
          minHeight: 22,
          fontSize: 12,
          color: "var(--t3)",
          fontFamily: inter,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <StatusLine phase={phase} nextLabel={nextLabel} />
      </div>
    </div>
  )
}

function StatusLine({
  phase,
  nextLabel,
}: {
  phase: "idle" | "review" | "prepare" | "ready"
  nextLabel: string
}) {
  let text = ""
  let color = "var(--t3)"
  if (phase === "review") text = "CASE is reviewing your profile…"
  if (phase === "prepare") text = "Preparing your next step…"
  if (phase === "ready") {
    text = `${nextLabel} is ready — opening now.`
    color = "var(--mint, #2c8c70)"
  }

  return (
    <span
      key={phase}
      style={{
        color,
        opacity: text ? 1 : 0,
        transition: "opacity 220ms ease-out, color 220ms ease-out",
        animation: text ? "caseStatusFade .28s ease-out" : "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
      }}
    >
      {phase !== "idle" && phase !== "ready" && <DotPulse />}
      {phase === "ready" && (
        <svg width={11} height={11} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="4.5" />
          <path d="M4 6.2L5.6 7.8 8 4.8" />
        </svg>
      )}
      {text}
    </span>
  )
}

function DotPulse() {
  return (
    <span
      aria-hidden
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "var(--mint, #2c8c70)",
        animation: "caseStatusDot 1s ease-in-out infinite",
      }}
    />
  )
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 13,
        height: 13,
        borderRadius: "50%",
        border: "2px solid rgba(245,245,245,.35)",
        borderTopColor: "var(--btn-fg)",
        animation: "spin .8s linear infinite",
      }}
    />
  )
}

// ── CASE orb (avatar) ─────────────────────────────────────────────────────
function CaseOrb() {
  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        width: 28,
        height: 28,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 38%, rgba(44,140,112,.95) 100%)",
        boxShadow: "0 0 12px rgba(44,140,112,.55), inset 0 -3px 6px rgba(0,0,0,.18)",
        animation: "caseOrbBreathe 3.2s ease-in-out infinite",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          border: "1px solid rgba(44,140,112,.35)",
          animation: "caseOrbRing 3.2s ease-in-out infinite",
        }}
      />
    </div>
  )
}

// ── Globe ─────────────────────────────────────────────────────────────────
function Globe() {
  return (
    <div className="case-globe-wrap" aria-hidden style={{ width: 132, height: 132, position: "relative" }}>
      <svg viewBox="-50 -50 100 100" width="132" height="132" style={{ overflow: "visible", display: "block" }}>
        <defs>
          <radialGradient id="caseSphereFill" cx="0.35" cy="0.32" r="0.7">
            <stop offset="0%" stopColor="rgba(255,255,255,.4)" />
            <stop offset="55%" stopColor="rgba(167,229,211,.12)" />
            <stop offset="100%" stopColor="rgba(44,140,112,0)" />
          </radialGradient>
          <radialGradient id="caseSphereGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="55%" stopColor="rgba(44,140,112,0)" />
            <stop offset="100%" stopColor="rgba(44,140,112,.16)" />
          </radialGradient>
        </defs>

        {/* outer glow */}
        <circle r="48" fill="url(#caseSphereGlow)" />
        {/* sphere fill */}
        <circle r="42" fill="url(#caseSphereFill)" />

        {/* latitude lines */}
        <ellipse rx="42" ry="6" fill="none" stroke="rgba(44,140,112,.18)" strokeWidth=".4" />
        <ellipse rx="42" ry="20" fill="none" stroke="rgba(44,140,112,.16)" strokeWidth=".4" />
        <ellipse rx="42" ry="32" fill="none" stroke="rgba(44,140,112,.13)" strokeWidth=".4" />

        {/* equator highlight */}
        <line x1="-42" y1="0" x2="42" y2="0" stroke="rgba(44,140,112,.24)" strokeWidth=".4" />

        {/* meridians — staggered rx animation creates a believable rotation */}
        <g className="case-globe-meridians">
          <ellipse className="m m0" ry="42" rx="42" fill="none" stroke="rgba(44,140,112,.42)" strokeWidth=".55" />
          <ellipse className="m m1" ry="42" rx="42" fill="none" stroke="rgba(44,140,112,.36)" strokeWidth=".5" />
          <ellipse className="m m2" ry="42" rx="42" fill="none" stroke="rgba(44,140,112,.30)" strokeWidth=".5" />
          <ellipse className="m m3" ry="42" rx="42" fill="none" stroke="rgba(44,140,112,.24)" strokeWidth=".5" />
          <ellipse className="m m4" ry="42" rx="42" fill="none" stroke="rgba(44,140,112,.18)" strokeWidth=".5" />
        </g>

        {/* sphere outline */}
        <circle r="42" fill="none" stroke="rgba(44,140,112,.36)" strokeWidth=".7" />

        {/* specular highlight */}
        <ellipse cx="-12" cy="-14" rx="9" ry="5" fill="rgba(255,255,255,.18)" />

        {/* pulsing data points */}
        <g className="case-globe-dot">
          <circle cx="6" cy="-18" r="1.6" fill="var(--mint, #2c8c70)" />
        </g>
        <g className="case-globe-dot dot-b">
          <circle cx="-20" cy="8" r="1.2" fill="var(--mint, #2c8c70)" />
        </g>
      </svg>
    </div>
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes caseHeroIn {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes caseCaret {
        50% { opacity: 0; }
      }
      @keyframes caseOrbBreathe {
        0%, 100% { transform: scale(1); }
        50%      { transform: scale(1.06); }
      }
      @keyframes caseOrbRing {
        0%, 100% { opacity: .35; transform: scale(1); }
        50%      { opacity: .9;  transform: scale(1.18); }
      }
      @keyframes caseStatusDot {
        0%, 100% { transform: scale(1);   opacity: 1;  }
        50%      { transform: scale(1.4); opacity: .55; }
      }
      @keyframes caseStatusFade {
        from { opacity: 0; transform: translateY(2px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* Rotating-sphere effect: each meridian ellipse animates its rx
         (and stroke opacity to fade meridians near the silhouette edge),
         staggered so the surface appears to rotate ~30s/turn. */
      @keyframes caseGlobeMeridian {
        0%   { rx: 42px; opacity: .95; }
        20%  { rx: 24px; opacity: .80; }
        40%  { rx: 4px;  opacity: .35; }
        50%  { rx: 0px;  opacity: .15; }
        60%  { rx: 4px;  opacity: .35; }
        80%  { rx: 24px; opacity: .80; }
        100% { rx: 42px; opacity: .95; }
      }
      .case-globe-meridians .m { animation: caseGlobeMeridian 30s linear infinite; transform-box: fill-box; }
      .case-globe-meridians .m0 { animation-delay:  0s; }
      .case-globe-meridians .m1 { animation-delay: -6s; }
      .case-globe-meridians .m2 { animation-delay: -12s; }
      .case-globe-meridians .m3 { animation-delay: -18s; }
      .case-globe-meridians .m4 { animation-delay: -24s; }

      .case-globe-dot { animation: caseStatusDot 1.8s ease-in-out infinite; }
      .case-globe-dot.dot-b { animation-delay: -.9s; }

      .case-cta:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 28px rgba(12,10,9,.22);
      }
    `}</style>
  )
}

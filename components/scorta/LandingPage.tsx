// use client: interactive nav scroll state, industry switcher, boardroom toggles, scroll-reveal observer
"use client"

import Link from "next/link"
import React from "react"
import { ExitIQApp } from "@/components/exitiq/ExitIQApp"

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  canvas: "#f5f5f5",
  canvasSoft: "#fafafa",
  card: "#ffffff",
  ink: "#0c0a09",
  ink2: "#292524",
  body: "#4e4e4e",
  muted: "#777169",
  mutedSoft: "#a8a29e",
  hairline: "#e7e5e4",
  hairlineStrong: "#d6d3d1",
  strong: "#f0efed",
  mint: "#a7e5d3",
  peach: "#f4c5a8",
  lav: "#c8b8e0",
  sky: "#a8c8e8",
  dark: "#0c0a09",
  onDark: "rgba(245,245,245,.95)",
  onDarkBody: "rgba(245,245,245,.55)",
  onDarkMuted: "rgba(245,245,245,.45)",
  onDarkHair: "rgba(245,245,245,.08)",
}

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"

// ─── Shared CSS (injected once) ───────────────────────────────────────────────
const SHARED_CSS = `
  /* Scroll-reveal */
  .s-rv { opacity: 0; transform: translateY(22px); transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); }
  .s-rv.s-in { opacity: 1; transform: translateY(0); }
  .s-d1 { transition-delay: .08s; }
  .s-d2 { transition-delay: .16s; }
  .s-d3 { transition-delay: .24s; }

  /* Dark glass panel */
  .s-glass {
    background: rgba(245,245,245,.055);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    border: 1px solid rgba(245,245,245,.12);
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.07);
  }

  /* Card hover lifts */
  .s-ch  { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s, border-color .35s; will-change: transform; }
  .s-ch:hover  { transform: translateY(-4px); box-shadow: 0 18px 48px rgba(12,10,9,.08), 0 4px 14px rgba(12,10,9,.04); border-color: #d6d3d1 !important; }
  .s-chd { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s; will-change: transform; }
  .s-chd:hover { transform: translateY(-4px); box-shadow: 0 24px 60px rgba(0,0,0,.45), 0 0 40px rgba(167,229,211,.12); }

  /* Marquee */
  .s-mq  { display: flex; gap: 64px; width: max-content; animation: sTickerSlide 40s linear infinite; }
  .s-mqf { -webkit-mask-image: linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent); mask-image: linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent); }

  /* Animated SVG arc */
  .s-carc { transition: stroke-dashoffset 1.4s cubic-bezier(.34,1.1,.64,1); }

  /* Keyframes */
  @keyframes sOrbBreathe  { 0%,100%{transform:scale(1);opacity:.85}    50%{transform:scale(1.07);opacity:1} }
  @keyframes sOrbGlow     { 0%,100%{box-shadow:0 0 40px 12px rgba(167,229,211,.18),0 0 80px 30px rgba(200,184,224,.1)} 50%{box-shadow:0 0 60px 22px rgba(167,229,211,.32),0 0 120px 50px rgba(200,184,224,.18)} }
  @keyframes sChipFloat   { from{opacity:0;transform:translateY(14px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes sSlideUp     { from{opacity:0;transform:translateY(18px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes sSlideRight  { from{opacity:0;transform:translateX(22px)}  to{opacity:1;transform:translateX(0)} }
  @keyframes sFadeIn      { from{opacity:0}                              to{opacity:1} }
  @keyframes sScanDown    { 0%{top:0;opacity:.7}                         100%{top:100%;opacity:0} }
  @keyframes sLiveBlink   { 0%,100%{opacity:1}                           50%{opacity:.3} }
  @keyframes sDotBounce   { 0%,80%,100%{transform:translateY(0)}        40%{transform:translateY(-5px)} }
  @keyframes sOrbFloat1   { 0%,100%{transform:translate(0,0) scale(1)}  33%{transform:translate(-12px,-22px) scale(1.05)} 66%{transform:translate(10px,12px) scale(.96)} }
  @keyframes sOrbFloat2   { 0%,100%{transform:translate(0,0) scale(1)}  50%{transform:translate(20px,-18px) scale(1.04)} }
  @keyframes sOrbFloat3   { 0%,100%{transform:translate(0,0)}           50%{transform:translate(-16px,18px)} }
  @keyframes sDrift       { 0%,100%{transform:translate(-50%,-50%)}     50%{transform:translate(-50%,calc(-50% - 10px))} }
  @keyframes sTickerSlide { from{transform:translateX(0)}               to{transform:translateX(-50%)} }
  @keyframes sRingSpin    { from{transform:rotate(0)}                    to{transform:rotate(360deg)} }
  @keyframes sNumRoll     { from{opacity:0;transform:translateY(-10px)}  to{opacity:1;transform:translateY(0)} }
`

// ─── Mobile hook ─────────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    setMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [breakpoint])
  return mobile
}

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll(".s-rv")
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("s-in")
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1100) {
  const [val, setVal] = React.useState(0)
  React.useEffect(() => {
    setVal(0)
    let raf: number
    let start: number | undefined
    const step = (ts: number) => {
      if (!start) start = ts
      const t = Math.min(1, (ts - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(target * eased)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

// ─── Spring hook (for confidence arc) ────────────────────────────────────────
function useSpring(target: number) {
  const [val, setVal] = React.useState(target)
  const ref = React.useRef({ cur: target, vel: 0, raf: 0 })
  React.useEffect(() => {
    const tick = () => {
      const { cur, vel } = ref.current
      const force = (target - cur) * 0.09
      const newVel = (vel + force) * 0.78
      const newCur = cur + newVel
      ref.current = { cur: newCur, vel: newVel, raf: 0 }
      setVal(Math.round(newCur * 10) / 10)
      if (Math.abs(target - newCur) > 0.3) ref.current.raf = requestAnimationFrame(tick)
    }
    cancelAnimationFrame(ref.current.raf)
    ref.current.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current.raf)
  }, [target])
  return val
}

// ─── WebGL fluid background for teaser card ───────────────────────────────────
type WebGLControls = { setConf: (v: number) => void; cleanup: () => void }
function setupTeaserWebGL(canvas: HTMLCanvasElement): WebGLControls {
  const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "high-performance" })
  if (!gl) return { setConf: () => {}, cleanup: () => {} }

  const vs = `attribute vec2 p; void main(){gl_Position=vec4(p,0,1);}`
  const fs = `precision mediump float;
    uniform float T; uniform vec2 R; uniform float C;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.1+vec2(3.7,1.9);a*=.5;}return v;}
    void main(){
      vec2 uv=gl_FragCoord.xy/R,st=vec2(uv.x*R.x/R.y,uv.y),t=vec2(T*.08,T*.06);
      vec2 q=vec2(fbm(st*1.5+t),fbm(st*1.5+vec2(5.2,1.3)+t*.9));
      vec2 r=vec2(fbm(st+2.*q+vec2(1.7,9.2)+t*.7),fbm(st+2.*q+vec2(8.3,2.8)+t*.6));
      float f=fbm(st+2.8*r+t*.4);
      vec3 base=vec3(.047,.039,.035);
      vec3 col=mix(base,vec3(.10,.32,.26),smoothstep(.2,.75,f)*.7);
      col=mix(col,vec3(.22,.17,.38),smoothstep(.45,.9,f)*.55);
      col=mix(col,vec3(.10,.22,.40),smoothstep(.6,1.,f)*.45);
      col=mix(col,col+vec3(.06,.02,-.04)*C,C);
      col*=1.+C*.18;
      vec2 vg=uv*2.-1.; col*=1.-dot(vg,vg)*(.45-.18*C);
      gl_FragColor=vec4(col,1.);
    }`

  const mkShader = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vs))
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(prog)
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, "p")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const uT = gl.getUniformLocation(prog, "T")!
  const uR = gl.getUniformLocation(prog, "R")!
  const uC = gl.getUniformLocation(prog, "C")!
  gl.uniform1f(uC, 0)

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uR, canvas.width, canvas.height)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  const t0 = performance.now()
  let raf: number
  const loop = () => {
    gl.uniform1f(uT, (performance.now() - t0) / 1000)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    raf = requestAnimationFrame(loop)
  }
  loop()
  return {
    setConf: (v: number) => gl.uniform1f(uC, Math.min(Math.max(v, 0), 1)),
    cleanup: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    },
  }
}

// ─── Teaser data ──────────────────────────────────────────────────────────────
const TEASER_QUESTIONS = [
  { q: "What kind of business do you own?", chips: ["HVAC", "Plumbing", "Landscaping", "Auto Repair", "Cleaning", "Other"] },
  { q: "What is your annual revenue?", chips: ["Under $500K", "$500K – $1M", "$1M – $3M", "$3M – $7M", "$7M+"] },
  { q: "How long have you been operating?", chips: ["Under 5 years", "5 – 10 years", "10 – 20 years", "20+ years"] },
  { q: "What is your owner earnings (SDE) margin?", chips: ["Under 10%", "10 – 20%", "20 – 30%", "30%+"] },
]

const TEASER_INSIGHTS = [
  [
    "HVAC commands 2.6× SDE on average. SBA buyers active in this band.",
    "Plumbing rolls up well — strategic acquirers actively consolidating.",
    "Landscaping buyers prize recurring contracts. Recurring share matters.",
    "Auto repair: location and licenses drive multiple compression.",
    "Cleaning is a hot rollup category right now.",
    "Diversified profile — multiple frameworks apply.",
  ],
  [
    "Sub-$500K narrows the buyer pool. Individual searchers dominate this band.",
    "Sweet spot for SBA-backed searchers. Active demand.",
    "$1–3M is the densest deal band on Main Street. Strong buyer competition.",
    "Lower middle-market: PE-backed acquirers are now in scope.",
    "Strategic buyers and rollups compete actively in this range.",
  ],
  [
    "Early-stage may discount value. Growth story becomes the lead asset.",
    "5–10 years shows operational proof. Buyers will model retention.",
    "Operational maturity — a meaningful multiple driver.",
    "20+ years signals durable demand. Premium multiples likely.",
  ],
  [
    "Sub-10% SDE margin — buyers will model an operational upside story.",
    "10–20% SDE puts you in the competitive band for SBA exits.",
    "Above 20% signals premium quality. Top-tier buyers prioritize this.",
    "Exceptional margins — premium exit multiples in scope.",
  ],
]

const TEASER_DASH = [
  { conf: 0, val: null as string | null, fee: null as string | null, mult: null as string | null },
  { conf: 24, val: null, fee: null, mult: "2 – 4×" },
  { conf: 50, val: "$760K – $1.9M", fee: "~$84K", mult: "2.8×" },
  { conf: 74, val: "$1.1M – $2.4M", fee: "~$152K", mult: "3.2×" },
  { conf: 91, val: "$1.4M – $2.1M", fee: "$176K", mult: "3.5×" },
]

// ─── Teaser sub-components ────────────────────────────────────────────────────
function TeaserSignalOrb({ phase }: { phase: number }) {
  const grads = [
    "radial-gradient(circle at 38% 36%, rgba(167,229,211,.95) 0%, rgba(200,184,224,.65) 42%, rgba(168,200,232,.3) 68%, transparent 85%)",
    "radial-gradient(circle at 40% 34%, rgba(167,229,211,1) 0%, rgba(200,184,224,.8) 40%, rgba(244,197,168,.35) 68%, transparent 85%)",
    "radial-gradient(circle at 37% 38%, rgba(168,200,232,.95) 0%, rgba(167,229,211,.7) 42%, rgba(200,184,224,.35) 68%, transparent 85%)",
    "radial-gradient(circle at 40% 36%, rgba(200,184,224,.95) 0%, rgba(168,200,232,.8) 40%, rgba(167,229,211,.35) 68%, transparent 85%)",
    "radial-gradient(circle at 38% 36%, rgba(167,229,211,1) 0%, rgba(200,184,224,.9) 35%, rgba(168,200,232,.55) 65%, transparent 82%)",
  ]
  return (
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: "50%",
        background: grads[phase % grads.length],
        animation: "sOrbBreathe 3.2s ease-in-out infinite, sOrbGlow 3.2s ease-in-out infinite",
        flexShrink: 0,
        position: "relative",
        transition: "background 1.2s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "16%",
          left: "20%",
          width: "26%",
          height: "16%",
          borderRadius: "50%",
          background: "rgba(255,255,255,.55)",
          filter: "blur(3px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "24%",
          left: "58%",
          width: "12%",
          height: "12%",
          borderRadius: "50%",
          background: "rgba(255,255,255,.35)",
          filter: "blur(2px)",
        }}
      />
    </div>
  )
}

function TeaserConfMeter({ value }: { value: number }) {
  const disp = useSpring(value)
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(disp, 100) / 100)
  const color = disp > 70 ? C.mint : disp > 40 ? C.lav : C.sky
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ ...eyebrowOnDark, fontSize: 10 }}>AI Confidence</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <svg width={70} height={70} viewBox="0 0 70 70">
          <circle cx={35} cy={35} r={r} fill="none" stroke="rgba(245,245,245,.08)" strokeWidth={4.5} />
          <circle
            cx={35}
            cy={35}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 35 35)"
            className="s-carc"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
          <text
            x={35}
            y={35}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(245,245,245,.9)"
            fontSize={13}
            fontWeight={500}
            fontFamily={inter}
          >
            {Math.round(disp)}%
          </text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ fontFamily: inter, fontSize: 11, color: "rgba(245,245,245,.45)", lineHeight: 1.4 }}>
            {value === 0 ? "Awaiting input" : value < 40 ? "Calibrating…" : value < 70 ? "Pattern matched" : "High confidence"}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: i < Math.floor(value / 20) ? color : "rgba(245,245,245,.12)",
                  boxShadow: i < Math.floor(value / 20) ? `0 0 6px ${color}` : "none",
                  transition: "background .6s, box-shadow .6s",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ExitIQ teaser card (design from design files) ────────────────────────────
function ExitIQTeaser({ onComplete }: { onComplete: () => void }) {
  const isMobile = useIsMobile()
  const [phase, setPhase] = React.useState(0)
  const [answers, setAnswers] = React.useState<string[]>([])
  const [trans, setTrans] = React.useState(false)
  const [proc, setProc] = React.useState(false)
  const [insight, setInsight] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const glRef = React.useRef<WebGLControls | null>(null)

  const dash = TEASER_DASH[phase]!

  React.useEffect(() => {
    if (!canvasRef.current) return
    glRef.current = setupTeaserWebGL(canvasRef.current)
    return () => glRef.current?.cleanup()
  }, [])

  React.useEffect(() => {
    glRef.current?.setConf(TEASER_DASH[phase]!.conf / 100)
  }, [phase])

  const handleAnswer = (chip: string) => {
    if (trans) return
    setTrans(true)
    setProc(true)
    setAnswers((p) => [...p, chip])
    const idx = TEASER_QUESTIONS[phase]!.chips.indexOf(chip)
    const text = TEASER_INSIGHTS[phase]?.[idx] ?? TEASER_INSIGHTS[phase]?.[0] ?? ""
    setTimeout(() => {
      setProc(false)
      setInsight(text)
    }, 600)
    setTimeout(() => {
      if (phase + 1 >= TEASER_QUESTIONS.length) setDone(true)
      else setPhase((p) => p + 1)
      setTrans(false)
    }, 1250)
  }

  const currentQ = phase < TEASER_QUESTIONS.length ? TEASER_QUESTIONS[phase]! : null

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(12,10,9,.18), 0 8px 24px rgba(12,10,9,.08)",
      }}
    >
      {/* WebGL fluid background */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />

      {/* Header bar */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid rgba(245,245,245,.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: C.mint,
              boxShadow: "0 0 10px rgba(167,229,211,.9)",
              animation: "sLiveBlink 2s infinite",
            }}
          />
          <div style={{ ...eyebrow(true), fontSize: 10 }}>ExitIQ — Live Valuation Engine</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {TEASER_QUESTIONS.map((_, i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: 2,
                borderRadius: 9999,
                background: i < phase || done ? C.mint : i === phase ? "rgba(167,229,211,.5)" : "rgba(245,245,245,.12)",
                transition: "background .5s",
                boxShadow: i < phase || done ? "0 0 6px rgba(167,229,211,.6)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1.25fr) minmax(280px,.85fr)",
          gap: 0,
          minHeight: isMobile ? "auto" : 380,
        }}
      >
        {/* Left: question + chips */}
        <div style={{ padding: isMobile ? "20px 16px" : "28px", display: "flex", flexDirection: "column", gap: isMobile ? 16 : 22 }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 10 : 18 }}>
            <TeaserSignalOrb phase={phase} />
            <div>
              <div style={{ ...eyebrowOnDark, fontSize: 10, marginBottom: 4 }}>
                Step {Math.min(phase + 1, TEASER_QUESTIONS.length)} / {TEASER_QUESTIONS.length}
              </div>
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 24,
                  fontWeight: 300,
                  color: "rgba(245,245,245,.95)",
                  letterSpacing: "-.3px",
                  lineHeight: 1.2,
                }}
              >
                {done ? "Your valuation is ready." : currentQ?.q}
              </div>
            </div>
          </div>

          {!done ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                opacity: trans ? 0.55 : 1,
                transition: "opacity .25s",
              }}
            >
              {currentQ?.chips.map((c, i) => (
                <button
                  key={c + phase}
                  onClick={() => handleAnswer(c)}
                  style={{
                    padding: "10px 16px",
                    background: "rgba(245,245,245,.07)",
                    border: "1px solid rgba(245,245,245,.13)",
                    borderRadius: 9999,
                    color: "rgba(245,245,245,.82)",
                    fontFamily: inter,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all .22s cubic-bezier(.34,1.56,.64,1)",
                    animation: `sChipFloat .55s ${i * 60}ms cubic-bezier(.34,1.3,.64,1) both`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(167,229,211,.14)"
                    e.currentTarget.style.borderColor = "rgba(167,229,211,.45)"
                    e.currentTarget.style.color = C.mint
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.boxShadow = "0 0 18px rgba(167,229,211,.18)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(245,245,245,.07)"
                    e.currentTarget.style.borderColor = "rgba(245,245,245,.13)"
                    e.currentTarget.style.color = "rgba(245,245,245,.82)"
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontFamily: inter, fontSize: 14, color: "rgba(245,245,245,.55)", lineHeight: 1.6, maxWidth: 420 }}>
                We&apos;ve matched your business to live M&A market data and deal comps. Your full Gap Report includes
                buyer offer scenarios, SBA pre-screen, and a 90-day fix list.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={onComplete}
                  style={{
                    ...btnLight,
                    height: 44,
                    padding: "0 22px",
                    fontSize: 15,
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  Get my full report
                </button>
              </div>
            </div>
          )}

          {proc && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, animation: "sFadeIn .3s" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: C.mint,
                      animation: `sDotBounce .9s ${i * 0.18}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span style={{ fontFamily: inter, fontSize: 12, color: "rgba(167,229,211,.7)", fontWeight: 500 }}>
                Mapping to comps…
              </span>
            </div>
          )}

          {insight && !proc && (
            <div
              key={insight}
              style={{
                background: "rgba(167,229,211,.06)",
                border: "1px solid rgba(167,229,211,.22)",
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                animation: "sSlideRight .5s cubic-bezier(.34,1.2,.64,1)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: C.mint,
                  flexShrink: 0,
                  marginTop: 5,
                  animation: "sLiveBlink 2.4s infinite",
                }}
              />
              <div style={{ fontFamily: inter, fontSize: 13, color: "rgba(245,245,245,.72)", lineHeight: 1.55 }}>
                {insight}
              </div>
            </div>
          )}
        </div>

        {/* Right: dashboard — hidden on mobile */}
        {!isMobile && <div
          style={{
            padding: "28px 24px",
            borderLeft: "1px solid rgba(245,245,245,.08)",
            background: "rgba(0,0,0,.18)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            position: "relative",
          }}
        >
          {/* Scan line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 1,
              background: "linear-gradient(90deg,transparent,rgba(167,229,211,.35),transparent)",
              animation: "sScanDown 4s linear infinite",
              pointerEvents: "none",
            }}
          />

          <TeaserConfMeter value={dash.conf} />

          <div style={{ height: 1, background: "rgba(245,245,245,.07)" }} />

          <div>
            <div style={{ ...eyebrowOnDark, fontSize: 10, marginBottom: 6 }}>Estimated Value</div>
            <div
              key={dash.val ?? "empty-val"}
              style={{
                fontFamily: garamond,
                fontSize: 26,
                fontWeight: 300,
                letterSpacing: "-.4px",
                color: dash.val ? "rgba(245,245,245,.95)" : "rgba(245,245,245,.2)",
                lineHeight: 1,
                animation: dash.val ? "sNumRoll .55s cubic-bezier(.34,1.3,.64,1)" : "none",
              }}
            >
              {dash.val ?? "—"}
            </div>
            {dash.mult && (
              <div
                key={dash.mult}
                style={{
                  fontFamily: inter,
                  fontSize: 12,
                  color: C.mint,
                  fontWeight: 500,
                  marginTop: 4,
                  animation: "sSlideUp .4s",
                }}
              >
                {dash.mult} SDE multiple
              </div>
            )}
          </div>

          <div style={{ height: 1, background: "rgba(245,245,245,.07)" }} />

          <div>
            <div style={{ ...eyebrowOnDark, fontSize: 10, marginBottom: 6 }}>Broker fee eliminated</div>
            <div
              key={dash.fee ?? "empty-fee"}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                animation: dash.fee ? "sNumRoll .5s cubic-bezier(.34,1.3,.64,1)" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: garamond,
                  fontSize: 26,
                  fontWeight: 300,
                  letterSpacing: "-.4px",
                  color: dash.fee ? C.mint : "rgba(245,245,245,.2)",
                }}
              >
                {dash.fee ?? "—"}
              </span>
              {dash.fee && (
                <span style={{ fontFamily: inter, fontSize: 11, color: "rgba(167,229,211,.6)" }}>saved</span>
              )}
            </div>
            {dash.fee && (
              <div style={{ fontFamily: inter, fontSize: 11, color: "rgba(245,245,245,.3)", marginTop: 4 }}>
                vs. 8–12% traditional broker fee
              </div>
            )}
          </div>

          {answers.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
              <div style={{ height: 1, background: "rgba(245,245,245,.07)", marginBottom: 6 }} />
              <div style={{ ...eyebrowOnDark, fontSize: 10 }}>Signal profile</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {answers.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      fontFamily: inter,
                      fontSize: 11,
                      fontWeight: 500,
                      color: "rgba(245,245,245,.6)",
                      background: "rgba(245,245,245,.06)",
                      border: "1px solid rgba(245,245,245,.1)",
                      borderRadius: 9999,
                      padding: "3px 9px",
                      animation: "sChipFloat .4s",
                    }}
                  >
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>}
      </div>
    </div>
  )
}

// ─── ExitIQ overlay (full app) ────────────────────────────────────────────────
function ExitIQOverlay({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile()
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      onClick={isMobile ? undefined : onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "center",
        padding: isMobile ? 0 : "24px",
        background: isMobile ? "transparent" : "rgba(0,0,0,0.55)",
        backdropFilter: isMobile ? "none" : "blur(12px)",
        WebkitBackdropFilter: isMobile ? "none" : "blur(12px)",
        animation: "sFadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: isMobile ? "100%" : 1160,
          height: isMobile ? "100%" : "90vh",
          borderRadius: isMobile ? 0 : 20,
          overflow: "hidden",
          boxShadow: isMobile ? "none" : "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,245,245,0.08)",
          animation: "sSlideUp 0.35s cubic-bezier(0.34,1.15,0.64,1)",
        }}
      >
        <ExitIQApp onClose={onClose} />
      </div>
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const eyebrow = (dark = false): React.CSSProperties => ({
  fontFamily: inter,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: ".96px",
  textTransform: "uppercase" as const,
  color: dark ? "rgba(167,229,211,.85)" : C.muted,
})

const eyebrowOnDark: React.CSSProperties = {
  fontFamily: inter,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: ".96px",
  textTransform: "uppercase",
  color: C.onDarkMuted,
}

const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  height: 44,
  padding: "0 22px",
  borderRadius: 9999,
  border: "none",
  cursor: "pointer",
  background: C.ink2,
  color: "#fff",
  fontFamily: inter,
  fontSize: 15,
  fontWeight: 500,
  textDecoration: "none",
  transition: "background .18s, transform .18s",
}

const btnOutline: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  height: 44,
  padding: "0 21px",
  borderRadius: 9999,
  cursor: "pointer",
  background: "transparent",
  color: C.ink,
  border: `1px solid ${C.hairlineStrong}`,
  fontFamily: inter,
  fontSize: 15,
  fontWeight: 500,
  textDecoration: "none",
  transition: "background .18s",
}

const btnLight: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  height: 44,
  padding: "0 22px",
  borderRadius: 9999,
  border: "none",
  cursor: "pointer",
  background: "rgba(245,245,245,.95)",
  color: C.ink,
  fontFamily: inter,
  fontSize: 15,
  fontWeight: 500,
  transition: "transform .18s, box-shadow .18s",
}

// ─── Announcement Bar ─────────────────────────────────────────────────────────
function SAnnouncementBar({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      style={{
        background: "linear-gradient(90deg, rgba(167,229,211,.18) 0%, rgba(200,184,224,.14) 50%, rgba(168,200,232,.14) 100%)",
        borderBottom: `1px solid rgba(167,229,211,.35)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "0 16px",
        height: 37,
        position: "relative",
      }}
    >
      <span
        style={{
          fontFamily: inter,
          fontSize: 12.5,
          fontWeight: 500,
          color: C.ink2,
          letterSpacing: ".01em",
        }}
      >
        ✦ ExitIQ is free to use — no broker call required
      </span>
      <a
        href="#exitiq"
        style={{
          fontFamily: inter,
          fontSize: 12,
          fontWeight: 600,
          color: "#1a7a60",
          textDecoration: "none",
          letterSpacing: ".01em",
        }}
      >
        Try it →
      </a>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: C.mutedSoft,
          lineHeight: 1,
          padding: 4,
          fontSize: 16,
        }}
      >
        ×
      </button>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function SNav({ onOpen }: { onOpen: () => void }) {
  const [scrolled, setScrolled] = React.useState(false)
  const isMobile = useIsMobile()
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll)
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = [
    { l: "How it works", href: "#how" },
    { l: "Products", href: "#products" },
{ l: "About", href: "/about" },
  ]

  return (
    <nav
      style={{
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        height: 64,
        padding: "0 24px",
        background: scrolled ? "rgba(245,245,245,.85)" : "transparent",
        borderBottom: scrolled ? `1px solid ${C.hairline}` : "1px solid transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        transition: "background .25s, border-color .25s",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 36 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #a7e5d3 0%, #c8b8e0 55%, #0c0a09 100%)",
            boxShadow: "0 0 12px rgba(167,229,211,.4)",
            flexShrink: 0,
          }}
        />
        <Link
          href="/"
          style={{
            fontFamily: garamond,
            fontSize: 22,
            fontWeight: 400,
            color: C.ink,
            letterSpacing: "-.4px",
            textDecoration: "none",
          }}
        >
          Scorta
        </Link>
      </div>

      {/* Links — hidden on mobile */}
      {!isMobile && (
        <div style={{ display: "flex", gap: 26, flex: 1 }}>
          {links.map(({ l, href }) =>
            href.startsWith("/") ? (
              <Link
                key={l}
                href={href}
                style={{
                  fontFamily: inter,
                  fontSize: 14,
                  fontWeight: 500,
                  color: C.body,
                  opacity: 0.85,
                  textDecoration: "none",
                  transition: "opacity .15s",
                }}
              >
                {l}
              </Link>
            ) : (
              <a
                key={l}
                href={href}
                style={{
                  fontFamily: inter,
                  fontSize: 14,
                  fontWeight: 500,
                  color: C.body,
                  opacity: 0.85,
                  textDecoration: "none",
                  transition: "opacity .15s",
                }}
              >
                {l}
              </a>
            )
          )}
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginLeft: "auto" }}>
        {!isMobile && (
          <a
            href="#exitiq"
            style={{
              fontFamily: inter,
              fontSize: 14,
              fontWeight: 500,
              color: C.body,
              opacity: 0.7,
              textDecoration: "none",
            }}
          >
            Sign in
          </a>
        )}
        <button onClick={onOpen} style={{ ...btnPrimary, height: 38, fontSize: 14 }}>
          Try ExitIQ
        </button>
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function SHero({ onOpen }: { onOpen: () => void }) {
  return (
    <section id="exitiq" style={{ position: "relative", overflow: "hidden", padding: "88px 24px 108px" }}>
      {/* Atmospheric orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            width: 540,
            height: 540,
            top: -180,
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 40%, rgba(167,229,211,.45) 0%, rgba(200,184,224,.28) 45%, transparent 72%)",
            filter: "blur(40px)",
            animation: "sOrbFloat1 14s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 360,
            height: 360,
            top: "15%",
            left: "-4%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,197,168,.4) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "sOrbFloat2 18s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            top: "8%",
            right: "-2%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,200,232,.42) 0%, transparent 70%)",
            filter: "blur(36px)",
            animation: "sOrbFloat3 16s ease-in-out infinite",
          }}
        />
      </div>

      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
        {/* Editorial headline */}
        <div
          className="s-rv"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 22,
            marginBottom: 56,
          }}
        >
          <div style={eyebrow()}>An AI-native broker for Main Street</div>
          <h1
            style={{
              fontFamily: garamond,
              fontSize: "clamp(44px, 7vw, 88px)",
              fontWeight: 300,
              letterSpacing: "-1.92px",
              lineHeight: 1.02,
              color: C.ink,
              maxWidth: 920,
              margin: 0,
            }}
          >
            Don&apos;t list and pray. <em style={{ fontStyle: "italic", color: "#1c1917" }}>Sell with proof.</em>
          </h1>
          <p
            style={{
              fontFamily: inter,
              fontSize: 18,
              lineHeight: 1.55,
              color: C.body,
              maxWidth: 580,
              margin: 0,
              letterSpacing: ".16px",
            }}
          >
            Scorta turns a few questions about your business into a buyer-ready exit profile — with valuation, SBA
            pre-screen, and a fix list. No 10% broker fee.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={onOpen} style={btnPrimary}>
              Start ExitIQ — free →
            </button>
            <a href="#how" style={btnOutline}>
              See how it works
            </a>
          </div>
          <div style={{ fontFamily: inter, fontSize: 13, color: C.mutedSoft, marginTop: 2 }}>
            Free assessment. No login. ~3 minutes.
          </div>
        </div>

        {/* ExitIQ centerpiece */}
        <div className="s-rv s-d2" style={{ maxWidth: 1080, margin: "0 auto", position: "relative" }}>
          {/* Animated conic-gradient ring */}
          <div
            style={{
              position: "absolute",
              inset: -2,
              borderRadius: 26,
              padding: 2,
              background:
                "conic-gradient(from 0deg, rgba(167,229,211,.6), rgba(200,184,224,.6), rgba(168,200,232,.6), rgba(244,197,168,.6), rgba(167,229,211,.6))",
              filter: "blur(.5px)",
              animation: "sRingSpin 14s linear infinite",
              opacity: 0.6,
              pointerEvents: "none",
              WebkitMask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
          <div style={{ position: "relative", cursor: "pointer" }} onClick={onOpen}>
            <ExitIQTeaser onComplete={onOpen} />
            <div style={{ position: "absolute", inset: 0, zIndex: 10 }} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -36,
              textAlign: "center",
              fontFamily: inter,
              fontSize: 12,
              color: C.mutedSoft,
              letterSpacing: ".2px",
            }}
          >
            ↓ Try the assessment — values are illustrative
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Industry marquee ─────────────────────────────────────────────────────────
function SIndustryMarquee() {
  const items = [
    "HVAC",
    "Plumbing",
    "Roofing",
    "Landscaping",
    "Auto repair",
    "Cleaning",
    "Pest control",
    "Electrical",
    "Restoration",
    "Concrete",
    "Locksmith",
    "Tree care",
  ]
  const repeated = [...items, ...items]
  return (
    <section style={{ padding: "64px 0 32px", background: C.canvas }}>
      <div className="s-rv" style={{ textAlign: "center", marginBottom: 28 }}>
        <span style={{ fontFamily: inter, fontSize: 13, color: C.muted }}>
          Built for the trades on every Main Street.
        </span>
      </div>
      <div className="s-mqf" style={{ overflow: "hidden" }}>
        <div className="s-mq">
          {repeated.map((it, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: garamond,
                fontWeight: 300,
                fontSize: 28,
                color: C.ink2,
                letterSpacing: "-.4px",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: C.mint,
                  flexShrink: 0,
                }}
              />
              {it}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Signals Band (dark) ──────────────────────────────────────────────────────
function SSignalsBand() {
  const chips = [
    { t: "Owner dependence", x: 6, y: 12 },
    { t: "Customer concentration", x: 72, y: 8 },
    { t: "Recurring revenue", x: 16, y: 38 },
    { t: "Add-back quality", x: 82, y: 36 },
    { t: "SBA eligibility", x: 4, y: 62 },
    { t: "Lease term", x: 76, y: 64 },
    { t: "SOPs documented", x: 18, y: 84 },
    { t: "Licenses", x: 80, y: 88 },
    { t: "Tax returns", x: 38, y: 4 },
    { t: "P&L quality", x: 58, y: 92 },
    { t: "Employee retention", x: 30, y: 72 },
    { t: "Tech stack", x: 64, y: 26 },
  ]

  return (
    <section
      style={{
        background: C.dark,
        color: C.onDark,
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Atmospheric glow */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,229,211,.18) 0%, rgba(200,184,224,.08) 50%, transparent 75%)",
            filter: "blur(60px)",
            animation: "sOrbFloat1 20s ease-in-out infinite",
          }}
        />
      </div>

      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
        <div className="s-rv" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 56px" }}>
          <div style={{ ...eyebrow(true), marginBottom: 16 }}>What buyers actually look at</div>
          <h2
            style={{
              fontFamily: garamond,
              fontSize: "clamp(34px, 4.5vw, 56px)",
              fontWeight: 300,
              letterSpacing: "-.96px",
              lineHeight: 1.08,
              color: C.onDark,
            }}
          >
            Buyers see <em>signals,</em> not stories.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 17, color: C.onDarkBody, marginTop: 18, lineHeight: 1.55 }}>
            Twelve things kill 70% of small-business sales. Scorta finds yours, ranks them, and tells you what to fix —
            before you ever talk to a buyer.
          </p>
        </div>

        {/* Chip cloud */}
        <div className="s-rv s-d2" style={{ position: "relative", height: 460, maxWidth: 1000, margin: "0 auto" }}>
          {chips.map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${c.x}%`,
                top: `${c.y}%`,
                padding: "8px 14px",
                background: "rgba(245,245,245,.05)",
                border: "1px solid rgba(245,245,245,.12)",
                borderRadius: 9999,
                color: "rgba(245,245,245,.78)",
                fontSize: 13,
                fontFamily: inter,
                fontWeight: 500,
                whiteSpace: "nowrap",
                backdropFilter: "blur(6px)",
                animation: `sDrift ${4 + (i % 5) * 0.6}s ease-in-out ${i * 0.13}s infinite`,
              }}
            >
              {c.t}
            </div>
          ))}

          {/* Center plate */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 280,
              padding: "24px 22px",
              background: "rgba(167,229,211,.05)",
              border: "1px solid rgba(167,229,211,.3)",
              borderRadius: 16,
              textAlign: "center",
              backdropFilter: "blur(20px)",
              boxShadow: "0 0 60px rgba(167,229,211,.15)",
            }}
          >
            <div style={{ ...eyebrow(true), fontSize: 10 }}>Scorta surfaces all 12</div>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 24,
                fontWeight: 300,
                color: C.onDark,
                lineHeight: 1.2,
                letterSpacing: "-.3px",
                marginTop: 8,
              }}
            >
              The signals buyers grade you on.
            </div>
            <div
              style={{
                marginTop: 14,
                fontFamily: inter,
                fontSize: 12,
                color: "rgba(167,229,211,.7)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: C.mint,
                  animation: "sLiveBlink 2s infinite",
                }}
              />
              ExitIQ → Gap Report
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Speed Compare ────────────────────────────────────────────────────────────
function SSpeedCompare() {
  return (
    <section id="how" style={{ padding: "96px 24px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="s-rv" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 64px" }}>
          <div style={{ ...eyebrow(), marginBottom: 16 }}>The Math</div>
          <h2
            style={{
              fontFamily: garamond,
              fontSize: "clamp(34px, 4.5vw, 56px)",
              fontWeight: 300,
              letterSpacing: "-.96px",
              lineHeight: 1.08,
              color: C.ink,
            }}
          >
            <em>5×</em> faster. Zero broker commission.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 17, color: C.body, marginTop: 18, lineHeight: 1.55 }}>
            Traditional brokers list and pray. Scorta runs the deal, prices the deal, and qualifies the buyer — for a
            fixed fee.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {/* Traditional broker card */}
          <div
            className="s-rv s-ch"
            style={{
              position: "relative",
              overflow: "hidden",
              background: C.canvasSoft,
              border: `1px solid ${C.hairline}`,
              borderRadius: 24,
              padding: 28,
              minHeight: 340,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div style={eyebrow()}>Traditional broker</div>
              <span style={{ fontFamily: inter, fontSize: 11, color: C.mutedSoft }}>industry avg.</span>
            </div>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 64,
                fontWeight: 300,
                color: C.mutedSoft,
                letterSpacing: "-1.5px",
                lineHeight: 1,
              }}
            >
              186 days
            </div>
            <div style={{ fontFamily: inter, fontSize: 14, color: C.muted, marginTop: 8 }}>median time on market</div>
            <div style={{ height: 1, background: C.hairline, margin: "24px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { l: "Commission", v: "8 – 12%" },
                { l: "Fee on $1.5M sale", v: "$120K – $180K", warn: true },
                { l: "Process", v: "PDFs + email" },
                { l: "Listings that close", v: "20 – 30%", warn: true },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: inter, fontSize: 13, color: C.muted }}>{r.l}</span>
                  <span
                    style={{
                      fontFamily: inter,
                      fontSize: 14,
                      fontWeight: 500,
                      color: r.warn ? "#dc2626" : C.ink2,
                    }}
                  >
                    {r.v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scorta card */}
          <div
            className="s-rv s-d1 s-chd"
            style={{
              position: "relative",
              overflow: "hidden",
              background: C.dark,
              color: C.onDark,
              borderRadius: 24,
              padding: 28,
              minHeight: 340,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 360,
                height: 360,
                top: -120,
                right: -100,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(167,229,211,.35) 0%, rgba(200,184,224,.18) 50%, transparent 75%)",
                filter: "blur(36px)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <div style={eyebrow(true)}>Scorta</div>
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: 11,
                    color: "rgba(167,229,211,.7)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: C.mint,
                      animation: "sLiveBlink 2s infinite",
                    }}
                  />
                  AI-native
                </span>
              </div>
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 64,
                  fontWeight: 300,
                  color: C.mint,
                  letterSpacing: "-1.5px",
                  lineHeight: 1,
                }}
              >
                ~38 days
              </div>
              <div style={{ fontFamily: inter, fontSize: 14, color: C.onDarkBody, marginTop: 8 }}>
                from intake to LOI on average
              </div>
              <div style={{ height: 1, background: C.onDarkHair, margin: "24px 0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { l: "Commission", v: "0%" },
                  { l: "Flat success fee", v: "~3%" },
                  { l: "Process", v: "AI workflow + human approval" },
                  { l: "Buyers qualified before LOI", v: "100%" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: inter, fontSize: 13, color: "rgba(245,245,245,.5)" }}>{r.l}</span>
                    <span style={{ fontFamily: inter, fontSize: 14, fontWeight: 500, color: "rgba(167,229,211,.95)" }}>
                      {r.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Industry Switcher ────────────────────────────────────────────────────────
function SIndustrySwitcher() {
  type TradeData = { mult: number; vlo: number; vhi: number; sde: number; days: number; note: string }
  const data: Record<string, TradeData> = {
    HVAC: {
      mult: 2.6,
      vlo: 1.4,
      vhi: 2.1,
      sde: 540,
      days: 38,
      note: "Strong searcher demand. Recurring service contracts add 0.4× multiple.",
    },
    Plumbing: {
      mult: 2.4,
      vlo: 0.88,
      vhi: 1.6,
      sde: 420,
      days: 41,
      note: "Strategic acquirers consolidating. License transfer is the #1 gating item.",
    },
    Landscaping: {
      mult: 2.1,
      vlo: 0.64,
      vhi: 1.2,
      sde: 310,
      days: 46,
      note: "Recurring contracts vs one-off jobs is the value swing. Equipment value matters.",
    },
    Roofing: {
      mult: 2.8,
      vlo: 1.1,
      vhi: 2.4,
      sde: 580,
      days: 36,
      note: "PE-backed rollups very active. Storm exposure model affects risk pricing.",
    },
    "Auto repair": {
      mult: 2.3,
      vlo: 0.72,
      vhi: 1.4,
      sde: 380,
      days: 49,
      note: "Real estate ownership lifts the multiple. Specialty shops command premium.",
    },
    Cleaning: {
      mult: 2.5,
      vlo: 0.58,
      vhi: 1.1,
      sde: 280,
      days: 44,
      note: "B2B contract base preferred over residential. Recurring share drives multiple.",
    },
    "Pest control": {
      mult: 3.1,
      vlo: 1.3,
      vhi: 2.2,
      sde: 520,
      days: 32,
      note: "High recurring revenue makes this a hot rollup category.",
    },
    Electrical: {
      mult: 2.7,
      vlo: 1.1,
      vhi: 1.9,
      sde: 490,
      days: 40,
      note: "Master license transfer + commercial mix matters most.",
    },
  }
  const keys = Object.keys(data)
  const [active, setActive] = React.useState("HVAC")
  const d = data[active]!
  const sdeAnim = useCountUp(d.sde, 900)
  const multAnim = useCountUp(d.mult, 900)
  const vloAnim = useCountUp(d.vlo, 1000)
  const vhiAnim = useCountUp(d.vhi, 1000)
  const daysAnim = useCountUp(d.days, 1100)
  const barW = (d.days / 186) * 100
  const [barAnim, setBarAnim] = React.useState(0)
  React.useEffect(() => {
    setBarAnim(0)
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setBarAnim(barW)))
    return () => cancelAnimationFrame(id)
  }, [active, barW])
  const fmtM = (n: number) => "$" + (n >= 1 ? n.toFixed(1) + "M" : Math.round(n * 1000) + "K")

  return (
    <section
      style={{
        padding: "96px 24px",
        background: C.canvasSoft,
        borderTop: `1px solid ${C.hairline}`,
        borderBottom: `1px solid ${C.hairline}`,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="s-rv" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
          <div style={{ ...eyebrow(), marginBottom: 16 }}>Made for every Main Street owner</div>
          <h2
            style={{
              fontFamily: garamond,
              fontSize: "clamp(34px, 4.5vw, 56px)",
              fontWeight: 300,
              letterSpacing: "-.96px",
              lineHeight: 1.08,
              color: C.ink,
            }}
          >
            Pick your trade. <em>See your number.</em>
          </h2>
        </div>

        {/* Trade chips */}
        <div
          className="s-rv s-d1"
          style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}
        >
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => setActive(k)}
              style={{
                padding: "10px 18px",
                borderRadius: 9999,
                background: active === k ? C.ink : "transparent",
                color: active === k ? "#fff" : C.ink2,
                border: `1px solid ${active === k ? C.ink : C.hairlineStrong}`,
                fontFamily: inter,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "background .2s, color .2s",
              }}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Live valuation card */}
        <div
          className="s-rv s-d2 s-ch"
          style={{
            position: "relative",
            maxWidth: 920,
            margin: "0 auto",
            background: C.card,
            border: `1px solid ${C.hairline}`,
            borderRadius: 24,
            padding: 32,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 320,
              height: 320,
              top: -120,
              right: -80,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(167,229,211,.35) 0%, rgba(200,184,224,.2) 50%, transparent 75%)",
              filter: "blur(36px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 28,
            }}
          >
            <div>
              <div style={{ ...eyebrow(), fontSize: 10 }}>Active trade</div>
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 32,
                  fontWeight: 300,
                  color: C.ink,
                  letterSpacing: "-.32px",
                  marginTop: 8,
                }}
              >
                {active}
              </div>
            </div>
            <div>
              <div style={{ ...eyebrow(), fontSize: 10 }}>Median SDE</div>
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 32,
                  fontWeight: 300,
                  color: C.ink,
                  letterSpacing: "-.32px",
                  marginTop: 8,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ${Math.round(sdeAnim)}K
              </div>
            </div>
            <div>
              <div style={{ ...eyebrow(), fontSize: 10 }}>Multiple band</div>
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 32,
                  fontWeight: 300,
                  color: "#16a34a",
                  letterSpacing: "-.32px",
                  marginTop: 8,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {multAnim.toFixed(1)}×
              </div>
            </div>
            <div>
              <div style={{ ...eyebrow(), fontSize: 10 }}>Estimated value</div>
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 28,
                  fontWeight: 300,
                  color: C.ink,
                  letterSpacing: "-.32px",
                  marginTop: 8,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmtM(vloAnim)} – {fmtM(vhiAnim)}
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ ...eyebrow(), fontSize: 10, marginBottom: 10 }}>Time to LOI (Scorta avg)</div>
              <div
                style={{
                  position: "relative",
                  height: 8,
                  background: C.strong,
                  borderRadius: 9999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: barAnim + "%",
                    background: "linear-gradient(90deg, #a7e5d3, #c8b8e0)",
                    borderRadius: 9999,
                    transition: "width 1.1s cubic-bezier(.2,.7,.2,1)",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontFamily: inter, fontSize: 12, color: C.muted, fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(daysAnim)} days
                </span>
                <span style={{ fontFamily: inter, fontSize: 12, color: C.mutedSoft }}>vs broker avg 186 days</span>
              </div>
            </div>
            <div
              style={{
                gridColumn: "1 / -1",
                background: C.canvas,
                border: `1px solid ${C.hairline}`,
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: C.mint,
                  flexShrink: 0,
                  marginTop: 6,
                }}
              />
              <span style={{ fontFamily: inter, fontSize: 14, color: C.body, lineHeight: 1.55 }}>{d.note}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Boardroom ────────────────────────────────────────────────────────────────
function SBoardroom() {
  type Persona = { sub: string; offer: string; struct: string; loi: string; objections: string[]; color: string }
  const personas: Record<string, Persona> = {
    "The Searcher": {
      sub: "Solo SBA buyer · Operates one business",
      offer: "$1.65M",
      struct: "90% SBA + 10% seller note",
      loi: "High",
      objections: ["Owner dependence", "Documentation gaps"],
      color: C.mint,
    },
    "The Strategic": {
      sub: "Roll-up acquirer · Add-on for portfolio",
      offer: "$1.95M",
      struct: "All cash + 12-month earnout",
      loi: "Medium",
      objections: ["Customer concentration", "Pricing alignment"],
      color: C.lav,
    },
    "The Operator": {
      sub: "Family office · Cash-flow focused",
      offer: "$1.40M",
      struct: "Cash + seller financing 30%",
      loi: "High",
      objections: ["Margin trend", "Recurring revenue %"],
      color: C.sky,
    },
  }
  const keys = Object.keys(personas)
  const [active, setActive] = React.useState(keys[0]!)
  const p = personas[active]!

  return (
    <section
      style={{
        background: C.dark,
        color: C.onDark,
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            top: "-30%",
            left: "-10%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,184,224,.16) 0%, transparent 65%)",
            filter: "blur(60px)",
            animation: "sOrbFloat2 22s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            bottom: "-20%",
            right: "-10%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,229,211,.14) 0%, transparent 65%)",
            filter: "blur(50px)",
            animation: "sOrbFloat3 26s ease-in-out infinite",
          }}
        />
      </div>

      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
        <div className="s-rv" style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 48px" }}>
          <div style={{ ...eyebrow(true), marginBottom: 16 }}>The Boardroom</div>
          <h2
            style={{
              fontFamily: garamond,
              fontSize: "clamp(34px, 4.5vw, 56px)",
              fontWeight: 300,
              letterSpacing: "-.96px",
              lineHeight: 1.08,
              color: C.onDark,
            }}
          >
            Sit across the table from <em>three buyers.</em>
          </h2>
          <p style={{ fontFamily: inter, fontSize: 17, color: C.onDarkBody, marginTop: 18, lineHeight: 1.55 }}>
            Before you hear &quot;no&quot; from a real one. Scorta simulates how each buyer type prices, structures, and
            objects — so you walk into negotiation already prepared.
          </p>
        </div>

        {/* Persona toggles */}
        <div
          className="s-rv s-d1"
          style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 28 }}
        >
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => setActive(k)}
              style={{
                padding: "10px 20px",
                borderRadius: 9999,
                background: active === k ? "rgba(167,229,211,.14)" : "rgba(245,245,245,.05)",
                color: active === k ? C.mint : "rgba(245,245,245,.7)",
                border: `1px solid ${active === k ? "rgba(167,229,211,.45)" : "rgba(245,245,245,.13)"}`,
                fontFamily: inter,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Persona panel — key forces remount on toggle so sFadeIn replays */}
        <div
          className="s-glass s-chd"
          key={active}
          style={{
            maxWidth: 920,
            margin: "0 auto",
            padding: 32,
            position: "relative",
            overflow: "hidden",
            animation: "sFadeIn .4s ease both",
          }}
        >
          {/* Scan line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 1,
              background: "linear-gradient(90deg,transparent,rgba(167,229,211,.35),transparent)",
              animation: "sScanDown 4s linear infinite",
              pointerEvents: "none",
            }}
          />

          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 24 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${p.color} 0%, rgba(200,184,224,.6) 50%, transparent 80%)`,
                flexShrink: 0,
                animation: "sOrbBreathe 3.6s ease-in-out infinite, sOrbGlow 4s ease-in-out infinite",
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 32,
                  fontWeight: 300,
                  color: C.onDark,
                  letterSpacing: "-.4px",
                }}
              >
                {active}
              </div>
              <div style={{ fontFamily: inter, fontSize: 14, color: C.onDarkMuted, marginTop: 4 }}>{p.sub}</div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24 }}>
            <div>
              <div style={{ ...eyebrowOnDark, fontSize: 10, marginBottom: 8 }}>Estimated offer</div>
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 38,
                  fontWeight: 300,
                  color: p.color,
                  letterSpacing: "-.5px",
                  lineHeight: 1,
                }}
              >
                {p.offer}
              </div>
            </div>
            <div>
              <div style={{ ...eyebrowOnDark, fontSize: 10, marginBottom: 8 }}>Deal structure</div>
              <div style={{ fontFamily: inter, fontSize: 16, color: C.onDark, lineHeight: 1.4 }}>{p.struct}</div>
            </div>
            <div>
              <div style={{ ...eyebrowOnDark, fontSize: 10, marginBottom: 8 }}>LOI likelihood</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    background: "rgba(245,245,245,.08)",
                    borderRadius: 9999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: p.loi === "High" ? "85%" : "60%",
                      height: "100%",
                      background: p.color,
                      borderRadius: 9999,
                      boxShadow: `0 0 12px ${p.color}`,
                    }}
                  />
                </div>
                <span style={{ fontFamily: inter, fontSize: 13, color: p.color, fontWeight: 500 }}>{p.loi}</span>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(245,245,245,.08)", margin: "24px 0" }} />

          <div style={{ ...eyebrowOnDark, fontSize: 10, marginBottom: 12 }}>Objections you&apos;ll hear</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {p.objections.map((o, i) => (
              <div
                key={o}
                style={{
                  padding: "8px 14px",
                  background: "rgba(245,245,245,.05)",
                  border: "1px solid rgba(245,245,245,.13)",
                  borderRadius: 9999,
                  fontFamily: inter,
                  fontSize: 13,
                  color: "rgba(245,245,245,.78)",
                  animation: `sChipFloat .5s ${i * 100}ms cubic-bezier(.34,1.3,.64,1) both`,
                }}
              >
                {o}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Gap Report ───────────────────────────────────────────────────────────────
function SGapReport() {
  return (
    <section style={{ padding: "96px 24px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 56,
            alignItems: "center",
          }}
        >
          {/* Left copy */}
          <div className="s-rv">
            <div style={{ ...eyebrow(), marginBottom: 16 }}>The Gap Report</div>
            <h2
              style={{
                fontFamily: garamond,
                fontSize: "clamp(32px, 3.8vw, 48px)",
                fontWeight: 300,
                letterSpacing: "-.96px",
                lineHeight: 1.1,
                color: C.ink,
              }}
            >
              Know <em>exactly</em> what to fix before you list.
            </h2>
            <p style={{ fontFamily: inter, fontSize: 17, color: C.body, marginTop: 18, lineHeight: 1.6 }}>
              Your assessment becomes a 12-page Gap Report: valuation range, three buyer offer scenarios, SBA pre-screen
              result, a 90-day fix list, and comparable closed deals.
            </p>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Valuation range with comp anchors",
                "Three buyer offer scenarios",
                "SBA pre-screen verdict",
                "90-day & 12-month fix lists",
              ].map((t, i) => (
                <div
                  key={t}
                  className="s-rv"
                  style={{ display: "flex", alignItems: "center", gap: 10, transitionDelay: `${0.1 + i * 0.06}s` }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: C.ink,
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width={10}
                      height={10}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span style={{ fontFamily: inter, fontSize: 15, color: C.ink2 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mock report card */}
          <div className="s-rv s-d2" style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: -20,
                background:
                  "radial-gradient(ellipse at center, rgba(167,229,211,.25) 0%, rgba(200,184,224,.15) 50%, transparent 75%)",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />
            <div
              className="s-ch"
              style={{
                position: "relative",
                background: C.card,
                border: `1px solid ${C.hairline}`,
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 30px 60px rgba(12,10,9,.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <span style={{ ...eyebrow(), fontSize: 10 }}>Gap Report · Draft</span>
                <span style={{ fontFamily: inter, fontSize: 11, color: C.mutedSoft }}>generated in 4m 12s</span>
              </div>
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 22,
                  fontWeight: 300,
                  color: C.ink,
                  letterSpacing: "-.32px",
                  marginBottom: 4,
                }}
              >
                Atlas HVAC, LLC
              </div>
              <div style={{ fontFamily: inter, fontSize: 13, color: C.muted, marginBottom: 22 }}>
                HVAC · Tampa, FL · 14 yrs
              </div>

              {/* Score bar */}
              <div
                style={{
                  background: C.canvasSoft,
                  border: `1px solid ${C.strong}`,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: inter,
                    fontSize: 11,
                    color: C.muted,
                    letterSpacing: ".5px",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  ExitIQ score
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div
                    style={{
                      fontFamily: garamond,
                      fontSize: 44,
                      fontWeight: 300,
                      color: C.ink,
                      letterSpacing: "-.8px",
                      lineHeight: 1,
                    }}
                  >
                    72
                  </div>
                  <span style={{ fontFamily: inter, fontSize: 13, color: "#16a34a", fontWeight: 500 }}>
                    ↑ readiness
                  </span>
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 6,
                    background: C.strong,
                    borderRadius: 9999,
                    marginTop: 10,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "72%",
                      background: "linear-gradient(90deg, #a7e5d3, #c8b8e0)",
                      borderRadius: 9999,
                    }}
                  />
                </div>
              </div>

              {/* Valuation + SBA grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div
                  style={{
                    background: C.canvasSoft,
                    border: `1px solid ${C.strong}`,
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontFamily: inter,
                      fontSize: 11,
                      color: C.muted,
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    Valuation
                  </div>
                  <div
                    style={{
                      fontFamily: garamond,
                      fontSize: 22,
                      fontWeight: 300,
                      color: C.ink,
                      marginTop: 6,
                    }}
                  >
                    $1.4M – $2.1M
                  </div>
                </div>
                <div
                  style={{
                    background: C.canvasSoft,
                    border: `1px solid ${C.strong}`,
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontFamily: inter,
                      fontSize: 11,
                      color: C.muted,
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    SBA pre-screen
                  </div>
                  <div
                    style={{
                      fontFamily: inter,
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#16a34a",
                      marginTop: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a" }} /> Likely as-is
                  </div>
                </div>
              </div>

              {/* Fix list */}
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    fontFamily: inter,
                    fontSize: 11,
                    color: C.muted,
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                    marginBottom: 4,
                  }}
                >
                  90-day fix list
                </div>
                {[
                  "Document SOPs for top 5 routes",
                  "Reduce Acme contract to <20% revenue",
                  "Clean Q3–Q4 add-backs",
                ].map((t, i) => (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      background: C.canvasSoft,
                      borderRadius: 8,
                      animation: `sSlideRight .5s ${i * 100 + 200}ms cubic-bezier(.34,1.3,.64,1) both`,
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: `1.5px solid ${C.hairlineStrong}`,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontFamily: inter, fontSize: 13, color: C.ink2 }}>{t}</span>
                    <span style={{ marginLeft: "auto", fontFamily: inter, fontSize: 11, color: C.mutedSoft }}>
                      +{[3, 6, 4][i]}% value
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Product Surfaces ─────────────────────────────────────────────────────────
function SProductSurfaces() {
  return (
    <section
      id="products"
      style={{ padding: "96px 24px", background: C.canvasSoft, borderTop: `1px solid ${C.hairline}` }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="s-rv" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
          <div style={{ ...eyebrow(), marginBottom: 16 }}>The transaction stack</div>
          <h2
            style={{
              fontFamily: garamond,
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 300,
              letterSpacing: "-.96px",
              lineHeight: 1.08,
              color: C.ink,
            }}
          >
            We do the work the broker should have.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {/* SBA Pre-Screen */}
          <div
            className="s-rv s-ch"
            style={{
              background: C.card,
              border: `1px solid ${C.hairline}`,
              borderRadius: 20,
              padding: 28,
              minHeight: 380,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ ...eyebrow(), fontSize: 10, marginBottom: 16 }}>SBA Pre-Screen</div>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 26,
                fontWeight: 300,
                color: C.ink,
                letterSpacing: "-.32px",
                marginBottom: 12,
              }}
            >
              Will it finance?
            </div>
            <p style={{ fontFamily: inter, fontSize: 14, color: C.body, lineHeight: 1.55, marginBottom: 20 }}>
              Run the lender filter before a buyer ever submits. Eligibility, DSCR, add-back quality, gating items.
            </p>
            <div style={{ flex: 1 }} />
            <div
              style={{
                background: C.canvasSoft,
                border: `1px solid ${C.strong}`,
                borderRadius: 12,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {[
                { l: "Industry eligibility", v: "pass", d: 0 },
                { l: "DSCR projection", v: "1.45×", d: 0.15 },
                { l: "Add-back quality", v: "review", d: 0.3, warn: true },
                { l: "Down payment", v: "10% OK", d: 0.45 },
              ].map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    animation: `sSlideRight .5s ${r.d}s both`,
                  }}
                >
                  <span style={{ fontFamily: inter, fontSize: 13, color: C.muted }}>{r.l}</span>
                  <span
                    style={{
                      fontFamily: inter,
                      fontSize: 12,
                      fontWeight: 500,
                      color: r.warn ? "#dc2626" : "#16a34a",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: r.warn ? "#dc2626" : "#16a34a",
                      }}
                    />
                    {r.v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Document Vault */}
          <div
            className="s-rv s-d1 s-ch"
            style={{
              background: C.card,
              border: `1px solid ${C.hairline}`,
              borderRadius: 20,
              padding: 28,
              minHeight: 380,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div style={{ ...eyebrow(), fontSize: 10, marginBottom: 16 }}>Document Vault</div>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 26,
                fontWeight: 300,
                color: C.ink,
                letterSpacing: "-.32px",
                marginBottom: 12,
              }}
            >
              AI-organized data room.
            </div>
            <p style={{ fontFamily: inter, fontSize: 14, color: C.body, lineHeight: 1.55, marginBottom: 20 }}>
              Drop files in. Scorta classifies, redacts, and stages them for buyer diligence and lender review.
            </p>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { f: "2024-tax-return.pdf", tag: "Financial", c: C.mint },
                { f: "master-lease.docx", tag: "Legal", c: C.lav },
                { f: "P&L_Q3.xlsx", tag: "Financial", c: C.mint },
                { f: "top-customers.csv", tag: "Operations", c: C.sky },
              ].map((doc, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    background: C.canvasSoft,
                    border: `1px solid ${C.strong}`,
                    borderRadius: 10,
                    animation: `sSlideRight .5s ${i * 100}ms both`,
                  }}
                >
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={C.muted}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span style={{ fontFamily: "monospace", fontSize: 13, color: C.ink2, flex: 1 }}>{doc.f}</span>
                  <span
                    style={{
                      fontFamily: inter,
                      fontSize: 10,
                      color: doc.c,
                      fontWeight: 600,
                      padding: "2px 8px",
                      background: doc.c + "20",
                      borderRadius: 9999,
                      letterSpacing: ".5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {doc.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* War Room */}
          <div
            className="s-rv s-d2 s-ch"
            style={{
              background: C.card,
              border: `1px solid ${C.hairline}`,
              borderRadius: 20,
              padding: 28,
              minHeight: 380,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ ...eyebrow(), fontSize: 10, marginBottom: 16 }}>The War Room</div>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 26,
                fontWeight: 300,
                color: C.ink,
                letterSpacing: "-.32px",
                marginBottom: 12,
              }}
            >
              Run the deal in one place.
            </div>
            <p style={{ fontFamily: inter, fontSize: 14, color: C.body, lineHeight: 1.55, marginBottom: 20 }}>
              NDA flow, buyer qualification, diligence Q&A, and human approval — every action logged.
            </p>
            <div style={{ flex: 1 }} />
            <div
              style={{
                background: C.canvasSoft,
                border: `1px solid ${C.strong}`,
                borderRadius: 12,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {[
                { n: "Searcher · Texas", stage: "NDA signed", color: C.mint },
                { n: "PE · Charlotte", stage: "Diligence", color: C.lav },
                { n: "Strategic · OH", stage: "LOI drafted", color: C.peach },
              ].map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    animation: `sSlideRight .5s ${i * 120}ms both`,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 35% 35%, ${b.color} 0%, rgba(200,184,224,.4) 60%, transparent 90%)`,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontFamily: inter, fontSize: 13, color: C.ink2, flex: 1 }}>{b.n}</span>
                  <span
                    style={{
                      fontFamily: inter,
                      fontSize: 11,
                      color: C.muted,
                      padding: "2px 8px",
                      background: C.strong,
                      borderRadius: 9999,
                    }}
                  >
                    {b.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────
function SRoadmap() {
  const items = [
    { t: "Lender Desk", d: "Multi-lender financeability scoring", s: "Beta" },
    { t: "Negotiation Table", d: "LOI term modeling", s: "Q3" },
    { t: "Buyer-Facing Site", d: "Per-deal NDA + data room", s: "Live" },
    { t: "Closed Deal Index", d: "Main Street M&A reference data", s: "Coming" },
    { t: "Buyer-Side Product", d: "Curated deal flow for searchers", s: "Q4" },
    { t: "Transaction Infra", d: "Escrow, closing, license transfers", s: "2026" },
  ]
  return (
    <section style={{ padding: "96px 24px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="s-rv" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
          <div style={{ ...eyebrow(), marginBottom: 16 }}>What we&apos;re building next</div>
          <h2
            style={{
              fontFamily: garamond,
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 300,
              letterSpacing: "-.96px",
              lineHeight: 1.08,
              color: C.ink,
            }}
          >
            The transaction infrastructure for Main Street.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {items.map((it, i) => (
            <div
              key={it.t}
              className="s-rv s-ch"
              style={{
                background: C.card,
                border: `1px solid ${C.hairline}`,
                borderRadius: 16,
                padding: 22,
                transitionDelay: `${i * 0.05}s`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <span style={{ ...eyebrow(), fontSize: 10 }}>{it.t}</span>
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 8px",
                    background: it.s === "Live" ? C.mint : it.s === "Beta" ? C.lav : C.strong,
                    color: it.s === "Live" || it.s === "Beta" ? C.ink : C.muted,
                    borderRadius: 9999,
                    letterSpacing: ".5px",
                  }}
                >
                  {it.s}
                </span>
              </div>
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 20,
                  fontWeight: 300,
                  color: C.ink,
                  letterSpacing: "-.2px",
                }}
              >
                {it.d}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function SFinalCTA({ onOpen }: { onOpen: () => void }) {
  return (
    <section
      id="pricing"
      style={{
        background: C.dark,
        color: C.onDark,
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            width: 800,
            height: 800,
            top: "-40%",
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,229,211,.18) 0%, rgba(200,184,224,.1) 45%, transparent 70%)",
            filter: "blur(60px)",
            animation: "sOrbFloat1 18s ease-in-out infinite",
          }}
        />
      </div>
      <div className="s-rv" style={{ position: "relative", textAlign: "center", maxWidth: 740, margin: "0 auto" }}>
        <div style={{ ...eyebrow(true), marginBottom: 18 }}>Three minutes. Free. No login.</div>
        <h2
          style={{
            fontFamily: garamond,
            fontSize: "clamp(40px, 6vw, 76px)",
            fontWeight: 300,
            letterSpacing: "-1.92px",
            lineHeight: 1.02,
            color: C.onDark,
            marginBottom: 22,
          }}
        >
          Find out what your business is <em>actually</em> worth.
        </h2>
        <p
          style={{
            fontFamily: inter,
            fontSize: 17,
            color: C.onDarkBody,
            maxWidth: 540,
            margin: "0 auto 28px",
            lineHeight: 1.55,
          }}
        >
          Start with ExitIQ. We&apos;ll generate your Gap Report and tell you the truth — even if you&apos;re not ready
          to sell yet.
        </p>
        <button onClick={onOpen} style={{ ...btnLight, height: 52, fontSize: 16, padding: "12px 28px" }}>
          Start ExitIQ — free →
        </button>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function SFooter() {
  const cols: Record<string, { l: string; h: string }[]> = {
    Product: [
      { l: "ExitIQ", h: "#exitiq" },
      { l: "The Boardroom", h: "#how" },
      { l: "Gap Report", h: "#products" },
      { l: "SBA Pre-Screen", h: "#products" },
      { l: "Document Vault", h: "#products" },
    ],
    Company: [
      { l: "About", h: "/about" },
      { l: "Founders", h: "/about#founders" },
      { l: "Contact", h: "mailto:suyash@scorta.app" },
    ],
  }

  return (
    <footer style={{ background: C.canvasSoft, borderTop: `1px solid ${C.hairline}`, padding: "64px 24px 32px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(240px, 1.4fr) repeat(2, minmax(140px, 1fr))",
            gap: 32,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, #a7e5d3 0%, #c8b8e0 55%, #0c0a09 100%)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: garamond,
                  fontSize: 22,
                  fontWeight: 400,
                  color: C.ink,
                  letterSpacing: "-.4px",
                }}
              >
                Scorta
              </span>
            </div>
            <p style={{ fontFamily: inter, fontSize: 14, color: C.muted, lineHeight: 1.6, maxWidth: 320 }}>
              An AI-native broker for Main Street home-service businesses.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(cols).map(([heading, links]) => (
            <div key={heading}>
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.ink,
                  textTransform: "uppercase",
                  letterSpacing: ".96px",
                  marginBottom: 14,
                }}
              >
                {heading}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {links.map(({ l, h }) =>
                  h.startsWith("/") ? (
                    <Link
                      key={l}
                      href={h}
                      style={{ fontFamily: inter, fontSize: 14, color: C.body, textDecoration: "none" }}
                    >
                      {l}
                    </Link>
                  ) : (
                    <a
                      key={l}
                      href={h}
                      style={{ fontFamily: inter, fontSize: 14, color: C.body, textDecoration: "none" }}
                    >
                      {l}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: `1px solid ${C.hairline}`,
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontFamily: inter, fontSize: 12, color: C.mutedSoft }}>© 2026 Scorta, Inc.</span>
          <span style={{ fontFamily: inter, fontSize: 12, color: C.mutedSoft }}>
            Scorta is not a registered broker-dealer or investment advisor.
          </span>
        </div>
      </div>
    </footer>
  )
}

// ─── Root Export ──────────────────────────────────────────────────────────────
export function ScortaLanding() {
  useReveal()
  const [exitOpen, setExitOpen] = React.useState(false)
  const [announcementVisible, setAnnouncementVisible] = React.useState(true)
  const barWrapRef = React.useRef<HTMLDivElement>(null)
  const handleOpen = () => setExitOpen(true)

  React.useEffect(() => {
    if (!announcementVisible) return
    const el = barWrapRef.current
    if (!el) return
    const barHeight = el.offsetHeight || 37
    const HIDE_AT = 80
    const SHOW_AT = 50
    const TRANSITION = "height 0.35s ease, opacity 0.3s ease"
    el.style.transition = "none"
    el.style.height = barHeight + "px"
    el.style.opacity = "1"
    void el.offsetHeight
    el.style.transition = TRANSITION
    let hidden = false
    const onScroll = () => {
      const y = window.scrollY
      if (!hidden && y > HIDE_AT) {
        hidden = true
        el.style.height = "0px"
        el.style.opacity = "0"
      } else if (hidden && y < SHOW_AT) {
        hidden = false
        el.style.height = barHeight + "px"
        el.style.opacity = "1"
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [announcementVisible])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS }} />
      {exitOpen && <ExitIQOverlay onClose={() => setExitOpen(false)} />}
      <div
        style={{
          background: C.canvas,
          color: C.body,
          fontFamily: inter,
          minHeight: "100vh",
          overflowX: "clip",
        }}
      >
        <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
          {announcementVisible && (
            <div ref={barWrapRef} style={{ overflow: "hidden" }}>
              <SAnnouncementBar onDismiss={() => setAnnouncementVisible(false)} />
            </div>
          )}
          <SNav onOpen={handleOpen} />
        </div>
        <SHero onOpen={handleOpen} />
        <SIndustryMarquee />
        <SSignalsBand />
        <SSpeedCompare />
        <SIndustrySwitcher />
        <SBoardroom />
        <SGapReport />
        <SProductSurfaces />
        <SRoadmap />
        <SFinalCTA onOpen={handleOpen} />
        <SFooter />
      </div>
    </>
  )
}

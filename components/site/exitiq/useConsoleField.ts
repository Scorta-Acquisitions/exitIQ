// legacy exitIQ console: restored 2026-09-11 from the first build (e35fbbe) at the user's request; see styles/site.css
import { type RefObject, useEffect, useRef } from "react"

/**
 * The first build's "instrument field": a WebGL fractal-noise backdrop behind the hero console and the
 * exitIQ run, restored with the console. `target` (0..1) brightens the field as the visitor's readiness
 * signal grows; `pulse()` adds a short flare when an answer lands. Falls back silently when WebGL is
 * unavailable. Renders one static frame for visitors who prefer reduced motion. (The site's other
 * instrument, `components/site/instrument`, still serves the advisor dialog's strip.)
 */

const VERTEX = "attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}"
const FRAGMENT = [
  "precision highp float;",
  "uniform float T;uniform vec2 R;uniform float C;uniform float I;uniform vec2 M;",
  "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
  "float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
  "return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}",
  "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.1+vec2(3.7,1.9);a*=.5;}return v;}",
  "void main(){",
  " vec2 uv=gl_FragCoord.xy/R;",
  " vec2 st=vec2(uv.x*R.x/R.y,uv.y)+(M-.5)*.06;",
  " vec2 t=vec2(T*.055,T*.042);",
  " vec2 q=vec2(fbm(st*1.45+t),fbm(st*1.45+vec2(5.2,1.3)+t*.9));",
  " vec2 r=vec2(fbm(st+(2.+I*.8)*q+vec2(1.7,9.2)+t*.7),fbm(st+2.*q+vec2(8.3,2.8)+t*.6));",
  " float f=fbm(st+2.8*r+t*.4);",
  " vec3 col=vec3(.028,.082,.058);",
  " col=mix(col,vec3(.050,.150,.100),smoothstep(.18,.72,f)*.80);",
  " col=mix(col,vec3(.070,.215,.130),smoothstep(.42,.90,f)*.55);",
  " col=mix(col,vec3(.160,.720,.360),smoothstep(.60,1.0,f)*(.14+.50*C));",
  " col=mix(col,vec3(.420,.930,.560),smoothstep(.80,1.05,f)*.28*I);",
  " col*=1.+C*.20+I*.12;",
  " vec2 vg=uv*2.-1.;col*=1.-dot(vg,vg)*(.52-.20*C);",
  " gl_FragColor=vec4(col,1.);",
  "}",
].join("\n")

interface Field {
  set: (c: number) => void
  pulse: () => void
  cleanup: () => void
}

function createField(canvas: HTMLCanvasElement, initial: number): Field | null {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" })
  if (!gl) return null

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)
    if (!s) return null
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null
    return s
  }
  const v = compile(gl.VERTEX_SHADER, VERTEX)
  const f = compile(gl.FRAGMENT_SHADER, FRAGMENT)
  if (!v || !f) return null
  const prog = gl.createProgram()
  if (!prog) return null
  gl.attachShader(prog, v)
  gl.attachShader(prog, f)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, "p")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const uT = gl.getUniformLocation(prog, "T")
  const uR = gl.getUniformLocation(prog, "R")
  const uC = gl.getUniformLocation(prog, "C")
  const uI = gl.getUniformLocation(prog, "I")
  const uM = gl.getUniformLocation(prog, "M")

  const st = { target: initial, cur: initial, impulse: 0, mx: 0.5, my: 0.5, raf: 0, dead: false }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    const ow = canvas.offsetWidth
    const oh = canvas.offsetHeight
    if (!ow || !oh) return false
    const w = Math.max(1, Math.round(ow * dpr))
    const h = Math.max(1, Math.round(oh * dpr))
    if (canvas.width === w && canvas.height === h) return true
    canvas.width = w
    canvas.height = h
    gl.viewport(0, 0, w, h)
    gl.uniform2f(uR, w, h)
    return true
  }

  const t0 = performance.now()
  const draw = () => {
    gl.uniform1f(uT, (performance.now() - t0) / 1000)
    gl.uniform1f(uC, st.cur)
    gl.uniform1f(uI, st.impulse)
    gl.uniform2f(uM, st.mx, st.my)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  let visible = true
  const loop = () => {
    st.raf = 0
    if (st.dead) return
    resize()
    const rc = canvas.getBoundingClientRect()
    visible = rc.width > 0 && rc.bottom > 0 && rc.top < (window.innerHeight || 0)
    st.cur += (st.target - st.cur) * 0.045
    st.impulse *= 0.94
    if (visible) {
      draw()
      st.raf = requestAnimationFrame(loop)
    }
  }
  const kick = () => {
    if (!st.raf && !st.dead && !reduce) st.raf = requestAnimationFrame(loop)
  }

  const ro = new ResizeObserver(() => {
    if (resize() && reduce) draw()
    kick()
  })
  ro.observe(canvas)
  const io = new IntersectionObserver(() => kick(), { threshold: 0.01 })
  io.observe(canvas)
  const onMove = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect()
    st.mx = (e.clientX - b.left) / b.width
    st.my = 1 - (e.clientY - b.top) / b.height
  }
  canvas.addEventListener("pointermove", onMove, { passive: true })
  const onLost = (e: Event) => {
    e.preventDefault()
    st.dead = true
    cancelAnimationFrame(st.raf)
    st.raf = 0
  }
  canvas.addEventListener("webglcontextlost", onLost)
  const onScroll = () => kick()
  window.addEventListener("scroll", onScroll, { passive: true })

  if (reduce) {
    const settle = () => {
      if (!resize()) {
        requestAnimationFrame(settle)
        return
      }
      st.cur = st.target
      draw()
    }
    settle()
  } else {
    resize()
    kick()
  }

  return {
    set: (c) => {
      st.target = c
      if (reduce) {
        st.cur = c
        draw()
      } else kick()
    },
    pulse: () => {
      st.impulse = 1
      kick()
    },
    cleanup: () => {
      st.dead = true
      cancelAnimationFrame(st.raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener("scroll", onScroll)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("webglcontextlost", onLost)
    },
  }
}

export function useConsoleField(canvasRef: RefObject<HTMLCanvasElement | null>, target: number) {
  const field = useRef<Field | null>(null)
  const initial = useRef(target)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    field.current = createField(canvas, initial.current)
    return () => {
      field.current?.cleanup()
      field.current = null
    }
  }, [canvasRef])

  useEffect(() => {
    field.current?.set(target)
  }, [target])

  const pulse = useRef(() => field.current?.pulse())
  return pulse.current
}

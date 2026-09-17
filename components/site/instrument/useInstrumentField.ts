import { type RefObject, useEffect, useRef } from "react"
import { prefersReducedMotion } from "@/components/site/motion/reducedMotion"
import { readFieldColours } from "@/lib/site/instrument/colour"
import { FIELD_TEXTURES } from "@/lib/site/instrument/level"
import { clamp01 } from "@/lib/site/motion"

/**
 * The instrument field: a WebGL material inside the two instrument cards that responds to the visitor's
 * answers. `target` (0..1) is the level the field eases toward; `pulse()` adds a brief flare when an
 * answer lands. The material is three glass textures blended by level, with a slowly drifting domain
 * warp that leans a little toward the visitor's pointer (a soft lens pull, read from the positioned
 * parent because the canvas itself is inert); until they arrive (or if they never do) a procedural noise
 * field in the same three tones stands in. Colours come from the design tokens declared on the document
 * root. Falls back silently when WebGL is unavailable, and renders one static frame, pointer at rest, for
 * visitors who prefer reduced motion.
 */

/** Fraction of the remaining distance the level covers each frame. */
const EASE = 0.045
/** Per-frame decay of the flare. */
const DECAY = 0.94
/** Fraction of the remaining distance the pointer position covers each frame. */
const POINTER_EASE = 0.08
/** Where the pointer rests (the centre of the canvas) before the visitor arrives and after they leave. */
const POINTER_REST = 0.5
/** The field is a backdrop, so it never needs more than 1.5 device pixels per CSS pixel. */
const MAX_DPR = 1.5

const VERTEX = "attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}"
const FRAGMENT = [
  "precision highp float;",
  "uniform float T;uniform vec2 R;uniform float D;uniform float C;uniform float I;uniform float X;",
  "uniform vec3 K0;uniform vec3 K1;uniform vec3 K2;",
  // The pointer in 0..1 texture space, y up like gl_FragCoord; (.5,.5) when no pointer is over the card.
  "uniform vec2 M;",
  "uniform sampler2D S0;uniform sampler2D S1;uniform sampler2D S2;",
  "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
  "float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
  "return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}",
  "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.1+vec2(3.7,1.9);a*=.5;}return v;}",
  "void main(){",
  " vec2 uv=gl_FragCoord.xy/R;",
  // Texture space is measured in CSS pixels (D is the device pixel ratio applied), so one tile spans about
  // 525 CSS px in both instruments whatever the element's shape: the 980x72 strip and the hero pane alike.
  " vec2 st=gl_FragCoord.xy/(420.0*D);",
  " vec2 t=vec2(T*.03,T*.022);",
  // A small fbm offset drifting with time warps the lookup so the material moves slowly.
  " vec2 q=vec2(fbm(st*1.3+t),fbm(st*1.3+vec2(5.2,1.3)-t*.8));",
  " vec2 w=st+(q-.5)*.35;",
  // The lens: the warp leans toward the pointer through a soft radial pull that fades within about a third
  // of the element, so the material follows the cursor a few pixels and nothing else moves.
  " vec2 d=uv-M;",
  " float g=exp(-dot(d,d)*7.0);",
  " w-=d*g*.10;",
  " float a=smoothstep(0.,.6,C);",
  " float b=smoothstep(.6,1.,C);",
  // The textures: calm to mid over the lower part of the range, bright only toward the top.
  " vec3 tex=mix(mix(texture2D(S0,w*.8).rgb,texture2D(S1,w*.8).rgb,a),texture2D(S2,w*.8).rgb,b);",
  // The procedural stand-in in the same three tones.
  " float f=fbm(w*1.6+t*.5);",
  " vec3 tone=mix(mix(K0,K1,a),K2,b);",
  " vec3 pro=mix(K0,tone,smoothstep(.25,.85,f));",
  " vec3 col=mix(pro,tex,X);",
  // The flare: a brief lift toward the highlight through a soft noise mask.
  " float m=fbm(w*2.2+vec2(9.1,4.3)+t*1.5);",
  " col=mix(col,K2,I*.35*smoothstep(.35,.8,m));",
  // Legibility: the field stays below the copy and labels drawn over it, but the idle strip sits at or
  // just above the card surface rather than reading as a recess.
  " col=mix(K0,col,.58+.32*C);",
  // The vignette follows the element's aspect, so a wide strip darkens only toward its ends, not its rows.
  " vec2 vg=uv*2.-1.;vg.y*=min(1.,R.y/R.x);",
  " col*=1.-dot(vg,vg)*.35;",
  " gl_FragColor=vec4(col,1.);",
  "}",
].join("\n")

interface Field {
  set: (c: number) => void
  pulse: () => void
  cleanup: () => void
}

function createField(canvas: HTMLCanvasElement, initial: number): Field | null {
  const reduce = prefersReducedMotion()
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
  const uD = gl.getUniformLocation(prog, "D")
  const uC = gl.getUniformLocation(prog, "C")
  const uI = gl.getUniformLocation(prog, "I")
  const uX = gl.getUniformLocation(prog, "X")
  const uM = gl.getUniformLocation(prog, "M")

  // The three tones come from the design tokens as declared on the root (`@theme` emits them there), so the
  // accent stays the deep action green even though the dark card re-points `--color-primary` inside itself.
  const styles = window.getComputedStyle(document.documentElement)
  const colours = readFieldColours((name) => styles.getPropertyValue(name))
  gl.uniform3f(gl.getUniformLocation(prog, "K0"), ...colours.base)
  gl.uniform3f(gl.getUniformLocation(prog, "K1"), ...colours.accent)
  gl.uniform3f(gl.getUniformLocation(prog, "K2"), ...colours.highlight)

  const st = {
    target: initial,
    cur: initial,
    impulse: 0,
    pointer: { x: POINTER_REST, y: POINTER_REST },
    pointerTarget: { x: POINTER_REST, y: POINTER_REST },
    raf: 0,
    dead: false,
    textured: false,
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
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
    gl.uniform1f(uD, dpr)
    return true
  }

  const t0 = performance.now()
  const draw = () => {
    gl.uniform1f(uT, (performance.now() - t0) / 1000)
    gl.uniform1f(uC, st.cur)
    gl.uniform1f(uI, st.impulse)
    gl.uniform1f(uX, st.textured ? 1 : 0)
    gl.uniform2f(uM, st.pointer.x, st.pointer.y)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  const loop = () => {
    st.raf = 0
    if (st.dead) return
    resize()
    const rc = canvas.getBoundingClientRect()
    const visible = rc.width > 0 && rc.bottom > 0 && rc.top < (window.innerHeight || 0)
    st.cur += (st.target - st.cur) * EASE
    st.impulse *= DECAY
    st.pointer.x += (st.pointerTarget.x - st.pointer.x) * POINTER_EASE
    st.pointer.y += (st.pointerTarget.y - st.pointer.y) * POINTER_EASE
    if (visible) {
      draw()
      st.raf = requestAnimationFrame(loop)
    }
  }
  const kick = () => {
    if (!st.raf && !st.dead && !reduce) st.raf = requestAnimationFrame(loop)
  }

  // Textures: one unit per level. A 1×1 placeholder keeps every sampler complete (so the draw never warns)
  // until its image is in; X flips to 1 only once all three have arrived, and stays 0 if any fails.
  const slots: Array<{ src: string; tex: WebGLTexture }> = []
  for (const src of FIELD_TEXTURES) {
    const tex = gl.createTexture()
    if (tex) slots.push({ src, tex })
  }
  if (slots.length === FIELD_TEXTURES.length) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    let loaded = 0
    slots.forEach(({ src, tex }, unit) => {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
      gl.uniform1i(gl.getUniformLocation(prog, `S${unit}`), unit)
      const img = new Image()
      img.onload = () => {
        if (st.dead) return
        gl.activeTexture(gl.TEXTURE0 + unit)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        loaded += 1
        if (loaded < slots.length) return
        st.textured = true
        if (!reduce) kick()
        else if (resize()) draw()
      }
      img.src = src
    })
  }

  const ro = new ResizeObserver(() => {
    if (resize() && reduce) draw()
    kick()
  })
  ro.observe(canvas)
  const io = new IntersectionObserver(() => kick(), { threshold: 0.01 })
  io.observe(canvas)
  const onLost = (e: Event) => {
    e.preventDefault()
    st.dead = true
    cancelAnimationFrame(st.raf)
    st.raf = 0
  }
  canvas.addEventListener("webglcontextlost", onLost)
  const onScroll = () => kick()
  window.addEventListener("scroll", onScroll, { passive: true })

  // Pointer input. The canvas is pointer-events-none, so the positioned parent (the hero's graph pane, the
  // exitIQ strip) reports the cursor; the position is measured against the canvas box, which fills it. A
  // finger is a tap rather than a hover, so touch is ignored; leaving lets the pull ease back to rest. Under
  // reduced motion nothing is attached and the pointer stays centred.
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return
    const rc = canvas.getBoundingClientRect()
    if (!rc.width || !rc.height) return
    st.pointerTarget.x = clamp01((e.clientX - rc.left) / rc.width)
    st.pointerTarget.y = clamp01(1 - (e.clientY - rc.top) / rc.height)
    kick()
  }
  const onPointerLeave = () => {
    st.pointerTarget.x = POINTER_REST
    st.pointerTarget.y = POINTER_REST
    kick()
  }
  const pointerHost = reduce ? null : canvas.parentElement
  if (pointerHost) {
    pointerHost.addEventListener("pointermove", onPointerMove)
    pointerHost.addEventListener("pointerleave", onPointerLeave)
  }

  // The mark tests and the e2e suite read to know the field is really running (no WebGL leaves it off).
  canvas.dataset.live = "true"

  if (reduce) {
    // One static frame, drawn as soon as the canvas has a layout box.
    const settle = () => {
      if (st.dead) return
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
      if (c === st.target) return
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
      delete canvas.dataset.live
      cancelAnimationFrame(st.raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener("scroll", onScroll)
      canvas.removeEventListener("webglcontextlost", onLost)
      if (pointerHost) {
        pointerHost.removeEventListener("pointermove", onPointerMove)
        pointerHost.removeEventListener("pointerleave", onPointerLeave)
      }
    },
  }
}

/**
 * Drives the instrument field on `canvasRef`. Returns a stable `pulse()` that flares the field once.
 * Without WebGL (or when the shader cannot be built) nothing runs and both `target` and `pulse()` are no-ops.
 */
export function useInstrumentField(canvasRef: RefObject<HTMLCanvasElement | null>, target: number): () => void {
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

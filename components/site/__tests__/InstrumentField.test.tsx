import { act, fireEvent, render, screen } from "@testing-library/react"
import { useRef } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { InstrumentField } from "@/components/site/instrument/InstrumentField"
import { useInstrumentField } from "@/components/site/instrument/useInstrumentField"
import { FIELD_TEXTURES } from "@/lib/site/instrument/level"
import {
  installSceneDrivers,
  pinViewport,
  restoreMatchMedia,
  type SceneDrivers,
  setRect,
  stubMatchMedia,
} from "./scene-test-utils"

const realGetContext = HTMLCanvasElement.prototype.getContext
const realResizeObserver = window.ResizeObserver
const realDpr = window.devicePixelRatio

type GlOverrides = Partial<Record<"shaderOk" | "programOk" | "shaderNull" | "programNull" | "textureNull", boolean>>

/** A minimal WebGL stand-in: every handle is a tagged object so uniform writes can be matched by name. */
function fakeGl(overrides: GlOverrides = {}) {
  return {
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    FLOAT: 5126,
    TRIANGLE_STRIP: 5,
    TEXTURE_2D: 3553,
    TEXTURE0: 33984,
    RGBA: 6408,
    UNSIGNED_BYTE: 5121,
    TEXTURE_WRAP_S: 10242,
    TEXTURE_WRAP_T: 10243,
    TEXTURE_MIN_FILTER: 10241,
    TEXTURE_MAG_FILTER: 10240,
    LINEAR: 9729,
    MIRRORED_REPEAT: 33648,
    UNPACK_FLIP_Y_WEBGL: 37440,
    createShader: vi.fn((type: number) => (overrides.shaderNull ? null : { shader: type })),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => overrides.shaderOk ?? true),
    createProgram: vi.fn(() => (overrides.programNull ? null : { program: true })),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => overrides.programOk ?? true),
    useProgram: vi.fn(),
    createBuffer: vi.fn(() => ({ buffer: true })),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    getUniformLocation: vi.fn((_p: unknown, name: string) => ({ name })),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform3f: vi.fn(),
    createTexture: vi.fn(() => (overrides.textureNull ? null : { texture: true })),
    bindTexture: vi.fn(),
    texParameteri: vi.fn(),
    texImage2D: vi.fn(),
    activeTexture: vi.fn(),
    pixelStorei: vi.fn(),
    viewport: vi.fn(),
    drawArrays: vi.fn(),
    getExtension: vi.fn(() => null),
  }
}
type FakeGl = ReturnType<typeof fakeGl>

function installGl(gl: FakeGl) {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => gl) as unknown as typeof realGetContext
}

/** Stand-in for `Image`: records every instance so a test can deliver `load` or `error` by hand. */
class FakeImage {
  static instances: FakeImage[] = []
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ""
  constructor() {
    FakeImage.instances.push(this)
  }
}
const loadAllImages = () => FakeImage.instances.forEach((img) => img.onload?.())

/** Stand-in for `ResizeObserver` that lets a test fire the callback. */
const resizeCallbacks: ResizeObserverCallback[] = []
const roDisconnect = vi.fn()
class FakeResizeObserver implements ResizeObserver {
  constructor(cb: ResizeObserverCallback) {
    resizeCallbacks.push(cb)
  }
  observe() {}
  unobserve() {}
  disconnect = roDisconnect
}
const fireResize = () =>
  resizeCallbacks.forEach((cb) => cb([], { disconnect() {}, observe() {}, unobserve() {} } as ResizeObserver))

/**
 * jsdom lays nothing out, so give the canvas a box inside the viewport. (Not 300x150: that is jsdom's
 * default canvas size, and `resize()` skips the viewport update when the size is unchanged.)
 */
function layOut(canvas: HTMLCanvasElement, width = 320, height = 160) {
  Object.defineProperty(canvas, "offsetWidth", { configurable: true, value: width })
  Object.defineProperty(canvas, "offsetHeight", { configurable: true, value: height })
  setRect(canvas, { top: 0, height, width })
}

const writes1f = (gl: FakeGl, name: string) =>
  gl.uniform1f.mock.calls.filter((c) => (c[0] as { name: string }).name === name).map((c) => c[1])
const writes2f = (gl: FakeGl, name: string) =>
  gl.uniform2f.mock.calls.filter((c) => (c[0] as { name: string }).name === name).map((c) => c.slice(1))
const writes3f = (gl: FakeGl, name: string) =>
  gl.uniform3f.mock.calls.filter((c) => (c[0] as { name: string }).name === name).map((c) => c.slice(1))
/** The most recent pointer (M) write as [x, y]; fails loudly when no frame has drawn yet. */
const lastPointer = (gl: FakeGl): [number, number] => {
  const last = writes2f(gl, "M").at(-1)
  if (!last) throw new Error("no pointer write yet")
  return [last[0] as number, last[1] as number]
}

/**
 * jsdom 26 has no `PointerEvent`. It extends `MouseEvent`, so a mouse event carrying `pointerType` is the
 * exact shape the field's handler reads (clientX, clientY, pointerType).
 */
function pointerMove(el: Element, clientX: number, clientY: number, pointerType = "mouse") {
  const event = new MouseEvent("pointermove", { clientX, clientY, bubbles: true })
  Object.defineProperty(event, "pointerType", { value: pointerType })
  fireEvent(el, event)
}
const pointerLeave = (el: Element) => fireEvent(el, new MouseEvent("pointerleave"))

const field = () => screen.getByTestId("field") as HTMLCanvasElement

describe("<InstrumentField />", () => {
  let drivers: SceneDrivers
  beforeEach(() => {
    drivers = installSceneDrivers()
    FakeImage.instances = []
    resizeCallbacks.length = 0
    roDisconnect.mockReset()
    vi.stubGlobal("Image", FakeImage)
    window.ResizeObserver = FakeResizeObserver
    stubMatchMedia(false)
  })
  afterEach(() => {
    drivers.restore()
    vi.restoreAllMocks()
    restoreMatchMedia()
    window.ResizeObserver = realResizeObserver
    window.devicePixelRatio = realDpr
    HTMLCanvasElement.prototype.getContext = realGetContext
  })

  describe("the canvas", () => {
    beforeEach(() => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof realGetContext
    })

    it("is an inert, aria-hidden layer filling its parent that exposes its target to two decimals", () => {
      render(<InstrumentField target={0.3} pulseKey={0} />)
      const canvas = screen.getByTestId("instrument-field")
      expect(canvas.tagName).toBe("CANVAS")
      expect(canvas).toHaveAttribute("aria-hidden", "true")
      expect(canvas).toHaveAttribute("data-target", "0.30")
      expect(Array.from(canvas.classList)).toEqual(["pointer-events-none", "absolute", "inset-0", "h-full", "w-full"])
    })

    it("takes a test id and merges extra classes through cn, so a height override replaces h-full", () => {
      render(<InstrumentField target={0.125} pulseKey={0} className="h-14 opacity-80" testId="field" />)
      const canvas = field()
      expect(canvas).toHaveAttribute("data-target", "0.13")
      expect(Array.from(canvas.classList).sort()).toEqual(
        ["pointer-events-none", "absolute", "inset-0", "w-full", "h-14", "opacity-80"].sort()
      )
      expect(canvas).not.toHaveClass("h-full")
    })
  })

  describe("without WebGL", () => {
    it("never marks the canvas live without WebGL", () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof realGetContext
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      expect(screen.getByTestId("field")).not.toHaveAttribute("data-live")
    })

    it("starts no loop, loads no texture, and does not throw when getContext returns null", () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof realGetContext
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledTimes(1)
      expect(drivers.raf).not.toHaveBeenCalled()
      expect(FakeImage.instances).toEqual([])
      expect(drivers.watchers(field())).toBe(0)
    })

    it("lets target and pulseKey changes run as no-ops, and unmounts cleanly", () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof realGetContext
      const removeWindow = vi.spyOn(window, "removeEventListener")
      const { rerender, unmount } = render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      expect(() => rerender(<InstrumentField target={0.9} pulseKey={1} testId="field" />)).not.toThrow()
      expect(field()).toHaveAttribute("data-target", "0.90")
      expect(drivers.raf).not.toHaveBeenCalled()
      expect(() => unmount()).not.toThrow()
      expect(removeWindow).not.toHaveBeenCalledWith("scroll", expect.any(Function))
      expect(drivers.caf).not.toHaveBeenCalled()
    })

    it("does nothing when the hook's ref is never attached to a canvas", () => {
      const gl = fakeGl()
      installGl(gl)
      function Detached() {
        const ref = useRef<HTMLCanvasElement>(null)
        const pulse = useInstrumentField(ref, 0.3)
        return (
          <button type="button" onClick={() => pulse()}>
            pulse
          </button>
        )
      }
      const { unmount } = render(<Detached />)
      expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled()
      expect(() => fireEvent.click(screen.getByRole("button", { name: "pulse" }))).not.toThrow()
      expect(drivers.raf).not.toHaveBeenCalled()
      expect(() => unmount()).not.toThrow()
    })

    it("gives up silently when the context cannot allocate a shader", () => {
      const gl = fakeGl({ shaderNull: true })
      installGl(gl)
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      expect(gl.shaderSource).not.toHaveBeenCalled()
      expect(gl.createProgram).not.toHaveBeenCalled()
      expect(gl.drawArrays).not.toHaveBeenCalled()
      expect(drivers.raf).not.toHaveBeenCalled()
      expect(FakeImage.instances).toEqual([])
    })

    it("gives up silently when the shader fails to compile", () => {
      const gl = fakeGl({ shaderOk: false })
      installGl(gl)
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      expect(gl.createProgram).not.toHaveBeenCalled()
      expect(gl.drawArrays).not.toHaveBeenCalled()
      expect(drivers.raf).not.toHaveBeenCalled()
      expect(FakeImage.instances).toEqual([])
    })

    it("gives up silently when the context cannot allocate a program", () => {
      const gl = fakeGl({ programNull: true })
      installGl(gl)
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      expect(gl.attachShader).not.toHaveBeenCalled()
      expect(gl.useProgram).not.toHaveBeenCalled()
      expect(drivers.raf).not.toHaveBeenCalled()
    })

    it("gives up silently when the program fails to link", () => {
      const gl = fakeGl({ programOk: false })
      installGl(gl)
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      expect(gl.linkProgram).toHaveBeenCalledTimes(1)
      expect(gl.useProgram).not.toHaveBeenCalled()
      expect(gl.drawArrays).not.toHaveBeenCalled()
      expect(drivers.raf).not.toHaveBeenCalled()
      expect(FakeImage.instances).toEqual([])
    })
  })

  describe("with reduced motion", () => {
    let gl: FakeGl
    beforeEach(() => {
      stubMatchMedia(true)
      gl = fakeGl()
      installGl(gl)
    })

    it("requests a low-power WebGL context", () => {
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith("webgl", {
        antialias: false,
        powerPreference: "low-power",
      })
    })

    it("retries sizing via one frame until the canvas has a layout box, then draws one static frame", () => {
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      // No layout yet: the settle step re-queues itself and nothing has been drawn.
      expect(drivers.raf).toHaveBeenCalledTimes(1)
      expect(gl.viewport).not.toHaveBeenCalled()
      expect(gl.drawArrays).not.toHaveBeenCalled()
      act(() => drivers.flushFrames())
      expect(drivers.raf).toHaveBeenCalledTimes(2)
      expect(gl.drawArrays).not.toHaveBeenCalled()
      layOut(field())
      act(() => drivers.flushFrames())
      expect(field().width).toBe(320)
      expect(field().height).toBe(160)
      expect(gl.viewport).toHaveBeenCalledWith(0, 0, 320, 160)
      expect(gl.uniform2f).toHaveBeenCalledWith({ name: "R" }, 320, 160)
      expect(writes1f(gl, "D")).toEqual([1])
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
      expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_STRIP, 0, 4)
      expect(writes1f(gl, "C")).toEqual([0.3])
      expect(writes1f(gl, "I")).toEqual([0])
      expect(writes1f(gl, "X")).toEqual([0])
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("redraws immediately at the new level when the target changes, and not when it is unchanged", () => {
      const { rerender } = render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      layOut(field())
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
      rerender(<InstrumentField target={0.8} pulseKey={0} testId="field" />)
      expect(writes1f(gl, "C")).toEqual([0.3, 0.8])
      expect(gl.drawArrays).toHaveBeenCalledTimes(2)
      rerender(<InstrumentField target={0.8} pulseKey={0} className="x" testId="field" />)
      expect(gl.drawArrays).toHaveBeenCalledTimes(2)
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("does not animate a pulse", () => {
      const { rerender } = render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      layOut(field())
      act(() => drivers.flushFrames())
      rerender(<InstrumentField target={0.3} pulseKey={1} testId="field" />)
      expect(drivers.raf).toHaveBeenCalledTimes(1)
      expect(drivers.pendingFrames()).toBe(0)
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
      expect(writes1f(gl, "I")).toEqual([0])
    })

    it("redraws the static frame at the new size when the canvas is resized", () => {
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      layOut(field())
      act(() => drivers.flushFrames())
      expect(resizeCallbacks).toHaveLength(1)
      layOut(field(), 400, 200)
      act(() => fireResize())
      expect(gl.viewport).toHaveBeenLastCalledWith(0, 0, 400, 200)
      expect(writes2f(gl, "R")).toEqual([
        [320, 160],
        [400, 200],
      ])
      expect(writes1f(gl, "D")).toEqual([1, 1])
      expect(gl.drawArrays).toHaveBeenCalledTimes(2)
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("does not draw on a resize before the canvas has a layout box", () => {
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      act(() => fireResize())
      expect(gl.drawArrays).not.toHaveBeenCalled()
      expect(gl.uniform2f).not.toHaveBeenCalled()
      expect(writes1f(gl, "D")).toEqual([])
    })

    it("redraws once, textured, when all three images arrive after the static frame", () => {
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      layOut(field())
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "X")).toEqual([0])
      act(() => loadAllImages())
      expect(writes1f(gl, "X")).toEqual([0, 1])
      expect(gl.drawArrays).toHaveBeenCalledTimes(2)
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("waits for the layout box when the images arrive first, then draws the textured frame once", () => {
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      act(() => loadAllImages())
      expect(gl.drawArrays).not.toHaveBeenCalled()
      layOut(field())
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
      expect(writes1f(gl, "X")).toEqual([1])
    })

    it("stops the settle retry on unmount", () => {
      const { unmount } = render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      unmount()
      act(() => drivers.flushFrames())
      expect(drivers.pendingFrames()).toBe(0)
      expect(gl.drawArrays).not.toHaveBeenCalled()
    })

    it("attaches no pointer listeners to the parent and keeps the pointer at rest, whatever the cursor does", () => {
      const container = document.body.appendChild(document.createElement("div"))
      const listen = vi.spyOn(container, "addEventListener")
      const { rerender } = render(<InstrumentField target={0.3} pulseKey={0} testId="field" />, { container })
      expect(field().parentElement).toBe(container)
      expect(listen).not.toHaveBeenCalledWith("pointermove", expect.any(Function))
      expect(listen).not.toHaveBeenCalledWith("pointerleave", expect.any(Function))
      layOut(field())
      act(() => drivers.flushFrames())
      expect(writes2f(gl, "M")).toEqual([[0.5, 0.5]])
      pointerMove(container, 320, 80)
      expect(drivers.pendingFrames()).toBe(0)
      // The next static frame (a level change) still paints the pointer centred.
      rerender(<InstrumentField target={0.8} pulseKey={0} testId="field" />)
      expect(writes2f(gl, "M")).toEqual([
        [0.5, 0.5],
        [0.5, 0.5],
      ])
    })
  })

  describe("with WebGL and motion allowed", () => {
    let gl: FakeGl
    beforeEach(() => {
      gl = fakeGl()
      installGl(gl)
    })

    function mountLaidOut(target = 0.3, pulseKey = 0) {
      const utils = render(<InstrumentField target={target} pulseKey={pulseKey} testId="field" />)
      const canvas = field()
      layOut(canvas)
      return { ...utils, canvas }
    }

    it("compiles both shaders, links the program, and uploads the full-screen quad", () => {
      mountLaidOut()
      expect(gl.createShader).toHaveBeenCalledWith(gl.VERTEX_SHADER)
      expect(gl.createShader).toHaveBeenCalledWith(gl.FRAGMENT_SHADER)
      expect(gl.linkProgram).toHaveBeenCalledTimes(1)
      expect(gl.useProgram).toHaveBeenCalledTimes(1)
      expect(gl.bufferData).toHaveBeenCalledWith(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      )
      expect(gl.vertexAttribPointer).toHaveBeenCalledWith(0, 2, gl.FLOAT, false, 0, 0)
    })

    it("binds one mirrored, linearly filtered texture per level to units 0..2 with a 1x1 placeholder each", () => {
      mountLaidOut()
      expect(gl.createTexture).toHaveBeenCalledTimes(3)
      expect(gl.pixelStorei).toHaveBeenCalledWith(gl.UNPACK_FLIP_Y_WEBGL, 1)
      expect(gl.activeTexture.mock.calls.map((c) => c[0])).toEqual([gl.TEXTURE0, gl.TEXTURE0 + 1, gl.TEXTURE0 + 2])
      expect(gl.bindTexture).toHaveBeenCalledTimes(3)
      expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, { texture: true })
      const params = gl.texParameteri.mock.calls.map((c) => [c[1], c[2]])
      expect(params).toHaveLength(12)
      for (const unit of [0, 1, 2]) {
        expect(params.slice(unit * 4, unit * 4 + 4)).toEqual([
          [gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT],
          [gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT],
          [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
          [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
        ])
      }
      expect(gl.texImage2D).toHaveBeenCalledTimes(3)
      for (const call of gl.texImage2D.mock.calls) {
        expect(call).toEqual([
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          1,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array([0, 0, 0, 255]),
        ])
      }
      expect(gl.uniform1i.mock.calls).toEqual([
        [{ name: "S0" }, 0],
        [{ name: "S1" }, 1],
        [{ name: "S2" }, 2],
      ])
      expect(FakeImage.instances.map((i) => i.src)).toEqual([...FIELD_TEXTURES])
    })

    it("measures texture space in CSS pixels (420 device px over D) so one tile spans the same width in any shape", () => {
      mountLaidOut()
      const fragment = gl.shaderSource.mock.calls[1]?.[1] as string
      expect(fragment).toContain("uniform float D;")
      expect(fragment).toContain(" vec2 st=gl_FragCoord.xy/(420.0*D);")
      // The old aspect-stretched mapping tiled the 980x72 strip about eleven times.
      expect(fragment).not.toContain("uv.x*R.x/R.y")
      // The vignette follows the element's aspect: a wide strip darkens toward its ends, not its top and bottom rows.
      expect(fragment).toContain(" vec2 vg=uv*2.-1.;vg.y*=min(1.,R.y/R.x);")
      expect(fragment).toContain(" col*=1.-dot(vg,vg)*.35;")
      // The legibility floor: the idle field sits at or just above the card surface, never as a recess.
      expect(fragment).toContain(" col=mix(K0,col,.58+.32*C);")
      expect(fragment).not.toContain(".5+.3*C")
    })

    it("declares the pointer uniform and pulls the warp toward it right after the domain warp", () => {
      mountLaidOut()
      const fragment = gl.shaderSource.mock.calls[1]?.[1] as string
      expect(fragment).toContain("uniform vec2 M;")
      expect(fragment).toContain(" vec2 w=st+(q-.5)*.35;")
      expect(fragment).toContain(" vec2 d=uv-M;")
      expect(fragment).toContain(" float g=exp(-dot(d,d)*7.0);")
      expect(fragment).toContain(" w-=d*g*.10;")
      // The pull lands on w after the warp and before any lookup reads w.
      const at = (line: string) => fragment.indexOf(line)
      expect(at(" vec2 w=st+(q-.5)*.35;")).toBeLessThan(at(" vec2 d=uv-M;"))
      expect(at(" vec2 d=uv-M;")).toBeLessThan(at(" float g=exp(-dot(d,d)*7.0);"))
      expect(at(" float g=exp(-dot(d,d)*7.0);")).toBeLessThan(at(" w-=d*g*.10;"))
      expect(at(" w-=d*g*.10;")).toBeLessThan(at("texture2D(S0,w*.8)"))
      expect(at(" w-=d*g*.10;")).toBeLessThan(at(" float f=fbm(w*1.6+t*.5);"))
    })

    it("writes the applied device pixel ratio to D once per size change", () => {
      mountLaidOut()
      // The canvas had no layout box at mount, so the first frame is the first sizing pass.
      expect(gl.uniform2f).not.toHaveBeenCalled()
      expect(writes1f(gl, "D")).toEqual([])
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "D")).toEqual([1])
      // Frames at the same size do not rewrite it.
      act(() => drivers.flushFrames())
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "D")).toEqual([1])
      layOut(field(), 980, 72)
      act(() => fireResize())
      expect(gl.uniform2f).toHaveBeenLastCalledWith({ name: "R" }, 980, 72)
      expect(writes1f(gl, "D")).toEqual([1, 1])
    })

    it("queues one frame on mount and draws the quad when it runs", () => {
      mountLaidOut()
      expect(drivers.raf).toHaveBeenCalledTimes(1)
      expect(gl.drawArrays).not.toHaveBeenCalled()
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
      expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_STRIP, 0, 4)
      expect(gl.viewport).toHaveBeenCalledWith(0, 0, 320, 160)
      expect(gl.uniform2f).toHaveBeenCalledWith({ name: "R" }, 320, 160)
      expect(writes1f(gl, "T")).toHaveLength(1)
      expect(drivers.pendingFrames()).toBe(1)
    })

    it("caps the device pixel ratio at 1.5", () => {
      window.devicePixelRatio = 3
      mountLaidOut()
      act(() => drivers.flushFrames())
      expect(field().width).toBe(480)
      expect(field().height).toBe(240)
      expect(gl.viewport).toHaveBeenCalledWith(0, 0, 480, 240)
      expect(writes1f(gl, "D")).toEqual([1.5])
    })

    it("treats a missing device pixel ratio as 1", () => {
      window.devicePixelRatio = 0
      mountLaidOut()
      act(() => drivers.flushFrames())
      expect(field().width).toBe(320)
      expect(field().height).toBe(160)
      expect(gl.viewport).toHaveBeenCalledWith(0, 0, 320, 160)
      expect(writes1f(gl, "D")).toEqual([1])
    })

    it("holds the level steady at the target instead of drifting", () => {
      mountLaidOut(0.3)
      act(() => drivers.flushFrames())
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "C")).toEqual([0.3, 0.3])
    })

    it("eases the level toward a new target by 4.5% of the remaining distance per frame", () => {
      const { rerender } = mountLaidOut(0)
      act(() => drivers.flushFrames())
      rerender(<InstrumentField target={1} pulseKey={0} testId="field" />)
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "C").at(-1)).toBeCloseTo(0.045, 10)
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "C").at(-1)).toBeCloseTo(0.045 + 0.955 * 0.045, 10)
    })

    it("flares the impulse to 1 when pulseKey changes and decays it by 0.94 per frame", () => {
      const { rerender } = mountLaidOut(0.3, 0)
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "I")).toEqual([0])
      rerender(<InstrumentField target={0.3} pulseKey={1} testId="field" />)
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "I").at(-1)).toBeCloseTo(0.94, 10)
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "I").at(-1)).toBeCloseTo(0.8836, 10)
    })

    it("does not pulse on mount or on a re-render that keeps the same pulseKey", () => {
      const { rerender } = mountLaidOut(0.3, 7)
      act(() => drivers.flushFrames())
      rerender(<InstrumentField target={0.3} pulseKey={7} className="x" testId="field" />)
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "I")).toEqual([0, 0])
    })

    it("restarts a parked loop when the pulse lands", () => {
      const { canvas, rerender } = mountLaidOut()
      setRect(canvas, { top: 2000, height: 160, width: 320 })
      act(() => drivers.flushFrames())
      expect(drivers.pendingFrames()).toBe(0)
      setRect(canvas, { top: 0, height: 160, width: 320 })
      rerender(<InstrumentField target={0.3} pulseKey={1} testId="field" />)
      expect(drivers.pendingFrames()).toBe(1)
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "I")).toEqual([0.94])
    })

    it("reports X as 0 until all three textures are in, then 1", () => {
      mountLaidOut()
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "X")).toEqual([0])
      const [calm, mid, bright] = FakeImage.instances
      act(() => calm!.onload?.())
      act(() => mid!.onload?.())
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "X")).toEqual([0, 0])
      act(() => bright!.onload?.())
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "X")).toEqual([0, 0, 1])
      // Each arrival re-uploads onto its own unit.
      expect(gl.texImage2D).toHaveBeenCalledTimes(6)
      expect(gl.texImage2D.mock.calls.slice(3)).toEqual([
        [gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, calm],
        [gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mid],
        [gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bright],
      ])
      expect(gl.activeTexture.mock.calls.slice(3).map((c) => c[0])).toEqual([
        gl.TEXTURE0,
        gl.TEXTURE0 + 1,
        gl.TEXTURE0 + 2,
      ])
    })

    it("stays procedural (X stays 0) when one texture fails to load", () => {
      mountLaidOut()
      const [calm, mid, bright] = FakeImage.instances
      act(() => {
        calm!.onload?.()
        mid!.onerror?.()
        bright!.onload?.()
      })
      act(() => drivers.flushFrames())
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "X")).toEqual([0, 0])
      expect(gl.texImage2D).toHaveBeenCalledTimes(5)
    })

    it("restarts a parked loop when the textures arrive", () => {
      const { canvas } = mountLaidOut()
      setRect(canvas, { top: 2000, height: 160, width: 320 })
      act(() => drivers.flushFrames())
      expect(drivers.pendingFrames()).toBe(0)
      setRect(canvas, { top: 0, height: 160, width: 320 })
      act(() => loadAllImages())
      expect(drivers.pendingFrames()).toBe(1)
      act(() => drivers.flushFrames())
      expect(writes1f(gl, "X")).toEqual([1])
    })

    it("loads no textures and stays procedural when the context cannot allocate one", () => {
      installGl(fakeGl({ textureNull: true }))
      const glNoTex = HTMLCanvasElement.prototype.getContext(null as never) as unknown as FakeGl
      mountLaidOut()
      expect(glNoTex.createTexture).toHaveBeenCalledTimes(3)
      expect(FakeImage.instances).toEqual([])
      expect(glNoTex.texImage2D).not.toHaveBeenCalled()
      expect(glNoTex.uniform1i).not.toHaveBeenCalled()
      act(() => drivers.flushFrames())
      expect(writes1f(glNoTex, "X")).toEqual([0])
    })

    it("ignores textures that arrive after unmount", () => {
      const { unmount } = mountLaidOut()
      unmount()
      expect(() => act(() => loadAllImages())).not.toThrow()
      expect(gl.texImage2D).toHaveBeenCalledTimes(3)
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("stops drawing and requesting frames while the canvas is off screen", () => {
      const { canvas } = mountLaidOut()
      setRect(canvas, { top: 2000, height: 160, width: 320 })
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).not.toHaveBeenCalled()
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("also parks when the canvas has scrolled above the viewport, has no width, or the viewport has no height", () => {
      const { canvas } = mountLaidOut()
      setRect(canvas, { top: -400, height: 160, width: 320 })
      act(() => drivers.flushFrames())
      expect(drivers.pendingFrames()).toBe(0)
      setRect(canvas, { top: 0, height: 160, width: 0 })
      fireEvent.scroll(window)
      act(() => drivers.flushFrames())
      expect(drivers.pendingFrames()).toBe(0)
      setRect(canvas, { top: 0, height: 160, width: 320 })
      pinViewport(0)
      fireEvent.scroll(window)
      act(() => drivers.flushFrames())
      expect(drivers.pendingFrames()).toBe(0)
      expect(gl.drawArrays).not.toHaveBeenCalled()
      pinViewport(768)
      fireEvent.scroll(window)
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
      expect(drivers.pendingFrames()).toBe(1)
    })

    it("resumes the loop on scroll after it has parked off screen", () => {
      const { canvas } = mountLaidOut()
      setRect(canvas, { top: 2000, height: 160, width: 320 })
      act(() => drivers.flushFrames())
      expect(drivers.pendingFrames()).toBe(0)
      setRect(canvas, { top: 0, height: 160, width: 320 })
      fireEvent.scroll(window)
      expect(drivers.pendingFrames()).toBe(1)
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
    })

    it("resumes the loop when the IntersectionObserver reports the canvas back in view", () => {
      const { canvas } = mountLaidOut()
      setRect(canvas, { top: 2000, height: 160, width: 320 })
      act(() => drivers.flushFrames())
      expect(drivers.watchers(canvas)).toBe(1)
      setRect(canvas, { top: 0, height: 160, width: 320 })
      act(() => drivers.intersect(canvas, true))
      expect(drivers.pendingFrames()).toBe(1)
    })

    it("resumes the loop on resize and never queues a second frame while one is pending", () => {
      const { canvas } = mountLaidOut()
      setRect(canvas, { top: 2000, height: 160, width: 320 })
      act(() => drivers.flushFrames())
      act(() => fireResize())
      expect(drivers.pendingFrames()).toBe(1)
      act(() => fireResize())
      fireEvent.scroll(window)
      expect(drivers.pendingFrames()).toBe(1)
    })

    it("goes dead after webglcontextlost and never draws again", () => {
      const { canvas } = mountLaidOut()
      act(() => drivers.flushFrames())
      const pendingId = drivers.raf.mock.results.at(-1)?.value
      const lost = new Event("webglcontextlost", { cancelable: true })
      fireEvent(canvas, lost)
      expect(lost.defaultPrevented).toBe(true)
      expect(drivers.caf).toHaveBeenCalledWith(pendingId)
      expect(drivers.pendingFrames()).toBe(0)
      fireEvent.scroll(window)
      act(() => drivers.intersect(canvas, true))
      act(() => loadAllImages())
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
      expect(gl.texImage2D).toHaveBeenCalledTimes(3)
    })

    it("stops at the next frame when the context is lost in the middle of a draw", () => {
      const { canvas } = mountLaidOut()
      gl.drawArrays.mockImplementationOnce(() => {
        fireEvent(canvas, new Event("webglcontextlost", { cancelable: true }))
      })
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
      // The frame that was mid-flight had already queued its successor; that successor finds the field dead.
      expect(drivers.pendingFrames()).toBe(1)
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
      expect(drivers.pendingFrames()).toBe(0)
      fireEvent.scroll(window)
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("cancels the pending frame, disconnects its observers, and removes its listeners on unmount", () => {
      const removeWindow = vi.spyOn(window, "removeEventListener")
      const { canvas, unmount } = mountLaidOut()
      const removeCanvas = vi.spyOn(canvas, "removeEventListener")
      act(() => drivers.flushFrames())
      const pendingId = drivers.raf.mock.results.at(-1)?.value
      unmount()
      expect(drivers.caf).toHaveBeenCalledWith(pendingId)
      expect(drivers.pendingFrames()).toBe(0)
      expect(removeWindow).toHaveBeenCalledWith("scroll", expect.any(Function))
      expect(removeCanvas).toHaveBeenCalledWith("webglcontextlost", expect.any(Function))
      expect(roDisconnect).toHaveBeenCalledTimes(1)
      expect(drivers.watchers(canvas)).toBe(0)
      fireEvent.scroll(window)
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("marks the canvas live while the field runs and clears the mark on unmount", () => {
      const { unmount } = mountLaidOut()
      const canvas = screen.getByTestId("field")
      expect(canvas).toHaveAttribute("data-live", "true")
      unmount()
      expect(canvas).not.toHaveAttribute("data-live")
    })

    describe("pointer input", () => {
      /** The canvas laid out at 320x160 with its top-left at the viewport origin, plus its positioned parent. */
      function mountWithParent() {
        const mounted = mountLaidOut()
        const parent = mounted.canvas.parentElement
        if (!parent) throw new Error("the canvas has no parent")
        return { ...mounted, parent }
      }

      it("writes the pointer at rest, (0.5, 0.5), on every frame until the cursor arrives", () => {
        mountWithParent()
        act(() => drivers.flushFrames())
        act(() => drivers.flushFrames())
        expect(writes2f(gl, "M")).toEqual([
          [0.5, 0.5],
          [0.5, 0.5],
        ])
      })

      it("eases the pointer toward the cursor by 8% of the remaining distance per frame", () => {
        const { parent } = mountWithParent()
        act(() => drivers.flushFrames())
        // The right edge of the 320px box at mid height: the target is (1, 0.5).
        pointerMove(parent, 320, 80)
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)[0]).toBeCloseTo(0.54, 10)
        expect(lastPointer(gl)[1]).toBe(0.5)
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)[0]).toBeCloseTo(0.54 + 0.46 * 0.08, 10)
        expect(lastPointer(gl)[1]).toBe(0.5)
      })

      it("measures y upward like gl_FragCoord: the top-left corner of the box is (0, 1)", () => {
        const { parent } = mountWithParent()
        act(() => drivers.flushFrames())
        pointerMove(parent, 0, 0)
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)[0]).toBeCloseTo(0.46, 10)
        expect(lastPointer(gl)[1]).toBeCloseTo(0.54, 10)
      })

      it("measures against the canvas box, not the viewport, when the box is offset", () => {
        const { canvas, parent } = mountWithParent()
        act(() => drivers.flushFrames())
        canvas.getBoundingClientRect = () =>
          ({ top: 100, left: 40, width: 320, height: 160, bottom: 260, right: 360, x: 40, y: 100 }) as DOMRect
        // A quarter of the way across and three quarters of the way down the box: (0.25, 0.25).
        pointerMove(parent, 40 + 80, 100 + 120)
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)[0]).toBeCloseTo(0.48, 10)
        expect(lastPointer(gl)[1]).toBeCloseTo(0.48, 10)
      })

      it("clamps a cursor outside the box to its edges", () => {
        const { parent } = mountWithParent()
        act(() => drivers.flushFrames())
        pointerMove(parent, -100, 500)
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)[0]).toBeCloseTo(0.46, 10)
        expect(lastPointer(gl)[1]).toBeCloseTo(0.46, 10)
        pointerMove(parent, 900, -50)
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)[0]).toBeCloseTo(0.46 + 0.54 * 0.08, 10)
        expect(lastPointer(gl)[1]).toBeCloseTo(0.46 + 0.54 * 0.08, 10)
      })

      it("eases back toward the centre after the pointer leaves", () => {
        const { parent } = mountWithParent()
        act(() => drivers.flushFrames())
        pointerMove(parent, 320, 80)
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)[0]).toBeCloseTo(0.54, 10)
        pointerLeave(parent)
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)[0]).toBeCloseTo(0.54 - 0.04 * 0.08, 10)
        expect(lastPointer(gl)[1]).toBe(0.5)
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)[0]).toBeCloseTo(0.54 - 0.04 * 0.08 - (0.04 - 0.04 * 0.08) * 0.08, 10)
      })

      it("ignores a touch pointer but follows a pen", () => {
        const { parent } = mountWithParent()
        act(() => drivers.flushFrames())
        pointerMove(parent, 320, 80, "touch")
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)).toEqual([0.5, 0.5])
        pointerMove(parent, 320, 80, "pen")
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)[0]).toBeCloseTo(0.54, 10)
      })

      it("ignores a move while the canvas box has no height, and neither kicks the loop", () => {
        const { canvas, parent } = mountWithParent()
        act(() => drivers.flushFrames())
        setRect(canvas, { top: 0, height: 0, width: 320 })
        act(() => drivers.flushFrames())
        expect(drivers.pendingFrames()).toBe(0)
        pointerMove(parent, 320, 0)
        expect(drivers.pendingFrames()).toBe(0)
        layOut(canvas)
        fireEvent.scroll(window)
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)).toEqual([0.5, 0.5])
      })

      it("restarts a parked loop on a pointer move, and again when the pointer leaves", () => {
        const { canvas, parent } = mountWithParent()
        setRect(canvas, { top: 2000, height: 160, width: 320 })
        act(() => drivers.flushFrames())
        expect(drivers.pendingFrames()).toBe(0)
        setRect(canvas, { top: 0, height: 160, width: 320 })
        pointerMove(parent, 320, 80)
        expect(drivers.pendingFrames()).toBe(1)
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)[0]).toBeCloseTo(0.54, 10)
        setRect(canvas, { top: 2000, height: 160, width: 320 })
        act(() => drivers.flushFrames())
        expect(drivers.pendingFrames()).toBe(0)
        setRect(canvas, { top: 0, height: 160, width: 320 })
        pointerLeave(parent)
        expect(drivers.pendingFrames()).toBe(1)
        act(() => drivers.flushFrames())
        // The frame that parked the loop still eased the pointer once (to 0.5768) before it found the canvas
        // off screen, the same way it eases the level; the resumed frame eases from there back toward 0.5.
        const parked = 0.54 + (1 - 0.54) * 0.08
        expect(lastPointer(gl)[0]).toBeCloseTo(parked + (0.5 - parked) * 0.08, 10)
      })

      it("never queues a second frame when the pointer moves while one is pending", () => {
        const { parent } = mountWithParent()
        expect(drivers.pendingFrames()).toBe(1)
        pointerMove(parent, 100, 100)
        pointerMove(parent, 120, 100)
        expect(drivers.pendingFrames()).toBe(1)
      })

      it("listens on the parent only: a move dispatched straight at the canvas that does not bubble changes nothing", () => {
        const { canvas } = mountWithParent()
        act(() => drivers.flushFrames())
        const event = new MouseEvent("pointermove", { clientX: 320, clientY: 80, bubbles: false })
        Object.defineProperty(event, "pointerType", { value: "mouse" })
        fireEvent(canvas, event)
        act(() => drivers.flushFrames())
        expect(lastPointer(gl)).toEqual([0.5, 0.5])
      })

      it("removes both pointer listeners from the parent on unmount, so a later move queues nothing", () => {
        const { parent, unmount } = mountWithParent()
        const unlisten = vi.spyOn(parent, "removeEventListener")
        act(() => drivers.flushFrames())
        unmount()
        expect(unlisten).toHaveBeenCalledWith("pointermove", expect.any(Function))
        expect(unlisten).toHaveBeenCalledWith("pointerleave", expect.any(Function))
        expect(drivers.pendingFrames()).toBe(0)
        pointerMove(parent, 320, 80)
        pointerLeave(parent)
        expect(drivers.pendingFrames()).toBe(0)
      })

      it("runs with the pointer at rest when the canvas has no parent to listen on", () => {
        const orphan = document.createElement("canvas")
        layOut(orphan)
        expect(orphan.parentElement).toBeNull()
        function Orphan() {
          const ref = useRef<HTMLCanvasElement | null>(orphan)
          useInstrumentField(ref, 0.3)
          return null
        }
        const { unmount } = render(<Orphan />)
        expect(orphan).toHaveAttribute("data-live", "true")
        act(() => drivers.flushFrames())
        expect(writes2f(gl, "M")).toEqual([[0.5, 0.5]])
        expect(() => unmount()).not.toThrow()
        expect(orphan).not.toHaveAttribute("data-live")
      })
    })
  })

  describe("colours", () => {
    let gl: FakeGl
    beforeEach(() => {
      gl = fakeGl()
      installGl(gl)
    })

    function stubTokens(tokens: Record<string, string>) {
      const real = window.getComputedStyle.bind(window)
      vi.spyOn(window, "getComputedStyle").mockImplementation((el: Element) =>
        el === document.documentElement
          ? ({ getPropertyValue: (name: string) => tokens[name] ?? "" } as unknown as CSSStyleDeclaration)
          : real(el)
      )
    }

    it("paints from the design tokens declared on the document root: base, accent, highlight", () => {
      stubTokens({
        "--color-tile-1": "#102030",
        "--color-primary": " #4ce27e ",
        "--color-primary-on-dark": "#63E88C",
      })
      render(<InstrumentField target={0.3} pulseKey={0} testId="field" />)
      expect(writes3f(gl, "K0")).toEqual([[16 / 255, 32 / 255, 48 / 255]])
      expect(writes3f(gl, "K1")).toEqual([[76 / 255, 226 / 255, 126 / 255]])
      expect(writes3f(gl, "K2")).toEqual([[99 / 255, 232 / 255, 140 / 255]])
      expect(gl.uniform3f).toHaveBeenCalledTimes(3)
    })
  })
})

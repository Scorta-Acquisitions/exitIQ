import { act, fireEvent, render } from "@testing-library/react"
import { useRef } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useConsoleField } from "@/components/site/exitiq/useConsoleField"
import { installSceneDrivers, restoreMatchMedia, type SceneDrivers, setRect, stubMatchMedia } from "./scene-test-utils"

const realGetContext = HTMLCanvasElement.prototype.getContext
const realResizeObserver = window.ResizeObserver
const realDpr = window.devicePixelRatio

/** A ResizeObserver whose callbacks the test can fire by hand (the setup file's stand-in never fires). */
function installResizeObserver() {
  const callbacks: ResizeObserverCallback[] = []
  const disconnected = vi.fn()
  class FakeResizeObserver implements ResizeObserver {
    constructor(cb: ResizeObserverCallback) {
      callbacks.push(cb)
    }
    observe() {}
    unobserve() {}
    disconnect() {
      disconnected()
    }
  }
  window.ResizeObserver = FakeResizeObserver
  return {
    fire: () => {
      for (const cb of callbacks) cb([], {} as ResizeObserver)
    },
    count: () => callbacks.length,
    disconnected,
  }
}

type GlOverrides = Partial<Record<"shaderOk" | "programOk" | "shaderNull" | "programNull", boolean>>

/** A minimal WebGL stand-in: every handle is a tagged object so uniform writes can be matched by name. */
function fakeGl(overrides: GlOverrides = {}) {
  const gl = {
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    FLOAT: 5126,
    TRIANGLE_STRIP: 5,
    drawingBufferWidth: 300,
    drawingBufferHeight: 150,
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
    uniform2f: vi.fn(),
    viewport: vi.fn(),
    clearColor: vi.fn(),
    clear: vi.fn(),
    drawArrays: vi.fn(),
    getExtension: vi.fn(() => null),
  }
  return gl
}

function Host({ target }: { target: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const pulse = useConsoleField(ref, target)
  return (
    <div>
      <canvas ref={ref} data-testid="field" />
      <button type="button" onClick={() => pulse()}>
        pulse
      </button>
    </div>
  )
}

/** A host whose ref never receives a canvas: the hook must stay inert. */
function DetachedHost({ target }: { target: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const pulse = useConsoleField(ref, target)
  return (
    <button type="button" onClick={() => pulse()}>
      pulse
    </button>
  )
}

/**
 * jsdom lays nothing out, so give the canvas a 320x160 box inside the viewport. (Not 300x150: that is
 * jsdom's default canvas size, and `resize()` skips the viewport update when the size is unchanged.)
 */
function layOut(canvas: HTMLCanvasElement) {
  Object.defineProperty(canvas, "offsetWidth", { configurable: true, value: 320 })
  Object.defineProperty(canvas, "offsetHeight", { configurable: true, value: 160 })
  setRect(canvas, { top: 0, height: 160, width: 320 })
}

const uniformWrites = (gl: ReturnType<typeof fakeGl>, name: string) =>
  gl.uniform1f.mock.calls.filter((c) => (c[0] as { name: string }).name === name).map((c) => c[1])

const uniform2Writes = (gl: ReturnType<typeof fakeGl>, name: string) =>
  gl.uniform2f.mock.calls.filter((c) => (c[0] as { name: string }).name === name).map((c) => [c[1], c[2]])

describe("useConsoleField", () => {
  let drivers: SceneDrivers
  beforeEach(() => {
    drivers = installSceneDrivers()
  })
  afterEach(() => {
    drivers.restore()
    vi.restoreAllMocks()
    restoreMatchMedia()
    window.ResizeObserver = realResizeObserver
    window.devicePixelRatio = realDpr
    HTMLCanvasElement.prototype.getContext = realGetContext
  })

  describe("without WebGL", () => {
    it("renders the host and starts no animation loop when getContext returns null, whatever the visitor does", () => {
      const { getByTestId, getByRole, rerender } = render(<Host target={0.3} />)
      expect(getByTestId("field").tagName).toBe("CANVAS")
      expect(drivers.raf).not.toHaveBeenCalled()
      // A pulse and a new target are no-ops without a context: still no frame, and none queued.
      fireEvent.click(getByRole("button", { name: "pulse" }))
      rerender(<Host target={0.9} />)
      expect(drivers.raf).not.toHaveBeenCalled()
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("never asks for a context, a frame, or an observer when the ref holds no canvas", () => {
      const getContext = vi.fn(() => fakeGl())
      HTMLCanvasElement.prototype.getContext = getContext as unknown as typeof realGetContext
      const ro = installResizeObserver()
      const { getByRole, rerender, unmount } = render(<DetachedHost target={0.3} />)
      expect(getContext).not.toHaveBeenCalled()
      expect(ro.count()).toBe(0)
      expect(drivers.raf).not.toHaveBeenCalled()
      expect(() => fireEvent.click(getByRole("button", { name: "pulse" }))).not.toThrow()
      expect(() => rerender(<DetachedHost target={0.9} />)).not.toThrow()
      expect(() => unmount()).not.toThrow()
      expect(drivers.caf).not.toHaveBeenCalled()
    })

    it("gives up silently when the shader fails to compile", () => {
      const gl = fakeGl({ shaderOk: false })
      HTMLCanvasElement.prototype.getContext = vi.fn(() => gl) as unknown as typeof realGetContext
      render(<Host target={0.3} />)
      expect(gl.createProgram).not.toHaveBeenCalled()
      expect(gl.drawArrays).not.toHaveBeenCalled()
      expect(drivers.raf).not.toHaveBeenCalled()
    })

    it("gives up silently when the context cannot allocate a shader", () => {
      const gl = fakeGl({ shaderNull: true })
      HTMLCanvasElement.prototype.getContext = vi.fn(() => gl) as unknown as typeof realGetContext
      render(<Host target={0.3} />)
      expect(gl.createShader).toHaveBeenCalledWith(gl.VERTEX_SHADER)
      expect(gl.shaderSource).not.toHaveBeenCalled()
      expect(gl.createProgram).not.toHaveBeenCalled()
      expect(gl.drawArrays).not.toHaveBeenCalled()
      expect(drivers.raf).not.toHaveBeenCalled()
    })

    it("gives up silently when the context cannot allocate a program", () => {
      const gl = fakeGl({ programNull: true })
      HTMLCanvasElement.prototype.getContext = vi.fn(() => gl) as unknown as typeof realGetContext
      render(<Host target={0.3} />)
      expect(gl.createProgram).toHaveBeenCalledTimes(1)
      expect(gl.attachShader).not.toHaveBeenCalled()
      expect(gl.linkProgram).not.toHaveBeenCalled()
      expect(gl.drawArrays).not.toHaveBeenCalled()
      expect(drivers.raf).not.toHaveBeenCalled()
    })

    it("gives up silently when the program fails to link", () => {
      const gl = fakeGl({ programOk: false })
      HTMLCanvasElement.prototype.getContext = vi.fn(() => gl) as unknown as typeof realGetContext
      render(<Host target={0.3} />)
      expect(gl.useProgram).not.toHaveBeenCalled()
      expect(gl.drawArrays).not.toHaveBeenCalled()
      expect(drivers.raf).not.toHaveBeenCalled()
    })
  })

  describe("with reduced motion", () => {
    let gl: ReturnType<typeof fakeGl>
    beforeEach(() => {
      stubMatchMedia(true)
      gl = fakeGl()
      HTMLCanvasElement.prototype.getContext = vi.fn(() => gl) as unknown as typeof realGetContext
    })

    it("requests a low-power WebGL context", () => {
      render(<Host target={0.3} />)
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith("webgl", {
        antialias: false,
        powerPreference: "low-power",
      })
    })

    it("retries sizing via one frame until the canvas has a layout box, then draws it once", () => {
      const { getByTestId } = render(<Host target={0.3} />)
      const field = getByTestId("field") as HTMLCanvasElement
      // No layout yet: the settle step re-queues itself, and no viewport has been set.
      expect(drivers.raf).toHaveBeenCalledTimes(1)
      expect(gl.viewport).not.toHaveBeenCalled()
      layOut(field)
      act(() => drivers.flushFrames())
      expect(field.width).toBe(320)
      expect(field.height).toBe(160)
      expect(gl.viewport).toHaveBeenCalledWith(0, 0, 320, 160)
      expect(gl.uniform2f).toHaveBeenCalledWith({ name: "R" }, 320, 160)
      expect(gl.drawArrays).toHaveBeenLastCalledWith(gl.TRIANGLE_STRIP, 0, 4)
      expect(uniformWrites(gl, "C").at(-1)).toBe(0.3)
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("paints the initial target once at mount, before the loop would ever run", () => {
      render(<Host target={0.3} />)
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
      expect(uniformWrites(gl, "C")).toEqual([0.3])
      expect(uniformWrites(gl, "I")).toEqual([0])
    })

    it("redraws immediately at the new brightness when the target changes", () => {
      const { getByTestId, rerender } = render(<Host target={0.3} />)
      layOut(getByTestId("field") as HTMLCanvasElement)
      act(() => drivers.flushFrames())
      const drawsBefore = gl.drawArrays.mock.calls.length
      rerender(<Host target={0.8} />)
      expect(uniformWrites(gl, "C").at(-1)).toBe(0.8)
      expect(gl.drawArrays).toHaveBeenCalledTimes(drawsBefore + 1)
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("does not animate a pulse", () => {
      const { getByTestId, getByRole } = render(<Host target={0.3} />)
      layOut(getByTestId("field") as HTMLCanvasElement)
      act(() => drivers.flushFrames())
      const drawsBefore = gl.drawArrays.mock.calls.length
      fireEvent.click(getByRole("button", { name: "pulse" }))
      expect(drivers.raf).toHaveBeenCalledTimes(1)
      expect(drivers.pendingFrames()).toBe(0)
      expect(gl.drawArrays).toHaveBeenCalledTimes(drawsBefore)
    })

    it("redraws the static frame on a resize notification once the canvas has a box, and never starts the loop", () => {
      const ro = installResizeObserver()
      const { getByTestId } = render(<Host target={0.3} />)
      expect(ro.count()).toBe(1)
      // The mount paint (the target effect's `set`) is the only draw so far, and the settle frame the only one queued.
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
      expect(gl.viewport).not.toHaveBeenCalled()
      // Before layout the notification finds no box: nothing to draw, nothing new queued.
      act(() => ro.fire())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
      expect(drivers.pendingFrames()).toBe(1)
      layOut(getByTestId("field") as HTMLCanvasElement)
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(2)
      expect(gl.viewport).toHaveBeenCalledTimes(1)
      act(() => ro.fire())
      expect(gl.drawArrays).toHaveBeenCalledTimes(3)
      expect(uniformWrites(gl, "C")).toEqual([0.3, 0.3, 0.3])
      expect(drivers.pendingFrames()).toBe(0)
      expect(drivers.raf).toHaveBeenCalledTimes(1)
    })
  })

  describe("with WebGL and motion allowed", () => {
    let gl: ReturnType<typeof fakeGl>
    beforeEach(() => {
      stubMatchMedia(false)
      gl = fakeGl()
      HTMLCanvasElement.prototype.getContext = vi.fn(() => gl) as unknown as typeof realGetContext
    })

    function mountLaidOut(target = 0.3) {
      const utils = render(<Host target={target} />)
      const field = utils.getByTestId("field") as HTMLCanvasElement
      layOut(field)
      return { ...utils, field }
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
      expect(gl.getUniformLocation.mock.calls.map((c) => c[1])).toEqual(["T", "R", "C", "I", "M"])
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
      expect(drivers.pendingFrames()).toBe(1)
    })

    it("draws nothing and parks while the canvas has no layout box", () => {
      render(<Host target={0.3} />)
      expect(drivers.pendingFrames()).toBe(1)
      act(() => drivers.flushFrames())
      expect(gl.viewport).not.toHaveBeenCalled()
      expect(gl.drawArrays).not.toHaveBeenCalled()
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("sizes the backing store by the device pixel ratio, capped at 1.75", () => {
      window.devicePixelRatio = 3
      const { field } = mountLaidOut()
      act(() => drivers.flushFrames())
      expect(field.width).toBe(560)
      expect(field.height).toBe(280)
      expect(gl.viewport).toHaveBeenCalledWith(0, 0, 560, 280)
      expect(gl.uniform2f).toHaveBeenCalledWith({ name: "R" }, 560, 280)
    })

    it("treats a missing device pixel ratio as 1", () => {
      window.devicePixelRatio = 0
      const { field } = mountLaidOut()
      act(() => drivers.flushFrames())
      expect(field.width).toBe(320)
      expect(field.height).toBe(160)
      expect(gl.viewport).toHaveBeenCalledWith(0, 0, 320, 160)
    })

    it("sets the viewport once and keeps it while the box is unchanged", () => {
      mountLaidOut()
      act(() => drivers.flushFrames())
      act(() => drivers.flushFrames())
      act(() => drivers.flushFrames())
      expect(gl.viewport).toHaveBeenCalledTimes(1)
      expect(uniform2Writes(gl, "R")).toEqual([[320, 160]])
      expect(gl.drawArrays).toHaveBeenCalledTimes(3)
    })

    it("moves toward a new target by 4.5% per frame", () => {
      const { rerender } = mountLaidOut(0)
      act(() => drivers.flushFrames())
      rerender(<Host target={1} />)
      act(() => drivers.flushFrames())
      expect(uniformWrites(gl, "C").at(-1)).toBeCloseTo(0.045, 10)
      act(() => drivers.flushFrames())
      expect(uniformWrites(gl, "C").at(-1)).toBeCloseTo(0.045 + (1 - 0.045) * 0.045, 10)
    })

    it("flares the impulse uniform on pulse() and decays it every frame", () => {
      const { getByRole } = mountLaidOut()
      act(() => drivers.flushFrames())
      expect(uniformWrites(gl, "I")).toEqual([0])
      fireEvent.click(getByRole("button", { name: "pulse" }))
      act(() => drivers.flushFrames())
      expect(uniformWrites(gl, "I").at(-1)).toBeCloseTo(0.94, 10)
      act(() => drivers.flushFrames())
      expect(uniformWrites(gl, "I").at(-1)).toBeCloseTo(0.94 * 0.94, 10)
    })

    it("writes the pointer's position over the canvas to the M uniform, y flipped, and rests at the centre", () => {
      const { field } = mountLaidOut()
      act(() => drivers.flushFrames())
      expect(uniform2Writes(gl, "M")).toEqual([[0.5, 0.5]])
      fireEvent(field, new MouseEvent("pointermove", { clientX: 80, clientY: 40, bubbles: true }))
      act(() => drivers.flushFrames())
      expect(uniform2Writes(gl, "M").at(-1)).toEqual([0.25, 0.75])
      fireEvent(field, new MouseEvent("pointermove", { clientX: 320, clientY: 160, bubbles: true }))
      act(() => drivers.flushFrames())
      expect(uniform2Writes(gl, "M").at(-1)).toEqual([1, 0])
    })

    it("stops drawing and requesting frames while the canvas is off screen", () => {
      const { field } = mountLaidOut()
      setRect(field, { top: 2000, height: 160, width: 320 })
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).not.toHaveBeenCalled()
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("resumes the loop on scroll after it has parked off screen", () => {
      const { field } = mountLaidOut()
      setRect(field, { top: 2000, height: 160, width: 320 })
      act(() => drivers.flushFrames())
      expect(drivers.pendingFrames()).toBe(0)
      setRect(field, { top: 0, height: 160, width: 320 })
      fireEvent.scroll(window)
      expect(drivers.pendingFrames()).toBe(1)
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
    })

    it("resumes the loop when the intersection observer reports the canvas, and never double-queues", () => {
      const { field } = mountLaidOut()
      expect(drivers.watchers(field)).toBe(1)
      // A report while a frame is already pending queues nothing more.
      act(() => drivers.intersect(field, true))
      expect(drivers.pendingFrames()).toBe(1)
      setRect(field, { top: 2000, height: 160, width: 320 })
      act(() => drivers.flushFrames())
      expect(drivers.pendingFrames()).toBe(0)
      setRect(field, { top: 0, height: 160, width: 320 })
      act(() => drivers.intersect(field, true))
      expect(drivers.pendingFrames()).toBe(1)
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
    })

    it("resumes the loop on a resize notification after parking, without redrawing synchronously", () => {
      const ro = installResizeObserver()
      const { field } = mountLaidOut()
      act(() => ro.fire())
      expect(drivers.pendingFrames()).toBe(1)
      setRect(field, { top: 2000, height: 160, width: 320 })
      act(() => drivers.flushFrames())
      expect(drivers.pendingFrames()).toBe(0)
      setRect(field, { top: 0, height: 160, width: 320 })
      act(() => ro.fire())
      expect(gl.drawArrays).not.toHaveBeenCalled()
      expect(drivers.pendingFrames()).toBe(1)
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
    })

    it("wakes the loop when the target changes while parked", () => {
      const { field, rerender } = mountLaidOut(0.3)
      setRect(field, { top: 2000, height: 160, width: 320 })
      act(() => drivers.flushFrames())
      expect(drivers.pendingFrames()).toBe(0)
      setRect(field, { top: 0, height: 160, width: 320 })
      rerender(<Host target={0.9} />)
      expect(drivers.pendingFrames()).toBe(1)
      act(() => drivers.flushFrames())
      expect(uniformWrites(gl, "C").at(-1)).toBeCloseTo(0.3 + (0.9 - 0.3) * 0.045, 10)
    })

    it("goes dead after webglcontextlost and never draws again", () => {
      const { field } = mountLaidOut()
      act(() => drivers.flushFrames())
      const pendingId = drivers.raf.mock.results.at(-1)?.value
      const lost = new Event("webglcontextlost", { cancelable: true })
      fireEvent(field, lost)
      expect(lost.defaultPrevented).toBe(true)
      expect(drivers.caf).toHaveBeenCalledWith(pendingId)
      expect(drivers.pendingFrames()).toBe(0)
      fireEvent.scroll(window)
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
    })

    it("cancels the pending frame and removes its listeners on unmount", () => {
      const removeWindow = vi.spyOn(window, "removeEventListener")
      const ro = installResizeObserver()
      const { field, unmount } = mountLaidOut()
      const removeCanvas = vi.spyOn(field, "removeEventListener")
      act(() => drivers.flushFrames())
      const pendingId = drivers.raf.mock.results.at(-1)?.value
      unmount()
      expect(drivers.caf).toHaveBeenCalledWith(pendingId)
      expect(drivers.pendingFrames()).toBe(0)
      expect(removeWindow).toHaveBeenCalledWith("scroll", expect.any(Function))
      expect(removeCanvas).toHaveBeenCalledWith("pointermove", expect.any(Function))
      expect(removeCanvas).toHaveBeenCalledWith("webglcontextlost", expect.any(Function))
      expect(drivers.watchers(field)).toBe(0)
      expect(ro.disconnected).toHaveBeenCalledTimes(1)
      fireEvent.scroll(window)
      expect(drivers.pendingFrames()).toBe(0)
    })
  })
})

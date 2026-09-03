import { act, fireEvent, render } from "@testing-library/react"
import { useRef } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useInstrumentField } from "@/components/site/hero/useInstrumentField"
import { installSceneDrivers, type SceneDrivers, setRect } from "./scene-test-utils"

const realMatchMedia = window.matchMedia
const realGetContext = HTMLCanvasElement.prototype.getContext

function reducedMotion(matches: boolean) {
  window.matchMedia = (query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

/** A minimal WebGL stand-in: every handle is a tagged object so uniform writes can be matched by name. */
function fakeGl(overrides: Partial<Record<"shaderOk" | "programOk", boolean>> = {}) {
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
    createShader: vi.fn((type: number) => ({ shader: type })),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => overrides.shaderOk ?? true),
    createProgram: vi.fn(() => ({ program: true })),
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
  const pulse = useInstrumentField(ref, target)
  return (
    <div>
      <canvas ref={ref} data-testid="field" />
      <button type="button" onClick={() => pulse()}>
        pulse
      </button>
    </div>
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

describe("useInstrumentField", () => {
  let drivers: SceneDrivers
  beforeEach(() => {
    drivers = installSceneDrivers()
  })
  afterEach(() => {
    drivers.restore()
    vi.restoreAllMocks()
    window.matchMedia = realMatchMedia
    HTMLCanvasElement.prototype.getContext = realGetContext
  })

  describe("without WebGL", () => {
    it("renders the host and starts no animation loop when getContext returns null", () => {
      const { getByTestId } = render(<Host target={0.3} />)
      expect(getByTestId("field").tagName).toBe("CANVAS")
      expect(drivers.raf).not.toHaveBeenCalled()
    })

    it("lets pulse() and target changes run as no-ops", () => {
      const { getByRole, rerender } = render(<Host target={0.3} />)
      expect(() => fireEvent.click(getByRole("button", { name: "pulse" }))).not.toThrow()
      expect(() => rerender(<Host target={0.9} />)).not.toThrow()
      expect(drivers.raf).not.toHaveBeenCalled()
    })

    it("gives up silently when the shader fails to compile", () => {
      const gl = fakeGl({ shaderOk: false })
      HTMLCanvasElement.prototype.getContext = vi.fn(() => gl) as unknown as typeof realGetContext
      render(<Host target={0.3} />)
      expect(gl.createProgram).not.toHaveBeenCalled()
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
      reducedMotion(true)
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
  })

  describe("with WebGL and motion allowed", () => {
    let gl: ReturnType<typeof fakeGl>
    beforeEach(() => {
      reducedMotion(false)
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

    it("eases the brightness toward the target instead of jumping", () => {
      mountLaidOut(0.3)
      act(() => drivers.flushFrames())
      expect(uniformWrites(gl, "C")).toEqual([0.3])
      act(() => drivers.flushFrames())
      expect(uniformWrites(gl, "C")).toEqual([0.3, 0.3])
    })

    it("moves toward a new target by 4.5% per frame", () => {
      const { rerender } = mountLaidOut(0)
      act(() => drivers.flushFrames())
      rerender(<Host target={1} />)
      act(() => drivers.flushFrames())
      expect(uniformWrites(gl, "C").at(-1)).toBeCloseTo(0.045, 10)
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

    it("goes dead after webglcontextlost and never draws again", () => {
      const { field } = mountLaidOut()
      act(() => drivers.flushFrames())
      const pendingId = drivers.raf.mock.results.at(-1)?.value
      fireEvent(field, new Event("webglcontextlost", { cancelable: true }))
      expect(drivers.caf).toHaveBeenCalledWith(pendingId)
      expect(drivers.pendingFrames()).toBe(0)
      fireEvent.scroll(window)
      act(() => drivers.flushFrames())
      expect(gl.drawArrays).toHaveBeenCalledTimes(1)
    })

    it("cancels the pending frame and removes its listeners on unmount", () => {
      const removeWindow = vi.spyOn(window, "removeEventListener")
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
      fireEvent.scroll(window)
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("does not ask WebGL to release the context on unmount", () => {
      const { unmount } = mountLaidOut()
      unmount()
      expect(gl.getExtension).not.toHaveBeenCalledWith("WEBGL_lose_context")
    })
  })
})

import { type RefObject, useEffect } from "react"
import { hoverUnavailable, prefersReducedMotion } from "@/components/site/motion/reducedMotion"
import { damp, FRAME_MS, pointerOffset, settled } from "@/lib/site/motion"

/**
 * Leans `layerRef` toward the pointer while it moves over `areaRef`: at most `max` px of translate in each
 * axis, eased toward the pointer each frame at `rate` (of the remaining distance per 60fps frame) and back
 * to rest when the pointer leaves. Writes the transform straight to the DOM and stops the frame loop once
 * settled. Touch pointers, hover-less devices, and reduced motion leave the layer still.
 */
export function usePointerParallax(
  areaRef: RefObject<HTMLElement | null>,
  layerRef: RefObject<HTMLElement | null>,
  { max = 6, rate = 0.12 }: { max?: number; rate?: number } = {}
) {
  useEffect(() => {
    const area = areaRef.current
    const layer = layerRef.current
    if (!area || !layer || prefersReducedMotion() || hoverUnavailable()) return
    const st = { tx: 0, ty: 0, x: 0, y: 0, raf: 0, last: 0 }

    const frame = (now: number) => {
      st.raf = 0
      const dt = st.last ? now - st.last : FRAME_MS
      st.last = now
      st.x = damp(st.x, st.tx, rate, dt)
      st.y = damp(st.y, st.ty, rate, dt)
      const done = settled(st.x, st.tx) && settled(st.y, st.ty)
      if (done) {
        st.x = st.tx
        st.y = st.ty
      }
      layer.style.transform =
        st.x === 0 && st.y === 0 ? "" : `translate3d(${st.x.toFixed(2)}px, ${st.y.toFixed(2)}px, 0)`
      if (!done) st.raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (st.raf) return
      st.last = 0
      st.raf = requestAnimationFrame(frame)
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      const { dx, dy } = pointerOffset(e.clientX, e.clientY, area.getBoundingClientRect(), max)
      st.tx = dx
      st.ty = dy
      kick()
    }
    const leave = () => {
      st.tx = 0
      st.ty = 0
      kick()
    }
    area.addEventListener("pointermove", move)
    area.addEventListener("pointerleave", leave)
    return () => {
      cancelAnimationFrame(st.raf)
      area.removeEventListener("pointermove", move)
      area.removeEventListener("pointerleave", leave)
      layer.style.transform = ""
    }
  }, [areaRef, layerRef, max, rate])
}

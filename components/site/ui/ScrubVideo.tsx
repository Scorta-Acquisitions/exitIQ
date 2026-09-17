// use client: a scroll-scrubbed film needs the video element, its metadata, and per-frame seeks
"use client"

import { type Ref, useEffect, useImperativeHandle, useRef, useState } from "react"
import { prefersReducedMotion } from "@/components/site/motion/reducedMotion"
import { clamp01 } from "@/lib/site/motion"

/** Imperative handle a scene drives from its frame loop: `seek(progress)` shows the frame at `progress` (0..1). */
export interface ScrubHandle {
  seek: (progress: number) => void
}

/** Seeks closer together than this (in seconds) are skipped: one frame at 24fps is 0.042s. */
const MIN_STEP_S = 1 / 48

/**
 * A film scrubbed by scroll instead of played: the scene's frame loop calls `seek(progress)` and the
 * element shows the frame at `progress × duration`.
 * - The source is attached only once the element approaches the viewport, and never when the visitor
 *   prefers reduced motion: the `poster` still stands in for the film.
 * - Seeks are coalesced: while the element reports `seeking`, the latest request waits for `seeked`
 *   (readiness and seeking state are read from the element, so a missed event can never wedge it).
 * - A missing or failing source removes the element entirely; the scene's own choreography remains.
 */
export function ScrubVideo({
  src,
  poster,
  className,
  ariaLabel,
  ref,
}: {
  src: string
  poster: string
  className?: string
  ariaLabel?: string
  ref?: Ref<ScrubHandle | null>
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  // The latest requested progress lives outside React state: seeks arrive every frame.
  const model = useRef({ pending: -1, reduce: false })

  const apply = () => {
    const v = videoRef.current
    const m = model.current
    if (!v || m.pending < 0 || m.reduce) return
    const duration = v.duration
    if (!Number.isFinite(duration) || duration <= 0) return
    // Still seeking: `seeked` calls apply again with whatever is pending by then.
    if (v.seeking) return
    const target = m.pending * duration
    if (Math.abs(target - v.currentTime) < MIN_STEP_S) return
    try {
      v.currentTime = target
    } catch {
      /* seeking is best-effort */
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      seek: (progress: number) => {
        model.current.pending = clamp01(progress)
        apply()
      },
    }),
    []
  )

  useEffect(() => {
    const v = videoRef.current
    if (!v || failed) return
    const m = model.current
    m.reduce = prefersReducedMotion()
    if (m.reduce) return

    // Metadata makes the duration known; `seeked` frees the element for the next request; `canplay`
    // covers a browser that reports metadata before the listener could see it.
    v.addEventListener("loadedmetadata", apply)
    v.addEventListener("canplay", apply)
    v.addEventListener("seeked", apply)

    let attached = false
    const io = new IntersectionObserver(
      (entries) => {
        if (attached || !entries.some((e) => e.isIntersecting)) return
        attached = true
        v.muted = true
        v.preload = "auto"
        v.src = src
        io.disconnect()
      },
      { rootMargin: "300px 0px" }
    )
    io.observe(v)
    return () => {
      io.disconnect()
      v.removeEventListener("loadedmetadata", apply)
      v.removeEventListener("canplay", apply)
      v.removeEventListener("seeked", apply)
      m.pending = -1
    }
  }, [src, failed])

  if (failed) return null

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      preload="none"
      poster={poster}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      className={className}
      onError={() => setFailed(true)}
      data-testid="scrub-video"
    />
  )
}

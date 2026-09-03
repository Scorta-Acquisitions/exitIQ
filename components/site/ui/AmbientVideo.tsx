// use client: lazy-loads and plays a background video only while it is on screen
"use client"

import { type CSSProperties, useEffect, useRef, useState } from "react"

/**
 * Decorative background video.
 * - The source is attached only once the element approaches the viewport, and only when the visitor
 *   has not asked for reduced motion.
 * - Playback pauses off screen.
 * - `fadeLoop` plays forward then scrubs backward to the start instead of hard-cutting.
 * - A missing or failing source hides the element entirely so layouts never show a broken player.
 */
export function AmbientVideo({
  src,
  className,
  style,
  fadeLoop = false,
  ariaLabel,
}: {
  src: string
  className?: string
  style?: CSSProperties
  fadeLoop?: boolean
  ariaLabel?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v || failed) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return

    let visible = false
    let initialized = false
    let reversing = false
    let reverseTime = 0
    let lastTs = 0
    let raf = 0
    let playPending = false
    let retryAt = 0

    const tryPlay = () => {
      if (!visible || !v.src || reversing || !v.paused || playPending) return
      if (retryAt && performance.now() < retryAt) return
      playPending = true
      v.play()
        .then(() => {
          playPending = false
          retryAt = 0
        })
        .catch(() => {
          playPending = false
          retryAt = performance.now() + 4000
        })
    }

    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      if (fadeLoop && v.duration) {
        if (!reversing) {
          if (v.currentTime > v.duration - 0.12) {
            reversing = true
            v.pause()
            reverseTime = v.currentTime
            lastTs = performance.now()
          }
        } else {
          const now = performance.now()
          reverseTime -= (now - lastTs) / 1000
          lastTs = now
          if (reverseTime <= 0.08) {
            reversing = false
            try {
              v.currentTime = 0.04
            } catch {
              /* seeking is best-effort */
            }
          } else {
            try {
              v.currentTime = reverseTime
            } catch {
              /* seeking is best-effort */
            }
          }
        }
      }
      tryPlay()
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        visible = !!entry?.isIntersecting
        if (visible && !initialized) {
          initialized = true
          v.muted = true
          v.loop = !fadeLoop
          v.src = src
        }
        if (visible) tryPlay()
        else if (!v.paused) v.pause()
      },
      { rootMargin: "100px" }
    )
    io.observe(v)
    raf = requestAnimationFrame(frame)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      if (!v.paused) v.pause()
    }
  }, [src, fadeLoop, failed])

  if (failed) return null

  return (
    <video
      ref={ref}
      muted
      playsInline
      preload="metadata"
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      data-testid="ambient-video"
    />
  )
}

// use client: lazy-loads and plays a background video only while it is on screen
"use client"

import { useEffect, useRef, useState } from "react"
import { prefersReducedMotion } from "@/components/site/motion/reducedMotion"

/** How long a rejected autoplay waits before it is tried again. */
const AUTOPLAY_RETRY_MS = 4000

/**
 * Decorative background video that loops natively.
 * - Playback pauses off screen and resumes when the element returns.
 * - The source is attached only once the element approaches the viewport, and only when the visitor has
 *   not asked for reduced motion. A rejected autoplay is retried four seconds later.
 * - A missing or failing source hides the element entirely so layouts never show a broken player.
 * - An optional `poster` (the film's first frame) shows before the source attaches and is what visitors
 *   who prefer reduced motion see instead of the film.
 */
export function AmbientVideo({
  src,
  poster,
  className,
  ariaLabel,
}: {
  src: string
  poster?: string
  className?: string
  ariaLabel?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v || failed) return
    if (prefersReducedMotion()) return

    let visible = false
    let initialized = false
    let playPending = false
    let retry = 0

    const tryPlay = () => {
      if (!visible || !v.src || !v.paused || playPending) return
      playPending = true
      v.play()
        .then(() => {
          playPending = false
        })
        .catch(() => {
          playPending = false
          // Autoplay can be refused before the visitor has interacted with the page; ask again later.
          if (!retry) {
            retry = window.setTimeout(() => {
              retry = 0
              tryPlay()
            }, AUTOPLAY_RETRY_MS)
          }
        })
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        visible = !!entry?.isIntersecting
        if (visible && !initialized) {
          initialized = true
          v.muted = true
          v.loop = true
          v.src = src
        }
        if (visible) tryPlay()
        else if (!v.paused) v.pause()
      },
      { rootMargin: "100px" }
    )
    io.observe(v)

    return () => {
      io.disconnect()
      if (retry) clearTimeout(retry)
      if (!v.paused) v.pause()
    }
  }, [src, failed])

  if (failed) return null

  return (
    <video
      ref={ref}
      muted
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      className={className}
      onError={() => setFailed(true)}
      data-testid="ambient-video"
    />
  )
}

// use client: the framed film runs a turntable loop over its own frame and seeks the video through a ref
"use client"

import { type ComponentPropsWithoutRef, useRef } from "react"
import { useReveal } from "@/components/site/motion/useReveal"
import { useTurntable } from "@/components/site/motion/useTurntable"
import { type ScrubHandle, ScrubVideo } from "@/components/site/ui/ScrubVideo"
import { cn } from "@/lib/site/cn"

/**
 * The frame every object film shares: a square of the deep green, clipped to the 18px radius, resting on
 * the surface with the product shadow. Generated imagery inside a frame is where that shadow belongs.
 */
const OBJECT_FILM_FRAME = "bg-tile-1 shadow-product relative m-0 aspect-square w-full overflow-hidden rounded-lg"

/**
 * A framed turntable film: a generated object turning on deep green lacquer, scrubbed rather than played.
 * While the frame is on screen `useTurntable` drifts the film from its first frame to its last and back
 * (the object slowly turns on its own); a pointer over the frame takes the wheel and the object follows the
 * pointer's x across the frame. Touch pointers leave the drift alone and reduced motion shows the poster.
 * A missing or failing source removes the video and leaves the frame standing.
 */
export function ObjectFilm({
  src,
  poster,
  className,
  testId = "object-film",
}: {
  src: string
  poster: string
  className?: string
  testId?: string
}) {
  const frameRef = useRef<HTMLElement>(null)
  const filmRef = useRef<ScrubHandle>(null)
  useTurntable(frameRef, (p) => filmRef.current?.seek(p))

  return (
    <figure ref={frameRef} data-testid={testId} className={cn(OBJECT_FILM_FRAME, className)}>
      <ScrubVideo ref={filmRef} src={src} poster={poster} className="absolute inset-0 h-full w-full object-cover" />
    </figure>
  )
}

/**
 * A client container for a server-rendered group: every `[data-reveal]` descendant arrives once, the first
 * time it scrolls into view, 60ms after the one before it. Server markup carries no reveal classes, so nothing
 * is hidden before JavaScript runs, and reduced motion marks nothing.
 */
export function RevealGroup({ className, children, ...rest }: ComponentPropsWithoutRef<"div">) {
  const ref = useRef<HTMLDivElement>(null)
  useReveal(ref)
  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  )
}

// use client: the framed film measures its own frame each scroll tick and seeks the video through a ref
"use client"

import { useRef } from "react"
import { useSceneProgress } from "@/components/site/scenes/useSceneProgress"
import { type ScrubHandle, ScrubVideo } from "@/components/site/ui/ScrubVideo"
import { revealProgress } from "@/lib/site/scroll"

/**
 * The close's film: a brass seal pressing wax, scrubbed by the frame's own progress into the viewport
 * rather than played. The figure is the scene root; `revealProgress` runs 0 → 1 as it rises from below
 * the fold to 65% of the viewport, and each change seeks the film to the matching frame. Imagery
 * resting on the light tile, so it carries the product shadow. Reduced motion leaves the poster in place.
 */
export function SealFilm() {
  const frameRef = useRef<HTMLElement>(null)
  const filmRef = useRef<ScrubHandle>(null)
  useSceneProgress(frameRef, (p) => filmRef.current?.seek(p), revealProgress)

  return (
    <figure
      ref={frameRef}
      className="shadow-product bg-tile-1 relative m-0 aspect-video w-full overflow-hidden rounded-lg"
      data-testid="seal-film"
    >
      <ScrubVideo
        ref={filmRef}
        src="/media/seal-press.mp4"
        poster="/media/seal-press-poster.jpg"
        ariaLabel="A brass Heirloom seal presses a cream wax seal on a deep green desk."
        className="absolute inset-0 h-full w-full object-cover"
      />
    </figure>
  )
}

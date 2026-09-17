// use client: the film layer leans toward the pointer over the tile it sits in
"use client"

import { useLayoutEffect, useRef } from "react"
import { usePointerParallax } from "@/components/site/motion/usePointerParallax"
import { AmbientVideo } from "@/components/site/ui/AmbientVideo"

export const HERO_FILM_SRC = "/media/hero-ambient.mp4"
export const HERO_FILM_POSTER = "/media/hero-ambient-poster.jpg"
/** How far, in pixels, the film leans toward the pointer. The layer overhangs the tile by 12px a side so no edge shows. */
export const HERO_FILM_LEAN_PX = 8

/**
 * The home hero's backdrop: the site's original ambient film (`hero-ambient.mp4`, restored at the user's request
 * in September 2026 in place of the Higgsfield caustics): a warm paper-toned tabletop model with translucent glass
 * blocks and glowing green paths, playing forward and back as a 14s ping-pong loop at 60% behind the light tile.
 * It paints first and the content columns are positioned above it. The film sits in an oversized layer
 * (`-inset-3`) that leans up to 8px toward the pointer anywhere over the tile (the layer's parent), so the
 * surface reads as material rather than wallpaper. The 16:9 film covers the tall tile from its centre, so wide
 * screens see most of the model and phones a central slice of it; the layer also overhangs the tile's bottom by
 * 96px (`-bottom-24`), so the tile's clip drops the film's last rows and its frame edge never shows; the tile's
 * hard edge against the parchment tile below is the system's divider. Reduced motion holds the poster and never leans; a missing film
 * removes itself and the tile stays plain canvas. The layer is decorative and inert to the pointer.
 */
export function HeroFilm() {
  const layerRef = useRef<HTMLDivElement>(null)
  // The lean area is the tile the layer sits in. A server component cannot hand a ref down, so the tile is read
  // from the DOM once the layer is attached: refs are set before layout effects run, and layout effects run
  // before the parallax effect reads the area (which itself does nothing for a missing area).
  const tileRef = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    tileRef.current = (layerRef.current as HTMLDivElement).parentElement
  }, [])
  usePointerParallax(tileRef, layerRef, { max: HERO_FILM_LEAN_PX })

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      data-testid="hero-film-layer"
      className="pointer-events-none absolute -inset-x-3 -top-3 -bottom-24 will-change-transform"
    >
      <AmbientVideo
        src={HERO_FILM_SRC}
        poster={HERO_FILM_POSTER}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />
    </div>
  )
}

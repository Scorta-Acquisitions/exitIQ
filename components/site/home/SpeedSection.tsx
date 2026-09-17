// use client: the race, the counter, and the reveals write to the DOM from frame loops
"use client"

import { type RefObject, useRef } from "react"
import { useCountUp } from "@/components/site/motion/useCountUp"
import { useRaceLoop } from "@/components/site/motion/useRaceLoop"
import { useReveal } from "@/components/site/motion/useReveal"
import { Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { type ScrubHandle, ScrubVideo } from "@/components/site/ui/ScrubVideo"
import { TextLink } from "@/components/site/ui/TextLink"
import {
  SPEED_COMPARISON,
  SPEED_COPY,
  SPEED_MONTH_TICKS,
  SPEED_PERCENT,
  SPEED_RANGE,
  SPEED_STEPS,
  speedPercent,
} from "@/lib/site/content/speed"
import { padIndex } from "@/lib/site/format"
import type { RaceFrame } from "@/lib/site/motion"
import { ROUTES } from "@/lib/site/routes"

type BarKey = (typeof SPEED_COMPARISON.bars)[number]["key"]

/** The runner dot's diameter in CSS pixels; the runner's travel is shortened by it so the dot ends inside the track. */
const RUNNER_PX = 7

/** How far along the traditional track a fill reaches at `progress` of its own track, as a scale factor. */
const fillScale = (progress: number, pct: number) => +((progress * pct) / 100).toFixed(4)

/**
 * The runner wrapper's translate: a share of its own (track) width less the same share of the dot, so the dot's
 * far edge meets the end of the fill and never leaves the track. The track clips the wrapper's overhang.
 */
const runnerShift = (progress: number, pct: number) => {
  const share = +(progress * pct).toFixed(2)
  return `translateX(calc(${share}% - ${+((share / 100) * RUNNER_PX).toFixed(2)}px))`
}

type Parts = Record<BarKey, HTMLDivElement | null>

/**
 * The comparison as a race: two tracks, two runners at the same pace, Heirloom's track 60% as long. Every
 * frame `useRaceLoop` reports is written straight to the DOM: each fill scales from its left edge, each
 * runner's track-wide wrapper slides so the dot rides the fill's end (the track clips the wrapper's overhang
 * horizontally, so the page never grows sideways), the hourglass film is seeked to the traditional runner's
 * progress (sand runs as the bars fill), and the two tracks and the film (never the labels) fade through the
 * reset. Server markup draws the finished race, which is also what reduced motion shows.
 */
function SpeedRace({
  filmRef,
  figureRef,
}: {
  filmRef: RefObject<ScrubHandle | null>
  figureRef: RefObject<HTMLElement | null>
}) {
  const comparisonRef = useRef<HTMLDivElement>(null)
  const fills = useRef<Parts>({ traditional: null, heirloom: null })
  const runners = useRef<Parts>({ traditional: null, heirloom: null })
  const tracks = useRef<Parts>({ traditional: null, heirloom: null })

  useRaceLoop(comparisonRef, (frame: RaceFrame) => {
    for (const bar of SPEED_COMPARISON.bars) {
      const progress = frame[bar.key]
      // Only the tracks fade through the reset; the labels and notes never flicker.
      const track = tracks.current[bar.key]
      if (track) track.style.opacity = String(frame.opacity)
      const fill = fills.current[bar.key]
      if (fill) fill.style.transform = `scaleX(${fillScale(progress, bar.pct)})`
      const runner = runners.current[bar.key]
      if (runner) runner.style.transform = runnerShift(progress, bar.pct)
    }
    filmRef.current?.seek(frame.traditional)
    if (figureRef.current) figureRef.current.style.opacity = String(frame.opacity)
  })

  return (
    <div
      ref={comparisonRef}
      role="img"
      aria-label={SPEED_COMPARISON.ariaLabel}
      className="flex max-w-[460px] flex-col gap-5"
      data-testid="speed-comparison"
    >
      {SPEED_COMPARISON.bars.map((bar) => {
        const heirloom = bar.key === "heirloom"
        return (
          <div key={bar.key} data-testid={`speed-bar-${bar.key}`}>
            <div className="type-caption mb-2 flex justify-between gap-3">
              <span className={heirloom ? "text-accent" : "text-fg-3"}>{bar.label}</span>
              <span className="text-fg tabular">{bar.note}</span>
            </div>
            <div
              ref={(el) => {
                tracks.current[bar.key] = el
              }}
              className="rounded-pill bg-fg/15 relative h-[3px] overflow-x-clip"
              data-testid={`speed-track-${bar.key}`}
            >
              <div
                ref={(el) => {
                  fills.current[bar.key] = el
                }}
                className={
                  heirloom
                    ? "rounded-pill bg-accent absolute inset-0 origin-left will-change-transform"
                    : "rounded-pill bg-fg/30 absolute inset-0 origin-left will-change-transform"
                }
                style={{ transform: `scaleX(${fillScale(1, bar.pct)})` }}
                data-testid={`speed-fill-${bar.key}`}
              />
              <div
                ref={(el) => {
                  runners.current[bar.key] = el
                }}
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-full will-change-transform"
                style={{ transform: runnerShift(1, bar.pct) }}
                data-testid={`speed-runner-${bar.key}`}
              >
                <span
                  className={
                    heirloom
                      ? "bg-accent absolute top-1/2 left-0 h-[7px] w-[7px] -translate-y-1/2 rounded-full"
                      : "bg-fg/60 absolute top-1/2 left-0 h-[7px] w-[7px] -translate-y-1/2 rounded-full"
                  }
                />
              </div>
            </div>
            {heirloom ? null : (
              <div aria-hidden="true" className="relative mt-1.5 h-[6px]" data-testid="speed-ticks">
                {SPEED_MONTH_TICKS.map((left) => (
                  <span
                    key={left}
                    className="bg-fg/25 absolute top-0 h-[6px] w-px -translate-x-1/2"
                    style={{ left: `${left}%` }}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Speed, on a dark tile: the 40% figure set as hero type, counting up once as it is first seen, beside
 * the two-bar comparison run as a race that never stops; the hourglass film framed under the headline
 * (the section's one image, so it carries the product shadow), scrubbed by the race so the sand runs with
 * the bars and the right glass has run through when the traditional runner arrives; then the five steps that keep a sale
 * moving as one numbered row under a hairline, arriving with a 60ms stagger the first time they scroll in.
 */
export function SpeedSection() {
  const rangeRef = useRef<HTMLSpanElement>(null)
  const stepsRef = useRef<HTMLOListElement>(null)
  const filmRef = useRef<ScrubHandle>(null)
  const figureRef = useRef<HTMLElement>(null)
  useCountUp(rangeRef, SPEED_PERCENT, { format: speedPercent })
  useReveal(stepsRef)

  return (
    <Tile tone="dark" data-testid="speed-section">
      <Container>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-x-12 gap-y-10">
          <div>
            <Eyebrow className="mb-4">{SPEED_COPY.eyebrow}</Eyebrow>
            <h2>
              <span ref={rangeRef} className="type-hero text-fg tabular block" data-testid="speed-range">
                {SPEED_RANGE.figure}
              </span>
              <span className="type-lead text-fg mt-3 block max-w-[420px]">{SPEED_RANGE.unit}</span>
            </h2>
            <figure
              ref={figureRef}
              className="bg-tile-1 shadow-product relative m-0 mt-8 aspect-video w-full max-w-[420px] overflow-hidden rounded-lg"
              data-testid="speed-film"
            >
              <ScrubVideo
                ref={filmRef}
                src="/media/speed-hourglasses.mp4"
                poster="/media/speed-hourglasses-poster.jpg"
                ariaLabel={SPEED_COPY.filmLabel}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </figure>
          </div>
          <div>
            <SpeedRace filmRef={filmRef} figureRef={figureRef} />
            <p className="type-body text-fg-2 mt-6 max-w-[460px]">{SPEED_COPY.explainer}</p>
            {/* 44px touch targets: mt-3 plus the centred 44px boxes put the text where mt-6 did; -mb-3 keeps the gap. */}
            <div className="mt-3 -mb-3 flex flex-wrap gap-x-6">
              <TextLink href={ROUTES.howItWorks} standalone>
                {SPEED_COPY.howItWorks}
              </TextLink>
              <TextLink href={ROUTES.fees} standalone>
                {SPEED_COPY.fees}
              </TextLink>
            </div>
          </div>
        </div>
        <ol
          ref={stepsRef}
          aria-label={SPEED_COPY.stepsLabel}
          className="m-0 mt-16 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,170px),1fr))] gap-x-6 gap-y-10 p-0"
        >
          {SPEED_STEPS.map((s, i) => (
            <li key={s.title} className="border-line border-t pt-4" data-reveal="" data-testid={`speed-step-${i}`}>
              <span className="type-caption text-fg-3 tabular block">{padIndex(i + 1)}</span>
              <span className="type-body-strong text-fg mt-2 block">{s.title}</span>
              <p className="type-body text-fg-2 mt-2">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Tile>
  )
}

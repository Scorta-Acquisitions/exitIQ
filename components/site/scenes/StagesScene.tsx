// use client: the roadmap advances with scroll position
"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { AdvisorTrigger } from "@/components/site/advisor/AdvisorCtaButton"
import { useSceneProgress } from "@/components/site/scenes/useSceneProgress"
import { Card, Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { type ScrubHandle, ScrubVideo } from "@/components/site/ui/ScrubVideo"
import { cn } from "@/lib/site/cn"
import { SALE_STAGES, STAGES_SCENE_COPY } from "@/lib/site/content/stages"
import { padIndex } from "@/lib/site/format"
import { STAGE_COUNT, stageFrame } from "@/lib/site/scroll"

/** Outlined pill shared by the YOU badge and the artifact tally. Never filled. */
const PILL = "rounded-pill inline-flex items-center border"

/**
 * The two-column stage grid (text left, slip right; one column on phones), shared by every stage
 * panel and by the film overlay so the film lands exactly in the slip column. `grid` itself is
 * added by each user: the panels always show it, the overlay only from the tablet breakpoint.
 */
const PANEL_GRID =
  "grid-cols-[repeat(auto-fit,minmax(min(100%,max(270px,44%)),1fr))] content-center-safe items-center gap-x-10 gap-y-5"

/** The slip column: centred on phones, flush with the container's right edge from the tablet breakpoint. */
const RIGHT_CELL = "tab:justify-self-end w-[min(100%,340px)] justify-self-center"

/**
 * From the tablet breakpoint the slip column is a fixed 350px tall: the 191px film (16:9 of 340px), the
 * 16px gap under it, and room for a three-line card. A cell is centred in its grid row, so padding alone
 * would move the card down by only half the film; one fixed height for every stage and for the film
 * overlay keeps the film in one place while the cards swap beneath it. Inside each stage's cell an
 * empty 16:9 spacer holds the film's place, so the card's offset always equals the film's height.
 */
const RIGHT_CELL_TAB_HEIGHT = "tab:h-[350px]"

/**
 * The eight-stage roadmap: a 460vh dark tile whose panel pins under the bar (`scene-pin` at `--bar-h`). A rail with
 * eight nodes fills with scroll, one stage panel is on screen at a time (the others wait above or
 * below at zero opacity), and the tally along the bottom lights an artifact as each stage completes.
 * From the tablet breakpoint the travertine film is a framed object above the "YOU RECEIVE" card,
 * scrubbed by the same scroll; it is mounted once, in an overlay aligned with the slip column, so
 * swapping stages never reloads it. Phones keep the panel for the text and the card; tall phones
 * (`tall:`, a 780px panel under the bar) also get the film's poster as a still above the card.
 */
export function StagesScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const filmRef = useRef<ScrubHandle>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState({ idx: 0, artifacts: 0, hint: true })

  useSceneProgress(sceneRef, (p) => {
    filmRef.current?.seek(p)
    const f = stageFrame(p)
    if (railRef.current) railRef.current.style.width = `${f.railPercent.toFixed(2)}%`
    setFrame((cur) =>
      cur.idx === f.idx && cur.artifacts === f.artifactsDelivered && cur.hint === f.hintVisible
        ? cur
        : { idx: f.idx, artifacts: f.artifactsDelivered, hint: f.hintVisible }
    )
  })

  return (
    <Tile as="div" tone="dark" padded={false} ref={sceneRef} className="h-[460vh]" data-testid="stages-scene">
      <div className="scene-pin overflow-hidden">
        <Container className="tab:py-10 relative flex h-full flex-col px-6 py-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <Eyebrow>{STAGES_SCENE_COPY.eyebrow}</Eyebrow>
            <span className="type-caption text-fg-3 hidden motion-reduce:inline">{STAGES_SCENE_COPY.stillNote}</span>
            <span className="type-caption text-fg tabular inline-flex items-baseline gap-1.5">
              <span className="relative inline-block h-[1.2em] w-[2.2ch]">
                {SALE_STAGES.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "ease-e1 absolute inset-0 transition-opacity duration-300",
                      frame.idx === i ? "opacity-100" : "opacity-0"
                    )}
                    aria-hidden={frame.idx !== i}
                  >
                    {padIndex(i + 1)}
                  </span>
                ))}
              </span>
              <span className="text-fg-3">/ {padIndex(STAGE_COUNT)}</span>
            </span>
          </div>

          <div className="mt-5">
            {/* The track runs from the first node's centre to the last: each of the eight columns is 1/8 wide. */}
            <div className="bg-fg/15 rounded-pill relative mx-[calc(100%/16)] h-[2px]">
              <div
                ref={railRef}
                className="bg-accent ease-e1 rounded-pill absolute inset-y-0 left-0 w-0 transition-[width] duration-200"
              />
            </div>
            <div className="-mt-[15px] flex justify-between gap-1">
              {SALE_STAGES.map((s, i) => {
                const done = i < frame.idx
                const act = i === frame.idx
                return (
                  <div key={s.label} className="relative flex min-w-0 flex-1 flex-col items-center">
                    <span
                      className={cn(
                        "ease-e1 relative inline-flex h-7 w-7 items-center justify-center rounded-full border transition-[background-color,border-color,color] duration-300",
                        done
                          ? "border-accent bg-accent"
                          : act
                            ? "border-accent text-accent ring-accent ring-1 ring-inset"
                            : "border-line text-fg-3"
                      )}
                      data-testid={`stage-node-${i}`}
                      data-state={done ? "done" : act ? "active" : "pending"}
                    >
                      <span
                        className={cn(
                          "type-fine-print tabular ease-e1 transition-opacity duration-300",
                          done ? "opacity-0" : "opacity-100"
                        )}
                      >
                        {i + 1}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "type-fine-print text-tile-1 ease-e1 absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                          done ? "opacity-100" : "opacity-0"
                        )}
                      >
                        ✓
                      </span>
                    </span>
                    <span
                      className={cn(
                        "type-fine-print text-accent ease-e1 mt-1.5 whitespace-nowrap transition-opacity duration-300",
                        act ? "opacity-100" : "opacity-0"
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative mt-4 min-h-0 flex-1">
            {/* One film for the scene, in the slip column's cell of the same grid; the stage panels paint over it. */}
            <div aria-hidden="true" className={cn(PANEL_GRID, "tab:grid pointer-events-none absolute inset-0 hidden")}>
              <div />
              <div className={cn(RIGHT_CELL, RIGHT_CELL_TAB_HEIGHT)}>
                <div className="relative aspect-video overflow-hidden rounded-lg" data-testid="stages-film">
                  <ScrubVideo
                    ref={filmRef}
                    src="/media/stages-path.mp4"
                    poster="/media/stages-path-poster.jpg"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
            {SALE_STAGES.map((s, i) => {
              const act = i === frame.idx
              return (
                <div
                  key={s.title}
                  className={cn(
                    PANEL_GRID,
                    "ease-e1 absolute inset-0 grid overflow-y-auto transition-[opacity,transform] duration-300",
                    act ? "z-[2] opacity-100" : "pointer-events-none z-[1] opacity-0"
                  )}
                  style={{
                    transform: act ? "translateY(0)" : i < frame.idx ? "translateY(-16px)" : "translateY(18px)",
                  }}
                  aria-hidden={!act}
                  data-testid={`stage-panel-${i}`}
                >
                  <div className="max-w-[520px]">
                    <Eyebrow tone="accent">
                      STAGE {padIndex(i + 1)} · {s.label.toUpperCase()}
                    </Eyebrow>
                    <h3 className="type-display-md text-fg mt-2">{s.title}</h3>
                    <p className="type-body text-fg-2 mt-3">
                      <span className="type-caption-strong text-fg-3">{STAGES_SCENE_COPY.heirloom}</span>
                      {s.heirloom}
                    </p>
                    <p className="type-body text-fg mt-4">
                      <span className={cn(PILL, "type-caption-strong text-fg-3 border-line mr-2 px-2.5 py-0.5")}>
                        {STAGES_SCENE_COPY.you}
                      </span>
                      {s.you}
                    </p>
                  </div>
                  <div className={cn(RIGHT_CELL, RIGHT_CELL_TAB_HEIGHT)}>
                    {/* From the tablet breakpoint a 16:9 spacer of the cell's width holds the film overlay's place above the card. */}
                    <div aria-hidden="true" className="tab:block hidden aspect-video w-full" />
                    {/* Tall phones show the film's poster as a still in the same frame, with the film's 16px gap to the
                        card; short phones and the tablet layout (which has the film itself) leave it out. `tall:` alone
                        would outrank `tab:hidden`, so the variant is stacked with `max-tab:`. */}
                    <Image
                      src="/media/stages-path-poster.jpg"
                      alt=""
                      width={340}
                      height={191}
                      className="tall:max-tab:block mb-4 hidden aspect-video w-full rounded-lg object-cover"
                    />
                    {/* A nested callout on the dark tile: the next tile shade, compact padding, so it also fits a 320px phone panel. */}
                    <Card padded="compact" className="tab:mt-4">
                      <Eyebrow as="span" tone="accent">
                        {STAGES_SCENE_COPY.receive}
                      </Eyebrow>
                      <div className="type-tagline text-fg mt-2">{s.receive}</div>
                    </Card>
                  </div>
                </div>
              )
            })}
          </div>

          {/* The hairline belongs to the tally: on phones, where the tally is hidden, the footer row has no rule above it. */}
          <div className="border-line tab:border-t tab:pt-3 mt-4">
            {/* On phones the stage text and slip need the full panel height; the artifact tally returns from 736px up. */}
            <div className="tab:flex hidden flex-wrap items-center gap-2">
              <Eyebrow as="span" className="mr-1">
                {STAGES_SCENE_COPY.tally}
              </Eyebrow>
              {SALE_STAGES.map((s, i) => {
                const got = i < frame.artifacts
                return (
                  <span
                    key={s.artifact}
                    className={cn(
                      PILL,
                      "type-caption text-fg border-line ease-e1 gap-2 px-3 py-1 transition-opacity duration-300",
                      got ? "opacity-100" : "opacity-50"
                    )}
                  >
                    <span className="bg-accent h-[5px] w-[5px] rounded-full" />
                    {s.artifact}
                  </span>
                )
              })}
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1.5 pt-2">
              <span
                className={cn(
                  "type-fine-print text-fg-3 ease-e1 transition-opacity duration-300",
                  frame.hint ? "opacity-100" : "opacity-0"
                )}
              >
                {STAGES_SCENE_COPY.hint}
              </span>
              {/* Negative margins keep the 44px touch target from adding height to the footer row. */}
              <AdvisorTrigger className="type-caption text-link -my-3 inline-flex min-h-11 items-center">
                Talk to an M&amp;A advisor
              </AdvisorTrigger>
            </div>
          </div>
        </Container>
      </div>
    </Tile>
  )
}

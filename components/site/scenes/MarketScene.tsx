// use client: scroll-choreographed letters need live measurement and per-frame DOM updates
"use client"

import { useRef, useState } from "react"
import { useSceneProgress } from "@/components/site/scenes/useSceneProgress"
import { AmbientVideo } from "@/components/site/ui/AmbientVideo"
import { Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { cn } from "@/lib/site/cn"
import {
  MARKET_COPY,
  MARKET_LETTER,
  MARKET_LOIS,
  MARKET_SLIP,
  MARKET_STEPS,
  marketNdaLine,
} from "@/lib/site/market/data"
import { ROUTES } from "@/lib/site/routes"
import { activeStep, filmParallax, marketFrame, marketProgress, marketSlipIds, scenePins } from "@/lib/site/scroll"

const SLIP_IDS = marketSlipIds()

/** A sheet of paper resting on the dark scene: white surface, small radius, no shadow. Position comes from the frame. */
const PAPER = "on-light bg-canvas rounded-sm absolute top-0 left-0 border opacity-0 will-change-transform"
/** Outlined status pill printed on a paper sheet. */
const PILL = "type-fine-print rounded-pill inline-flex items-center border px-2 py-0.5"

/**
 * The "private market" scene: one inbound letter arrives, anonymous teaser slips fan out and are
 * filtered, every fourth survivor flips to its NDA face, then four letters of intent land like dealt
 * cards. The dark tile is 255vh tall; its first child pins under the bar (`scene-pin`, `--bar-h`) while the
 * choreography (opacity and transform from `marketFrame`) plays behind the four steps on the left. On a tall
 * phone (a 780px panel under the bar: the `tall:` variant at 832px) the stage is confined to the bottom 44% of the panel so the paper
 * never covers the copy above it, the slips and letters are narrower (120px and 150px) and `marketFrame`
 * scales the fan to the band and lands the four letters as a two-by-two hand, and only the active step
 * shows its body so the four steps always fit above the band without scrolling. A short phone cannot hold
 * the copy and a band in one viewport, so there the scene is not pinned: the tile takes its natural
 * height, the copy comes first in the flow and the stage follows it as a 400px band (`order-2`), with the
 * choreography still driven by the scene's progress through the viewport. The pin therefore applies from
 * the tablet breakpoint or on a tall phone (`tab:scene-pin tall:max-tab:scene-pin`; the custom variant
 * is stacked with `max-tab:` because it outranks the breakpoint variants). A flowing scene measures its
 * progress against a viewport-anchored window (`marketProgress`, `MARKET_FLOW`) rather than its own
 * height, which changes as step bodies unfold. The root reports the mode as `data-layout`.
 * Under everything from the tablet breakpoint, the desk film is the environment the paper rests on: a
 * continuous loop at 60%, so daylight and leaf shadows drift across the lacquer the whole time the scene is
 * pinned (on phones the band is too small to earn a film, so the paper plays on the flat tile). It sits in a
 * layer that drifts 3% against the scroll (`filmParallax`), written to the DOM in the same frame as the
 * paper, so the desk moves with the visitor as well as on its own.
 */
export function MarketScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const filmLayerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const letterRef = useRef<HTMLDivElement>(null)
  const slipRefs = useRef<Array<HTMLDivElement | null>>([])
  const ndaRefs = useRef<Array<HTMLDivElement | null>>([])
  const loiRefs = useRef<Array<HTMLDivElement | null>>([])
  const [step, setStep] = useState(-1)
  const [pinned, setPinned] = useState(true)

  useSceneProgress(
    sceneRef,
    (p, size) => {
      const pins = scenePins(size.width, window.innerHeight)
      setPinned((cur) => (cur === pins ? cur : pins))
      if (filmLayerRef.current) filmLayerRef.current.style.transform = filmParallax(p)
      const stage = stageRef.current
      if (stage) {
        const frame = marketFrame(p, stage.offsetWidth, stage.offsetHeight, SLIP_IDS.length, MARKET_LOIS.length)
        if (letterRef.current) {
          letterRef.current.style.opacity = String(frame.letter.opacity)
          letterRef.current.style.transform = frame.letter.transform
        }
        frame.slips.forEach((s, i) => {
          const el = slipRefs.current[i]
          if (el) {
            el.style.opacity = String(s.opacity)
            el.style.transform = s.transform
          }
          const nda = ndaRefs.current[i]
          if (nda) nda.style.opacity = String(s.ndaOpacity)
        })
        frame.lois.forEach((l, j) => {
          const el = loiRefs.current[j]
          if (el) {
            el.style.opacity = String(l.opacity)
            el.style.transform = l.transform
            el.style.zIndex = String(l.zIndex ?? 1)
          }
        })
      }
      const next = activeStep(p, MARKET_STEPS)
      setStep((cur) => (cur === next ? cur : next))
    },
    marketProgress
  )

  return (
    <Tile
      as="div"
      tone="dark"
      padded={false}
      ref={sceneRef}
      className="tab:h-[255vh] tall:max-tab:h-[255vh]"
      data-testid="market-scene"
      data-layout={pinned ? "pinned" : "flow"}
    >
      {/* A flex column so the flowing short-phone layout can order the copy before the stage; the pinned layouts'
          absolute children are out of the flow and unaffected. `relative` keeps the panel the containing block of
          its absolute film layer when it is not pinned, so the panel's overflow clip still applies to the layer's
          1.06 scale (otherwise it would widen the page). */}
      <div className="tab:scene-pin tall:max-tab:scene-pin relative flex flex-col overflow-hidden px-6">
        {/* The desk film paints first so the paper stage and the copy sit above it. Its layer carries the scroll
            parallax (transform only, clipped by the panel); the film loops on its own inside it. */}
        <div
          ref={filmLayerRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 will-change-transform"
          data-testid="market-film-layer"
        >
          <AmbientVideo
            src="/media/market-desk-live.mp4"
            poster="/media/market-desk-live-poster.jpg"
            className="tab:block pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-60"
          />
        </div>
        {/* On a short phone the paper is a 400px band that follows the copy in the flow (order-2, bled to the panel's
            edges); on a tall phone it is the bottom 44% of the pinned panel; from the tablet breakpoint it fills the
            panel behind the copy. */}
        <div
          ref={stageRef}
          aria-hidden="true"
          className="tall:max-tab:absolute tall:max-tab:inset-x-0 tall:max-tab:bottom-0 tall:max-tab:mx-0 tall:max-tab:h-[44%] tab:absolute tab:inset-0 tab:mx-0 tab:h-auto pointer-events-none relative order-2 -mx-6 h-[400px] shrink-0 overflow-hidden"
          data-testid="market-stage"
        >
          <div ref={letterRef} className={cn(PAPER, "border-line w-[220px] px-4 py-3.5")}>
            <div className="type-fine-print text-fg-3">{MARKET_LETTER.from}</div>
            <div className="type-caption text-fg mt-2">
              {MARKET_LETTER.quoteBefore}
              <strong>{MARKET_LETTER.amount}</strong>
              {MARKET_LETTER.quoteAfter}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="type-fine-print text-fg-3">{MARKET_LETTER.foot}</span>
            </div>
          </div>
          {SLIP_IDS.map((id, i) => (
            <div
              key={id}
              ref={(el) => {
                slipRefs.current[i] = el
              }}
              className={cn(PAPER, "border-line tab:w-[150px] w-[120px] px-3 py-2.5")}
              data-testid={`market-slip-${i}`}
            >
              <div className="relative">
                <div>
                  <div className="type-fine-print text-fg">{MARKET_SLIP.title}</div>
                  <div className="type-micro-legal text-fg-3 mt-1">{MARKET_SLIP.note}</div>
                  <span className={cn(PILL, "border-accent text-accent mt-2")}>{id}</span>
                </div>
                <div
                  ref={(el) => {
                    ndaRefs.current[i] = el
                  }}
                  className="bg-canvas border-accent absolute -inset-x-[13px] -inset-y-[11px] rounded-sm border px-3 py-2.5 opacity-0"
                >
                  <span className={cn(PILL, "border-accent text-accent")}>{MARKET_SLIP.ndaBadge}</span>
                  <div className="type-micro-legal text-fg-3 mt-1.5">{MARKET_SLIP.ndaNote}</div>
                  <div className="type-fine-print text-fg mt-1.5">{marketNdaLine(id)}</div>
                </div>
              </div>
            </div>
          ))}
          {MARKET_LOIS.map((loi, j) => {
            const committed = j === 2
            return (
              <div
                key={loi.tag}
                ref={(el) => {
                  loiRefs.current[j] = el
                }}
                className={cn(
                  PAPER,
                  "tab:w-[200px] w-[150px] px-4 py-3.5",
                  committed ? "border-accent ring-accent ring-1 ring-inset" : "border-line"
                )}
                data-testid={`market-loi-${loi.tag.slice(-1)}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="type-fine-print text-fg-3">{loi.tag}</span>
                  {loi.badge ? (
                    <span className={cn(PILL, committed ? "border-accent text-accent" : "border-line text-fg-3")}>
                      {loi.badge}
                    </span>
                  ) : null}
                </div>
                <div className="type-tagline text-fg tabular mt-2.5">{loi.amount}</div>
                <div className="type-fine-print text-fg-3 mt-2 leading-[1.5]">{loi.who}</div>
              </div>
            )
          })}
        </div>

        <Container className="tab:py-10 relative flex h-full flex-col py-6">
          <p className="type-caption text-fg-3 hidden motion-reduce:block">{MARKET_COPY.stillNote}</p>
          {/* On phones the copy takes only the height it needs, above the paper band; wider, it centres over the whole stage. */}
          <div className="tab:flex-1 tab:justify-center-safe tab:gap-3 flex max-w-[470px] flex-col gap-2 py-4">
            <div className="pb-3">
              <Eyebrow className="mb-4">{MARKET_COPY.eyebrow}</Eyebrow>
              <h2 className="type-display-lg text-fg">{MARKET_COPY.heading}</h2>
              <p className="type-body text-fg-2 mt-4">{MARKET_COPY.body}</p>
            </div>
            {MARKET_STEPS.map((s, i) => {
              const on = step === i
              return (
                <div
                  key={s.title}
                  className={cn(
                    "ease-e1 border-l-2 py-1 pl-4 transition-[opacity,border-color] duration-300",
                    on ? "border-accent opacity-100" : "border-line opacity-70"
                  )}
                  data-testid={`market-step-${i}`}
                  data-active={on}
                >
                  <div className="type-tagline text-fg">
                    <span className="type-caption text-fg-3 tabular mr-2">0{i + 1}</span>
                    {s.title}
                  </div>
                  {/* Below the tablet breakpoint only the active step unfolds its body; the titles always stay on screen. */}
                  <div className={cn("type-caption text-fg-2 mt-1", on ? "block" : "tab:block hidden")}>
                    {s.body}
                    {i === MARKET_STEPS.length - 1 ? (
                      /* Own line under the body. The 44px hit area is centred on the text, so -mt-2 keeps the 4px gap
                         above and -mb-3 keeps the step's left rule ending where the other steps' do. */
                      <span className="-mt-2 -mb-3 block">
                        <TextLink href={ROUTES.howItWorks} standalone>
                          {MARKET_COPY.link}
                        </TextLink>
                      </span>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </Container>
      </div>
    </Tile>
  )
}

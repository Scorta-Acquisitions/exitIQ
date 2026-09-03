// use client: scroll-choreographed letters need live measurement and per-frame DOM updates
"use client"

import { useRef, useState } from "react"
import { useSceneProgress } from "@/components/site/scenes/useSceneProgress"
import { SealDot } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { ROUTES } from "@/lib/site/routes"
import { activeStep, marketFrame, marketSlipIds, veilOpacity } from "@/lib/site/scroll"

const SLIP_IDS = marketSlipIds(18)

const LOIS = [
  { tag: "LETTER OF INTENT · A", amount: "$4.30M", who: "REGIONAL ACQUIRER" },
  { tag: "LETTER OF INTENT · B", amount: "$4.55M", who: "INDIVIDUAL BUYER" },
  {
    tag: "LETTER OF INTENT · C",
    amount: "$4.05M",
    who: "INVESTMENT GROUP · COMMITTED FINANCING",
    badge: "MOST CERTAIN",
  },
  { tag: "LETTER OF INTENT · D", amount: "$4.65M", who: "STRATEGIC ACQUIRER", badge: "HIGHEST HEADLINE" },
]

const STEPS = [
  {
    title: "One buyer appears",
    body: "A letter, call, or email gives you one number and one negotiating counterparty.",
  },
  {
    title: "We build the buyer list",
    body: "We research strategic acquirers, investment groups, search funds, and qualified individuals that fit the business.",
  },
  {
    title: "We qualify interest",
    body: "Buyers sign an NDA and prove they are serious before receiving sensitive information.",
  },
  {
    title: "You choose from real options",
    body: "We compare the full economics, buyer fit, and closing risk of every credible offer.",
  },
]

export function MarketScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const letterRef = useRef<HTMLDivElement>(null)
  const slipRefs = useRef<Array<HTMLDivElement | null>>([])
  const ndaRefs = useRef<Array<HTMLDivElement | null>>([])
  const loiRefs = useRef<Array<HTMLDivElement | null>>([])
  const [step, setStep] = useState(-1)

  useSceneProgress(sceneRef, (p) => {
    const stage = stageRef.current
    if (veilRef.current) veilRef.current.style.opacity = String(veilOpacity(p))
    if (stage) {
      const frame = marketFrame(p, stage.offsetWidth, stage.offsetHeight, SLIP_IDS.length, LOIS.length)
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
    const next = activeStep(p)
    setStep((cur) => (cur === next ? cur : next))
  })

  return (
    <div ref={sceneRef} className="bg-scene-paper relative h-[255vh] px-3 pt-[18px]" data-testid="market-scene">
      <div className="aurora panel-market border-dfull/8 text-d1 sticky top-[78px] h-[calc(100vh-92px)] min-h-[420px] overflow-hidden rounded-[26px] border shadow-[inset_0_1px_0_rgba(240,248,243,.06),0_30px_70px_rgba(11,36,27,.16)]">
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,rgba(247,244,225,.14)_0%,rgba(76,226,126,.10)_55%,rgba(247,244,225,.05)_100%)] opacity-0"
        />
        <div ref={stageRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            ref={letterRef}
            className="bg-slip border-hair-2 absolute top-0 left-0 w-[200px] rounded-lg border px-[15px] py-[13px] opacity-0 shadow-[0_24px_60px_rgba(0,0,0,.5)] will-change-transform"
          >
            <div className="text-slip-muted mb-1.5 font-mono text-[7.5px] tracking-[1.2px]">BY MAIL · TO THE OWNER</div>
            <div className="font-display text-ink mb-1.5 text-[15px] leading-[1.3]">
              &quot;We are prepared to offer <strong className="font-medium">$4.1M</strong> for your business…&quot;
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slip-dim font-mono text-[7px] tracking-[1px]">ONE BUYER · ONE NUMBER</span>
              <SealDot />
            </div>
          </div>
          {SLIP_IDS.map((id, i) => (
            <div
              key={id}
              ref={(el) => {
                slipRefs.current[i] = el
              }}
              className="bg-slip-2 border-hair-2/90 absolute top-0 left-0 w-[120px] rounded-md border px-2.5 py-2 opacity-0 shadow-[0_10px_28px_rgba(0,0,0,.4)] will-change-transform"
            >
              <div className="relative">
                <div>
                  <div className="text-l2 font-mono text-[7.5px] tracking-[1px]">PROJECT RIDGELINE</div>
                  <div className="text-slip-muted my-[3px] font-mono text-[6.5px] tracking-[.8px]">
                    ANONYMOUS TEASER · NO NAME
                  </div>
                  <div className="text-filament-ink font-mono text-[7.5px] tracking-[1px]">{id}</div>
                </div>
                <div
                  ref={(el) => {
                    ndaRefs.current[i] = el
                  }}
                  className="border-filament-ink/60 bg-paper-tint absolute -inset-x-2.5 -inset-y-2 rounded-md border px-2.5 py-2 opacity-0"
                >
                  <div className="text-filament-ink font-mono text-[7.5px] tracking-[1px]">NDA SIGNED</div>
                  <div className="text-slip-dim my-[3px] font-mono text-[6.5px] tracking-[.8px]">
                    IDENTITY RELEASED · LEVEL 2
                  </div>
                  <div className="text-l2 font-mono text-[7.5px] tracking-[1px]">{id} ✓</div>
                </div>
              </div>
            </div>
          ))}
          {LOIS.map((loi, j) => {
            const committed = j === 2
            return (
              <div
                key={loi.tag}
                ref={(el) => {
                  loiRefs.current[j] = el
                }}
                className={`absolute top-0 left-0 w-[170px] rounded-lg px-3.5 py-3 opacity-0 will-change-transform ${
                  committed
                    ? "border-filament-ink bg-paper-mint border-[1.5px] shadow-[0_18px_50px_rgba(0,0,0,.5),0_0_30px_rgba(76,226,126,.25)]"
                    : "border-hair-2 bg-paper-bright border shadow-[0_18px_50px_rgba(0,0,0,.5)]"
                }`}
              >
                <div className="mb-1 flex justify-between gap-1.5">
                  <span className="text-slip-muted font-mono text-[7px] tracking-[1.1px]">{loi.tag}</span>
                  {loi.badge ? (
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-mono text-[6.5px] tracking-[.8px] ${
                        committed ? "bg-filament-ink text-paper-tint" : "border-hair-2 text-slip-dim border"
                      }`}
                    >
                      {loi.badge}
                    </span>
                  ) : null}
                </div>
                <div className="font-display text-ink mb-1 text-[23px] leading-none">{loi.amount}</div>
                <div className="text-l2 font-mono text-[7.5px] tracking-[.8px]">{loi.who}</div>
              </div>
            )
          })}
        </div>

        <div className="relative mx-auto flex h-full max-w-[1132px] flex-col px-6 py-[clamp(12px,4vh,44px)]">
          <div className="flex flex-wrap items-baseline justify-between gap-x-[18px] gap-y-1">
            <span className="text-signal font-mono text-[clamp(9.5px,1.8vh,11.5px)] tracking-[1.2px] uppercase">
              A private market for your business
            </span>
          </div>
          <p className="text-d4 mt-1.5 hidden font-mono text-[10px] motion-reduce:block">
            Use the controls below to review the same information without animation.
          </p>
          <div className="flex min-h-0 max-w-[470px] flex-1 flex-col justify-center gap-[clamp(3px,.9vh,16px)] py-1">
            <div className="pt-0.5 pb-[clamp(2px,.8vh,10px)]">
              <h2 className="font-display text-d1 mb-1.5 text-[clamp(20px,min(2.8vw,4vh),34px)] leading-[1.06] font-normal tracking-[-.6px]">
                One buyer should not set the price.
              </h2>
              <p className="text-d3 text-[clamp(11px,2vh,13px)] leading-[1.5]">
                An inbound offer gives you one buyer’s view of value and one set of terms. We build a private market
                around your business so credible buyers can compete on price, cash, certainty, transition, and fit.
              </p>
            </div>
            {STEPS.map((s, i) => {
              const on = step === i
              return (
                <div
                  key={s.title}
                  className={`ease-e1 border-l-2 py-[3px] pl-3.5 transition-[opacity,border-color] duration-[400ms] ${
                    on
                      ? "border-filament opacity-100"
                      : step < 0
                        ? "border-dhair opacity-30"
                        : "border-dhair opacity-45"
                  }`}
                  data-testid={`market-step-${i}`}
                  data-active={on}
                >
                  <div className="font-display text-[clamp(13.5px,min(2.2vw,3.2vh),25px)] leading-[1.12]">
                    <span className="text-d4 mr-[9px] font-mono text-[clamp(9.5px,1.7vh,11px)] tracking-[1px]">
                      0{i + 1}
                    </span>
                    {s.title}
                  </div>
                  <div className="text-d3 mt-1 text-[clamp(11px,2.2vh,13.5px)]">
                    {s.body}
                    {i === STEPS.length - 1 ? (
                      <>
                        {" "}
                        <TextLink href={ROUTES.howItWorks} tone="dark">
                          See the full sale process →
                        </TextLink>
                      </>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

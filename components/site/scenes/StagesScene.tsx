// use client: the roadmap advances with scroll position
"use client"

import { useRef, useState } from "react"
import { AdvisorTrigger } from "@/components/site/advisor/AdvisorCtaButton"
import { useSceneProgress } from "@/components/site/scenes/useSceneProgress"
import { SealDot } from "@/components/site/ui/primitives"
import { SALE_STAGES } from "@/lib/site/content/stages"
import { padIndex } from "@/lib/site/format"
import { STAGE_COUNT, stageFrame } from "@/lib/site/scroll"

export function StagesScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState({ idx: 0, artifacts: 0, hint: true })

  useSceneProgress(sceneRef, (p) => {
    const f = stageFrame(p)
    if (railRef.current) railRef.current.style.width = `${f.railPercent.toFixed(2)}%`
    setFrame((cur) =>
      cur.idx === f.idx && cur.artifacts === f.artifactsDelivered && cur.hint === f.hintVisible
        ? cur
        : { idx: f.idx, artifacts: f.artifactsDelivered, hint: f.hintVisible }
    )
  })

  return (
    <div ref={sceneRef} className="bg-scene-paper-stages relative h-[460vh] px-3 pt-[18px]" data-testid="stages-scene">
      <div className="aurora panel-market border-dfull/8 text-d1 sticky top-[78px] h-[calc(100vh-92px)] min-h-[460px] overflow-hidden rounded-[26px] border shadow-[inset_0_1px_0_rgba(240,248,243,.06),0_30px_70px_rgba(11,36,27,.16)]">
        <div className="relative mx-auto flex h-full max-w-[1132px] flex-col px-6 py-[clamp(12px,3vh,32px)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-signal font-mono text-[clamp(9.5px,1.8vh,11.5px)] tracking-[1.2px] uppercase">
              The sale, from first conversation to close
            </span>
            <span className="text-d4 hidden font-mono text-[10px] motion-reduce:inline">
              Use the controls below to review the same information without animation.
            </span>
            <span className="text-d1 inline-flex items-baseline gap-1.5 font-mono text-[clamp(11px,2.2vh,14px)]">
              <span className="relative inline-block h-[1.2em] w-[2.2ch]">
                {SALE_STAGES.map((_, i) => (
                  <span
                    key={i}
                    className={`ease-e1 absolute inset-0 transition-opacity duration-300 ${frame.idx === i ? "opacity-100" : "opacity-0"}`}
                    aria-hidden={frame.idx !== i}
                  >
                    {padIndex(i + 1)}
                  </span>
                ))}
              </span>
              <span className="text-d4">/ {padIndex(STAGE_COUNT)}</span>
            </span>
          </div>

          <div className="mt-[clamp(8px,2vh,18px)]">
            <div className="bg-dfull/10 relative mx-[clamp(11px,2vh,15px)] h-[2px] rounded-full">
              <div
                ref={railRef}
                className="bg-filament linear absolute inset-y-0 left-0 w-0 rounded-full shadow-[0_0_12px_rgba(76,226,126,.7)] transition-[width] duration-200"
              />
            </div>
            <div className="flex justify-between gap-1" style={{ marginTop: "calc(clamp(11px,2vh,15px) * -1 - 1px)" }}>
              {SALE_STAGES.map((s, i) => {
                const done = i < frame.idx
                const act = i === frame.idx
                return (
                  <div key={s.label} className="relative flex min-w-0 flex-1 flex-col items-center">
                    <span
                      className={`ease-e1 relative inline-flex h-[clamp(22px,4vh,30px)] w-[clamp(22px,4vh,30px)] items-center justify-center rounded-full border transition-[background,box-shadow,border-color] duration-300 ${
                        done
                          ? "border-filament bg-filament"
                          : act
                            ? "border-filament bg-filament/[18%] shadow-[0_0_0_5px_rgba(76,226,126,.14),0_0_18px_rgba(76,226,126,.55)]"
                            : "border-dhair bg-dfull/8"
                      }`}
                      data-testid={`stage-node-${i}`}
                      data-state={done ? "done" : act ? "active" : "pending"}
                    >
                      <span
                        className={`ease-e1 font-mono text-[clamp(9px,1.7vh,11px)] transition-[opacity,color] duration-300 ${
                          done ? "opacity-0" : act ? "text-filament" : "text-d4"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`text-ground-deep ease-e1 absolute inset-0 flex items-center justify-center text-[clamp(10px,1.9vh,13px)] transition-opacity duration-300 ${
                          done ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        ✓
                      </span>
                    </span>
                    <span
                      className={`text-filament ease-e1 mt-1.5 font-mono text-[clamp(8.5px,1.6vh,10.5px)] tracking-[.8px] whitespace-nowrap uppercase transition-opacity duration-300 ${
                        act ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            {SALE_STAGES.map((s, i) => {
              const act = i === frame.idx
              return (
                <div
                  key={s.title}
                  className={`ease-e1 absolute inset-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(270px,44%)),1fr))] content-center-safe items-center gap-x-10 gap-y-4 overflow-y-auto transition-[opacity,transform] duration-500 ${
                    act ? "z-[2] opacity-100" : "pointer-events-none z-[1] opacity-0"
                  }`}
                  style={{
                    transform: act ? "translateY(0)" : i < frame.idx ? "translateY(-16px)" : "translateY(18px)",
                  }}
                  aria-hidden={!act}
                  data-testid={`stage-panel-${i}`}
                >
                  <div className="max-w-[520px]">
                    <div className="text-filament mb-[clamp(6px,1.4vh,12px)] font-mono text-[clamp(9.5px,1.8vh,11.5px)] tracking-[1.4px]">
                      STAGE {padIndex(i + 1)} · {s.label.toUpperCase()}
                    </div>
                    <h3 className="font-display text-d1 mb-[clamp(6px,1.4vh,12px)] text-[clamp(22px,4.4vh,40px)] leading-[1.08] font-normal tracking-[-.6px]">
                      {s.title}
                    </h3>
                    <p className="text-d2 mb-[clamp(8px,1.8vh,16px)] text-[clamp(13px,2.4vh,16px)] leading-[1.6]">
                      <span className="text-d4 font-mono text-[clamp(8.5px,1.6vh,10px)] tracking-[1.1px]">
                        HEIRLOOM ·{" "}
                      </span>
                      {s.heirloom}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                      <span className="text-d4 font-mono text-[clamp(9px,1.7vh,10.5px)] tracking-[1.1px]">YOU</span>
                      <span className="bg-paper-bright text-ink rounded-full px-3.5 py-[clamp(5px,1.1vh,8px)] text-[clamp(12px,2.2vh,14px)] font-medium shadow-[0_8px_24px_rgba(0,0,0,.35)]">
                        {s.you}
                      </span>
                    </div>
                  </div>
                  <div className="w-[min(100%,340px)] -rotate-[1.6deg] justify-self-center">
                    <div className="bg-slip border-hair-2 rounded-xl border px-[clamp(14px,1.8vw,20px)] py-[clamp(12px,2.4vh,20px)] shadow-[0_30px_70px_rgba(0,0,0,.5)]">
                      <div className="mb-[clamp(6px,1.4vh,10px)] flex items-center justify-between">
                        <span className="text-filament-ink font-mono text-[clamp(8.5px,1.6vh,10px)] tracking-[1.3px]">
                          YOU RECEIVE
                        </span>
                        <SealDot />
                      </div>
                      <div className="font-display text-ink mb-[clamp(4px,1vh,8px)] text-[clamp(15.5px,2.7vh,21px)] leading-[1.22]">
                        {s.receive}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-dhair-2 border-t pt-[clamp(6px,1.4vh,12px)]">
            {/* On phones the stage text and slip need the full panel height; the chip tally returns from 721px up. */}
            <div className="tab:flex hidden flex-wrap items-center gap-1.5">
              <span className="text-d4 mr-1 font-mono text-[clamp(8.5px,1.6vh,10px)] tracking-[1.1px]">
                IN YOUR HANDS
              </span>
              {SALE_STAGES.map((s, i) => {
                const got = i < frame.artifacts
                return (
                  <span
                    key={s.artifact}
                    className={`border-hair-2 bg-paper-bright text-ink ease-e1 inline-flex items-center gap-[7px] rounded-full border px-[11px] py-[clamp(4px,.9vh,6px)] font-mono text-[clamp(9px,1.7vh,11px)] tracking-[.4px] transition-[opacity,transform] duration-[400ms] ${
                      got ? "opacity-100" : "translate-y-1 scale-[.96] opacity-[.22]"
                    }`}
                  >
                    <span className="bg-filament-ink h-[5px] w-[5px] rounded-full" />
                    {s.artifact}
                  </span>
                )
              })}
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1.5 pt-[clamp(5px,1.2vh,10px)] pb-[clamp(4px,1vh,8px)]">
              <span
                className={`text-d4 ease-e1 font-mono text-[clamp(8.5px,1.6vh,10px)] tracking-[.6px] transition-opacity duration-500 ${
                  frame.hint ? "opacity-100" : "opacity-0"
                }`}
              >
                Move through the stages to see what Heirloom handles and when you are needed.
              </span>
              <AdvisorTrigger className="hover-green-dark text-signal font-mono text-[clamp(9px,1.7vh,11px)]">
                Discuss my sale →
              </AdvisorTrigger>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

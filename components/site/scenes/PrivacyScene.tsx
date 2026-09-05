// use client: disclosure level follows scroll position
"use client"

import { useRef, useState } from "react"
import { CompanyRecord } from "@/components/site/confidentiality/CompanyRecord"
import { useSceneProgress } from "@/components/site/scenes/useSceneProgress"
import { AmbientVideo } from "@/components/site/ui/AmbientVideo"
import { TextLink } from "@/components/site/ui/TextLink"
import { HOME_STAGE_NAMES, homeStageName, PERMISSION_LEVELS } from "@/lib/site/confidentiality/data"
import { ROUTES } from "@/lib/site/routes"
import { privacyLevel, veilOpacity } from "@/lib/site/scroll"

export function PrivacyScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const [level, setLevel] = useState(1)

  useSceneProgress(sceneRef, (p) => {
    if (veilRef.current) veilRef.current.style.opacity = String(veilOpacity(p))
    const next = privacyLevel(p)
    setLevel((cur) => (cur === next ? cur : next))
  })

  const perm = PERMISSION_LEVELS[level] ?? PERMISSION_LEVELS[1]!

  return (
    <div
      ref={sceneRef}
      className="bg-scene-paper-privacy relative h-[150vh] px-3 pt-[18px]"
      data-testid="privacy-scene"
    >
      <div className="aurora panel-privacy border-dfull/8 text-d1 sticky top-[78px] h-[calc(100vh-92px)] min-h-[440px] overflow-hidden rounded-[26px] border shadow-[inset_0_1px_0_rgba(240,248,243,.05),0_30px_70px_rgba(11,36,27,.18)]">
        <AmbientVideo
          src="/media/reveal.mp4"
          className="absolute inset-0 h-full w-full object-cover opacity-[.14] mix-blend-screen"
        />
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,rgba(247,244,225,.14)_0%,rgba(76,226,126,.10)_55%,rgba(247,244,225,.05)_100%)] opacity-0"
        />
        <div className="relative mx-auto grid h-full max-w-[1132px] grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,44%)),1fr))] content-center gap-6 px-6 py-[clamp(20px,4vh,44px)]">
          <div className="self-center">
            <h2 className="font-display text-d1 mb-2 text-[clamp(28px,3.6vw,44px)] leading-[1.06] font-normal tracking-[-.9px]">
              Who sees what
            </h2>
            <p className="text-d3 mb-4 max-w-[380px] text-[14.5px] leading-[1.55]">
              Buyers start with an anonymous overview. They learn your name after signing an NDA and see detailed
              records only after we qualify them.
            </p>
            <div className="mt-1.5 mb-2.5 flex items-baseline gap-3.5">
              <span
                className="text-glow-filament font-display text-filament text-[clamp(40px,5vw,64px)] leading-[.9]"
                data-testid="privacy-level"
              >
                L{level}
              </span>
              <span className="font-display text-d1 text-[clamp(22px,2.4vw,30px)] leading-none">
                {homeStageName(level)}
              </span>
            </div>
            <p className="text-d3 mb-3.5 max-w-[380px] font-mono text-[11.5px] leading-[1.6]">{perm.trig}</p>
            <div className="mb-3.5 flex flex-wrap gap-x-[7px] gap-y-[5px]">
              {HOME_STAGE_NAMES.map((name, i) => {
                const on = i + 1 === level
                return (
                  <span
                    key={name}
                    className={`ease-e1 rounded-full border px-2.5 py-[5px] font-mono text-[10px] tracking-[.5px] transition-all duration-300 ${
                      on ? "border-filament/50 bg-filament/10 text-filament" : "border-dhair-2 text-d4"
                    }`}
                  >
                    {name}
                  </span>
                )
              })}
            </div>
            <TextLink href={ROUTES.confidentiality} tone="dark" className="text-[13.5px]">
              See who can access what
            </TextLink>
            <p className="text-d4 mt-3 max-w-[380px] font-mono text-[10.5px] leading-[1.6]">
              Employees, customers, suppliers, and competitors are never contacted without your approval.
            </p>
          </div>
          <div className="max-h-full min-h-0 self-center overflow-y-auto">
            <CompanyRecord level={level} fieldCount={7} size="sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

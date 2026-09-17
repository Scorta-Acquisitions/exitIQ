// use client: the demo clock, the hover preview and the idle band
"use client"

import { useRef, useState } from "react"
import { demoStagger, ROW_IN } from "@/components/site/demo/classes"
import { DemoFrame } from "@/components/site/demo/DemoFrame"
import { DemoSection } from "@/components/site/demo/DemoSection"
import { LedgerLine } from "@/components/site/home/financial/LedgerLine"
import { useCountUp } from "@/components/site/motion/useCountUp"
import { useDemoClock } from "@/components/site/motion/useDemoClock"
import { useIdleTick } from "@/components/site/motion/useIdleTick"
import { KeyValueRow } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"
import { DEMO_IDLE_MS } from "@/lib/site/demo/clock"
import {
  FIGURE_LABELS,
  FINANCIAL_LINK_LABEL,
  FINANCIAL_SUBJECT,
  FINANCIAL_WORDS,
  type LedgerLineId,
  RIDGELINE_BASE,
} from "@/lib/site/financial/data"
import { FINANCIAL_SCRIPT, ledgerAt, money } from "@/lib/site/financial/demo"
import { ANCHORS } from "@/lib/site/routes"

/** The interface material behind the screen: smoked glass on green lacquer, at 35% from the tablet up. */
const FILM = {
  src: "/media/ledger-glass.mp4",
  poster: "/media/ledger-glass-poster.jpg",
  opacityClass: "opacity-35",
}

/** The line whose alternative the demo can preview: the add-back that rests on the payroll register. */
const PREVIEW_LINE: LedgerLineId = "ownerComp"

/**
 * The adjusted-earnings figure. It counts up once, the first time it is seen, while it still reads the
 * figure before any line is settled; every figure after that arrives where it stands (the counter's ref
 * lets go of it, so a changed figure never counts).
 */
function FootFigure({ figure, text }: { figure: number; text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useCountUp(ref, RIDGELINE_BASE, { format: money })
  return (
    <span
      key={text}
      ref={figure === RIDGELINE_BASE ? ref : null}
      data-testid="fin-foot"
      className={cn("type-lead text-fg tabular", ROW_IN)}
    >
      {text}
    </span>
  )
}

/**
 * Financial preparation: a few words beside the software's screen, and the screen plays itself. Project
 * Ridgeline's four lines arrive as they came in, open; one at a time a record is attached, the line's
 * status becomes a word a buyer's accountant can test, its meter fills, and the adjusted-earnings figure
 * moves to what that record supports. At the last beat the four places the figure is used light up, and
 * the screen names the figure the family payroll would leave without its register behind it.
 *
 * Everything on the screen is `ledgerAt(beat)`; the clock (`useDemoClock`) owns the section's one
 * requestAnimationFrame, pauses under the pointer or focus, steps with the arrow keys, holds its end state
 * and plays again. Resting on a line bands it; resting on the family payroll line, once its record is
 * attached, previews the one alternative the data holds: $817,400 with the add-back left in costs.
 */
export function FinancialPrep() {
  const screenRef = useRef<HTMLDivElement>(null)
  const { beat, cycle, state, announce, rootProps } = useDemoClock(screenRef, FINANCIAL_SCRIPT)
  const [hovered, setHovered] = useState<LedgerLineId | null>(null)
  // The beat the finished demo rests on walks a band down the four lines, changing no text.
  const idle = useIdleTick(screenRef, DEMO_IDLE_MS, state === "ended")

  const view = ledgerAt(beat, hovered === PREVIEW_LINE)
  const previewing = view.lines.some((l) => l.id === PREVIEW_LINE && l.status === "removed")
  const current = view.lines.find((l) => l.current)?.id ?? null
  const idleLine = view.lines[idle % view.lines.length]?.id ?? null
  const banded = hovered ?? (state === "ended" ? idleLine : current)

  return (
    <DemoSection
      id="financial-preparation"
      tone="light"
      heading={FINANCIAL_WORDS.heading}
      sentence={FINANCIAL_WORDS.sentence}
      link={{ href: ANCHORS.financialPreparation, label: FINANCIAL_LINK_LABEL }}
      testid="fin-section"
    >
      <div
        ref={screenRef}
        {...rootProps}
        data-testid="fin-demo"
        data-foot={view.foot.figure}
        data-preview={previewing ? PREVIEW_LINE : undefined}
        className="rounded-lg"
      >
        <DemoFrame subject={FINANCIAL_SUBJECT} film={FILM} testid="fin-frame">
          {view.lines.map((line, i) => (
            <LedgerLine
              key={line.id}
              line={line}
              index={i}
              cycle={cycle}
              banded={banded === line.id}
              onHover={setHovered}
            />
          ))}

          {/* The foot rests on an opaque band, so the figure and its caption never read over the film. */}
          <div className="bg-tile-1">
            <KeyValueRow
              label={FIGURE_LABELS.earnings}
              className="tab:pt-4 px-6 pt-3 pb-0"
              labelClassName="type-caption text-fg-2"
            >
              <FootFigure figure={view.foot.figure} text={view.foot.figureText} />
            </KeyValueRow>
            {/* Both captions hold their lines from the first beat (two under the tablet breakpoint, where the
                copy wraps), so the screen never changes height as the demo plays or comes round again. */}
            <div className="tab:pb-3 px-6 pt-1.5 pb-2">
              <p
                key={view.foot.caption}
                data-testid="fin-foot-caption"
                className={cn("type-fine-print text-fg-3 max-tab:min-h-6 min-h-3", ROW_IN)}
              >
                {view.foot.caption}
              </p>
              <p
                key={view.foot.alt ?? "no-alt"}
                data-testid="fin-foot-alt"
                className={cn("type-fine-print text-fg-3 max-tab:min-h-6 mt-1.5 min-h-3", view.foot.alt && ROW_IN)}
              >
                {view.foot.alt}
              </p>
            </div>
            <KeyValueRow
              label={FIGURE_LABELS.valuation}
              className="border-line-soft tab:py-2.5 border-t px-6 py-2"
              labelClassName="type-caption text-fg-2"
            >
              <span
                key={view.foot.range}
                data-testid="fin-range"
                className={cn("type-caption text-fg tabular", ROW_IN)}
              >
                {view.foot.range}
              </span>
            </KeyValueRow>
            {/* Under the tablet breakpoint the four destinations step aside: the screen fits one phone. */}
            <KeyValueRow
              label={FIGURE_LABELS.usedIn}
              className="border-line tab:flex tab:py-2.5 hidden border-t px-6 py-2"
              labelClassName="type-caption text-fg-2"
            >
              <span data-testid="fin-used" className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                {view.usedIn.map((item, i) => (
                  <span
                    key={item.label}
                    data-lit={item.lit}
                    className={cn(
                      "type-fine-print ease-e1 transition-colors duration-300 motion-reduce:transition-none",
                      item.lit ? "text-fg" : "text-fg-3"
                    )}
                    style={{ transitionDelay: `${demoStagger(cycle, i)}ms` }}
                  >
                    {item.label}
                  </span>
                ))}
              </span>
            </KeyValueRow>
          </div>
        </DemoFrame>
        {/* The one live region: a keyboard step says where the demo landed; the play itself says nothing. */}
        <span className="sr-only" aria-live="polite">
          {announce}
        </span>
      </div>
    </DemoSection>
  )
}

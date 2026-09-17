import { usePrevious } from "@/components/site/motion/usePrevious"
import { ProgressTicks } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"
import { SALE_STAGES } from "@/lib/site/content/stages"
import { stageLine, stageState, type StageState } from "@/lib/site/decisions/demo"
import { staggerDelay } from "@/lib/site/motion"

const RULE: Record<StageState, string> = { done: "bg-fg/40", current: "bg-accent", later: "bg-fg/15" }
const LABEL: Record<StageState, string> = { done: "text-fg-2", current: "text-fg", later: "text-fg-3" }

/**
 * The eight stages across the top of the screen: a 2px rule over each label, the stages Heirloom has already
 * run dimmed as done, the one the beat's decision sits in drawn in the accent, the rest to come. Cells that
 * light in one render take their colour 60ms apart, left to right, so a stretch Heirloom ran reads as one
 * motion. The cells carry the label alone ("Numbers", "Meetings"), so every one fits its eighth of the rail;
 * the stage's number lives in the strip's accessible name and in the phone line ("Stage 4 of 8 · Privacy"),
 * which replaces the cells below the tablet breakpoint.
 */
export function StageStrip({ lit, current }: { lit: number; current: number | null }) {
  // The lit count at the last committed render, so only the cells newly lit in this render stagger.
  const prevLit = usePrevious(lit)
  const line = stageLine(lit, current)

  return (
    <div data-testid="dec-stages">
      <div role="img" aria-label={line} className="tab:grid hidden grid-cols-8 gap-1">
        {SALE_STAGES.map((stage, i) => {
          const state = stageState(i, lit, current)
          const delay = i >= prevLit && i < lit ? staggerDelay(i - prevLit) : 0
          return (
            <div key={stage.label} data-testid={`dec-stage-${i + 1}`} data-stage-state={state}>
              <span
                className={cn(
                  "ease-e1 rounded-pill block h-[2px] transition-[background-color] duration-300 motion-reduce:transition-none",
                  RULE[state]
                )}
                style={{ transitionDelay: `${delay}ms` }}
              />
              <span className={cn("type-fine-print mt-1.5 block truncate", LABEL[state])}>{stage.label}</span>
            </div>
          )
        })}
      </div>
      {/* Phones stack the ticks over the line, so the strip is one height at every width and every stage name. */}
      <div className="tab:hidden flex flex-col items-start gap-1.5">
        <ProgressTicks total={SALE_STAGES.length} filled={lit} label={line} />
        <span className="type-fine-print tab:type-caption text-fg-2 tabular" data-testid="dec-stage-line">
          {line}
        </span>
      </div>
    </div>
  )
}

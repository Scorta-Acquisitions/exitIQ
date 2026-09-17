import { ROW_IN, STAGE_IN } from "@/components/site/demo/classes"
import { Eyebrow } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"
import type { DecisionView } from "@/lib/site/decisions/demo"

/**
 * The one thing being decided, under the stage strip: the decision's place in the sale, the question it asks
 * the owner, the answer this worked example plays, and the caption that says whose answer it is. Between two
 * decisions the same four lines read that Heirloom is working, the stage the next decision waits at and what
 * those stages hand over; at the close they read the last stage, what the owner receives and the count of
 * what was theirs.
 *
 * All four lines are always there (`boardAt` fills them at every beat), so no row arrives or leaves as the
 * demo plays and the letters below never move. The pane arrives once per beat (`STAGE_IN`, re-keyed by the
 * caller) and the answer arrives after it.
 */
export function DecisionLine({ decision, arrive }: { decision: DecisionView; arrive: string }) {
  return (
    <div className={cn(STAGE_IN, "min-h-[104px]")} data-testid="dec-decision">
      <Eyebrow as="span">{decision.eyebrow}</Eyebrow>
      <p className="type-fine-print tab:type-body text-fg-2 mt-1.5" data-testid="dec-question">
        {decision.line}
      </p>
      <p
        key={arrive}
        className={cn("type-caption-strong tab:type-body-strong text-fg mt-1", ROW_IN)}
        data-testid="dec-answer"
      >
        {decision.answer}
      </p>
      <p className="type-fine-print text-fg-3 mt-1" data-testid="dec-caption">
        {decision.caption}
      </p>
    </div>
  )
}

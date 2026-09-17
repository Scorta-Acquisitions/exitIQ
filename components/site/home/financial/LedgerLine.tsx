import { BAND, demoStagger, METER_FILL, METER_TRACK, ROW_IN } from "@/components/site/demo/classes"
import { cn } from "@/lib/site/cn"
import { type LedgerLineId, type LineStatus } from "@/lib/site/financial/data"
import { type LedgerLineView } from "@/lib/site/financial/demo"

/**
 * The status word's colour: an open line reads muted, a supported one in the accent, one left in costs
 * recedes. The word is the whole signal; there is no light and no mark beside it.
 */
const STATUS_CLASS: Record<LineStatus, string> = {
  open: "text-fg-2",
  supported: "text-accent",
  removed: "text-fg-3",
}

interface LedgerLineProps {
  line: LedgerLineView
  /** The row's place in the ledger: on the first play it arrives `index` steps of 60ms after the first. */
  index: number
  /** Plays finished before this one; a replay arrives every row at once, so nothing re-staggers. */
  cycle: number
  /** Whether the row carries the band: the line this beat settles, the one under the pointer, or the idle beat's. */
  banded: boolean
  /** The pointer resting on the row (null on leaving), which previews this line's alternative. */
  onHover: (id: LedgerLineId | null) => void
}

/**
 * One line of Ridgeline's adjustment schedule: the label and, for a line that rests on adjusted earnings,
 * the amount; the records the amount is the difference of; a status word in the line's own vocabulary; a
 * 3px meter that fills once the record is attached; and the record itself once it is. The evidence line
 * keeps its space from the first beat, so the screen never changes height as the demo plays or replays.
 *
 * Presentational only: every string and figure arrives in `line` from `ledgerAt`, and the parent owns the
 * clock. Both status and evidence re-key on their own text, so a change arrives once where it stands.
 */
export function LedgerLine({ line, index, cycle, banded, onHover }: LedgerLineProps) {
  return (
    <div
      data-testid={`fin-line-${line.id}`}
      data-status={line.status}
      data-settled={line.settled}
      data-banded={banded}
      onPointerEnter={() => onHover(line.id)}
      onPointerLeave={() => onHover(null)}
      className={cn(
        "border-line ease-e1 tab:py-3 border-b px-6 py-2.5 transition-colors duration-300",
        banded && BAND,
        ROW_IN
      )}
      style={{ animationDelay: `${demoStagger(cycle, index)}ms` }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <span className="type-caption text-fg-2">{line.label}</span>
        {line.amount ? (
          <span data-testid={`fin-line-${line.id}-amount`} className="type-body text-fg tabular text-right">
            {line.amount}
          </span>
        ) : null}
      </div>
      <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <span data-testid={`fin-line-${line.id}-records`} className="type-fine-print text-fg-2 tabular">
          {line.records}
        </span>
        <span
          key={line.statusText}
          data-testid={`fin-line-${line.id}-status`}
          className={cn("type-fine-print", STATUS_CLASS[line.status], ROW_IN)}
        >
          {line.statusText}
        </span>
      </div>
      {/* Under the tablet breakpoint the line is two rows: the meter and the record step aside for the fit. */}
      <span className={cn(METER_TRACK, "tab:block mt-2 hidden")}>
        <span data-testid={`fin-fill-${line.id}`} className={METER_FILL} style={{ width: `${line.meter}%` }} />
      </span>
      {/* The record's line holds its 12px whether or not there is a record yet: the screen keeps its height. */}
      <span
        key={line.evidence ?? "open"}
        data-testid={`fin-line-${line.id}-evidence`}
        className={cn("type-fine-print text-fg-3 tab:block mt-2 hidden min-h-3", line.evidence && ROW_IN)}
      >
        {line.evidence}
      </span>
    </div>
  )
}

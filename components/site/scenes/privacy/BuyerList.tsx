import { BAND, demoStagger, ROW_IN } from "@/components/site/demo/classes"
import { Eyebrow } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"
import { BUYER_LIST_LABEL, type StandInKey } from "@/lib/site/confidentiality/data"
import { type BuyerRowView, PRIVACY_CLOSING_LINE } from "@/lib/site/confidentiality/demo"

/** The caption of each buyer re-keys as that buyer moves a level; siblings never arrive more than 60ms apart. */
const BUYER_ROW_STAGGER_MS = 60

/**
 * The four organisations the demo follows, in reach order: the competitor an owner exclusion stopped before
 * outreach, then the buyers who signed, qualified and were selected. Each row is one name and one caption —
 * where that buyer stands right now — and the row the pointer rests on previews the record as that buyer sees
 * it. The stopped row stays in the muted tone: it never heard the business existed, and the caption says why.
 * Under the four, the level no buyer in the list reaches, because closing documents leave the buyer log.
 */
export function BuyerList({
  rows,
  active,
  cycle,
  onPreview,
  onSelect,
}: {
  rows: BuyerRowView[]
  /** The buyer whose view the record is previewing, or null while the play owns the record. */
  active: StandInKey | null
  /** The play's cycle: rows arrive in order on the first play and change in place on every replay. */
  cycle: number
  onPreview: (key: StandInKey | null) => void
  onSelect: (key: StandInKey) => void
}) {
  return (
    <div data-testid="priv-buyers">
      <Eyebrow as="span">{BUYER_LIST_LABEL}</Eyebrow>
      <ul className="mt-2">
        {rows.map((row, i) => {
          const on = active === row.key
          return (
            <li key={row.key}>
              <button
                type="button"
                aria-pressed={on}
                data-testid={`priv-buyer-${row.key}`}
                data-state={row.state}
                data-active={on}
                onPointerEnter={() => onPreview(row.key)}
                onPointerLeave={() => onPreview(null)}
                onFocus={() => onPreview(row.key)}
                onBlur={() => onPreview(null)}
                onClick={() => onSelect(row.key)}
                className={cn(
                  "pressable flex min-h-[44px] w-full flex-col justify-center rounded-sm px-2 py-1.5 text-left",
                  on && BAND
                )}
              >
                <span className={cn("type-caption block", row.state === "stopped" ? "text-fg-3" : "text-fg")}>
                  {row.org}
                </span>
                <span
                  key={row.caption}
                  className={cn("type-fine-print text-fg-3 block", ROW_IN)}
                  style={{ animationDelay: `${demoStagger(cycle, i, BUYER_ROW_STAGGER_MS)}ms` }}
                  data-testid={`priv-buyer-${row.key}-caption`}
                >
                  {row.caption}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="type-fine-print text-fg-3 tab:block mt-3 hidden px-2" data-testid="priv-closing">
        {PRIVACY_CLOSING_LINE}
      </p>
    </div>
  )
}

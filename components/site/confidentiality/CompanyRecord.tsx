import { BAND, demoStagger } from "@/components/site/demo/classes"
import { Card, Eyebrow, KeyValueRow } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"
import { fieldTone, RECORD_FIELDS } from "@/lib/site/confidentiality/data"

/** Classes that draw a withheld value as a redaction bar: a faint bar of the text colour behind the same words. */
export const REDACTION_CLASS = "bg-fg/10 rounded-xs px-1.5"

/**
 * A value's line budget, for a record whose level changes under the visitor: every value fills the same
 * number of lines whatever the level says, so the card's height never moves. `type-caption` is 14px on a
 * 1.43 line (20.02px), so one line is 21px and two are 41px, rounded up past the sub-pixel.
 */
const VALUE_LINES: Record<number, string> = {
  1: "line-clamp-1 min-h-[21px]",
  2: "line-clamp-2 min-h-[41px]",
}

/** The same budget for the card's title, which is `type-caption-strong`: 14px on a 1.29 line (18.06px). */
const TITLE_LINES: Record<number, string> = {
  1: "line-clamp-1 min-h-[19px]",
  2: "line-clamp-2 min-h-[37px]",
}

/**
 * The Project Ridgeline company record as one buyer sees it at a given disclosure level: a nested
 * record card with a captioned header and hairline rows. Values that the level withholds or masks fall
 * back to the second text tone (legible on the dark tile, and inside the redaction bar); `size="sm"` tightens the paddings and steps the captions down one rung.
 * `animated` is for a record whose level changes under the visitor (the home privacy scene): each value
 * is keyed by its text so a changed value slides in (`animate-row-in`, still under reduced motion), and
 * withheld values sit in a redaction bar. The delay is the demos' own `demoStagger`, so the rows arrive in
 * order on the play's first pass (`cycle` 0) and change in place on every replay, as the other demo rows
 * do. Without `animated` the record renders exactly as before. `banded` marks one row with the demo's band, which is how the home demo's idle
 * beat walks the record once it has played: a tint on the row, and nothing else moves.
 */
export function CompanyRecord({
  level,
  fieldCount = RECORD_FIELDS.length,
  title,
  size = "md",
  animated = false,
  cycle = 0,
  banded = null,
  valueLines = 0,
  titleLines = 0,
}: {
  level: number
  fieldCount?: number
  title: string
  size?: "sm" | "md"
  animated?: boolean
  /** The play's cycle: rows arrive in order on the first play and change in place on every replay. */
  cycle?: number
  /** The index of the one row the idle beat is resting on, or null while nothing is banded. */
  banded?: number | null
  /** Hold every value to this many lines (`size="sm"` only), so a changing level never moves the card. */
  valueLines?: 0 | 1 | 2
  /** Hold the title to this many lines, so a changing viewer never moves the card either. */
  titleLines?: 0 | 1 | 2
}) {
  const fields = RECORD_FIELDS.slice(0, fieldCount)
  const small = size === "sm"
  return (
    <Card padded={false} className="overflow-hidden" data-testid="company-record">
      <div
        className={cn(
          "border-line-soft flex items-center justify-between border-b",
          small ? "px-4 py-2.5" : "px-5 py-3"
        )}
      >
        <Eyebrow as="span" className={cn(titleLines > 0 && TITLE_LINES[titleLines])}>
          {title}
        </Eyebrow>
      </div>
      <div className={small ? "px-4 pt-0.5 pb-2.5" : "px-5 pt-1 pb-3"}>
        {fields.map((f, i) => {
          const value = f.v[level] ?? f.v[0]
          const tone = fieldTone(value)
          const valueClass = cn(
            "ease-e1 flex-[2_1_190px] transition-colors duration-300",
            small ? "type-caption" : "type-body",
            small && valueLines > 0 && VALUE_LINES[valueLines],
            tone === "shown" ? "text-fg" : "text-fg-2"
          )
          const rowClass = cn(
            "border-line-soft justify-start border-b last:border-b-0",
            small ? "gap-y-0.5 py-2" : "gap-y-1 py-2.5",
            banded === i && cn(BAND, "rounded-xs")
          )
          const labelClass = cn("flex-[0_1_150px]", small && "type-fine-print leading-[1.5]")
          if (!animated) {
            return (
              <KeyValueRow
                key={f.l}
                label={f.l}
                className={rowClass}
                labelClassName={labelClass}
                valueClassName={valueClass}
              >
                {value}
              </KeyValueRow>
            )
          }
          // The value span is the row's own so it can be keyed by its text: a new value mounts a new span and the
          // arrival plays once; an unchanged value keeps its span and stays still.
          return (
            <KeyValueRow key={f.l} label={f.l} className={rowClass} labelClassName={labelClass}>
              <span
                key={value}
                className={cn(
                  valueClass,
                  "animate-row-in motion-reduce:animate-none",
                  tone !== "shown" && REDACTION_CLASS
                )}
                style={{ animationDelay: `${demoStagger(cycle, i)}ms` }}
              >
                {value}
              </span>
            </KeyValueRow>
          )
        })}
      </div>
    </Card>
  )
}

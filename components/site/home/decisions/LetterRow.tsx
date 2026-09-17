import { BAND } from "@/components/site/demo/classes"
import { usePreviewHandlers } from "@/components/site/demo/usePreviewHandlers"
import { cn } from "@/lib/site/cn"
import type { LetterView } from "@/lib/site/decisions/demo"

/** The row's own words: dim once a rule or the calendar has taken the letter out of the owner's hands. */
const TONE: Record<LetterView["state"], string> = {
  sealed: "text-fg-3",
  on: "text-fg",
  removed: "text-fg-3",
  filtered: "text-fg-3",
  winner: "text-fg",
}

/**
 * One of Project Ridgeline's four letters of intent: its name, the buyer, the headline price, and one line
 * under them saying where the letter stands — not yet received, left the table, off the calendar, or chosen.
 * A letter an owner's rule removed reads struck through; nothing is coloured red and nothing carries a symbol.
 *
 * A face-up row is a button: resting on it (or tapping it, where there is no pointer) pauses the demo and
 * reads the figures the ranking weighs. Its place in the order is CSS `order`, so the winner rising to the
 * top travels instead of redrawing, and the DOM order stays A to D for the keyboard.
 */
export function LetterRow({
  letter,
  banded,
  detail,
  active,
  arriveClass,
  delay,
  onPreview,
}: {
  letter: LetterView
  /** True for the row the idle beat is resting on once the demo has ended. */
  banded: boolean
  /** The figures this row reads while it is previewed, or null. */
  detail: string[] | null
  active: boolean
  /** How a changed word lands: an arrival on the first play, a swap in place on every replay. */
  arriveClass: string
  /** How long this row waits behind the one above it, in milliseconds. */
  delay: number
  onPreview: (id: LetterView["id"] | null) => void
}) {
  const previewProps = usePreviewHandlers(onPreview)
  const faceUp = letter.state !== "sealed"
  const Row = faceUp ? "button" : "div"
  const words = cn(TONE[letter.state], letter.struck && "line-through")
  return (
    <li
      style={{ order: letter.rank }}
      data-testid={`dec-letter-${letter.id}`}
      data-state={letter.state}
      data-rank={letter.rank}
      className="border-line border-b last:border-b-0"
    >
      <Row
        {...(faceUp
          ? {
              type: "button" as const,
              "aria-pressed": active,
              ...previewProps(letter.id, active),
            }
          : {})}
        className={cn(
          "ease-e1 tab:px-2 tab:py-2.5 block min-h-11 w-full rounded-sm py-1.5 text-left transition-colors duration-300 motion-reduce:transition-none",
          faceUp && "pressable cursor-pointer",
          banded && BAND
        )}
      >
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span className="flex min-w-0 flex-1 items-baseline gap-3">
            <span className={cn("type-fine-print tab:type-caption tabular flex-none", words)}>{letter.name}</span>
            <span
              key={letter.who}
              className={cn("type-fine-print tab:type-caption min-w-0 flex-1", words, arriveClass)}
            >
              {letter.who}
            </span>
          </span>
          <span
            key={letter.headline}
            className={cn("type-fine-print tab:type-caption tabular flex-none", words, arriveClass)}
          >
            {letter.headline}
          </span>
        </span>
        <span key={letter.note} style={{ animationDelay: `${delay}ms` }} className={cn("mt-0.5 block", arriveClass)}>
          {/* One line at every width: phones read the state alone, and from the tablet up the buyer's own fact follows it. */}
          <span className="type-fine-print text-fg-3 tab:hidden block min-h-[16px]">{letter.shortNote}</span>
          <span className="type-fine-print text-fg-3 tab:block hidden min-h-[16px]">{letter.note}</span>
        </span>
        {detail
          ? detail.map((line) => (
              <span key={line} className={cn("type-fine-print text-fg-2 mt-1 block", arriveClass)}>
                {line}
              </span>
            ))
          : null}
      </Row>
    </li>
  )
}

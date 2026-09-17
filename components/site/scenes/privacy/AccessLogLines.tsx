import { BAND, demoStagger, ROW_IN } from "@/components/site/demo/classes"
import { Eyebrow } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"
import { ACCESS_LOG_LABEL, LOG_PENDING } from "@/lib/site/confidentiality/data"
import { logLine } from "@/lib/site/confidentiality/demo"

/** A new log line arrives 40ms after the one above it; a replay changes them in place. */
const LOG_STAGGER_MS = 40

/**
 * The access history under the record: the latest entries the play has gathered, newest first, each one a
 * person, an organisation, what they opened and when — or one of Heirloom's own actions, which name no buyer.
 *
 * The list always holds `limit` rows, whether the play has filled them or not: a row the log has not written
 * yet reads "No entry yet" and waits. That is what keeps the screen's height still — the history fills in
 * without the frame growing, and the replay changes the words in the rows instead of taking rows away. A line
 * stays where it is once it has arrived; only a new line plays an arrival. The line a buyer preview belongs
 * to is banded, so hovering the excluded competitor points at its own revocation.
 */
export function AccessLogLines({
  entries,
  limit,
  banded,
  cycle,
  short,
}: {
  /** Indexes into `ACCESS_LOG`, newest first. */
  entries: number[]
  limit: number
  banded: number | null
  cycle: number
  /** The phone's reading of a line: the person and the act, without the organisation and the time. */
  short: boolean
}) {
  const rows = Array.from({ length: Math.max(0, limit) }, (_, i) => entries[i] ?? null)
  return (
    <div data-testid="priv-log">
      <Eyebrow as="span">{ACCESS_LOG_LABEL}</Eyebrow>
      <ul className="mt-1">
        {rows.map((index, i) => (
          <li
            key={index ?? `pending-${i}`}
            data-testid={`priv-log-${i + 1}`}
            data-entry={index ?? ""}
            data-pending={index === null}
            className={cn(
              "type-fine-print truncate rounded-xs px-1 py-1",
              index === null ? "text-fg-3/60" : cn("text-fg-3", ROW_IN),
              banded === index && BAND
            )}
            style={index === null ? undefined : { animationDelay: `${demoStagger(cycle, i, LOG_STAGGER_MS)}ms` }}
          >
            {index === null ? LOG_PENDING : logLine(index, short)}
          </li>
        ))}
      </ul>
    </div>
  )
}

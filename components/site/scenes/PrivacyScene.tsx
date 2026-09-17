// use client: the demo clock, the buyer preview and the field count on resize
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { CompanyRecord } from "@/components/site/confidentiality/CompanyRecord"
import { ROW_IN } from "@/components/site/demo/classes"
import { DemoFrame } from "@/components/site/demo/DemoFrame"
import { DemoSection } from "@/components/site/demo/DemoSection"
import { hoverUnavailable } from "@/components/site/motion/reducedMotion"
import { useDemoClock } from "@/components/site/motion/useDemoClock"
import { useIdleTick } from "@/components/site/motion/useIdleTick"
import { AccessLogLines } from "@/components/site/scenes/privacy/AccessLogLines"
import { BuyerList } from "@/components/site/scenes/privacy/BuyerList"
import { AmbientVideo } from "@/components/site/ui/AmbientVideo"
import { VisuallyHidden } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"
import type { StandInKey } from "@/lib/site/confidentiality/data"
import {
  levelLineFor,
  NARROW_PHONE,
  previewFor,
  PRIVACY_SCRIPT,
  PRIVACY_SECTION_ID,
  PRIVACY_SUBJECT,
  PRIVACY_WORDS,
  privacyFieldCount,
  privacyLogLimit,
  privacyTitleLines,
  RECORD_VALUE_LINES,
  recordAt,
} from "@/lib/site/confidentiality/demo"
import { DEMO_IDLE_MS } from "@/lib/site/demo/clock"
import { TAB_BREAKPOINT } from "@/lib/site/scroll"

/**
 * "Who sees what", playing itself: the Project Ridgeline company record opening one level at a time beside
 * the four organisations that looked at it. Nothing is asked of the visitor. The play runs the owner's
 * exclusion, the anonymous overview, the NDA, qualification and the finalist's selection; at every beat the
 * record's values re-key (withheld ones sit in redaction bars), the line under it reads the level and how
 * much is open, a buyer's caption moves to the stage it reached, and the access history gains the entry that
 * beat wrote. It rests on the last beat with the band walking the record, then plays again.
 *
 * The pointer holds the play and previews one consequence: resting on a buyer shows the record exactly as
 * that buyer sees it — the competitor an exclusion stopped sees the record's public column, and its own
 * revocation leads the log — and leaving restores the beat. Where hover is unavailable a tap does the same and a second
 * tap releases it. The arrow keys step the beats, Home replays and End stills; every step is spoken once in
 * the live region.
 *
 * Under the tablet breakpoint the two panes stack, the room film steps aside and the record shows its first
 * four rows over one log line, so the buyers, the record and the history share one screen with nothing
 * scrolling inside the frame. Reduced motion (and `?demo=still`) renders the finished state with no frame
 * loop at all, the film on its poster.
 */
export function PrivacyScene() {
  const rootRef = useRef<HTMLDivElement>(null)
  const { beat, cycle, state, announce, rootProps } = useDemoClock(rootRef, PRIVACY_SCRIPT)
  const [preview, setPreview] = useState<StandInKey | null>(null)
  // The server and the first client render lay out the wide record; a phone measures itself on mount.
  const [width, setWidth] = useState(TAB_BREAKPOINT)
  const [tapOnly, setTapOnly] = useState(false)

  useEffect(() => {
    const measure = () => setWidth((current) => (current === window.innerWidth ? current : window.innerWidth))
    measure()
    setTapOnly(hoverUnavailable())
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  const onPreview = useCallback(
    (key: StandInKey | null) => {
      // A device without hover fires pointerenter on a tap; there the tap handler owns the preview.
      if (!tapOnly) setPreview(key)
    },
    [tapOnly]
  )
  const onSelect = useCallback(
    (key: StandInKey) => setPreview((current) => (tapOnly && current === key ? null : key)),
    [tapOnly]
  )

  const fieldCount = privacyFieldCount(width)
  const narrow = width < TAB_BREAKPOINT
  // The narrowest phones (320 × 640) trade a line of every value and a little of the frame's padding for the fit.
  const narrowest = width < NARROW_PHONE
  const base = recordAt(beat)
  const view = preview ? previewFor(preview, base) : base
  // The idle beat walks the record's rows once the play has finished, and only while nothing is previewed.
  const resting = state === "ended" && !preview
  const tick = useIdleTick(rootRef, DEMO_IDLE_MS, resting)
  const bandedRow = resting ? tick % fieldCount : null

  return (
    <DemoSection
      id={PRIVACY_SECTION_ID}
      tone="dark"
      heading={PRIVACY_WORDS.heading}
      sentence={PRIVACY_WORDS.sentence}
      link={PRIVACY_WORDS.link}
      testid="privacy-scene"
    >
      <div
        ref={rootRef}
        {...rootProps}
        data-testid="priv-demo"
        data-level={view.level}
        data-viewer={view.viewer}
        data-preview={preview ?? ""}
      >
        <DemoFrame subject={PRIVACY_SUBJECT} testid="priv-frame">
          <div className={cn("tab:p-5", narrowest ? "p-2" : "p-3")}>
            <div
              className={cn(
                "tab:grid tab:grid-cols-[minmax(0,176px)_minmax(0,1fr)] tab:gap-6 flex flex-col",
                narrowest ? "gap-3" : "gap-4"
              )}
            >
              <BuyerList rows={base.rows} active={preview} cycle={cycle} onPreview={onPreview} onSelect={onSelect} />
              <div className="min-w-0">
                {/* The record rests on the room film, which is framed to it and clipped to the card's radius. */}
                <div className="relative" data-testid="privacy-record-frame">
                  <div
                    aria-hidden="true"
                    className="tab:block pointer-events-none absolute inset-0 hidden overflow-hidden rounded-lg"
                    data-testid="privacy-room-frame"
                  >
                    <AmbientVideo
                      src="/media/privacy-room.mp4"
                      poster="/media/privacy-room-poster.jpg"
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right opacity-60"
                    />
                  </div>
                  <div className="tab:p-3 relative">
                    <CompanyRecord
                      level={view.level}
                      fieldCount={fieldCount}
                      size="sm"
                      title={view.title}
                      animated
                      cycle={cycle}
                      banded={bandedRow}
                      valueLines={RECORD_VALUE_LINES}
                      titleLines={privacyTitleLines(width)}
                    />
                  </div>
                </div>
                <p
                  key={view.levelLine}
                  className={cn("type-caption text-fg-2 tabular tab:px-3 mt-1 truncate px-1", ROW_IN)}
                  data-testid="priv-level"
                >
                  {levelLineFor(view.level, width)}
                </p>
              </div>
            </div>
            {/* The history runs the frame's whole width, so every line reads on one line and none sits on the film. */}
            <div className="border-line-soft tab:mt-4 mt-3 border-t pt-2">
              <AccessLogLines
                entries={view.log}
                limit={privacyLogLimit(width)}
                banded={view.banded}
                cycle={cycle}
                short={narrow}
              />
            </div>
          </div>
        </DemoFrame>
        <VisuallyHidden>
          <span aria-live="polite" data-testid="priv-announce">
            {announce ?? ""}
          </span>
        </VisuallyHidden>
      </div>
    </DemoSection>
  )
}

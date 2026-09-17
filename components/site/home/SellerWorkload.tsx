// use client: the demo clock, the priority and letter previews, and the winner's travel to the top
"use client"

import { useRef, useState } from "react"
import { demoStagger, REKEY, ROW_IN } from "@/components/site/demo/classes"
import { DemoFrame } from "@/components/site/demo/DemoFrame"
import { DemoSection } from "@/components/site/demo/DemoSection"
import { usePreviewHandlers } from "@/components/site/demo/usePreviewHandlers"
import { DecisionLine } from "@/components/site/home/decisions/DecisionLine"
import { LetterRow } from "@/components/site/home/decisions/LetterRow"
import { StageStrip } from "@/components/site/home/decisions/StageStrip"
import { useDemoClock } from "@/components/site/motion/useDemoClock"
import { useFlipRows } from "@/components/site/motion/useFlipRows"
import { useIdleTick } from "@/components/site/motion/useIdleTick"
import { VisuallyHidden } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"
import { DEMO_ANCHOR, DEMO_SUBJECT, PRIORITY_ROW_LABEL, SECTION_LINK, SECTION_WORDS } from "@/lib/site/decisions/data"
import { boardAt, DECISIONS_SCRIPT, ghostRank, letterDetail, type LetterView } from "@/lib/site/decisions/demo"
import { DEMO_IDLE_MS } from "@/lib/site/demo/clock"
import type { Priority } from "@/lib/site/offers/data"

/** The status board behind the screen: the one film this section plays, well under the words on top of it. */
const FILM = { src: "/media/status-board.mp4", poster: "/media/status-board-poster.jpg", opacityClass: "opacity-20" }

/** What the pointer is resting on: a priority word, which re-ranks the letters, or one letter, which opens it. */
type Preview = { priority: Priority } | { letter: LetterView["id"] } | null

function previewName(preview: Preview): string {
  if (!preview) return ""
  return "priority" in preview ? preview.priority : preview.letter
}

/**
 * The whole sale in one screen: eight stages across the top, the decision the owner is making, Project
 * Ridgeline's four letters of intent, and the count of what Heirloom handled around them. It plays itself —
 * the owner answers four questions over nine and a half seconds, one exclusion takes the highest headline off
 * the table, the meeting rule keeps a contingent buyer off the calendar, and the priority lifts the letter it
 * chooses to the top — then rests on the close before playing again.
 *
 * Resting the pointer on it pauses it: a priority word ranks all four envelopes that way, with the two the
 * owner's own rules took out struck at their places, and a letter row reads the figures the ranking weighs.
 * The arrow keys step a beat at a time, Home replays and End jumps to the close; every figure comes from
 * `boardAt`, and nothing on this screen is typed into it.
 */
export function SellerWorkload() {
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [preview, setPreview] = useState<Preview>(null)
  const { beat, cycle, state, announce, rootProps } = useDemoClock(rootRef, DECISIONS_SCRIPT)
  const board = boardAt(beat)
  const ghost = preview && "priority" in preview ? ghostRank(preview.priority) : null
  const letters = ghost ?? board.letters
  const shown = previewName(preview)
  const snapshot = useFlipRows(listRef, `${beat}|${shown}`)
  const tick = useIdleTick(rootRef, DEMO_IDLE_MS, state === "ended")
  // The idle beat rests on one letter row at a time, and only once the demo has come to rest itself.
  const banded = state === "ended" ? tick % letters.length : -1
  // A changed word arrives on the first play and swaps where it stands on every replay, so nothing restages.
  const arriveClass = cycle === 0 ? ROW_IN : REKEY

  const show = (next: Preview) => {
    snapshot()
    setPreview(next)
  }
  // One preview contract for the four priority words: a mouse rests on one, a finger presses it.
  const priorityProps = usePreviewHandlers<{ priority: Priority }>(show)

  return (
    <DemoSection
      id={DEMO_ANCHOR}
      tone="light"
      heading={SECTION_WORDS.heading}
      sentence={SECTION_WORDS.sentence}
      link={SECTION_LINK}
      testid="seller-workload"
    >
      <div
        ref={rootRef}
        {...rootProps}
        data-testid="dec-demo"
        data-lit={board.lit}
        data-on-table={board.onTable.join(",")}
        data-preview={shown}
        className="rounded-lg"
      >
        <DemoFrame subject={DEMO_SUBJECT} film={FILM} testid="dec-frame">
          <div className="tab:p-6 p-4">
            <StageStrip lit={board.lit} current={board.current} />
            <div className="mt-5">
              <DecisionLine key={beat} decision={board.decision} arrive={board.decision.answer} />
            </div>
            <ul ref={listRef} className="border-line tab:-mx-2 m-0 mt-2 flex list-none flex-col border-t p-0">
              {letters.map((letter, i) => (
                <LetterRow
                  key={letter.id}
                  letter={letter}
                  banded={i === banded}
                  active={shown === letter.id}
                  detail={shown === letter.id ? letterDetail(letter.id) : null}
                  arriveClass={arriveClass}
                  delay={demoStagger(cycle, i)}
                  onPreview={(id) => show(id ? { letter: id } : null)}
                />
              ))}
            </ul>
            <div className="tab:min-h-[116px] min-h-[64px]" data-testid="dec-tail">
              <p
                className="type-fine-print tab:type-caption text-fg-2 tab:min-h-[20px] mt-3 min-h-[36px]"
                data-testid="dec-handled"
              >
                <span key={board.handled.line} className={arriveClass}>
                  {board.handled.line}
                </span>
              </p>
              {/* The four words the offer decision weighs, on screen from the first beat and lit once it is made. */}
              <div
                role="group"
                aria-label={PRIORITY_ROW_LABEL}
                className="tab:grid tab:grid-cols-2 tab:gap-x-5 mt-0.5 hidden"
                data-testid="dec-priorities"
              >
                {board.priorities.map((p, i) => (
                  <button
                    key={p.v}
                    type="button"
                    data-testid={`dec-priority-${p.v}`}
                    data-lit={p.lit ? "true" : "false"}
                    aria-pressed={shown === p.v}
                    {...priorityProps({ priority: p.v }, shown === p.v)}
                    style={{ animationDelay: `${demoStagger(cycle, i)}ms` }}
                    className={cn(
                      "type-caption pressable min-h-11 py-2.5 text-left",
                      p.lit ? "text-accent" : "text-fg-3",
                      cycle === 0 && ROW_IN
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p
                className={cn("type-fine-print text-fg-3 tab:min-h-[17px] mt-1 min-h-[32px]", arriveClass)}
                data-testid="dec-timing"
              >
                {board.timing}
              </p>
            </div>
          </div>
        </DemoFrame>
        <VisuallyHidden>
          <span aria-live="polite">{announce}</span>
        </VisuallyHidden>
      </div>
    </DemoSection>
  )
}

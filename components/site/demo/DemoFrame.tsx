import type { ReactNode } from "react"
import { AmbientVideo } from "@/components/site/ui/AmbientVideo"
import { Card, Eyebrow } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"
import { demoFrameHeading, WORKED_EXAMPLE } from "@/lib/site/demo/chrome"

interface DemoFrameProps {
  /** What the screen shows: "Adjusted earnings", "Company record", "Sale plan". */
  subject: string
  /**
   * The interface material behind the screen: a looping film at 30–60%, shown from the tablet breakpoint up,
   * where there is room for it to sit away from the copy.
   */
  film?: { src: string; poster: string; opacityClass: string }
  /** The frame's testid; the film layer inside it is `{testid}-film`. */
  testid: string
  children: ReactNode
}

/**
 * The software's screen: a dark card on whatever tile the section sits on, headed by the company and the
 * subject on the left and "Worked example" on the right, with a hairline under it. Every figure below that
 * header is one of Project Ridgeline's, so the label is the frame's one piece of chrome and it is always there.
 *
 * The film is decorative and absolute behind the content, hidden under the tablet breakpoint where the screen
 * needs its whole width; visitors who prefer reduced motion see its poster, and a missing film removes itself.
 * The card casts no shadow: it is an interface, not an object resting on the page.
 */
export function DemoFrame({ subject, film, testid, children }: DemoFrameProps) {
  return (
    <Card padded={false} data-testid={testid} className="on-dark bg-tile-1 relative overflow-hidden">
      {film ? (
        <div
          aria-hidden="true"
          data-testid={`${testid}-film`}
          className="tab:block pointer-events-none absolute inset-0 hidden"
        >
          <AmbientVideo
            src={film.src}
            poster={film.poster}
            className={cn("absolute inset-0 h-full w-full object-cover", film.opacityClass)}
          />
        </div>
      ) : null}
      <div className="relative">
        <div className="border-line-soft flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-6 py-4">
          <Eyebrow as="span" className="text-fg">
            {demoFrameHeading(subject)}
          </Eyebrow>
          <span className="type-fine-print text-fg-3">{WORKED_EXAMPLE}</span>
        </div>
        {children}
      </div>
    </Card>
  )
}

import type { ReactNode } from "react"
import { Container, Tile, type TileTone } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"

interface DemoSectionProps {
  /** The section's anchor id; the tile carries `anchor-target`, so a link to it lands under the bar. */
  id: string
  tone: Extract<TileTone, "light" | "dark">
  heading: string
  sentence: string
  link: { href: string; label: string }
  /** The tile's testid. The demo root inside `children` carries its own `{prefix}-demo` testid. */
  testid: string
  /** The software's screen: the element that carries the clock's `rootProps` and watches for visibility. */
  children: ReactNode
}

/**
 * The shell all three home demos share: a few words on the left, the software's screen on the right. The words
 * are one heading, one sentence and one link — no call to action, because the demo is the argument and the
 * bar's pill is the way to an advisor. `DEMO_WORD_CAPS` in `lib/site/demo/chrome.ts` is what "a few words"
 * means, and each section's test holds its own words to it.
 *
 * Under the tablet breakpoint the two columns stack and the screen runs the full width. Nothing here pins,
 * scrolls or measures: the demo's own root (the `children`) owns the clock.
 */
export function DemoSection({ id, tone, heading, sentence, link, testid, children }: DemoSectionProps) {
  return (
    <Tile tone={tone} id={id} className="anchor-target" data-testid={testid}>
      <Container className="tab:grid tab:grid-cols-[300px_minmax(0,1fr)] tab:gap-12 tab:items-start">
        <div>
          <h2 className="type-display-lg text-fg">{heading}</h2>
          <p className="type-body text-fg-2 mt-4">{sentence}</p>
          <TextLink href={link.href} standalone className="mt-2">
            {link.label}
          </TextLink>
        </div>
        <div className="tab:mt-0 mt-8">{children}</div>
      </Container>
    </Tile>
  )
}

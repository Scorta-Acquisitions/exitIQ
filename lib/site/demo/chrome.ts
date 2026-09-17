/**
 * The words the shared demo chrome shows and the caps the section words are held to, so no string a
 * visitor reads is typed into a component. The three demos are all the same fictional company, and every
 * screen says so. Unit-tested in `lib/site/__tests__/demo-chrome.test.ts`.
 */

/** The one fictional company every worked example on the site uses. */
export const DEMO_COMPANY = "Project Ridgeline"

/** The label on every demo screen: these are worked-example figures, not a real business. */
export const WORKED_EXAMPLE = "Worked example"

/** The demo screen's header: the company and what the screen shows ("Project Ridgeline · Adjusted earnings"). */
export function demoFrameHeading(subject: string): string {
  return `${DEMO_COMPANY} · ${subject}`
}

/** A few words beside the software's screen: the most each part of a demo's words may run to. */
export const DEMO_WORD_CAPS = { heading: 8, sentence: 30 } as const

/** The words a demo section sets beside its screen: one heading and one sentence, held to the caps above. */
export type DemoWords = { heading: string; sentence: string }

/** How many words a line of copy runs to; punctuation and double spaces do not count as words. */
export function wordCount(text: string): number {
  const words = text.trim().split(/\s+/)
  return words.length === 1 && words[0] === "" ? 0 : words.length
}

/** The parts of a section's words that run past their cap, named; an empty list is the passing case. */
export function overLongDemoWords(words: DemoWords): string[] {
  return (Object.keys(DEMO_WORD_CAPS) as Array<keyof typeof DEMO_WORD_CAPS>).filter(
    (part) => wordCount(words[part]) > DEMO_WORD_CAPS[part]
  )
}

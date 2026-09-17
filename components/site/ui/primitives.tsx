import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react"
import { cn } from "@/lib/site/cn"

/* ------------------------------------------------------------------------------------------------
 * Layout
 * ---------------------------------------------------------------------------------------------- */

const CONTAINER_WIDTH = {
  /** Reading column for prose and page heroes. */
  text: "max-w-[692px]",
  /** The default content lock, shared with the navigation bars and footer. */
  default: "max-w-[980px]",
} as const

type ContainerSize = keyof typeof CONTAINER_WIDTH

/** Centered content column. `size` picks one of the system's two content widths. */
export function Container({
  size = "default",
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"div"> & { size?: ContainerSize }) {
  return (
    <div className={cn("mx-auto w-full", CONTAINER_WIDTH[size], className)} {...rest}>
      {children}
    </div>
  )
}

export type TileTone = "light" | "parchment" | "dark" | "dark-3"

const TILE_TONE: Record<TileTone, string> = {
  light: "on-light bg-canvas",
  parchment: "on-light bg-canvas-parchment",
  dark: "on-dark bg-tile-1",
  /** A micro-step darker, for the bottom of a dark stack or a media frame. */
  "dark-3": "on-dark bg-tile-3",
}

/**
 * Full-bleed tile: the page is a stack of these, alternating light and dark, touching edge to edge with
 * no radius and no border. The colour change is the divider. Vertical padding is 80px (48px on phones)
 * unless `padded={false}`; horizontal padding is the 24px gutter. Dark tones switch the contextual
 * tokens (`text-fg`, `border-line`, `bg-surface`, accent) for everything inside. Forwards `ref` so a
 * scroll scene can measure its own root.
 */
export function Tile({
  tone = "light",
  padded = true,
  as = "section",
  ref,
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"section"> & {
  tone?: TileTone
  padded?: boolean
  as?: "section" | "div"
  ref?: Ref<HTMLDivElement>
}) {
  // Both elements share the div attribute set; typing the tag as "div" lets one ref type serve both.
  const Component = as as "div"
  return (
    <Component
      ref={ref}
      data-tone={tone}
      className={cn("relative", TILE_TONE[tone], padded && "tile px-6", className)}
      {...rest}
    >
      {children}
    </Component>
  )
}

/** The card recipe as classes, for controls (buttons, links) that must be a card themselves. */
export const CARD_CLASS = "bg-surface border-line rounded-lg border"
export const CARD_PADDING = "p-6"

/**
 * Utility card: the current surface colour, a 1px hairline, 18px radius, 24px padding. Never a shadow.
 * On a dark tile the surface is the next tile shade and the hairline is translucent white.
 * `padded="compact"` gives 16px for nested callouts.
 */
export function Card({
  padded = true,
  as: Component = "div",
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"div"> & { padded?: boolean | "compact"; as?: "div" | "article" }) {
  return (
    <Component
      className={cn(CARD_CLASS, padded === true && CARD_PADDING, padded === "compact" && "p-4", className)}
      {...rest}
    >
      {children}
    </Component>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Text
 * ---------------------------------------------------------------------------------------------- */

/**
 * Small muted caption that introduces a section or a heading (14px / 600, sentence case).
 * `tone="accent"` for the label above a card title; `as="span"` inside flex rows or buttons.
 */
export function Eyebrow({
  as: Component = "div",
  tone = "muted",
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"div"> & { as?: "div" | "span"; tone?: "muted" | "accent" }) {
  return (
    <Component
      className={cn(
        "type-caption-strong",
        tone === "accent" ? "text-accent" : "text-fg-3",
        Component === "span" && "block",
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}

/** Bordered key/value row used throughout record cards. */
export function KeyValueRow({
  label,
  children,
  className,
  labelClassName,
  valueClassName,
}: {
  label: string
  children: ReactNode
  className?: string
  labelClassName?: string
  /** When set, wraps the value in a span with these classes (e.g. "type-body text-fg tabular text-right"). */
  valueClassName?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5", className)}>
      <span className={cn("type-caption text-fg-3", labelClassName)}>{label}</span>
      {valueClassName ? <span className={valueClassName}>{children}</span> : children}
    </div>
  )
}

/** Visually hidden text for assistive technology. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>
}

/**
 * The honeypot every inquiry form carries: one text field a person never meets and a script fills by
 * habit. It sits inside `VisuallyHidden`, so it takes no layout space; `tabIndex={-1}` keeps it off the
 * tab order and `aria-hidden` keeps it and its label out of the accessibility tree, so no keyboard or
 * screen-reader visitor can reach it — while its name reads like a field worth filling. A value here
 * marks the submission automated: `/api/inquiry` answers it exactly as it answers a real one and
 * forwards nothing.
 */
export function HoneypotField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <VisuallyHidden>
      <label aria-hidden="true">
        Website
        <input
          type="text"
          name="website"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          data-testid="honeypot"
        />
      </label>
    </VisuallyHidden>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Indicators
 * ---------------------------------------------------------------------------------------------- */

/**
 * Progress ticks live in their own client file so the stagger can keep a ref across renders; re-exported here so
 * every import site keeps reading them from the primitives.
 */
export { ProgressTicks } from "@/components/site/ui/ProgressTicks"

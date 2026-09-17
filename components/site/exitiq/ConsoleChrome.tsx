// legacy exitIQ console: restored 2026-09-11 from the first build (e35fbbe) at the user's request; see styles/site.css
import { cva, type VariantProps } from "class-variance-authority"
import Link from "next/link"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"

/**
 * The chrome the restored console and exitIQ card are built from, exactly as the first build styled it:
 * the pale "cta" pill and the mono "pill-dark", the dark answer chip and the filament progress ticks (the
 * first build's blinking live dot went on 2026-09-11 with every other status light). These live beside
 * the components that use them and nowhere else; the rest of the site uses the design system's Button,
 * Chip and primitives.
 */

export const consolePill = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full transition-[box-shadow,border-color,color] duration-200 ease-e1 disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        // Filled pills keep their text colour on hover and lift instead.
        cta: "bg-cta font-semibold text-ground hover:text-ground hover:shadow-[0_10px_26px_rgba(4,15,10,.35)]",
        "pill-dark": "hover-green-dark border border-dhair font-mono text-[11px] text-d2 hover:border-filament/50",
      },
      size: {
        sm: "h-[38px] px-4 text-[13.5px]",
        md: "h-[42px] px-5 text-[14px]",
        xl: "h-12 px-6 text-[15px]",
      },
    },
    defaultVariants: { variant: "cta", size: "md" },
  }
)

type PillVariants = VariantProps<typeof consolePill>
interface PillBase extends PillVariants {
  className?: string
  children: ReactNode
}
type PillAnchor = PillBase & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">
type PillButton = PillBase & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">

/** The console's pill: a Next `Link` for internal hrefs, an anchor otherwise, a `<button>` without one. */
export function ConsolePill(props: PillAnchor | PillButton) {
  const { variant, size, className, children } = props
  const classes = twMerge(consolePill({ variant, size }), className)
  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props
    if (href.startsWith("/") && !href.startsWith("//")) {
      return (
        <Link href={href} className={classes} {...rest}>
          {children}
        </Link>
      )
    }
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }
  const { variant: _v, size: _s, className: _c, children: _ch, type, ...rest } = props
  return (
    <button type={type ?? "button"} className={classes} {...rest}>
      {children}
    </button>
  )
}

const consoleChip = cva(
  "inline-flex items-center rounded-full border font-medium transition-all duration-200 ease-e2 disabled:cursor-default",
  {
    variants: {
      size: {
        md: "px-[15px] py-[10px] text-[13.5px]",
        lg: "px-4 py-[11px] text-[14px]",
      },
      selected: {
        true: "border-filament/55 bg-filament/12 text-filament",
        false: "border-dfull/14 bg-dfull/[5.5%] text-dfull/86 hover:border-dfull/30",
      },
    },
    defaultVariants: { size: "md", selected: false },
  }
)

interface ConsoleChipProps
  extends
    Omit<ComponentPropsWithoutRef<"button">, "className" | "children">,
    Omit<VariantProps<typeof consoleChip>, "selected"> {
  selected: boolean
  className?: string
  children: ReactNode
}

/** The dark answer chip. Exposes `aria-pressed` so screen readers hear the selection. */
export function ConsoleChip({ selected, size, className, children, type, ...rest }: ConsoleChipProps) {
  return (
    <button
      type={type ?? "button"}
      aria-pressed={selected}
      className={twMerge(consoleChip({ size, selected }), className)}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Progress ticks: `filled` bright, `current` half-lit, the rest dim. */
export function ConsoleTicks({
  total,
  filled,
  current,
  label,
}: {
  total: number
  filled: number
  current?: number
  label?: string
}) {
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={filled}
      className="flex gap-[5px]"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={twMerge(
            "ease-e1 h-[2px] w-4 rounded-full transition-[background,box-shadow] duration-500",
            i < filled
              ? "bg-filament shadow-[0_0_7px_rgba(76,226,126,.55)]"
              : i === current
                ? "bg-filament/45"
                : "bg-dfull/14"
          )}
        />
      ))}
    </span>
  )
}

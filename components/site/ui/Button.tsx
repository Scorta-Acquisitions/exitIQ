import { cva, type VariantProps } from "class-variance-authority"
import Link from "next/link"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { cn } from "@/lib/site/cn"

/**
 * The design system's button grammar. Renders a Next `Link` for internal hrefs, a plain anchor for
 * mailto/hash/external hrefs, and a `<button>` otherwise.
 *
 * - `primary`   the pill call to action: accent fill, white text, 17px body type (11 × 22 padding)
 * - `secondary` the ghost pill that sits beside a primary: accent text and 1px accent border
 * - `pearl`     the pearl capsule for card-level secondary actions (11px radius, 14px caption text)
 * - `icon`      a 44px circular control floating over imagery
 *
 * `size="nav"` shrinks a primary or secondary pill for the 44px and 52px navigation bars; `size="compact"`
 * is the 14px card-level pill that still meets the 44px touch target, and shrinks `icon` to 32px for close
 * controls inside chrome. The accent resolves per surface (deep green on light tiles, bright green on
 * dark ones), so no dark variants.
 * Pressing any button scales it to 95%; hover never changes a filled button's text colour.
 */

const buttonVariants = cva(
  "pressable inline-flex items-center justify-center whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-focus hover:text-on-primary rounded-pill",
        secondary: "border-accent text-accent hover:bg-accent/10 rounded-pill border bg-transparent",
        pearl:
          "bg-surface-pearl text-ink-muted-80 border-divider-soft hover:text-ink type-caption rounded-md border-[3px] px-[14px] py-2",
        icon: "bg-chip-translucent/64 text-ink hover:text-ink h-11 w-11 rounded-full p-0",
      },
      size: {
        md: "",
        compact: "",
        nav: "",
      },
    },
    compoundVariants: [
      { variant: ["primary", "secondary"], size: "md", class: "type-body px-[22px] py-[11px]" },
      { variant: ["primary", "secondary"], size: "compact", class: "type-caption px-4 py-3" },
      { variant: ["primary", "secondary"], size: "nav", class: "type-nav-link h-[26px] px-[11px]" },
      { variant: "icon", size: "compact", class: "h-8 w-8" },
    ],
    defaultVariants: { variant: "primary", size: "md" },
  }
)

type ButtonVariants = VariantProps<typeof buttonVariants>

interface BaseProps extends ButtonVariants {
  className?: string
  children: ReactNode
}

type AnchorProps = BaseProps & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">
type NativeProps = BaseProps & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">

export type ButtonProps = AnchorProps | NativeProps

function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//")
}

export function Button(props: ButtonProps) {
  const { variant, size, className, children } = props
  const classes = cn(buttonVariants({ variant, size }), className)
  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props
    if (isInternal(href)) {
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

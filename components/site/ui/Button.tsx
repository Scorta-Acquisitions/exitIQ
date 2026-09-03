import { cva, type VariantProps } from "class-variance-authority"
import Link from "next/link"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"

/**
 * Pill button used for every call to action. Renders a Next `Link` for internal hrefs, a plain
 * anchor for mailto/hash/external hrefs, and a `<button>` otherwise.
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full transition-[box-shadow,border-color,color] duration-200 ease-e1 disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        // Filled buttons keep their text colour on hover (hover:text-* outranks the global a:hover) and lift instead.
        brand: "bg-brand font-medium text-cta hover:text-cta hover:shadow-[0_10px_26px_rgba(12,54,38,.3)]",
        cta: "bg-cta font-semibold text-ground hover:text-ground hover:shadow-[0_10px_26px_rgba(4,15,10,.35)]",
        outline: "hover-green border border-hair-2 bg-card/50 text-ink",
        "outline-plain": "hover-green border border-hair-2 text-ink",
        "outline-dark": "hover-green-dark border border-dhair text-d1 hover:border-filament/50",
        "pill-dark": "hover-green-dark border border-dhair font-mono text-[11px] text-d2 hover:border-filament/50",
        "pill-light": "hover-green border border-hair-2 bg-card/50 font-mono text-[12px] tracking-[.4px] text-ink",
      },
      size: {
        xs: "h-8 px-3 text-[11.5px]",
        sm: "h-[38px] px-4 text-[13.5px]",
        md: "h-[42px] px-5 text-[14px]",
        lg: "h-[46px] px-[22px] text-[15px]",
        xl: "h-12 px-6 text-[15px]",
        pill: "px-[13px] py-[7px]",
      },
    },
    defaultVariants: { variant: "brand", size: "lg" },
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
  const classes = twMerge(buttonVariants({ variant, size }), className)
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

export { buttonVariants }

import Link from "next/link"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"

/** Inline text link. `tone="dark"` for links sitting on a green panel. */
export function TextLink({
  href,
  children,
  tone = "light",
  className,
  ...rest
}: {
  href: string
  children: ReactNode
  tone?: "light" | "dark"
  className?: string
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">) {
  const classes = twMerge(
    // Colour and hover come from the global link rule in styles/site.css; the tone only sets the ink.
    "pb-px",
    tone === "dark" ? "text-d1" : "text-ink",
    className
  )
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

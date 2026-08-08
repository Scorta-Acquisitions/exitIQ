import * as React from "react"

// Design tokens mirrored from LandingPage.tsx's `C` map (kept local so this
// component has no import-order dependency on the marketing page).
const CARD = "#ffffff"
const BORDER = "#e2ddd4"
const INK = "#0c0a09"
const inter = "Inter, var(--font-inter, sans-serif)"

export type YCombinatorBadgeProps = {
  className?: string
  style?: React.CSSProperties
  /** "sm" for inline placement near small copy (e.g. under an eyebrow); "md" (default) for standalone hero placement. */
  size?: "sm" | "md"
}

const SIZES = {
  sm: {
    gap: "clamp(5px, 1.3vw, 6.5px)",
    padding: "clamp(5px, 1.3vw, 6.5px) clamp(12px, 2.6vw, 14px)",
    radius: 10,
    fontSize: "clamp(14px, 2.9vw, 17px)",
  },
  md: {
    gap: "clamp(6px, 1.4vw, 8px)",
    padding: "clamp(12px, 2.4vw, 14px) clamp(14px, 4vw, 18px)",
    radius: 14,
    fontSize: "clamp(16px, 4vw, 22px)",
  },
} as const

/**
 * Compact "Backed by Y Combinator" trust badge, with the official YC
 * monogram (assets/yc-logo.svg) standing in for the "Y". Static markup —
 * wrap it in the page's own `.s-rv` reveal class if it needs to participate
 * in scroll-in motion, same as any other hero element.
 */
export function YCombinatorBadge({ className, style, size = "md" }: YCombinatorBadgeProps) {
  const s = SIZES[size]
  return (
    <div
      role="img"
      aria-label="Backed by Y Combinator"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: s.gap,
        padding: s.padding,
        borderRadius: s.radius,
        background: CARD,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 1px 2px rgba(12,10,9,.05)",
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: s.gap,
          fontFamily: inter,
          fontWeight: 500,
          fontSize: s.fontSize,
          lineHeight: 1,
          color: INK,
          letterSpacing: "-.1px",
          whiteSpace: "nowrap",
        }}
      >
        Backed by
        <svg
          width="1em"
          height="1em"
          viewBox="0 0 256 256"
          style={{ borderRadius: "22%", overflow: "hidden", flexShrink: 0 }}
        >
          <rect width="256" height="256" fill="#FB651E" />
          <path
            d="M119.373653,144.745813 L75.43296,62.4315733 L95.5144533,62.4315733 L121.36192,114.52416 C121.759575,115.452022 122.2235,116.413008 122.753707,117.407147 C123.283914,118.401285 123.747838,119.428546 124.145493,120.48896 C124.410597,120.886615 124.609422,121.251127 124.741973,121.582507 C124.874525,121.913886 125.007075,122.212123 125.139627,122.477227 C125.802386,123.802744 126.39886,125.095105 126.929067,126.354347 C127.459274,127.613589 127.923198,128.773399 128.320853,129.833813 C129.381268,127.580433 130.541078,125.1614 131.80032,122.57664 C133.059562,119.99188 134.351922,117.307747 135.67744,114.52416 L161.92256,62.4315733 L180.612267,62.4315733 L136.27392,145.739947 L136.27392,198.826667 L119.373653,198.826667 L119.373653,144.745813 Z"
            fill="#FFFFFF"
          />
        </svg>
        Combinator
      </span>
    </div>
  )
}

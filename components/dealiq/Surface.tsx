/**
 * DealIQ surface primitives.
 *
 * The framed screen itself is the `dq-screen` class (defined in
 * `DealIQScopedStyles`): every workspace surface's top-level element carries it,
 * which centers the content in a bordered glass frame with one shared margin
 * rhythm — no screen floats unanchored on the page background.
 *
 * `SurfaceCard` is the companion: interactive clusters — sliders, chip groups,
 * forms, gates — sit inside one, so controls are encased in their own bordered
 * component instead of loose in the flow.
 *
 * Server-component friendly: no state, no handlers — style only. Colors go
 * through the shared CSS-var tokens, matching the inline-style convention of
 * `components/dealiq/`.
 */

import React from "react"

/** A bordered sub-component that encases a control cluster or content group. */
export function SurfaceCard({
  children,
  tone = "raised",
  style,
}: {
  children: React.ReactNode
  /** `raised` for interactive clusters, `soft` for quiet content groups. */
  tone?: "raised" | "soft"
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        borderRadius: 13,
        border: `1px solid ${tone === "raised" ? "var(--b3)" : "var(--div)"}`,
        background: "var(--s1)",
        boxShadow: tone === "raised" ? "0 1px 3px rgba(20,15,8,.04)" : "none",
        padding: "18px 20px",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

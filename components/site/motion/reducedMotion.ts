/** Whether the visitor has asked for reduced motion; false where `matchMedia` is unavailable (the server). */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Whether the primary pointer cannot hover (a touch device), where pointer effects switch off. */
export function hoverUnavailable(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: none)").matches
}

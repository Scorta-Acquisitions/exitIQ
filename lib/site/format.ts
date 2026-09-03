/** Whole-dollar formatting: 2400000 → "$2,400,000". */
export function formatDollars(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US")
}

/** Millions with two decimals: 4.3 → "$4.30M". */
export function formatMillions(n: number): string {
  return "$" + n.toFixed(2) + "M"
}

/** Two-digit ordinal used for numbered lists: 1 → "01". */
export function padIndex(i: number): string {
  return String(i).padStart(2, "0")
}

/**
 * Capital-verification logic — pure and content-free.
 *
 * The verification surface reads a funding document entirely in the browser:
 * the file's name, size, and type are inspected and displayed, and the file is
 * never uploaded, POSTed, or stored (Execution Plan item 11). This module owns
 * the acceptance rule and the scripted check timing so both are testable
 * without a DOM and tunable without reopening the component.
 */

/** Exact MIME types accepted as a funding document. */
export const ACCEPTED_MIME_TYPES: ReadonlyArray<string> = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/rtf",
  "text/plain",
] as const

/** MIME prefixes accepted as a funding document — any image can be a scan. */
export const ACCEPTED_MIME_PREFIXES: ReadonlyArray<string> = ["image/"] as const

/** Extension fallback for browsers that report no (or a generic) MIME type. */
export const ACCEPTED_EXTENSIONS: ReadonlyArray<string> = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "heic",
  "tif",
  "tiff",
  "doc",
  "docx",
  "rtf",
  "txt",
  "pages",
] as const

/** Lowercased extension of a filename, or `null` when it has none. */
export function fileExtension(name: string): string | null {
  const dot = name.lastIndexOf(".")
  if (dot <= 0 || dot === name.length - 1) return null
  return name.slice(dot + 1).toLowerCase()
}

/**
 * Whether a file can be read as a funding document (proof-of-funds letter,
 * bank statement, SBA pre-qualification). MIME type decides when the browser
 * supplies a meaningful one; the extension decides when it is absent or the
 * generic `application/octet-stream`.
 */
export function isAcceptedFundingDocument(name: string, mimeType: string): boolean {
  const mime = mimeType.trim().toLowerCase()
  if (mime !== "" && mime !== "application/octet-stream") {
    if (ACCEPTED_MIME_TYPES.includes(mime)) return true
    if (ACCEPTED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix))) return true
  }
  const ext = fileExtension(name)
  return ext !== null && ACCEPTED_EXTENSIONS.includes(ext)
}

/** `accept` attribute for the file input, derived from the same lists the rule reads. */
export function acceptAttribute(): string {
  const extensions = ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`)
  const prefixes = ACCEPTED_MIME_PREFIXES.map((prefix) => `${prefix}*`)
  return [...extensions, ...ACCEPTED_MIME_TYPES, ...prefixes].join(",")
}

// ─────────────────────────────────────────────────────────────────────────────
// Scripted check timing — the ~2.2s verification run (Execution Plan item 11)
// ─────────────────────────────────────────────────────────────────────────────

/** Gap between one check line appearing and the next. */
export const VERIFICATION_CHECK_STEP_MS = 650

/** How long a check line spins before its check mark settles. */
export const VERIFICATION_CHECK_SETTLE_MS = 520

/** Pause after the last check settles before the badge reveals. */
export const VERIFICATION_TAIL_MS = 350

/** Total scripted duration for a run of `lineCount` check lines. */
export function verificationRunMs(lineCount: number): number {
  if (lineCount <= 0) return 0
  return (lineCount - 1) * VERIFICATION_CHECK_STEP_MS + VERIFICATION_CHECK_SETTLE_MS + VERIFICATION_TAIL_MS
}

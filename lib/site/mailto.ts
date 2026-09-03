/**
 * Every form on the site resolves to an email the visitor sends from their own client. These
 * helpers build the mailto link, copy the body as a fallback, and never throw in the browser.
 */

export function mailtoHref(to: string, subject: string, body: string, maxBodyLength = 1500): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.slice(0, maxBodyLength))}`
}

/** Best-effort clipboard write. Resolves to true when the text was copied. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard) return false
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Navigate the current window to a mailto link (opens the visitor's email client). */
export function openMail(href: string): void {
  if (typeof window === "undefined") return
  window.location.href = href
}

/** Open a URL in a new tab without handing it a window reference. */
export function openInNewTab(url: string): void {
  if (typeof window === "undefined") return
  window.open(url, "_blank", "noopener")
}

/** Trigger a text-file download in the browser. Returns false when the DOM APIs are unavailable. */
export function downloadTextFile(filename: string, text: string): boolean {
  try {
    if (typeof document === "undefined" || typeof URL.createObjectURL !== "function") return false
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }))
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    return true
  } catch {
    return false
  }
}

export interface OfferIntakeFields {
  mode: "forward" | "paste" | "verbal"
  text: string
  price: string
  structure: string
  later: string
  financing: string
  next: string
  concern: string
  email: string
}

export const EMPTY_OFFER_INTAKE: OfferIntakeFields = {
  mode: "forward",
  text: "",
  price: "",
  structure: "",
  later: "",
  financing: "",
  next: "",
  concern: "",
  email: "",
}

const OFFER_ASK =
  "Please explain what I would receive, what is missing, and which terms deserve attention before I respond."

export function offerReviewBody(f: OfferIntakeFields): string {
  let body: string
  if (f.mode === "paste") {
    body = "I received the following terms for my business:\n\n" + f.text + "\n\n" + OFFER_ASK
  } else {
    body =
      "I received a verbal offer with these terms:\nHeadline price: " +
      f.price +
      "\nCash at close and later payments: " +
      f.structure +
      (f.later ? " · Paid later: " + f.later : "") +
      "\nFinancing status: " +
      f.financing +
      "\nWhat the buyer requested next: " +
      f.next +
      (f.concern ? "\nOther concerns: " + f.concern : "") +
      "\n\n" +
      OFFER_ASK
  }
  if (f.email) body += "\n\nEmail for your review: " + f.email
  body += "\n\nSent from the Heirloom Offer Review page."
  return body
}

export const OFFER_FORWARD_MAILTO = mailtoHref(
  "offers@heirloom.com",
  "Free Offer Review",
  "I received an offer or indication of interest for my business. The original message or document is attached.\n\nPlease explain what I would receive, what is missing, and which terms deserve attention before I respond.\n\nSent from the Heirloom Offer Review page."
)

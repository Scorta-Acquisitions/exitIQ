import { afterEach, describe, expect, it, vi } from "vitest"
import {
  copyText,
  downloadTextFile,
  EMPTY_OFFER_INTAKE,
  mailtoHref,
  OFFER_FORWARD_MAILTO,
  offerReviewBody,
  openInNewTab,
  openMail,
} from "@/lib/site/mailto"

const OFFER_ASK =
  "Please explain what I would receive, what is missing, and which terms deserve attention before I respond."
const FOOTER = "\n\nSent from the Heirloom Offer Review page."

function decodeBody(href: string): string {
  const params = new URLSearchParams(href.slice(href.indexOf("?") + 1))
  return params.get("body") ?? ""
}

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, "clipboard", { value, configurable: true, writable: true })
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(navigator, "clipboard")
  Reflect.deleteProperty(URL, "createObjectURL")
})

describe("mailtoHref", () => {
  it("builds a mailto link with the recipient, an encoded subject, and an encoded body", () => {
    expect(mailtoHref("hello@heirloom.com", "A subject", "Line one")).toBe(
      "mailto:hello@heirloom.com?subject=A%20subject&body=Line%20one"
    )
  })

  it("truncates the body to 1500 characters by default", () => {
    const href = mailtoHref("a@b.com", "s", "x".repeat(2000))
    expect(decodeBody(href)).toHaveLength(1500)
  })

  it("keeps a body exactly at the limit intact and cuts one character beyond it", () => {
    expect(decodeBody(mailtoHref("a@b.com", "s", "y".repeat(10), 10))).toBe("y".repeat(10))
    expect(decodeBody(mailtoHref("a@b.com", "s", "y".repeat(11), 10))).toBe("y".repeat(10))
  })

  it("encodes newlines, ampersands, and question marks so they cannot split the query string", () => {
    const href = mailtoHref("a@b.com", "Q&A?", "one\ntwo & three?")
    expect(href).toBe("mailto:a@b.com?subject=Q%26A%3F&body=one%0Atwo%20%26%20three%3F")
    expect(decodeBody(href)).toBe("one\ntwo & three?")
  })

  it("encodes non-ASCII text as UTF-8 percent escapes and round-trips it", () => {
    const href = mailtoHref("a@b.com", "s", "Heirloom’s café")
    expect(href).toBe("mailto:a@b.com?subject=s&body=Heirloom%E2%80%99s%20caf%C3%A9")
    expect(decodeBody(href)).toBe("Heirloom’s café")
  })

  it("produces an empty body parameter for an empty body", () => {
    expect(mailtoHref("a@b.com", "s", "")).toBe("mailto:a@b.com?subject=s&body=")
  })
})

describe("copyText", () => {
  it("writes the text to the clipboard and resolves true when the write succeeds", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard({ writeText })
    await expect(copyText("copy me")).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText).toHaveBeenCalledWith("copy me")
  })

  it("resolves false instead of throwing when the clipboard write rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"))
    setClipboard({ writeText })
    await expect(copyText("copy me")).resolves.toBe(false)
    expect(writeText).toHaveBeenCalledWith("copy me")
  })

  it("resolves false when the browser exposes no clipboard API", async () => {
    setClipboard(undefined)
    await expect(copyText("copy me")).resolves.toBe(false)
  })
})

describe("openMail", () => {
  it("navigates the current window to the mailto link", () => {
    const location = { href: "http://localhost/" }
    vi.stubGlobal("location", location)
    openMail("mailto:hello@heirloom.com?subject=Hi")
    expect(location.href).toBe("mailto:hello@heirloom.com?subject=Hi")
  })

  it("does not throw when called without a window (server render)", () => {
    // `window` is unforgeable in jsdom, so the guard is exercised by stubbing the global to undefined.
    vi.stubGlobal("window", undefined)
    expect(() => openMail("mailto:hello@heirloom.com")).not.toThrow()
  })
})

describe("openInNewTab", () => {
  it("opens the url in a blank tab without a window reference", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null)
    openInNewTab("https://heirloom.cal.com/suyash")
    expect(open).toHaveBeenCalledTimes(1)
    expect(open).toHaveBeenCalledWith("https://heirloom.cal.com/suyash", "_blank", "noopener")
  })

  it("does not throw when called without a window (server render)", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null)
    vi.stubGlobal("window", undefined)
    expect(() => openInNewTab("https://example.com")).not.toThrow()
    expect(open).not.toHaveBeenCalled()
  })
})

describe("downloadTextFile", () => {
  it("returns false when URL.createObjectURL is not available", () => {
    expect(typeof URL.createObjectURL).not.toBe("function")
    expect(downloadTextFile("plan.txt", "text")).toBe(false)
  })

  it("creates a temporary anchor named after the file, clicks it, removes it, and returns true", () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:heirloom/plan")
    Object.defineProperty(URL, "createObjectURL", { value: createObjectURL, configurable: true, writable: true })
    const anchors: HTMLAnchorElement[] = []
    const realCreate = document.createElement.bind(document)
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = realCreate(tag)
      if (tag === "a") anchors.push(el as HTMLAnchorElement)
      return el
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})

    expect(downloadTextFile("exitiq-plan.txt", "90-day plan")).toBe(true)

    expect(anchors).toHaveLength(1)
    const a = anchors[0]!
    expect(a.download).toBe("exitiq-plan.txt")
    expect(a.href).toBe("blob:heirloom/plan")
    expect(click).toHaveBeenCalledTimes(1)
    expect(document.body.contains(a)).toBe(false)
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe("text/plain")
    expect(blob.size).toBe("90-day plan".length)
  })

  it("returns false instead of throwing when the download click fails", () => {
    Object.defineProperty(URL, "createObjectURL", { value: () => "blob:x", configurable: true, writable: true })
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
      throw new Error("blocked")
    })
    expect(downloadTextFile("plan.txt", "text")).toBe(false)
  })
})

describe("offerReviewBody", () => {
  const verbal = {
    ...EMPTY_OFFER_INTAKE,
    mode: "verbal" as const,
    price: "$4.5M",
    structure: "$3M at closing",
    financing: "SBA pre-approval",
    next: "Sign an LOI by Friday",
  }

  it("writes the pasted-terms body with the pasted text between the intro and the ask", () => {
    expect(offerReviewBody({ ...EMPTY_OFFER_INTAKE, mode: "paste", text: "LOI: $4.65M cash" })).toBe(
      "I received the following terms for my business:\n\nLOI: $4.65M cash\n\n" + OFFER_ASK + FOOTER
    )
  })

  it("writes the verbal body with only the required lines when the optional fields are empty", () => {
    expect(offerReviewBody(verbal)).toBe(
      "I received a verbal offer with these terms:\n" +
        "Headline price: $4.5M\n" +
        "Cash at close and later payments: $3M at closing\n" +
        "Financing status: SBA pre-approval\n" +
        "What the buyer requested next: Sign an LOI by Friday\n\n" +
        OFFER_ASK +
        FOOTER
    )
  })

  it("appends the paid-later amount to the structure line when it is given", () => {
    const body = offerReviewBody({ ...verbal, later: "$1M over 3 years" })
    expect(body).toContain("Cash at close and later payments: $3M at closing · Paid later: $1M over 3 years\n")
    expect(body).not.toContain("Other concerns")
    expect(body).not.toContain("Email for your review")
  })

  it("adds an 'Other concerns' line after the buyer request when a concern is given", () => {
    const body = offerReviewBody({ ...verbal, concern: "The buyer wants 90 days exclusivity" })
    expect(body).toContain(
      "What the buyer requested next: Sign an LOI by Friday\nOther concerns: The buyer wants 90 days exclusivity\n\n"
    )
  })

  it("adds the reply email between the ask and the footer for any mode", () => {
    const pasted = offerReviewBody({ ...EMPTY_OFFER_INTAKE, mode: "paste", text: "t", email: "me@x.com" })
    expect(pasted.endsWith(OFFER_ASK + "\n\nEmail for your review: me@x.com" + FOOTER)).toBe(true)
    const spoken = offerReviewBody({ ...verbal, email: "me@x.com" })
    expect(spoken.endsWith(OFFER_ASK + "\n\nEmail for your review: me@x.com" + FOOTER)).toBe(true)
  })

  it("writes every optional line in the documented order when all are present", () => {
    expect(offerReviewBody({ ...verbal, later: "$1M", concern: "Exclusivity", email: "me@x.com" })).toBe(
      "I received a verbal offer with these terms:\n" +
        "Headline price: $4.5M\n" +
        "Cash at close and later payments: $3M at closing · Paid later: $1M\n" +
        "Financing status: SBA pre-approval\n" +
        "What the buyer requested next: Sign an LOI by Friday\n" +
        "Other concerns: Exclusivity\n\n" +
        OFFER_ASK +
        "\n\nEmail for your review: me@x.com" +
        FOOTER
    )
  })

  it("treats the forward mode like a verbal offer (the form never sends it, but the template stays valid)", () => {
    expect(offerReviewBody(EMPTY_OFFER_INTAKE)).toBe(
      "I received a verbal offer with these terms:\n" +
        "Headline price: \n" +
        "Cash at close and later payments: \n" +
        "Financing status: \n" +
        "What the buyer requested next: \n\n" +
        OFFER_ASK +
        FOOTER
    )
  })
})

describe("OFFER_FORWARD_MAILTO", () => {
  it("addresses offers@heirloom.com with the Free offer review subject", () => {
    expect(OFFER_FORWARD_MAILTO.startsWith("mailto:offers@heirloom.com?subject=Free%20offer%20review&body=")).toBe(true)
  })

  it("carries the attachment note, the standard ask, and the page footer in the body", () => {
    expect(decodeBody(OFFER_FORWARD_MAILTO)).toBe(
      "I received an offer or indication of interest for my business. The original message or document is attached.\n\n" +
        OFFER_ASK +
        FOOTER
    )
  })
})

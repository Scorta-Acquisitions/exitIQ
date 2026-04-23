"use client"

import { useState } from "react"

const FAQS = [
  {
    q: "How is Scorta different from a traditional business broker?",
    a: "Traditional brokers charge 8–12% of the sale price and act as gatekeepers to deals. Scorta replaces that with AI-guided workflows — valuation, due diligence, listing, deal structuring, and closing — for a flat fee. You keep the commission.",
  },
  {
    q: "What is Exit IQ?",
    a: "Exit IQ is Scorta's AI-powered exit analysis tool. Answer a few questions about your business, and Exit IQ generates a valuation range, deal readiness score, risk flags, and growth opportunities — in seconds, for free.",
  },
  {
    q: "What size businesses does Scorta serve?",
    a: "Scorta focuses on Main Street and lower-middle-market businesses — typically $100K to $10M in asking price. This is the segment most underserved by traditional M&A infrastructure.",
  },
  {
    q: "Is my business information kept confidential?",
    a: "Yes. Your business details are never shared publicly without your permission. NDA management is built into the platform, and you control who sees what and when.",
  },
  {
    q: "Do I need a lawyer or accountant to use Scorta?",
    a: "Scorta does not replace legal or accounting professionals — and for a deal of this size, you should have both. What Scorta replaces is the broker: the deal originator, marketing agent, and negotiation intermediary.",
  },
  {
    q: "How long does it typically take to close a deal?",
    a: "Market average for Main Street businesses is 6–12 months. Scorta's AI tools — automated due diligence, structured data rooms, templated deal documents — can meaningfully compress that timeline.",
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" style={{ background: "#faf9f7", padding: "96px 32px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#9f9b93",
            marginBottom: "12px",
          }}
        >
          FAQ
        </div>
        <h2
          style={{
            fontSize: "44px",
            fontWeight: 700,
            letterSpacing: "-1.5px",
            lineHeight: 1.05,
            marginBottom: "48px",
          }}
        >
          Frequently asked questions
        </h2>
        <div>
          {FAQS.map((f, i) => (
            <div key={i} style={{ borderBottom: "1px solid #dad4c8" }}>
              <button
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  padding: "20px 0",
                  fontFamily: "inherit",
                  fontSize: "17px",
                  fontWeight: 500,
                  color: "#000",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                {f.q}
                <span
                  style={{
                    fontSize: "20px",
                    color: "#9f9b93",
                    flexShrink: 0,
                    transform: open === i ? "rotate(45deg)" : "",
                    transition: "transform 250ms",
                    display: "inline-block",
                  }}
                >
                  +
                </span>
              </button>
              <div
                className="faq-answer"
                style={{ maxHeight: open === i ? "200px" : "0", paddingBottom: open === i ? "16px" : "0" }}
              >
                {f.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

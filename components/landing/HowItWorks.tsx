const STEPS = [
  {
    num: "01",
    title: "Get your Exit IQ score",
    body: "Answer a few questions. Our AI analyzes your business in seconds — valuation range, deal readiness, risk flags, and growth opportunities. No broker, no pitch deck.",
    color: "#02492a",
    textColor: "#84e7a5",
  },
  {
    num: "02",
    title: "List or browse deals",
    body: "Sellers get an AI-prepared listing with verified financials. Buyers browse deals with AI-generated due diligence summaries and real-time alerts.",
    color: "#43089f",
    textColor: "#c1b0ff",
  },
  {
    num: "03",
    title: "Close — without the middleman",
    body: "AI-guided deal structuring, NDA management, data room, and closing coordination. Scorta charges a flat fee — not 10% of your life's work.",
    color: "#fbbd41",
    textColor: "#9d6a09",
  },
]

export function HowItWorks() {
  return (
    <section id="how" style={{ background: "#faf9f7", padding: "96px 32px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "56px" }}>
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
            How it works
          </div>
          <h2
            style={{
              fontSize: "44px",
              fontWeight: 700,
              letterSpacing: "-1.5px",
              lineHeight: 1.05,
              maxWidth: "520px",
            }}
          >
            From listing to close.
            <br />
            <span style={{ color: "#9f9b93", fontWeight: 400 }}>Skip the broker.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {STEPS.map((s, i) => (
            <div
              key={i}
              style={{
                background: s.color,
                borderRadius: "24px",
                padding: "32px",
                position: "relative",
                overflow: "hidden",
                transition: "transform 200ms ease, box-shadow 200ms ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "rgb(0,0,0) -6px 6px"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ""
                e.currentTarget.style.boxShadow = ""
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  fontFamily: "var(--font-space-mono, 'Space Mono'), monospace",
                  color: s.textColor,
                  opacity: 0.25,
                  lineHeight: 1,
                  marginBottom: "24px",
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  color: "#fff",
                  marginBottom: "12px",
                  lineHeight: 1.2,
                }}
              >
                {s.title}
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.65, color: s.textColor, opacity: 0.85 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SavingsStrip() {
  return (
    <section style={{ background: "#fbbd41", padding: "80px 32px" }}>
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "48px",
          alignItems: "center",
        }}
      >
        <div style={{ gridColumn: "1 / 3" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#9d6a09",
              marginBottom: "12px",
            }}
          >
            The real cost of a traditional broker
          </div>
          <h2
            style={{
              fontSize: "44px",
              fontWeight: 700,
              letterSpacing: "-1.5px",
              lineHeight: 1.05,
              marginBottom: "16px",
              color: "#000",
            }}
          >
            Buyers pay less.
            <br />
            Sellers keep more.
          </h2>
          <p style={{ fontSize: "16px", lineHeight: 1.65, color: "#9d6a09" }}>
            Traditional brokers charge 8–12% of the sale price — $40K–$120K on a typical Main Street deal. Scorta
            charges a flat fee. The rest stays where it belongs: with you.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { label: "Broker commission on $1M sale", val: "$100,000", sub: "Traditional model" },
            {
              label: "Scorta flat fee",
              val: "Fixed",
              sub: "Not a percentage of your life's work",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: i === 0 ? "rgba(0,0,0,0.08)" : "#02492a",
                borderRadius: "14px",
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  color: i === 0 ? "#9d6a09" : "#84e7a5",
                  marginBottom: "6px",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  fontFamily: "var(--font-space-mono, 'Space Mono'), monospace",
                  letterSpacing: "-1px",
                  color: i === 0 ? "#000" : "#fff",
                }}
              >
                {s.val}
              </div>
              <div
                style={{ fontSize: "12px", color: i === 0 ? "#9d6a09" : "rgba(255,255,255,0.55)", marginTop: "3px" }}
              >
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TrustStrip() {
  return (
    <div style={{ background: "#faf9f7", borderBottom: "1px solid #dad4c8", padding: "18px 32px" }}>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#9f9b93",
          }}
        >
          Trusted by owners across
        </span>
        {["Austin, TX", "Nashville, TN", "Denver, CO", "Seattle, WA", "Phoenix, AZ", "Portland, OR"].map((city) => (
          <span key={city} style={{ fontSize: "13px", fontWeight: 500, color: "#55534e" }}>
            {city}
          </span>
        ))}
      </div>
    </div>
  )
}

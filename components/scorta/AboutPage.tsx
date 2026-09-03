// use client: sticky nav scroll state, scroll-reveal observer, count-up on scroll
"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { ExitIQApp } from "@/components/exitiq/ExitIQApp"

// ─── Design tokens (mirrors LandingPage.tsx) ──────────────────────────────────
const C = {
  canvas: "#f5f5f5",
  canvasSoft: "#fafafa",
  card: "#ffffff",
  ink: "#0c0a09",
  ink2: "#292524",
  body: "#4e4e4e",
  muted: "#777169",
  mutedSoft: "#a8a29e",
  hairline: "#e7e5e4",
  hairlineStrong: "#d6d3d1",
  mint: "#a7e5d3",
  mintDeep: "#1a7a60",
  peach: "#f4c5a8",
  lav: "#c8b8e0",
  sky: "#a8c8e8",
  dark: "#0c0a09",
  onDark: "rgba(245,245,245,.95)",
  onDarkBody: "rgba(245,245,245,.55)",
  onDarkMuted: "rgba(245,245,245,.45)",
}

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"

// ─── Shared CSS ───────────────────────────────────────────────────────────────
const ABOUT_CSS = `
  .a-rv { opacity: 0; transform: translateY(22px); transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); }
  .a-rv.a-in { opacity: 1; transform: translateY(0); }
  .a-d1 { transition-delay: .08s; }
  .a-d2 { transition-delay: .16s; }
  .a-d3 { transition-delay: .24s; }
  .a-d4 { transition-delay: .32s; }

  .a-ch  { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s, border-color .35s; will-change: transform; }
  .a-ch:hover  { transform: translateY(-4px); box-shadow: 0 18px 48px rgba(12,10,9,.08), 0 4px 14px rgba(12,10,9,.04); border-color: #d6d3d1 !important; }
  .a-chd { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s; will-change: transform; }
  .a-chd:hover { transform: translateY(-4px); box-shadow: 0 24px 60px rgba(0,0,0,.45), 0 0 40px rgba(167,229,211,.12); }

  @keyframes aOrbBreathe  { 0%,100%{transform:scale(1);opacity:.85} 50%{transform:scale(1.07);opacity:1} }
  @keyframes aOrbGlow     { 0%,100%{box-shadow:0 0 40px 12px rgba(167,229,211,.18),0 0 80px 30px rgba(200,184,224,.1)} 50%{box-shadow:0 0 60px 22px rgba(167,229,211,.32),0 0 120px 50px rgba(200,184,224,.18)} }
  @keyframes aOrbFloat1   { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-12px,-22px) scale(1.05)} 66%{transform:translate(10px,12px) scale(.96)} }
  @keyframes aOrbFloat2   { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-18px) scale(1.04)} }
  @keyframes aOrbFloat3   { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-16px,18px)} }
  @keyframes aFadeIn      { from{opacity:0} to{opacity:1} }
  @keyframes aSlideUp     { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
`

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    setMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [breakpoint])
  return mobile
}

function useReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll(".a-rv")
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("a-in")
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useInView(threshold = 0.3) {
  const ref = React.useRef<HTMLElement>(null)
  const [seen, setSeen] = React.useState(false)
  React.useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (e?.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold }
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [threshold])
  return { ref, seen }
}

function useCountUp(target: number, duration = 1800, active = true) {
  const [val, setVal] = React.useState(0)
  React.useEffect(() => {
    if (!active) return
    setVal(0)
    let raf: number
    let start: number | undefined
    const step = (ts: number) => {
      if (!start) start = ts
      const t = Math.min(1, (ts - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, active])
  return val
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const eyebrow = (dark = false): React.CSSProperties => ({
  fontFamily: inter,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: ".96px",
  textTransform: "uppercase" as const,
  color: dark ? "rgba(167,229,211,.85)" : C.muted,
})

const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 44,
  padding: "0 22px",
  borderRadius: 9999,
  border: "none",
  cursor: "pointer",
  background: C.ink2,
  color: "#fff",
  fontFamily: inter,
  fontSize: 15,
  fontWeight: 500,
  textDecoration: "none",
  transition: "background .18s",
}

const btnLight: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 52,
  padding: "0 28px",
  borderRadius: 9999,
  border: "none",
  cursor: "pointer",
  background: "rgba(245,245,245,.95)",
  color: C.ink,
  fontFamily: inter,
  fontSize: 16,
  fontWeight: 500,
  transition: "transform .18s, box-shadow .18s",
}

// ─── ExitIQ Overlay ───────────────────────────────────────────────────────────
function ExitIQOverlay({ onClose }: { onClose: () => void }) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "aFadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1160,
          height: "90vh",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,245,245,0.08)",
          animation: "aSlideUp 0.35s cubic-bezier(0.34,1.15,0.64,1)",
        }}
      >
        <ExitIQApp onClose={onClose} />
      </div>
    </div>
  )
}

// ─── Announcement Bar ─────────────────────────────────────────────────────────
function AAnnouncementBar({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      style={{
        background: "linear-gradient(90deg, rgba(167,229,211,.18) 0%, rgba(200,184,224,.14) 50%, rgba(168,200,232,.14) 100%)",
        borderBottom: `1px solid rgba(167,229,211,.35)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "0 16px",
        height: 37,
        position: "relative",
      }}
    >
      <span style={{ fontFamily: inter, fontSize: 12.5, fontWeight: 500, color: C.ink2, letterSpacing: ".01em" }}>
        ✦ ExitIQ is free to use — no broker call required
      </span>
      <Link
        href="/"
        style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, color: C.mintDeep, textDecoration: "none", letterSpacing: ".01em" }}
      >
        Try it →
      </Link>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.mutedSoft, lineHeight: 1, padding: 4, fontSize: 16 }}
      >
        ×
      </button>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function ANav({ onOpen, announcementVisible, barWrapRef, onDismissAnnouncement }: {
  onOpen: () => void
  announcementVisible: boolean
  barWrapRef: React.RefObject<HTMLDivElement | null>
  onDismissAnnouncement: () => void
}) {
  const [scrolled, setScrolled] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const isMobile = useIsMobile()

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll)
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  const links = [
    { l: "How it works", href: "/#how" },
    { l: "Products", href: "/#products" },
    { l: "About", href: "/about" },
  ]

  const navBg = scrolled || menuOpen ? "rgba(245,245,245,.95)" : "transparent"
  const navBorder = scrolled || menuOpen ? `1px solid ${C.hairline}` : "1px solid transparent"

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
      {announcementVisible && (
        <div ref={barWrapRef} style={{ overflow: "hidden" }}>
          <AAnnouncementBar onDismiss={onDismissAnnouncement} />
        </div>
      )}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          height: 64,
          padding: "0 24px",
          background: navBg,
          borderBottom: navBorder,
          backdropFilter: scrolled || menuOpen ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled || menuOpen ? "blur(14px)" : "none",
          transition: "background .25s, border-color .25s",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 36 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #a7e5d3 0%, #c8b8e0 55%, #0c0a09 100%)",
              boxShadow: "0 0 12px rgba(167,229,211,.4)",
              flexShrink: 0,
            }}
          />
          <Link
            href="/"
            style={{
              fontFamily: garamond,
              fontSize: 22,
              fontWeight: 400,
              color: C.ink,
              letterSpacing: "-.4px",
              textDecoration: "none",
            }}
          >
            Scorta
          </Link>
        </div>

        {/* Links — hidden on mobile */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 26, flex: 1 }}>
            {links.map(({ l, href }) => (
              <Link
                key={l}
                href={href}
                style={{
                  fontFamily: inter,
                  fontSize: 14,
                  fontWeight: 500,
                  color: l === "About" ? C.ink : C.body,
                  opacity: l === "About" ? 1 : 0.85,
                  textDecoration: "none",
                  transition: "opacity .15s",
                }}
              >
                {l}
              </Link>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginLeft: "auto" }}>
          <button onClick={onOpen} style={{ ...btnPrimary, height: 38, fontSize: 14 }}>
            Try ExitIQ
          </button>
          {/* Hamburger — mobile only */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
                width: 38,
                height: 38,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                flexShrink: 0,
              }}
            >
              <span style={{ display: "block", width: 20, height: 1.5, background: C.ink, borderRadius: 2, transition: "transform .22s ease, opacity .22s ease", transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none" }} />
              <span style={{ display: "block", width: 20, height: 1.5, background: C.ink, borderRadius: 2, transition: "opacity .22s ease", opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 20, height: 1.5, background: C.ink, borderRadius: 2, transition: "transform .22s ease, opacity .22s ease", transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(245,245,245,.97)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: `1px solid ${C.hairline}`,
            overflow: "hidden",
            maxHeight: menuOpen ? 320 : 0,
            transition: "max-height .3s cubic-bezier(.4,0,.2,1)",
            zIndex: 99,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", padding: "8px 0 16px" }}>
            {links.map(({ l, href }) => (
              <Link
                key={l}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: inter,
                  fontSize: 16,
                  fontWeight: 500,
                  color: C.ink,
                  textDecoration: "none",
                  padding: "12px 24px",
                }}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function AHero() {
  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "120px 24px 72px" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            width: 540,
            height: 540,
            top: -160,
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 40%, rgba(167,229,211,.45) 0%, rgba(200,184,224,.28) 45%, transparent 72%)",
            filter: "blur(40px)",
            animation: "aOrbFloat1 14s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 320,
            height: 320,
            top: "20%",
            left: "-2%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,197,168,.36) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "aOrbFloat2 18s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            top: "12%",
            right: "-2%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,200,232,.4) 0%, transparent 70%)",
            filter: "blur(36px)",
            animation: "aOrbFloat3 16s ease-in-out infinite",
          }}
        />
      </div>

      <div
        className="a-rv"
        style={{ position: "relative", textAlign: "center", maxWidth: 880, margin: "0 auto" }}
      >
        <div style={{ ...eyebrow(), marginBottom: 18 }}>About Scorta</div>
        <h1
          style={{
            fontFamily: garamond,
            fontSize: "clamp(44px, 7vw, 84px)",
            fontWeight: 300,
            lineHeight: 1.04,
            letterSpacing: "-1.92px",
            color: C.ink,
            margin: "0 0 24px",
          }}
        >
          Main Street is for sale.
          <br />
          <em style={{ fontStyle: "italic" }}>The infrastructure isn&apos;t.</em>
        </h1>
        <p
          style={{
            fontFamily: inter,
            fontSize: 19,
            lineHeight: 1.55,
            color: C.body,
            maxWidth: 640,
            margin: "0 auto",
            letterSpacing: ".16px",
          }}
        >
          Scorta is rebuilding the broker — for the millions of Main Street businesses whose owners are ready to
          retire, and whose books were never built to be sold.
        </p>
      </div>
    </section>
  )
}

// ─── Numbers ──────────────────────────────────────────────────────────────────
function Counter({ to, suf, seen }: { to: number; suf: string; seen: boolean }) {
  const val = useCountUp(to, 1800, seen)
  const fmt = to >= 1000 ? val.toLocaleString() : val.toString()
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {fmt}
      {suf}
    </span>
  )
}

function ANumbers() {
  const { ref, seen } = useInView(0.3)
  const stats = [
    {
      v: 2900000,
      suf: "+",
      l: "Main Street businesses for sale this decade",
      sub: "as boomer owners retire",
      highlight: false,
    },
    { v: 75, suf: "%", l: "of small business listings never close", sub: "industry data, all bands", highlight: false },
    {
      v: 8,
      suf: "–12%",
      l: "commission a traditional broker keeps",
      sub: "on a single transaction",
      highlight: false,
    },
    { v: 0, suf: "%", l: "commission Scorta charges", sub: "flat success fee instead", highlight: true },
  ]

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{ background: C.dark, color: C.onDark, padding: "96px 24px", position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            top: "-30%",
            right: "-10%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,229,211,.16) 0%, transparent 65%)",
            filter: "blur(60px)",
            animation: "aOrbFloat2 22s ease-in-out infinite",
          }}
        />
      </div>
      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
        <div className="a-rv" style={{ maxWidth: 720, margin: "0 auto 56px", textAlign: "center" }}>
          <div style={{ ...eyebrow(true), marginBottom: 16 }}>The opportunity</div>
          <h2
            style={{
              fontFamily: garamond,
              fontSize: "clamp(34px, 4.5vw, 56px)",
              fontWeight: 300,
              letterSpacing: "-1.2px",
              lineHeight: 1.06,
              color: C.onDark,
              margin: 0,
            }}
          >
            The biggest unbroked market in America.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {stats.map((s, i) => (
            <div
              key={i}
              className={`a-rv a-chd a-d${i + 1}`}
              style={{
                padding: 28,
                borderRadius: 20,
                background: s.highlight ? "rgba(167,229,211,.08)" : "rgba(245,245,245,.04)",
                border: "1px solid " + (s.highlight ? "rgba(167,229,211,.3)" : "rgba(245,245,245,.1)"),
              }}
            >
              <div
                style={{
                  fontFamily: garamond,
                  fontWeight: 300,
                  lineHeight: 1,
                  letterSpacing: "-1.5px",
                  fontSize: "clamp(44px, 5vw, 60px)",
                  color: s.highlight ? C.mint : C.onDark,
                }}
              >
                <Counter to={s.v} suf={s.suf} seen={seen} />
              </div>
              <div style={{ fontFamily: inter, fontSize: 14, color: "rgba(245,245,245,.85)", marginTop: 14, lineHeight: 1.4 }}>
                {s.l}
              </div>
              <div style={{ fontFamily: inter, fontSize: 12, color: "rgba(245,245,245,.4)", marginTop: 6 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Mission / Beliefs ────────────────────────────────────────────────────────
function AMission() {
  const beliefs = [
    {
      t: "Owners deserve clarity before they list.",
      d: "Most owners discover their business is unsellable only after burning months. We fix that on day one.",
      grad: "radial-gradient(circle at 35% 35%, #a7e5d3 0%, #c8b8e0 60%, transparent 90%)",
    },
    {
      t: "AI does the work the broker should have.",
      d: "Document organization, buyer qualification, lender pre-screen, diligence. Software where it scales, humans where it counts.",
      grad: "radial-gradient(circle at 35% 35%, #f4c5a8 0%, #e8b8c4 60%, transparent 90%)",
    },
    {
      t: "Transparent process or no process.",
      d: "Every action is logged, reviewable, and approved by a human before it touches a buyer.",
      grad: "radial-gradient(circle at 35% 35%, #a8c8e8 0%, #c8b8e0 60%, transparent 90%)",
    },
  ]

  return (
    <section style={{ padding: "96px 24px", background: C.canvas }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="a-rv" style={{ maxWidth: 760, margin: "0 auto 56px", textAlign: "center" }}>
          <div style={{ ...eyebrow(), marginBottom: 16 }}>What we believe</div>
          <h2
            style={{
              fontFamily: garamond,
              fontSize: "clamp(34px, 4.5vw, 56px)",
              fontWeight: 300,
              letterSpacing: "-1.2px",
              lineHeight: 1.06,
              color: C.ink,
              margin: 0,
            }}
          >
            Selling a business should be <em style={{ fontStyle: "italic" }}>knowable.</em>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {beliefs.map((b, i) => (
            <div
              key={i}
              className={`a-rv a-ch a-d${i + 1}`}
              style={{
                background: C.card,
                border: `1px solid ${C.hairline}`,
                borderRadius: 20,
                padding: 28,
                minHeight: 240,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: b.grad,
                  animation: "aOrbBreathe 4s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 22,
                  fontWeight: 300,
                  color: C.ink,
                  letterSpacing: "-.3px",
                  lineHeight: 1.2,
                }}
              >
                {b.t}
              </div>
              <div style={{ fontFamily: inter, fontSize: 14.5, color: C.body, lineHeight: 1.6 }}>{b.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function ATimeline() {
  const events = [
    {
      y: "2024–2025",
      t: "The thesis",
      d: "Suyash spends two years running a PE firm acquiring Main Street businesses. Deal after deal falls apart in diligence — not because the businesses weren't good, but because sellers were never told what buyers actually need to see. The problem becomes obvious.",
    },
    {
      y: "Late 2025",
      t: "Building",
      d: "The assessment framework takes shape. Four readiness dimensions mapped to how buyers actually grade businesses: financial clarity, owner dependency, operational documentation, and SBA financability. Puneet engineers the AI layer.",
    },
    {
      y: "March 2026",
      t: "ExitIQ launches",
      d: "Scorta ships publicly. Free, no login, three minutes. Every Main Street owner finally has access to an honest read on what their business is worth and what's in the way of a clean sale.",
    },
    {
      y: "Now",
      t: "Active deals",
      d: "Concierge-style transactions running on Scorta's AI workflow + human approval stack. The transaction infrastructure is being written one deal at a time.",
    },
  ]

  return (
    <section
      style={{
        padding: "96px 24px",
        background: C.canvasSoft,
        borderTop: `1px solid ${C.hairline}`,
        borderBottom: `1px solid ${C.hairline}`,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="a-rv" style={{ maxWidth: 720, margin: "0 auto 56px", textAlign: "center" }}>
          <div style={{ ...eyebrow(), marginBottom: 16 }}>The story so far</div>
          <h2
            style={{
              fontFamily: garamond,
              fontSize: "clamp(32px, 4.2vw, 52px)",
              fontWeight: 300,
              letterSpacing: "-1.2px",
              lineHeight: 1.06,
              color: C.ink,
              margin: 0,
            }}
          >
            From spreadsheet to <em style={{ fontStyle: "italic" }}>transaction layer.</em>
          </h2>
        </div>
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", paddingLeft: 40 }}>
          <div
            style={{
              position: "absolute",
              left: 14,
              top: 6,
              bottom: 6,
              width: 1,
              background: `linear-gradient(to bottom, transparent, ${C.hairlineStrong} 12%, ${C.hairlineStrong} 88%, transparent)`,
            }}
          />
          {events.map((e, i) => (
            <div
              key={i}
              className={`a-rv a-d${Math.min(i + 1, 4)}`}
              style={{ position: "relative", paddingBottom: 36 }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -32,
                  top: 4,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, #a7e5d3 0%, #c8b8e0 60%, transparent 90%)",
                  boxShadow: `0 0 0 4px ${C.canvasSoft}, 0 0 14px rgba(167,229,211,.55)`,
                  animation: `aOrbBreathe ${3 + i * 0.3}s ease-in-out infinite`,
                }}
              />
              <div
                style={{
                  display: "inline-block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.mint,
                  letterSpacing: ".96px",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  background: C.dark,
                  borderRadius: 9999,
                  marginBottom: 10,
                  fontFamily: inter,
                }}
              >
                {e.y}
              </div>
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 24,
                  fontWeight: 300,
                  color: C.ink,
                  letterSpacing: "-.3px",
                  lineHeight: 1.2,
                }}
              >
                {e.t}
              </div>
              <div style={{ fontFamily: inter, fontSize: 15, color: C.body, lineHeight: 1.6, marginTop: 8, maxWidth: 640 }}>
                {e.d}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Founders ─────────────────────────────────────────────────────────────────
function LinkedInIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" fillOpacity={0.12} />
      <path
        d="M8.5 10v6M8.5 8v-.5M12 16v-3a2 2 0 0 1 4 0v3M12 10v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AFounders() {
  const team = [
    {
      photo: "/suyash.png",
      name: "Suyash Agrawal",
      role: "Co-founder, CEO",
      bio: "Two years running a PE firm acquiring Main Street businesses. Watched deal after deal fall apart — sellers unprepared, books messy, financials that couldn't pass SBA underwriting. Nobody was telling owners what buyers actually needed to see. Scorta is the firm he wished existed when he was on the buy side.",
      li: "https://www.linkedin.com/in/suyash-agrawal-20/",
      grad: "radial-gradient(circle at 35% 35%, #a7e5d3 0%, #c8b8e0 50%, #a8c8e8 80%, #0c0a09 100%)",
    },
    {
      photo: "/puneet.jpeg",
      name: "Puneet Gupta",
      role: "Co-founder, CTO",
      bio: "Builder focused on AI-native product experiences. Designed and engineered ExitIQ — the assessment engine that surfaces deal risks and buyer signals in real time, the way an M&A advisor thinks. Believes the best software makes complex decisions feel obvious.",
      li: "https://www.linkedin.com/in/puneetguptaa1",
      grad: "radial-gradient(circle at 35% 35%, #f4c5a8 0%, #e8b8c4 50%, #c8b8e0 80%, #0c0a09 100%)",
    },
  ]

  return (
    <section id="founders" style={{ padding: "96px 24px", background: C.canvas }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="a-rv" style={{ maxWidth: 720, margin: "0 auto 48px", textAlign: "center" }}>
          <div style={{ ...eyebrow(), marginBottom: 16 }}>Founders</div>
          <h2
            style={{
              fontFamily: garamond,
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 300,
              letterSpacing: "-1.2px",
              lineHeight: 1.06,
              color: C.ink,
              margin: 0,
            }}
          >
            Built by operators, not <em style={{ fontStyle: "italic" }}>brokers.</em>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
            maxWidth: 880,
            margin: "0 auto",
          }}
        >
          {team.map((m, i) => (
            <div
              key={i}
              className={`a-rv a-ch a-d${i + 1}`}
              style={{
                background: C.card,
                border: `1px solid ${C.hairline}`,
                borderRadius: 24,
                padding: 28,
              }}
            >
              {/* Photo */}
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  marginBottom: 18,
                  position: "relative",
                  overflow: "hidden",
                  flexShrink: 0,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 0 0 2px rgba(0,0,0,0.06)",
                }}
              >
                <Image
                  src={m.photo}
                  alt={m.name}
                  fill
                  sizes="88px"
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                />
              </div>

              {/* Name */}
              <div
                style={{
                  fontFamily: garamond,
                  fontSize: 22,
                  fontWeight: 300,
                  color: C.ink,
                  letterSpacing: "-.3px",
                  lineHeight: 1.2,
                }}
              >
                {m.name}
              </div>

              {/* Role pill */}
              <div
                style={{
                  display: "inline-block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.mint,
                  letterSpacing: ".4px",
                  marginTop: 6,
                  padding: "2px 10px",
                  background: C.dark,
                  borderRadius: 9999,
                  fontFamily: inter,
                }}
              >
                {m.role}
              </div>

              {/* Bio */}
              <p
                style={{
                  fontFamily: inter,
                  fontSize: 14.5,
                  color: C.body,
                  lineHeight: 1.6,
                  marginTop: 14,
                  marginBottom: 0,
                }}
              >
                {m.bio}
              </p>

              {/* LinkedIn */}
              <a
                href={m.li}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: inter,
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.muted,
                  textDecoration: "none",
                  marginTop: 16,
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.ink)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
              >
                <LinkedInIcon />
                LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function AExitCTA({ onOpen }: { onOpen: () => void }) {
  return (
    <section
      style={{
        background: C.dark,
        color: C.onDark,
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            width: 800,
            height: 800,
            top: "-40%",
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,229,211,.18) 0%, rgba(200,184,224,.1) 45%, transparent 70%)",
            filter: "blur(60px)",
            animation: "aOrbFloat1 18s ease-in-out infinite",
          }}
        />
      </div>
      <div className="a-rv" style={{ position: "relative", textAlign: "center", maxWidth: 740, margin: "0 auto" }}>
        <div style={{ ...eyebrow(true), marginBottom: 18 }}>Three minutes. Free. No login.</div>
        <h2
          style={{
            fontFamily: garamond,
            fontSize: "clamp(38px, 5.6vw, 68px)",
            fontWeight: 300,
            letterSpacing: "-1.92px",
            lineHeight: 1.02,
            color: C.onDark,
            marginBottom: 22,
          }}
        >
          See what your business <em style={{ fontStyle: "italic" }}>is worth.</em>
        </h2>
        <button onClick={onOpen} style={btnLight}>
          Start ExitIQ →
        </button>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function AFooter() {
  return (
    <footer style={{ background: C.canvasSoft, borderTop: `1px solid ${C.hairline}`, padding: "48px 24px 32px" }}>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: garamond,
            fontSize: 20,
            fontWeight: 300,
            color: C.ink,
            letterSpacing: "-.3px",
            textDecoration: "none",
          }}
        >
          Scorta
        </Link>
        <span style={{ fontFamily: inter, fontSize: 13, color: C.mutedSoft }}>
          © 2026 Scorta. For informational purposes only. Not financial advice.
        </span>
      </div>
    </footer>
  )
}

// ─── Root Export ──────────────────────────────────────────────────────────────
export function AboutPage() {
  useReveal()
  const [exitOpen, setExitOpen] = React.useState(false)
  const [announcementVisible, setAnnouncementVisible] = React.useState(true)
  const barWrapRef = React.useRef<HTMLDivElement>(null)
  const handleOpen = () => setExitOpen(true)

  React.useEffect(() => {
    if (!announcementVisible) return
    const el = barWrapRef.current
    if (!el) return
    const barHeight = el.offsetHeight || 37
    const HIDE_AT = 80
    const SHOW_AT = 50
    const TRANSITION = "height 0.35s ease, opacity 0.3s ease"
    el.style.transition = "none"
    el.style.height = barHeight + "px"
    el.style.opacity = "1"
    void el.offsetHeight
    el.style.transition = TRANSITION
    let hidden = false
    const onScroll = () => {
      const y = window.scrollY
      if (!hidden && y > HIDE_AT) {
        hidden = true
        el.style.height = "0px"
        el.style.opacity = "0"
      } else if (hidden && y < SHOW_AT) {
        hidden = false
        el.style.height = barHeight + "px"
        el.style.opacity = "1"
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [announcementVisible])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ABOUT_CSS }} />
      {exitOpen && <ExitIQOverlay onClose={() => setExitOpen(false)} />}
      <div style={{ background: C.canvas, color: C.body, fontFamily: inter, minHeight: "100vh", overflowX: "clip" }}>
        <ANav
          onOpen={handleOpen}
          announcementVisible={announcementVisible}
          barWrapRef={barWrapRef}
          onDismissAnnouncement={() => setAnnouncementVisible(false)}
        />
        <AHero />
        <ANumbers />
        <AMission />
        <ATimeline />
        <AFounders />
        <AExitCTA onOpen={handleOpen} />
        <AFooter />
      </div>
    </>
  )
}

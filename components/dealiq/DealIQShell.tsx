"use client"

/**
 * DealIQ's global chrome — a 56px top bar, four destinations, one primary verb.
 *
 * Deliberately **not** a fork of `AppShell`. That shell's IA — a 280px station
 * rail with sequential sublabels, a one-deal top bar, a CASE strip and an agent
 * gutter — is built for a linear walk through a single engagement. A searcher
 * triages many deals and moves between them fast, so the navigation is flat,
 * unnumbered, agent-free, and horizontal, and the density lives in the content
 * (Execution Plan §3 item 3).
 *
 * Shared with the sell side: the token set, the type scale, the spacing rhythm.
 * Not shared: any component, class name, or layout. Every colour reference here
 * goes through the `--dq-*` aliases the route-group layout sets, which is what
 * keeps the sell side's signature accent out of this application by construction.
 */

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React from "react"

import { useDealIQSession } from "@/components/dealiq/DealIQSessionContext"
import { BUYER } from "@/lib/dealiq/data/buyer"
import { formatCompactCurrency } from "@/lib/dealiq/format"
import { DEALIQ_NAV, DEALIQ_ROOT, DEALIQ_SIGNIN_PATH } from "@/lib/dealiq/navigation"
import type { DealIqNavIcon } from "@/lib/dealiq/types"
import { createClient } from "@/lib/supabase/client"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

export const DQ_BAR_HEIGHT = 56

// ── Icons ────────────────────────────────────────────────────────────────────

function NavIcon({ icon }: { icon: DealIqNavIcon }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  switch (icon) {
    case "pipeline":
      return (
        <svg {...common}>
          <rect x="1.8" y="2.5" width="3.6" height="11" rx="1" />
          <rect x="6.2" y="2.5" width="3.6" height="7.5" rx="1" />
          <rect x="10.6" y="2.5" width="3.6" height="4.5" rx="1" />
        </svg>
      )
    case "screen":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="4.6" />
          <path d="M10.4 10.4 L14 14" />
        </svg>
      )
    case "flow":
      return (
        <svg {...common}>
          <path d="M2 4.5h12M2 8h8M2 11.5h5" />
          <circle cx="12.6" cy="11" r="2.2" />
        </svg>
      )
    case "verify":
      return (
        <svg {...common}>
          <path d="M8 1.8 2.6 4.1v4c0 3.2 2.2 5.4 5.4 6.1 3.2-.7 5.4-2.9 5.4-6.1v-4L8 1.8Z" />
          <path d="M5.8 8.1 7.3 9.6l3-3.2" />
        </svg>
      )
  }
}

function ShieldCheck() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5 2.4 3.9v4.2c0 3.3 2.3 5.6 5.6 6.4 3.3-.8 5.6-3.1 5.6-6.4V3.9L8 1.5Z"
        fill="currentColor"
        opacity=".16"
      />
      <path
        d="M5.6 8.2 7.2 9.8l3.2-3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Shell ────────────────────────────────────────────────────────────────────

export function DealIQShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { capitalVerified, hydrated } = useDealIQSession()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [signingOut, setSigningOut] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement | null>(null)

  // The buyer is verified by seed; the session flag only records a verification
  // performed during this session (item 11). Either one lights the badge.
  const verified = BUYER.capitalVerified || (hydrated && capitalVerified)

  React.useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [menuOpen])

  // Close the menu on navigation — a soft nav leaves it open otherwise.
  React.useEffect(() => setMenuOpen(false), [pathname])

  async function signOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await createClient().auth.signOut()
    } catch {
      // Sign the buyer out of the UI regardless — the door is the destination.
    }
    // Back to DealIQ's own door, never the seller's.
    router.replace(DEALIQ_SIGNIN_PATH)
    router.refresh()
  }

  function isActive(href: string): boolean {
    if (href === DEALIQ_ROOT) return pathname === DEALIQ_ROOT || pathname.startsWith(`${DEALIQ_ROOT}/deal`)
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const mandate = BUYER.mandate

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: inter }}>
      <DealIQScopedStyles />

      <header
        style={{
          height: DQ_BAR_HEIGHT,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "0 22px",
          borderBottom: "1px solid var(--div)",
          background: "rgba(255,255,255,.72)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
        }}
      >
        {/* Wordmark */}
        <Link
          href={DEALIQ_ROOT}
          className="dq-focus"
          style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }}
        >
          <span
            aria-hidden
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "var(--dq-accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: garamond,
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "-.3px",
            }}
          >
            D
          </span>
          <span
            style={{
              fontFamily: garamond,
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "-.3px",
              color: "var(--t1)",
            }}
          >
            DealIQ
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--dq-accent)",
              background: "var(--dq-accent-soft)",
              border: "1px solid var(--dq-accent-edge)",
              borderRadius: 5,
              padding: "2px 5px",
            }}
          >
            Buy-side
          </span>
        </Link>

        {/* Destinations */}
        <nav aria-label="DealIQ" style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {DEALIQ_NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="dq-nav-item dq-focus"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 11px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  letterSpacing: "-.01em",
                  color: active ? "var(--t1)" : "var(--t2)",
                  background: active ? "var(--dq-accent-soft)" : "transparent",
                  border: `1px solid ${active ? "var(--dq-accent-edge)" : "transparent"}`,
                }}
              >
                <span style={{ color: active ? "var(--dq-accent)" : "var(--t3)", display: "flex" }}>
                  <NavIcon icon={item.icon} />
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Mandate — the standing filter every surface is read against */}
        <span
          title={`${mandate.industries.length} industries · ${mandate.geographies.join(", ")} · SDE floor ${formatCompactCurrency(mandate.sdeFloor)}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: mono,
            fontSize: 10.5,
            letterSpacing: ".02em",
            color: "var(--t2)",
            background: "var(--s2)",
            border: "1px solid var(--b3)",
            borderRadius: 7,
            padding: "5px 9px",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "var(--t3)" }}>Mandate</span>
          {formatCompactCurrency(mandate.evBand.low)}–{formatCompactCurrency(mandate.evBand.high)}
        </span>

        {/* Capital-verified badge — item 11 makes it earnable; the seed buyer already holds it */}
        {verified ? (
          <Link
            href="/dealiq/verify"
            className="dq-focus"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontFamily: mono,
              fontSize: 10.5,
              letterSpacing: ".02em",
              color: "var(--dq-accent)",
              background: "var(--dq-accent-soft)",
              border: "1px solid var(--dq-accent-edge)",
              borderRadius: 7,
              padding: "5px 9px",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <ShieldCheck />
            Capital-verified
          </Link>
        ) : null}

        {/* The app's primary verb, reachable from everywhere */}
        <Link
          href="/dealiq/screen"
          className="dq-primary dq-focus"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 13px",
            borderRadius: 8,
            background: "var(--dq-accent)",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 600,
            letterSpacing: "-.01em",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Screen a deal
        </Link>

        {/* Buyer menu */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Account — ${BUYER.name}, ${BUYER.firmName}`}
            className="dq-avatar dq-focus"
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1px solid var(--b2)",
              background: "var(--dq-accent-soft)",
              color: "var(--dq-accent)",
              fontFamily: mono,
              fontSize: 10.5,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {BUYER.initials}
          </button>

          {menuOpen ? (
            <div
              role="menu"
              aria-label="Account"
              className="dq-menu-pop"
              style={{
                position: "absolute",
                top: 38,
                right: 0,
                minWidth: 236,
                padding: 6,
                borderRadius: 11,
                border: "1px solid var(--b3)",
                background: "var(--dd-bg)",
                boxShadow: "0 14px 40px rgba(20,15,8,.14)",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div style={{ padding: "8px 10px 9px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{BUYER.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--t2)", marginTop: 2 }}>
                  {BUYER.title} · {BUYER.firmName}
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: "var(--t3)", marginTop: 5 }}>
                  {formatCompactCurrency(BUYER.committedCapital)} committed · pool rank {BUYER.poolRank} of{" "}
                  {BUYER.poolSize}
                </div>
              </div>
              <div style={{ height: 1, background: "var(--div)", margin: "2px 0" }} />
              <MenuLink href="/dealiq/verify" label="Capital verification" />
              <MenuLink href={DEALIQ_ROOT} label="Screening log" />
              <div style={{ height: 1, background: "var(--div)", margin: "2px 0" }} />
              <button
                type="button"
                role="menuitem"
                onClick={signOut}
                disabled={signingOut}
                className="dq-menu-item dq-focus"
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 7,
                  border: "none",
                  background: "transparent",
                  color: "var(--t2)",
                  fontSize: 12.5,
                  fontFamily: inter,
                  cursor: signingOut ? "default" : "pointer",
                }}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </div>
  )
}

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="dq-menu-item dq-focus"
      style={{
        padding: "8px 10px",
        borderRadius: 7,
        textDecoration: "none",
        color: "var(--t2)",
        fontSize: 12.5,
      }}
    >
      {label}
    </Link>
  )
}

/**
 * Every rule is `dq-` prefixed so the two applications can never collide, even
 * though both mount `<style>` blocks into the same document during a demo where
 * one is open in each tab.
 */
export function DealIQScopedStyles() {
  return (
    <style>{`
      .dq-nav-item { transition: background .15s ease, color .15s ease, border-color .15s ease; }
      .dq-nav-item:hover { background: rgba(12,10,9,.045); }
      .dq-nav-item[aria-current="page"]:hover { background: var(--dq-accent-soft); }
      .dq-menu-item { transition: background .13s ease, color .13s ease; }
      .dq-menu-item:hover { background: rgba(12,10,9,.05); color: var(--t1); }
      .dq-primary, .dq-cta { transition: filter .16s ease, transform .16s ease, box-shadow .16s ease; }
      .dq-primary:hover, .dq-cta:hover:not(:disabled) {
        filter: brightness(1.08);
        transform: translateY(-1px);
        box-shadow: 0 6px 18px var(--dq-accent-edge);
      }
      .dq-primary:active, .dq-cta:active:not(:disabled) { transform: none; }
      .dq-avatar { transition: border-color .15s ease, transform .15s ease; }
      .dq-avatar:hover { border-color: var(--dq-accent-edge); transform: scale(1.06); }
      .dq-menu-pop { animation: dqFadeUp .16s ease-out both; transform-origin: top right; }
      .dq-focus:focus-visible {
        outline: 2px solid var(--dq-accent);
        outline-offset: 2px;
        border-radius: 8px;
      }
      .dq-card {
        transition: border-color .18s ease, transform .18s ease, box-shadow .18s ease, background .18s ease;
      }
      .dq-card:hover {
        border-color: var(--dq-accent-edge);
        transform: translateY(-2px);
        box-shadow: 0 10px 26px rgba(20,15,8,.10);
      }
      .dq-stat { transition: border-color .18s ease, transform .18s ease; }
      .dq-stat:hover { border-color: var(--dq-accent-edge); transform: translateY(-2px); }
      .dq-tab:hover { color: var(--t1); }
      .dq-step:hover:not(:disabled) { background: rgba(12,10,9,.06); color: var(--t1); }
      .dq-bar-fill { transition: width .9s cubic-bezier(.22,1,.36,1); }
      .dq-auth-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 40px;
        width: min(1040px, 100%);
        align-items: center;
      }
      .dq-auth-vignette { display: none; }
      @media (min-width: 980px) {
        .dq-auth-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
        .dq-auth-vignette { display: flex; }
      }
      @keyframes dqFadeUp {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: none; }
      }
      @keyframes dqRiseIn {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: none; }
      }
      @keyframes dqTickIn {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: none; }
      }
      .dq-enter { animation: dqFadeUp .28s ease-out both; }
      .dq-rise { animation: dqRiseIn .55s cubic-bezier(.22,1,.36,1) both; }
      .dq-tick { animation: dqTickIn .38s ease-out both; }
      @media (prefers-reduced-motion: reduce) {
        .dq-enter, .dq-rise, .dq-tick, .dq-menu-pop { animation: none; }
        .dq-card:hover, .dq-stat:hover, .dq-avatar:hover,
        .dq-primary:hover, .dq-cta:hover:not(:disabled) { transform: none; }
        .dq-bar-fill { transition: none; }
      }
    `}</style>
  )
}

"use client"

/**
 * Certified Deal Flow — the flywheel rendered (Execution Plan item 12):
 * pre-market certified listings, mandate-matched and sorted by computed score,
 * with a visible clock before they hit the open market.
 *
 * The countdown derives from `FLOW_AS_OF` (standing decision 15), never
 * `Date.now()`, so the feed shows the same days remaining in every demo. The
 * locked state gates on the same verification condition as the shell badge —
 * the seed buyer is pre-verified, so the lock renders only if the content pass
 * flips that seed, but it exists and the badge means something.
 */

import Link from "next/link"
import React from "react"

import { useDealIQSession } from "@/components/dealiq/DealIQSessionContext"
import { BUYER } from "@/lib/dealiq/data/buyer"
import { FLOW_COPY } from "@/lib/dealiq/data/copy"
import { CERTIFIED_LISTINGS, FLOW_AS_OF } from "@/lib/dealiq/data/flow"
import { daysBetween, formatCompactCurrency, formatDayCount, formatScore } from "@/lib/dealiq/format"
import { rankListings } from "@/lib/dealiq/matching"
import type { MatchComponent } from "@/lib/dealiq/types"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

function componentTone(score: number): string {
  if (score >= 1) return "var(--dq-accent)"
  if (score > 0) return "var(--gold)"
  return "var(--crit)"
}

export function CertifiedFlow() {
  const { capitalVerified, hydrated } = useDealIQSession()
  const verified = BUYER.capitalVerified || (hydrated && capitalVerified)

  const ranked = React.useMemo(() => rankListings(CERTIFIED_LISTINGS, BUYER.mandate), [])

  return (
    <div style={{ padding: "26px 22px 48px", fontFamily: inter, maxWidth: 980 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {FLOW_COPY.eyebrow}
      </div>
      <h1
        style={{
          margin: "3px 0 0",
          fontFamily: garamond,
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: "-.3px",
          color: "var(--t1)",
        }}
      >
        {FLOW_COPY.title}
      </h1>
      <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.55, color: "var(--t2)", maxWidth: 620 }}>
        {FLOW_COPY.subtitle}
      </p>

      {!verified ? (
        <LockedState />
      ) : ranked.length === 0 ? (
        <p
          style={{
            margin: "20px 0 0",
            padding: "26px 20px",
            textAlign: "center",
            fontSize: 12.5,
            color: "var(--t3)",
            border: "1px dashed var(--b2)",
            borderRadius: 12,
            background: "var(--s2)",
          }}
        >
          {FLOW_COPY.emptyMandate}
        </p>
      ) : (
        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 14,
          }}
        >
          {ranked.map(({ listing, match }) => (
            <ListingCard key={listing.id} listing={listing} score={match.score} components={match.components} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Locked state ─────────────────────────────────────────────────────────────

function LockedState() {
  return (
    <section
      aria-label={FLOW_COPY.lockedTitle}
      style={{
        marginTop: 20,
        padding: "34px 28px",
        borderRadius: 13,
        border: "1px dashed var(--b2)",
        background: "var(--s2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        textAlign: "center",
      }}
    >
      <LockGlyph />
      <div style={{ fontFamily: garamond, fontSize: 19, fontWeight: 500, color: "var(--t1)" }}>
        {FLOW_COPY.lockedTitle}
      </div>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "var(--t2)", maxWidth: 420 }}>
        {FLOW_COPY.lockedBody}
      </p>
      <Link
        href="/dealiq/verify"
        className="dq-primary dq-focus"
        style={{
          marginTop: 8,
          padding: "9px 16px",
          borderRadius: 9,
          background: "var(--dq-accent)",
          color: "#fff",
          fontSize: 12.5,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {FLOW_COPY.verifyCta}
      </Link>
    </section>
  )
}

// ── Listing card ─────────────────────────────────────────────────────────────

function ListingCard({
  listing,
  score,
  components,
}: {
  listing: (typeof CERTIFIED_LISTINGS)[number]
  score: number
  components: ReadonlyArray<MatchComponent>
}) {
  const daysToOpen = daysBetween(FLOW_AS_OF, listing.openMarketOn)

  return (
    <article
      className="dq-card"
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 13,
        border: "1px solid var(--b3)",
        background: "var(--glass-bg)",
        boxShadow: "var(--glass-shadow)",
        overflow: "hidden",
      }}
    >
      {/* Pre-market countdown strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "7px 16px",
          background: "var(--dq-accent-soft)",
          borderBottom: "1px solid var(--dq-accent-edge)",
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: ".04em",
          color: "var(--dq-accent)",
        }}
      >
        <span>
          {FLOW_COPY.openMarketIn} {formatDayCount(daysToOpen)}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <SealGlyph />
          {FLOW_COPY.sealLabel} · {formatScore(listing.scortaScore)}
        </span>
      </div>

      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              title={listing.name}
              style={{
                margin: 0,
                fontFamily: garamond,
                fontSize: 17,
                fontWeight: 500,
                letterSpacing: "-.2px",
                color: "var(--t1)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {listing.name}
            </h2>
            <div style={{ marginTop: 2, fontSize: 11.5, color: "var(--t2)" }}>
              {listing.industry} · {listing.geography}
            </div>
          </div>
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: ".06em", color: "var(--t3)" }}>
              {FLOW_COPY.matchLabel}
            </div>
            <div style={{ fontFamily: mono, fontSize: 17, fontWeight: 600, color: "var(--dq-accent)" }}>
              {formatScore(score)}%
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, fontFamily: mono, fontSize: 11.5, color: "var(--t1)" }}>
          <span>
            <span style={{ color: "var(--t3)", fontSize: 9.5 }}>{FLOW_COPY.askLabel} </span>
            {formatCompactCurrency(listing.ask)}
          </span>
          <span>
            <span style={{ color: "var(--t3)", fontSize: 9.5 }}>{FLOW_COPY.sdeLabel} </span>
            {formatCompactCurrency(listing.sde)}
          </span>
          {listing.sbaEligible ? (
            <span style={{ fontSize: 9.5, color: "var(--t3)", alignSelf: "center" }}>{FLOW_COPY.sbaChip}</span>
          ) : null}
        </div>

        {/* Why it matched — the per-component breakdown the engine returned */}
        <div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 8.5,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--t3)",
            }}
          >
            {FLOW_COPY.breakdownTitle}
          </div>
          <ul
            style={{
              margin: "5px 0 0",
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {components.map((component) => (
              <li
                key={component.key}
                style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "var(--t2)" }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: componentTone(component.score),
                  }}
                />
                {component.basis}
              </li>
            ))}
          </ul>
        </div>

        {/* Seller-side certification basis */}
        <div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 8.5,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--t3)",
            }}
          >
            {FLOW_COPY.basisTitle}
          </div>
          <ul
            style={{
              margin: "5px 0 0",
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {listing.certificationBasis.map((line) => (
              <li key={line} style={{ display: "flex", gap: 7, fontSize: 11, lineHeight: 1.45, color: "var(--t2)" }}>
                <span aria-hidden style={{ color: "var(--dq-accent)", flexShrink: 0 }}>
                  ·
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: "auto" }}>
          <Link
            href={`/dealiq/screen?listing=${encodeURIComponent(listing.id)}`}
            className="dq-focus"
            style={{
              display: "inline-block",
              padding: "8px 13px",
              borderRadius: 9,
              border: "1px solid var(--dq-accent-edge)",
              background: "var(--dq-accent-soft)",
              color: "var(--dq-accent)",
              fontSize: 11.5,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {FLOW_COPY.cta}
          </Link>
        </div>
      </div>
    </article>
  )
}

// ── Glyphs ───────────────────────────────────────────────────────────────────

function SealGlyph() {
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

function LockGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 16 16" fill="none" stroke="var(--t3)" strokeWidth="1.3" aria-hidden>
      <rect x="3.4" y="7" width="9.2" height="6.6" rx="1.4" />
      <path d="M5.4 7V5.2a2.6 2.6 0 0 1 5.2 0V7" />
    </svg>
  )
}

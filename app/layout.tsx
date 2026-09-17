import type { Metadata } from "next"
import type { ReactNode } from "react"
import { preload } from "react-dom"
import { AdvisorDialog } from "@/components/site/advisor/AdvisorDialog"
import { SiteBar } from "@/components/site/layout/SiteBar"
import { SiteFooter } from "@/components/site/layout/SiteFooter"
import { SiteStateProvider } from "@/components/site/providers/SiteStateProvider"
import { env } from "@/env.mjs"
import { PAGE_META, SITE_NAME } from "@/lib/site/routes"
import "@/styles/site.css"

/*
 * Type: the site is set in Newsreader (display) and IBM Plex Sans (text), the faces it launched with, plus a third
 * face for one word, Mona Sans for the bar's wordmark; all self-hosted from public/fonts and declared in
 * styles/fonts.css (see the README there). The four latin files the first paint needs (the serif, the sans, the
 * wordmark's Mona Sans and the console's mono) are preloaded here. Nothing depends on next/font or on Google's
 * servers.
 */

/**
 * Share card for iMessage, Slack, LinkedIn, and X. Rendered from the brand mark and wordmark
 * (public/og/heirloom-og.png, 1200×630); without it, link previews fall back to the largest image on
 * the page, which was the founder portrait. Resolved against `metadataBase`, so set
 * NEXT_PUBLIC_SITE_URL in production or previews will point at localhost.
 */
export const OG_IMAGE = {
  url: "/og/heirloom-og.png",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME}, sell-side M&A for established private businesses`,
}

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: PAGE_META.home.title, template: "%s" },
  description: PAGE_META.home.description,
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Three of the four: the serif for the headings, the regular sans for copy, and the wordmark's face (Mona Sans,
  // on every route in the bar through styles/site.css `type-brand`); the console's mono follows below.
  preload("/fonts/newsreader/Newsreader-latin.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" })
  preload("/fonts/ibm-plex-sans/IBMPlexSans-400-latin.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  })
  preload("/fonts/mona-sans/MonaSans-variable-latin.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  })
  // The restored exitIQ console's mono labels sit above the fold on / and /score.
  preload("/fonts/ibm-plex-mono/IBMPlexMono-400-latin.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  })
  return (
    <html lang="en">
      <body className="bg-canvas text-fg flex min-h-screen flex-col">
        <SiteStateProvider>
          <SiteBar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <AdvisorDialog />
        </SiteStateProvider>
      </body>
    </html>
  )
}

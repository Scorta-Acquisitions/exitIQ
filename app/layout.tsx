import type { Metadata } from "next"
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google"
import type { ReactNode } from "react"
import { AdvisorDialog } from "@/components/site/advisor/AdvisorDialog"
import { SiteFooter } from "@/components/site/layout/SiteFooter"
import { SiteHeader } from "@/components/site/layout/SiteHeader"
import { SiteStateProvider } from "@/components/site/providers/SiteStateProvider"
import { env } from "@/env.mjs"
import { PAGE_META, SITE_NAME } from "@/lib/site/routes"
import "@/styles/site.css"

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
})

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: PAGE_META.home.title, template: "%s" },
  description: PAGE_META.home.description,
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="bg-paper text-ink flex min-h-screen flex-col">
        <SiteStateProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <AdvisorDialog />
        </SiteStateProvider>
      </body>
    </html>
  )
}

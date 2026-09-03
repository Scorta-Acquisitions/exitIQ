import type { MetadataRoute } from "next"
import { env } from "@/env.mjs"
import { ALL_ROUTES } from "@/lib/site/routes"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const lastModified = new Date()
  return ALL_ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }))
}

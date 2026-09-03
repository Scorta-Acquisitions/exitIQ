/** Liveness probe. `next.config.ts` rewrites /healthz, /health, and /ping here. */
export function GET() {
  return Response.json({ status: "ok", service: "heirloom-site" })
}

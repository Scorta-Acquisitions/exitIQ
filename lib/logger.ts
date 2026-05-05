/**
 * Structured JSON logger for Scorta API.
 *
 * Every log entry is a single JSON line emitted to stdout/stderr.
 * Vercel captures these, makes them searchable in the dashboard, and
 * ships them to any attached log drain (Axiom, Datadog, BetterStack, etc.)
 * without any SDK changes.
 *
 * Usage:
 *   logger.info("session.created", { sessionId, score, leadQuality })
 *   logger.error("email.failed",  { sessionId, error: e.message })
 *
 * timed() wraps an async fn, logs ok/error with duration:
 *   const result = await timed("ai.teaser", () => generateObject(...), { sessionId })
 */

type Level = "info" | "warn" | "error"

export interface LogCtx {
  sessionId?: string
  operation?: string
  durationMs?: number
  statusCode?: number
  model?: string
  leadQuality?: string
  error?: string
  [key: string]: unknown
}

const SERVICE = "scorta-api"
// VERCEL_ENV is injected automatically by Vercel: "production" | "preview" | "development"
const DEPLOYMENT_ENV = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development"

function emit(level: Level, event: string, ctx?: LogCtx): void {
  const entry = {
    t: new Date().toISOString(),
    lvl: level,
    evt: event,
    svc: SERVICE,
    env: DEPLOYMENT_ENV,
    ...ctx,
  }
  const line = JSON.stringify(entry)
  if (level === "error") {
    console.error(line)
  } else if (level === "warn") {
    console.warn(line)
  } else {
    console.log(line)
  }
}

export const logger = {
  info: (event: string, ctx?: LogCtx) => emit("info", event, ctx),
  warn: (event: string, ctx?: LogCtx) => emit("warn", event, ctx),
  error: (event: string, ctx?: LogCtx) => emit("error", event, ctx),
}

/**
 * Measures execution time of an async function and logs the outcome.
 * Rethrows errors so the caller can still handle them.
 */
export async function timed<T>(
  operation: string,
  fn: () => Promise<T>,
  ctx?: Omit<LogCtx, "operation" | "durationMs">
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    logger.info(`${operation}.ok`, { ...ctx, operation, durationMs: Date.now() - start })
    return result
  } catch (err) {
    logger.error(`${operation}.error`, {
      ...ctx,
      operation,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}

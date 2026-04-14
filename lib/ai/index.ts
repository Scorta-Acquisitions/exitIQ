import { createAnthropic } from "@ai-sdk/anthropic"

import { env } from "@/env.mjs"

// Provider instance — created once at module level, shared across all requests.
// Never instantiate per-request; that would open a new connection on every call.
export const anthropic = createAnthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})

// Model constants — single source of truth for model selection across route handlers.
// Phase 1 uses two models (see Product.md §"AI Usage in Phase 1"):
//
//   SONNET_MODEL  — full report generation; output quality is critical, 10–20 s acceptable
//   HAIKU_MODEL   — teaser card generation; fast path, <2 s latency target
//
// Update these constants to change the model for all call sites simultaneously.
export const SONNET_MODEL = "claude-sonnet-4-6" as const
export const HAIKU_MODEL = "claude-haiku-4-5-20251001" as const

// Default falls back to Sonnet — the primary model for the core product output.
export const DEFAULT_MODEL = SONNET_MODEL

import { generateObject, jsonSchema } from "ai"
import { z } from "zod"

import { anthropic, HAIKU_MODEL } from "@/lib/ai"
import { buildDealExtractionPrompt } from "@/lib/ai/prompts"
import { FIXTURE_LISTING_URLS, INBOX_COPY, SAMPLE_LISTING_MARKER } from "@/lib/dealiq/data/copy"
import { FOCUS_DEAL } from "@/lib/dealiq/data/deal"
import { logger } from "@/lib/logger"
import type { DealCard, ScreenResponse } from "@/lib/dealiq/types"

/**
 * POST — screen a pasted listing (live Haiku) or a URL (fixture set only — no
 * fetching, no scraping). GET — warm ping, hit on Deal Inbox mount.
 *
 * The fallback contract (Execution Plan §2): the model call carries a 6s abort;
 * on abort or error the route returns the placeholder card with
 * `provenance: "fallback"` and HTTP 200. The demo path must never see a 5xx.
 */

const MODEL_TIMEOUT_MS = 6_000
const MAX_LISTING_CHARS = 20_000

const bodySchema = z.object({
  source: z.enum(["text", "url"]),
  value: z.string().trim().min(1).max(MAX_LISTING_CHARS),
})

const extractionSchema = z.object({
  name: z.string(),
  industry: z.string(),
  geography: z.string(),
  ask: z.number(),
  claimedSde: z.number(),
  revenue: z.number().optional(),
  yearsOperating: z.number().optional(),
  employees: z.number().optional(),
  realEstateIncluded: z.boolean().optional(),
  reasonForSale: z.string().optional(),
  highlights: z.array(z.string()),
  concerns: z.array(z.string()),
})

type Extraction = z.infer<typeof extractionSchema>

// Hand-written JSON schema for the model call: passing the zod object through
// `generateObject`'s schema generic trips TS2589 (excessively deep instantiation)
// with this zod/ai version pair. Zod stays as the runtime validator.
const extractionJsonSchema = jsonSchema<Extraction>({
  type: "object",
  properties: {
    name: { type: "string" },
    industry: { type: "string" },
    geography: { type: "string" },
    ask: { type: "number" },
    claimedSde: { type: "number" },
    revenue: { type: "number" },
    yearsOperating: { type: "number" },
    employees: { type: "number" },
    realEstateIncluded: { type: "boolean" },
    reasonForSale: { type: "string" },
    // No `maxItems`: Anthropic's structured-output schema support rejects it.
    // The prompt caps both lists at 5; the cap is advisory, not contractual.
    highlights: { type: "array", items: { type: "string" } },
    concerns: { type: "array", items: { type: "string" } },
  },
  required: ["name", "industry", "geography", "ask", "claimedSde", "highlights", "concerns"],
  additionalProperties: false,
})

export async function GET() {
  return Response.json({ ok: true })
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 })
  }

  const { source, value } = parsed.data
  const startedAt = Date.now()
  const fixtureCard = FOCUS_DEAL.card

  if (source === "url") {
    const normalized = value.toLowerCase()
    const known = FIXTURE_LISTING_URLS.some((url) => normalized.includes(url.toLowerCase()))
    const response: ScreenResponse = known
      ? { deal: fixtureCard, provenance: "fixture", latencyMs: Date.now() - startedAt }
      : {
          deal: fixtureCard,
          provenance: "fixture",
          latencyMs: Date.now() - startedAt,
          needsText: true,
          guidance: INBOX_COPY.urlGuidance,
        }
    return Response.json(response)
  }

  const isFixtureText = value.includes(SAMPLE_LISTING_MARKER)

  try {
    const { object } = await generateObject({
      model: anthropic(HAIKU_MODEL),
      schema: extractionJsonSchema,
      prompt: buildDealExtractionPrompt(value),
      abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    })
    const extracted = extractionSchema.parse(object)
    const latencyMs = Date.now() - startedAt

    if (isFixtureText) {
      // The fixture is the source document — prefer it and log any divergence.
      if (extracted.ask !== fixtureCard.ask || extracted.claimedSde !== fixtureCard.claimedSde) {
        logger.info("dealiq.screen.fixture_divergence", {
          extractedAsk: extracted.ask,
          fixtureAsk: fixtureCard.ask,
          extractedSde: extracted.claimedSde,
          fixtureSde: fixtureCard.claimedSde,
        })
      }
      const response: ScreenResponse = { deal: fixtureCard, provenance: "live", latencyMs, model: HAIKU_MODEL }
      return Response.json(response)
    }

    const deal: DealCard = {
      id: `pasted-${startedAt}`,
      ...extracted,
    }
    const response: ScreenResponse = { deal, provenance: "live", latencyMs, model: HAIKU_MODEL }
    return Response.json(response)
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    logger.warn("dealiq.screen.fallback", { reason })
    const response: ScreenResponse = {
      deal: fixtureCard,
      provenance: "fallback",
      latencyMs: Date.now() - startedAt,
    }
    return Response.json(response)
  }
}

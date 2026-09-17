/**
 * The instrument field's material and the one level a visitor's answers drive. Pure; unit-tested in
 * `lib/site/__tests__/instrument.test.ts`.
 */

import { ADVISOR_QUESTION_COUNT } from "@/lib/site/advisor/data"

/** The advisor strip's level before any answer: lit, but only just. */
const FIELD_FLOOR = 0.15
/** How much the strip brightens across the five answers, so a full briefing reads 0.85. */
const FIELD_RANGE = 0.7

/** The advisor strip's level (0..1) for `answered` of the five questions: 0.15, 0.29, 0.43, 0.57, 0.71, 0.85. */
export function advisorFieldTarget(answered: number): number {
  return FIELD_FLOOR + FIELD_RANGE * (answered / ADVISOR_QUESTION_COUNT)
}

/** The three glass textures the shader blends, calm to bright, as the level rises. */
export const FIELD_TEXTURES = [
  "/generated/field-calm.webp",
  "/generated/field-mid.webp",
  "/generated/field-bright.webp",
] as const

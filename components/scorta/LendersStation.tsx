"use client"

import type { PERSONA as PersonaShape } from "@/lib/persona"

import { OutreachStation } from "./OutreachStation"

type Persona = typeof PersonaShape

export function LendersStation({ persona }: { persona: Persona }) {
  return <OutreachStation persona={persona} mode="lenders" />
}

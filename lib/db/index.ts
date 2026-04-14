import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "@/env.mjs"
import * as schema from "./schema"

// Module-level singleton — reused across requests in the same process
const client = postgres(env.DATABASE_URL, { prepare: false })

export const db = drizzle(client, { schema })

/** Side-effect module: loads .env.local (and siblings) before @/env.mjs runs in drizzle.config.ts. */
import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

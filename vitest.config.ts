import react from "@vitejs/plugin-react"
import { loadEnv } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

/**
 * Vitest runs with mode `test`, which does not load `.env.local` the same way as `next dev`.
 * Merge `development` (includes `.env.local`) then `test` (`.env.test*`) so DATABASE_URL and
 * NEXT_PUBLIC_* are available for integration tests without overriding CI-injected env.
 */
function mergeEnvFilesIntoProcess(mode: string) {
  const cwd = process.cwd()
  const fromDev = loadEnv("development", cwd, "")
  const fromMode = loadEnv(mode, cwd, "")
  const merged = { ...fromDev, ...fromMode }
  for (const [key, value] of Object.entries(merged)) {
    if (typeof value !== "string" || value === "") continue
    if (process.env[key] !== undefined) continue
    process.env[key] = value
  }
}

export default defineConfig(({ mode }) => {
  mergeEnvFilesIntoProcess(mode)

  return {
    plugins: [tsconfigPaths(), react()],
    test: {
      environment: "jsdom",
      setupFiles: "./vitest.setup.ts",
      globals: true,
      include: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**", ".next/**"],
    },
  }
})

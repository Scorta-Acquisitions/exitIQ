import { defineConfig, mergeConfig } from "vitest/config"
import base from "./vitest.config"

/**
 * Site-only run with coverage gates. `pnpm test:site` fails if coverage of the deployed Heirloom
 * app (app/, components/site/, lib/site/) drops below the thresholds; raise them, never lower them.
 * app/layout.tsx is excluded because next/font cannot load under jsdom; the e2e suite covers it.
 */
export default defineConfig((env) =>
  mergeConfig(base(env), {
    test: {
      include: ["components/site/__tests__/**/*.test.{ts,tsx}", "lib/site/__tests__/**/*.test.{ts,tsx}"],
      coverage: {
        provider: "v8",
        include: ["app/**", "components/site/**", "lib/site/**"],
        exclude: ["**/__tests__/**", "app/layout.tsx"],
        reporter: ["text-summary"],
        thresholds: { lines: 97, statements: 97, branches: 95, functions: 95 },
      },
    },
  })
)

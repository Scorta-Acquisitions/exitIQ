import { defineConfig, mergeConfig } from "vitest/config"
import base from "./vitest.config"

const SITE_TESTS = ["components/site/__tests__/**/*.test.{ts,tsx}", "lib/site/__tests__/**/*.test.{ts,tsx}"]

/**
 * Site-only run with coverage gates. `pnpm test:site` fails if coverage of the deployed Heirloom
 * app (app/, components/site/, lib/site/) drops below the thresholds; raise them, never lower them.
 * app/layout.tsx is excluded because the root layout renders <html> and <body>, which jsdom cannot mount;
 * the e2e suite covers it (the fonts are self-hosted through styles/fonts.css, not next/font).
 */
export default defineConfig((env) => {
  const merged = mergeConfig(base(env), {
    test: {
      coverage: {
        provider: "v8",
        include: ["app/**", "components/site/**", "lib/site/**"],
        exclude: ["**/__tests__/**", "app/layout.tsx"],
        reporter: ["text-summary"],
        thresholds: { lines: 99, statements: 99, branches: 97, functions: 99 },
      },
    },
  })

  // `mergeConfig` concatenates arrays, so merging `include` would keep the root config's
  // `**/*.test.{ts,tsx}` and pull the legacy tests into the site run. Assign it after the merge.
  merged.test = { ...merged.test, include: SITE_TESTS }
  return merged
})

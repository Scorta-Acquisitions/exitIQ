# Scorta Frontend Review Agent Rules

You are a read-only frontend code reviewer for the Scorta/exitIQ codebase.
Trigger: when a PR comment contains `@claude`.
Do NOT edit files. Do NOT create branches. Do NOT push code.
Do NOT read any files in `.github/review-skills/` — all rules are inline below.

---

## Review Protocol

### Step 1 — Get the diff

Fetch the PR diff. Note which patterns appear across changed files:

| Pattern to scan for | Category triggered |
|---|---|
| `page.tsx`, `layout.tsx`, `async function` | Server rules (§A) |
| `"use client"` | Client boundary rules (§B) |
| `useState`, `useEffect`, `useMemo`, `useCallback` | Hooks rules (§C) |
| `import {` from `lucide-react`, `@radix-ui`, `@mui` | Bundle rules (§D) |
| `style={{`, hex colors `#`, hardcoded px values | Design token rules (§E) |
| `aria-`, `<button`, `<a`, icon-only elements | Accessibility rules (§F) |
| `../../`, `process.env`, `db` import | Scorta overrides (§G) — always checked |
| `.tsx` component files | Rendering rules (§H) |

### Step 2 — Apply rules from relevant sections below

Only check sections triggered by Step 1. §G is always checked on every PR.

---

## §A — Server-Side Rules

| ID | Trigger | Flag | Severity |
|---|---|---|---|
| A1 | Sequential `await` on independent fetches | Waterfall — wrap in `Promise.all()` | 🔴 |
| A2 | `await` before a conditional that could short-circuit | Defer await into the branch that needs it | 🟡 |
| A3 | RSC passes full object to Client Component | Serialize only fields the client uses | 🟡 |
| A4 | `async` RSC parent blocks sibling data fetches | Extract siblings to parallel async components | 🔴 |
| A5 | Server Action with no auth check inside it | Must call `verifySession()` inside every Server Action | 🔴 |
| A6 | `fetch()` or `fs.readFile()` inside a route handler body | Hoist static I/O to module level (runs once, not per request) | 🟡 |
| A7 | Mutable module-level variable stores request data | Causes cross-request data leaks — pass as props or use `React.cache()` | 🔴 |
| A8 | Multiple calls to same DB query across component tree | Wrap with `React.cache()` for per-request deduplication | 🟡 |
| A9 | Logging/analytics inside route handler before `return` | Move to `after()` so it doesn't block response | 🟡 |
| A10 | Nested `.map()` with sequential `await` per item | Chain dependent fetches: `ids.map(id => getA(id).then(a => getB(a.ref)))` | 🔴 |

---

## §B — Client Boundary Rules

| ID | Trigger | Flag | Severity |
|---|---|---|---|
| B1 | `"use client"` with no justification comment | Must have `// use client: [reason it can't be RSC]` on the line above | 🔴 |
| B2 | `"use client"` on a component that has no interactivity | Unnecessary — remove and make it RSC | 🟡 |
| B3 | `db` imported in a `"use client"` file | DB access not allowed in Client Components | 🔴 |
| B4 | `process.env` read in a `"use client"` file | Use `@/env.mjs` only; only `NEXT_PUBLIC_` vars are safe client-side | 🔴 |

---

## §C — Hooks Rules

| ID | Trigger | Flag | Severity |
|---|---|---|---|
| C1 | Component function defined inside another component | Remounts on every parent render — extract to module scope, pass props | 🔴 |
| C2 | `useEffect` sets state that could be computed during render | Derived state in effect — calculate inline instead | 🟡 |
| C3 | `useEffect` side effect clearly triggered by a user action | Move logic to the event handler directly | 🟡 |
| C4 | `useEffect` dependency is an object/array reference | Narrow to primitive fields: `[obj.id]` not `[obj]` | 🟡 |
| C5 | `useMemo` wrapping a simple boolean/string/number expression | Overhead exceeds savings — remove `useMemo` | 🟡 |
| C6 | `setState(stateVar + x)` where stateVar is in dep array | Use functional update: `setState(curr => curr + x)` | 🟡 |
| C7 | `useState(expensiveComputation())` | Lazy init: `useState(() => expensiveComputation())` | 🟡 |
| C8 | `useSearchParams()` or similar subscribed but only read in a callback | Read inside callback only: `new URLSearchParams(window.location.search)` | 🟡 |
| C9 | `useMemo` filter step and sort step combined in one call | Split into two `useMemo` calls with separate deps | 🟡 |
| C10 | Separate `useEffect` calls for unrelated side effects merged | Split into two effects with their own dep arrays | 🟡 |
| C11 | Default value for optional prop is inline `{}`, `[]`, or `() => {}` in `memo()` component | Extract to a module-level constant — breaks memoization otherwise | 🟡 |
| C12 | Frequent value (mouse pos, scroll, timer) stored in `useState` | Use `useRef` + direct DOM mutation if no render needed | 🟡 |
| C13 | Non-urgent update (scroll position, search filter) in `setState` | Wrap in `startTransition()` or use `useDeferredValue` | 🟡 |

---

## §D — Bundle & Import Rules

| ID | Trigger | Flag | Severity |
|---|---|---|---|
| D1 | `import { X, Y } from 'lucide-react'` (not via `optimizePackageImports`) | Barrel import loads all 1500+ icons — verify `optimizePackageImports` in `next.config` | 🔴 |
| D2 | `import { X } from '@radix-ui/react-*'` directly in `app/` pages | Must go through `components/` wrapper — raw Radix not allowed in pages | 🔴 |
| D3 | Heavy component (`Monaco`, chart lib, PDF viewer) with static import | Use `next/dynamic` with `ssr: false` | 🟡 |
| D4 | Analytics/error tracking imported at layout level without `dynamic` | Defer with `next/dynamic` + `ssr: false` so it loads post-hydration | 🟡 |
| D5 | `import(someVariable)` dynamic import with a runtime string path | Use explicit map of literal import paths for static analysis | 🟡 |
| D6 | `import { ButtonX } from '@/components/ui'` barrel import from own codebase | Import directly from component file path | 🟡 |

---

## §E — Design Token Rules

| ID | Trigger | Flag | Severity |
|---|---|---|--- |
| E1 | Hex color in `style={{}}` or className e.g. `text-[#3b82f6]` | Use Tailwind token only — no hardcoded hex | 🔴 |
| E2 | Arbitrary Tailwind value `p-[13px]`, `mt-[7px]`, etc. | Use nearest 4px-grid token (`p-3`=12px, `p-4`=16px) | 🔴 |
| E3 | Color class without `dark:` variant | All color utilities need `dark:` pairing | 🔴 |
| E4 | `style={{ color: '...' }}` or `style={{ background: '...' }}` inline | Replace with Tailwind token class | 🟡 |
| E5 | Variant-bearing component with `className` conditionals but no CVA | Require CVA (`class-variance-authority`) for all variant logic | 🟡 |

---

## §F — Accessibility Rules

| ID | Trigger | Flag | Severity |
|---|---|---|---|
| F1 | `<button>` or `<a>` containing only an icon with no text | Requires `aria-label` describing the action | 🔴 |
| F2 | Interactive element smaller than `h-10 w-10` (44×44px) | Minimum touch target — increase to at least `h-10 w-10` | 🔴 |
| F3 | `<img>` without `alt` attribute | Every image needs `alt`; decorative images use `alt=""` | 🔴 |
| F4 | `onClick` on a non-interactive element (`div`, `span`, `li`) | Use `<button>` or add `role="button"` + `tabIndex={0}` + keyboard handler | 🔴 |
| F5 | Heading levels skipped (`h1` → `h3`) | Follow heading hierarchy — never skip levels | 🟡 |
| F6 | `addEventListener('touchstart'/'wheel')` without `{ passive: true }` | Add passive flag — removes scroll jank | 🟡 |
| F7 | Color contrast not verifiable from static review | Flag for manual WCAG AA check (4.5:1 body, 3:1 large text) | 🟡 |

---

## §G — Scorta Project Overrides (always checked)

These are hard project standards enforced on every PR regardless of diff content.

| ID | Rule | Severity |
|---|---|---|
| G1 | No `"use client"` without justification comment above it | 🔴 |
| G2 | No `process.env` reads outside `@/env.mjs` | 🔴 |
| G3 | No `db` import in any Client Component | 🔴 |
| G4 | No relative `../../` imports — use `@/*` alias only | 🔴 |
| G5 | Radix UI only via `components/` wrappers, never raw in `app/` | 🔴 |
| G6 | CVA required for all variant-bearing components | 🟡 |
| G7 | No barrel imports from `@radix-ui/react-*` — use direct sub-packages | 🔴 |
| G8 | No hardcoded hex values — Tailwind design tokens only | 🔴 |
| G9 | No arbitrary Tailwind values like `p-[13px]` | 🔴 |
| G10 | All color classes must have `dark:` variants | 🔴 |
| G11 | Icon-only interactive elements must have `aria-label` | 🔴 |
| G12 | Interactive elements minimum `h-10 w-10` (44px touch target) | 🔴 |

--- hello

## §H — Rendering Rules

| ID | Trigger | Flag | Severity |
|---|---|---|---|
| H1 | `<svg className="animate-spin">` or transform on SVG element directly | Wrap in `<div className="animate-spin">` — SVG lacks GPU acceleration | 🟡 |
| H2 | Long rendered list with no virtualization or `content-visibility` | Add `content-visibility: auto` + `contain-intrinsic-size` via className | 🟡 |
| H3 | Static JSX element (no props, no state) defined inside component body | Hoist to module level to avoid re-creation on every render | 🟡 |
| H4 | Page/layout awaits data before returning JSX wrapper | Use `<Suspense>` boundary — render shell immediately, stream data in | 🟡 |
| H5 | `{condition && <Component />}` where condition can be `0` | Use `{condition ? <Component /> : null}` — falsy 0 renders as text | 🔴 |

---

## Step 3 — Post findings

Post ONE comment. No preamble. No task lists. No filler. Exact format:

```
**Summary:** [2–3 sentences on what this PR does]

**🔴 Blockers** (must fix before merge):
- `file/path.tsx:LINE` — [Rule ID] — [issue] — [exact fix]

**🟡 Warnings** (should fix):
- `file/path.tsx:LINE` — [Rule ID] — [issue] — [suggestion]

**✅ Verdict:** APPROVED | ⚠️ CHANGES REQUESTED | ❌ BLOCKED
```

Cite exact file paths and line numbers. Group findings by file. If no issues found, post APPROVED with a one-line summary.

---

## Scope

Review: `app/**`, `components/**`, `styles/**`, `*.tsx`, `*.ts`
Skip: `lib/db/**`, `drizzle/migrations/**`, `pnpm-lock.yaml`, `*.config.*`, `*.test.*`


# Scorta Backend Coding Agent Rules
<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./.next-docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: npx @next/codemod agents-md --output AGENTS.md|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx,03-layouts-and-pages.mdx,04-linking-and-navigating.mdx,05-server-and-client-components.mdx,06-partial-prerendering.mdx,07-fetching-data.mdx,08-updating-data.mdx,09-caching-and-revalidating.mdx,10-error-handling.mdx,11-css.mdx,12-images.mdx,13-fonts.mdx,14-metadata-and-og-images.mdx,15-route-handlers-and-middleware.mdx,16-deploying.mdx,17-upgrading.mdx}|01-app/02-guides:{analytics.mdx,authentication.mdx,backend-for-frontend.mdx,caching.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,data-security.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,json-ld.mdx,lazy-loading.mdx,local-development.mdx,mdx.mdx,memory-usage.mdx,multi-tenant.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,prefetching.mdx,production-checklist.mdx,progressive-web-apps.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,single-page-applications.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx,videos.mdx}|01-app/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|01-app/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|01-app/02-guides/upgrading:{codemods.mdx,version-14.mdx,version-15.mdx}|01-app/03-api-reference:{07-edge.mdx,08-turbopack.mdx}|01-app/03-api-reference/01-directives:{use-cache.mdx,use-client.mdx,use-server.mdx}|01-app/03-api-reference/02-components:{font.mdx,form.mdx,image.mdx,link.mdx,script.mdx}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.mdx,manifest.mdx,opengraph-image.mdx,robots.mdx,sitemap.mdx}|01-app/03-api-reference/03-file-conventions:{default.mdx,dynamic-routes.mdx,error.mdx,forbidden.mdx,instrumentation-client.mdx,instrumentation.mdx,intercepting-routes.mdx,layout.mdx,loading.mdx,mdx-components.mdx,middleware.mdx,not-found.mdx,page.mdx,parallel-routes.mdx,public-folder.mdx,route-groups.mdx,route-segment-config.mdx,route.mdx,src-folder.mdx,template.mdx,unauthorized.mdx}|01-app/03-api-reference/04-functions:{after.mdx,cacheLife.mdx,cacheTag.mdx,connection.mdx,cookies.mdx,draft-mode.mdx,fetch.mdx,forbidden.mdx,generate-image-metadata.mdx,generate-metadata.mdx,generate-sitemaps.mdx,generate-static-params.mdx,generate-viewport.mdx,headers.mdx,image-response.mdx,next-request.mdx,next-response.mdx,not-found.mdx,permanentRedirect.mdx,redirect.mdx,revalidatePath.mdx,revalidateTag.mdx,unauthorized.mdx,unstable_cache.mdx,unstable_noStore.mdx,unstable_rethrow.mdx,use-link-status.mdx,use-params.mdx,use-pathname.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,use-selected-layout-segment.mdx,use-selected-layout-segments.mdx,userAgent.mdx}|01-app/03-api-reference/05-config/01-next-config-js:{allowedDevOrigins.mdx,appDir.mdx,assetPrefix.mdx,authInterrupts.mdx,basePath.mdx,browserDebugInfoInTerminal.mdx,cacheComponents.mdx,cacheLife.mdx,compress.mdx,crossOrigin.mdx,cssChunking.mdx,devIndicators.mdx,distDir.mdx,env.mdx,eslint.mdx,expireTime.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,htmlLimitedBots.mdx,httpAgentOptions.mdx,images.mdx,incrementalCacheHandlerPath.mdx,inlineCss.mdx,logging.mdx,mdxRs.mdx,middlewareClientMaxBodySize.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,ppr.mdx,productionBrowserSourceMaps.mdx,reactCompiler.mdx,reactMaxHeadersLength.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,sassOptions.mdx,serverActions.mdx,serverComponentsHmrCache.mdx,serverExternalPackages.mdx,staleTimes.mdx,staticGeneration.mdx,taint.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,turbopackPersistentCaching.mdx,typedRoutes.mdx,typescript.mdx,urlImports.mdx,useCache.mdx,useLightningcss.mdx,viewTransition.mdx,webVitalsAttribution.mdx,webpack.mdx}|01-app/03-api-reference/05-config:{02-typescript.mdx,03-eslint.mdx}|01-app/03-api-reference/06-cli:{create-next-app.mdx,next.mdx}|02-pages/01-getting-started:{01-installation.mdx,02-project-structure.mdx,04-images.mdx,05-fonts.mdx,06-css.mdx,11-deploying.mdx}|02-pages/02-guides:{amp.mdx,analytics.mdx,authentication.mdx,babel.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,lazy-loading.mdx,mdx.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,post-css.mdx,preview-mode.mdx,production-checklist.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx}|02-pages/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|02-pages/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|02-pages/02-guides/upgrading:{codemods.mdx,version-10.mdx,version-11.mdx,version-12.mdx,version-13.mdx,version-14.mdx,version-9.mdx}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.mdx,02-dynamic-routes.mdx,03-linking-and-navigating.mdx,05-custom-app.mdx,06-custom-document.mdx,07-api-routes.mdx,08-custom-error.mdx}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.mdx,02-static-site-generation.mdx,04-automatic-static-optimization.mdx,05-client-side-rendering.mdx}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.mdx,02-get-static-paths.mdx,03-forms-and-mutations.mdx,03-get-server-side-props.mdx,05-client-side.mdx}|02-pages/03-building-your-application/06-configuring:{12-error-handling.mdx}|02-pages/04-api-reference:{06-edge.mdx,08-turbopack.mdx}|02-pages/04-api-reference/01-components:{font.mdx,form.mdx,head.mdx,image-legacy.mdx,image.mdx,link.mdx,script.mdx}|02-pages/04-api-reference/02-file-conventions:{instrumentation.mdx,middleware.mdx,public-folder.mdx,src-folder.mdx}|02-pages/04-api-reference/03-functions:{get-initial-props.mdx,get-server-side-props.mdx,get-static-paths.mdx,get-static-props.mdx,next-request.mdx,next-response.mdx,use-amp.mdx,use-report-web-vitals.mdx,use-router.mdx,userAgent.mdx}|02-pages/04-api-reference/04-config/01-next-config-js:{allowedDevOrigins.mdx,assetPrefix.mdx,basePath.mdx,bundlePagesRouterDependencies.mdx,compress.mdx,crossOrigin.mdx,devIndicators.mdx,distDir.mdx,env.mdx,eslint.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,httpAgentOptions.mdx,images.mdx,middlewareClientMaxBodySize.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,runtime-configuration.mdx,serverExternalPackages.mdx,trailingSlash.mdx,transpilePackages.mdx,turbo.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,webVitalsAttribution.mdx,webpack.mdx}|02-pages/04-api-reference/04-config:{01-typescript.mdx,02-eslint.mdx}|02-pages/04-api-reference/05-cli:{create-next-app.mdx,next.mdx}|03-architecture:{accessibility.mdx,fast-refresh.mdx,nextjs-compiler.mdx,supported-browsers.mdx}|04-community:{01-contribution-guide.mdx,02-rspack.mdx}<!-- NEXT-AGENTS-MD-END -->

import { render, type RenderOptions } from "@testing-library/react"
import type { ReactElement, ReactNode } from "react"
import { vi } from "vitest"
import { SiteStateProvider } from "@/components/site/providers/SiteStateProvider"
import { persistableState, type SiteState } from "@/lib/site/state/reducer"

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

/** The sessionStorage key the provider persists to (kept in sync with SiteStateProvider). */
export const SITE_STORAGE_KEY = "heirloom.site.v1"

function Providers({ children }: { children: ReactNode }) {
  return <SiteStateProvider>{children}</SiteStateProvider>
}

/** Render inside the site state provider (pathname mocked to "/"). */
export function renderWithSite(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  window.sessionStorage.clear()
  return render(ui, { wrapper: Providers, ...options })
}

/**
 * Render inside the provider with state already in place, the way a visitor arriving from another
 * route (or a reload) would see it: the seed is written to sessionStorage and the provider hydrates it.
 */
export function renderWithSeededSite(ui: ReactElement, seed: SiteState, options?: Omit<RenderOptions, "wrapper">) {
  window.sessionStorage.clear()
  window.sessionStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(persistableState(seed)))
  return render(ui, { wrapper: Providers, ...options })
}

export * from "@testing-library/react"

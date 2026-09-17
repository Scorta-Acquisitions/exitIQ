import "@testing-library/jest-dom"

/**
 * Browser APIs the site's client components touch that jsdom does not implement.
 * Each is a no-op stand-in: the components under test only need them to exist.
 */
if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
  }
  if (!("IntersectionObserver" in window)) {
    class IO {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
      root = null
      rootMargin = ""
      thresholds = []
    }
    Object.defineProperty(window, "IntersectionObserver", { value: IO, writable: true })
  }
  if (!("ResizeObserver" in window)) {
    class RO {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    Object.defineProperty(window, "ResizeObserver", { value: RO, writable: true })
  }
  // jsdom's getContext exists but only logs "not implemented"; a null stand-in keeps the run quiet and
  // lets the instrument field take its no-WebGL path. Tests that need a fake GL replace it themselves.
  window.HTMLCanvasElement.prototype.getContext = (() =>
    null) as unknown as typeof HTMLCanvasElement.prototype.getContext
}

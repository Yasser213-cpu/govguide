import { createContext, useContext, useEffect, useState, useRef } from "react";

const PageLoadingContext = createContext(null);

/**
 * Wrap the app (or each *AppLayout) with this once.
 * It tracks a single boolean: "is the current page still loading its data?"
 */
export function PageLoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <PageLoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </PageLoadingContext.Provider>
  );
}

/**
 * Call this INSIDE any page component, passing its own `loading` boolean.
 * That's the only line a page needs — no spinner markup, no imports of UI.
 *
 *   const [loading, setLoading] = useState(true);
 *   ...
 *   usePageLoading(loading);
 */
export function usePageLoading(loading) {
  const ctx = useContext(PageLoadingContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setIsLoading(loading);
    // reset when the page unmounts (route change) so the next page
    // starts from a clean "not loading" state until it says otherwise
    return () => ctx.setIsLoading(false);
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Used only inside AppLayout to know whether to show the overlay.
 */
export function usePageLoadingState() {
  const ctx = useContext(PageLoadingContext);
  return ctx?.isLoading ?? false;
}

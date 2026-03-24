/**
 * Lightweight analytics event tracking.
 *
 * Currently logs to console in development. To connect a real provider
 * (GA4, Plausible, Mixpanel), replace the `trackEvent` implementation.
 *
 * Usage:
 *   const { track } = useAnalytics();
 *   track("add_to_cart", { productId: 1, name: "TTW Tee" });
 */

const isDev = import.meta.env.DEV;

type EventName =
  | "page_view"
  | "view_product"
  | "add_to_cart"
  | "remove_from_cart"
  | "begin_checkout"
  | "complete_purchase"
  | "submit_contact"
  | "view_portfolio";

function trackEvent(name: EventName, data?: Record<string, unknown>) {
  if (isDev) {
    console.debug(`[analytics] ${name}`, data ?? "");
    return;
  }

  // GA4 integration (if gtag is loaded)
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      "event",
      name,
      data,
    );
  }
}

export function useAnalytics() {
  return { track: trackEvent };
}

export { trackEvent };

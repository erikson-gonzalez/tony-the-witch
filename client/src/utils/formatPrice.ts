const DEFAULT_USD_TO_CRC = 500;

/**
 * Format a price in USD for display.
 * - English (en): shows USD, e.g. "$60 USD"
 * - Spanish (es): converts to CRC, e.g. "₡30,000"
 */
export function formatPrice(
  amountUsd: number,
  locale?: string,
  usdToCrc = DEFAULT_USD_TO_CRC
): string {
  const n = Number(amountUsd);
  if (!Number.isFinite(n) || n < 0) {
    return "$0 USD";
  }
  const lang = locale?.slice(0, 2) || "en";
  if (lang === "es") {
    const colones = Math.round(n * (Number(usdToCrc) || DEFAULT_USD_TO_CRC));
    return `₡${colones.toLocaleString("es-CR")}`;
  }
  return `$${n} USD`;
}

/**
 * Format a shipping cost stored in colones.
 * - English: converts to USD, e.g. "$5 USD"
 * - Spanish: shows colones, e.g. "₡2,500"
 */
export function formatShippingCost(
  amountColones: number,
  locale?: string,
  usdToCrc = DEFAULT_USD_TO_CRC
): string {
  const n = Number(amountColones);
  if (!Number.isFinite(n) || n < 0) {
    return "₡0";
  }
  const lang = locale?.slice(0, 2) || "en";
  if (lang === "es") {
    return `₡${Math.round(n).toLocaleString("es-CR")}`;
  }
  const usd = n / (Number(usdToCrc) || DEFAULT_USD_TO_CRC);
  return `$${usd} USD`;
}

/** Get usdToCrc from config (for use in components with useContent) */
export function getUsdToCrc(config: unknown): number {
  const c = config as { pricing?: { usdToCrc?: number } } | null | undefined;
  return c?.pricing?.usdToCrc ?? DEFAULT_USD_TO_CRC;
}

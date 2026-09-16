const DEFAULT_USD_TO_CRC = 500;

/**
 * Format a price stored in colones (CRC) for display.
 * - Spanish (es): shows colones directly, e.g. "₡30,000"
 * - English (en): converts to approximate USD, e.g. "$60 USD"
 */
export function formatPrice(
  amountCrc: number,
  locale?: string,
  usdToCrc = DEFAULT_USD_TO_CRC
): string {
  const n = Number(amountCrc);
  if (!Number.isFinite(n) || n < 0) {
    return "₡0";
  }
  const lang = locale?.slice(0, 2) || "es";
  if (lang === "en") {
    const rate = Number(usdToCrc) || DEFAULT_USD_TO_CRC;
    const usd = n / rate;
    const display = Number.isInteger(usd) ? String(usd) : usd.toFixed(2);
    return `$${display} USD`;
  }
  return `₡${Math.round(n).toLocaleString("es-CR")}`;
}

/**
 * Format a shipping cost stored in colones.
 * - Spanish: shows colones, e.g. "₡2,500"
 * - English: converts to USD, e.g. "$5 USD"
 */
export function formatShippingCost(
  amountColones: number,
  locale?: string,
  usdToCrc = DEFAULT_USD_TO_CRC
): string {
  return formatPrice(amountColones, locale, usdToCrc);
}

/** Get usdToCrc from config (for use in components with useContent) */
export function getUsdToCrc(config: unknown): number {
  const c = config as { pricing?: { usdToCrc?: number } } | null | undefined;
  return c?.pricing?.usdToCrc ?? DEFAULT_USD_TO_CRC;
}

const DEFAULT_USD_TO_CRC = 500;

/**
 * Format a price stored in colones (CRC) for display.
 * Always shows colones, in every language — the card is charged in CRC,
 * so the shown price must match the charged price.
 */
export function formatPrice(
  amountCrc: number,
  _locale?: string,
  _usdToCrc = DEFAULT_USD_TO_CRC
): string {
  const n = Number(amountCrc);
  if (!Number.isFinite(n) || n < 0) {
    return "₡0";
  }
  return `₡${Math.round(n).toLocaleString("es-CR")}`;
}

/**
 * Format a shipping cost stored in colones. Always shows colones.
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

/**
 * Format a string of digits with thousands separators (commas).
 * @param value - Raw or already-formatted value
 * @param allowDecimals - If true, preserves decimal part (max 2 digits)
 */
export function formatAmountWithCommas(value: string, allowDecimals = false): string {
  const normalized = value.replace(/,/g, "");
  if (allowDecimals) {
    const [int, dec] = normalized.split(".");
    const intPart = int.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const decPart = dec !== undefined ? "." + dec.replace(/\D/g, "").slice(0, 2) : "";
    return intPart + decPart;
  }
  const digits = normalized.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Parse a formatted amount string to number (strips commas) */
export function parseFormattedAmount(value: string, allowDecimals = false): number {
  const cleaned = allowDecimals
    ? value.replace(/,/g, "").replace(/[^\d.]/g, "")
    : value.replace(/\D/g, "");
  return allowDecimals ? parseFloat(cleaned) || 0 : parseInt(cleaned, 10) || 0;
}

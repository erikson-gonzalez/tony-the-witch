import { describe, it, expect } from "vitest";
import { formatPrice, formatShippingCost, getUsdToCrc } from "../formatPrice";

// es-CR locale uses a narrow no-break space (not comma) as the thousands
// separator. The CRC matchers below tolerate either so the tests stay
// portable across Node/ICU versions.
const CRC_30K = /^₡30[\s,]000$/;
const CRC_6K = /^₡6[\s,]000$/;
const CRC_2500 = /^₡2[\s,]500$/;

describe("formatPrice", () => {
  it("returns USD for English locale", () => {
    expect(formatPrice(60, "en")).toBe("$60 USD");
  });

  it("converts to CRC for Spanish locale at default rate", () => {
    // 60 * 500 = 30000
    expect(formatPrice(60, "es")).toMatch(CRC_30K);
  });

  it("uses custom usdToCrc rate", () => {
    expect(formatPrice(10, "es", 600)).toMatch(CRC_6K);
  });

  it("treats locale prefix correctly", () => {
    expect(formatPrice(60, "es-CR")).toMatch(CRC_30K);
    expect(formatPrice(60, "en-US")).toBe("$60 USD");
  });

  it("returns $0 USD for invalid input", () => {
    expect(formatPrice(NaN)).toBe("$0 USD");
    expect(formatPrice(-10)).toBe("$0 USD");
  });

  it("defaults to English when no locale provided", () => {
    expect(formatPrice(15)).toBe("$15 USD");
  });
});

describe("formatShippingCost", () => {
  it("returns colones for Spanish locale", () => {
    expect(formatShippingCost(2500, "es")).toMatch(CRC_2500);
  });

  it("converts to USD for English locale", () => {
    // 2500 / 500 = 5
    expect(formatShippingCost(2500, "en")).toBe("$5 USD");
  });

  it("returns ₡0 for invalid input", () => {
    expect(formatShippingCost(NaN)).toBe("₡0");
    expect(formatShippingCost(-100)).toBe("₡0");
  });

  it("uses custom rate", () => {
    expect(formatShippingCost(6000, "en", 600)).toBe("$10 USD");
  });
});

describe("getUsdToCrc", () => {
  it("reads pricing.usdToCrc when present", () => {
    expect(getUsdToCrc({ pricing: { usdToCrc: 525 } })).toBe(525);
  });

  it("falls back to default for null/undefined", () => {
    expect(getUsdToCrc(null)).toBe(500);
    expect(getUsdToCrc(undefined)).toBe(500);
  });

  it("falls back to default when key missing", () => {
    expect(getUsdToCrc({})).toBe(500);
    expect(getUsdToCrc({ pricing: {} })).toBe(500);
  });
});

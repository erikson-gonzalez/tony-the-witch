import { describe, it, expect } from "vitest";
import { formatPrice, formatShippingCost, getUsdToCrc } from "../formatPrice";

// es-CR locale uses a narrow no-break space (not comma) as the thousands
// separator. The CRC matchers below tolerate either so the tests stay
// portable across Node/ICU versions.
const CRC_30K = /^₡30[\s,]000$/;
const CRC_25287 = /^₡25[\s,]287$/;
const CRC_2500 = /^₡2[\s,]500$/;

describe("formatPrice (input is colones)", () => {
  it("shows colones directly for Spanish locale", () => {
    expect(formatPrice(30000, "es")).toMatch(CRC_30K);
    expect(formatPrice(25287, "es")).toMatch(CRC_25287);
  });

  it("converts to USD for English locale at default rate", () => {
    // 30000 / 500 = 60
    expect(formatPrice(30000, "en")).toBe("$60 USD");
  });

  it("shows cents in USD when conversion is not whole", () => {
    // 25287 / 500 = 50.574 -> 50.57
    expect(formatPrice(25287, "en")).toBe("$50.57 USD");
  });

  it("uses custom usdToCrc rate", () => {
    // 6000 / 600 = 10
    expect(formatPrice(6000, "en", 600)).toBe("$10 USD");
  });

  it("treats locale prefix correctly", () => {
    expect(formatPrice(30000, "es-CR")).toMatch(CRC_30K);
    expect(formatPrice(30000, "en-US")).toBe("$60 USD");
  });

  it("returns ₡0 for invalid input", () => {
    expect(formatPrice(NaN)).toBe("₡0");
    expect(formatPrice(-10)).toBe("₡0");
  });

  it("defaults to Spanish when no locale provided", () => {
    expect(formatPrice(30000)).toMatch(CRC_30K);
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

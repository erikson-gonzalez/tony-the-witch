import { describe, it, expect } from "vitest";
import { formatPrice, formatShippingCost, getUsdToCrc } from "../formatPrice";

// es-CR locale uses a narrow no-break space (not comma) as the thousands
// separator. The CRC matchers below tolerate either so the tests stay
// portable across Node/ICU versions.
const CRC_30K = /^₡30[\s,]000$/;
const CRC_25287 = /^₡25[\s,]287$/;
const CRC_2500 = /^₡2[\s,]500$/;

describe("formatPrice (always colones)", () => {
  it("shows colones for Spanish locale", () => {
    expect(formatPrice(30000, "es")).toMatch(CRC_30K);
    expect(formatPrice(25287, "es")).toMatch(CRC_25287);
  });

  it("shows colones for English locale too", () => {
    expect(formatPrice(30000, "en")).toMatch(CRC_30K);
    expect(formatPrice(25287, "en-US")).toMatch(CRC_25287);
  });

  it("shows colones with no locale", () => {
    expect(formatPrice(30000)).toMatch(CRC_30K);
  });

  it("ignores the conversion rate", () => {
    expect(formatPrice(30000, "en", 600)).toMatch(CRC_30K);
  });

  it("returns ₡0 for invalid input", () => {
    expect(formatPrice(NaN)).toBe("₡0");
    expect(formatPrice(-10)).toBe("₡0");
  });
});

describe("formatShippingCost (always colones)", () => {
  it("returns colones for Spanish locale", () => {
    expect(formatShippingCost(2500, "es")).toMatch(CRC_2500);
  });

  it("returns colones for English locale", () => {
    expect(formatShippingCost(2500, "en")).toMatch(CRC_2500);
  });

  it("returns ₡0 for invalid input", () => {
    expect(formatShippingCost(NaN)).toBe("₡0");
    expect(formatShippingCost(-100)).toBe("₡0");
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

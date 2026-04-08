import { describe, it, expect } from "vitest";
import {
  calculateNetAmount,
  calculateRequiredPrice,
  FEE_LABELS,
} from "../price-calculator";

// PayPal 8% + platform 5% = 13% total. Net multiplier is 0.87.
describe("calculateNetAmount", () => {
  it("returns 0 for 0 input", () => {
    expect(calculateNetAmount(0)).toBe(0);
  });

  it("applies the 13% fee", () => {
    // 10000 * 0.87 = 8700
    expect(calculateNetAmount(10000)).toBe(8700);
  });

  it("rounds to integer", () => {
    // 1234 * 0.87 = 1073.58 → 1074
    expect(calculateNetAmount(1234)).toBe(1074);
  });

  it("never returns more than the input", () => {
    for (const v of [1, 100, 1000, 99999]) {
      expect(calculateNetAmount(v)).toBeLessThanOrEqual(v);
    }
  });
});

describe("calculateRequiredPrice", () => {
  it("returns 0 for 0 input", () => {
    expect(calculateRequiredPrice(0)).toBe(0);
  });

  it("inverts calculateNetAmount within rounding", () => {
    // 8700 / 0.87 = 10000
    expect(calculateRequiredPrice(8700)).toBe(10000);
  });

  it("round-trips with calculateNetAmount within 1 unit", () => {
    for (const desired of [500, 1000, 2500, 12345, 99999]) {
      const price = calculateRequiredPrice(desired);
      const net = calculateNetAmount(price);
      expect(Math.abs(net - desired)).toBeLessThanOrEqual(1);
    }
  });
});

describe("FEE_LABELS", () => {
  it("exposes the labels used by the fee calculator UI", () => {
    expect(FEE_LABELS.paypal).toBe("8% aprox.");
    expect(FEE_LABELS.platform).toBe("5%");
    expect(FEE_LABELS.total).toBe("13%");
  });
});

import { describe, it, expect } from "vitest";
import {
  calculateNetAmount,
  calculateRequiredPrice,
  FEE_LABELS,
} from "../price-calculator";

// ONVO 3.8% + IVA 13% = 16.8% total. Net multiplier is 0.832.
describe("calculateNetAmount", () => {
  it("returns 0 for 0 input", () => {
    expect(calculateNetAmount(0)).toBe(0);
  });

  it("applies the 16.8% fee", () => {
    // 10000 * 0.832 = 8320
    expect(calculateNetAmount(10000)).toBe(8320);
  });

  it("rounds to integer", () => {
    // 1234 * 0.832 = 1026.688 → 1027
    expect(calculateNetAmount(1234)).toBe(1027);
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
    // 8320 / 0.832 = 10000
    expect(calculateRequiredPrice(8320)).toBe(10000);
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
    expect(FEE_LABELS.onvo).toBe("3.8%");
    expect(FEE_LABELS.iva).toBe("13%");
    expect(FEE_LABELS.total).toBe("16.8%");
  });
});

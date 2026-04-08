import { describe, it, expect } from "vitest";
import {
  formatAmountWithCommas,
  parseFormattedAmount,
} from "../format-amount-input";

describe("formatAmountWithCommas (integer mode)", () => {
  it("formats thousands", () => {
    expect(formatAmountWithCommas("1000")).toBe("1,000");
    expect(formatAmountWithCommas("1000000")).toBe("1,000,000");
  });

  it("strips non-digit characters", () => {
    expect(formatAmountWithCommas("12abc34")).toBe("1,234");
    expect(formatAmountWithCommas("$12,345.67")).toBe("1,234,567");
  });

  it("returns empty string for empty input", () => {
    expect(formatAmountWithCommas("")).toBe("");
  });

  it("re-formats already-formatted values", () => {
    expect(formatAmountWithCommas("1,234,567")).toBe("1,234,567");
  });
});

describe("formatAmountWithCommas (decimal mode)", () => {
  it("preserves decimals", () => {
    expect(formatAmountWithCommas("1234.56", true)).toBe("1,234.56");
  });

  it("trims to 2 decimal places", () => {
    expect(formatAmountWithCommas("1234.5678", true)).toBe("1,234.56");
  });

  it("handles trailing dot", () => {
    expect(formatAmountWithCommas("1234.", true)).toBe("1,234.");
  });
});

describe("parseFormattedAmount", () => {
  it("parses integer strings", () => {
    expect(parseFormattedAmount("1,234")).toBe(1234);
    expect(parseFormattedAmount("1,000,000")).toBe(1000000);
  });

  it("returns 0 for empty input", () => {
    expect(parseFormattedAmount("")).toBe(0);
    expect(parseFormattedAmount("abc")).toBe(0);
  });

  it("parses decimal strings when allowed", () => {
    expect(parseFormattedAmount("1,234.56", true)).toBeCloseTo(1234.56);
  });

  it("ignores decimals in integer mode", () => {
    expect(parseFormattedAmount("1,234.56", false)).toBe(123456);
  });
});

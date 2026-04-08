import { describe, it, expect } from "vitest";
import type { CartItem } from "@/lib/cart";
import {
  isGiftCard,
  isCustomSession,
  needsShipping,
  getShippingCost,
  getAvailableMethods,
  isNextDayDynamic,
  isInternational,
  formatColones,
  SHIPPING_COSTS,
} from "../shipping";

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 1,
    slug: "test-product",
    name: "Test",
    priceUsd: 1000,
    quantity: 1,
    image: "x.jpg",
    isReservation: false,
    ...overrides,
  } as CartItem;
}

describe("isGiftCard", () => {
  it("matches tattoo gift card slugs", () => {
    expect(isGiftCard(makeItem({ slug: "tattoo-gift-card-50" }))).toBe(true);
    expect(isGiftCard(makeItem({ slug: "tattoo-gift-card-100" }))).toBe(true);
  });

  it("ignores other items", () => {
    expect(isGiftCard(makeItem({ slug: "ttw-tee" }))).toBe(false);
  });
});

describe("isCustomSession", () => {
  it("matches the custom session slug exactly", () => {
    expect(isCustomSession(makeItem({ slug: "sesion-tattoo-custom" }))).toBe(true);
    expect(isCustomSession(makeItem({ slug: "sesion-tattoo-custom-x" }))).toBe(false);
  });
});

describe("needsShipping", () => {
  it("returns false for empty cart", () => {
    expect(needsShipping([])).toBe(false);
  });

  it("returns false for reservation-only cart", () => {
    expect(needsShipping([makeItem({ isReservation: true })])).toBe(false);
  });

  it("returns false for gift-card-only cart", () => {
    expect(needsShipping([makeItem({ slug: "tattoo-gift-card-50" })])).toBe(false);
  });

  it("returns false for custom session only", () => {
    expect(needsShipping([makeItem({ slug: "sesion-tattoo-custom" })])).toBe(false);
  });

  it("returns true when at least one physical item is present", () => {
    expect(
      needsShipping([
        makeItem({ slug: "tattoo-gift-card-50" }),
        makeItem({ slug: "ttw-tee" }),
      ]),
    ).toBe(true);
  });
});

describe("getShippingCost", () => {
  it("returns 0 for international", () => {
    expect(getShippingCost("INTERNATIONAL", "A_CONVENIR")).toBe(0);
  });

  it("returns GAM standard cost", () => {
    expect(getShippingCost("GAM", "STANDARD")).toBe(SHIPPING_COSTS.GAM.STANDARD);
  });

  it("returns GAM next-day cost", () => {
    expect(getShippingCost("GAM", "NEXT_DAY")).toBe(SHIPPING_COSTS.GAM.NEXT_DAY);
  });

  it("returns non-GAM standard cost for outside-GAM zones", () => {
    expect(getShippingCost("NON_GAM", "STANDARD")).toBe(
      SHIPPING_COSTS.NON_GAM.STANDARD,
    );
  });
});

describe("getAvailableMethods", () => {
  it("returns A_CONVENIR for international", () => {
    expect(getAvailableMethods("INTERNATIONAL")).toEqual(["A_CONVENIR"]);
  });

  it("returns both methods for GAM", () => {
    expect(getAvailableMethods("GAM")).toEqual(["STANDARD", "NEXT_DAY"]);
  });

  it("returns standard only for NON_GAM", () => {
    expect(getAvailableMethods("NON_GAM")).toEqual(["STANDARD"]);
  });
});

describe("isNextDayDynamic", () => {
  it("is true only for GAM next-day", () => {
    expect(isNextDayDynamic("GAM", "NEXT_DAY")).toBe(true);
    expect(isNextDayDynamic("GAM", "STANDARD")).toBe(false);
    expect(isNextDayDynamic("NON_GAM", "STANDARD")).toBe(false);
  });
});

describe("isInternational", () => {
  it("identifies international zone", () => {
    expect(isInternational("INTERNATIONAL")).toBe(true);
    expect(isInternational("GAM")).toBe(false);
    expect(isInternational("NON_GAM")).toBe(false);
  });
});

describe("formatColones", () => {
  it("formats with es-CR locale thousands separator", () => {
    // es-CR uses a narrow no-break space, not a comma. Use a regex that
    // tolerates either so the test stays portable across ICU versions.
    expect(formatColones(1000)).toMatch(/^₡1[\s,]000$/);
    expect(formatColones(0)).toBe("₡0");
  });
});

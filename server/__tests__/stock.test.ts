import { describe, it, expect } from "vitest";
import { getAvailableStock, adjustStock } from "../../shared/stock";
import type { Product } from "../../shared/schema";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    slug: "test-product",
    name: "Test Product",
    category: "Apparel",
    price: "25.00",
    description: "A test product",
    sizes: null,
    colors: null,
    sizeStock: null,
    colorStock: null,
    sizeColorStock: null,
    images: ["https://example.com/img.jpg"],
    sortOrder: 0,
    ...overrides,
  };
}

describe("getAvailableStock", () => {
  it("returns null when no stock tracking exists", () => {
    const product = makeProduct();
    expect(getAvailableStock(product)).toBeNull();
    expect(getAvailableStock(product, "M")).toBeNull();
    expect(getAvailableStock(product, undefined, "Black")).toBeNull();
  });

  it("returns size stock when sizeStock is defined", () => {
    const product = makeProduct({ sizeStock: { S: 5, M: 10, L: 0 } });
    expect(getAvailableStock(product, "S")).toBe(5);
    expect(getAvailableStock(product, "M")).toBe(10);
    expect(getAvailableStock(product, "L")).toBe(0);
  });

  it("returns null for unknown size", () => {
    const product = makeProduct({ sizeStock: { S: 5, M: 10 } });
    expect(getAvailableStock(product, "XXL")).toBeNull();
  });

  it("returns color stock when colorStock is defined", () => {
    const product = makeProduct({ colorStock: { Black: 3, White: 7 } });
    expect(getAvailableStock(product, undefined, "Black")).toBe(3);
    expect(getAvailableStock(product, undefined, "White")).toBe(7);
  });

  it("returns null for unknown color", () => {
    const product = makeProduct({ colorStock: { Black: 3 } });
    expect(getAvailableStock(product, undefined, "Red")).toBeNull();
  });

  it("prefers sizeColorStock over sizeStock when both size and color given", () => {
    const product = makeProduct({
      sizeStock: { M: 100 },
      sizeColorStock: { M: { Black: 2, White: 5 } },
    });
    expect(getAvailableStock(product, "M", "Black")).toBe(2);
    expect(getAvailableStock(product, "M", "White")).toBe(5);
  });

  it("falls back to sizeStock when sizeColorStock doesn't have the color", () => {
    const product = makeProduct({
      sizeStock: { M: 100 },
      sizeColorStock: { M: { Black: 2 } },
    });
    // "Red" not in sizeColorStock[M], but M exists in sizeStock
    expect(getAvailableStock(product, "M", "Red")).toBe(100);
  });

  it("returns null when stock fields exist but variant is not tracked", () => {
    const product = makeProduct({
      sizeStock: { S: 5 },
      colorStock: { Black: 3 },
    });
    // No size or color passed — no tracking applies
    expect(getAvailableStock(product)).toBeNull();
  });
});

describe("adjustStock", () => {
  it("deducts size stock correctly", () => {
    const product = makeProduct({ sizeStock: { M: 10 } });
    const updates = adjustStock(product, { size: "M", quantity: 3 }, -1);
    expect(updates.sizeStock).toEqual({ M: 7 });
  });

  it("restores size stock correctly", () => {
    const product = makeProduct({ sizeStock: { M: 7 } });
    const updates = adjustStock(product, { size: "M", quantity: 3 }, +1);
    expect(updates.sizeStock).toEqual({ M: 10 });
  });

  it("deducts sizeColorStock correctly", () => {
    const product = makeProduct({ sizeColorStock: { L: { Black: 5, White: 3 } } });
    const updates = adjustStock(product, { size: "L", color: "Black", quantity: 2 }, -1);
    expect(updates.sizeColorStock).toEqual({ L: { Black: 3, White: 3 } });
  });

  it("returns empty object when variant is not tracked", () => {
    const product = makeProduct();
    const updates = adjustStock(product, { size: "M", quantity: 1 }, -1);
    expect(Object.keys(updates)).toHaveLength(0);
  });
});

import { describe, it, expect } from "vitest";
import {
  insertProductSchema,
  insertInquirySchema,
  insertOrderSchema,
  paymentStatusSchema,
} from "../schema";

describe("insertProductSchema", () => {
  const validProduct = {
    slug: "test-tee",
    name: "Test Tee",
    category: "Apparel",
    price: 25.99,
    description: "A test product",
    images: ["https://example.com/img.jpg"],
  };

  it("accepts valid product", () => {
    const result = insertProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("rejects product with no images", () => {
    const result = insertProductSchema.safeParse({ ...validProduct, images: [] });
    expect(result.success).toBe(false);
  });

  it("rejects product with invalid image URL", () => {
    const result = insertProductSchema.safeParse({ ...validProduct, images: ["not-a-url"] });
    expect(result.success).toBe(false);
  });

  it("rejects product with zero price", () => {
    const result = insertProductSchema.safeParse({ ...validProduct, price: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects product with negative price", () => {
    const result = insertProductSchema.safeParse({ ...validProduct, price: -10 });
    expect(result.success).toBe(false);
  });

  it("coerces string price to number", () => {
    const result = insertProductSchema.safeParse({ ...validProduct, price: "19.99" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.price).toBe(19.99);
  });

  it("accepts valid stock fields", () => {
    const result = insertProductSchema.safeParse({
      ...validProduct,
      sizes: ["S", "M", "L"],
      sizeStock: { S: 5, M: 10, L: 0 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative stock values", () => {
    const result = insertProductSchema.safeParse({
      ...validProduct,
      sizeStock: { S: -1 },
    });
    expect(result.success).toBe(false);
  });
});

describe("insertInquirySchema", () => {
  it("accepts valid inquiry", () => {
    const result = insertInquirySchema.safeParse({
      name: "John",
      email: "john@example.com",
      message: "Hello",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = insertInquirySchema.safeParse({
      name: "John",
      email: "not-an-email",
      message: "Hello",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = insertInquirySchema.safeParse({
      name: "",
      email: "john@example.com",
      message: "Hello",
    });
    expect(result.success).toBe(false);
  });
});

describe("insertOrderSchema", () => {
  const validOrder = {
    customerName: "Maria",
    customerEmail: "maria@example.com",
    items: [{
      productId: 1,
      slug: "test",
      name: "Test",
      priceUsd: 2599,
      quantity: 1,
    }],
    paymentMethod: "sinpe" as const,
  };

  it("accepts valid order", () => {
    const result = insertOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it("rejects order with no items", () => {
    const result = insertOrderSchema.safeParse({ ...validOrder, items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects order with zero quantity", () => {
    const result = insertOrderSchema.safeParse({
      ...validOrder,
      items: [{ ...validOrder.items[0], quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid payment method", () => {
    const result = insertOrderSchema.safeParse({ ...validOrder, paymentMethod: "bitcoin" });
    expect(result.success).toBe(false);
  });
});

describe("paymentStatusSchema", () => {
  it("accepts valid statuses", () => {
    expect(paymentStatusSchema.safeParse("pending").success).toBe(true);
    expect(paymentStatusSchema.safeParse("proof_submitted").success).toBe(true);
    expect(paymentStatusSchema.safeParse("approved").success).toBe(true);
    expect(paymentStatusSchema.safeParse("rejected").success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(paymentStatusSchema.safeParse("cancelled").success).toBe(false);
    expect(paymentStatusSchema.safeParse("").success).toBe(false);
  });
});

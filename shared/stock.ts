import type { Product, OrderItem } from "./schema";

/**
 * Get available stock for a product variant.
 * Returns null if stock is not tracked (unlimited).
 */
export function getAvailableStock(
  product: Pick<Product, "sizeStock" | "colorStock" | "sizeColorStock">,
  size?: string,
  color?: string,
): number | null {
  // Most specific: size+color combination
  if (size && color && product.sizeColorStock) {
    const sizeMap = product.sizeColorStock[size];
    if (sizeMap && color in sizeMap) return sizeMap[color];
  }
  // Size-only stock
  if (size && product.sizeStock) {
    if (size in product.sizeStock) return product.sizeStock[size];
  }
  // Color-only stock
  if (color && product.colorStock) {
    if (color in product.colorStock) return product.colorStock[color];
  }
  // No stock tracking for this variant
  return null;
}

/**
 * Compute stock field updates for an order item (deduct or restore).
 * direction: -1 for deduction, +1 for restoration.
 */
export function adjustStock(
  product: Pick<Product, "sizeStock" | "colorStock" | "sizeColorStock">,
  item: Pick<OrderItem, "size" | "color" | "quantity">,
  direction: 1 | -1,
): Partial<Pick<Product, "sizeStock" | "colorStock" | "sizeColorStock">> {
  const updates: Partial<Pick<Product, "sizeStock" | "colorStock" | "sizeColorStock">> = {};
  const delta = item.quantity * direction;

  if (item.size && item.color && product.sizeColorStock) {
    const sizeMap = { ...product.sizeColorStock };
    if (sizeMap[item.size]) {
      sizeMap[item.size] = { ...sizeMap[item.size], [item.color]: (sizeMap[item.size][item.color] ?? 0) + delta };
      updates.sizeColorStock = sizeMap;
    }
  }
  if (item.size && product.sizeStock) {
    const stock = { ...product.sizeStock };
    if (item.size in stock) {
      stock[item.size] = (stock[item.size] ?? 0) + delta;
      updates.sizeStock = stock;
    }
  }
  if (item.color && product.colorStock) {
    const stock = { ...product.colorStock };
    if (item.color in stock) {
      stock[item.color] = (stock[item.color] ?? 0) + delta;
      updates.colorStock = stock;
    }
  }

  return updates;
}

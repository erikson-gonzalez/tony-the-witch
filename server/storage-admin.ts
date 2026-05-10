import { eq, asc, desc, max, sql, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  siteConfig,
  navCards,
  galleryWorks,
  products,
  adminUsers,
  orders,
  type SiteConfigData,
  type InsertNavCard,
  type InsertGalleryWork,
  type InsertProduct,
  type InsertOrder,
  type Order,
  type Product,
  type OrderItem,
  type PaymentStatus,
  auditLogs,
  type AuditLog,
  eclipticDebtConfig,
  eclipticPayments,
} from "../shared/schema";
import { DEFAULT_SITE_CONFIG } from "../shared/defaults";
import { getAvailableStock, adjustStock } from "../shared/stock";

// =============================================================================
// SITE CONFIG
// =============================================================================

export async function getSiteConfig(): Promise<SiteConfigData> {
  const [row] = await db.select().from(siteConfig).limit(1);
  if (!row?.data) return DEFAULT_SITE_CONFIG;
  return deepMerge(DEFAULT_SITE_CONFIG, row.data as Record<string, unknown>) as SiteConfigData;
}

export async function updateSiteConfig(
  patch: Partial<SiteConfigData>
): Promise<SiteConfigData> {
  const current = await getSiteConfig();
  const merged = deepMerge(current, patch) as SiteConfigData;

  const existing = await db.select().from(siteConfig).limit(1);
  if (existing.length === 0) {
    await db.insert(siteConfig).values({ data: merged });
    return merged;
  }

  await db
    .update(siteConfig)
    .set({ data: merged, updatedAt: new Date() })
    .where(eq(siteConfig.id, existing[0].id!));
  return merged;
}

export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const srcVal = source[key];
    if (srcVal !== undefined && srcVal !== null) {
      if (
        typeof srcVal === "object" &&
        !Array.isArray(srcVal) &&
        typeof target[key] === "object" &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        (result as Record<string, unknown>)[key as string] = deepMerge(
          target[key] as object,
          srcVal as object
        );
      } else {
        (result as Record<string, unknown>)[key as string] = srcVal;
      }
    }
  }
  return result;
}

// =============================================================================
// NAV CARDS
// =============================================================================

export async function listNavCards() {
  return db.select().from(navCards).orderBy(asc(navCards.sortOrder));
}

export async function createNavCard(input: InsertNavCard) {
  const [card] = await db.insert(navCards).values(input).returning();
  return card!;
}

export async function updateNavCard(id: number, input: Partial<InsertNavCard>) {
  const [card] = await db
    .update(navCards)
    .set(input)
    .where(eq(navCards.id, id))
    .returning();
  return card ?? null;
}

export async function deleteNavCard(id: number): Promise<boolean> {
  const result = await db.delete(navCards).where(eq(navCards.id, id));
  return (result.rowCount ?? 0) > 0;
}

// =============================================================================
// GALLERY WORKS
// =============================================================================

export async function listGalleryWorks() {
  return db.select().from(galleryWorks).orderBy(asc(galleryWorks.sortOrder));
}

export async function createGalleryWork(input: InsertGalleryWork) {
  const [work] = await db.insert(galleryWorks).values(input).returning();
  return work!;
}

const MAX_IMAGES_PER_CATEGORY = 18;

export async function createGalleryWorksBatch(
  items: Array<{ image: string; category: string }>
): Promise<Array<typeof galleryWorks.$inferSelect>> {
  const existing = await listGalleryWorks();
  const existingByCategory = existing.reduce((acc, w) => {
    acc[w.category] = (acc[w.category] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const byCategory = items.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  for (const [cat, add] of Object.entries(byCategory)) {
    const current = existingByCategory[cat] ?? 0;
    if (current + add > MAX_IMAGES_PER_CATEGORY) {
      throw new Error(
        `La categoría "${cat}" no puede tener más de ${MAX_IMAGES_PER_CATEGORY} imágenes. Actual: ${current}, intentas añadir: ${add}`
      );
    }
  }
  const [maxRow] = await db
    .select({ maxSort: max(galleryWorks.sortOrder) })
    .from(galleryWorks);
  let nextSort = (maxRow?.maxSort ?? 0) + 1;
  const values = items.map((item) => ({
    image: item.image,
    category: item.category,
    height: "medium" as const,
    sortOrder: nextSort++,
  }));
  const inserted = await db.insert(galleryWorks).values(values).returning();
  return inserted;
}

export async function updateGalleryWork(
  id: number,
  input: Partial<InsertGalleryWork>
) {
  const [work] = await db
    .update(galleryWorks)
    .set(input)
    .where(eq(galleryWorks.id, id))
    .returning();
  return work ?? null;
}

export async function deleteGalleryWork(id: number): Promise<boolean> {
  const result = await db.delete(galleryWorks).where(eq(galleryWorks.id, id));
  return (result.rowCount ?? 0) > 0;
}

// =============================================================================
// PRODUCTS
// =============================================================================

export async function listProducts() {
  return db.select().from(products).orderBy(asc(products.sortOrder));
}

export async function getProductById(id: number) {
  const [p] = await db.select().from(products).where(eq(products.id, id));
  return p ?? null;
}

export async function getProductBySlug(slug: string) {
  const [p] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug));
  return p ?? null;
}

export async function createProduct(input: InsertProduct) {
  const existing = await getProductBySlug(input.slug);
  if (existing) throw new Error("Product with this slug already exists");

  const inputTyped = input as {
    sizeStock?: Record<string, number>;
    colorStock?: Record<string, number>;
    sizeColorStock?: Record<string, Record<string, number>>;
  };
  const values = {
    ...input,
    price: String(input.price),
    images: [...input.images] as string[],
    sizes: input.sizes ? ([...input.sizes] as string[]) : undefined,
    colors: input.colors ? ([...input.colors] as string[]) : undefined,
    sizeStock: inputTyped.sizeStock ?? undefined,
    colorStock: inputTyped.colorStock ?? undefined,
    sizeColorStock: inputTyped.sizeColorStock ?? undefined,
  };
  const [product] = await db.insert(products).values(values).returning();
  return product!;
}

export async function updateProduct(id: number, input: Partial<InsertProduct>) {
  if (input.slug) {
    const existing = await getProductBySlug(input.slug);
    if (existing && existing.id !== id)
      throw new Error("Product with this slug already exists");
  }

  const inputTyped = input as {
    images?: string[];
    sizes?: string[];
    colors?: string[];
    sizeStock?: Record<string, number>;
    colorStock?: Record<string, number>;
    sizeColorStock?: Record<string, Record<string, number>>;
  };
  const { images, sizes, colors, sizeStock, colorStock, sizeColorStock, price, ...rest } = inputTyped as typeof inputTyped & { price?: number };
  const setValues = {
    ...rest,
    ...(price !== undefined && { price: String(price) }),
    ...(images !== undefined && images !== null && { images: [...images] as string[] }),
    ...(sizes !== undefined && sizes !== null && Array.isArray(sizes) && { sizes: [...sizes] as string[] }),
    ...(colors !== undefined && colors !== null && Array.isArray(colors) && { colors: [...colors] as string[] }),
    ...(sizeStock !== undefined && { sizeStock }),
    ...(colorStock !== undefined && { colorStock }),
    ...(sizeColorStock !== undefined && { sizeColorStock }),
  };

  const [product] = await db
    .update(products)
    .set(setValues)
    .where(eq(products.id, id))
    .returning();
  return product ?? null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const result = await db.delete(products).where(eq(products.id, id));
  return (result.rowCount ?? 0) > 0;
}

// =============================================================================
// AUTH - Admin users
// =============================================================================

export async function getAdminUserByUsername(username: string) {
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username));
  return user ?? null;
}

export async function getAdminUserById(id: number) {
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id));
  return user ?? null;
}

export async function createAdminUser(username: string, passwordHash: string) {
  const [user] = await db
    .insert(adminUsers)
    .values({ username, passwordHash })
    .returning();
  return user!;
}

// =============================================================================
// ORDERS
// =============================================================================

/**
 * Ensure the order_number_seq sequence exists, seeded from current max order.
 * Called once on first order creation; idempotent.
 */
let sequenceInitialized = false;

async function ensureOrderSequence(): Promise<void> {
  if (sequenceInitialized) return;
  // Empty orders table → MAX is NULL. setval requires value >= 1.
  // Use is_called=false so the first nextval() returns 1 cleanly.
  await db.execute(sql`
    DO $$
    DECLARE
      max_num INT;
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'order_number_seq') THEN
        CREATE SEQUENCE order_number_seq;
        SELECT MAX(CAST(REPLACE(order_number, 'TTW-', '') AS INT))
          INTO max_num FROM orders;
        IF max_num IS NULL OR max_num < 1 THEN
          PERFORM setval('order_number_seq', 1, false);
        ELSE
          PERFORM setval('order_number_seq', max_num, true);
        END IF;
      END IF;
    END
    $$;
  `);
  sequenceInitialized = true;
}

/** Get next order number using a PostgreSQL sequence (atomic, no race conditions). */
export async function getNextOrderNumber(): Promise<string> {
  await ensureOrderSequence();
  const result = await db.execute(sql`SELECT nextval('order_number_seq') as num`);
  const row = result.rows[0] as { num: string };
  const num = Number(row.num);
  return `TTW-${String(num).padStart(4, "0")}`;
}

// Re-export for routes.ts convenience
export { getAvailableStock } from "../shared/stock";

export async function createOrder(
  input: InsertOrder & {
    subtotalUsd: number;
    shippingCrc: number;
    totalUsd: number;
    totalCrc: number;
    usdToCrcRate: number;
  },
): Promise<Order> {
  // For onvo_card: stock is held but NOT decremented at order create.
  // The webhook handler decrements on `succeeded` to avoid holding inventory
  // for unconfirmed cards. We still validate availability here so the customer
  // doesn't enter the SDK flow on an out-of-stock item.
  const decrementStock = input.paymentMethod !== "onvo_card";

  return await db.transaction(async (trx) => {
    // 1. Validate and (for SINPE) deduct stock for non-reservation items
    for (const item of input.items) {
      if (item.isReservation) continue;

      const [product] = await trx
        .select()
        .from(products)
        .where(eq(products.id, item.productId));
      if (!product) throw new Error(`Producto no encontrado: "${item.name}"`);

      const available = getAvailableStock(product, item.size, item.color);
      if (available !== null && available < item.quantity) {
        throw new StockError(
          `Stock insuficiente para "${item.name}"`,
          item.productId,
          available,
        );
      }

      if (decrementStock) {
        const stockUpdates = adjustStock(product, item, -1);
        if (Object.keys(stockUpdates).length > 0) {
          await trx
            .update(products)
            .set(stockUpdates)
            .where(eq(products.id, item.productId));
        }
      }
    }

    // 2. Generate order number (sequence is atomic, safe outside transaction)
    const orderNumber = await getNextOrderNumber();

    // 3. Insert order
    const [order] = await trx
      .insert(orders)
      .values({
        orderNumber,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone ?? null,
        customerNote: input.customerNote ?? null,
        items: input.items,
        subtotalUsd: input.subtotalUsd,
        shippingCrc: input.shippingCrc,
        totalUsd: input.totalUsd,
        totalCrc: input.totalCrc,
        usdToCrcRate: input.usdToCrcRate,
        shippingAddress: input.shippingAddress ?? null,
        shippingZone: input.shippingZone ?? null,
        shippingMethod: input.shippingMethod ?? null,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === "onvo_card" ? "awaiting_payment" : "pending",
      })
      .returning();

    return order!;
  });
}

export class StockError extends Error {
  constructor(
    message: string,
    public productId: number,
    public available: number,
  ) {
    super(message);
    this.name = "StockError";
  }
}

export async function getOrderById(id: number): Promise<Order | null> {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  return order ?? null;
}

export async function getOrderByNumber(
  orderNumber: string,
): Promise<Order | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber));
  return order ?? null;
}

export async function listOrders(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: Order[]; total: number }> {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;
  const offset = (page - 1) * limit;

  let query = db.select().from(orders);
  let countQuery = db.select({ count: sql<number>`count(*)` }).from(orders);

  if (filters?.status) {
    if (filters.status === "pending") {
      query = query.where(
        inArray(orders.paymentStatus, [
        "pending",
        "proof_submitted",
        "awaiting_payment",
        "processing",
      ]),
      ) as typeof query;
      countQuery = countQuery.where(
        inArray(orders.paymentStatus, [
        "pending",
        "proof_submitted",
        "awaiting_payment",
        "processing",
      ]),
      ) as typeof countQuery;
    } else {
      query = query.where(
        eq(orders.paymentStatus, filters.status as PaymentStatus),
      ) as typeof query;
      countQuery = countQuery.where(
        eq(orders.paymentStatus, filters.status as PaymentStatus),
      ) as typeof countQuery;
    }
  }

  const [countRow] = await countQuery;
  const total = Number(countRow?.count ?? 0);
  const items = await query
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  return { orders: items, total };
}

export async function updateOrderProof(
  id: number,
  proofImageUrl: string,
  sinpeTransactionRef?: string,
): Promise<Order | null> {
  const [order] = await db
    .update(orders)
    .set({
      proofImageUrl,
      sinpeTransactionRef: sinpeTransactionRef ?? null,
      paymentStatus: "proof_submitted",
      reviewedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
    .returning();
  return order ?? null;
}

export async function approveOrder(
  id: number,
  adminNote?: string,
): Promise<Order | null> {
  const [order] = await db
    .update(orders)
    .set({
      paymentStatus: "approved",
      adminNote: adminNote ?? null,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
    .returning();
  return order ?? null;
}

export async function rejectOrder(
  id: number,
  adminNote: string,
): Promise<Order | null> {
  return await db.transaction(async (trx) => {
    const [order] = await trx
      .update(orders)
      .set({
        paymentStatus: "rejected",
        adminNote,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    if (!order) return null;

    // Restore stock for non-reservation items
    for (const item of order.items) {
      if (item.isReservation) continue;

      const [product] = await trx
        .select()
        .from(products)
        .where(eq(products.id, item.productId));
      if (!product) continue;

      const stockUpdates = adjustStock(product, item, +1);
      if (Object.keys(stockUpdates).length > 0) {
        await trx
          .update(products)
          .set(stockUpdates)
          .where(eq(products.id, item.productId));
      }
    }

    return order;
  });
}

export async function getPendingOrderCount(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(
      inArray(orders.paymentStatus, [
        "pending",
        "proof_submitted",
        "awaiting_payment",
        "processing",
      ]),
    );
  return Number(row?.count ?? 0);
}

// =============================================================================
// AUDIT LOGS
// =============================================================================

export async function logAdminAction(
  userId: number,
  action: string,
  entityType: string,
  entityId?: string | number,
  details?: unknown,
) {
  await db.insert(auditLogs).values({
    userId,
    action,
    entityType,
    entityId: entityId != null ? String(entityId) : null,
    details: details ?? null,
  });
}

export async function listAuditLogs(filters?: {
  page?: number;
  limit?: number;
}): Promise<{ logs: AuditLog[]; total: number }> {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 50;
  const offset = (page - 1) * limit;

  const [countRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs);
  const total = Number(countRow?.count ?? 0);

  const logs = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return { logs, total };
}

// =============================================================================
// ANALYTICS
// =============================================================================

export async function getAnalytics(periodDays?: number) {
  let dateCond = sql`true`;
  if (periodDays) {
    const since = new Date();
    since.setDate(since.getDate() - periodDays);
    dateCond = sql`${orders.createdAt} >= ${since}`;
  }

  const [revenueRow] = await db
    .select({
      totalRevenue: sql<number>`coalesce(sum(${orders.totalUsd}), 0)`,
      totalOrders: sql<number>`count(*)`,
      avgOrderValue: sql<number>`coalesce(avg(${orders.totalUsd}), 0)`,
    })
    .from(orders)
    .where(sql`${orders.paymentStatus} = 'approved' AND ${dateCond}`);

  const [allOrdersRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(dateCond);

  const statusRows = await db
    .select({
      status: orders.paymentStatus,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(dateCond)
    .groupBy(orders.paymentStatus);

  const methodRows = await db
    .select({
      method: orders.paymentMethod,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(dateCond)
    .groupBy(orders.paymentMethod);

  return {
    totalRevenue: Number(revenueRow?.totalRevenue ?? 0),
    totalOrders: Number(allOrdersRow?.count ?? 0),
    avgOrderValue: Math.round(Number(revenueRow?.avgOrderValue ?? 0)),
    ordersByStatus: statusRows.reduce(
      (acc, r) => ({ ...acc, [r.status]: Number(r.count) }),
      {} as Record<string, number>,
    ),
    ordersByPaymentMethod: methodRows.reduce(
      (acc, r) => ({ ...acc, [r.method]: Number(r.count) }),
      {} as Record<string, number>,
    ),
  };
}

export async function getTopProducts(limit: number) {
  const approvedOrders = await db
    .select({ items: orders.items })
    .from(orders)
    .where(sql`${orders.paymentStatus} = 'approved'`);

  const productMap = new Map<
    number,
    { productId: number; name: string; unitsSold: number; revenue: number }
  >();

  for (const order of approvedOrders) {
    const items = order.items as Array<{
      productId: number;
      name: string;
      priceUsd: number;
      quantity: number;
    }>;
    for (const item of items) {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenue += item.priceUsd * item.quantity;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          name: item.name,
          unitsSold: item.quantity,
          revenue: item.priceUsd * item.quantity,
        });
      }
    }
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// =============================================================================
// ECLIPTIC DEBT
// =============================================================================

export async function getEclipticDebtStatus() {
  const [config] = await db.select().from(eclipticDebtConfig).limit(1);
  const [paymentsSum] = await db
    .select({ total: sql<number>`coalesce(sum(${eclipticPayments.amount}), 0)` })
    .from(eclipticPayments);

  const paymentsList = await db
    .select()
    .from(eclipticPayments)
    .orderBy(desc(eclipticPayments.paidAt));

  const totalDebt = config?.totalDebt ?? 0;
  const totalPaid = Number(paymentsSum?.total ?? 0);

  return {
    totalDebt,
    totalPaid,
    remaining: totalDebt - totalPaid,
    notes: config?.notes ?? null,
    payments: paymentsList,
  };
}

export async function updateEclipticDebtConfig(totalDebt: number, notes?: string) {
  const [existing] = await db.select().from(eclipticDebtConfig).limit(1);
  if (existing) {
    const [row] = await db
      .update(eclipticDebtConfig)
      .set({ totalDebt, notes: notes ?? null, updatedAt: new Date() })
      .where(eq(eclipticDebtConfig.id, existing.id))
      .returning();
    return row!;
  }
  const [row] = await db
    .insert(eclipticDebtConfig)
    .values({ totalDebt, notes: notes ?? null })
    .returning();
  return row!;
}

export async function addEclipticPayment(amount: number, description: string, paidAt: Date) {
  const [payment] = await db
    .insert(eclipticPayments)
    .values({ amount, description, paidAt })
    .returning();
  return payment!;
}

export async function deleteEclipticPayment(id: number): Promise<boolean> {
  const result = await db.delete(eclipticPayments).where(eq(eclipticPayments.id, id));
  return (result.rowCount ?? 0) > 0;
}

import { eq, asc, max } from "drizzle-orm";
import { db } from "./db";
import {
  siteConfig,
  navCards,
  galleryWorks,
  products,
  adminUsers,
  type SiteConfigData,
  type InsertNavCard,
  type InsertGalleryWork,
  type InsertProduct,
} from "../shared/schema";
import { DEFAULT_SITE_CONFIG } from "../shared/defaults";

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
  const { images, sizes, colors, sizeStock, colorStock, sizeColorStock, ...rest } = inputTyped;
  const setValues = {
    ...rest,
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

export async function createAdminUser(username: string, passwordHash: string) {
  const [user] = await db
    .insert(adminUsers)
    .values({ username, passwordHash })
    .returning();
  return user!;
}

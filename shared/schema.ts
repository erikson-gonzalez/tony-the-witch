import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  real,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =============================================================================
// INQUIRIES (Contact form)
// =============================================================================

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  tattooIdea: text("tattoo_idea"),
  placement: text("placement"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInquirySchema = createInsertSchema(inquiries)
  .omit({
    id: true,
    createdAt: true,
    isRead: true,
  })
  .extend({
    email: z.string().email("Email inválido"),
    name: z.string().min(1).max(200),
    message: z.string().min(1).max(5000),
    tattooIdea: z.string().max(2000).nullish(),
    placement: z.string().max(500).nullish(),
  });

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

// =============================================================================
// SITE CONFIG (hero, footer, contact, meta, etc.) - single row, JSONB
// =============================================================================

export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  data: jsonb("data").$type<SiteConfigData>().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const siteConfigDataSchema = z.object({
  hero: z.object({
    videoUrl: z.string(),
    logoUrl: z.string(),
    title: z.string(),
  }),
  artist: z.object({
    imageUrl: z.string(),
    badgeText: z.string(),
    bio: z.string().optional(),
    bioEs: z.string().optional(),
    bioEn: z.string().optional(),
  }),
  footer: z.object({
    imageUrl: z.string(),
    ctaText: z.string(),
    whatsappUrl: z.string(),
    brandText: z.string(),
    copyrightText: z.string(),
    eclipticUrl: z.string(),
  }),
  booking: z.object({
    subtitle: z.string(),
    title: z.string(),
    description: z.string(),
  }),
  contact: z.object({
    whatsappUrl: z.string(),
    instagramUrl: z.string(),
  }),
  meta: z.object({
    siteTitle: z.string(),
    siteDescription: z.string(),
  }),
  reservation: z.object({
    name: z.string(),
    price: z.number(),
    imageUrl: z.string(),
  }),
  tattooSession: z.object({
    name: z.string(),
    imageUrl: z.string(),
    description: z.string().optional(),
    descriptionEs: z.string().optional(),
    descriptionEn: z.string().optional(),
  }).optional(),
  gallery: z.object({
    categories: z.array(z.string()),
    instagramUrl: z.string(),
    subtitle: z.string(),
    title: z.string(),
    viewMoreText: z.string(),
  }),
  shop: z.object({
    title: z.string(),
    categories: z.array(z.string()),
  }),
  pricing: z.object({
    usdToCrc: z.number().min(1),
  }).optional(),
});

export type SiteConfigData = z.infer<typeof siteConfigDataSchema>;

// =============================================================================
// NAV CARDS (Home page cards)
// =============================================================================

export const navCards = pgTable("nav_cards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  href: text("href").notNull(),
  external: boolean("external").default(false),
  image: text("image").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const insertNavCardSchema = createInsertSchema(navCards).omit({
  id: true,
});
export const updateNavCardSchema = insertNavCardSchema.partial();

export type NavCard = typeof navCards.$inferSelect;
export type InsertNavCard = z.infer<typeof insertNavCardSchema>;

// =============================================================================
// GALLERY WORKS
// =============================================================================

export const galleryWorks = pgTable("gallery_works", {
  id: serial("id").primaryKey(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  height: text("height").$type<"short" | "medium" | "tall">().default("medium"),
  sortOrder: integer("sort_order").default(0),
});

export const galleryHeightSchema = z.enum(["short", "medium", "tall"]);
export const insertGalleryWorkSchema = createInsertSchema(galleryWorks)
  .omit({ id: true })
  .extend({ height: galleryHeightSchema.optional().nullable() });
export const updateGalleryWorkSchema = insertGalleryWorkSchema.partial();

export type GalleryWork = typeof galleryWorks.$inferSelect;
export type InsertGalleryWork = z.infer<typeof insertGalleryWorkSchema>;

// =============================================================================
// PRODUCTS
// =============================================================================

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  description: text("description").notNull(),
  sizes: jsonb("sizes").$type<string[]>(),
  sizeStock: jsonb("size_stock").$type<Record<string, number>>(),
  sizeColorStock: jsonb("size_color_stock").$type<Record<string, Record<string, number>>>(),
  colors: jsonb("colors").$type<string[]>(),
  colorStock: jsonb("color_stock").$type<Record<string, number>>(),
  images: jsonb("images").$type<string[]>().notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});
export const updateProductSchema = insertProductSchema.partial();

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// =============================================================================
// ADMIN USERS (for auth)
// =============================================================================

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export type AdminUser = typeof adminUsers.$inferSelect;

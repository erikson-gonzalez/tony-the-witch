import type { Express, Response } from "express";
import { z } from "zod";
import passport from "passport";
import {
  publicContentApi,
  authApi,
  configApi,
  navCardsApi,
  galleryApi,
  productsApi,
} from "../shared/admin-routes";
import {
  getSiteConfig,
  updateSiteConfig,
  deepMerge,
  listNavCards,
  createNavCard,
  updateNavCard,
  deleteNavCard,
  listGalleryWorks,
  createGalleryWork,
  createGalleryWorksBatch,
  updateGalleryWork,
  deleteGalleryWork,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./storage-admin";
import { requireAdmin } from "./auth";
import { asc } from "drizzle-orm";
import { DEFAULT_SITE_CONFIG } from "../shared/defaults";
import { siteConfig, navCards, galleryWorks, products } from "../shared/schema";
import { db } from "./db";

// -----------------------------------------------------------------------------
// Public content (no auth)
// -----------------------------------------------------------------------------

export function registerPublicContentRoutes(app: Express) {
  app.get(publicContentApi.getContent.path, async (_req, res) => {
    try {
      const [configRow] = await db.select().from(siteConfig).limit(1);
      const config = configRow?.data
        ? deepMerge(DEFAULT_SITE_CONFIG, configRow.data as Record<string, unknown>)
        : DEFAULT_SITE_CONFIG;

      const dbNavCards = await db.select().from(navCards).orderBy(asc(navCards.sortOrder));
      const dbGallery = await db.select().from(galleryWorks).orderBy(asc(galleryWorks.sortOrder));
      const dbProducts = await db.select().from(products).orderBy(asc(products.sortOrder));

      // If DB is empty, use defaults from constants (nav cards, gallery, products)
      const navCardsData =
        dbNavCards.length > 0
          ? dbNavCards.map((c) => ({
              id: c.id!,
              title: c.title,
              subtitle: c.subtitle,
              href: c.href,
              external: c.external ?? false,
              image: c.image,
              sortOrder: c.sortOrder ?? 0,
            }))
          : getDefaultNavCards();

      const galleryData =
        dbGallery.length > 0
          ? dbGallery.map((w) => ({
              id: w.id!,
              image: w.image,
              category: w.category,
              height: (w.height ?? "medium") as "short" | "medium" | "tall",
              sortOrder: w.sortOrder ?? 0,
            }))
          : getDefaultGalleryWorks();

      const productsData =
        dbProducts.length > 0
          ? dbProducts.map((p) => ({
              id: p.id!,
              slug: p.slug,
              name: p.name,
              category: p.category,
              price: p.price,
              description: p.description,
              sizes: p.sizes ?? undefined,
              colors: p.colors ?? undefined,
              images: p.images,
              sortOrder: p.sortOrder ?? 0,
            }))
          : getDefaultProducts();

      res.json({
        config,
        navCards: navCardsData,
        galleryWorks: galleryData,
        products: productsData,
      });
    } catch (err) {
      console.error("GET /api/content:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}

// Defaults when DB tables are empty (match current client constants)
function getDefaultNavCards() {
  const defaults = [
    { id: 1, title: "View Portfolio", subtitle: "Selected Works", href: "/portfolio", external: false, image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=800&auto=format&fit=crop", sortOrder: 0 },
    { id: 2, title: "Shop", subtitle: "Merch & Prints", href: "/shop", external: false, image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=800&auto=format&fit=crop", sortOrder: 1 },
    { id: 3, title: "Contact", subtitle: "WhatsApp", href: "https://wa.me/50671280996", external: true, image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=800&auto=format&fit=crop", sortOrder: 2 },
    { id: 4, title: "Instagram", subtitle: "@tonythewitch", href: "https://instagram.com/tonythewitch", external: true, image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=800&auto=format&fit=crop", sortOrder: 3 },
  ];
  return defaults;
}

function getDefaultGalleryWorks() {
  const defaults = [
    { id: 1, image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=1200&auto=format&fit=crop", category: "Tatuajes", height: "tall" as const, sortOrder: 0 },
    { id: 2, image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=1200&auto=format&fit=crop", category: "Pinturas", height: "short" as const, sortOrder: 1 },
    { id: 3, image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=1200&auto=format&fit=crop", category: "Cinematografía", height: "medium" as const, sortOrder: 2 },
  ];
  return defaults;
}

function getDefaultProducts() {
  const defaults = [
    { id: 1, slug: "ttw-black-tee", name: "TTW Black Tee", category: "Apparel", price: 35, description: "Premium heavyweight cotton tee.", sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "Charcoal"], images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop"], sortOrder: 0 },
  ];
  return defaults;
}

// -----------------------------------------------------------------------------
// Auth routes
// -----------------------------------------------------------------------------

export function registerAuthRoutes(app: Express) {
  app.post(authApi.login.path, (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false) => {
      if (err) return res.status(500).json({ message: "Internal server error" });
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      req.login(user, (loginErr) => {
        if (loginErr) return res.status(500).json({ message: "Internal server error" });
        res.json({ success: true, username: (user as { username: string }).username });
      });
    })(req, res, next);
  });

  app.post(authApi.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Internal server error" });
      res.json({ success: true });
    });
  });

  app.get(authApi.me.path, (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return res.json({ username: (req.user as { username: string }).username, authenticated: true });
    }
    res.status(401).json({ message: "Unauthorized" });
  });
}

// -----------------------------------------------------------------------------
// Protected admin routes
// -----------------------------------------------------------------------------

const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const ALLOWED_VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

function validateConfigMedia(input: Record<string, unknown>): string | null {
  const hero = input.hero as { videoUrl?: string; logoUrl?: string } | undefined;
  const footer = input.footer as { imageUrl?: string } | undefined;

  const checkDataUrl = (
    url: string | undefined,
    allowed: string[],
    label: string,
    hint: string
  ) => {
    if (!url || !url.startsWith("data:")) return null;
    const match = url.match(/^data:([^;]+);/);
    const mime = match?.[1]?.toLowerCase();
    if (!mime || !allowed.includes(mime)) {
      return `${label}: ${hint}`;
    }
    return null;
  };

  const err =
    checkDataUrl(hero?.videoUrl, ALLOWED_VIDEO_MIMES, "Video hero", "solo videos (MP4, WebM, OGG)") ??
    checkDataUrl(hero?.logoUrl, ALLOWED_IMAGE_MIMES, "Logo hero", "solo imágenes (JPEG, PNG, WebP, GIF, SVG)") ??
    checkDataUrl(footer?.imageUrl, ALLOWED_IMAGE_MIMES, "Imagen footer", "solo imágenes (JPEG, PNG, WebP, GIF, SVG)");
  return err ?? null;
}

function handleZodError(err: unknown, res: Response): boolean {
  if (err instanceof z.ZodError) {
    res.status(400).json({
      message: err.errors[0]?.message ?? "Validation error",
      field: err.errors[0]?.path?.join("."),
    });
    return true;
  }
  return false;
}

export function registerAdminRoutes(app: Express) {
  const protectedRouter = app;
  const auth = [requireAdmin];

  // Config
  protectedRouter.get(configApi.get.path, ...auth, async (_req, res) => {
    try {
      const data = await getSiteConfig();
      res.json({ data });
    } catch (err) {
      console.error("GET /api/admin/config:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  protectedRouter.put(configApi.update.path, ...auth, async (req, res) => {
    try {
      const input = configApi.update.input.parse(req.body);
      const mediaError = validateConfigMedia(input);
      if (mediaError) {
        return res.status(400).json({ message: mediaError });
      }
      const data = await updateSiteConfig(input);
      res.json({ data });
    } catch (err) {
      if (handleZodError(err, res)) return;
      console.error("PUT /api/admin/config:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Nav cards
  protectedRouter.get(navCardsApi.list.path, ...auth, async (_req, res) => {
    try {
      const items = await listNavCards();
      res.json(items.map((c) => ({ ...c, sortOrder: c.sortOrder ?? 0 })));
    } catch (err) {
      console.error("GET /api/admin/nav-cards:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  protectedRouter.post(navCardsApi.create.path, ...auth, async (req, res) => {
    try {
      const input = navCardsApi.create.input.parse(req.body);
      const card = await createNavCard(input);
      res.status(201).json({ ...card, sortOrder: card.sortOrder ?? 0 });
    } catch (err) {
      if (handleZodError(err, res)) return;
      console.error("POST /api/admin/nav-cards:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  protectedRouter.put("/api/admin/nav-cards/:id", ...auth, async (req, res) => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam ?? "", 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const input = navCardsApi.update.input.parse(req.body);
      const card = await updateNavCard(id, input);
      if (!card) return res.status(404).json({ message: "Not found" });
      res.json({ ...card, sortOrder: card.sortOrder ?? 0 });
    } catch (err) {
      if (handleZodError(err, res)) return;
      console.error("PUT /api/admin/nav-cards/:id:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  protectedRouter.delete("/api/admin/nav-cards/:id", ...auth, async (req, res) => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam ?? "", 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const deleted = await deleteNavCard(id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.status(204).send();
    } catch (err) {
      console.error("DELETE /api/admin/nav-cards/:id:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Gallery
  protectedRouter.get(galleryApi.list.path, ...auth, async (_req, res) => {
    try {
      const items = await listGalleryWorks();
      res.json(items.map((w) => ({ ...w, sortOrder: w.sortOrder ?? 0 })));
    } catch (err) {
      console.error("GET /api/admin/gallery:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  protectedRouter.post(galleryApi.create.path, ...auth, async (req, res) => {
    try {
      const input = galleryApi.create.input.parse(req.body);
      const work = await createGalleryWork(input);
      res.status(201).json({ ...work, sortOrder: work.sortOrder ?? 0 });
    } catch (err) {
      if (handleZodError(err, res)) return;
      console.error("POST /api/admin/gallery:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  protectedRouter.post(galleryApi.createBatch.path, ...auth, async (req, res) => {
    try {
      const input = galleryApi.createBatch.input.parse(req.body);
      const works = await createGalleryWorksBatch(input.items);
      res.status(201).json(works.map((w) => ({ ...w, sortOrder: w.sortOrder ?? 0 })));
    } catch (err) {
      if (handleZodError(err, res)) return;
      if (err instanceof Error && err.message.includes("no puede tener más")) {
        return res.status(400).json({ message: err.message });
      }
      console.error("POST /api/admin/gallery/batch:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  protectedRouter.put("/api/admin/gallery/:id", ...auth, async (req, res) => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam ?? "", 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const input = galleryApi.update.input.parse(req.body);
      const work = await updateGalleryWork(id, input);
      if (!work) return res.status(404).json({ message: "Not found" });
      res.json({ ...work, sortOrder: work.sortOrder ?? 0 });
    } catch (err) {
      if (handleZodError(err, res)) return;
      console.error("PUT /api/admin/gallery/:id:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  protectedRouter.delete("/api/admin/gallery/:id", ...auth, async (req, res) => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam ?? "", 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const deleted = await deleteGalleryWork(id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.status(204).send();
    } catch (err) {
      console.error("DELETE /api/admin/gallery/:id:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Products
  protectedRouter.get(productsApi.list.path, ...auth, async (_req, res) => {
    try {
      const items = await listProducts();
      res.json(items.map((p) => ({ ...p, sortOrder: p.sortOrder ?? 0 })));
    } catch (err) {
      console.error("GET /api/admin/products:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  protectedRouter.post(productsApi.create.path, ...auth, async (req, res) => {
    try {
      const input = productsApi.create.input.parse(req.body);
      const product = await createProduct(input);
      res.status(201).json({ ...product, sortOrder: product.sortOrder ?? 0 });
    } catch (err) {
      if (handleZodError(err, res)) return;
      if (err instanceof Error && err.message.includes("already exists")) {
        return res.status(409).json({ message: err.message });
      }
      console.error("POST /api/admin/products:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  protectedRouter.put("/api/admin/products/:id", ...auth, async (req, res) => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam ?? "", 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const input = productsApi.update.input.parse(req.body);
      const product = await updateProduct(id, input);
      if (!product) return res.status(404).json({ message: "Not found" });
      res.json({ ...product, sortOrder: product.sortOrder ?? 0 });
    } catch (err) {
      if (handleZodError(err, res)) return;
      if (err instanceof Error && err.message.includes("already exists")) {
        return res.status(409).json({ message: err.message });
      }
      console.error("PUT /api/admin/products/:id:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  protectedRouter.delete("/api/admin/products/:id", ...auth, async (req, res) => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam ?? "", 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const deleted = await deleteProduct(id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.status(204).send();
    } catch (err) {
      console.error("DELETE /api/admin/products/:id:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}

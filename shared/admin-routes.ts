import { z } from "zod";
import {
  siteConfigDataSchema,
  insertNavCardSchema,
  updateNavCardSchema,
  insertGalleryWorkSchema,
  updateGalleryWorkSchema,
  insertProductSchema,
  updateProductSchema,
  type SiteConfigData,
  type NavCard,
  type GalleryWork,
  type Product,
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.literal("Unauthorized"),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// =============================================================================
// PUBLIC CONTENT API (no auth - for frontend consumption)
// =============================================================================

export const publicContentApi = {
  getContent: {
    method: "GET" as const,
    path: "/api/content" as const,
    responses: {
      200: z.object({
        config: siteConfigDataSchema,
        navCards: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            subtitle: z.string(),
            href: z.string(),
            external: z.boolean(),
            image: z.string(),
            sortOrder: z.number(),
          })
        ),
        galleryWorks: z.array(
          z.object({
            id: z.number(),
            image: z.string(),
            category: z.string(),
            height: z.enum(["short", "medium", "tall"]),
            sortOrder: z.number(),
          })
        ),
        products: z.array(
          z.object({
            id: z.number(),
            slug: z.string(),
            name: z.string(),
            category: z.string(),
            price: z.number(),
            description: z.string(),
            sizes: z.array(z.string()).optional(),
            colors: z.array(z.string()).optional(),
            images: z.array(z.string()),
            sortOrder: z.number(),
          })
        ),
      }),
      500: errorSchemas.internal,
    },
  },
};

export type PublicContentResponse = z.infer<
  (typeof publicContentApi.getContent.responses)[200]
>;

// =============================================================================
// AUTH
// =============================================================================

export const authApi = {
  login: {
    method: "POST" as const,
    path: "/api/admin/auth/login" as const,
    input: z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }),
    responses: {
      200: z.object({ success: z.literal(true), username: z.string() }),
      401: errorSchemas.unauthorized,
      400: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
  logout: {
    method: "POST" as const,
    path: "/api/admin/auth/logout" as const,
    responses: {
      200: z.object({ success: z.literal(true) }),
      500: errorSchemas.internal,
    },
  },
  me: {
    method: "GET" as const,
    path: "/api/admin/auth/me" as const,
    responses: {
      200: z.object({ username: z.string(), authenticated: z.literal(true) }),
      401: errorSchemas.unauthorized,
      500: errorSchemas.internal,
    },
  },
};

// =============================================================================
// SITE CONFIG (admin)
// =============================================================================

export const configApi = {
  get: {
    method: "GET" as const,
    path: "/api/admin/config" as const,
    responses: {
      200: z.object({ data: siteConfigDataSchema }),
      500: errorSchemas.internal,
    },
  },
  update: {
    method: "PUT" as const,
    path: "/api/admin/config" as const,
    input: siteConfigDataSchema.partial(),
    responses: {
      200: z.object({ data: siteConfigDataSchema }),
      400: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
};

// =============================================================================
// NAV CARDS (admin)
// =============================================================================

export const navCardsApi = {
  list: {
    method: "GET" as const,
    path: "/api/admin/nav-cards" as const,
    responses: {
      200: z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          subtitle: z.string(),
          href: z.string(),
          external: z.boolean(),
          image: z.string(),
          sortOrder: z.number(),
        })
      ),
      500: errorSchemas.internal,
    },
  },
  create: {
    method: "POST" as const,
    path: "/api/admin/nav-cards" as const,
    input: insertNavCardSchema,
    responses: {
      201: z.object({
        id: z.number(),
        title: z.string(),
        subtitle: z.string(),
        href: z.string(),
        external: z.boolean(),
        image: z.string(),
        sortOrder: z.number(),
      }),
      400: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
  update: {
    method: "PUT" as const,
    path: "/api/admin/nav-cards/:id" as const,
    input: updateNavCardSchema,
    responses: {
      200: z.object({
        id: z.number(),
        title: z.string(),
        subtitle: z.string(),
        href: z.string(),
        external: z.boolean(),
        image: z.string(),
        sortOrder: z.number(),
      }),
      400: errorSchemas.validation,
      404: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
  delete: {
    method: "DELETE" as const,
    path: "/api/admin/nav-cards/:id" as const,
    responses: {
      204: z.undefined(),
      404: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
};

// =============================================================================
// GALLERY WORKS (admin)
// =============================================================================

export const galleryApi = {
  list: {
    method: "GET" as const,
    path: "/api/admin/gallery" as const,
    responses: {
      200: z.array(
        z.object({
          id: z.number(),
          image: z.string(),
          category: z.string(),
          height: z.enum(["short", "medium", "tall"]),
          sortOrder: z.number(),
        })
      ),
      500: errorSchemas.internal,
    },
  },
  create: {
    method: "POST" as const,
    path: "/api/admin/gallery" as const,
    input: insertGalleryWorkSchema,
    responses: {
      201: z.object({
        id: z.number(),
        image: z.string(),
        category: z.string(),
        height: z.enum(["short", "medium", "tall"]),
        sortOrder: z.number(),
      }),
      400: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
  createBatch: {
    method: "POST" as const,
    path: "/api/admin/gallery/batch" as const,
    input: z.object({
      items: z.array(
        z.object({ image: z.string().min(1), category: z.string().min(1) })
      ).min(1).max(6),
    }),
    responses: {
      201: z.array(
        z.object({
          id: z.number(),
          image: z.string(),
          category: z.string(),
          height: z.enum(["short", "medium", "tall"]),
          sortOrder: z.number(),
        })
      ),
      400: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
  update: {
    method: "PUT" as const,
    path: "/api/admin/gallery/:id" as const,
    input: updateGalleryWorkSchema,
    responses: {
      200: z.object({
        id: z.number(),
        image: z.string(),
        category: z.string(),
        height: z.enum(["short", "medium", "tall"]),
        sortOrder: z.number(),
      }),
      400: errorSchemas.validation,
      404: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
  delete: {
    method: "DELETE" as const,
    path: "/api/admin/gallery/:id" as const,
    responses: {
      204: z.undefined(),
      404: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
};

// =============================================================================
// PRODUCTS (admin)
// =============================================================================

export const productsApi = {
  list: {
    method: "GET" as const,
    path: "/api/admin/products" as const,
    responses: {
      200: z.array(
        z.object({
          id: z.number(),
          slug: z.string(),
          name: z.string(),
          category: z.string(),
          price: z.number(),
          description: z.string(),
          sizes: z.array(z.string()).nullable(),
          colors: z.array(z.string()).nullable(),
          images: z.array(z.string()),
          sortOrder: z.number(),
        })
      ),
      500: errorSchemas.internal,
    },
  },
  create: {
    method: "POST" as const,
    path: "/api/admin/products" as const,
    input: insertProductSchema,
    responses: {
      201: z.object({
        id: z.number(),
        slug: z.string(),
        name: z.string(),
        category: z.string(),
        price: z.number(),
        description: z.string(),
        sizes: z.array(z.string()).nullable(),
        colors: z.array(z.string()).nullable(),
        images: z.array(z.string()),
        sortOrder: z.number(),
      }),
      400: errorSchemas.validation,
      409: z.object({ message: z.string() }),
      500: errorSchemas.internal,
    },
  },
  update: {
    method: "PUT" as const,
    path: "/api/admin/products/:id" as const,
    input: updateProductSchema,
    responses: {
      200: z.object({
        id: z.number(),
        slug: z.string(),
        name: z.string(),
        category: z.string(),
        price: z.number(),
        description: z.string(),
        sizes: z.array(z.string()).nullable(),
        colors: z.array(z.string()).nullable(),
        images: z.array(z.string()),
        sortOrder: z.number(),
      }),
      400: errorSchemas.validation,
      404: errorSchemas.validation,
      409: z.object({ message: z.string() }),
      500: errorSchemas.internal,
    },
  },
  delete: {
    method: "DELETE" as const,
    path: "/api/admin/products/:id" as const,
    responses: {
      204: z.undefined(),
      404: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
};

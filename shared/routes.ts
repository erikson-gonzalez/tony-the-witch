import { z } from 'zod';
import { insertInquirySchema, insertOrderSchema, inquiries } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  inquiries: {
    create: {
      method: 'POST' as const,
      path: '/api/inquiries' as const,
      input: insertInquirySchema,
      responses: {
        201: z.custom<typeof inquiries.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: insertOrderSchema,
      responses: {
        201: z.object({
          id: z.number(),
          orderNumber: z.string(),
          totalUsd: z.number(),
          totalCrc: z.number(),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    uploadProof: {
      method: 'POST' as const,
      path: '/api/orders/:id/proof' as const,
      input: z.object({
        proofImageUrl: z.string().url(),
        transactionRef: z.string().max(200).optional(),
      }),
      responses: {
        200: z.object({ paymentStatus: z.string() }),
        400: errorSchemas.validation,
        404: errorSchemas.internal,
        500: errorSchemas.internal,
      },
    },
    status: {
      method: 'GET' as const,
      path: '/api/orders/:orderNumber/status' as const,
      responses: {
        200: z.object({
          orderNumber: z.string(),
          paymentStatus: z.string(),
          paymentMethod: z.string(),
          createdAt: z.string(),
          reviewedAt: z.string().nullable(),
          customerName: z.string(),
          items: z.array(z.object({
            name: z.string(),
            quantity: z.number(),
          })),
        }),
        404: errorSchemas.internal,
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

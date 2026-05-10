import type { Request, Response } from "express";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  orders,
  payments,
  products,
  webhookEvents,
  type OrderItem,
  type PaymentLifecycleState,
  type PaymentStatus,
} from "../shared/schema";
import { adjustStock } from "../shared/stock";
import { verifyWebhookSignature, OnvoConfigError } from "./onvo";
import {
  sendOrderConfirmationToCustomer,
  sendOrderNotificationToAdmin,
  sendOrderRejectedToCustomer,
} from "./email";
import { mapOnvoStatusToLifecycle } from "./payments-storage";

interface OnvoWebhookEnvelope {
  type: string;
  data: {
    id?: string;
    status?: string;
    metadata?: Record<string, string>;
    error?: { code?: string; message?: string; type?: string };
  };
}

function dedupKeyFor(envelope: OnvoWebhookEnvelope, rawBody: string): string {
  const intentId = envelope.data.id ?? createHash("sha256").update(rawBody).digest("hex");
  return `onvo:${envelope.type}:${intentId}`;
}

function paymentStatusForEvent(eventType: string): PaymentStatus | null {
  switch (eventType) {
    case "payment-intent.succeeded":
      return "approved";
    case "payment-intent.failed":
      return "rejected";
    case "payment-intent.deferred":
      return "processing";
    default:
      return null;
  }
}

export async function onvoWebhookHandler(
  req: Request,
  res: Response,
): Promise<void> {
  // 1. Signature check (bare-secret per ONVO docs).
  try {
    const headerSecret = req.header("x-webhook-secret") ?? req.header("X-Webhook-Secret");
    if (!verifyWebhookSignature(headerSecret ?? undefined)) {
      res.status(401).json({ message: "Invalid signature" });
      return;
    }
  } catch (err) {
    if (err instanceof OnvoConfigError) {
      console.error("[onvo-webhook] config error:", err.message);
      res.status(500).json({ message: "Webhook secret not configured" });
      return;
    }
    throw err;
  }

  // 2. Parse envelope. Body has been parsed by express.json earlier.
  const envelope = req.body as OnvoWebhookEnvelope | undefined;
  if (!envelope || typeof envelope.type !== "string" || !envelope.data) {
    res.status(400).json({ message: "Malformed webhook payload" });
    return;
  }

  // 3. Idempotency: insert webhook_events row, UNIQUE conflict = already seen.
  const rawBody = JSON.stringify(req.body);
  const dedupKey = dedupKeyFor(envelope, rawBody);

  try {
    await db.insert(webhookEvents).values({
      provider: "onvo",
      eventType: envelope.type,
      providerEventId: envelope.data.id ?? null,
      dedupKey,
      payload: envelope as unknown as Record<string, unknown>,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("dedup_key") || msg.includes("unique")) {
      // Already processed (or in-flight). Ack immediately.
      res.status(200).json({ ok: true, deduped: true });
      return;
    }
    console.error("[onvo-webhook] insert failed:", msg);
    res.status(500).json({ message: "Failed to record webhook" });
    return;
  }

  // 4. Apply state transition + stock change atomically.
  let processingError: string | null = null;
  let orderForEmail: typeof orders.$inferSelect | null = null;
  try {
    await db.transaction(async (trx) => {
      const intentId = envelope.data.id;
      if (!intentId) {
        processingError = "Missing data.id in webhook payload";
        return;
      }

      const [payment] = await trx
        .select()
        .from(payments)
        .where(eq(payments.providerIntentId, intentId));
      if (!payment) {
        // Webhook for an intent we did not create — possibly cross-account or
        // a race where the create row hasn't committed yet. Mark for retry.
        processingError = `No payment row for intent ${intentId}`;
        return;
      }

      const newPaymentState = mapOnvoStatusToLifecycle(envelope.data.status ?? "");
      const newOrderStatus = paymentStatusForEvent(envelope.type);

      await trx
        .update(payments)
        .set({
          state: newPaymentState as PaymentLifecycleState,
          rawLatestEvent: envelope as unknown as Record<string, unknown>,
          failureCode: envelope.data.error?.code ?? null,
          failureMessage: envelope.data.error?.message ?? null,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id));

      if (newOrderStatus) {
        const [updatedOrder] = await trx
          .update(orders)
          .set({
            paymentStatus: newOrderStatus,
            reviewedAt:
              newOrderStatus === "approved" || newOrderStatus === "rejected"
                ? new Date()
                : undefined,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, payment.orderId))
          .returning();
        orderForEmail = updatedOrder ?? null;

        // Decrement stock atomically on first transition to approved.
        if (newOrderStatus === "approved" && updatedOrder) {
          for (const item of updatedOrder.items as OrderItem[]) {
            if (item.isReservation) continue;
            const [product] = await trx
              .select()
              .from(products)
              .where(eq(products.id, item.productId));
            if (!product) continue;
            const stockUpdates = adjustStock(product, item, -1);
            if (Object.keys(stockUpdates).length > 0) {
              await trx
                .update(products)
                .set(stockUpdates)
                .where(eq(products.id, item.productId));
            }
          }
        }
      }

      // 5. Mark webhook_events row processed inside the same TX.
      await trx
        .update(webhookEvents)
        .set({ processedAt: new Date() })
        .where(eq(webhookEvents.dedupKey, dedupKey));
    });
  } catch (err) {
    processingError = err instanceof Error ? err.message : "Unknown error";
  }

  if (processingError) {
    console.error("[onvo-webhook] processing error:", processingError);
    await db
      .update(webhookEvents)
      .set({ processingError })
      .where(eq(webhookEvents.dedupKey, dedupKey))
      .catch(() => {
        /* swallow — we are already returning 500 */
      });
    res.status(500).json({ message: "Processing failed", reason: processingError });
    return;
  }

  // 6. Best-effort emails outside the TX.
  if (orderForEmail) {
    const order = orderForEmail as typeof orders.$inferSelect;
    if (order.paymentStatus === "approved") {
      sendOrderNotificationToAdmin(order).catch((err) =>
        console.error(
          "[onvo-webhook] admin email:",
          err instanceof Error ? err.message : "Unknown",
        ),
      );
      sendOrderConfirmationToCustomer(order).catch((err) =>
        console.error(
          "[onvo-webhook] customer email:",
          err instanceof Error ? err.message : "Unknown",
        ),
      );
    } else if (order.paymentStatus === "rejected") {
      sendOrderRejectedToCustomer(order).catch((err) =>
        console.error(
          "[onvo-webhook] reject email:",
          err instanceof Error ? err.message : "Unknown",
        ),
      );
    }
  }

  res.status(200).json({ ok: true });
}

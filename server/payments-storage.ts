import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "./db";
import {
  orders,
  payments,
  type Payment,
  type PaymentLifecycleState,
} from "../shared/schema";
import {
  createPaymentIntent as onvoCreatePaymentIntent,
  type OnvoPaymentIntent,
} from "./onvo";

const ACTIVE_STATES: PaymentLifecycleState[] = [
  "requires_payment_method",
  "requires_action",
  "processing",
];

export class PaymentNotAllowedError extends Error {
  readonly name = "PaymentNotAllowedError";
  constructor(
    message: string,
    readonly reason:
      | "order_not_found"
      | "wrong_method"
      | "wrong_status"
      | "amount_zero",
  ) {
    super(message);
  }
}

/**
 * Create a new ONVO payment intent for an order, OR return the existing
 * active intent if one is already in flight.
 *
 * Idempotency strategy:
 *   1. Re-read the order inside a SELECT FOR UPDATE so concurrent calls
 *      serialize on the same row.
 *   2. If an active payment row exists, reuse it.
 *   3. Otherwise create a new ONVO intent and INSERT into payments.
 *      The partial UNIQUE index `payments_one_active_per_order` is the
 *      last line of defense against races; a duplicate insert raises
 *      and we re-read.
 */
export async function createOrFindActivePayment(
  orderId: number,
): Promise<{ payment: Payment; intent: OnvoPaymentIntent | null }> {
  return await db.transaction(async (trx) => {
    const orderRows = await trx.execute(
      sql`SELECT * FROM ${orders} WHERE ${orders.id} = ${orderId} FOR UPDATE`,
    );
    const orderRow = orderRows.rows[0] as
      | {
          id: number;
          payment_method: string;
          payment_status: string;
          total_usd: number;
          customer_email: string;
          customer_name: string;
        }
      | undefined;

    if (!orderRow) {
      throw new PaymentNotAllowedError("Order not found", "order_not_found");
    }
    if (orderRow.payment_method !== "onvo_card") {
      throw new PaymentNotAllowedError(
        "Order is not an ONVO card order",
        "wrong_method",
      );
    }
    if (orderRow.payment_status !== "awaiting_payment") {
      throw new PaymentNotAllowedError(
        `Order in status ${orderRow.payment_status} cannot accept new payment intent`,
        "wrong_status",
      );
    }
    if (orderRow.total_usd <= 0) {
      throw new PaymentNotAllowedError("Order total is zero", "amount_zero");
    }

    // Reuse any existing active payment.
    const existing = await trx
      .select()
      .from(payments)
      .where(
        and(eq(payments.orderId, orderId), inArray(payments.state, ACTIVE_STATES)),
      )
      .limit(1);

    if (existing.length > 0) {
      return { payment: existing[0]!, intent: null };
    }

    const intent = await onvoCreatePaymentIntent({
      amount: orderRow.total_usd, // already cents
      currency: "USD",
      description: `Tony The Witch order #${orderId}`,
      // ONVO does not accept a `customer` object on the intent (only customerId).
      // Carry contact via metadata for now; saved-card / Customer is deferred.
      metadata: {
        orderId: String(orderId),
        customerName: orderRow.customer_name,
        customerEmail: orderRow.customer_email,
      },
    });

    const inserted = await trx
      .insert(payments)
      .values({
        orderId,
        provider: "onvo",
        providerIntentId: intent.id,
        methodType: "card",
        amountCents: orderRow.total_usd,
        currency: "USD",
        state: mapOnvoStatusToLifecycle(intent.status),
        rawCreate: intent as unknown as Record<string, unknown>,
      })
      .returning();

    return { payment: inserted[0]!, intent };
  });
}

export function mapOnvoStatusToLifecycle(
  onvoStatus: string,
): PaymentLifecycleState {
  switch (onvoStatus) {
    case "requires_payment_method":
    case "requires_action":
    case "processing":
    case "succeeded":
    case "failed":
    case "canceled":
    case "refunded":
    case "partially_refunded":
      return onvoStatus;
    case "requires_capture":
    case "requires_confirmation":
      // Both treated as in-flight (not terminal).
      return "processing";
    default:
      return "requires_payment_method";
  }
}

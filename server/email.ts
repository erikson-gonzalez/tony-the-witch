import { Resend } from "resend";
import type { Inquiry, Order } from "../shared/schema";
import {
  buildInquiryAdminNotification,
  buildInquiryCustomerConfirmation,
  buildOrderAdminNotification,
  buildOrderCustomerConfirmation,
  buildOrderApprovedNotification,
  buildOrderRejectedNotification,
} from "./email-templates";

let resend: Resend | null = null;

const FROM_EMAIL = process.env.FROM_EMAIL || "Tony The Witch <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

export function initEmail(): void {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — emails will be skipped");
    return;
  }
  resend = new Resend(apiKey);
  console.log("[email] Resend initialized");
}

export async function sendInquiryNotificationToAdmin(
  inquiry: Inquiry
): Promise<void> {
  if (!resend || !ADMIN_EMAIL) return;

  try {
    const { subject, html } = buildInquiryAdminNotification(inquiry);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send admin notification:", err instanceof Error ? err.message : "Unknown error");
  }
}

export async function sendInquiryConfirmationToCustomer(
  inquiry: Inquiry
): Promise<void> {
  if (!resend || !inquiry.email) return;

  try {
    const { subject, html } = buildInquiryCustomerConfirmation(inquiry);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: inquiry.email,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send customer confirmation:", err instanceof Error ? err.message : "Unknown error");
  }
}

export async function sendOrderNotificationToAdmin(
  order: Order
): Promise<void> {
  if (!resend || !ADMIN_EMAIL) return;

  try {
    const { subject, html } = buildOrderAdminNotification(order);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send order admin notification:", err instanceof Error ? err.message : "Unknown error");
  }
}

export async function sendOrderConfirmationToCustomer(
  order: Order
): Promise<void> {
  if (!resend || !order.customerEmail) return;

  try {
    const { subject, html } = buildOrderCustomerConfirmation(order);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send order confirmation:", err instanceof Error ? err.message : "Unknown error");
  }
}

export async function sendOrderApprovedToCustomer(
  order: Order
): Promise<void> {
  if (!resend || !order.customerEmail) return;

  try {
    const { subject, html } = buildOrderApprovedNotification(order);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send order approved email:", err instanceof Error ? err.message : "Unknown error");
  }
}

export async function sendOrderRejectedToCustomer(
  order: Order
): Promise<void> {
  if (!resend || !order.customerEmail) return;

  try {
    const { subject, html } = buildOrderRejectedNotification(order);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send order rejected email:", err instanceof Error ? err.message : "Unknown error");
  }
}

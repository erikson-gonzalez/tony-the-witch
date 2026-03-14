import { Resend } from "resend";
import type { Inquiry } from "../shared/schema";
import {
  buildInquiryAdminNotification,
  buildInquiryCustomerConfirmation,
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

import type { Inquiry } from "../shared/schema";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeSubject(str: string): string {
  return str.replace(/[\r\n\0]/g, "").slice(0, 78);
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Costa_Rica",
  }).format(date);
}

export function buildInquiryAdminNotification(inquiry: Inquiry): {
  subject: string;
  html: string;
} {
  const subject = sanitizeSubject(`Nueva consulta de ${inquiry.name}`);

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#0f172a;padding:20px 24px">
      <h1 style="margin:0;color:#fff;font-size:18px">Nueva consulta</h1>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155">
        <tr>
          <td style="padding:8px 0;font-weight:600;width:120px;vertical-align:top">Nombre</td>
          <td style="padding:8px 0">${escapeHtml(inquiry.name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-weight:600;vertical-align:top">Email</td>
          <td style="padding:8px 0">
            <a href="mailto:${escapeHtml(inquiry.email)}" style="color:#2563eb">${escapeHtml(inquiry.email)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-weight:600;vertical-align:top">Mensaje</td>
          <td style="padding:8px 0">${escapeHtml(inquiry.message)}</td>
        </tr>
        ${inquiry.tattooIdea ? `
        <tr>
          <td style="padding:8px 0;font-weight:600;vertical-align:top">Idea de tatuaje</td>
          <td style="padding:8px 0">${escapeHtml(inquiry.tattooIdea)}</td>
        </tr>` : ""}
        ${inquiry.placement ? `
        <tr>
          <td style="padding:8px 0;font-weight:600;vertical-align:top">Ubicación</td>
          <td style="padding:8px 0">${escapeHtml(inquiry.placement)}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:8px 0;font-weight:600;vertical-align:top">Fecha</td>
          <td style="padding:8px 0;color:#64748b">${formatDate(inquiry.createdAt)}</td>
        </tr>
      </table>
      <div style="margin-top:20px">
        <a href="mailto:${escapeHtml(inquiry.email)}?subject=Re: Tu consulta en Tony The Witch"
           style="display:inline-block;padding:10px 20px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;font-size:14px">
          Responder
        </a>
      </div>
    </div>
  </div>
</body>
</html>`.trim();

  return { subject, html };
}

export function buildInquiryCustomerConfirmation(inquiry: Inquiry): {
  subject: string;
  html: string;
} {
  const subject = "Recibimos tu mensaje - Tony The Witch";

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#0f172a;padding:20px 24px">
      <h1 style="margin:0;color:#fff;font-size:18px">Tony The Witch</h1>
    </div>
    <div style="padding:24px;font-size:14px;color:#334155;line-height:1.6">
      <p>Hola <strong>${escapeHtml(inquiry.name)}</strong>,</p>
      <p>Recibimos tu mensaje y te responderemos lo antes posible.</p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #e2e8f0">
        <p style="margin:0 0 4px;font-weight:600;font-size:13px;color:#64748b">Tu mensaje:</p>
        <p style="margin:0;color:#334155">${escapeHtml(inquiry.message)}</p>
      </div>
      <p style="color:#64748b;font-size:13px">
        Tiempo de respuesta estimado: 24-48 horas.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
      <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center">
        Tony The Witch Tattoo &amp; Art Studio
      </p>
    </div>
  </div>
</body>
</html>`.trim();

  return { subject, html };
}

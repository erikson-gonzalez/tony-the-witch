import type { Inquiry, Order, OrderItem } from "../shared/schema";

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

// ---------------------------------------------------------------------------
// Helpers for order emails
// ---------------------------------------------------------------------------

function getAppUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:5000";
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatCrc(colones: number): string {
  return `₡${colones.toLocaleString("es-CR")}`;
}

function buildItemsTable(items: OrderItem[], showPrices: boolean): string {
  const rows = items
    .map((item) => {
      const variant = [item.size, item.color].filter(Boolean).join(" / ");
      const priceCell = showPrices
        ? `<td style="padding:6px 8px;text-align:right">${formatUsd(item.priceUsd)}</td>
           <td style="padding:6px 8px;text-align:right">${formatUsd(item.priceUsd * item.quantity)}</td>`
        : "";
      return `<tr style="border-bottom:1px solid #e2e8f0">
        <td style="padding:6px 8px">${escapeHtml(item.name)}</td>
        <td style="padding:6px 8px;color:#64748b">${variant || "—"}</td>
        <td style="padding:6px 8px;text-align:center">${item.quantity}</td>
        ${priceCell}
      </tr>`;
    })
    .join("");

  const priceHeaders = showPrices
    ? `<th style="padding:6px 8px;text-align:right;font-weight:600;color:#64748b">Precio</th>
       <th style="padding:6px 8px;text-align:right;font-weight:600;color:#64748b">Total</th>`
    : "";

  return `<table style="width:100%;border-collapse:collapse;font-size:13px;color:#334155">
    <thead><tr style="border-bottom:2px solid #e2e8f0">
      <th style="padding:6px 8px;text-align:left;font-weight:600;color:#64748b">Producto</th>
      <th style="padding:6px 8px;text-align:left;font-weight:600;color:#64748b">Variante</th>
      <th style="padding:6px 8px;text-align:center;font-weight:600;color:#64748b">Cant.</th>
      ${priceHeaders}
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function ctaButton(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}"
     style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500">
    ${escapeHtml(label)}
  </a>`;
}

function emailFooter(): string {
  return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center">
      Tony The Witch Tattoo &amp; Art Studio
    </p>`;
}

// ---------------------------------------------------------------------------
// Template 1: Admin notification (new order / proof submitted)
// ---------------------------------------------------------------------------

export function buildOrderAdminNotification(order: Order): {
  subject: string;
  html: string;
} {
  const subject = sanitizeSubject(
    `Nuevo pedido #${order.orderNumber} — ${order.customerName}`
  );
  const appUrl = getAppUrl();
  const method = order.paymentMethod === "sinpe" ? "SINPE" : "Tarjeta";

  let proofSection = "";
  if (order.proofImageUrl) {
    proofSection = `
      <div style="margin-top:16px">
        <p style="font-weight:600;color:#64748b;font-size:13px;margin:0 0 8px">Comprobante SINPE:</p>
        <a href="${escapeHtml(order.proofImageUrl)}" target="_blank" rel="noopener">
          <img src="${escapeHtml(order.proofImageUrl)}" alt="Comprobante" style="max-width:200px;border-radius:8px;border:1px solid #e2e8f0" />
        </a>
        ${order.sinpeTransactionRef ? `<p style="margin:4px 0 0;font-size:13px;color:#64748b">Ref: ${escapeHtml(order.sinpeTransactionRef)}</p>` : ""}
      </div>`;
  }

  let shippingSection = "";
  if (order.shippingAddress) {
    const addr = order.shippingAddress;
    shippingSection = `
      <tr>
        <td style="padding:8px 0;font-weight:600;vertical-align:top">Envío</td>
        <td style="padding:8px 0">
          ${escapeHtml(addr.provincia)}, ${escapeHtml(addr.canton)}, ${escapeHtml(addr.distrito)}
          ${addr.puntoReferencia ? `<br>Ref: ${escapeHtml(addr.puntoReferencia)}` : ""}
          ${addr.pais ? `<br>${escapeHtml(addr.pais)}` : ""}
          <br><span style="color:#64748b">${escapeHtml(order.shippingZone ?? "")} — ${escapeHtml(order.shippingMethod ?? "")}</span>
        </td>
      </tr>`;
  }

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#0f172a;padding:20px 24px">
      <h1 style="margin:0;color:#fff;font-size:18px">Nuevo pedido ${escapeHtml(order.orderNumber)}</h1>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155;margin-bottom:16px">
        <tr>
          <td style="padding:8px 0;font-weight:600;width:120px;vertical-align:top">Cliente</td>
          <td style="padding:8px 0">${escapeHtml(order.customerName)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-weight:600;vertical-align:top">Email</td>
          <td style="padding:8px 0"><a href="mailto:${escapeHtml(order.customerEmail)}" style="color:#2563eb">${escapeHtml(order.customerEmail)}</a></td>
        </tr>
        ${order.customerPhone ? `<tr><td style="padding:8px 0;font-weight:600;vertical-align:top">Teléfono</td><td style="padding:8px 0">${escapeHtml(order.customerPhone)}</td></tr>` : ""}
        <tr>
          <td style="padding:8px 0;font-weight:600;vertical-align:top">Método</td>
          <td style="padding:8px 0">${method}</td>
        </tr>
        ${shippingSection}
        ${order.customerNote ? `<tr><td style="padding:8px 0;font-weight:600;vertical-align:top">Nota</td><td style="padding:8px 0;font-style:italic">${escapeHtml(order.customerNote)}</td></tr>` : ""}
      </table>

      ${buildItemsTable(order.items, true)}

      <div style="margin-top:12px;text-align:right;font-size:14px;color:#334155">
        <p style="margin:4px 0"><span style="color:#64748b">Subtotal:</span> ${formatUsd(order.subtotalUsd)}</p>
        ${order.shippingCrc > 0 ? `<p style="margin:4px 0"><span style="color:#64748b">Envío:</span> ${formatCrc(order.shippingCrc)}</p>` : ""}
        <p style="margin:4px 0;font-weight:600">Total: ${formatUsd(order.totalUsd)} / ${formatCrc(order.totalCrc)}</p>
      </div>

      ${proofSection}

      <div style="margin-top:20px">
        ${ctaButton(`${appUrl}/admin/orders/${order.id}`, "Ver pedido")}
      </div>
    </div>
  </div>
</body>
</html>`.trim();

  return { subject, html };
}

// ---------------------------------------------------------------------------
// Template 2: Customer confirmation (order created)
// ---------------------------------------------------------------------------

export function buildOrderCustomerConfirmation(order: Order): {
  subject: string;
  html: string;
} {
  const subject = sanitizeSubject(
    `Pedido #${order.orderNumber} recibido — Tony The Witch`
  );
  const appUrl = getAppUrl();
  const firstName = order.customerName.split(" ")[0];

  const isSinpe = order.paymentMethod === "sinpe";
  const totalDisplay = isSinpe
    ? formatCrc(order.totalCrc)
    : formatUsd(order.totalUsd);

  const sinpeReminder = isSinpe
    ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;color:#92400e">
        Recordá subir tu comprobante de SINPE para que podamos procesar tu pedido.
      </div>`
    : "";

  const itemsList = order.items
    .map(
      (item) =>
        `<li style="margin:4px 0">${escapeHtml(item.name)} × ${item.quantity}</li>`
    )
    .join("");

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
      <p>¡Gracias por tu pedido, <strong>${escapeHtml(firstName)}</strong>!</p>
      <p>Tu número de pedido es: <strong>${escapeHtml(order.orderNumber)}</strong></p>

      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #e2e8f0">
        <p style="margin:0 0 8px;font-weight:600;font-size:13px;color:#64748b">Artículos:</p>
        <ul style="margin:0;padding-left:20px;color:#334155">${itemsList}</ul>
        <p style="margin:12px 0 0;font-weight:600">Total: ${totalDisplay}</p>
      </div>

      ${sinpeReminder}

      <div style="margin-top:20px">
        ${ctaButton(`${appUrl}/order/${order.orderNumber}`, "Ver estado de tu pedido")}
      </div>

      ${emailFooter()}
    </div>
  </div>
</body>
</html>`.trim();

  return { subject, html };
}

// ---------------------------------------------------------------------------
// Template 3: Order approved
// ---------------------------------------------------------------------------

export function buildOrderApprovedNotification(order: Order): {
  subject: string;
  html: string;
} {
  const subject = sanitizeSubject(
    `Pedido #${order.orderNumber} aprobado — Tony The Witch`
  );
  const appUrl = getAppUrl();
  const firstName = order.customerName.split(" ")[0];

  const itemsList = order.items
    .map(
      (item) =>
        `<li style="margin:4px 0">${escapeHtml(item.name)} × ${item.quantity}</li>`
    )
    .join("");

  const adminNoteSection = order.adminNote
    ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;color:#166534">
        ${escapeHtml(order.adminNote)}
      </div>`
    : "";

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
      <p>¡Tu pago fue confirmado, <strong>${escapeHtml(firstName)}</strong>!</p>
      <p>Pedido <strong>${escapeHtml(order.orderNumber)}</strong> — tu pedido está siendo preparado.</p>

      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #e2e8f0">
        <p style="margin:0 0 8px;font-weight:600;font-size:13px;color:#64748b">Artículos:</p>
        <ul style="margin:0;padding-left:20px;color:#334155">${itemsList}</ul>
      </div>

      ${adminNoteSection}

      <div style="margin-top:20px">
        ${ctaButton(`${appUrl}/order/${order.orderNumber}`, "Ver estado")}
      </div>

      <p style="margin-top:16px;font-size:13px;color:#64748b">
        ¿Preguntas? Escribinos por <a href="https://wa.me/50671280996" style="color:#2563eb">WhatsApp</a>.
      </p>

      ${emailFooter()}
    </div>
  </div>
</body>
</html>`.trim();

  return { subject, html };
}

// ---------------------------------------------------------------------------
// Template 4: Order rejected
// ---------------------------------------------------------------------------

export function buildOrderRejectedNotification(order: Order): {
  subject: string;
  html: string;
} {
  const subject = sanitizeSubject(
    `Pedido #${order.orderNumber} — acción requerida`
  );
  const appUrl = getAppUrl();
  const firstName = order.customerName.split(" ")[0];

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
      <p>Hubo un problema con tu comprobante, <strong>${escapeHtml(firstName)}</strong>.</p>
      <p>Pedido: <strong>${escapeHtml(order.orderNumber)}</strong></p>

      ${order.adminNote ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;color:#991b1b">
        <p style="margin:0 0 4px;font-weight:600">Motivo:</p>
        <p style="margin:0">${escapeHtml(order.adminNote)}</p>
      </div>` : ""}

      <p>Podés subir un nuevo comprobante:</p>

      <div style="margin-top:16px">
        ${ctaButton(`${appUrl}/order/${order.orderNumber}`, "Subir comprobante")}
      </div>

      <p style="margin-top:16px;font-size:13px;color:#64748b">
        ¿Preguntas? Escribinos por <a href="https://wa.me/50671280996" style="color:#2563eb">WhatsApp</a>.
      </p>

      ${emailFooter()}
    </div>
  </div>
</body>
</html>`.trim();

  return { subject, html };
}

import { LegalPage, type LegalContent } from "./legal-page";

const es: LegalContent = {
  title: "Política de Reembolsos",
  updated: "Última actualización: 15 de septiembre de 2026",
  sections: [
    {
      heading: "1. Productos físicos",
      paragraphs: [
        "Si tu producto llega dañado, defectuoso o incorrecto, avisanos dentro de los 8 días naturales posteriores a la entrega (Ley 7472). Te ofrecemos cambio o reembolso completo, incluido el envío.",
        "Para devoluciones por otras razones, el producto debe estar sin uso y en su estado original, dentro de los mismos 8 días. El costo del envío de retorno corre por cuenta del cliente.",
        "Las piezas de arte original se venden como venta final, salvo daño durante el transporte.",
      ],
    },
    {
      heading: "2. Reservas de sesión de tatuaje",
      paragraphs: [
        "El depósito de reserva se acredita al costo final del tatuaje.",
        "Podés reprogramar sin costo con al menos 48 horas de aviso. Si no te presentás sin aviso, el depósito no es reembolsable.",
        "Si el artista cancela la sesión y no podés reprogramar, se te reembolsa el depósito completo.",
      ],
    },
    {
      heading: "3. Cómo se hace el reembolso",
      paragraphs: [
        "Pagos con tarjeta: el reembolso se procesa por ONVO Pay a la misma tarjeta. Suele reflejarse en 5 a 10 días hábiles, según tu banco.",
        "Pagos por SINPE Móvil: el reembolso se hace por transferencia SINPE al número desde el que pagaste.",
      ],
    },
    {
      heading: "4. Cómo solicitarlo",
      paragraphs: [
        "Escribinos por WhatsApp al +506 7128 0996 con tu número de pedido (TTW-XXXX) y el motivo. Respondemos en un máximo de 2 días hábiles.",
      ],
    },
  ],
};

const en: LegalContent = {
  title: "Refund Policy",
  updated: "Last updated: September 15, 2026",
  sections: [
    {
      heading: "1. Physical products",
      paragraphs: [
        "If your product arrives damaged, defective, or wrong, let us know within 8 calendar days of delivery (Law 7472). We offer a replacement or a full refund, shipping included.",
        "For returns for other reasons, the product must be unused and in original condition, within the same 8 days. Return shipping is paid by the customer.",
        "Original art pieces are final sale, except for damage in transit.",
      ],
    },
    {
      heading: "2. Tattoo session reservations",
      paragraphs: [
        "The reservation deposit is credited toward the final cost of the tattoo.",
        "You may reschedule free of charge with at least 48 hours notice. No-shows without notice forfeit the deposit.",
        "If the artist cancels and you cannot reschedule, the deposit is refunded in full.",
      ],
    },
    {
      heading: "3. How refunds are issued",
      paragraphs: [
        "Card payments: refunds are processed by ONVO Pay to the same card, typically visible within 5–10 business days depending on your bank.",
        "SINPE Móvil payments: refunds are sent by SINPE transfer to the number you paid from.",
      ],
    },
    {
      heading: "4. How to request one",
      paragraphs: [
        "Message us on WhatsApp at +506 7128 0996 with your order number (TTW-XXXX) and the reason. We reply within 2 business days.",
      ],
    },
  ],
};

export default function RefundPolicy() {
  return <LegalPage es={es} en={en} />;
}

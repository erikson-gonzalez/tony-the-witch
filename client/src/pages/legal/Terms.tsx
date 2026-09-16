import { LegalPage, type LegalContent } from "./legal-page";

const es: LegalContent = {
  title: "Términos y Condiciones",
  updated: "Última actualización: 15 de septiembre de 2026",
  intro:
    "Estos términos regulan el uso de tonythewitch.shop y la compra de productos y reservas de sesiones de tatuaje ofrecidos por Tony The Witch (Costa Rica). Al realizar una compra aceptás estos términos.",
  sections: [
    {
      heading: "1. Quiénes somos",
      paragraphs: [
        "Tony The Witch es un estudio de tatuaje y tienda de arte y mercadería operado en Costa Rica. Contacto: por WhatsApp al +506 7128 0996 o por los medios indicados en el sitio.",
      ],
    },
    {
      heading: "2. Productos y reservas",
      paragraphs: [
        "El sitio ofrece productos físicos (ropa, arte, mercadería), tarjetas de regalo y reservas de sesión de tatuaje.",
        "La reserva de sesión de tatuaje es un depósito que asegura tu cita. El depósito se acredita al costo final del tatuaje. La fecha y hora de la sesión se coordinan después del pago.",
      ],
    },
    {
      heading: "3. Precios y pagos",
      paragraphs: [
        "Todos los precios se muestran en colones costarricenses (CRC) e incluyen los impuestos aplicables.",
        "Aceptamos pago con tarjeta de crédito o débito (procesado por ONVO Pay) y SINPE Móvil. No almacenamos datos de tarjeta: el pago con tarjeta lo procesa ONVO Pay de forma segura.",
        "Los pedidos pagados por SINPE Móvil quedan pendientes hasta que verifiquemos el comprobante de la transferencia. Nos reservamos el derecho de cancelar pedidos cuyo pago no pueda verificarse.",
      ],
    },
    {
      heading: "4. Envíos",
      paragraphs: [
        "Realizamos envíos dentro de Costa Rica por Correos de Costa Rica (estándar) y Uber Flash (día siguiente, solo GAM). El costo de envío se muestra antes de confirmar el pedido.",
        "Los tiempos de entrega son estimados y pueden variar por causas ajenas a nosotros. Los envíos internacionales se coordinan caso por caso.",
      ],
    },
    {
      heading: "5. Reservas de tatuaje: cambios y cancelaciones",
      paragraphs: [
        "Podés reprogramar tu sesión sin costo avisando con al menos 48 horas de anticipación.",
        "Si no te presentás a la cita sin aviso previo, el depósito se pierde.",
        "Los diseños son obra original del artista y quedan protegidos por derechos de autor.",
      ],
    },
    {
      heading: "6. Devoluciones",
      paragraphs: [
        "Ver nuestra Política de Reembolsos para productos, pagos con tarjeta y SINPE.",
      ],
    },
    {
      heading: "7. Responsabilidad y ley aplicable",
      paragraphs: [
        "Este sitio se ofrece \"tal cual\". No somos responsables por interrupciones del servicio ajenas a nuestro control.",
        "Estos términos se rigen por las leyes de la República de Costa Rica, incluida la Ley 7472 de Promoción de la Competencia y Defensa Efectiva del Consumidor. Cualquier disputa se someterá a la jurisdicción de los tribunales costarricenses.",
      ],
    },
  ],
};

const en: LegalContent = {
  title: "Terms & Conditions",
  updated: "Last updated: September 15, 2026",
  intro:
    "These terms govern the use of tonythewitch.shop and the purchase of products and tattoo session reservations offered by Tony The Witch (Costa Rica). By placing an order you accept these terms.",
  sections: [
    {
      heading: "1. Who we are",
      paragraphs: [
        "Tony The Witch is a tattoo studio and art & merch shop operated in Costa Rica. Contact: WhatsApp +506 7128 0996 or the channels listed on the site.",
      ],
    },
    {
      heading: "2. Products and reservations",
      paragraphs: [
        "The site offers physical products (apparel, art, merch), gift cards, and tattoo session reservations.",
        "A tattoo session reservation is a deposit that secures your appointment. The deposit is credited toward the final cost of the tattoo. Date and time are coordinated after payment.",
      ],
    },
    {
      heading: "3. Prices and payments",
      paragraphs: [
        "All prices are shown in Costa Rican colones (CRC) and include applicable taxes.",
        "We accept credit/debit cards (processed by ONVO Pay) and SINPE Móvil. We never store card data: card payments are processed securely by ONVO Pay.",
        "Orders paid via SINPE Móvil remain pending until we verify the transfer receipt. We reserve the right to cancel orders whose payment cannot be verified.",
      ],
    },
    {
      heading: "4. Shipping",
      paragraphs: [
        "We ship within Costa Rica via Correos de Costa Rica (standard) and Uber Flash (next day, GAM only). Shipping cost is shown before you confirm the order.",
        "Delivery times are estimates and may vary for reasons beyond our control. International shipping is arranged case by case.",
      ],
    },
    {
      heading: "5. Tattoo reservations: changes and cancellations",
      paragraphs: [
        "You may reschedule your session at no cost with at least 48 hours notice.",
        "No-shows without prior notice forfeit the deposit.",
        "All designs are original work of the artist and protected by copyright.",
      ],
    },
    {
      heading: "6. Returns",
      paragraphs: [
        "See our Refund Policy for products, card payments, and SINPE.",
      ],
    },
    {
      heading: "7. Liability and governing law",
      paragraphs: [
        "This site is provided \"as is\". We are not liable for service interruptions beyond our control.",
        "These terms are governed by the laws of the Republic of Costa Rica, including Law 7472 on consumer protection. Any dispute is subject to the jurisdiction of Costa Rican courts.",
      ],
    },
  ],
};

export default function Terms() {
  return <LegalPage es={es} en={en} />;
}

import { LegalPage, type LegalContent } from "./legal-page";

const es: LegalContent = {
  title: "Política de Privacidad",
  updated: "Última actualización: 15 de septiembre de 2026",
  intro:
    "Explicamos qué datos personales recolectamos en tonythewitch.shop, para qué los usamos y cuáles son tus derechos según la Ley 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales de Costa Rica.",
  sections: [
    {
      heading: "1. Qué datos recolectamos",
      paragraphs: [
        "Al hacer un pedido: nombre, correo electrónico, teléfono y, si hay envío, dirección de entrega.",
        "Al pagar por SINPE Móvil: el comprobante de la transferencia que subís.",
        "Al usar el formulario de contacto: nombre, correo y tu mensaje.",
        "No recolectamos ni almacenamos datos de tarjetas de crédito o débito.",
      ],
    },
    {
      heading: "2. Para qué los usamos",
      paragraphs: [
        "Para procesar y entregar tu pedido, verificar pagos, coordinar sesiones de tatuaje, enviarte confirmaciones por correo y responder tus consultas.",
        "No vendemos ni alquilamos tus datos. No enviamos publicidad sin tu consentimiento.",
      ],
    },
    {
      heading: "3. Con quién los compartimos",
      paragraphs: [
        "Solo con los proveedores necesarios para operar la tienda: ONVO Pay (procesamiento de pagos con tarjeta), Resend (envío de correos transaccionales), Cloudinary (almacenamiento de imágenes, incluidos comprobantes SINPE), Vercel (alojamiento del sitio) y Neon (base de datos).",
        "Cada proveedor procesa los datos según sus propias políticas de seguridad y privacidad.",
      ],
    },
    {
      heading: "4. Cuánto tiempo los guardamos",
      paragraphs: [
        "Conservamos los datos de pedidos mientras sean necesarios para fines contables y de garantía. Podés solicitar su eliminación cuando ya no exista obligación legal de conservarlos.",
      ],
    },
    {
      heading: "5. Tus derechos",
      paragraphs: [
        "Según la Ley 8968, tenés derecho a acceder, rectificar y suprimir tus datos personales, y a revocar tu consentimiento.",
        "Para ejercerlos, contactanos por WhatsApp al +506 7128 0996.",
      ],
    },
    {
      heading: "6. Cookies y almacenamiento local",
      paragraphs: [
        "Usamos solo almacenamiento esencial: tu carrito de compras se guarda en tu propio navegador (localStorage) y la sesión del administrador usa una cookie técnica. No usamos cookies de publicidad ni rastreo de terceros.",
      ],
    },
  ],
};

const en: LegalContent = {
  title: "Privacy Policy",
  updated: "Last updated: September 15, 2026",
  intro:
    "This explains what personal data we collect on tonythewitch.shop, how we use it, and your rights under Costa Rica's Law 8968 on personal data protection.",
  sections: [
    {
      heading: "1. What we collect",
      paragraphs: [
        "When you place an order: name, email, phone, and — if shipping — a delivery address.",
        "When you pay via SINPE Móvil: the transfer receipt you upload.",
        "When you use the contact form: name, email, and your message.",
        "We do not collect or store credit or debit card data.",
      ],
    },
    {
      heading: "2. How we use it",
      paragraphs: [
        "To process and deliver your order, verify payments, coordinate tattoo sessions, send email confirmations, and answer your inquiries.",
        "We do not sell or rent your data. We do not send marketing without your consent.",
      ],
    },
    {
      heading: "3. Who we share it with",
      paragraphs: [
        "Only with providers needed to run the shop: ONVO Pay (card payment processing), Resend (transactional email), Cloudinary (image storage, including SINPE receipts), Vercel (hosting), and Neon (database).",
        "Each provider processes data under its own security and privacy policies.",
      ],
    },
    {
      heading: "4. How long we keep it",
      paragraphs: [
        "We keep order data as long as needed for accounting and warranty purposes. You may request deletion once no legal obligation to keep it remains.",
      ],
    },
    {
      heading: "5. Your rights",
      paragraphs: [
        "Under Law 8968 you have the right to access, correct, and delete your personal data, and to withdraw consent.",
        "To exercise these rights, contact us on WhatsApp at +506 7128 0996.",
      ],
    },
    {
      heading: "6. Cookies and local storage",
      paragraphs: [
        "We use only essential storage: your shopping cart lives in your own browser (localStorage) and the admin session uses a technical cookie. No advertising or third-party tracking cookies.",
      ],
    },
  ],
};

export default function Privacy() {
  return <LegalPage es={es} en={en} />;
}

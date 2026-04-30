import { useState, useCallback } from "react";
import type { CheckoutStep, CheckoutForm } from "@/types";
import type { CartItem } from "@/lib/cart";

export interface OnvoIntent {
  paymentIntentId: string;
  publishableKey: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const defaultForm: CheckoutForm = {
  name: "",
  email: "",
  phone: "",
  note: "",
  shippingZone: undefined,
  shippingMethod: undefined,
  nextDayAccepted: false,
};

export function useCheckout(
  onPaymentComplete: () => void,
  needsShipping: boolean,
  items: CartItem[],
  totalPrice: number,
) {
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [form, setForm] = useState<CheckoutForm>(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderTotalCrc, setOrderTotalCrc] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onvoIntent, setOnvoIntent] = useState<OnvoIntent | null>(null);

  const goToStep = useCallback((newStep: CheckoutStep) => {
    setStep(newStep);
    setFormErrors({});
  }, []);

  const updateForm = useCallback((updates: Partial<CheckoutForm>) => {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      if (updates.shippingZone === "NON_GAM" && prev.shippingMethod === "NEXT_DAY") {
        next.shippingMethod = "STANDARD";
        next.nextDayAccepted = false;
      }
      const zone = next.shippingZone ?? updates.shippingZone;
      if (zone === "NON_GAM") {
        next.shippingMethod = "STANDARD";
      } else if (zone === "INTERNATIONAL") {
        next.shippingMethod = "A_CONVENIR";
        next.nextDayAccepted = false;
      } else if (zone === "GAM" && !next.shippingMethod) {
        next.shippingMethod = "STANDARD";
      }
      return next;
    });
    setFormErrors((prev) => {
      const next = { ...prev };
      Object.keys(updates).forEach((key) => delete next[key]);
      return next;
    });
  }, []);

  const validateInfo = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Nombre obligatorio";
    if (!form.email.trim()) errors.email = "Correo obligatorio";
    else if (!EMAIL_REGEX.test(form.email)) errors.email = "Correo inválido";
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 8) errors.phone = "Teléfono obligatorio";

    if (needsShipping) {
      if (!form.shippingZone) errors.shippingZone = "Seleccioná tu zona de envío";
      if (!form.shippingMethod) errors.shippingMethod = "Seleccioná el método de envío";
      if (
        form.shippingZone === "GAM" &&
        form.shippingMethod === "NEXT_DAY" &&
        !form.nextDayAccepted
      ) {
        errors.nextDayAccepted =
          "Debés aceptar que el costo final del envío express puede variar";
      }
      if (form.shippingZone === "INTERNATIONAL") {
        if (!form.pais?.trim()) errors.pais = "Indicá tu país";
        if (!form.puntoReferencia?.trim())
          errors.puntoReferencia = "Indicá tu dirección completa";
      } else if (form.shippingZone === "GAM" || form.shippingZone === "NON_GAM") {
        if (!form.provincia?.trim()) errors.provincia = "Seleccioná tu provincia";
        if (!form.puntoReferencia?.trim())
          errors.puntoReferencia = "Indicá tu dirección para la entrega";
      }
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return false;

    setStep("payment_method");
    return true;
  }, [
    form.name,
    form.email,
    form.phone,
    form.shippingZone,
    form.shippingMethod,
    form.nextDayAccepted,
    form.provincia,
    form.puntoReferencia,
    form.pais,
    needsShipping,
  ]);

  const createOrder = useCallback(async (paymentMethod: "sinpe" | "onvo_card"): Promise<boolean> => {
    if (orderId) return true;
    setIsSubmitting(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        priceUsd: Math.round(item.price * 100),
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image,
        isReservation: item.isReservation,
      }));

      const shippingAddress = needsShipping && form.shippingZone !== "INTERNATIONAL"
        ? {
            provincia: form.provincia ?? "",
            canton: form.provincia ?? "",
            distrito: form.provincia ?? "",
            puntoReferencia: form.puntoReferencia,
          }
        : needsShipping && form.shippingZone === "INTERNATIONAL"
          ? {
              provincia: "-",
              canton: "-",
              distrito: "-",
              puntoReferencia: form.puntoReferencia,
              pais: form.pais,
            }
          : undefined;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone || undefined,
          customerNote: form.note || undefined,
          items: orderItems,
          shippingAddress,
          shippingZone: needsShipping ? form.shippingZone : undefined,
          shippingMethod: needsShipping ? form.shippingMethod : undefined,
          paymentMethod,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as {
          message?: string;
          productId?: number;
          available?: number;
        };
        if (res.status === 409 && data.available !== undefined) {
          // Stock error — show specific message
          setFormErrors({ _api: data.message || "Stock insuficiente" });
        } else if (res.status === 400) {
          setFormErrors({ _api: data.message || "Datos de pedido inválidos" });
        } else {
          setFormErrors({ _api: data.message || "Error al crear el pedido. Intentá de nuevo." });
        }
        return false;
      }

      const data = await res.json();
      setOrderId(data.id);
      setOrderNumber(data.orderNumber);
      setOrderTotalCrc(data.totalCrc);
      import("@/hooks/use-analytics").then(({ trackEvent }) =>
        trackEvent("complete_purchase", {
          orderNumber: data.orderNumber,
          totalUsd: totalPrice,
          items: items.length,
          paymentMethod,
        }),
      );
      return true;
    } catch {
      setFormErrors({ _api: "Error de conexión. Verificá tu internet e intentá de nuevo." });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [orderId, items, form, needsShipping]);

  const fetchOnvoIntent = useCallback(async (
    orderIdToUse: number,
    customerEmail: string,
  ): Promise<OnvoIntent | null> => {
    try {
      const res = await fetch("/api/payments/onvo/intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderIdToUse, customerEmail }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        setFormErrors({
          _api:
            data.message ?? "No se pudo iniciar el pago con tarjeta. Intentá de nuevo.",
        });
        return null;
      }
      const data = (await res.json()) as OnvoIntent;
      setOnvoIntent(data);
      return data;
    } catch {
      setFormErrors({ _api: "Error de conexión iniciando el pago." });
      return null;
    }
  }, []);

  const selectPaymentMethod = useCallback(async (method: "sinpe" | "onvo_card") => {
    setForm((prev) => ({ ...prev, paymentMethod: method }));

    if (method === "sinpe") {
      const success = await createOrder("sinpe");
      if (success) setStep("sinpe_instructions");
      return;
    }

    const orderOk = await createOrder("onvo_card");
    if (orderOk) setStep("payment");
  }, [createOrder]);

  // The payment step mounts and calls this to fetch the intent lazily, after
  // useState commits orderId from the order-create response.
  const ensureOnvoIntent = useCallback(async (): Promise<OnvoIntent | null> => {
    if (onvoIntent) return onvoIntent;
    if (!orderId) return null;
    return await fetchOnvoIntent(orderId, form.email);
  }, [onvoIntent, orderId, form.email, fetchOnvoIntent]);

  const submitProof = useCallback(async (proofUrl: string, transactionRef?: string): Promise<boolean> => {
    if (!orderId) return false;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofImageUrl: proofUrl,
          transactionRef: transactionRef || undefined,
        }),
      });
      if (!res.ok) return false;
      onPaymentComplete();
      setStep("confirmed");
      return true;
    } catch {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [orderId, onPaymentComplete]);

  // Called by the SDK's onSuccess callback. Polls the order status endpoint
  // until the webhook flips the order to `approved`, then advances the UI.
  const onCardPaymentSuccess = useCallback(async () => {
    setStep("processing");
    onPaymentComplete();

    if (!orderNumber) {
      setStep("confirmed");
      return;
    }

    const start = Date.now();
    const POLL_TIMEOUT_MS = 30_000;
    const POLL_INTERVAL_MS = 1_500;

    while (Date.now() - start < POLL_TIMEOUT_MS) {
      try {
        const res = await fetch(
          `/api/orders/${encodeURIComponent(orderNumber)}/status?email=${encodeURIComponent(form.email)}`,
        );
        if (res.ok) {
          const data = (await res.json()) as { paymentStatus?: string };
          if (
            data.paymentStatus === "approved" ||
            data.paymentStatus === "processing"
          ) {
            setStep("confirmed");
            return;
          }
        }
      } catch {
        // ignore transient errors during polling
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    // Webhook didn't fire in time — still show confirmation; admin will see
    // the order via the webhook eventually.
    setStep("confirmed");
  }, [orderNumber, form.email, onPaymentComplete]);

  const onCardPaymentError = useCallback((message?: string) => {
    setFormErrors({
      _api: message ?? "El pago con tarjeta falló. Intentá de nuevo.",
    });
    setStep("payment");
  }, []);

  return {
    step,
    form,
    formErrors,
    orderId,
    orderNumber,
    orderTotalCrc,
    onvoIntent,
    isSubmitting,
    goToStep,
    updateForm,
    validateInfo,
    selectPaymentMethod,
    ensureOnvoIntent,
    onCardPaymentSuccess,
    onCardPaymentError,
    submitProof,
  };
}

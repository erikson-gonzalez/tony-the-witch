import { useState, useCallback } from "react";
import type { CheckoutStep, CheckoutForm, CardForm } from "@/types";
import type { CartItem } from "@/lib/cart";

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
  const [card, setCard] = useState<CardForm>({ number: "", expiry: "", cvc: "", holder: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderTotalCrc, setOrderTotalCrc] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const updateCard = useCallback((updates: Partial<CardForm>) => {
    setCard((prev) => ({ ...prev, ...updates }));
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

  const createOrder = useCallback(async (paymentMethod: "sinpe" | "card"): Promise<boolean> => {
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
        const data = await res.json().catch(() => ({}));
        setFormErrors({ _api: (data as { message?: string }).message || "checkout.errorCreateOrder" });
        return false;
      }

      const data = await res.json();
      setOrderId(data.id);
      setOrderNumber(data.orderNumber);
      setOrderTotalCrc(data.totalCrc);
      return true;
    } catch {
      setFormErrors({ _api: "checkout.errorConnection" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [orderId, items, form, needsShipping]);

  const selectPaymentMethod = useCallback(async (method: "sinpe" | "card") => {
    setForm((prev) => ({ ...prev, paymentMethod: method }));

    if (method === "sinpe") {
      const success = await createOrder("sinpe");
      if (success) setStep("sinpe_instructions");
    } else {
      setStep("payment");
    }
  }, [createOrder]);

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

  const validatePayment = useCallback(async (): Promise<boolean> => {
    const errors: Record<string, string> = {};
    const digits = card.number.replace(/\D/g, "");

    if (digits.length < 16) errors.number = "Enter a valid card number";
    if (!card.holder.trim()) errors.holder = "Cardholder name is required";

    const expiryDigits = card.expiry.replace(/\D/g, "");
    if (expiryDigits.length < 4) errors.expiry = "Enter a valid expiry";
    if (card.cvc.replace(/\D/g, "").length < 3) errors.cvc = "Enter a valid CVC";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return false;

    setStep("processing");

    const success = await createOrder("card");
    if (success) {
      onPaymentComplete();
      setStep("confirmed");
    } else {
      setStep("payment");
    }
    return true;
  }, [card, onPaymentComplete, createOrder]);

  return {
    step,
    form,
    card,
    formErrors,
    orderId,
    orderNumber,
    orderTotalCrc,
    isSubmitting,
    goToStep,
    updateForm,
    updateCard,
    validateInfo,
    validatePayment,
    selectPaymentMethod,
    submitProof,
  };
}

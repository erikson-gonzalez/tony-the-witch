import { useState, useCallback } from "react";
import type { CheckoutStep, CheckoutForm, CardForm } from "@/types";

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
  needsShipping: boolean
) {
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [form, setForm] = useState<CheckoutForm>(defaultForm);
  const [card, setCard] = useState<CardForm>({ number: "", expiry: "", cvc: "", holder: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const goToStep = useCallback((newStep: CheckoutStep) => {
    setStep(newStep);
    setFormErrors({});
  }, []);

  const updateForm = useCallback((updates: Partial<CheckoutForm>) => {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      // When zone changes to NON_GAM, clear NEXT_DAY and nextDayAccepted
      if (updates.shippingZone === "NON_GAM" && prev.shippingMethod === "NEXT_DAY") {
        next.shippingMethod = "STANDARD";
        next.nextDayAccepted = false;
      }
      // When zone is set, ensure method is valid for that zone
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
      // Address validation
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

    setStep("payment");
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

  const validatePayment = useCallback((): boolean => {
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
    setTimeout(() => {
      onPaymentComplete();
      setStep("confirmed");
    }, 2200);
    return true;
  }, [card, onPaymentComplete]);

  return {
    step,
    form,
    card,
    formErrors,
    goToStep,
    updateForm,
    updateCard,
    validateInfo,
    validatePayment,
  };
}

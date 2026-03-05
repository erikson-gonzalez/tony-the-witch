import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { CheckoutForm, ShippingZone, ShippingMethod } from "@/types";
import { inputClass, labelClass } from "./cart-items-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getShippingCost,
  getAvailableMethods,
  SHIPPING_COSTS,
} from "@/utils/shipping";
import { formatPrice, formatShippingCost } from "@/utils/formatPrice";
import { ShippingZoneModal } from "./shipping-zone-modal";
import { PROVINCIAS_CR } from "@/constants/provincias-cr";

interface CheckoutInfoStepProps {
  form: CheckoutForm;
  totalPrice: number;
  totalItems: number;
  locale?: string;
  usdToCrc?: number;
  reservationPrice?: number;
  formErrors: Record<string, string>;
  hasReservation?: boolean;
  hasCustomSession?: boolean;
  needsShipping?: boolean;
  onUpdateForm: (updates: Partial<CheckoutForm>) => void;
  onValidate: () => void;
  onBack: () => void;
}

export function CheckoutInfoStep({
  form,
  totalPrice,
  totalItems,
  locale = "en",
  usdToCrc,
  reservationPrice = 60,
  formErrors,
  hasReservation,
  hasCustomSession,
  needsShipping = false,
  onUpdateForm,
  onValidate,
  onBack,
}: CheckoutInfoStepProps) {
  const { t } = useTranslation();
  const shippingCost =
    needsShipping && form.shippingZone && form.shippingMethod
      ? getShippingCost(form.shippingZone, form.shippingMethod)
      : 0;
  const displayTotal = totalPrice;
  const methods = form.shippingZone ? getAvailableMethods(form.shippingZone) : [];
  const showNextDayWarning =
    needsShipping &&
    form.shippingZone === "GAM" &&
    form.shippingMethod === "NEXT_DAY";
  const isIntl = form.shippingZone === "INTERNATIONAL";

  return (
    <motion.div
      key="info-step"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      {hasReservation && (
        <div className="mb-6 p-4 border border-white/20 bg-white/5">
          <p className="text-sm text-gray-300">
            {t("checkout.reservationNotice", { price: formatPrice(reservationPrice, locale, usdToCrc) })}
          </p>
        </div>
      )}
      {hasCustomSession && !hasReservation && (
        <div className="mb-6 p-4 border border-white/20 bg-white/5">
          <p className="text-sm text-gray-300">
            {t("checkout.customSessionNotice")}
          </p>
        </div>
      )}

      {needsShipping && (
        <div className="mb-6 space-y-3">
          <div className="p-4 border border-white/20 bg-white/5">
            <p className="text-sm text-gray-200">
              {t("checkout.shippingGamNote")}
            </p>
          </div>
          <div className="p-4 border border-amber-500/30 bg-amber-500/5">
            <p className="text-sm text-amber-200/90">
              {t("checkout.shippingZoneWarning")}
            </p>
          </div>
        </div>
      )}

      <div className="border border-white/20 bg-white/[0.02] p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-white/20">
          <span className="text-xs uppercase tracking-widest text-gray-300">
            {totalItems} {totalItems === 1 ? t("cart.item") : t("cart.items")}
          </span>
          <div className="text-right">
            <span className="text-lg text-white font-medium" data-testid="text-checkout-total">
              {formatPrice(displayTotal, locale, usdToCrc)}
            </span>
            {needsShipping && shippingCost > 0 && (
              <span className="block text-sm text-gray-300 mt-0.5">
                + {formatShippingCost(shippingCost, locale, usdToCrc)} {t("checkout.shipping")}
              </span>
            )}
            {needsShipping && isIntl && (
              <span className="block text-sm text-gray-300 mt-0.5">
                {t("checkout.shippingToConvenir")}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={form.discountCode ?? ""}
            onChange={(e) => onUpdateForm({ discountCode: e.target.value })}
            className={`${inputClass} flex-1`}
            placeholder={t("checkout.discountCode")}
            data-testid="input-discount-code"
          />
          <button
            type="button"
            className="px-6 py-3 text-sm uppercase tracking-widest border border-white/30 text-gray-300 hover:text-white hover:border-white/50 transition-colors shrink-0"
            data-testid="button-apply-discount"
          >
            {t("checkout.apply")}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t("checkout.name")} *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onUpdateForm({ name: e.target.value })}
              className={inputClass}
              placeholder={t("checkout.namePlaceholder")}
              required
              data-testid="input-checkout-name"
            />
            {formErrors.name && (
              <p className="text-red-400 text-xs mt-1" data-testid="error-checkout-name">
                {formErrors.name}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>{t("checkout.email")} *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onUpdateForm({ email: e.target.value })}
              className={inputClass}
              placeholder={t("checkout.emailPlaceholder")}
              required
              data-testid="input-checkout-email"
            />
            {formErrors.email && (
              <p className="text-red-400 text-xs mt-1" data-testid="error-checkout-email">
                {formErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>{t("checkout.phone")} *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => onUpdateForm({ phone: e.target.value })}
              className={inputClass}
              placeholder={t("checkout.phonePlaceholder")}
              required
              data-testid="input-checkout-phone"
            />
            {formErrors.phone && (
              <p className="text-red-400 text-xs mt-1" data-testid="error-checkout-phone">
                {formErrors.phone}
              </p>
            )}
          </div>

          {needsShipping && (
            <>
              <div>
                <label className={`${labelClass} flex items-center gap-2`}>
                  <span>{t("checkout.shippingZone")} *</span>
                  <ShippingZoneModal />
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(["GAM", "NON_GAM", "INTERNATIONAL"] as ShippingZone[]).map((zone) => (
                    <button
                      key={zone}
                      type="button"
                      onClick={() =>
                        onUpdateForm({
                          shippingZone: zone,
                          shippingMethod:
                            zone === "NON_GAM"
                              ? "STANDARD"
                              : zone === "INTERNATIONAL"
                                ? "A_CONVENIR"
                                : form.shippingMethod ?? "STANDARD",
                        })
                      }
                      className={`flex-1 min-w-[120px] py-3 px-4 text-sm uppercase tracking-wider border transition-colors ${
                        form.shippingZone === zone
                          ? "border-white bg-white/10 text-white"
                          : "border-white/20 text-gray-400 hover:border-white/40 hover:text-white"
                      }`}
                      data-testid={`button-zone-${zone}`}
                    >
                      {zone === "GAM"
                        ? t("checkout.gam")
                        : zone === "NON_GAM"
                          ? t("checkout.nonGam")
                          : t("checkout.international")}
                    </button>
                  ))}
                </div>
                {formErrors.shippingZone && (
                  <p className="text-red-400 text-xs mt-1" data-testid="error-shipping-zone">
                    {formErrors.shippingZone}
                  </p>
                )}
              </div>

              {form.shippingZone && (
                <div>
                  <label className={labelClass}>{t("checkout.shippingMethod")} *</label>
                  <div className="space-y-2 mt-2">
                    {methods.map((method) => {
                      if (method === "A_CONVENIR") {
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() =>
                              onUpdateForm({ shippingMethod: method })
                            }
                            className={`w-full py-3 px-4 text-left text-sm border transition-colors flex items-center justify-between ${
                              form.shippingMethod === method
                                ? "border-white bg-white/10 text-white"
                                : "border-white/20 text-gray-400 hover:border-white/40 hover:text-white"
                            }`}
                            data-testid={`button-method-${method}`}
                          >
                            <span>{t("checkout.aConvenir")}</span>
                            <span className="text-gray-500 text-xs">
                              {t("checkout.aConvenirNote")}
                            </span>
                          </button>
                        );
                      }
                      const cost =
                        form.shippingZone === "GAM"
                          ? method === "STANDARD"
                            ? SHIPPING_COSTS.GAM.STANDARD
                            : SHIPPING_COSTS.GAM.NEXT_DAY
                          : SHIPPING_COSTS.NON_GAM.STANDARD;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() =>
                            onUpdateForm({
                              shippingMethod: method,
                              nextDayAccepted: method === "NEXT_DAY" ? false : undefined,
                            })
                          }
                          className={`w-full py-3 px-4 text-left text-sm border transition-colors flex items-center justify-between ${
                            form.shippingMethod === method
                              ? "border-white bg-white/10 text-white"
                              : "border-white/20 text-gray-400 hover:border-white/40 hover:text-white"
                          }`}
                          data-testid={`button-method-${method}`}
                        >
                          <span>
                            {method === "STANDARD"
                              ? t("checkout.standard")
                              : t("checkout.nextDay")}
                          </span>
                          <span className="font-medium">{formatShippingCost(cost, locale, usdToCrc)}</span>
                        </button>
                      );
                    })}
                  </div>
                  {formErrors.shippingMethod && (
                    <p className="text-red-400 text-xs mt-1" data-testid="error-shipping-method">
                      {formErrors.shippingMethod}
                    </p>
                  )}

                  {showNextDayWarning && (
                    <div className="mt-4 p-4 border border-amber-500/30 bg-amber-500/5 space-y-3">
                      <p className="text-sm text-amber-200/90">
                        {t("checkout.nextDayWarning")}
                      </p>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.nextDayAccepted ?? false}
                          onChange={(e) =>
                            onUpdateForm({ nextDayAccepted: e.target.checked })
                          }
                          className="mt-1 w-4 h-4 rounded border-white/30 bg-transparent text-amber-500 focus:ring-amber-500/50"
                          data-testid="checkbox-next-day-accepted"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {t("checkout.nextDayAccept")}
                        </span>
                      </label>
                      {formErrors.nextDayAccepted && (
                        <p className="text-red-400 text-xs" data-testid="error-next-day-accepted">
                          {formErrors.nextDayAccepted}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Dirección de entrega - CR */}
              {form.shippingZone === "GAM" || form.shippingZone === "NON_GAM" ? (
                <div className="space-y-4 pt-2 border-t border-white/20">
                  <p className="text-xs uppercase tracking-widest text-gray-300 mt-2">
                    {t("checkout.deliveryAddress")}
                  </p>
                  <div>
                    <label className={labelClass}>{t("checkout.provincia")} *</label>
                    <Select
                      value={form.provincia ?? ""}
                      onValueChange={(v) => onUpdateForm({ provincia: v })}
                    >
                      <SelectTrigger
                        className="h-12 w-full rounded-none border-white/30 bg-white/5 px-4 text-sm text-white placeholder:text-gray-400 focus:ring-white focus:border-white focus:bg-white/10 data-[state=open]:border-white"
                        data-testid="select-provincia"
                      >
                        <SelectValue placeholder={t("checkout.provinciaPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-neutral-950 text-white">
                        {PROVINCIAS_CR.map((p) => (
                          <SelectItem
                            key={p}
                            value={p}
                            className="focus:bg-white/10 focus:text-white"
                          >
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.provincia && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.provincia}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>{t("checkout.direccion")} *</label>
                    <textarea
                      value={form.puntoReferencia ?? ""}
                      onChange={(e) => onUpdateForm({ puntoReferencia: e.target.value })}
                      rows={3}
                      className={`${inputClass} resize-none`}
                      placeholder={t("checkout.direccionPlaceholder")}
                      data-testid="input-punto-referencia"
                    />
                    {formErrors.puntoReferencia && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.puntoReferencia}</p>
                    )}
                  </div>
                </div>
              ) : form.shippingZone === "INTERNATIONAL" ? (
                <div className="space-y-4 pt-2 border-t border-white/20">
                  <p className="text-xs uppercase tracking-widest text-gray-300 mt-2">
                    {t("checkout.deliveryAddressIntl")}
                  </p>
                  <div>
                    <label className={labelClass}>{t("checkout.pais")} *</label>
                    <input
                      type="text"
                      value={form.pais ?? ""}
                      onChange={(e) => onUpdateForm({ pais: e.target.value })}
                      className={inputClass}
                      placeholder={t("checkout.paisPlaceholder")}
                      data-testid="input-pais"
                    />
                    {formErrors.pais && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.pais}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>{t("checkout.direccion")} *</label>
                    <textarea
                      value={form.puntoReferencia ?? ""}
                      onChange={(e) => onUpdateForm({ puntoReferencia: e.target.value })}
                      rows={3}
                      className={`${inputClass} resize-none`}
                      placeholder={t("checkout.direccionIntlPlaceholder")}
                      data-testid="input-direccion-internacional"
                    />
                    {formErrors.puntoReferencia && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.puntoReferencia}</p>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}

          <div>
            <label className={labelClass}>{t("checkout.note")}</label>
            <textarea
              value={form.note}
              onChange={(e) => onUpdateForm({ note: e.target.value })}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder={t("checkout.notePlaceholder")}
              data-testid="input-checkout-note"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 text-sm uppercase tracking-widest border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
          data-testid="button-checkout-back"
        >
          {t("checkout.back")}
        </button>
        <button
          onClick={onValidate}
          className="flex-1 py-3 text-sm uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-all"
          data-testid="button-continue-payment"
        >
          {t("checkout.continuePayment")}
        </button>
      </div>
    </motion.div>
  );
}

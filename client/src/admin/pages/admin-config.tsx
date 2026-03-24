import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "../components/admin-layout";
import { formatAmountWithCommas, parseFormattedAmount } from "@/utils/format-amount-input";
import { getReservationShareUrl } from "@/constants/reservation-share";
import { useAdminConfig } from "../hooks/use-admin-config";
import { Button } from "@/components/ui/button";
import { ConfigVisualizer } from "../components/config-visualizer";
import { MediaUploadField } from "../components/media-upload-field";

type ConfigSection = "hero" | "artist" | "contact" | "reservation" | "tattooSession" | "pricing" | "footer";

const CR_COUNTRY_CODE = "506";

function parsePhoneFromWaUrl(href: string): string {
  const match = href?.match(/wa\.me\/(\d+)/);
  if (!match) return "";
  const full = match[1];
  if (full.startsWith(CR_COUNTRY_CODE)) {
    return full.slice(CR_COUNTRY_CODE.length);
  }
  return full;
}

function buildWaUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith(CR_COUNTRY_CODE) ? digits : CR_COUNTRY_CODE + digits;
  return `https://wa.me/${num}`;
}

export function AdminConfigPage() {
  const { t } = useTranslation();
  const { config, isLoading, update, isUpdating } = useAdminConfig();
  const [form, setForm] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<ConfigSection>("hero");

  useEffect(() => {
    if (!config) return;
    const hero = config.hero as { title?: string; videoUrl?: string; logoUrl?: string };
    const contact = config.contact as { whatsappUrl?: string; instagramUrl?: string };
    const footer = config.footer as {
      imageUrl?: string;
      ctaText?: string;
      whatsappUrl?: string;
      brandText?: string;
      copyrightText?: string;
      eclipticUrl?: string;
    };
    const reservation = config.reservation as {
      name?: string;
      price?: number;
      imageUrl?: string;
    };
    const tattooSession = config.tattooSession as { name?: string; imageUrl?: string; description?: string; descriptionEs?: string; descriptionEn?: string } | undefined;
    const artist = config.artist as {
      imageUrl?: string;
      badgeText?: string;
      bio?: string;
      bioEs?: string;
      bioEn?: string;
    };
    const pricing = config.pricing as { usdToCrc?: number } | undefined;
    const usdToCrc = Math.max(1, Number(pricing?.usdToCrc) || 500);
    // DB stores price in USD; form displays in colones. Detect legacy colones-stored values (>= 1000).
    const priceUsd =
      typeof reservation?.price === "number" && reservation.price >= 1000
        ? reservation.price / usdToCrc
        : (Number(reservation?.price) || 60);
    const priceColones = Math.round(priceUsd * usdToCrc);
    setForm({
      heroTitle: hero?.title ?? "",
      heroVideoUrl: hero?.videoUrl ?? "",
      heroLogoUrl: hero?.logoUrl ?? "",
      whatsappUrl: contact?.whatsappUrl ?? footer?.whatsappUrl ?? "",
      instagramUrl: contact?.instagramUrl ?? "",
      artistImageUrl: artist?.imageUrl ?? "",
      artistBadgeText: artist?.badgeText ?? "",
      artistBioEs: artist?.bioEs ?? artist?.bio ?? "",
      artistBioEn: artist?.bioEn ?? artist?.bio ?? "",
      reservationName: reservation?.name ?? "",
      reservationPrice: formatAmountWithCommas(String(priceColones), false),
      reservationImageUrl: reservation?.imageUrl ?? "",
      tattooSessionName: tattooSession?.name ?? "TTW Tattoo Session",
      tattooSessionImageUrl: tattooSession?.imageUrl ?? "/logo-ttw.png",
      tattooSessionDescriptionEs: tattooSession?.descriptionEs ?? tattooSession?.description ?? "Gracias por tatuarte con Tony The Witch. Te esperamos pronto.",
      tattooSessionDescriptionEn: tattooSession?.descriptionEn ?? tattooSession?.description ?? "Thanks for getting tattooed with Tony The Witch. See you soon.",
      footerImageUrl: footer?.imageUrl ?? "",
      footerCtaText: footer?.ctaText ?? "",
      footerBrandText: footer?.brandText ?? "",
      footerCopyright: footer?.copyrightText ?? "",
      usdToCrc: formatAmountWithCommas(String(pricing?.usdToCrc ?? 500), false),
    });
  }, [config]);

  const [saveError, setSaveError] = useState<string | null>(null);

  const whatsappPhone = parsePhoneFromWaUrl(form.whatsappUrl ?? "");
  const setWhatsappPhone = (phone: string) => {
    const url = buildWaUrl(phone || "0");
    setForm((p) => ({ ...p, whatsappUrl: url }));
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      await update({
      hero: {
        ...(config?.hero as object),
        title: form.heroTitle,
        videoUrl: form.heroVideoUrl,
        logoUrl: form.heroLogoUrl,
      },
      contact: {
        ...(config?.contact as object),
        whatsappUrl: form.whatsappUrl,
        instagramUrl: form.instagramUrl,
      },
      artist: {
        ...(config?.artist as object),
        imageUrl: form.artistImageUrl,
        badgeText: form.artistBadgeText,
        bioEs: form.artistBioEs,
        bioEn: form.artistBioEn,
      },
      reservation: {
        ...(config?.reservation as object),
        name: form.reservationName,
        price: Math.max(0, parseFormattedAmount(form.reservationPrice, false) || 0) / Math.max(1, parseFormattedAmount(form.usdToCrc, false) || 500),
        imageUrl: form.reservationImageUrl,
      },
      tattooSession: {
        ...(config?.tattooSession as object),
        name: form.tattooSessionName?.trim() || "TTW Tattoo Session",
        imageUrl: form.tattooSessionImageUrl || "/logo-ttw.png",
        descriptionEs: form.tattooSessionDescriptionEs?.trim() || "Gracias por tatuarte con Tony The Witch. Te esperamos pronto.",
        descriptionEn: form.tattooSessionDescriptionEn?.trim() || "Thanks for getting tattooed with Tony The Witch. See you soon.",
      },
      footer: {
        ...(config?.footer as object),
        imageUrl: form.footerImageUrl,
        ctaText: form.footerCtaText,
        whatsappUrl: form.whatsappUrl,
        brandText: form.footerBrandText,
        copyrightText: form.footerCopyright,
      },
      pricing: {
        ...(config?.pricing as object),
        usdToCrc: Math.max(1, Math.round(parseFormattedAmount(form.usdToCrc, false) || 500)),
      },
    });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t("admin.saveError"));
    }
  };

  const heroPreviewData = {
    videoUrl: form.heroVideoUrl || "/home-video.mp4",
    logoUrl: form.heroLogoUrl || "/logo-ttw.png",
    title: form.heroTitle || "TONY THE WITCH",
  };

  const footerPreviewData = {
    imageUrl: form.footerImageUrl || "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=800&auto=format&fit=crop",
    ctaText: form.footerCtaText || "Let's Talk",
    whatsappUrl: form.whatsappUrl || "https://wa.me/",
    brandText: form.footerBrandText || "TTW",
    copyrightText: form.footerCopyright || "—",
    eclipticUrl: (config?.footer as { eclipticUrl?: string })?.eclipticUrl || "https://eclipticsolutions.com",
  };

  if (isLoading || !config) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto pt-6 flex justify-center w-full">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const sections: { id: ConfigSection; label: string }[] = [
    { id: "hero", label: t("admin.sections.hero") },
    { id: "artist", label: t("admin.sections.artist") },
    { id: "contact", label: t("admin.sections.contact") },
    { id: "reservation", label: t("admin.sections.reservation") },
    { id: "tattooSession", label: t("admin.sections.tattooSession") },
    { id: "pricing", label: t("admin.sections.pricing") },
    { id: "footer", label: t("admin.sections.footer") },
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl w-full mx-auto pt-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 sm:mb-8">
          {t("admin.siteConfig")}
        </h1>

        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === id
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeSection === "hero" && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
                <InputField
                  label={t("admin.heroTitle")}
                  value={form.heroTitle}
                  onChange={(v) => setForm((p) => ({ ...p, heroTitle: v }))}
                />
                <MediaUploadField
                  label={t("admin.heroVideo")}
                  value={form.heroVideoUrl}
                  onChange={(v) => setForm((p) => ({ ...p, heroVideoUrl: v }))}
                  type="video"
                />
                <MediaUploadField
                  label={t("admin.heroLogo")}
                  value={form.heroLogoUrl}
                  onChange={(v) => setForm((p) => ({ ...p, heroLogoUrl: v }))}
                  type="image"
                />
              </div>
              <ConfigVisualizer variant="hero" data={heroPreviewData} />
            </div>
          )}

          {activeSection === "artist" && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
              <MediaUploadField
                label={t("admin.artistImage")}
                value={form.artistImageUrl}
                onChange={(v) => setForm((p) => ({ ...p, artistImageUrl: v }))}
                type="image"
              />
              <InputField
                label={t("admin.artistBadge")}
                value={form.artistBadgeText}
                onChange={(v) => setForm((p) => ({ ...p, artistBadgeText: v }))}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("admin.artistBioEs")}
                </label>
                <textarea
                  value={form.artistBioEs}
                  onChange={(e) => setForm((p) => ({ ...p, artistBioEs: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 focus:border-transparent font-mono text-sm"
                  placeholder={t("admin.artistBioEsPlaceholder")}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {t("admin.artistBioEsHint")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("admin.artistBioEn")}
                </label>
                <textarea
                  value={form.artistBioEn}
                  onChange={(e) => setForm((p) => ({ ...p, artistBioEn: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 focus:border-transparent font-mono text-sm"
                  placeholder={t("admin.artistBioEnPlaceholder")}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {t("admin.artistBioEnHint")}
                </p>
              </div>
            </div>
          )}

          {activeSection === "tattooSession" && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
              <p className="text-sm text-slate-600">
                {t("admin.tattooSessionDesc")}
              </p>
              <InputField
                label={t("admin.tattooSessionName")}
                value={form.tattooSessionName}
                onChange={(v) => setForm((p) => ({ ...p, tattooSessionName: v }))}
                placeholder="TTW Tattoo Session"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("admin.tattooSessionMsgEs")}</label>
                <textarea
                  value={form.tattooSessionDescriptionEs}
                  onChange={(e) => setForm((p) => ({ ...p, tattooSessionDescriptionEs: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  placeholder="Gracias por tatuarte con Tony The Witch. Te esperamos pronto."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("admin.tattooSessionMsgEn")}</label>
                <textarea
                  value={form.tattooSessionDescriptionEn}
                  onChange={(e) => setForm((p) => ({ ...p, tattooSessionDescriptionEn: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  placeholder="Thanks for getting tattooed with Tony The Witch. See you soon."
                />
                <p className="text-xs text-slate-500 mt-1">{t("admin.tattooSessionHint")}</p>
              </div>
              <MediaUploadField
                label={t("admin.tattooSessionImage")}
                value={form.tattooSessionImageUrl}
                onChange={(v) => setForm((p) => ({ ...p, tattooSessionImageUrl: v }))}
                type="image"
              />
            </div>
          )}

          {activeSection === "reservation" && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
              <InputField
                label={t("admin.reservationServiceName")}
                value={form.reservationName}
                onChange={(v) => setForm((p) => ({ ...p, reservationName: v }))}
                placeholder={t("admin.reservationServiceNamePlaceholder")}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("admin.reservationPriceCrc")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.reservationPrice}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      reservationPrice: formatAmountWithCommas(e.target.value.replace(/\D/g, ""), false),
                    }))
                  }
                  placeholder="30,000"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  {t("admin.reservationPriceHint", { rate: form.usdToCrc || 500 })}
                </p>
              </div>
              <MediaUploadField
                label={t("admin.reservationImage")}
                value={form.reservationImageUrl}
                onChange={(v) => setForm((p) => ({ ...p, reservationImageUrl: v }))}
                type="image"
              />
              <div className="pt-4 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("admin.reservationShareLink")}
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  {t("admin.reservationShareHint")}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== "undefined" ? getReservationShareUrl() : "/cart?reserva=1"}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(getReservationShareUrl());
                        alert(t("admin.linkCopied"));
                      } catch {
                        alert(t("admin.linkCopyError"));
                      }
                    }}
                  >
                    {t("admin.copy")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "pricing" && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("admin.exchangeRate")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.usdToCrc}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      usdToCrc: formatAmountWithCommas(e.target.value.replace(/\D/g, ""), false),
                    }))
                  }
                  placeholder="500"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  {t("admin.exchangeRateHint")}
                </p>
              </div>
            </div>
          )}

          {activeSection === "contact" && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("admin.whatsappCr")}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm">+506</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={whatsappPhone}
                    onChange={(e) =>
                      setWhatsappPhone(e.target.value.replace(/\D/g, "").slice(0, 8))
                    }
                    placeholder="7128 0996"
                    maxLength={8}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {t("admin.whatsappHint")}
                </p>
              </div>
              <InputField
                label={t("admin.instagramUrl")}
                value={form.instagramUrl}
                onChange={(v) => setForm((p) => ({ ...p, instagramUrl: v }))}
              />
            </div>
          )}

          {activeSection === "footer" && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
                <MediaUploadField
                  label={t("admin.footerBgImage")}
                  value={form.footerImageUrl}
                  onChange={(v) => setForm((p) => ({ ...p, footerImageUrl: v }))}
                  type="image"
                />
                <InputField
                  label={t("admin.footerCtaText")}
                  value={form.footerCtaText}
                  onChange={(v) => setForm((p) => ({ ...p, footerCtaText: v }))}
                />
                <InputField
                  label={t("admin.footerBrand")}
                  value={form.footerBrandText}
                  onChange={(v) => setForm((p) => ({ ...p, footerBrandText: v }))}
                />
                <InputField
                  label={t("admin.footerCopyright")}
                  value={form.footerCopyright}
                  onChange={(v) => setForm((p) => ({ ...p, footerCopyright: v }))}
                />
              </div>
              <ConfigVisualizer variant="footer" data={footerPreviewData} />
            </div>
          )}
        </div>

        {saveError && (
          <p className="mt-4 text-sm text-red-600">{saveError}</p>
        )}
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="mt-6"
        >
          {isUpdating ? t("admin.saving") : t("admin.save")}
        </Button>
      </div>
    </AdminLayout>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 focus:border-transparent"
      />
    </div>
  );
}

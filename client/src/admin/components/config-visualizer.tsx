import { useState } from "react";
import { Smartphone, Monitor } from "lucide-react";

export type HeroPreviewData = {
  videoUrl: string;
  logoUrl: string;
  title: string;
};

export type FooterPreviewData = {
  imageUrl: string;
  ctaText: string;
  whatsappUrl: string;
  brandText: string;
  copyrightText: string;
  eclipticUrl: string;
};

type ViewportMode = "mobile" | "desktop";

interface ConfigVisualizerProps {
  variant: "hero" | "footer";
  data: HeroPreviewData | FooterPreviewData;
  className?: string;
}

// Proporciones reales del sitio:
// Hero: 110vh altura, logo 72vh mobile / 68-72vh desktop
// Footer: 28vh mobile / 35vh desktop
// Mobile viewport típico: 375x812
// Desktop viewport típico: 1440x900

const MOBILE_WIDTH = 320;
const MOBILE_VIEWPORT_HEIGHT = 693; // 812 * (320/375) - proporción iPhone
const DESKTOP_WIDTH = 960;
const DESKTOP_VIEWPORT_HEIGHT = 600;
const HERO_HEIGHT_RATIO = 1.1; // 110vh

export function ConfigVisualizer({ variant, data, className = "" }: ConfigVisualizerProps) {
  const [viewport, setViewport] = useState<ViewportMode>("desktop");

  const heroHeightMobile = MOBILE_VIEWPORT_HEIGHT;
  const heroHeightDesktop = Math.round(DESKTOP_WIDTH * HERO_HEIGHT_RATIO);
  const footerHeightMobile = Math.round(MOBILE_VIEWPORT_HEIGHT * 0.28);
  const footerHeightDesktop = Math.round(DESKTOP_VIEWPORT_HEIGHT * 0.35);

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <span className="text-sm font-medium text-slate-700">Vista previa</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`p-2 rounded-md transition-colors ${
              viewport === "mobile"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Mobile"
          >
            <Smartphone size={18} />
          </button>
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`p-2 rounded-md transition-colors ${
              viewport === "desktop"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Desktop"
          >
            <Monitor size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 overflow-auto flex flex-col items-center min-h-[240px]">
        {viewport === "mobile" && (
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-xs text-slate-500 mb-2">Mobile (375×812)</span>
            {/* Marco de teléfono con biseles */}
            <div
              className="rounded-[2.5rem] p-2.5 bg-slate-800 shadow-2xl shadow-slate-400/20 border-2 border-slate-600"
              style={{ width: MOBILE_WIDTH + 20, height: MOBILE_VIEWPORT_HEIGHT + 20 }}
            >
              <div className="w-full h-full rounded-[2rem] overflow-hidden bg-black">
                {variant === "hero" && (
                  <HeroPreview
                    data={data as HeroPreviewData}
                    isMobile
                    height={heroHeightMobile}
                    width={MOBILE_WIDTH}
                  />
                )}
                {variant === "footer" && (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 min-h-0 bg-neutral-900" />
                    <FooterPreview
                      data={data as FooterPreviewData}
                      isMobile
                      height={footerHeightMobile}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewport === "desktop" && (
          <div className="flex flex-col items-center flex-shrink-0 w-full max-w-full">
            <span className="text-xs text-slate-500 mb-2">Desktop (1440×900)</span>
            <div
              className="rounded-xl overflow-hidden border-2 border-slate-400 shadow-2xl shadow-slate-400/20 bg-slate-700 w-full"
              style={{ maxWidth: DESKTOP_WIDTH + 24 }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 border-b border-slate-600">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 mx-4 h-7 rounded-md bg-slate-600/80 flex items-center px-3 max-w-md">
                  <span className="text-xs text-slate-400 truncate">
                    https://tonythewitch.com
                  </span>
                </div>
              </div>
              <div
                className="overflow-hidden bg-black"
                style={
                  variant === "footer"
                    ? { height: DESKTOP_VIEWPORT_HEIGHT, minHeight: DESKTOP_VIEWPORT_HEIGHT }
                    : undefined
                }
              >
                {variant === "hero" && (
                  <HeroPreview
                    data={data as HeroPreviewData}
                    isMobile={false}
                    height={heroHeightDesktop}
                    width={DESKTOP_WIDTH}
                  />
                )}
                {variant === "footer" && (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 min-h-0 bg-neutral-900" />
                    <FooterPreview
                      data={data as FooterPreviewData}
                      isMobile={false}
                      height={footerHeightDesktop}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroPreview({
  data,
  isMobile,
  height,
  width,
}: {
  data: HeroPreviewData;
  isMobile: boolean;
  height: number;
  width: number;
}) {
  const logoHeightMobile = height * 0.72; // 72vh
  const logoHeightDesktop = height * 0.68; // 68vh

  return (
    <div
      className="relative w-full overflow-hidden flex items-center justify-center bg-black"
      style={{ height, minHeight: height }}
    >
      <div className="absolute inset-0 z-0">
        <video
          src={data.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>
      <div className="relative z-20 flex flex-col items-center justify-center w-full px-4">
        {isMobile ? (
          <>
            <img
              src={data.logoUrl}
              alt={data.title}
              className="w-auto drop-shadow-2xl object-contain block mb-4"
              style={{ maxHeight: logoHeightMobile }}
            />
            <h2 className="text-xs tracking-[0.4em] uppercase text-gray-400 font-medium text-center">
              {data.title || "TONY THE WITCH"}
            </h2>
          </>
        ) : (
          <>
            <h2 className="text-sm tracking-[0.5em] uppercase text-gray-400 font-medium text-center mb-2">
              {data.title || "TONY THE WITCH"}
            </h2>
            <img
              src={data.logoUrl}
              alt={data.title}
              className="w-auto drop-shadow-2xl object-contain block"
              style={{ maxHeight: logoHeightDesktop }}
            />
          </>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-30 h-2/3 bg-gradient-to-t from-black via-black/50 via-black/20 via-black/5 to-transparent pointer-events-none" />
    </div>
  );
}

function FooterPreview({
  data,
  isMobile,
  height,
}: {
  data: FooterPreviewData;
  isMobile: boolean;
  height: number;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ height, minHeight: height }}
    >
      <img
        src={data.imageUrl}
        alt={data.brandText}
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black from-30% via-black/80 via-60% to-black/30" />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
        <a
          href={data.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group mb-6"
        >
          <span
            className={`text-white tracking-wider ${
              isMobile ? "text-2xl" : "text-4xl"
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.ctaText || "Let's Talk"}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`text-white/80 ${isMobile ? "w-7 h-7" : "w-10 h-10"}`}
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
        <div
          style={{ fontFamily: "var(--font-display)" }}
          className={`font-bold tracking-wider text-white mb-3 ${isMobile ? "text-xl" : "text-2xl"}`}
        >
          {data.brandText || "TTW"}
        </div>
        <div className="text-gray-400 text-xs tracking-wider text-center flex flex-wrap justify-center items-center gap-x-1 gap-y-1">
          <span>© {new Date().getFullYear()} {data.copyrightText || "—"}</span>
          <span>/</span>
          <span>
            Powered by{" "}
            <a
              href={data.eclipticUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Ecliptic Solutions
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

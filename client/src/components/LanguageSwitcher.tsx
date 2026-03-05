import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import type { Locale } from "@/i18n";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const current = (i18n.language?.slice(0, 2) || "en") as Locale;

  const toggle = () => {
    const next = current === "en" ? "es" : "en";
    i18n.changeLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-1.5 text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-300 ${className}`}
      title={current === "en" ? "Cambiar a español" : "Switch to English"}
      data-testid="button-lang-switch"
    >
      <Globe size={16} />
      <span>{current === "en" ? "ES" : "EN"}</span>
    </button>
  );
}

import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GAM_ZONAS = [
  "Escazú",
  "Santa Ana",
  "Desamparados",
  "Moravia",
  "Heredia Centro",
  "Belén",
  "Alajuela Centro",
  "Grecia",
  "Cartago Centro",
  "La Unión",
];

const FUERA_GAM = [
  "Pérez Zeledón",
  "San Carlos",
  "Sarapiquí",
  "Turrialba",
  "Guanacaste",
  "Limón",
  "Puntarenas",
];

export function ShippingZoneModal() {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/30 text-gray-300 hover:text-white hover:border-white/50 transition-colors ml-2 shrink-0"
          title={t("shipping.zoneInfo")}
          data-testid="button-zone-info"
        >
          <ChevronDown size={16} className="rotate-[-90deg]" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-950 border-white/10 text-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-display">{t("shipping.zoneTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 text-sm">
          <div>
            <h4 className="text-white font-medium mb-2 uppercase tracking-wider">
              {t("shipping.gamTitle")}
            </h4>
            <p className="text-gray-400 mb-3">
              {t("shipping.gamDesc")}
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-300">
              {GAM_ZONAS.map((z) => (
                <li key={z}>• {z}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2 uppercase tracking-wider">
              {t("shipping.nonGamTitle")}
            </h4>
            <p className="text-gray-400 mb-3">
              {t("shipping.nonGamDesc")}
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-300">
              {FUERA_GAM.map((z) => (
                <li key={z}>• {z}</li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

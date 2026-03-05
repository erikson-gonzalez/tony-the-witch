import { useState, useCallback, useEffect } from "react";
import { AdminLayout } from "../components/admin-layout";
import { useAdminNavCards } from "../hooks/use-admin-nav-cards";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import { DEFAULT_NAV_CARDS } from "@/constants/nav-cards-recovery";
import { isStandardNavCard } from "@/utils/nav-card-i18n";
import { NavCardComponent } from "@/components/home/nav-card";

const CR_COUNTRY_CODE = "506";

function isWhatsAppContactCard(href: string): boolean {
  return href.startsWith("https://wa.me/");
}

function parsePhoneFromWaUrl(href: string): string {
  const match = href.match(/wa\.me\/(\d+)/);
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

const ROUTE_OPTIONS: { label: string; href: string }[] = [
  { label: "Portfolio", href: "/portfolio" },
  { label: "Shop", href: "/shop" },
  { label: "Contact (WhatsApp)", href: "https://wa.me/" },
  { label: "Instagram", href: "https://instagram.com/" },
];

interface NavCardRow {
  id: number;
  title: string;
  subtitle: string;
  href: string;
  external: boolean;
  image: string;
}

export function AdminNavCardsPage() {
  const { navCards, isLoading, create, update, remove, isMutating } =
    useAdminNavCards();
  const [editing, setEditing] = useState<NavCardRow | null>(null);
  const [cardToDelete, setCardToDelete] = useState<NavCardRow | null>(null);

  const handleDeleteClick = (card: NavCardRow) => {
    setCardToDelete(card);
  };

  const handleConfirmDelete = async () => {
    if (cardToDelete) {
      await remove(cardToDelete.id);
      setCardToDelete(null);
    }
  };

  const handleRestoreTemplate = async (template: (typeof DEFAULT_NAV_CARDS)[number]) => {
    await create({
      title: template.title,
      subtitle: template.subtitle,
      href: template.href,
      external: template.external,
      image: template.image,
    });
  };

  const handleSaveEdit = async (data: Omit<NavCardRow, "id">) => {
    if (editing) {
      await update({ id: editing.id, data });
      setEditing(null);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto pt-6 flex justify-center w-full">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pt-6 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Nav Cards</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-slate-600">
                Título
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-slate-600">
                Subtítulo
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-slate-600">
                URL
              </th>
              <th className="w-20 sm:w-24 px-2" />
            </tr>
          </thead>
          <tbody>
            {(navCards as unknown as NavCardRow[]).map((card) => (
              <tr key={card.id} className="border-b border-slate-100">
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-900 text-sm sm:text-base">{card.title}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 text-sm hidden sm:table-cell">{card.subtitle}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
                  {card.href}
                </td>
                <td className="px-2 sm:px-6 py-3 sm:py-4">
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => setEditing(card)}
                      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(card)}
                      disabled={isMutating}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Vista previa</h3>
        <div className="bg-slate-900 rounded-xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {(navCards as unknown as NavCardRow[]).map((card, index) => (
              <NavCardComponent
                key={card.id}
                card={card as unknown as import("@/types/content").NavCardItem}
                index={index}
                preview
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <RotateCcw size={16} />
          Recuperar tarjeta por defecto
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Si eliminaste una tarjeta, podés recuperarla con una de estas plantillas:
        </p>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_NAV_CARDS.map((template) => (
            <Button
              key={template.href + template.title}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRestoreTemplate(template)}
              disabled={isMutating}
              className="text-slate-700"
            >
              + {template.title}
            </Button>
          ))}
        </div>
      </div>

      <AlertDialog open={!!cardToDelete} onOpenChange={(open) => !open && setCardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarjeta?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar la tarjeta &quot;{cardToDelete?.title}&quot;. Esta acción no se puede deshacer.
              Podés recuperarla después con &quot;Recuperar tarjeta por defecto&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={isMutating}
            >
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editing && (
        <NavCardForm
          initial={editing}
          onSave={handleSaveEdit}
          onClose={() => setEditing(null)}
          isLoading={isMutating}
        />
      )}
      </div>
    </AdminLayout>
  );
}

function NavCardForm({
  initial,
  onSave,
  onClose,
  isLoading,
}: {
  initial?: NavCardRow;
  onSave: (data: Omit<NavCardRow, "id">) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [href, setHref] = useState(initial?.href ?? ROUTE_OPTIONS[0]?.href ?? "");
  const [external, setExternal] = useState(initial?.external ?? false);
  const [image, setImage] = useState<string>(initial?.image ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(
    initial?.image?.startsWith("data:") || initial?.image?.startsWith("http") ? initial.image : null
  );

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setSubtitle(initial.subtitle);
      setHref(initial.href);
      setExternal(initial.external);
      setImage(initial.image);
      setImagePreview(initial.image);
    }
  }, [initial]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImage(dataUrl);
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    []
  );

  const clearImage = useCallback(() => {
    setImage("");
    setImagePreview(null);
  }, []);

  const [phoneNumber, setPhoneNumber] = useState(
    initial && isWhatsAppContactCard(initial.href) ? parsePhoneFromWaUrl(initial.href) : ""
  );

  useEffect(() => {
    if (initial && isWhatsAppContactCard(initial.href)) {
      setPhoneNumber(parsePhoneFromWaUrl(initial.href));
    }
  }, [initial]);

  const isWhatsAppOnly = !!initial && isWhatsAppContactCard(initial.href);
  const isStandardCard = !!initial && isStandardNavCard(initial.href) && !isWhatsAppOnly;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isWhatsAppOnly) {
      const newHref = buildWaUrl(phoneNumber);
      if (!phoneNumber.trim()) return;
      await onSave({ title: initial!.title, subtitle: initial!.subtitle, href: newHref, external, image });
      return;
    }
    if (isStandardCard && initial) {
      await onSave({ title: initial.title, subtitle: initial.subtitle, href: initial.href, external: initial.external, image });
      return;
    }
    if (!image.trim()) return;
    await onSave({ title, subtitle, href, external, image });
  };

  const routeMatch = ROUTE_OPTIONS.find((r) => r.href === href);

  if (isWhatsAppOnly) {
    return (
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact (WhatsApp)</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 -mt-2">
            Solo podés modificar la imagen y el número de teléfono para Costa Rica (+506).
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Imagen</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
              />
              {imagePreview && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-20 w-20 object-cover rounded border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-1 -right-1 p-1 bg-slate-700 text-white rounded-full text-xs hover:bg-slate-800"
                    aria-label="Quitar imagen"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <div>
              <Label>Número de teléfono (CR)</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500 text-sm">+506</span>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="7128 0996"
                  maxLength={8}
                  className="flex-1 font-mono"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                8 dígitos, sin espacios ni guiones
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || phoneNumber.replace(/\D/g, "").length < 8}
              >
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  if (isStandardCard) {
    return (
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar imagen</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 -mt-2">
            Solo podés cambiar la imagen. El título y subtítulo se muestran según el idioma del sitio.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Imagen</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
              />
              {imagePreview && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-20 w-20 object-cover rounded border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-1 -right-1 p-1 bg-slate-700 text-white rounded-full text-xs hover:bg-slate-800"
                    aria-label="Quitar imagen"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !image.trim()}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar" : "Nueva"} tarjeta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
          <div>
            <Label className="text-slate-500">URL</Label>
            {initial ? (
              <Input
                value={href}
                disabled
                className="bg-slate-100 text-slate-500 cursor-not-allowed"
                readOnly
              />
            ) : (
              <Select
                value={routeMatch?.href ?? (href || ROUTE_OPTIONS[0]?.href)}
                onValueChange={setHref}
                required
              >
                <SelectTrigger className="bg-slate-100 text-slate-500 border-slate-200">
                  <SelectValue placeholder="Seleccionar ruta" />
                </SelectTrigger>
                <SelectContent>
                  {ROUTE_OPTIONS.map((r) => (
                    <SelectItem key={r.href} value={r.href}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Contactá a soporte para cambiar la ruta
            </p>
          </div>
          <div>
            <Label>Imagen</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
            />
            {imagePreview && (
              <div className="mt-2 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="h-20 w-20 object-cover rounded border border-slate-200"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-1 -right-1 p-1 bg-slate-700 text-white rounded-full text-xs hover:bg-slate-800"
                  aria-label="Quitar imagen"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="external"
              checked={external}
              onChange={(e) => setExternal(e.target.checked)}
              className="rounded border-slate-300"
            />
            <Label htmlFor="external">Enlace externo</Label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !image.trim()}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

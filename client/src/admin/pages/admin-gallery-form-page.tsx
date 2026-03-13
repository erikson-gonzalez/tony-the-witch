import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useParams } from "wouter";
import { AdminLayout } from "../components/admin-layout";
import { useAdminGallery } from "../hooks/use-admin-gallery";
import { useUpload } from "../hooks/use-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, X } from "lucide-react";
import { GALLERY_CATEGORIES } from "@/constants/gallery-data";

const MAX_IMAGES_PER_BATCH = 6;
const MAX_IMAGES_PER_CATEGORY = 18;

type ImageItem = { url: string; file?: File };

export function AdminGalleryFormPage() {
  const params = useParams<{ id?: string }>();
  const id = params.id === "new" ? null : params.id ? parseInt(params.id, 10) : null;
  const { works, isLoading, create, createBatch, update, isMutating } = useAdminGallery();
  const { upload, isUploading } = useUpload();

  const isNew = id === null || params.id === "new";
  const work = !isNew && id
    ? (works as Array<Record<string, unknown>>).find((w) => w.id === id)
    : null;

  const [images, setImages] = useState<ImageItem[]>([]);
  const [category, setCategory] = useState("");
  const [singleImageUrl, setSingleImageUrl] = useState("");

  const countByCategory = (works as Array<{ category: string }>).reduce(
    (acc, w) => {
      acc[w.category] = (acc[w.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const remainingInCategory = category
    ? MAX_IMAGES_PER_CATEGORY - (countByCategory[category] ?? 0)
    : MAX_IMAGES_PER_CATEGORY;

  const categoriesForSelect = GALLERY_CATEGORIES.filter((c) => c !== "All");

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter(
        (f) => f.type.startsWith("image/")
      );
      const remaining = MAX_IMAGES_PER_BATCH - images.length;
      if (remaining <= 0) return;

      const newItems: ImageItem[] = files
        .slice(0, remaining)
        .map((file) => ({ url: URL.createObjectURL(file), file }));
      setImages((prev) => [...prev, ...newItems]);
      e.target.value = "";
    },
    [images.length]
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const item = prev[index];
      if (item.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isNew) {
      if (images.length === 0) return;
      if (!category.trim()) return;
      if (images.length > remainingInCategory) {
        alert(
          `La categoría "${category}" solo puede tener ${remainingInCategory} imágenes más (máx. ${MAX_IMAGES_PER_CATEGORY} por categoría).`
        );
        return;
      }

      const imageUrls: string[] = [];
      for (const item of images) {
        if (item.file) {
          const result = await upload(item.file, "gallery");
          imageUrls.push(result.url);
        } else {
          imageUrls.push(item.url);
        }
      }

      const items = imageUrls.map((image) => ({
        image,
        category: category.trim(),
      }));

      await createBatch(items);
      window.history.replaceState(null, "", "/admin/gallery");
    } else if (id) {
      const data = {
        image: singleImageUrl,
        category: category.trim(),
      };
      await update({ id, data });
      window.history.replaceState(null, "", "/admin/gallery");
    }
  };

  const editInitialized = useRef(false);
  useEffect(() => {
    if (isNew) {
      editInitialized.current = false;
      return;
    }
    if (work && !editInitialized.current) {
      editInitialized.current = true;
      setSingleImageUrl((work.image as string) ?? "");
      setCategory((work.category as string) ?? "");
    }
  }, [isNew, work]);

  if (!isNew && isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto pt-6 flex justify-center py-12 w-full">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!isNew && !work) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto pt-6 text-center py-12 w-full">
          <p className="text-slate-600 mb-4">Obra no encontrada</p>
          <Link href="/admin/gallery">
            <a className="text-slate-900 underline">Volver a galería</a>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl w-full mx-auto pt-6">
        <Link href="/admin/gallery">
          <a className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6">
            <ArrowLeft size={16} />
            Volver a galería
          </a>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
          {isNew ? "Nueva obra" : "Editar obra"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isNew ? (
            <>
              <div>
                <Label className="text-slate-700">
                  Imágenes (máx. {MAX_IMAGES_PER_BATCH} por lote)
                </Label>
                <p className="text-sm text-slate-500 mt-0.5 mb-2">
                  Subí hasta 6 imágenes. El layout lo decide el componente.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
                />
                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {images.map((item, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded overflow-hidden bg-slate-100 border border-slate-300"
                      >
                        <img
                          src={item.url}
                          alt={`Previsualización ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white"
                          aria-label="Quitar imagen"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="category" className="text-slate-700">
                  Categoría
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="mt-1 h-12 bg-white border-slate-300 text-slate-900">
                    <SelectValue placeholder="Tatuajes, Pinturas, Cinematografía" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesForSelect.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c} (
                        {(countByCategory[c] ?? 0)}/{MAX_IMAGES_PER_CATEGORY})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {category && (
                  <p className="text-sm text-slate-500 mt-1">
                    Podés añadir hasta {remainingInCategory} imágenes más en
                    &quot;{category}&quot;
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="image" className="text-slate-700">
                  URL imagen
                </Label>
                <Input
                  id="image"
                  value={singleImageUrl}
                  onChange={(e) => setSingleImageUrl(e.target.value)}
                  required
                  className="mt-1 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-slate-700">
                  Categoría
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="mt-1 h-12 bg-white border-slate-300 text-slate-900">
                    <SelectValue placeholder="Tatuajes, Pinturas, Cinematografía" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesForSelect.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-4">
            <Button type="submit" disabled={isMutating || isUploading}>
              {isUploading ? "Subiendo imágenes..." : isMutating ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

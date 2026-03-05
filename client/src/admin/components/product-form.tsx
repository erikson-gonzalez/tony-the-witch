import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Plus } from "lucide-react";
import { useContent } from "@/hooks/use-content";
import { AVAILABLE_SIZES } from "../constants/product-sizes";

const MAX_IMAGES = 4;

type ImageItem = { url: string; file?: File };

export interface ProductFormData {
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  images: string[];
  sizes?: string[];
  sizeStock?: Record<string, number>;
  colors?: string[];
  colorStock?: Record<string, number>;
}

interface ProductFormProps {
  initial?: ProductFormData & { id?: number };
  onSave: (data: ProductFormData) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function ProductForm({
  initial,
  onSave,
  onClose,
  isLoading,
}: ProductFormProps) {
  const { config } = useContent();
  const categories =
    (config?.shop?.categories ?? []).filter((c) => c !== "All") || [
      "Apparel",
      "Art",
      "Tattoo Gift Cards",
      "Otros",
    ];

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [images, setImages] = useState<ImageItem[]>(
    (initial?.images ?? []).map((url) => ({ url }))
  );

  const [sizeStock, setSizeStock] = useState<Record<string, number>>(
    initial?.sizeStock ?? {}
  );
  const [colorRows, setColorRows] = useState<Array<{ name: string; stock: number }>>(
    initial?.colorStock
      ? Object.entries(initial.colorStock).map(([n, s]) => ({ name: n, stock: s }))
      : []
  );

  const handleSizeChange = useCallback((size: string, checked: boolean, stock: number) => {
    setSizeStock((prev) => {
      const next = { ...prev };
      if (checked) next[size] = Math.max(0, stock);
      else delete next[size];
      return next;
    });
  }, []);

  const handleSizeStockChange = useCallback((size: string, value: number) => {
    setSizeStock((prev) => ({ ...prev, [size]: Math.max(0, value) }));
  }, []);

  const addColorRow = useCallback(() => {
    setColorRows((prev) => [...prev, { name: "", stock: 0 }]);
  }, []);

  const updateColorRow = useCallback(
    (index: number, field: "name" | "stock", value: string | number) => {
      setColorRows((prev) =>
        prev.map((row, i) =>
          i === index ? { ...row, [field]: value } : row
        )
      );
    },
    []
  );

  const removeColorRow = useCallback((index: number) => {
    setColorRows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      const remaining = MAX_IMAGES - images.length;
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

    const imageUrls: string[] = images.map((item, i) =>
      item.url.startsWith("blob:")
        ? `https://placehold.co/400x400?text=Img+${i + 1}`
        : item.url
    );

    const sizes = Object.keys(sizeStock);
    const colorStock: Record<string, number> = {};
    colorRows.forEach((row) => {
      if (row.name.trim()) colorStock[row.name.trim()] = Math.max(0, row.stock);
    });
    const colors = Object.keys(colorStock);

    await onSave({
      slug,
      name,
      category,
      price: parseFloat(price) || 0,
      description,
      images: imageUrls.length ? imageUrls : ["https://placehold.co/400x400?text=Product"],
      sizes: sizes.length ? sizes : undefined,
      sizeStock: Object.keys(sizeStock).length ? sizeStock : undefined,
      colors: colors.length ? colors : undefined,
      colorStock: Object.keys(colorStock).length ? colorStock : undefined,
    });
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Editar" : "Nuevo"} producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Slug (URL)</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="producto-slug"
              required
              disabled={!!initial?.id}
            />
          </div>
          <div>
            <Label>Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Categoría</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Precio (CRC)</Label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div>
            <Label>Imágenes (máx. {MAX_IMAGES})</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((item, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
                >
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded text-white hover:bg-black/80"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Upload size={24} className="text-slate-400" />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label>Tallas y stock</Label>
            <div className="space-y-3 mt-2">
              {AVAILABLE_SIZES.map((size) => (
                <div
                  key={size}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-2 w-16">
                    <Checkbox
                      id={`size-${size}`}
                      checked={size in sizeStock}
                      onCheckedChange={(checked) =>
                        handleSizeChange(size, !!checked, sizeStock[size] ?? 0)
                      }
                    />
                    <Label htmlFor={`size-${size}`} className="font-normal">
                      {size}
                    </Label>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    value={size in sizeStock ? sizeStock[size] : ""}
                    onChange={(e) =>
                      handleSizeStockChange(size, parseInt(e.target.value, 10) || 0)
                    }
                    disabled={!(size in sizeStock)}
                    placeholder="Stock"
                    className="w-24"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Colores y stock</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addColorRow}
              >
                <Plus size={14} className="mr-1" />
                Añadir color
              </Button>
            </div>
            <div className="space-y-3">
              {colorRows.map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Input
                    placeholder="Nombre color"
                    value={row.name}
                    onChange={(e) => updateColorRow(i, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Stock"
                    value={row.stock || ""}
                    onChange={(e) =>
                      updateColorRow(i, "stock", parseInt(e.target.value, 10) || 0)
                    }
                    className="w-24"
                  />
                  <button
                    type="button"
                    onClick={() => removeColorRow(i)}
                    className="p-2 text-slate-500 hover:text-red-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

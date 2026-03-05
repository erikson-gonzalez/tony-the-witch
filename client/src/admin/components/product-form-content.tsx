import { useState, useCallback } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Upload, X, Plus, HelpCircle } from "lucide-react";
import { useContent } from "@/hooks/use-content";
import { calculateNetAmount, calculateRequiredPrice, FEE_LABELS } from "@/utils/price-calculator";
import { formatAmountWithCommas, parseFormattedAmount } from "@/utils/format-amount-input";
import { AVAILABLE_SIZES } from "../constants/product-sizes";

const MAX_IMAGES = 4;

type ImageItem = { url: string; file?: File };

/** sizeColorStock[size][colorName] = stock (undefined = vacío) */
type SizeColorStock = Record<string, Record<string, number | undefined>>;

interface ProductFormContentProps {
  initial?: {
    slug: string;
    name: string;
    category: string;
    price: number;
    description: string;
    images: string[];
    sizes?: string[];
    sizeStock?: Record<string, number>;
    sizeColorStock?: SizeColorStock;
    colors?: string[];
    colorStock?: Record<string, number>;
  };
  onSave: (data: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
}

export function ProductFormContent({
  initial,
  onSave,
  isLoading,
}: ProductFormContentProps) {
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
  const [price, setPrice] = useState(
    initial?.price != null ? formatAmountWithCommas(String(initial.price), true) : ""
  );
  const [desiredNetInput, setDesiredNetInput] = useState("");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [images, setImages] = useState<ImageItem[]>(
    (initial?.images ?? []).map((url) => ({ url }))
  );

  const [colorRows, setColorRows] = useState<Array<{ name: string }>>(() => {
    if (initial?.sizeColorStock) {
      const colors = new Set<string>();
      Object.values(initial.sizeColorStock).forEach((byColor) => {
        Object.keys(byColor).forEach((c) => colors.add(c));
      });
      return Array.from(colors).map((name) => ({ name }));
    }
    if (initial?.colors?.length) {
      return initial.colors.map((name) => ({ name }));
    }
    return [];
  });

  const [sizeColorStock, setSizeColorStock] = useState<SizeColorStock>(() => {
    if (initial?.sizeColorStock) return { ...initial.sizeColorStock };
    const out: SizeColorStock = {};
    const colors = initial?.colors ?? [];
    (initial?.sizes ?? []).forEach((size) => {
      const byColor: Record<string, number> = {};
      colors.forEach((color, i) => {
        byColor[color] = initial?.colorStock?.[color]
          ? Math.floor((initial.colorStock[color] ?? 0) / Math.max(1, colors.length))
          : initial?.sizeStock?.[size] && colors.length === 1
            ? (initial.sizeStock[size] ?? 0)
            : 0;
      });
      if (Object.keys(byColor).length) out[size] = byColor;
    });
    return out;
  });

  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(() => {
    if (initial?.sizes?.length) return new Set(initial.sizes);
    if (initial?.sizeColorStock) return new Set(Object.keys(initial.sizeColorStock));
    return new Set<string>();
  });

  const [noSizesRequired, setNoSizesRequired] = useState<boolean>(() => {
    if (!initial) return false;
    return !initial.sizes?.length;
  });

  const [stockByColorOnly, setStockByColorOnly] = useState<Record<string, number | undefined>>(() => {
    if (initial?.colorStock && !initial?.sizes?.length && initial?.colors?.length) {
      const out: Record<string, number | undefined> = {};
      initial.colors.forEach((c) => {
        if (initial.colorStock![c] != null) out[c] = initial.colorStock![c];
      });
      return out;
    }
    return {};
  });

  const [stockTotalOnly, setStockTotalOnly] = useState<string>(() => {
    if (initial?.colorStock && !initial?.sizes?.length && !initial?.colors?.length) {
      const total = Object.values(initial.colorStock).reduce((a, b) => a + (b ?? 0), 0);
      return String(total || "");
    }
    return "";
  });


  const handleStockByColorOnlyChange = useCallback((color: string, value: string) => {
    const num = value === "" ? undefined : Math.max(0, parseInt(value, 10) || 0);
    setStockByColorOnly((prev) => {
      const next = { ...prev, [color]: num };
      if (num === undefined) delete next[color];
      return next;
    });
  }, []);

  const [customSizes, setCustomSizes] = useState<Array<{ id: string; name: string }>>(() => {
    const fromSizes = initial?.sizes ?? [];
    const fromStock = initial?.sizeColorStock ? Object.keys(initial.sizeColorStock) : [];
    const customNames = [
      ...new Set([
        ...fromSizes.filter((s) => !AVAILABLE_SIZES.includes(s as (typeof AVAILABLE_SIZES)[number])),
        ...fromStock.filter((s) => !AVAILABLE_SIZES.includes(s as (typeof AVAILABLE_SIZES)[number])),
      ]),
    ];
    return customNames.map((name) => ({ id: name, name }));
  });

  const addCustomSize = useCallback(() => {
    const id = `custom-${Date.now()}`;
    setCustomSizes((prev) => [...prev, { id, name: "" }]);
    setSelectedSizes((prev) => new Set(prev).add(id));
  }, []);

  const updateCustomSizeName = useCallback((id: string, name: string) => {
    setCustomSizes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
  }, []);

  const removeCustomSize = useCallback((id: string) => {
    setCustomSizes((prev) => prev.filter((c) => c.id !== id));
    setSelectedSizes((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setSizeColorStock((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const allSizeRows = [
    ...AVAILABLE_SIZES.map((s) => ({ id: s, isCustom: false } as const)),
    ...customSizes.map((c) => ({ id: c.id, isCustom: true, name: c.name } as const)),
  ];

  const hasColors = colorRows.some((r) => r.name.trim());
  const colorsEnabled = colorRows.filter((r) => r.name.trim());

  const handleSizeToggle = useCallback((size: string, checked: boolean) => {
    setSelectedSizes((prev) => {
      const next = new Set(prev);
      if (checked) next.add(size);
      else next.delete(size);
      return next;
    });
  }, []);

  const handleSizeColorStockChange = useCallback(
    (size: string, color: string, value: string) => {
      const num = value === "" ? undefined : Math.max(0, parseInt(value, 10) || 0);
      setSizeColorStock((prev) => {
        const next = { ...prev, [size]: { ...(prev[size] ?? {}), [color]: num } };
        if (num === undefined) delete next[size][color];
        return next;
      });
    },
    []
  );

  const addColorRow = useCallback(() => {
    setColorRows((prev) => [...prev, { name: "" }]);
  }, []);

  const updateColorRow = useCallback(
    (index: number, name: string) => {
      const oldName = colorRows[index]?.name?.trim();
      setColorRows((prev) =>
        prev.map((row, i) => (i === index ? { ...row, name } : row))
      );
      if (oldName && oldName !== name.trim()) {
        setSizeColorStock((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((size) => {
            const byColor = { ...next[size] };
            if (oldName in byColor) {
              byColor[name.trim() || oldName] = byColor[oldName];
              delete byColor[oldName];
              next[size] = byColor;
            }
          });
          return next;
        });
      }
    },
    [colorRows]
  );

  const removeColorRow = useCallback(
    (index: number) => {
      const removedName = colorRows[index]?.name?.trim();
      setColorRows((prev) => prev.filter((_, i) => i !== index));
      if (removedName) {
        setSizeColorStock((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((size) => {
            const byColor = { ...next[size] };
            delete byColor[removedName];
            next[size] = byColor;
          });
          return next;
        });
      }
    },
    [colorRows]
  );

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

  const getStockTotal = useCallback(
    (size: string) => {
      const byColor = sizeColorStock[size] ?? {};
      return colorsEnabled.reduce(
        (sum, { name }) => sum + (typeof byColor[name] === "number" ? byColor[name]! : 0),
        0
      );
    },
    [sizeColorStock, colorsEnabled]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageUrls: string[] = images.map((item, i) =>
      item.url.startsWith("blob:")
        ? `https://placehold.co/400x400?text=Img+${i + 1}`
        : item.url
    );

    let sizes: string[] | undefined;
    let sizeStock: Record<string, number> | undefined;
    let sizeColorStockOut: Record<string, Record<string, number>> | undefined;
    let colors: string[] | undefined;
    let colorStock: Record<string, number> | undefined;

    if (noSizesRequired) {
      sizes = undefined;
      sizeStock = undefined;
      sizeColorStockOut = undefined;
      if (colorsEnabled.length > 0) {
        colors = colorsEnabled.map((r) => r.name.trim());
        colorStock = {};
        colorsEnabled.forEach(({ name: c }) => {
          const v = stockByColorOnly[c];
          if (typeof v === "number" && v > 0) colorStock![c] = v;
        });
      } else {
        colors = undefined;
        const total = parseInt(stockTotalOnly, 10) || 0;
        colorStock = total > 0 ? { "": total } : undefined;
      }
    } else {
      colors = colorsEnabled.map((r) => r.name.trim());
      const sizeIds = Array.from(selectedSizes);
      const getSizeOutputName = (id: string) => {
        const custom = customSizes.find((c) => c.id === id);
        return custom?.name?.trim() || (id.startsWith("custom-") ? null : id);
      };

      const sizeStockOut: Record<string, number> = {};
      const colorStockOut: Record<string, number> = {};
      const finalSizeColorStock: Record<string, Record<string, number>> = {};
      const sizesOut: string[] = [];

      sizeIds.forEach((sizeId) => {
        const outputName = getSizeOutputName(sizeId);
        if (outputName == null) return;
        const byColor = sizeColorStock[sizeId] ?? {};
        let sizeTotal = 0;
        colors!.forEach((color) => {
          const v = byColor[color] ?? 0;
          sizeTotal += v;
          colorStockOut[color] = (colorStockOut[color] ?? 0) + v;
          if (v > 0) {
            finalSizeColorStock[outputName] = finalSizeColorStock[outputName] ?? {};
            finalSizeColorStock[outputName][color] = v;
          }
        });
        if (sizeTotal > 0) {
          sizeStockOut[outputName] = sizeTotal;
          sizesOut.push(outputName);
        }
      });

      sizes = sizesOut.length ? sizesOut : undefined;
      sizeStock = Object.keys(sizeStockOut).length ? sizeStockOut : undefined;
      sizeColorStockOut = Object.keys(finalSizeColorStock).length ? finalSizeColorStock : undefined;
      colorStock = Object.keys(colorStockOut).length ? colorStockOut : undefined;
    }

    await onSave({
      slug,
      name,
      category,
      price: parseFormattedAmount(price, true) || 0,
      description,
      images: imageUrls.length ? imageUrls : ["https://placehold.co/400x400?text=Product"],
      sizes,
      sizeStock,
      sizeColorStock: sizeColorStockOut,
      colors,
      colorStock,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label className="text-slate-700">Slug (URL)</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="producto-slug"
            required
            disabled={!!initial}
            className="mt-1 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
          />
        </div>
        <div>
          <Label className="text-slate-700">Nombre</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label className="text-slate-700">Categoría</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className="mt-1 h-12 bg-white border-slate-300 text-slate-900">
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
          <Label className="text-slate-700">Precio (CRC)</Label>
          <Input
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) =>
              setPrice(formatAmountWithCommas(e.target.value.replace(/,/g, "").replace(/[^\d.]/g, "").replace(/(\.\d*)\./g, "$1"), true))
            }
            required
            placeholder="35,000"
            className="mt-1 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            El precio se ingresa en colones. La conversión usa 1 USD = 500 colones (configurable en Configuración del sitio → Precios).
          </p>
          {/* Calculadora de comisiones */}
          <div className="mt-4 p-3 rounded-lg bg-slate-100 border border-slate-200 space-y-3">
            <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <span>Comisiones: PayPal {FEE_LABELS.paypal} + Plataforma {FEE_LABELS.platform}</span>
            </p>
            {price && parseFormattedAmount(price, true) > 0 && (
              <p className="text-sm text-slate-700">
                Si cobras <strong>₡{parseFormattedAmount(price, true).toLocaleString("es-CR")}</strong> → Recibes aprox:{" "}
                <strong className="text-slate-900">₡{calculateNetAmount(parseFormattedAmount(price, true) || 0).toLocaleString("es-CR")}</strong>
              </p>
            )}
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[140px]">
                <Label className="text-xs text-slate-500">Quiero recibir ₡</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={desiredNetInput}
                  onChange={(e) =>
                    setDesiredNetInput(formatAmountWithCommas(e.target.value.replace(/\D/g, ""), false))
                  }
                  placeholder="15,000"
                  className="mt-0.5 h-9 text-sm bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
                />
              </div>
              {desiredNetInput && parseFormattedAmount(desiredNetInput, false) > 0 && (
                <p className="text-sm text-slate-700 pb-1">
                  Debe cobrar: <strong className="text-slate-900">₡{calculateRequiredPrice(parseFormattedAmount(desiredNetInput, false) || 0).toLocaleString("es-CR")}</strong>
                  <button
                    type="button"
                    onClick={() => {
                      const p = calculateRequiredPrice(parseFormattedAmount(desiredNetInput, false) || 0);
                      setPrice(formatAmountWithCommas(String(p), true));
                      setDesiredNetInput("");
                    }}
                    className="ml-2 text-xs text-slate-600 hover:text-slate-900 underline"
                  >
                    Usar precio
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-slate-700">Descripción</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
          className="mt-1 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
        />
      </div>

      <div>
        <Label className="text-slate-700">Imágenes (máx. {MAX_IMAGES})</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {images.map((item, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0"
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
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors shrink-0">
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

      {/* 1. Colores primero - solo nombres */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
          <Label className="text-slate-700">Colores y stock</Label>
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
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Nombre color"
                value={row.name}
                onChange={(e) => updateColorRow(i, e.target.value)}
                className="flex-1 max-w-xs bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => removeColorRow(i)}
                className="p-2 text-slate-500 hover:text-red-600 shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Añade al menos un color para habilitar las tallas
        </p>
      </div>

      {/* Checkbox: No requiere tallas */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="noSizesRequired"
            checked={noSizesRequired}
            onCheckedChange={(c) => setNoSizesRequired(!!c)}
          />
          <Label htmlFor="noSizesRequired" className="font-normal text-slate-700 cursor-pointer">
            No requiere tallas (solo stock)
          </Label>
        </div>
        <p className="text-xs text-slate-500 mt-1 ml-6">
          Para productos como prints, gift cards o artículos sin talla. Solo defines el stock por color o el total.
        </p>
      </div>

      {/* 2a. Solo stock - cuando no requiere tallas */}
      {noSizesRequired && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <Label className="mb-3 block text-slate-700">Stock</Label>
          {colorsEnabled.length > 0 ? (
            <div className="space-y-3 max-w-sm">
              {colorsEnabled.map(({ name: color }) => (
                <div key={color} className="flex items-center gap-4">
                  <span className="text-slate-700 w-32 truncate">{color}</span>
                  <Input
                    type="number"
                    min={0}
                    value={stockByColorOnly[color] ?? ""}
                    onChange={(e) => handleStockByColorOnlyChange(color, e.target.value)}
                    placeholder="0"
                    className="w-24 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-xs">
              <Input
                type="number"
                min={0}
                value={stockTotalOnly}
                onChange={(e) => setStockTotalOnly(e.target.value)}
                placeholder="Stock total"
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Si no hay colores, ingresa el stock total del producto
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2b. Tallas - habilitadas solo cuando hay colores y SÍ requiere tallas */}
      {!noSizesRequired && (
      <div
        className={`bg-white rounded-lg border border-slate-200 p-4 transition-opacity ${
          !hasColors ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Label className="text-slate-700">Tallas y stock</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                aria-label="Ayuda"
              >
                <HelpCircle size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-sm">
                Define las tallas disponibles (XS, S, M, L…) y el stock por color para cada una.
                Así el cliente puede elegir su talla y color al comprar.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        {hasColors ? (
          <div className="overflow-x-auto">
            <div className="min-w-[320px] space-y-3">
              {/* Header row */}
              <div
                className="grid gap-2 items-center font-medium text-slate-700 text-sm pb-2 border-b border-slate-200"
                style={{
                  gridTemplateColumns: `120px 70px repeat(${colorsEnabled.length}, 80px)`,
                }}
              >
                <span>Talla</span>
                <span>Total</span>
                {colorsEnabled.map(({ name: c }) => (
                  <span key={c} className="truncate" title={c}>
                    {c}
                  </span>
                ))}
              </div>
              {allSizeRows.map((row) => (
                <div
                  key={row.id}
                  className="grid gap-2 items-center"
                  style={{
                    gridTemplateColumns: `120px 70px repeat(${colorsEnabled.length}, 80px)`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`size-${row.id}`}
                      checked={selectedSizes.has(row.id)}
                      onCheckedChange={(checked) =>
                        handleSizeToggle(row.id, !!checked)
                      }
                    />
                    {row.isCustom ? (
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <Input
                          value={row.name}
                          onChange={(e) =>
                            updateCustomSizeName(row.id, e.target.value)
                          }
                          placeholder="Ej: A4, One Size, 38"
                          className="h-8 text-sm bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomSize(row.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 shrink-0"
                          title="Quitar talla"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <Label htmlFor={`size-${row.id}`} className="font-normal text-slate-700">
                        {row.id}
                      </Label>
                    )}
                  </div>
                  <div className="text-sm tabular-nums text-slate-600">
                    {getStockTotal(row.id)}
                  </div>
                  {colorsEnabled.map(({ name: color }) => (
                    <Input
                      key={color}
                      type="number"
                      min={0}
                      value={
                        selectedSizes.has(row.id)
                          ? (sizeColorStock[row.id]?.[color] ?? "")
                          : ""
                      }
                      onChange={(e) =>
                        handleSizeColorStockChange(row.id, color, e.target.value)
                      }
                      disabled={!selectedSizes.has(row.id)}
                      placeholder="0"
                      className="w-full bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
                    />
                  ))}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomSize}
              className="mt-3"
            >
              <Plus size={14} className="mr-1" />
              Agregar otra talla
            </Button>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">
            Añade al menos un color arriba para configurar tallas y stock
          </p>
        )}
      </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}

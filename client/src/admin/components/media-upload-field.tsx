import { useCallback, useState } from "react";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

function isAllowedMime(file: File, type: "image" | "video"): boolean {
  if (type === "image") {
    return ALLOWED_IMAGE_TYPES.includes(file.type);
  }
  return ALLOWED_VIDEO_TYPES.includes(file.type);
}

export function MediaUploadField({
  label,
  value = "",
  onChange,
  type,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  type: "image" | "video";
}) {
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);
      if (!isAllowedMime(file, type)) {
        setError(
          type === "image"
            ? "Solo imágenes (JPEG, PNG, WebP, GIF, SVG)."
            : "Solo videos (MP4, WebM, OGG, QuickTime)."
        );
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
      };
      reader.onerror = () => {
        setError("Error al leer el archivo.");
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [type, onChange]
  );

  const clearMedia = useCallback(() => {
    onChange("");
    setError(null);
  }, [onChange]);

  const accept =
    type === "image"
      ? "image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
      : "video/mp4,video/webm,video/ogg,video/quicktime";

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {value && (value.startsWith("data:") || value.startsWith("http") || value.startsWith("/")) && (
        <div className="mt-2 flex items-start gap-3">
          {type === "image" ? (
            <img
              src={value}
              alt="Vista previa"
              className="h-20 w-20 object-cover rounded border border-slate-200 flex-shrink-0"
            />
          ) : (
            <video
              src={value}
              className="h-20 w-32 object-cover rounded border border-slate-200 flex-shrink-0"
              muted
              playsInline
              preload="metadata"
            />
          )}
          <button
            type="button"
            onClick={clearMedia}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md text-sm"
            aria-label="Quitar archivo"
          >
            Quitar
          </button>
        </div>
      )}
    </div>
  );
}

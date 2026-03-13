const WIDTHS = [320, 640, 768, 1024, 1280, 1920];

function isCloudinaryUrl(src: string): boolean {
  return src.includes("res.cloudinary.com");
}

function cloudinaryTransform(src: string, width: number): string {
  const parts = src.split("/upload/");
  if (parts.length !== 2) return src;
  return `${parts[0]}/upload/f_auto,q_auto,w_${width}/${parts[1]}`;
}

export function OptimizedImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  if (!src) return null;

  const isCloudinary = isCloudinaryUrl(src);

  const srcSet = isCloudinary
    ? WIDTHS.map((w) => `${cloudinaryTransform(src, w)} ${w}w`).join(", ")
    : undefined;

  const optimizedSrc = isCloudinary
    ? cloudinaryTransform(src, 1280)
    : src;

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={priority ? undefined : "lazy"}
      decoding="async"
      width={width}
      height={height}
    />
  );
}

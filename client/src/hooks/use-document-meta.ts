import { useEffect } from "react";

interface DocumentMeta {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = "Tony The Witch — Tattoo Artist | Costa Rica";

function setMeta(name: string, content: string, attr = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function useDocumentMeta(meta: DocumentMeta) {
  useEffect(() => {
    const prev = document.title;
    if (meta.title) document.title = meta.title;
    if (meta.description) setMeta("description", meta.description);
    if (meta.ogTitle) setMeta("og:title", meta.ogTitle, "property");
    if (meta.ogDescription) setMeta("og:description", meta.ogDescription, "property");
    if (meta.ogImage) setMeta("og:image", meta.ogImage, "property");
    if (meta.noindex) setMeta("robots", "noindex");

    return () => {
      document.title = prev;
      if (meta.noindex) {
        document.querySelector('meta[name="robots"]')?.remove();
      }
    };
  }, [meta.title, meta.description, meta.ogTitle, meta.ogDescription, meta.ogImage, meta.noindex]);
}

export { DEFAULT_TITLE };

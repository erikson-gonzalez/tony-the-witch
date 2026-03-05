import type { ContentResponse } from "@/types/content";

const CONTENT_URL = "/api/content";

export async function fetchContent(): Promise<ContentResponse> {
  const res = await fetch(CONTENT_URL, {
    credentials: "include",
    cache: "no-store", // avoid HTTP cache for fresh config (e.g. BIO)
  });
  if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);
  return res.json();
}

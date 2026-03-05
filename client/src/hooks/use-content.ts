import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "@/api/content";

const QUERY_KEY = ["content"] as const;

export function useContent() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchContent,
    staleTime: 30 * 1000, // 30s - refetch sooner so BIO/config changes appear quickly
  });

  return {
    ...query,
    config: query.data?.config,
    navCards: query.data?.navCards ?? [],
    galleryWorks: query.data?.galleryWorks ?? [],
    products: query.data?.products ?? [],
    shopCategories: query.data?.config?.shop.categories ?? ["All"],
    galleryCategories: query.data?.config?.gallery.categories ?? ["All"],
  };
}

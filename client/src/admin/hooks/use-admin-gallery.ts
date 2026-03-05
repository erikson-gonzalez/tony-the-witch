import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { queryClient } from "@/lib/queryClient";

const KEY = ["admin", "gallery"] as const;
const CONTENT_KEY = ["content"] as const;

export function useAdminGallery() {
  const client = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => adminApi.gallery.list(),
  });

  const invalidate = () => {
    client.invalidateQueries({ queryKey: KEY });
    queryClient.invalidateQueries({ queryKey: CONTENT_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminApi.gallery.create(data),
    onSuccess: invalidate,
  });

  const createBatchMutation = useMutation({
    mutationFn: (items: Array<{ image: string; category: string }>) =>
      adminApi.gallery.createBatch(items),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      adminApi.gallery.update(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.gallery.delete(id),
    onSuccess: invalidate,
  });

  return {
    works: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    createBatch: createBatchMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      createBatchMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}

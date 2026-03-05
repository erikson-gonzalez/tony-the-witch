import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { queryClient } from "@/lib/queryClient";

const KEY = ["admin", "products"] as const;
const CONTENT_KEY = ["content"] as const;

export function useAdminProducts() {
  const client = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => adminApi.products.list(),
  });

  const invalidate = () => {
    client.invalidateQueries({ queryKey: KEY });
    queryClient.invalidateQueries({ queryKey: CONTENT_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminApi.products.create(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      adminApi.products.update(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.products.delete(id),
    onSuccess: invalidate,
  });

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}

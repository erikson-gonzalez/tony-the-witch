import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { queryClient } from "@/lib/queryClient";

const KEY = ["admin", "nav-cards"] as const;
const CONTENT_KEY = ["content"] as const;

export function useAdminNavCards() {
  const client = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => adminApi.navCards.list(),
  });

  const invalidate = () => {
    client.invalidateQueries({ queryKey: KEY });
    queryClient.invalidateQueries({ queryKey: CONTENT_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminApi.navCards.create(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      adminApi.navCards.update(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.navCards.delete(id),
    onSuccess: invalidate,
  });

  return {
    navCards: query.data ?? [],
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

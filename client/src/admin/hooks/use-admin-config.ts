import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { queryClient } from "@/lib/queryClient";

const CONFIG_KEY = ["admin", "config"] as const;
const CONTENT_KEY = ["content"] as const;

export function useAdminConfig() {
  const client = useQueryClient();

  const query = useQuery({
    queryKey: CONFIG_KEY,
    queryFn: () => adminApi.config.get(),
  });

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminApi.config.update(data),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: CONFIG_KEY });
      await queryClient.invalidateQueries({ queryKey: CONTENT_KEY });
      await queryClient.refetchQueries({ queryKey: CONTENT_KEY });
    },
  });

  return {
    config: query.data?.data,
    isLoading: query.isLoading,
    update: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

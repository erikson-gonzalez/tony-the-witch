import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";

const ANALYTICS_KEY = ["admin", "billing", "analytics"] as const;
const TOP_PRODUCTS_KEY = ["admin", "billing", "top-products"] as const;
const ECLIPTIC_KEY = ["admin", "billing", "ecliptic"] as const;

export function useAnalytics(days?: number) {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, days],
    queryFn: () => adminApi.billing.analytics(days),
  });
}

export function useTopProducts(limit = 10) {
  return useQuery({
    queryKey: [...TOP_PRODUCTS_KEY, limit],
    queryFn: () => adminApi.billing.topProducts(limit),
  });
}

export function useEclipticDebt() {
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ECLIPTIC_KEY,
    queryFn: () => adminApi.billing.ecliptic(),
  });

  const invalidate = () => {
    client.invalidateQueries({ queryKey: ECLIPTIC_KEY });
  };

  const updateConfig = useMutation({
    mutationFn: (data: { totalDebt: number; notes?: string }) =>
      adminApi.billing.updateEclipticConfig(data),
    onSuccess: invalidate,
  });

  const addPayment = useMutation({
    mutationFn: (data: { amount: number; description: string; paidAt: string }) =>
      adminApi.billing.addPayment(data),
    onSuccess: invalidate,
  });

  const deletePayment = useMutation({
    mutationFn: (id: number) => adminApi.billing.deletePayment(id),
    onSuccess: invalidate,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    updateConfig: updateConfig.mutateAsync,
    addPayment: addPayment.mutateAsync,
    deletePayment: deletePayment.mutateAsync,
    isMutating:
      updateConfig.isPending || addPayment.isPending || deletePayment.isPending,
  };
}

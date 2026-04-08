import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiCardProps {
  title: string;
  value?: string;
  icon: React.ComponentType<{ size?: string | number }>;
  loading: boolean;
  variant?: "default" | "warning" | "success";
}

const COLOR_MAP = {
  default: "bg-slate-100 text-slate-600",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
} as const;

export function KpiCard({
  title,
  value,
  icon: Icon,
  loading,
  variant = "default",
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${COLOR_MAP[variant]}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-24 mt-1" />
            ) : (
              <p className="text-xl font-bold text-slate-900">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

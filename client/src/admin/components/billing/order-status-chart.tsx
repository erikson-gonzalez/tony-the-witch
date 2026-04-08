import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

interface OrderStatusChartProps {
  data: Record<string, number>;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  proof_submitted: "Comprobante",
  approved: "Aprobado",
  rejected: "Rechazado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  proof_submitted: "#6366f1",
  approved: "#10b981",
  rejected: "#ef4444",
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const chartData = Object.entries(data).map(([status, count]) => ({
    status: STATUS_LABELS[status] ?? status,
    count,
    fill: STATUS_COLORS[status] ?? "#94a3b8",
  }));

  const chartConfig = chartData.reduce(
    (acc, item) => ({
      ...acc,
      [item.status]: { label: item.status, color: item.fill },
    }),
    {} as Record<string, { label: string; color: string }>,
  );

  return (
    <ChartContainer config={chartConfig} className="h-[200px]">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="status" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

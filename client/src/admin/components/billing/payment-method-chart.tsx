import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { PIE_COLORS } from "./billing-helpers";

interface PaymentMethodChartProps {
  data: Record<string, number>;
}

function labelMethod(method: string): string {
  if (method === "sinpe") return "SINPE";
  if (method === "card") return "Tarjeta";
  return method;
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  const chartData = Object.entries(data).map(([method, count]) => ({
    name: labelMethod(method),
    value: count,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  const chartConfig = chartData.reduce(
    (acc, item, i) => ({
      ...acc,
      [item.name]: {
        label: item.name,
        color: PIE_COLORS[i % PIE_COLORS.length],
      },
    }),
    {} as Record<string, { label: string; color: string }>,
  );

  return (
    <div>
      <ChartContainer config={chartConfig} className="h-[200px]">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((d, i) => (
              <Cell
                key={d.name}
                fill={PIE_COLORS[i % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>
      <div className="flex justify-center gap-6 mt-2">
        {chartData.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span className="text-slate-600">
              {d.name}: {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { AdminLayout } from "../components/admin-layout";
import {
  useAnalytics,
  useTopProducts,
  useEclipticDebt,
} from "../hooks/use-admin-billing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Plus,
  Trash2,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const PERIOD_OPTIONS = [
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
  { value: "all", label: "Todo" },
] as const;

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export function AdminBillingPage() {
  const [period, setPeriod] = useState<string>("30");
  const days = period === "all" ? undefined : parseInt(period, 10);

  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(days);
  const { data: topProducts, isLoading: productsLoading } = useTopProducts(10);
  const ecliptic = useEclipticDebt();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Facturacion</h1>
            <p className="text-slate-600">Metricas de ventas y facturacion</p>
          </div>
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList>
              {PERIOD_OPTIONS.map((opt) => (
                <TabsTrigger key={opt.value} value={opt.value}>
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Ingresos Totales"
            value={analytics ? formatUsd(analytics.totalRevenue) : undefined}
            icon={DollarSign}
            loading={analyticsLoading}
          />
          <KpiCard
            title="Pedidos Totales"
            value={analytics?.totalOrders.toString()}
            icon={ShoppingCart}
            loading={analyticsLoading}
          />
          <KpiCard
            title="Valor Promedio"
            value={analytics ? formatUsd(analytics.avgOrderValue) : undefined}
            icon={TrendingUp}
            loading={analyticsLoading}
          />
          <KpiCard
            title="Deuda Ecliptic"
            value={ecliptic.data ? formatUsd(ecliptic.data.remaining) : undefined}
            icon={CreditCard}
            loading={ecliptic.isLoading}
            variant={
              ecliptic.data && ecliptic.data.remaining > 0 ? "warning" : "success"
            }
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Method Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metodos de Pago</CardTitle>
              <CardDescription>Distribucion por metodo</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : analytics &&
                Object.keys(analytics.ordersByPaymentMethod).length > 0 ? (
                <PaymentMethodChart data={analytics.ordersByPaymentMethod} />
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">
                  Sin datos disponibles
                </p>
              )}
            </CardContent>
          </Card>

          {/* Order Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estado de Pedidos</CardTitle>
              <CardDescription>Distribucion por estado</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : analytics &&
                Object.keys(analytics.ordersByStatus).length > 0 ? (
                <OrderStatusChart data={analytics.ordersByStatus} />
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">
                  Sin datos disponibles
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Productos Mas Vendidos</CardTitle>
            <CardDescription>Top 10 por ingresos (pedidos aprobados)</CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Unidades</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, i) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium text-slate-500">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.unitsSold}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatUsd(product.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                Sin ventas registradas
              </p>
            )}
          </CardContent>
        </Card>

        {/* Ecliptic Debt Section */}
        <EclipticDebtSection ecliptic={ecliptic} />
      </div>
    </AdminLayout>
  );
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({
  title,
  value,
  icon: Icon,
  loading,
  variant = "default",
}: {
  title: string;
  value?: string;
  icon: React.ComponentType<{ size?: string | number }>;
  loading: boolean;
  variant?: "default" | "warning" | "success";
}) {
  const colorMap = {
    default: "bg-slate-100 text-slate-600",
    warning: "bg-amber-100 text-amber-700",
    success: "bg-emerald-100 text-emerald-700",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${colorMap[variant]}`}>
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

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

function PaymentMethodChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([method, count]) => ({
    name: method === "sinpe" ? "SINPE" : method === "card" ? "Tarjeta" : method,
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
    {} as Record<string, { label: string; color: string }>
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
            {chartData.map((_, i) => (
              <Cell
                key={i}
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

function OrderStatusChart({ data }: { data: Record<string, number> }) {
  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    proof_submitted: "Comprobante",
    approved: "Aprobado",
    rejected: "Rechazado",
  };

  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    proof_submitted: "#6366f1",
    approved: "#10b981",
    rejected: "#ef4444",
  };

  const chartData = Object.entries(data).map(([status, count]) => ({
    status: statusLabels[status] ?? status,
    count,
    fill: statusColors[status] ?? "#94a3b8",
  }));

  const chartConfig = chartData.reduce(
    (acc, item) => ({
      ...acc,
      [item.status]: { label: item.status, color: item.fill },
    }),
    {} as Record<string, { label: string; color: string }>
  );

  return (
    <ChartContainer config={chartConfig} className="h-[200px]">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="status" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

// ---------------------------------------------------------------------------
// Ecliptic Debt Section
// ---------------------------------------------------------------------------

function EclipticDebtSection({
  ecliptic,
}: {
  ecliptic: ReturnType<typeof useEclipticDebt>;
}) {
  const { toast } = useToast();
  const [configOpen, setConfigOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Config form state
  const [debtAmount, setDebtAmount] = useState("");
  const [debtNotes, setDebtNotes] = useState("");

  // Payment form state
  const [payAmount, setPayAmount] = useState("");
  const [payDescription, setPayDescription] = useState("");
  const [payDate, setPayDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleConfigOpen = () => {
    if (ecliptic.data) {
      setDebtAmount((ecliptic.data.totalDebt / 100).toString());
      setDebtNotes(ecliptic.data.notes ?? "");
    }
    setConfigOpen(true);
  };

  const handleConfigSave = async () => {
    const totalDebt = Math.round(parseFloat(debtAmount) * 100);
    if (isNaN(totalDebt) || totalDebt < 0) {
      toast({ title: "Monto invalido", variant: "destructive" });
      return;
    }
    try {
      await ecliptic.updateConfig({ totalDebt, notes: debtNotes || undefined });
      setConfigOpen(false);
      toast({ title: "Configuracion actualizada" });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const handlePaymentSave = async () => {
    const amount = Math.round(parseFloat(payAmount) * 100);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Monto invalido", variant: "destructive" });
      return;
    }
    if (!payDescription.trim()) {
      toast({ title: "Descripcion requerida", variant: "destructive" });
      return;
    }
    try {
      await ecliptic.addPayment({
        amount,
        description: payDescription.trim(),
        paidAt: new Date(payDate).toISOString(),
      });
      setPaymentOpen(false);
      setPayAmount("");
      setPayDescription("");
      setPayDate(new Date().toISOString().split("T")[0]);
      toast({ title: "Pago registrado" });
    } catch {
      toast({ title: "Error al registrar pago", variant: "destructive" });
    }
  };

  const handleDeletePayment = async (id: number) => {
    try {
      await ecliptic.deletePayment(id);
      toast({ title: "Pago eliminado" });
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  if (ecliptic.isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const data = ecliptic.data;
  const progressPct =
    data && data.totalDebt > 0
      ? Math.min(100, Math.round((data.totalPaid / data.totalDebt) * 100))
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Deuda Ecliptic</CardTitle>
            <CardDescription>
              Seguimiento de pagos al desarrollador
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={configOpen} onOpenChange={setConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleConfigOpen}>
                  <Settings size={16} className="mr-1" />
                  Configurar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurar Deuda</DialogTitle>
                  <DialogDescription>
                    Define el monto total de la deuda con Ecliptic
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Deuda Total (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={debtAmount}
                      onChange={(e) => setDebtAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Notas</Label>
                    <Textarea
                      value={debtNotes}
                      onChange={(e) => setDebtNotes(e.target.value)}
                      placeholder="Notas opcionales..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setConfigOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleConfigSave} disabled={ecliptic.isMutating}>
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus size={16} className="mr-1" />
                  Agregar Pago
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Pago</DialogTitle>
                  <DialogDescription>
                    Registra un pago a Ecliptic
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Monto (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Descripcion</Label>
                    <Input
                      value={payDescription}
                      onChange={(e) => setPayDescription(e.target.value)}
                      placeholder="Ej: Pago mensual enero"
                    />
                  </div>
                  <div>
                    <Label>Fecha de Pago</Label>
                    <Input
                      type="date"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setPaymentOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handlePaymentSave}
                    disabled={ecliptic.isMutating}
                  >
                    Registrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        {data && data.totalDebt > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                Pagado: {formatUsd(data.totalPaid)} de {formatUsd(data.totalDebt)}
              </span>
              <span className="font-medium text-slate-900">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-3" />
            <div className="flex justify-between text-sm text-slate-500">
              <span>
                Restante:{" "}
                <span className="font-semibold text-slate-700">
                  {formatUsd(data.remaining)}
                </span>
              </span>
            </div>
            {data.notes && (
              <p className="text-xs text-slate-500 mt-1 italic">{data.notes}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            No hay deuda configurada. Usa el boton "Configurar" para definir el
            monto.
          </p>
        )}

        {/* Payment History */}
        {data && data.payments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Historial de Pagos
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm text-slate-600">
                      {formatDate(payment.paidAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.description}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium">
                      {formatUsd(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeletePayment(payment.id)}
                        disabled={ecliptic.isMutating}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

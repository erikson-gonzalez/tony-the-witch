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
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingCart, TrendingUp, CreditCard } from "lucide-react";
import { KpiCard } from "../components/billing/kpi-card";
import { PaymentMethodChart } from "../components/billing/payment-method-chart";
import { OrderStatusChart } from "../components/billing/order-status-chart";
import { EclipticDebtSection } from "../components/billing/ecliptic-debt-section";
import {
  formatUsd,
  PERIOD_OPTIONS,
} from "../components/billing/billing-helpers";

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

import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../components/admin-layout";
import { adminApi, type AdminOrder } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800",
  },
  proof_submitted: {
    label: "Comprobante enviado",
    className: "bg-blue-100 text-blue-800",
  },
  approved: {
    label: "Aprobado",
    className: "bg-green-100 text-green-800",
  },
  rejected: {
    label: "Rechazado",
    className: "bg-red-100 text-red-800",
  },
};

const TABS = [
  { key: "", label: "Todos" },
  { key: "pending", label: "Pendientes" },
  { key: "approved", label: "Aprobados" },
  { key: "rejected", label: "Rechazados" },
] as const;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    const mins = Math.floor(diffMs / (1000 * 60));
    return `hace ${mins} min`;
  }
  if (diffHours < 24) {
    return `hace ${Math.floor(diffHours)}h`;
  }
  return date.toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatCrc(colones: number): string {
  return `₡${colones.toLocaleString("es-CR")}`;
}

export function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", statusFilter, page],
    queryFn: () =>
      adminApi.orders.list({
        status: statusFilter || undefined,
        page,
      }),
  });

  const orders = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto pt-6 flex justify-center py-12 w-full">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pt-6 w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
          Pedidos
        </h1>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.key
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No hay pedidos</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 sm:px-6 py-3 text-sm font-medium text-slate-600">
                      Pedido
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 text-sm font-medium text-slate-600">
                      Cliente
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 text-sm font-medium text-slate-600">
                      Total
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 text-sm font-medium text-slate-600">
                      Estado
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 text-sm font-medium text-slate-600">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: AdminOrder) => {
                    const status = STATUS_LABELS[order.paymentStatus];
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      >
                        <td className="px-4 sm:px-6 py-3">
                          <Link href={`/admin/orders/${order.id}`}>
                            <a className="block">
                              <span className="font-mono font-medium text-slate-900">
                                {order.orderNumber}
                              </span>
                              <span
                                className={`ml-2 inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                  order.paymentMethod === "sinpe"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {order.paymentMethod === "sinpe"
                                  ? "SINPE"
                                  : "Tarjeta"}
                              </span>
                            </a>
                          </Link>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-slate-700">
                          <Link href={`/admin/orders/${order.id}`}>
                            <a className="block">{order.customerName}</a>
                          </Link>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm">
                          <Link href={`/admin/orders/${order.id}`}>
                            <a className="block">
                              <span className="text-slate-900 font-medium">
                                {formatUsd(order.totalUsd)}
                              </span>
                              <span className="text-slate-500 ml-1">
                                / {formatCrc(order.totalCrc)}
                              </span>
                            </a>
                          </Link>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <Link href={`/admin/orders/${order.id}`}>
                            <a className="block">
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  status?.className ?? ""
                                }`}
                              >
                                {status?.label ?? order.paymentStatus}
                              </span>
                            </a>
                          </Link>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-slate-500">
                          <Link href={`/admin/orders/${order.id}`}>
                            <a className="block">
                              {formatDate(order.createdAt)}
                            </a>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="text-sm text-slate-600">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

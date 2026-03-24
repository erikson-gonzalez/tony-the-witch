import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "../components/admin-layout";
import { adminApi } from "@/api/admin";
import { LayoutGrid, Image, ShoppingBag, Settings, Package } from "lucide-react";

export function AdminDashboardPage() {
  const { t } = useTranslation();

  const QUICK_LINKS = [
    { href: "/admin/orders", label: t("admin.orders"), icon: Package },
    { href: "/admin/config", label: t("admin.config"), icon: Settings },
    { href: "/admin/nav-cards", label: t("admin.navCards"), icon: LayoutGrid },
    { href: "/admin/gallery", label: t("admin.gallery"), icon: Image },
    { href: "/admin/products", label: t("admin.products"), icon: ShoppingBag },
  ] as const;

  const { data: pendingData } = useQuery({
    queryKey: ["admin", "orders", "pending-count"],
    queryFn: () => adminApi.orders.pendingCount(),
  });
  const pendingCount = pendingData?.count ?? 0;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pt-6 w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {t("admin.panelTitle")}
        </h1>
        <p className="text-slate-600 mb-8">
          {t("admin.panelSubtitle")}
        </p>

        {pendingCount > 0 && (
          <Link href="/admin/orders">
            <a className="flex items-center gap-4 p-4 mb-6 bg-amber-50 rounded-xl border border-amber-200 hover:border-amber-300 transition-all">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <Package size={20} />
              </div>
              <div>
                <span className="font-semibold text-amber-900">
                  {pendingCount === 1
                    ? t("admin.pendingOrder", { count: pendingCount })
                    : t("admin.pendingOrders", { count: pendingCount })}
                </span>
                <span className="text-sm text-amber-700 ml-2">
                  → {t("admin.viewOrders")}
                </span>
              </div>
            </a>
          </Link>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <a className="flex items-center gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                <div className="p-3 rounded-lg bg-slate-100 text-slate-600">
                  <Icon size={24} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{label}</h2>
                  <p className="text-sm text-slate-500">{t("admin.editContent")}</p>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

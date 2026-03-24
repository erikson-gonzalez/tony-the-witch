import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAdminAuth } from "../context/admin-auth-context";
import { adminApi } from "@/api/admin";
import {
  LayoutDashboard,
  Settings,
  Image,
  ShoppingBag,
  LayoutGrid,
  LogOut,
  Menu,
  X,
  Package,
  BarChart3,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { username, logout } = useAdminAuth();

  const NAV_ITEMS = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: t("admin.orders"), icon: Package, badge: true },
    { href: "/admin/config", label: t("admin.config"), icon: Settings },
    { href: "/admin/nav-cards", label: t("admin.navCards"), icon: LayoutGrid },
    { href: "/admin/gallery", label: t("admin.gallery"), icon: Image },
    { href: "/admin/products", label: t("admin.products"), icon: ShoppingBag },
    { href: "/admin/billing", label: t("admin.billing", { defaultValue: "Facturación" }), icon: BarChart3 },
  ] as const;

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  const { data: pendingData } = useQuery({
    queryKey: ["admin", "orders", "pending-count"],
    queryFn: () => adminApi.orders.pendingCount(),
    refetchInterval: 30000,
  });
  const pendingCount = pendingData?.count ?? 0;

  const NavLinks = () => (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon, ...rest }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive(href)
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Icon size={18} />
          {label}
          {"badge" in rest && rest.badge && pendingCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900"
          aria-label={t("admin.openMenu")}
        >
          <Menu size={24} />
        </button>
        <Link href="/admin" className="font-semibold text-slate-800">
          TTW Admin
        </Link>
        <div className="w-10" />
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-56 bg-white border-r border-slate-200 shadow-sm z-50 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:p-6">
          <Link href="/admin" className="text-lg font-semibold text-slate-800">
            TTW Admin
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 -mr-2 text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
        {username && (
          <p className="px-6 py-1 text-xs text-slate-500">{username}</p>
        )}
        <nav className="p-4 space-y-1">
          <NavLinks />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <button
            onClick={() => {
              logout();
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            {t("admin.logout")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="pt-20 lg:pt-8 lg:ml-56 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

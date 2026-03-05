import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "../context/admin-auth-context";
import {
  LayoutDashboard,
  Settings,
  Image,
  ShoppingBag,
  LayoutGrid,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/config", label: "Configuración", icon: Settings },
  { href: "/admin/nav-cards", label: "Nav Cards", icon: LayoutGrid },
  { href: "/admin/gallery", label: "Galería", icon: Image },
  { href: "/admin/products", label: "Productos", icon: ShoppingBag },
] as const;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { username, logout } = useAdminAuth();

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  const NavLinks = () => (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
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
          aria-label="Abrir menú"
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
            Cerrar sesión
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

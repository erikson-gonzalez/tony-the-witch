import { Link } from "wouter";
import { AdminLayout } from "../components/admin-layout";
import { LayoutGrid, Image, ShoppingBag, Settings } from "lucide-react";

const QUICK_LINKS = [
  { href: "/admin/config", label: "Configuración", icon: Settings },
  { href: "/admin/nav-cards", label: "Nav Cards", icon: LayoutGrid },
  { href: "/admin/gallery", label: "Galería", icon: Image },
  { href: "/admin/products", label: "Productos", icon: ShoppingBag },
] as const;

export function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pt-6 w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Panel de administración
        </h1>
        <p className="text-slate-600 mb-8">
          Gestiona el contenido del sitio desde aquí.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <a className="flex items-center gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                <div className="p-3 rounded-lg bg-slate-100 text-slate-600">
                  <Icon size={24} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{label}</h2>
                  <p className="text-sm text-slate-500">Editar contenido</p>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

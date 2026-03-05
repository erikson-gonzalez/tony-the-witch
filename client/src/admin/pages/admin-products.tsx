import { useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "../components/admin-layout";
import { useAdminProducts } from "../hooks/use-admin-products";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface ProductRow {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  images: string[];
}

export function AdminProductsPage() {
  const { products, isLoading, remove, isMutating } = useAdminProducts();
  const [productToDelete, setProductToDelete] = useState<ProductRow | null>(null);

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await remove(productToDelete.id);
      setProductToDelete(null);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Productos
        </h1>
        <Link href="/admin/products/new">
          <a>
            <Button className="w-full sm:w-auto">
              <Plus size={18} className="mr-2" />
              Nuevo producto
            </Button>
          </a>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-slate-600">
                Producto
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-slate-600">
                Categoría
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-slate-600">
                Precio (CRC)
              </th>
              <th className="w-20 sm:w-24 px-2" />
            </tr>
          </thead>
          <tbody>
            {(products as unknown as ProductRow[]).map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <Link href={`/admin/products/${p.id}`}>
                    <a className="flex items-center gap-3 hover:opacity-80">
                      {p.images?.[0] && (
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover bg-slate-100 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="font-medium text-slate-900 block truncate">
                          {p.name}
                        </span>
                        <span className="block text-xs text-slate-500 truncate">
                          {p.slug}
                        </span>
                      </div>
                    </a>
                  </Link>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 text-sm">
                  {p.category}
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-900 font-medium">
                  ${p.price}
                </td>
                <td className="px-2 sm:px-6 py-3 sm:py-4">
                  <div className="flex gap-1 sm:gap-2">
                    <Link href={`/admin/products/${p.id}`}>
                      <a className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded">
                        <Pencil size={16} />
                      </a>
                    </Link>
                    <button
                      onClick={() => setProductToDelete(p)}
                      disabled={isMutating}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar &quot;{productToDelete?.name}&quot;. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={isMutating}
            >
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {(products as unknown as ProductRow[]).length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p className="mb-4">No hay productos</p>
          <Link href="/admin/products/new">
            <a className="text-slate-900 font-medium underline">
              Crear primer producto
            </a>
          </Link>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}

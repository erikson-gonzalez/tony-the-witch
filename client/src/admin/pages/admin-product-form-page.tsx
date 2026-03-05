import { Link, useParams } from "wouter";
import { AdminLayout } from "../components/admin-layout";
import { useAdminProducts } from "../hooks/use-admin-products";
import { ProductFormContent } from "../components/product-form-content";
import { ArrowLeft } from "lucide-react";

export function AdminProductFormPage() {
  const params = useParams<{ id?: string }>();
  const id = params.id === "new" ? null : params.id ? parseInt(params.id, 10) : null;
  const { products, isLoading, create, update, isMutating } = useAdminProducts();

  const isNew = id === null || params.id === "new";
  const product = !isNew && id
    ? (products as Array<Record<string, unknown>>).find((p) => p.id === id)
    : null;

  const handleSave = async (data: Record<string, unknown>) => {
    if (isNew) {
      await create(data);
      window.history.replaceState(null, "", "/admin/products");
    } else if (id) {
      await update({ id, data });
      window.history.replaceState(null, "", "/admin/products");
    }
  };

  if (!isNew && isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto pt-6 flex justify-center py-12 w-full">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!isNew && !product) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto pt-6 text-center py-12 w-full">
          <p className="text-slate-600 mb-4">Producto no encontrado</p>
          <Link href="/admin/products">
            <a className="text-slate-900 underline">Volver a productos</a>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const initial = product
    ? {
        slug: product.slug as string,
        name: product.name as string,
        category: product.category as string,
        price: product.price as number,
        description: product.description as string,
        images: (product.images as string[]) ?? [],
        sizes: product.sizes as string[] | undefined,
        sizeStock: product.sizeStock as Record<string, number> | undefined,
        sizeColorStock: product.sizeColorStock as Record<string, Record<string, number>> | undefined,
        colors: product.colors as string[] | undefined,
        colorStock: product.colorStock as Record<string, number> | undefined,
      }
    : undefined;

  return (
    <AdminLayout>
      <div className="max-w-6xl w-full mx-auto pt-6">
        <Link href="/admin/products">
          <a className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6">
            <ArrowLeft size={16} />
            Volver a productos
          </a>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
          {isNew ? "Nuevo producto" : "Editar producto"}
        </h1>
        <ProductFormContent
          initial={initial}
          onSave={handleSave}
          isLoading={isMutating}
        />
      </div>
    </AdminLayout>
  );
}

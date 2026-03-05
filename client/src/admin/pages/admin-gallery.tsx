import { useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "../components/admin-layout";
import { useAdminGallery } from "../hooks/use-admin-gallery";
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

interface GalleryWorkRow {
  id: number;
  image: string;
  category: string;
  height: string;
}

export function AdminGalleryPage() {
  const { works, isLoading, remove, isMutating } = useAdminGallery();
  const [workToDelete, setWorkToDelete] = useState<GalleryWorkRow | null>(null);

  const handleConfirmDelete = async () => {
    if (workToDelete) {
      await remove(workToDelete.id);
      setWorkToDelete(null);
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
          Galería
        </h1>
        <Link href="/admin/gallery/new">
          <a>
            <Button className="w-full sm:w-auto">
              <Plus size={18} className="mr-2" />
              Nueva obra
            </Button>
          </a>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {(works as unknown as GalleryWorkRow[]).map((work) => (
          <div
            key={work.id}
            className="group relative aspect-square rounded-lg overflow-hidden bg-slate-200"
          >
            <img
              src={work.image}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Link href={`/admin/gallery/${work.id}`}>
                <a className="p-2 bg-white rounded text-slate-700 hover:bg-slate-100">
                  <Pencil size={16} />
                </a>
              </Link>
              <button
                onClick={() => setWorkToDelete(work)}
                disabled={isMutating}
                className="p-2 bg-white rounded text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70 text-white text-xs truncate">
              {work.category} · {work.height}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!workToDelete} onOpenChange={(open) => !open && setWorkToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar obra?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar esta obra de la galería. Esta acción no se puede deshacer.
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

      {(works as unknown as GalleryWorkRow[]).length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p className="mb-4">No hay obras en la galería</p>
          <Link href="/admin/gallery/new">
            <a className="text-slate-900 font-medium underline">
              Añadir primera obra
            </a>
          </Link>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}

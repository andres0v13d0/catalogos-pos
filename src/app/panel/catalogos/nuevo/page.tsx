import Link from "next/link";
import CatalogForm from "@/components/panel/catalog/CatalogForm";

export default function NuevoCatalogoPage() {
  return (
    <main className="mx-auto max-w-lg p-6">
      <Link href="/panel/catalogos" className="text-sm text-orange-500 hover:text-orange-600">← Volver</Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold text-gray-800">Nuevo catálogo</h1>
      <CatalogForm />
    </main>
  );
}

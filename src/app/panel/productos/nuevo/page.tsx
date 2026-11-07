import Link from "next/link";
import ProductWizard from "@/components/panel/product/ProductWizard";

export default function NuevoProductoPage() {
  return (
    <main className="mx-auto max-w-lg p-6">
      <Link href="/panel" className="text-sm text-orange-500 hover:text-orange-600">← Volver</Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold text-gray-800">Nuevo producto</h1>
      <ProductWizard />
    </main>
  );
}

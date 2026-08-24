import { getCatalogProductIds, getProductPreviews } from "@/lib/api";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Suspense } from "react";
import ProductGrid from "@/components/catalog/ProductGrid";
import { Product } from "@/types/catalog";
import type { Metadata } from "next";

export const revalidate = 60;

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface PageProps {
  params: Promise<{ shortId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shortId } = await params;

  try {
    const { catalog, bodega } = await getCatalogProductIds(shortId);
    const title = catalog?.publicName || bodega?.publicName || bodega?.name || "Catálogo";
    const logoUrl = bodega?.logoUrl || null;

    return {
      title,
      icons: logoUrl
        ? { icon: logoUrl, apple: logoUrl }
        : undefined,
    };
  } catch {
    return { title: "Catálogo no encontrado" };
  }
}

export default async function CatalogPage({ params }: PageProps) {
  const { shortId } = await params;

  let catalogResponse;
  try {
    catalogResponse = await getCatalogProductIds(shortId);
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f0f2f5" }}>
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm text-center">
          <div className="w-12 h-12 text-orange-400 mx-auto mb-3 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Catálogo no encontrado</h2>
          <p className="text-gray-500 text-sm">El catálogo que buscas no existe o no está disponible.</p>
        </div>
      </div>
    );
  }

  const { catalog, bodega, productIds } = catalogResponse;
  const shuffledIds = shuffleArray(productIds);
  const firstBatch = shuffledIds.slice(0, 20);

  let initialProducts: Product[] = [];
  try {
    initialProducts = await getProductPreviews(firstBatch);
  } catch {
    initialProducts = [];
  }

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "Ubuntu, sans-serif",
        background: "#f0f2f5 url(/background.jpg) center/cover fixed",
      }}
    >
      <style>{`
        @keyframes pulseWA {
          0%,100% { transform:scale(1); box-shadow:0 6px 24px rgba(37,211,102,0.4); }
          50% { transform:scale(1.03); box-shadow:0 8px 32px rgba(37,211,102,0.6); }
        }
        .wa-pulse { animation: pulseWA 2s infinite; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes cardExpand {
          from { opacity: 0; transform: scaleY(0.7); }
          to   { opacity: 1; transform: scaleY(1); }
        }
      `}</style>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid
          shortId={shortId}
          initialProducts={initialProducts}
          allProductIds={shuffledIds}
          catalogData={catalog}
          bodega={bodega}
        />
      </Suspense>
    </div>
  );
}

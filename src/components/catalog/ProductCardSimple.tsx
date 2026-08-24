"use client";
import { MdImage } from "react-icons/md";
import Image from "next/image";
import { Product } from "@/types/catalog";

interface ProductCardSimpleProps {
  product: Product;
  onClick?: () => void;
  priceDisplay?: string | null;
}

export default function ProductCardSimple({ product, onClick, priceDisplay }: ProductCardSimpleProps) {
  const price = (() => {
    if (priceDisplay === "price2") return parseFloat(String(product.price2)) || parseFloat(String(product.price)) || parseFloat(String(product.basePrice)) || 0;
    if (priceDisplay === "price3") return parseFloat(String(product.price3)) || parseFloat(String(product.price)) || parseFloat(String(product.basePrice)) || 0;
    return parseFloat(String(product.price)) || parseFloat(String(product.basePrice)) || 0;
  })();

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="relative w-full aspect-[5/6]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <MdImage size={32} />
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="text-xs font-medium text-gray-800 leading-tight line-clamp-2 mb-1">
          {product.name}
        </h3>
        {price > 0 && (
          <p className="text-sm font-bold text-green-600">
            {Math.round(price).toLocaleString("es-CO")}
          </p>
        )}
      </div>
    </div>
  );
}

// Skeleton
const SKELETON_HEIGHTS = [160, 200, 140, 220, 180, 150, 210, 170, 190, 160, 230, 145];
let skeletonIndex = 0;

export function ProductCardSimpleSkeleton() {
  const height = SKELETON_HEIGHTS[skeletonIndex++ % SKELETON_HEIGHTS.length];
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div
        style={{
          height,
          background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
        }}
      />
      <div className="p-2">
        <div className="h-2.5 bg-gray-200 rounded mb-1.5" style={{ width: "85%" }} />
        <div className="h-3.5 bg-gray-200 rounded" style={{ width: "45%" }} />
      </div>
    </div>
  );
}

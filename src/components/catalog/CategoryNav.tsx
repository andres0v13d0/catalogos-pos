"use client";
import { CatalogCategory } from "@/types/catalog";

interface CategoryNavProps {
  categories: CatalogCategory[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

export default function CategoryNav({ categories, activeId, onSelect }: CategoryNavProps) {
  if (!categories?.length) return null;

  return (
    <div
      className="flex gap-2 overflow-x-auto px-3 md:px-4 py-2 md:py-2.5"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 md:px-5 py-1.5 md:py-2 rounded-full text-sm md:text-base font-medium transition-all cursor-pointer ${
          activeId === null
            ? "bg-orange-400 text-white shadow-sm"
            : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-4 md:px-5 py-1.5 md:py-2 rounded-full text-sm md:text-base font-medium transition-all cursor-pointer ${
            activeId === cat.id
              ? "bg-orange-400 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

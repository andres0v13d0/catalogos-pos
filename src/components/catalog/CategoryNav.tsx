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
      className="flex gap-2 overflow-x-auto px-3 md:px-4 py-2 md:py-2.5 bg-[var(--color-navbar-bg)]"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 md:px-5 py-1.5 md:py-2 rounded-full text-sm md:text-base font-medium transition-all cursor-pointer ${
          activeId === null
            ? "bg-[var(--color-category-active-bg)] text-[var(--color-category-active-text)] shadow-sm"
            : "bg-[var(--color-category-inactive-bg)] text-[var(--color-category-inactive-text)] border border-[var(--color-category-inactive-border)] hover:border-orange-300"
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
              ? "bg-[var(--color-category-active-bg)] text-[var(--color-category-active-text)] shadow-sm"
              : "bg-[var(--color-category-inactive-bg)] text-[var(--color-category-inactive-text)] border border-[var(--color-category-inactive-border)] hover:border-orange-300"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

"use client";
import { FiSearch, FiX } from "react-icons/fi";
import CategoryNav from "./CategoryNav";
import { CatalogCategory } from "@/types/catalog";

interface CatalogSearchBarProps {
  searchInput: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  categories: CatalogCategory[];
  activeCategoryId: string | null;
  onCategorySelect: (id: string | null) => void;
}

export default function CatalogSearchBar({
  searchInput,
  onSearchChange,
  onClearSearch,
  categories,
  activeCategoryId,
  onCategorySelect,
}: CatalogSearchBarProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 mt-3 mb-4 md:mt-4 md:mb-6">
      <div className="bg-white rounded-2xl md:rounded-xl shadow-md md:shadow-sm overflow-hidden">
        <div className="relative flex items-center px-2 py-2 md:px-4 md:py-2">
          <FiSearch size={16} className="absolute left-6 md:left-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-2.5 bg-gray-50 md:bg-white rounded-xl md:rounded-lg border-2 border-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white md:focus:bg-white transition-all"
          />
          {searchInput && (
            <button
              onClick={onClearSearch}
              className="absolute right-5 md:right-4 w-7 h-7 rounded-full bg-gray-200 md:bg-gray-300 flex items-center justify-center hover:bg-gray-300 md:hover:bg-gray-400 transition-colors cursor-pointer"
            >
              <FiX size={13} />
            </button>
          )}
        </div>
        {categories.length > 0 && (
          <div className="border-t border-gray-100">
            <CategoryNav categories={categories} activeId={activeCategoryId} onSelect={onCategorySelect} />
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { FaWhatsapp } from "react-icons/fa";
import { FiSearch, FiX } from "react-icons/fi";
import Image from "next/image";
import CategoryNav from "./CategoryNav";
import { CatalogCategory } from "@/types/catalog";

interface CatalogStickyHeaderProps {
  visible: boolean;
  logoSrc: string | null;
  logoInitial: string;
  title: string;
  whatsappNumber: string | null;
  searchInput: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  categories: CatalogCategory[];
  activeCategoryId: string | null;
  onCategorySelect: (id: string | null) => void;
}

export default function CatalogStickyHeader({
  visible,
  logoSrc,
  logoInitial,
  title,
  whatsappNumber,
  searchInput,
  onSearchChange,
  onClearSearch,
  showSearch,
  onToggleSearch,
  categories,
  activeCategoryId,
  onCategorySelect,
}: CatalogStickyHeaderProps) {
  return (
    <div
      className={`fixed top-0 left-0 right-0 bg-white shadow-md z-[1000] md:hidden transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center relative">
          {logoSrc ? (
            <Image src={logoSrc} alt="Logo" fill className="object-cover" sizes="40px" />
          ) : (
            <span
              className="font-bold text-white text-lg w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#fa7e17,#ff9a3d)" }}
            >
              {logoInitial}
            </span>
          )}
        </div>
        <span className="flex-1 font-semibold text-gray-800 truncate text-sm">{title}</span>
        <button
          onClick={onToggleSearch}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          {showSearch ? <FiX size={16} /> : <FiSearch size={16} />}
        </button>
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer"
            style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}
          >
            <FaWhatsapp size={18} />
          </a>
        )}
      </div>
      {showSearch && (
        <div className="px-4 pb-3 border-t border-gray-100">
          <div className="relative mt-2">
            <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-sm text-gray-900 placeholder-gray-400"
            />
            {searchInput && (
              <button
                onClick={onClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
              >
                <FiX size={11} />
              </button>
            )}
          </div>
        </div>
      )}
      {categories.length > 0 && (
        <div className="border-t border-gray-100">
          <CategoryNav categories={categories} activeId={activeCategoryId} onSelect={onCategorySelect} />
        </div>
      )}
    </div>
  );
}

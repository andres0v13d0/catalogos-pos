"use client";
import { FaWhatsapp } from "react-icons/fa";
import { FiSearch, FiX } from "react-icons/fi";
import CategoryNav from "./CategoryNav";
import { CatalogCategory } from "@/types/catalog";

interface CatalogDesktopHeaderProps {
  bannerSrc: string | null;
  logoSrc: string | null;
  logoInitial: string;
  title: string;
  description: string | null;
  whatsappNumber: string | null;
  searchInput: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  categories: CatalogCategory[];
  activeCategoryId: string | null;
  onCategorySelect: (id: string | null) => void;
}

export default function CatalogDesktopHeader({
  bannerSrc,
  logoSrc,
  logoInitial,
  title,
  description,
  whatsappNumber,
  searchInput,
  onSearchChange,
  onClearSearch,
  categories,
  activeCategoryId,
  onCategorySelect,
}: CatalogDesktopHeaderProps) {
  return (
    <div className="hidden md:block">
      {/* Banner — full width, no padding, pegado arriba */}
      <div className="relative w-full overflow-hidden bg-gray-200" style={{ maxHeight: 320 }}>
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt="Banner"
            className="w-full object-cover"
            style={{ maxHeight: 320, objectPosition: "center" }}
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-r from-orange-400 to-orange-500" />
        )}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{ background: "linear-gradient(to top,rgba(0,0,0,0.4),transparent)" }}
        />
      </div>

      {/* Barra info: logo superpuesto + nombre + search + WA */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-6 flex items-center gap-5 py-3">
          {/* Logo superpuesto — se sube sobre el banner con -mt-12 */}
          <div className="flex-shrink-0 -mt-12 relative z-10">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
              {logoSrc ? (
                <img src={logoSrc} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span
                  className="text-3xl font-bold text-white w-full h-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#fa7e17,#ff9a3d)" }}
                >
                  {logoInitial}
                </span>
              )}
            </div>
          </div>

          {/* Nombre y descripción */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
            {description && <p className="text-sm text-gray-500 truncate">{description}</p>}
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative flex items-center bg-gray-100 rounded-full focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-400 transition-all">
              <FiSearch size={15} className="absolute left-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchInput}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400"
              />
              {searchInput && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center hover:bg-gray-400 transition-colors cursor-pointer"
                >
                  <FiX size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Botón WA desktop */}
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm no-underline transition-all hover:-translate-y-0.5 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", boxShadow: "0 3px 12px rgba(37,211,102,0.35)" }}
            >
              <FaWhatsapp size={18} />
              Contactar
            </a>
          )}
        </div>
      </div>

      {/* Categorías - Desktop */}
      {categories?.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-screen-xl mx-auto px-6">
            <CategoryNav categories={categories} activeId={activeCategoryId} onSelect={onCategorySelect} />
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useCallback, useRef } from "react";
import { FiCheck, FiDownload, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdImage } from "react-icons/md";
import VariantSelector from "./VariantSelector";
import QuantitySelector from "./QuantitySelector";
import { Product, Combination, CartItem } from "@/types/catalog";

// ─── Image Carousel with swipe ─────────────────────────────────────────────
function ImageCarousel({ images, productName }: { images: string[]; productName: string }) {
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (images.length <= 1) {
    return images[0] ? (
      <img src={images[0]} alt={productName} className="w-full h-auto object-contain block" loading="lazy" />
    ) : (
      <div className="w-full h-48 flex items-center justify-center">
        <MdImage className="w-12 h-12 text-gray-300" />
      </div>
    );
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }
    if (isHorizontalSwipe.current) {
      e.preventDefault();
      const atStart = current === 0 && deltaX > 0;
      const atEnd = current === images.length - 1 && deltaX < 0;
      const resistance = (atStart || atEnd) ? 0.3 : 1;
      setDragOffset(deltaX * resistance);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = containerRef.current ? containerRef.current.offsetWidth * 0.2 : 60;
    if (isHorizontalSwipe.current) {
      if (dragOffset < -threshold && current < images.length - 1) setCurrent(current + 1);
      else if (dragOffset > threshold && current > 0) setCurrent(current - 1);
    }
    setDragOffset(0);
    isHorizontalSwipe.current = null;
  };

  const translateX = isDragging
    ? -current * 100 + (dragOffset / (containerRef.current?.offsetWidth || 1)) * 100
    : -current * 100;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex"
        style={{
          transform: `translateX(${translateX}%)`,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
          willChange: "transform",
        }}
      >
        {images.map((src, i) => (
          <div key={i} className="relative w-full flex-shrink-0">
            <img src={src} alt={`${productName} ${i + 1}`} className="w-full h-auto object-contain block" loading={i === 0 ? "eager" : "lazy"} draggable={false} />
          </div>
        ))}
      </div>
      {current > 0 && (
        <button onClick={(e) => { e.stopPropagation(); setCurrent(current - 1); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white items-center justify-center hidden sm:flex hover:bg-black/50 transition-colors cursor-pointer">
          <FiChevronLeft size={16} />
        </button>
      )}
      {current < images.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); setCurrent(current + 1); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white items-center justify-center hidden sm:flex hover:bg-black/50 transition-colors cursor-pointer">
          <FiChevronRight size={16} />
        </button>
      )}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }} className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === current ? "bg-white scale-125" : "bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Product Card ───────────────────────────────────────────────────────────
interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  cartItems: CartItem[];
  cartItem?: CartItem;
  savedConfig?: CartItem;
  onToggle: () => void;
  onUpdateItem: (item: CartItem) => void;
  onUpdateVariantItems: (productId: string, items: CartItem[]) => void;
  priceDisplay?: string | null;
}

export default function ProductCard({
  product, isSelected, cartItems, cartItem, onToggle, onUpdateItem, onUpdateVariantItems, priceDisplay,
}: ProductCardProps) {
  const qty = cartItem?.quantity || 0;
  const hasCombinations = (product.combinations?.length || 0) > 0;
  const hasVariants = (product.variants?.length || 0) > 0 && hasCombinations;

  const resolvePrice = (p: Product) => {
    if (priceDisplay === "price2") return parseFloat(String(p.price2)) || parseFloat(String(p.price)) || parseFloat(String(p.basePrice)) || 0;
    if (priceDisplay === "price3") return parseFloat(String(p.price3)) || parseFloat(String(p.price)) || parseFloat(String(p.basePrice)) || 0;
    return parseFloat(String(p.price)) || parseFloat(String(p.basePrice)) || 0;
  };

  const price = resolvePrice(product);

  const resolveComboPrice = (combo: Combination) => {
    if (priceDisplay === "price2") return parseFloat(String(combo.price2)) || parseFloat(String(combo.price)) || price;
    if (priceDisplay === "price3") return parseFloat(String(combo.price3)) || parseFloat(String(combo.price)) || price;
    return parseFloat(String(combo.price)) || price;
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.imageUrl) return;
    try {
      const res = await fetch(product.imageUrl);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${product.name || "producto"}.jpg`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(link.href); }, 100);
    } catch {
      window.open(product.imageUrl, "_blank");
    }
  };

  const handleRowsChange = useCallback((items: { combinationId: string | null; variantOptions: { variantName: string; optionValue: string }[]; quantity: number; unitPrice: number }[]) => {
    if (!items.length) {
      if (isSelected) onToggle();
      return;
    }
    const mapped: CartItem[] = items.map((item) => ({
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl || "",
      combinationId: item.combinationId,
      variantOptions: item.variantOptions,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
    }));
    onUpdateVariantItems(product.id, mapped);
  }, [isSelected, product, onToggle, onUpdateVariantItems]);

  const displayPrice = (() => {
    if (hasCombinations) {
      const prices = product.combinations!.map((c) => resolveComboPrice(c)).filter(Boolean);
      if (!prices.length) return price;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? min : { min, max };
    }
    return price;
  })();

  return (
    <div className={`bg-white rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 ${isSelected ? "ring-[3px] ring-orange-400 shadow-orange-100" : "shadow-md hover:shadow-xl"}`}>
      {/* Image */}
      <div className="relative w-full bg-gray-100">
        {(() => {
          const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];
          if (allImages.length > 1) return <ImageCarousel images={allImages} productName={product.name} />;
          if (product.imageUrl) return <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-contain block" loading="lazy" />;
          return <div className="w-full h-48 flex items-center justify-center"><MdImage className="w-12 h-12 text-gray-300" /></div>;
        })()}
        {product.imageUrl && (
          <button onClick={handleDownload} className="absolute top-3 left-3 z-10 w-9 h-9 rounded-lg border-2 border-white bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all cursor-pointer" aria-label="Descargar imagen">
            <FiDownload size={15} />
          </button>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2 w-7 h-7 bg-orange-400 rounded-full flex items-center justify-center shadow-md">
            <FiCheck className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1">
        <h3 className="px-4 pt-3 pb-1 text-center text-base font-semibold text-gray-800 leading-snug">{product.name}</h3>
        {product.description && (
          <p className="px-4 pb-2 text-center text-sm text-gray-500 leading-relaxed line-clamp-3">{product.description}</p>
        )}
        {(price > 0 || hasCombinations) && (
          <p className="px-4 pb-2 text-center text-xl font-bold text-green-600">
            {typeof displayPrice === "object"
              ? `${Math.round(displayPrice.min).toLocaleString("es-CO")} - ${Math.round(displayPrice.max).toLocaleString("es-CO")}`
              : `${Math.round(displayPrice).toLocaleString("es-CO")}`}
          </p>
        )}

        {/* Variant rows selector */}
        {hasVariants && (
          <VariantSelector
            variants={product.variants!}
            combinations={product.combinations!}
            cartItems={cartItems || []}
            onRowsChange={handleRowsChange}
            getPriceForCombo={resolveComboPrice}
          />
        )}

        {/* Simple quantity selector */}
        {!hasVariants && (
          <div className="p-3 bg-gray-50 border-t-2 border-gray-200" onClick={(e) => e.stopPropagation()}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Cantidad:</label>
            <div className={`grid gap-2 items-center p-3 rounded-xl border-2 transition-all ${isSelected ? "border-green-400 bg-green-50" : "border-gray-200 bg-white hover:border-orange-300"}`} style={{ gridTemplateColumns: isSelected ? "1fr 32px" : "1fr" }}>
              <QuantitySelector
                value={qty}
                onChange={(val) => {
                  if (val > 0) {
                    onUpdateItem({
                      productId: product.id,
                      productName: product.name,
                      productImageUrl: product.imageUrl || "",
                      combinationId: null,
                      variantOptions: [],
                      quantity: val,
                      unitPrice: price,
                      totalPrice: price * val,
                    });
                  }
                }}
              />
              {isSelected && (
                <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors flex-shrink-0 cursor-pointer">
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

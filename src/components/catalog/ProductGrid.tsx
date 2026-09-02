"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { FiShoppingBag, FiChevronUp } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import ProductCard from "./ProductCard";
import ProductCardSimple, { ProductCardSimpleSkeleton } from "./ProductCardSimple";
import FloatingCartButton from "./FloatingCartButton";
import CartModal from "./CartModal";
import CatalogStickyHeader from "./CatalogStickyHeader";
import CatalogDesktopHeader from "./CatalogDesktopHeader";
import CatalogSearchBar from "./CatalogSearchBar";
import { createPublicCatalogOrder, generateOrderShareLink, getProductPreviewsClient, getCatalogProductIdsClient } from "@/lib/api";
import { buildWhatsAppMessage, getWhatsAppUrl, CustomerData } from "@/lib/whatsapp";
import CheckoutModal from "./CheckoutModal";
import { useCatalogCart } from "@/hooks/useCatalogCart";
import { Product, CatalogData, BodegaData, CartItem } from "@/types/catalog";
import ErrorToast from "@/components/ui/ErrorToast";

const ITEMS_PER_LOAD = 20;

// ─── Expanded card inline (for 2col layout) ─────────────────────────────────
function ExpandedCardInline({
  product,
  onClose,
  ...cardProps
}: {
  product: Product;
  onClose: () => void;
  isSelected: boolean;
  cartItems: CartItem[];
  cartItem?: CartItem;
  onToggle: () => void;
  onUpdateItem: (item: CartItem) => void;
  onUpdateVariantItems: (productId: string, items: CartItem[]) => void;
  priceDisplay?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => clearTimeout(t);
  }, [product.id]);

  return (
    <div ref={ref} className="my-2" style={{ animation: "cardExpand 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards", transformOrigin: "top center" }}>
      <ProductCard product={product} {...cardProps} />
      <button onClick={onClose} className="mx-auto mt-2 mb-1 flex items-center rounded-full overflow-hidden transition-all hover:-translate-y-0.5 cursor-pointer" style={{ background: "#fa7e17" }}>
        <span className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: "#e06a0e" }}>
          <FiChevronUp size={14} color="white" />
        </span>
        <span className="text-xs font-medium text-white px-3 pr-4">Cerrar</span>
      </button>
    </div>
  );
}

// ─── MasonryGrid2Col ─────────────────────────────────────────────────────────
function MasonryGrid2Col({
  products, cart, selectedIds, onToggle, onUpdateItem, onUpdateVariantItems, loadingMore, hasMore, priceDisplay,
}: {
  products: Product[];
  cart: CartItem[];
  selectedIds: Set<string>;
  onToggle: (product: Product) => void;
  onUpdateItem: (item: CartItem) => void;
  onUpdateVariantItems: (productId: string, items: CartItem[]) => void;
  loadingMore: boolean;
  hasMore: boolean;
  priceDisplay?: string | null;
}) {
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const handleExpand = (id: string) => setExpandedProductId((prev) => (prev === id ? null : id));

  const expandedProduct = products.find((p) => p.id === expandedProductId) || null;
  const leftProducts = products.filter((_, i) => i % 2 === 0);
  const rightProducts = products.filter((_, i) => i % 2 === 1);

  const expandedIdx = expandedProduct ? products.findIndex((p) => p.id === expandedProductId) : -1;
  const expandedCol = expandedIdx >= 0 ? (expandedIdx % 2 === 0 ? "left" : "right") : null;
  const expandedColIdx = expandedIdx >= 0 ? Math.floor(expandedIdx / 2) : -1;

  const renderCol = (colProducts: Product[], colSide: string) => (
    <div className="flex-1 min-w-0 flex flex-col gap-2">
      {colProducts.map((p) => (
        <ProductCardSimple key={p.id} product={p} onClick={() => handleExpand(p.id)} priceDisplay={priceDisplay} />
      ))}
      {loadingMore && hasMore && Array.from({ length: 3 }).map((_, i) => (
        <ProductCardSimpleSkeleton key={`sk-${colSide}-${i}`} />
      ))}
    </div>
  );

  if (!expandedProduct) {
    return (
      <div>
        <div className="flex gap-2 items-start">
          {renderCol(leftProducts, "left")}
          {renderCol(rightProducts, "right")}
        </div>
        {loadingMore && hasMore && (
          <div className="flex gap-2 mt-2">
            <div className="flex-1"><ProductCardSimpleSkeleton /></div>
            <div className="flex-1"><ProductCardSimpleSkeleton /></div>
          </div>
        )}
      </div>
    );
  }

  const leftBefore = leftProducts.slice(0, expandedCol === "left" ? expandedColIdx : expandedColIdx + 1);
  const leftAfter = leftProducts.slice(expandedCol === "left" ? expandedColIdx + 1 : expandedColIdx + 1);
  const rightBefore = rightProducts.slice(0, expandedCol === "right" ? expandedColIdx : expandedColIdx + 1);
  const rightAfter = rightProducts.slice(expandedCol === "right" ? expandedColIdx + 1 : expandedColIdx + 1);

  const cardProps = {
    isSelected: selectedIds.has(expandedProduct.id),
    cartItems: cart.filter((i) => i.productId === expandedProduct.id),
    cartItem: cart.find((i) => i.productId === expandedProduct.id),
    onToggle: () => onToggle(expandedProduct),
    onUpdateItem,
    onUpdateVariantItems,
    priceDisplay,
  };

  return (
    <div>
      <div className="flex gap-2 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {leftBefore.map((p) => <ProductCardSimple key={p.id} product={p} onClick={() => handleExpand(p.id)} priceDisplay={priceDisplay} />)}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {rightBefore.map((p) => <ProductCardSimple key={p.id} product={p} onClick={() => handleExpand(p.id)} priceDisplay={priceDisplay} />)}
        </div>
      </div>
      <ExpandedCardInline product={expandedProduct} {...cardProps} onClose={() => handleExpand(expandedProduct.id)} />
      {(leftAfter.length > 0 || rightAfter.length > 0) && (
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {leftAfter.map((p) => <ProductCardSimple key={p.id} product={p} onClick={() => handleExpand(p.id)} priceDisplay={priceDisplay} />)}
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {rightAfter.map((p) => <ProductCardSimple key={p.id} product={p} onClick={() => handleExpand(p.id)} priceDisplay={priceDisplay} />)}
          </div>
        </div>
      )}
      {loadingMore && hasMore && (
        <div className="flex gap-2 mt-2">
          <div className="flex-1"><ProductCardSimpleSkeleton /></div>
          <div className="flex-1"><ProductCardSimpleSkeleton /></div>
        </div>
      )}
    </div>
  );
}

// ─── Main ProductGrid ────────────────────────────────────────────────────────
interface ProductGridProps {
  shortId: string;
  initialProducts: Product[];
  allProductIds: string[];
  catalogData: CatalogData;
  bodega: BodegaData;
}

export default function ProductGrid({ shortId, initialProducts, allProductIds, catalogData, bodega }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productIds, setProductIds] = useState<string[]>(allProductIds);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(allProductIds.length > ITEMS_PER_LOAD);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  // Idempotency: generado al abrir checkout, reutilizado en reintentos
  const orderAttemptIdRef = useRef<string | null>(null);
  const [pendingWhatsApp, setPendingWhatsApp] = useState<{ phone: string; message: string } | null>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const loadIndexRef = useRef(ITEMS_PER_LOAD);

  const {
    cart, setCart, selectedIds,
    toggleProduct, updateCartItem, updateVariantItems, getCartTotal, clearCart,
  } = useCatalogCart(shortId);

  // Sticky header on scroll (mobile) — threshold 200px, same as original
  useEffect(() => {
    const onScroll = () => setShowStickyHeader(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Search + category effect
  useEffect(() => {
    if (search.trim()) {
      setIsSearching(true);
      setLoadingMore(true);
      getCatalogProductIdsClient(shortId, { search, categoryId: activeCategoryId || undefined }).then(async (data) => {
        const ids = data.productIds || [];
        setProductIds(ids);
        if (ids.length) {
          const previews = await getProductPreviewsClient(ids);
          setProducts(previews);
        } else {
          setProducts([]);
        }
        loadIndexRef.current = ids.length;
        setHasMore(false);
      }).catch(() => { /* ignore */ })
        .finally(() => { setIsSearching(false); setLoadingMore(false); });
    } else if (activeCategoryId) {
      setLoadingMore(true);
      getCatalogProductIdsClient(shortId, { categoryId: activeCategoryId }).then(async (data) => {
        const ids = data.productIds || [];
        setProductIds(ids);
        if (ids.length) {
          const first = ids.slice(0, ITEMS_PER_LOAD);
          const previews = await getProductPreviewsClient(first);
          setProducts(previews);
          loadIndexRef.current = ITEMS_PER_LOAD;
          setHasMore(ids.length > ITEMS_PER_LOAD);
        } else {
          setProducts([]);
          setHasMore(false);
        }
      }).catch(() => { /* ignore */ })
        .finally(() => setLoadingMore(false));
    } else {
      setProductIds(allProductIds);
      loadIndexRef.current = ITEMS_PER_LOAD;
      setHasMore(allProductIds.length > ITEMS_PER_LOAD);
      setProducts(initialProducts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeCategoryId]);

  // Load more on scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !productIds.length || isSearching) return;
    setLoadingMore(true);
    try {
      const next = productIds.slice(loadIndexRef.current, loadIndexRef.current + ITEMS_PER_LOAD);
      if (!next.length) { setHasMore(false); return; }
      const previews = await getProductPreviewsClient(next);
      setProducts((prev) => [...prev, ...previews]);
      loadIndexRef.current += ITEMS_PER_LOAD;
      if (loadIndexRef.current >= productIds.length) setHasMore(false);
    } catch { /* ignore */ }
    finally { setLoadingMore(false); }
  }, [productIds, loadingMore, hasMore, isSearching]);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore || isSearching) return;
      if (window.innerHeight + document.documentElement.scrollTop + 300 >= document.documentElement.offsetHeight) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore, loadingMore, hasMore, isSearching]);

  const handleToggle = (product: Product) => toggleProduct(product.id);
  const handleCategorySelect = (id: string | null) => {
    setActiveCategoryId(id);
    setSearchInput("");
  };

  // ─── Order logic ─────────────────────────────────────────────────────────
  const handleCartConfirm = () => {
    if (catalogData?.requiresCheckout) {
      setShowCart(false);
      setShowCheckout(true);
      setOrderError(null);
      if (!orderAttemptIdRef.current) {
        orderAttemptIdRef.current = crypto.randomUUID();
      }
    } else {
      if (!orderAttemptIdRef.current) {
        orderAttemptIdRef.current = crypto.randomUUID();
      }
      handleOrder(null);
    }
  };

  const handleOrder = async (customerData: CustomerData | null) => {
    try {
      setCreatingOrder(true);

      const order = await createPublicCatalogOrder(
        {
          catalogId: catalogData.id,
          customerName: customerData?.name,
          customerPhone: customerData?.phone,
          customerAddress: customerData?.address,
          customerNeighborhood: customerData?.neighborhood,
          customerDepartment: customerData?.department,
          customerCity: customerData?.city,
          notes: customerData?.notes,
          totalAmount: getCartTotal(),
          items: cart.map((item) => ({
            productId: item.productId,
            combinationId: item.combinationId || undefined,
            productName: item.productName,
            productImageUrl: item.productImageUrl,
            variantOptions: item.variantOptions || [],
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
        orderAttemptIdRef.current ?? undefined,
      );

      // Generate share link (fail silently)
      const firstImage = cart[0]?.productImageUrl || "";
      let shareUrl: string | null = null;
      try {
        const { shareId } = await generateOrderShareLink(order.id, order.orderNumber, firstImage);
        const posUrl = process.env.NEXT_PUBLIC_POS_URL || "https://pos.flystock.com.co";
        shareUrl = `${posUrl}/share/${shareId}`;
      } catch { /* si falla el share, continuar sin él */ }

      const phone = catalogData?.whatsappNumber || bodega?.phone;
      const message = buildWhatsAppMessage(cart, customerData, order.orderNumber, shareUrl, getCartTotal);

      clearCart();
      setShowCheckout(false);
      setShowCart(false);
      orderAttemptIdRef.current = null; // descartar — próxima compra generará uno nuevo

      if (phone) setPendingWhatsApp({ phone, message });
    } catch (err) {
      console.error("Error al crear orden:", err);
      setOrderError(err instanceof Error ? err.message : "Error al crear el pedido. Intenta de nuevo.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const layout = catalogData?.layout || "default";
  const priceDisplay = catalogData?.priceDisplay ?? null;
  const categories = catalogData?.categories || [];
  const whatsappNumber = catalogData?.whatsappNumber || bodega?.phone || null;
  const title = bodega?.publicName || bodega?.name || catalogData?.publicName || "Catálogo";
  const description = bodega?.description || catalogData?.description || null;
  const bannerSrc = bodega?.bannerUrl || null;
  const logoSrc = bodega?.logoUrl || null;
  const logoInitial = bodega?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <>
      {/* Sticky header móvil — aparece solo al hacer scroll >200px */}
      <CatalogStickyHeader
        visible={showStickyHeader}
        logoSrc={logoSrc}
        logoInitial={logoInitial}
        title={title}
        whatsappNumber={whatsappNumber}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onClearSearch={() => setSearchInput("")}
        showSearch={showStickySearch}
        onToggleSearch={() => setShowStickySearch((p) => !p)}
        categories={categories}
        activeCategoryId={activeCategoryId}
        onCategorySelect={handleCategorySelect}
      />

      {/* Banner móvil — pegado arriba, sin padding */}
      <div className="md:hidden relative w-full h-32">
        {bannerSrc
          ? <Image src={bannerSrc} alt="Banner" fill className="object-cover" sizes="100vw" priority />
          : <div className="w-full h-full bg-gradient-to-r from-orange-400 to-orange-500" />}
      </div>

      {/* Header desktop (banner full-width + barra info + categorías) */}
      <CatalogDesktopHeader
        bannerSrc={bannerSrc}
        logoSrc={logoSrc}
        logoInitial={logoInitial}
        title={title}
        description={description}
        whatsappNumber={whatsappNumber}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onClearSearch={() => setSearchInput("")}
        categories={categories}
        activeCategoryId={activeCategoryId}
        onCategorySelect={handleCategorySelect}
      />

      {/* Search bar móvil + categorías (debajo del banner, siempre visible) */}
      <div className="md:hidden">
        <CatalogSearchBar
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onClearSearch={() => setSearchInput("")}
          categories={categories}
          activeCategoryId={activeCategoryId}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* Grid de productos */}
      <div className="max-w-screen-xl mx-auto px-4 pb-32 mt-4">
        {products.length === 0 && !loadingMore ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center mt-4">
            <FiShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay productos disponibles</p>
          </div>
        ) : (
          <>
            {/* Mobile layouts */}
            {layout === "2col" ? (
              <div className="md:hidden">
                <MasonryGrid2Col
                  products={products} cart={cart} selectedIds={selectedIds}
                  onToggle={handleToggle} onUpdateItem={updateCartItem} onUpdateVariantItems={updateVariantItems}
                  loadingMore={loadingMore} hasMore={hasMore} priceDisplay={priceDisplay}
                />
              </div>
            ) : layout === "shopify" ? (
              <div className="md:hidden flex gap-2 items-start px-1">
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  {products.filter((_, i) => i % 2 === 0).map((product) => (
                    <ProductCardSimple key={product.id} product={product} priceDisplay={priceDisplay} />
                  ))}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  {products.filter((_, i) => i % 2 === 1).map((product) => (
                    <ProductCardSimple key={product.id} product={product} priceDisplay={priceDisplay} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="md:hidden grid gap-3 grid-cols-1">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product}
                    isSelected={selectedIds.has(product.id)}
                    cartItems={cart.filter((i) => i.productId === product.id)}
                    cartItem={cart.find((i) => i.productId === product.id)}
                    onToggle={() => handleToggle(product)}
                    onUpdateItem={updateCartItem}
                    onUpdateVariantItems={updateVariantItems}
                    priceDisplay={priceDisplay} />
                ))}
              </div>
            )}

            {/* Desktop layouts */}
            {layout === "shopify" ? (
              <div className="hidden md:flex gap-4 items-start">
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                  {products.filter((_, i) => i % 2 === 0).map((product) => (
                    <ProductCardSimple key={product.id} product={product} priceDisplay={priceDisplay} />
                  ))}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                  {products.filter((_, i) => i % 2 === 1).map((product) => (
                    <ProductCardSimple key={product.id} product={product} priceDisplay={priceDisplay} />
                  ))}
                </div>
              </div>
            ) : layout === "2col" ? (
              <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product}
                    isSelected={selectedIds.has(product.id)}
                    cartItems={cart.filter((i) => i.productId === product.id)}
                    cartItem={cart.find((i) => i.productId === product.id)}
                    onToggle={() => handleToggle(product)}
                    onUpdateItem={updateCartItem}
                    onUpdateVariantItems={updateVariantItems}
                    priceDisplay={priceDisplay} />
                ))}
              </div>
            ) : (
              <div className="hidden md:block" style={{ columnWidth: "280px", columnGap: "16px" }}>
                {products.map((product) => (
                  <div key={product.id} style={{ breakInside: "avoid", marginBottom: "16px" }}>
                    <ProductCard product={product}
                      isSelected={selectedIds.has(product.id)}
                      cartItems={cart.filter((i) => i.productId === product.id)}
                      cartItem={cart.find((i) => i.productId === product.id)}
                      onToggle={() => handleToggle(product)}
                      onUpdateItem={updateCartItem}
                      onUpdateVariantItems={updateVariantItems}
                      priceDisplay={priceDisplay} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {loadingMore && (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Floating cart */}
      {!showCart && !showCheckout && (
        <FloatingCartButton
          cart={cart}
          cartTotal={getCartTotal()}
          onOpenCart={() => setShowCart(true)}
        />
      )}

      {/* Cart modal */}
      {showCart && (
        <CartModal
          cart={cart}
          onClose={() => { setShowCart(false); setOrderError(null); orderAttemptIdRef.current = null; }}
          onConfirm={handleCartConfirm}
          onUpdateCart={setCart}
          requiresCheckout={catalogData?.requiresCheckout}
          creatingOrder={creatingOrder}
        />
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => { setShowCheckout(false); setOrderError(null); orderAttemptIdRef.current = null; }}
          onConfirm={handleOrder}
          creatingOrder={creatingOrder}
        />
      )}

      {/* Mini modal: pedido listo → abrir WhatsApp */}
      {pendingWhatsApp && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.55)" }}>
          <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg,#25d366,#1ea952)" }}>
              <FaWhatsapp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">¡Pedido listo!</h3>
            <p className="text-gray-500 text-sm mb-6">Toca el botón para enviar tu pedido por WhatsApp</p>
            <a
              href={getWhatsAppUrl(pendingWhatsApp.phone, pendingWhatsApp.message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setPendingWhatsApp(null)}
              className="block w-full text-white py-4 rounded-2xl text-base font-bold text-center no-underline"
              style={{ background: "linear-gradient(135deg,#25d366,#128C7E)", boxShadow: "0 4px 16px rgba(37,211,102,0.35)" }}
            >
              Abrir WhatsApp
            </a>
          </div>
        </div>
      )}
      {/* Error toast — aparece sobre toda la pantalla */}
      <ErrorToast message={orderError} onDismiss={() => setOrderError(null)} />
    </>
  );
}

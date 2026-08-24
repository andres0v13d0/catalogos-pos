import { CatalogIdsResponse, Product } from "@/types/catalog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function getCatalogProductIds(
  shortId: string
): Promise<CatalogIdsResponse> {
  const res = await fetch(`${API_URL}/public/catalog/c/${shortId}/product-ids`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Catálogo no encontrado");
  return res.json();
}

export async function getProductPreviews(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const res = await fetch(`${API_URL}/public/catalog/products/previews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Error al cargar productos");
  return res.json();
}

// Client-side fetches (no caching)
export async function getProductPreviewsClient(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const res = await fetch(`${API_URL}/public/catalog/products/previews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Error al cargar productos");
  return res.json();
}

export async function getCatalogProductIdsClient(
  shortId: string,
  params?: { search?: string; categoryId?: string }
): Promise<CatalogIdsResponse> {
  const url = new URL(`${API_URL}/public/catalog/c/${shortId}/product-ids`);
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.categoryId) url.searchParams.set("categoryId", params.categoryId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Catálogo no encontrado");
  return res.json();
}

// ─── Order endpoints ─────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  catalogId: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNeighborhood?: string;
  customerDepartment?: string;
  customerCity?: string;
  notes?: string;
  totalAmount: number;
  items: {
    productId: string;
    combinationId?: string;
    productName: string;
    productImageUrl: string;
    variantOptions: { variantName: string; optionValue: string }[];
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNeighborhood?: string;
  customerDepartment?: string;
  customerCity?: string;
  notes?: string;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    productImageUrl?: string;
    variantOptions?: { variantName: string; optionValue: string }[];
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  bodega?: { name: string; publicName?: string };
  catalog?: { publicName?: string };
}

export async function createPublicCatalogOrder(data: CreateOrderPayload): Promise<OrderResponse> {
  const res = await fetch(`${API_URL}/public/catalog-orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear la orden");
  }
  return res.json();
}

export async function generateOrderShareLink(
  orderId: string,
  orderNumber: string,
  imageUrl: string
): Promise<{ shareId: string }> {
  const res = await fetch(`${API_URL}/share/order/${orderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderNumber, imageUrl, baseUrl: window.location.origin }),
  });
  if (!res.ok) throw new Error("Error generando link");
  return res.json();
}

export async function getPublicCatalogOrder(orderId: string): Promise<OrderResponse> {
  const res = await fetch(`${API_URL}/public/catalog-orders/${orderId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Pedido no encontrado");
  return res.json();
}

import { authFetch } from "./auth";

export type CatalogType = "all" | "category" | "custom";

export interface Catalog {
  id: string;
  shortId: string;
  name: string;
  type: CatalogType;
  isActive: boolean;
}

export interface ProductOption {
  id: string;
  name: string;
}

export interface NewCatalogInput {
  name: string;
  type: CatalogType;
  categoryIds: string[];
  productIds: string[];
  whatsappNumber: string;
}

async function check(res: Response, fallback: string) {
  if (res.ok) return res;
  const body = await res.json().catch(() => ({}));
  const msg = Array.isArray(body.message) ? body.message.join(", ") : body.message;
  throw new Error(msg || fallback);
}

export async function listCatalogs(): Promise<Catalog[]> {
  const res = await check(await authFetch("/catalogs"), "No se pudieron cargar los catálogos");
  return res.json();
}

// shortcut: máx. 50 resultados sin paginar; la búsqueda cubre el resto. Paginar si hace falta.
export async function searchProducts(search: string): Promise<ProductOption[]> {
  const q = new URLSearchParams({ limit: "50", ...(search.trim() && { search: search.trim() }) });
  const res = await check(await authFetch(`/products?${q}`), "No se pudieron cargar los productos");
  return (await res.json()).data ?? [];
}

export async function createCatalog(input: NewCatalogInput): Promise<Catalog> {
  const res = await check(
    await authFetch("/catalogs", {
      method: "POST",
      body: JSON.stringify({
        name: input.name.trim(),
        type: input.type,
        requiresCheckout: true,
        whatsappNumber: input.whatsappNumber || undefined,
        categoryIds: input.type === "category" ? input.categoryIds : undefined,
        productIds: input.type === "custom" ? input.productIds : undefined,
      }),
    }),
    "No se pudo crear el catálogo",
  );
  return res.json();
}

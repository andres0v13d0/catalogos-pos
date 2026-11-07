import { authFetch } from "./auth";

export const MAX_IMAGES = 8; // shortcut: fijo; cuando haya plan con límite, leerlo del backend
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // mismo límite que POST /upload/image

export interface Category {
  id: string;
  name: string;
}

export interface NewProductInput {
  bodegaId: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  imageUrls: string[];
}

async function check(res: Response, fallback: string) {
  if (res.ok) return res;
  const body = await res.json().catch(() => ({}));
  const msg = Array.isArray(body.message) ? body.message.join(", ") : body.message;
  throw new Error(msg || fallback);
}

export async function getCategories(): Promise<Category[]> {
  const res = await check(await authFetch("/categories?status=active"), "No se pudieron cargar las categorías");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createCategory(name: string): Promise<Category> {
  const res = await check(
    await authFetch("/categories", { method: "POST", body: JSON.stringify({ name }) }),
    "No se pudo crear la categoría",
  );
  return res.json();
}

/** Sube una imagen (el backend la comprime) y devuelve su URL pública. */
export async function uploadImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`"${file.name}" pesa ${(file.size / 1024 / 1024).toFixed(1)}MB. El máximo es 3MB.`);
  }
  const form = new FormData();
  form.append("file", file);
  const res = await check(await authFetch("/upload/image", { method: "POST", body: form }), `No se pudo subir "${file.name}"`);
  return (await res.json()).publicUrl;
}

/**
 * Producto simple: sin variantes y sin stock (no se envía warehouseStocks).
 * La primera imagen es la portada.
 */
export async function createProduct(input: NewProductInput) {
  const res = await check(
    await authFetch("/products", {
      method: "POST",
      body: JSON.stringify({
        bodegaId: input.bodegaId,
        name: input.name.trim(),
        description: input.description.trim() || undefined,
        categoryId: input.categoryId,
        unit: "Unidad",
        hasVariants: false,
        price: input.price,
        imageUrl: input.imageUrls[0],
        images: input.imageUrls,
      }),
    }),
    "No se pudo crear el producto",
  );
  return res.json();
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormMessage, buttonClass, inputClass } from "@/components/auth/AuthShell";
import { createCatalog, searchProducts, type CatalogType, type ProductOption } from "@/lib/catalogs";
import { getCategories, type Category } from "@/lib/products";

const TYPES: [CatalogType, string][] = [
  ["all", "Todos los productos"],
  ["category", "Por categorías"],
  ["custom", "Selección de productos"],
];

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export default function CatalogForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<CatalogType>("all");
  const [whatsapp, setWhatsapp] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (type !== "category") return;
    getCategories().then(setCategories).catch((e) => setError(e.message));
  }, [type]);

  useEffect(() => {
    if (type !== "custom") return;
    const t = setTimeout(() => searchProducts(search).then(setProducts).catch((e) => setError(e.message)), 300);
    return () => clearTimeout(t);
  }, [type, search]);

  const valid =
    name.trim() && (type === "all" || (type === "category" ? categoryIds.length : productIds.length) > 0);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createCatalog({ name, type, categoryIds, productIds, whatsappNumber: whatsapp });
      router.replace("/panel/catalogos");
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <label className="block text-sm font-medium text-gray-600">Nombre del catálogo
        <input className={`${inputClass} mt-1 font-normal`} value={name} maxLength={255} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="block text-sm font-medium text-gray-600">WhatsApp para pedidos (opcional)
        <input className={`${inputClass} mt-1 font-normal`} inputMode="tel" placeholder="Ej.: 573101234567" value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))} />
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-600">¿Qué productos incluye?</legend>
        <div className="space-y-2">
          {TYPES.map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="radio" name="type" checked={type === value} onChange={() => setType(value)} className="accent-orange-400" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {type === "category" && (
        <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
          {categories.length === 0 && <p className="text-sm text-gray-400">No tienes categorías todavía.</p>}
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={categoryIds.includes(c.id)} onChange={() => setCategoryIds(toggle(categoryIds, c.id))} className="accent-orange-400" />
              {c.name}
            </label>
          ))}
        </div>
      )}

      {type === "custom" && (
        <div className="space-y-2">
          <input className={inputClass} placeholder="Buscar producto…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
            {products.length === 0 && <p className="text-sm text-gray-400">Sin resultados.</p>}
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={productIds.includes(p.id)} onChange={() => setProductIds(toggle(productIds, p.id))} className="accent-orange-400" />
                {p.name}
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400">{productIds.length} seleccionados</p>
        </div>
      )}

      {error && <FormMessage kind="error">{error}</FormMessage>}
      <button type="submit" className={buttonClass} disabled={!valid || saving}>
        {saving ? "Creando…" : "Crear catálogo"}
      </button>
    </form>
  );
}

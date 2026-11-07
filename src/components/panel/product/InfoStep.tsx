"use client";

import { useEffect, useState } from "react";
import { createCategory, getCategories, type Category } from "@/lib/products";
import { inputClass } from "@/components/auth/AuthShell";

export interface InfoValues {
  name: string;
  description: string;
  categoryId: string;
  price: string;
}

interface Props {
  values: InfoValues;
  onChange: (v: InfoValues) => void;
}

export default function InfoStep({ values, onChange }: Props) {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const set = (patch: Partial<InfoValues>) => onChange({ ...values, ...patch });

  useEffect(() => {
    getCategories().then(setCategories).catch((e) => { setCategories([]); setError(e.message); });
  }, []);

  async function addCategory() {
    const name = newCategory.trim();
    if (!name) return;
    try {
      const cat = await createCategory(name);
      setCategories((prev) => [...(prev ?? []), cat]);
      set({ categoryId: cat.id });
      setNewCategory("");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-600">Nombre
        <input className={`${inputClass} mt-1 font-normal`} value={values.name} maxLength={120}
          onChange={(e) => set({ name: e.target.value })} />
      </label>
      <label className="block text-sm font-medium text-gray-600">Descripción (opcional)
        <textarea className={`${inputClass} mt-1 font-normal`} rows={3} value={values.description}
          onChange={(e) => set({ description: e.target.value })} />
      </label>
      <label className="block text-sm font-medium text-gray-600">Precio
        <input className={`${inputClass} mt-1 font-normal`} inputMode="numeric" placeholder="Ej.: 25000"
          value={values.price} onChange={(e) => set({ price: e.target.value.replace(/\D/g, "") })} />
      </label>
      <label className="block text-sm font-medium text-gray-600">Categoría
        <select className={`${inputClass} mt-1 font-normal`} value={values.categoryId}
          onChange={(e) => set({ categoryId: e.target.value })} disabled={categories === null}>
          <option value="">{categories === null ? "Cargando…" : "Selecciona una categoría"}</option>
          {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <div className="flex gap-2">
        <input className={inputClass} placeholder="Nueva categoría" value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)} />
        <button type="button" onClick={addCategory}
          className="shrink-0 rounded-lg border border-orange-400 px-3 text-sm font-medium text-orange-500 hover:bg-orange-50">Crear</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

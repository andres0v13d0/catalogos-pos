"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listCatalogs, type Catalog } from "@/lib/catalogs";

export default function CatalogosPage() {
  const [catalogs, setCatalogs] = useState<Catalog[] | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    listCatalogs().then(setCatalogs).catch((e) => { setCatalogs([]); setError(e.message); });
  }, []);

  async function copy(shortId: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/${shortId}`);
    setCopied(shortId);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/panel" className="text-sm text-orange-500 hover:text-orange-600">← Volver</Link>
      <div className="mt-3 mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Mis catálogos</h1>
        <Link href="/panel/catalogos/nuevo" className="rounded-lg bg-orange-400 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500">Nuevo</Link>
      </div>
      {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
      {catalogs === null && <p className="text-sm text-gray-400">Cargando…</p>}
      {catalogs?.length === 0 && !error && <p className="text-sm text-gray-400">Aún no tienes catálogos.</p>}
      <ul className="space-y-3">
        {catalogs?.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <p className="font-medium text-gray-800">{c.name}</p>
              <p className="text-xs text-gray-400">/{c.shortId}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <a href={`/${c.shortId}`} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600">Ver</a>
              <button onClick={() => copy(c.shortId)} className="text-gray-500 hover:text-gray-700">
                {copied === c.shortId ? "¡Copiado!" : "Copiar enlace"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOwner } from "@/components/auth/AuthProvider";
import { FormMessage, buttonClass } from "@/components/auth/AuthShell";
import { createProduct, uploadImage } from "@/lib/products";
import ImagesStep from "./ImagesStep";
import InfoStep, { type InfoValues } from "./InfoStep";

export default function ProductWizard() {
  const owner = useOwner();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [info, setInfo] = useState<InfoValues>({ name: "", description: "", categoryId: "", price: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const price = Number(info.price);
  const canSave = info.name.trim() && info.categoryId && price > 0;

  async function save() {
    setSaving(true);
    setError("");
    try {
      const imageUrls = await Promise.all(files.map(uploadImage));
      await createProduct({ bodegaId: owner.bodegaId, ...info, price, imageUrls });
      router.replace("/panel");
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-400">Paso {step} de 2</p>
      {step === 1 ? <ImagesStep files={files} onChange={setFiles} /> : <InfoStep values={info} onChange={setInfo} />}
      {error && <div className="mt-4"><FormMessage kind="error">{error}</FormMessage></div>}
      <div className="mt-6 flex gap-3">
        {step === 2 && (
          <button type="button" disabled={saving} onClick={() => setStep(1)}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Atrás</button>
        )}
        {step === 1 ? (
          <button type="button" className={buttonClass} onClick={() => setStep(2)}>
            {files.length ? "Siguiente" : "Continuar sin imágenes"}
          </button>
        ) : (
          <button type="button" className={buttonClass} disabled={!canSave || saving} onClick={save}>
            {saving ? "Guardando…" : "Guardar producto"}
          </button>
        )}
      </div>
    </div>
  );
}

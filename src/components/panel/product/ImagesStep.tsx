"use client";

import { useEffect, useMemo } from "react";
import { MAX_IMAGES } from "@/lib/products";

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

export default function ImagesStep({ files, onChange }: Props) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  function add(list: FileList | null) {
    if (!list) return;
    onChange([...files, ...Array.from(list).filter((f) => f.type.startsWith("image/"))].slice(0, MAX_IMAGES));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Agrega hasta {MAX_IMAGES} imágenes. La primera es la portada.</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {previews.map((src, i) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:), next/image no aplica */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-orange-400 px-1.5 py-0.5 text-[10px] font-semibold text-white">Portada</span>}
            <button type="button" aria-label="Quitar imagen"
              onClick={() => onChange(files.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/60 text-xs text-white">✕</button>
          </div>
        ))}
        {files.length < MAX_IMAGES && (
          <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-3xl text-gray-400 hover:border-orange-400 hover:text-orange-400">
            +
            <input type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
          </label>
        )}
      </div>
    </div>
  );
}

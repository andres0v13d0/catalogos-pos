"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useOwner } from "@/components/auth/AuthProvider";

// Placeholder: aquí irán productos y catálogos (Fases 3 y 4).
export default function PanelPage() {
  const owner = useOwner();
  const router = useRouter();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-gray-800">Hola, {owner.name}</h1>
      <p className="mt-1 text-sm text-gray-400">{owner.email}</p>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/panel/productos/nuevo" className="font-medium text-orange-500 hover:text-orange-600">Nuevo producto</Link>
        <Link href="/panel/catalogos" className="font-medium text-orange-500 hover:text-orange-600">Mis catálogos</Link>
        <Link href="/panel/cuenta" className="text-orange-500 hover:text-orange-600">Mi cuenta</Link>
        <button
          onClick={async () => { await signOut(auth); router.replace("/login"); }}
          className="text-gray-500 hover:text-gray-700"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}

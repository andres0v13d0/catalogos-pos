"use client";

import { useState } from "react";
import Link from "next/link";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authErrorMessage } from "@/lib/auth";
import { useOwner } from "@/components/auth/AuthProvider";
import { FormMessage, buttonClass, inputClass } from "@/components/auth/AuthShell";

export default function CuentaPage() {
  const owner = useOwner();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk(false);
    if (next !== confirm) return setError("Las contraseñas nuevas no coinciden");
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(owner.email, current));
      await updatePassword(user, next);
      setOk(true);
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <Link href="/panel" className="text-sm text-orange-500 hover:text-orange-600">← Volver</Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold text-gray-800">Cambiar contraseña</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {([
          ["Contraseña actual", current, setCurrent, "current-password"],
          ["Nueva contraseña", next, setNext, "new-password"],
          ["Confirmar nueva contraseña", confirm, setConfirm, "new-password"],
        ] as const).map(([label, value, set, auto]) => (
          <div key={label}>
            <label className="mb-1 block text-sm font-medium text-gray-600">{label}
              <input type="password" required minLength={6} autoComplete={auto} className={`${inputClass} mt-1 font-normal`}
                value={value} onChange={(e) => set(e.target.value)} disabled={loading} />
            </label>
          </div>
        ))}
        {error && <FormMessage kind="error">{error}</FormMessage>}
        {ok && <FormMessage kind="ok">Contraseña actualizada.</FormMessage>}
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>
    </main>
  );
}

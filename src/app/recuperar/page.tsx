"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authErrorMessage } from "@/lib/auth";
import { AuthShell, FormMessage, buttonClass, inputClass } from "@/components/auth/AuthShell";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      // user-not-found no se distingue a propósito (no revelar qué correos existen)
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found") setSent(true);
      else setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Recuperar contraseña" subtitle="Te enviaremos un enlace para crear una nueva">
      {sent ? (
        <FormMessage kind="ok">Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.</FormMessage>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-600">Correo</label>
            <input id="email" type="email" autoComplete="email" required className={inputClass}
              value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>
          {error && <FormMessage kind="error">{error}</FormMessage>}
          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      )}
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-orange-500 hover:text-orange-600">Volver a iniciar sesión</Link>
      </p>
    </AuthShell>
  );
}

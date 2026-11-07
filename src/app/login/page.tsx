"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authErrorMessage } from "@/lib/auth";
import { AuthShell, FormMessage, buttonClass, inputClass } from "@/components/auth/AuthShell";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(useSearchParams().get("error") ?? "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/panel"); // el guard del panel valida el plan contra el backend
    } catch (err) {
      setError(authErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Iniciar sesión" subtitle="Ingresa a tu cuenta de Flystock Catálogos">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-600">Correo</label>
          <input id="email" type="email" autoComplete="email" required className={inputClass}
            value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-600">Contraseña</label>
          <input id="password" type="password" autoComplete="current-password" required className={inputClass}
            value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
        </div>
        {error && <FormMessage kind="error">{error}</FormMessage>}
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? "Ingresando…" : "Iniciar sesión"}
        </button>
        <p className="text-center text-sm">
          <Link href="/recuperar" className="text-orange-500 hover:text-orange-600">¿Olvidaste tu contraseña?</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

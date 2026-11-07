"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { authErrorMessage, fetchOwner, type Owner } from "@/lib/auth";

type State =
  | { status: "loading" }
  | { status: "in"; owner: Owner };

const OwnerContext = createContext<Owner | null>(null);
export const useOwner = () => {
  const owner = useContext(OwnerContext);
  if (!owner) throw new Error("useOwner fuera de AuthProvider");
  return owner;
};

/** Guard del panel: sin sesión → /login; sin plan de Catálogos → /login con mensaje. */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) return router.replace("/login");
      try {
        setState({ status: "in", owner: await fetchOwner(user) });
      } catch (err) {
        await signOut(auth);
        router.replace(`/login?error=${encodeURIComponent(authErrorMessage(err))}`);
      }
    });
  }, [router]);

  if (state.status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">Cargando…</div>;
  }
  return <OwnerContext.Provider value={state.owner}>{children}</OwnerContext.Provider>;
}

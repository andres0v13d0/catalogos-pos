import type { User } from "firebase/auth";
import { auth } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface Owner {
  id: string;
  name: string;
  email: string;
  bodegaId: string;
  access: { pos: boolean; catalogs: boolean };
}

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Valida la sesión contra el backend y verifica que el plan incluya Catálogos. */
export async function fetchOwner(user: User): Promise<Owner> {
  const token = await user.getIdToken();
  const res = await fetch(`${API_URL}/users/owners/login?app=catalogs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new AuthError(res.status, msg || "No se pudo iniciar sesión");
  }
  return res.json();
}

/** fetch autenticado para los endpoints del panel. Reintenta una vez con token renovado en 401. */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  if (!user) throw new AuthError(401, "Sesión no iniciada");
  const send = async (force: boolean) => {
    const token = await user.getIdToken(force);
    const isForm = init.body instanceof FormData;
    return fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };
  const res = await send(false);
  return res.status === 401 ? send(true) : res;
}

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Correo o contraseña incorrectos",
  "auth/wrong-password": "Correo o contraseña incorrectos",
  "auth/user-not-found": "Correo o contraseña incorrectos",
  "auth/invalid-email": "El correo no es válido",
  "auth/too-many-requests": "Demasiados intentos. Intenta más tarde",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
  "auth/requires-recent-login": "Vuelve a iniciar sesión para continuar",
  "auth/network-request-failed": "Sin conexión. Revisa tu internet",
};

export function authErrorMessage(err: unknown): string {
  if (err instanceof AuthError) return err.message;
  const code = (err as { code?: string })?.code;
  return (code && FIREBASE_ERRORS[code]) || "Ocurrió un error. Intenta de nuevo";
}

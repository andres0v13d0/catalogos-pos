import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:opacity-60";
export const buttonClass =
  "w-full rounded-lg bg-orange-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="mt-1 mb-6 text-sm text-gray-400">{subtitle}</p>}
        {!subtitle && <div className="mb-6" />}
        {children}
      </div>
    </main>
  );
}

export function FormMessage({ kind, children }: { kind: "error" | "ok"; children: ReactNode }) {
  const color = kind === "error" ? "border-red-200 bg-red-50 text-red-600" : "border-green-200 bg-green-50 text-green-700";
  return <p role={kind === "error" ? "alert" : "status"} className={`rounded-lg border p-3 text-sm ${color}`}>{children}</p>;
}

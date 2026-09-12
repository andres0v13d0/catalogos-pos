"use client";
import { useEffect, useState, useMemo, type CSSProperties, type ReactNode } from "react";
import { buildRootStyle, isValidThemeUpdate, type Theme } from "./themeLogic";

interface ThemeRootProps {
  initialTheme?: Theme | null;
  children: ReactNode;
}

/**
 * Contenedor raíz del catálogo público. Aplica el theme (colores por catálogo) como
 * variables CSS inline sobre el diseño por defecto definido en globals.css.
 *
 * En modo preview (?preview=true) escucha overrides en vivo vía postMessage desde el
 * admin (flystock-frontend). Fuera de preview NO registra ningún listener: producción
 * se comporta exactamente igual que hoy.
 */
export default function ThemeRoot({ initialTheme, children }: ThemeRootProps) {
  const [theme, setTheme] = useState<Theme>(() => initialTheme ?? {});

  // Solo en modo preview: recibir overrides en vivo desde el admin.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isPreview = new URLSearchParams(window.location.search).get("preview") === "true";
    if (!isPreview) return; // Producción: sin listener, comportamiento idéntico a hoy.

    const adminOrigin = process.env.NEXT_PUBLIC_ADMIN_ORIGIN;

    const handleMessage = (event: MessageEvent) => {
      // Validar origen contra la whitelist del admin.
      if (!adminOrigin || event.origin !== adminOrigin) return;

      if (isValidThemeUpdate(event.data, event.origin, adminOrigin)) {
        // Reemplazo completo del theme (el admin manda el objeto entero en cada cambio).
        setTheme((event.data as { theme: Theme }).theme);
      }
    };

    window.addEventListener("message", handleMessage);

    // Handshake: avisar al admin que el preview está listo para recibir themes.
    window.parent?.postMessage({ type: "PREVIEW_READY", source: "catalogos-pos" }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const rootStyle = useMemo<CSSProperties>(
    () => buildRootStyle(theme) as CSSProperties,
    [theme]
  );

  return (
    <div className="min-h-screen" style={rootStyle}>
      {children}
    </div>
  );
}

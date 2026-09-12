# Plan de implementación: personalización de colores por catálogo

Documento de referencia final. Todas las decisiones de diseño y los 4 puntos de confirmación ya están cerrados. No incluye código, solo especificación accionable.

**Principio rector:** `theme = null` ⇒ el catálogo se ve exactamente como hoy. Toda variable CSS nueva tiene como fallback el valor hardcodeado actual.

**Repos:**
- Backend + admin: `flystock` (`flystock-backend`, `flystock-frontend`)
- Catálogo público: `catalogos-pos`

---

## Decisiones cerradas

| Punto | Decisión |
|---|---|
| Botón "Diseño" | Solo visible en `CatalogCard` para catálogos ya existentes (con `shortId`). No se incluye en el wizard de creación. |
| Botones con degradado (WhatsApp/checkout/confirmar) | Al personalizar, se usa **color plano** (se pierde el degradado). Sin personalizar, se mantiene el gradiente original (fallback). |
| Alcance del grupo "texto" | Solo textos de contenido: nombre/descripción de producto, nombres en carrito. No se tocan grises de UI (bordes, placeholders). |
| Precio en el carrito | Usa `priceColor`, igual que en la tarjeta de producto (antes era gris fijo). |
| Fondo general (`pageBg`) | Si está configurado, reemplaza `background.jpg` con color sólido. Si no, se mantiene la imagen actual tal cual. |
| Previsualización | `<iframe>` con el catálogo real en modo preview (`?preview=true`), con overrides en vivo vía `postMessage`. Nada se persiste hasta pulsar "Guardar". Simulación de dispositivo con ancho real + `transform: scale()` (no un contenedor achicado a la fuerza). |

---

## B) Contrato de colores (JSON `theme` ↔ variables CSS)

Convención: clave JSON en camelCase, variable CSS en `--color-<kebab>`. Todas opcionales; si falta una, se usa el fallback.

| Clave JSON | Variable CSS | Fallback | Zona |
|---|---|---|---|
| `pageBg` | `--color-page-bg` | mantiene `background.jpg` (lógica condicional, no fallback de var) | Fondo general |
| `textPrimary` | `--color-text-primary` | `#1f2937` | Texto principal |
| `textSecondary` | `--color-text-secondary` | `#6b7280` | Texto secundario |
| `headerBg` | `--color-header-bg` | `#ffffff` | Header (desktop + sticky) |
| `searchBg` | `--color-search-bg` | `#f3f4f6` | Barra de búsqueda |
| `searchFocus` | `--color-search-focus` | `#fb923c` | Foco del buscador |
| `categoryActiveBg` | `--color-category-active-bg` | `#fb923c` | Categoría activa (fondo) |
| `categoryActiveText` | `--color-category-active-text` | `#ffffff` | Categoría activa (texto) |
| `cardBg` | `--color-card-bg` | `#ffffff` | Tarjeta producto (fondo) |
| `cardSelectRing` | `--color-card-select-ring` | `#fb923c` | Tarjeta (borde selección) |
| `cardCheck` | `--color-card-check` | `#fb923c` | Tarjeta (check) |
| `priceColor` | `--color-price` | `#16a34a` | Precio (tarjeta **y carrito**) |
| `cardDeleteBtn` | `--color-card-delete-btn` | `#ef4444` | Botón eliminar (variantes/cantidad) |
| `cartBg` | `--color-cart-bg` | `#ffffff` | Carrito (fondo drawer) |
| `cartConfirmBtn` | `--color-cart-confirm-btn` | gradiente actual → color plano al personalizar | Carrito (confirmar/checkout) |
| `cartWhatsappBtn` | `--color-cart-whatsapp-btn` | gradiente actual → color plano al personalizar | Botón WhatsApp del carrito |
| `floatingCartBtn` | `--color-floating-cart-btn` | gradiente actual → color plano al personalizar | Botón flotante carrito |
| `checkoutInputFocus` | `--color-checkout-input-focus` | `#fb923c` | Checkout (foco inputs) |
| `checkoutError` | `--color-checkout-error` | `#f87171` / `#ef4444` texto | Checkout (errores) |
| `checkoutSubmitBtn` | `--color-checkout-submit-btn` | gradiente actual → color plano al personalizar | Checkout (botón enviar) |
| `spinnerColor` | `--color-spinner` | `#fb923c` | Spinners de carga |
| `gridCollapseBtn` | `--color-grid-collapse-btn` | `#fa7e17` | Botón colapsar/expandir grid |

**Fuera de alcance (quedan fijos):** logo placeholder sin logo, banner fallback sin banner, overlays del carrito (rgba negro), skeletons grises.

---

## A) Inventario de literales a reemplazar (resumen por archivo)

Rutas relativas a `catalogos-pos/`:

- **`src/app/[shortId]/page.tsx`** — fondo general (`pageBg`), estado "no encontrado".
- **`src/app/globals.css`** — `body { background }`, declarar bloque `:root` con todos los tokens y fallbacks.
- **`CatalogDesktopHeader.tsx`** — `headerBg`, `searchBg`/`searchFocus`, `textPrimary`/`textSecondary`.
- **`CatalogStickyHeader.tsx`** — `headerBg`, `searchBg`, `textPrimary`.
- **`CatalogSearchBar.tsx`** — `searchFocus`.
- **`CategoryNav.tsx`** — `categoryActiveBg`, `categoryActiveText`.
- **`ProductCard.tsx`** — `cardBg`, `cardSelectRing`, `cardCheck`, `priceColor`, `cardDeleteBtn`, `textPrimary`/`textSecondary`.
- **`ProductCardSimple.tsx`** — `cardBg`, `priceColor`.
- **`VariantSelector.tsx`** — `cardSelectRing`, `cardDeleteBtn`.
- **`CartModal.tsx`** — `cartBg`, `cartConfirmBtn`, `priceColor` (ahora también aquí), `cardDeleteBtn` (tono a unificar), `textPrimary`/`textSecondary`.
- **`FloatingCartButton.tsx`** — `floatingCartBtn`, `priceColor`.
- **`CheckoutModal.tsx`** — `checkoutInputFocus`, `checkoutError`, `checkoutSubmitBtn`.
- **`ProductGrid.tsx`** — `spinnerColor`, `gridCollapseBtn` (y el modal "pedido listo" post-compra, revisar si entra).

Técnica de reemplazo: Tailwind v4 resuelve `bg-[var(--color-x)]` porque es una clase estática en el código fuente (no `bg-${dynamic}`, que no funciona con JIT). Para `style={{ background: "..." }}` inline, usar directamente `var(--color-x)`.

---

## C) Cambios backend / tipos

1. **`catalog.entity.ts`** — nueva columna `theme` (`jsonb`, `nullable: true`, `default: null`).
2. **Migración SQL** — `ALTER TABLE "catalogs" ADD COLUMN IF NOT EXISTS "theme" jsonb DEFAULT NULL;`
3. **`create-catalog.dto.ts`** — `theme?: Record<string,string> | null` con `@IsOptional() @IsObject()` (heredado en `UpdateCatalogDto`).
4. **`catalogs.service.ts`** — incluir `theme` en `create()` (`?? null`) y en `update()` (patrón `!== undefined` para permitir set explícito a `null`).
5. **`public-catalog.service.ts`** — agregar `theme: catalog.theme ?? null` en `buildIdsResponse`.
6. **`catalog.ts`** (tipos front público) — agregar `theme?: Record<string,string> | null` a `CatalogData`.
7. **`globals.css`** — declarar `:root` con todos los tokens y sus fallbacks actuales.
8. **Inyección en runtime** — crear `ThemeRoot.tsx` (client component) que envuelve el `<div>` raíz de `page.tsx`, recibe `initialTheme`, mapea a variables CSS inline, calcula `pageBg` con lógica condicional (color vs `background.jpg`), y en modo `?preview=true` escucha `postMessage` para overrides en vivo.

---

## D) Protocolo postMessage (modal ⇄ iframe)

- **Seguridad:** el modal manda con `targetOrigin` explícito (nunca `"*"`); `catalogos-pos` valida `event.origin` contra whitelist del admin, y el listener solo se activa si la URL tiene `?preview=true`.
- **Handshake:** iframe → modal, al montar `ThemeRoot`: `{ type: "PREVIEW_READY", source: "catalogos-pos" }`.
- **Aplicar theme completo:** modal → iframe, en cada cambio: `{ type: "THEME_UPDATE", source: "flystock-admin", theme: {...} }` (se manda el objeto completo cada vez, es barato; no hace falta optimizar con patches parciales).
- **Flujo:** modal monta iframe con `src={PUBLIC_BASE}/{shortId}?preview=true` → espera `PREVIEW_READY` → manda `THEME_UPDATE` inicial (desde `catalog.theme` existente) → cada cambio de picker reenvía `THEME_UPDATE` → nada se persiste hasta "Guardar" (`PUT /catalogs/:id`).

---

## Modal de diseño (flystock-frontend)

- **Entrada:** botón "Diseño" + badge verde "Nuevo" en `CatalogCard` (dentro de `CatalogsManagementPage.jsx`), junto a los botones existentes.
- **Componente nuevo:** `CatalogDesignModal.jsx`, mismo patrón visual que `EditCatalogModal.jsx` pero más ancho (`max-w-6xl`) para dos columnas.
- **Panel izquierdo (scroll):** acordeones por zona (Fondo/Texto, Header/Búsqueda, Navegación, Tarjetas, Carrito, Checkout, Otros), cada campo con su `ColorField` propio + opción de "restablecer" (vuelve al fallback quitando la clave del objeto `theme`).
- **`ColorField` (nuevo, no existe en el proyecto):** `<input type="color">` nativo + input de texto hex, estilizado con el patrón Tailwind del repo. Sin dependencias externas.
- **Panel derecho:** toggle Móvil/Escritorio + `<iframe>` con ancho real del dispositivo (390px / 1280px) escalado visualmente con `transform: scale()` y `transform-origin: top left` dentro de un contenedor con `overflow: hidden`. El toggle cambia ancho/alto/escala sin recargar el iframe.
- **Guardar:** `catalogsService.update(catalog.id, { theme })` → `PUT /catalogs/:id`.
- **Precarga:** `theme` inicial = `catalog.theme || {}`.

---

## F) Estimación de esfuerzo

| Fase | Esfuerzo | Riesgo principal |
|---|---|---|
| 1. Backend | ~0.5 día | Bajo — patrón mecánico ya existente |
| 2. Migración de colores hardcodeados a CSS vars | ~2–3 días | Medio-alto — paridad visual exacta en ~12 archivos, revisar en mobile/desktop y los 3 layouts |
| 3. Modo preview en `catalogos-pos` | ~1.5–2 días | Medio — no afectar producción sin `?preview=true`, timing del handshake |
| 4. Modal + color pickers + iframe escalado | ~2–3 días | Medio — `ColorField` y scaling desde cero, prueba/error en el timing de postMessage |

**Total aproximado: 6–9 días.**

**Orden recomendado:** 1 → 2 → 3 → 4 (backend → paridad visual con vars → preview en vivo → modal). Cada capa se valida antes de construir la siguiente.

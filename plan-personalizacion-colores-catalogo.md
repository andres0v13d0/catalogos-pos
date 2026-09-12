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
| `searchBg` | `--color-search-bg` | `#f3f4f6` (unificado — antes mobile usaba `#f9fafb`, diferencia imperceptible, ahora un solo tono en desktop y mobile) | Barra de búsqueda |
| `searchFocus` | `--color-search-focus` | `#fb923c` | Foco del buscador |
| `categoryActiveBg` | `--color-category-active-bg` | `#fb923c` | Categoría activa (fondo) |
| `categoryActiveText` | `--color-category-active-text` | `#ffffff` | Categoría activa (texto) |
| `cardBg` | `--color-card-bg` | `#ffffff` | Tarjeta producto (fondo) |
| `cardSelectRing` | `--color-card-select-ring` | `#fb923c` | Tarjeta (borde selección) |
| `cardCheck` | `--color-card-check` | `#fb923c` | Tarjeta (check) |
| `priceColor` | `--color-price` | `#16a34a` | Precio (tarjeta, precio por ítem del carrito **y "Total estimado"**) |
| `cardDeleteBtn` | `--color-card-delete-btn` | `#ef4444` | Botón eliminar (variantes/cantidad) |
| `cartBg` | `--color-cart-bg` | `#ffffff` | Carrito (fondo drawer) |
| `cartConfirmBtn` | `--color-cart-confirm-btn` | gradiente actual → color plano al personalizar | Carrito (confirmar/checkout, único elemento — cubre también el rol "WhatsApp") |
| `floatingCartBtn` | `--color-floating-cart-btn` | gradiente actual → color plano al personalizar | Botón flotante carrito (también reutilizado en el modal "pedido listo") |
| `cardInputFocus` | `--color-card-input-focus` | `#fb923c` | Tarjetas (foco de selects de variante/cantidad) |
| `headerWhatsappBtn` | `--color-header-whatsapp-btn` | gradiente actual (`#25D366`→`#128C7E`) | Botón WhatsApp del header (distinto del carrito) |
| `cartRemoveItemBtn` (bg) | `--color-cart-remove-item-btn-bg` | `#fef2f2` | Carrito (botón eliminar ítem, fondo — **único campo expuesto en el modal**) |
| _(interno, sin campo en modal)_ | `--color-cart-remove-item-btn-text` | `#f87171` | Carrito (texto del botón eliminar ítem — fijo, no editable en Fase 4 por ahora) |
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

---

## Ampliación de tokens (post-auditoría exhaustiva)

Esta sección **supersede** a la tabla original de la sección B allí donde haya conflicto. Nace de un inventario exhaustivo de `catalogos-pos` que reveló que muchos textos, fondos de sub-zonas y estados de selección no tenían token (sub-zona del selector de cantidad, sub-zona de variantes, estados verde/rojo hardcodeados, textos de UI sin tokenizar, texto sobre botones de color sin token propio).

**Decisiones de alcance confirmadas:**
- Nombre de la tienda: un solo color para desktop y mobile (unificado, pequeño cambio visual — antes gris-900/gris-800 desincronizados).
- Placeholder: campo independiente **por tipo de input** (uno para las 3 barras de búsqueda ya unificadas, otro para los inputs de checkout) — no global, no repetido por cada una de las 3 barras individualmente.
- Elementos puramente decorativos menores (botón "x" de limpiar búsqueda, fondo del hover-preview del carrito, botón cerrar de modales) quedan **fijos, sin campo propio** — mismo criterio ya usado con el span del botón colapsar.
- Estados de selección "completo/seleccionado" (verde) y "no disponible/error" (rojo) se **comparten** entre el selector de cantidad y el selector de variantes (son semánticamente el mismo estado en dos lugares), en vez de duplicar tokens.
- Textos de contenido dentro del hover-preview del carrito y de los ítems del drawer **reutilizan** `textPrimary`/`textSecondary`/`priceColor` en vez de tokens nuevos.

### Tokens nuevos por sección

**2. Header**
| Clave | Variable CSS | Fallback | Nota |
|---|---|---|---|
| `storeNameColor` | `--color-store-name` | `#111827` | Unificado desktop+mobile (antes desincronizado) |
| `storeDescColor` | `--color-store-desc` | `#6b7280` | Solo aparece en header desktop |
| `searchText` | `--color-search-text` | `#111827` | Unificado entre las 3 barras |
| `searchPlaceholder` | `--color-search-placeholder` | `#9ca3af` | Unificado entre las 3 barras |
| `headerWhatsappBtnText` | `--color-header-whatsapp-btn-text` | `#ffffff` | Ícono/texto, separado del fondo |

**3. Navbar**
| Clave | Variable CSS | Fallback | Nota |
|---|---|---|---|
| `navbarBg` | `--color-navbar-bg` | `transparent` | Si no se define, hereda el fondo del header (comportamiento actual) |
| `categoryInactiveBg` | `--color-category-inactive-bg` | `#ffffff` | |
| `categoryInactiveText` | `--color-category-inactive-text` | `#4b5563` | |
| `categoryInactiveBorder` | `--color-category-inactive-border` | `#e5e7eb` | Hover del borde queda fijo (decorativo) |

**4. Tarjeta**
| Clave | Variable CSS | Fallback | Nota |
|---|---|---|---|
| `cardImageBg` | `--color-card-image-bg` | `#f3f4f6` | Zona de imagen (fallback sin foto) |
| `cardCheckIcon` | `--color-card-check-icon` | `#ffffff` | Ícono del check, separado del fondo |
| `cardSubzoneBg` | `--color-card-subzone-bg` | `#f9fafb` | Compartido: zona de cantidad Y zona de variantes |
| `cardSubzoneLabel` | `--color-card-subzone-label` | `#4b5563` | Labels "Cantidad:", "Talla:", "Cant:" |
| `cardInputBg` | `--color-card-input-bg` | `#ffffff` | Fondo de selects dentro de la tarjeta |
| `cardSuccessBg` | `--color-card-success-bg` | `#f0fdf4` | Estado seleccionado/completo (compartido cantidad+variantes) |
| `cardSuccessBorder` | `--color-card-success-border` | `#4ade80` | " |
| `cardErrorBg` | `--color-card-error-bg` | `#fef2f2` | Estado no disponible/incompleto (compartido) |
| `cardErrorBorder` | `--color-card-error-border` | `#fca5a5` | " |
| `cardDeleteBtnIcon` | `--color-card-delete-btn-icon` | `#ffffff` | Separado del fondo |

**5. Carrito**
| Clave | Variable CSS | Fallback | Nota |
|---|---|---|---|
| `floatingCartBtnText` | `--color-floating-cart-btn-text` | `#ffffff` | Separado del fondo |
| `cartPreviewBg` | `--color-cart-preview-bg` | `#ffffff` | Panel hover-preview (solo desktop) |
| `cartItemBg` | `--color-cart-item-bg` | `#ffffff` | Fondo de cada ítem en el drawer |
| `cartConfirmBtnText` | `--color-cart-confirm-btn-text` | `#ffffff` | Separado del fondo |

**6. Checkout**
| Clave | Variable CSS | Fallback | Nota |
|---|---|---|---|
| `checkoutBg` | `--color-checkout-bg` | `#ffffff` | Fondo del modal |
| `checkoutInputBg` | `--color-checkout-input-bg` | `#ffffff` | |
| `checkoutInputBorder` | `--color-checkout-input-border` | `#e5e7eb` | Borde normal (no foco) |
| `checkoutInputText` | `--color-checkout-input-text` | `#111827` | Texto escrito |
| `checkoutInputPlaceholder` | `--color-checkout-input-placeholder` | `#9ca3af` | Independiente del de búsqueda |
| `checkoutErrorBorder` | `--color-checkout-error-border` | `#f87171` | Renombrado de `checkoutError` para claridad |
| `checkoutErrorBg` | `--color-checkout-error-bg` | `#fef2f2` | Antes sin token |
| `checkoutErrorText` | `--color-checkout-error-text` | `#ef4444` | Antes sin token |
| `checkoutSubmitBtnText` | `--color-checkout-submit-btn-text` | `#ffffff` | Separado del fondo |

### Elementos que quedan fijos (sin token, decorativos)
Banner/logo fallback de marca, botón "x" de limpiar búsqueda (las 3 variantes), botón cerrar de modales (drawer/checkout), overlays oscuros de fondo, ícono de lupa, stepper de cantidad (±) en el carrito, miniatura de imagen en ítem del carrito, span oscuro del botón colapsar grid, botón descargar imagen de la tarjeta.

### Siguiente paso
1. **Fase 5** — implementar estos tokens nuevos en `catalogos-pos` (declarar en `:root`, reemplazar literales del inventario exhaustivo).
2. **Fase 6** — ampliar `CatalogDesignModal.jsx` con las nuevas secciones/sub-bloques que exponen estos campos.
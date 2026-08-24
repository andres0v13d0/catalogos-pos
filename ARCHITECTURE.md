# ARCHITECTURE.md — Catálogo Público Flystock (proyecto independiente)

## Propósito del proyecto

Este proyecto (`catalogos-pos`) es la extracción del **catálogo público** de Flystock a un repositorio independiente. Su única responsabilidad es:

1. Mostrar el catálogo público de una bodega (`/cat/:shortId`)
2. Permitir agregar productos al carrito y hacer un pedido
3. Mostrar la confirmación/detalle de la orden ya creada (`/orden-catalogo/:orderId`)

**No incluye** ninguna funcionalidad del POS interno: sin autenticación, sin facturación, sin gestión de inventario, sin dashboard admin. Es un consumidor de solo lectura (más creación de órdenes) de endpoints públicos ya existentes del backend de Flystock.

---

## ⚠️ REGLA NO NEGOCIABLE: Paridad visual exacta con el diseño original

El diseño visual del catálogo público **ya está validado con clientes reales** que lo conocen y se sienten cómodos con él. Este proyecto **NO es un rediseño** — es una migración de infraestructura. El resultado debe verse **idéntico** al catálogo actual:

- Mismos colores, tipografía, espaciados, tamaños.
- Misma disposición de elementos: encabezados, grid de productos, tarjetas, botones, modal de carrito, checkout.
- Mismo comportamiento responsive: cómo se ve en PC y cómo se ve en móvil debe ser igual al original en ambos breakpoints.
- Mismas micro-interacciones (hover, transiciones, estados de carga) donde ya existían.

**Lo único que puede mejorar/agregarse:** skeleton loaders donde no existían, y cualquier optimización de rendimiento que no cambie lo que el usuario ve (lazy loading, code-splitting, etc.).

**Lo que SÍ puede/debe cambiar es la estructura interna del código** — no hay que replicar archivos gigantes monolíticos. Se debe descomponer en componentes pequeños, hooks reutilizables y bien nombrados, siguiendo buenas prácticas de Next.js/React. La paridad es visual, no de organización de archivos.

### Proceso obligatorio antes de construir cada pantalla

Antes de escribir cualquier componente nuevo, Kiro debe:

1. **Leer completo** el componente original correspondiente en `flystock-frontend` (rutas abajo).
2. Extraer: clases de Tailwind/CSS usadas, estructura de layout (flex/grid), breakpoints responsive, colores exactos (hex o variables), espaciados (padding/margin), tipografía (tamaños, pesos).
3. Recién ahí, reimplementar el equivalente en `catalogos-pos`, con la misma apariencia pero dividido en componentes/hooks más pequeños y mantenibles.
4. Si tiene dudas sobre un detalle visual (ej. un color específico, un breakpoint), debe preguntar antes de asumir, no improvisar un valor "parecido".

### Componentes originales a leer (ruta base: `/mnt/ssd_secundario/Repositorios/flystock/flystock-frontend/src/`)

| Componente original | Pantalla/función | Ruta |
|---|---|---|
| `PublicCatalogPage.jsx` | Página principal del catálogo | `pages/catalog/PublicCatalogPage.jsx` |
| `MasonryGrid2Col.jsx` | Grid de productos (2 columnas, masonry) | `components/PublicCatalog/MasonryGrid2Col.jsx` |
| `PublicProductCard.jsx` | Tarjeta de producto individual | `components/PublicCatalog/PublicProductCard.jsx` |
| `PublicProductCardSimple.jsx` | Variante simple de tarjeta (2col/shopify) | `components/PublicCatalog/PublicProductCardSimple.jsx` |
| `QuantitySelector.jsx` | Selector de cantidad en tarjeta/carrito | `components/PublicCatalog/QuantitySelector.jsx` |
| `VariantRowsSelector.jsx` | Selector de variantes de producto | `components/PublicCatalog/VariantRowsSelector.jsx` |
| `CatalogFloatingCart.jsx` | Botón flotante de carrito | `components/PublicCatalog/CatalogFloatingCart.jsx` |
| `PublicCartModal.jsx` | Modal de revisión del carrito | `components/PublicCatalog/PublicCartModal.jsx` |
| `CheckoutModal.jsx` | Modal de datos de entrega | `components/PublicCatalog/CheckoutModal.jsx` |
| `ProductLandingPage.jsx` | Landing de producto individual | `pages/catalog/ProductLandingPage.jsx` |
| `CatalogOrderPage.jsx` | Vista pública de orden creada | `pages/catalog/CatalogOrderPage.jsx` |
| `CatalogDesktopHeader.jsx` | Header desktop con banner, logo, búsqueda | `components/PublicCatalog/CatalogDesktopHeader.jsx` |
| `CatalogStickyHeader.jsx` | Header sticky en scroll (mobile) | `components/PublicCatalog/CatalogStickyHeader.jsx` |
| `CatalogSearchBar.jsx` | Barra de búsqueda mobile + categorías | `components/PublicCatalog/CatalogSearchBar.jsx` |
| `CategoryNav.jsx` | Navegación por categorías | `components/PublicCatalog/CategoryNav.jsx` |

Kiro debe confirmar la ruta exacta de cada uno al momento de leer el árbol real del proyecto, ya que algunas ubicaciones listadas arriba son aproximadas.

> ✅ **Rutas confirmadas** el 2025-06-XX al inspeccionar el árbol real del proyecto. También se encontró `usePublicCatalogCart.js` en `hooks/usePublicCatalogCart.js` (hook del carrito) y `publicApi.js` en `services/publicApi.js` (cliente axios sin auth).

---

## Stack técnico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS (mismo enfoque que el proyecto original, para facilitar portar clases directamente)
- **Estado del carrito**: Custom hook + `localStorage` (mismo patrón que el original: `usePublicCatalogCart`, key `flystock_cart_${shortId}` o equivalente — mantener incluso el naming si es razonable, para no romper carritos ya guardados en navegadores de clientes si aplica)
- **Imágenes**: `next/image`, apuntando directo al bucket S3 existente (`flystock-product-images.s3.us-east-2.amazonaws.com`) vía `remotePatterns` en `next.config.js`
- **Data fetching**: Server Components + `fetch` con `revalidate` (ISR) para el catálogo; Client Components solo donde hay interactividad (carrito, checkout, selección de variantes)
- **Despliegue**: Vercel (plan Pro, ya disponible)

## Endpoints consumidos (backend Flystock existente, sin modificar)

| # | Método | Endpoint | Uso |
|---|--------|----------|-----|
| 1 | GET | `/public/catalog/c/:shortId/product-ids` | IDs de productos + metadata del catálogo |
| 2 | POST | `/public/catalog/products/previews` | Detalle de productos (batch) |
| 3 | POST | `/public/catalog-orders` | Crear orden |
| 4 | POST | `/share/order/:orderId` | Generar link compartible para WhatsApp |

No se requiere autenticación en ninguno. No se comparte sesión ni token con el POS.

## Estructura de carpetas propuesta

```
src/
  app/
    [shortId]/
      page.tsx                    → Página principal del catálogo (Server Component)
      p/[productId]/page.tsx      → Landing de producto individual
  components/
    catalog/
      ProductGrid.tsx             → Equivalente a MasonryGrid2Col
      ProductCard.tsx
      QuantitySelector.tsx
      VariantSelector.tsx
      FloatingCartButton.tsx
      CartModal.tsx
      CheckoutModal.tsx
    order/
      OrderSummary.tsx
    ui/
      Skeleton.tsx                → Nuevo: loaders donde no existían
  hooks/
    useCatalogCart.ts              → Estado del carrito + localStorage
    useCatalog.ts                  → Fetch de productos del catálogo
  lib/
    api.ts                         → Cliente fetch para los 5 endpoints (sin auth)
    whatsapp.ts                    → Construcción de mensaje/URL de WhatsApp
  types/
    catalog.ts                     → Tipos de producto, variante, orden
```

## Rutas de la aplicación

| Ruta | Función |
|---|---|
| `/[shortId]` | Catálogo público de una bodega |
| `/[shortId]/p/[productId]` | Landing de producto individual |

## Rendering strategy

- `/[shortId]`: ISR con revalidación (ej. cada 60s) — carga inicial instantánea, contenido pre-renderizado en servidor.
- `/[shortId]/p/[productId]`: mismo enfoque, ISR.
- Carrito y checkout: Client Components, ya que dependen de interacción y `localStorage`.

## Variables de entorno

```
NEXT_PUBLIC_API_URL=https://api.flystock.com.co/api
NEXT_PUBLIC_POS_URL=https://pos.flystock.com.co
```

> **Nota:** El backend NestJS tiene `app.setGlobalPrefix('api')`, por lo que **todas las rutas requieren el prefijo `/api`**. La URL base correcta es `https://api.flystock.com.co/api` (no `https://api.flystock.com.co` sin sufijo). Confirmado con curl: sin `/api` se obtiene "Cannot GET ..." (ruta inexistente); con `/api` se accede correctamente al controlador.
> 
> `NEXT_PUBLIC_POS_URL` se usa para construir los links de share de órdenes (la vista de orden vive en el POS, no en este proyecto).

## Fuera de alcance (explícitamente)

- Autenticación / login
- Cualquier pantalla del POS (facturación, inventario, pedidos internos, dashboard)
- Modificaciones al backend — este proyecto es 100% consumidor
- **Ver/trackear pedidos después de creados** — la vista `/orden-catalogo/:orderId` es responsabilidad del POS (pos.flystock.com.co), no de este proyecto. catalogos-pos solo crea la orden y genera el link de share; la visualización posterior del pedido la maneja el POS.
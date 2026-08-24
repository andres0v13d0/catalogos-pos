# CLAUDE.md — Contexto del proyecto para agentes de IA

## Qué es este proyecto?

`catalogos-pos` es el catálogo público de Flystock extraído a un repositorio independiente, para que cargue rápido incluso en conexiones lentas. Consume únicamente endpoints públicos ya existentes del backend de Flystock. No tiene backend propio, no tiene autenticación, no tiene ninguna funcionalidad del sistema POS interno.

Ver `ARCHITECTURE.md` en la raíz para el detalle completo de stack, endpoints, estructura de carpetas y rutas. Léelo antes de empezar a trabajar si no lo has hecho.

## Regla más importante del proyecto: paridad visual exacta

El diseño de este catálogo **ya está validado con clientes reales**. Este proyecto es una migración de infraestructura, **no un rediseño**. Todo lo que construyas debe verse **idéntico** al catálogo original ubicado en:

```
/mnt/ssd_secundario/Repositorios/flystock/flystock-frontend/
```

Antes de crear cualquier componente visual nuevo:

1. Busca y lee completo el componente equivalente en `flystock-frontend` (ver tabla de referencia en `ARCHITECTURE.md`).
2. Extrae del código original: clases de Tailwind, colores exactos, espaciados, breakpoints responsive, estructura de layout.
3. Replica esa apariencia exacta aquí, tanto en desktop como en móvil.
4. Puedes (y debes) reorganizar el código en componentes/hooks más pequeños y limpios — la paridad es visual, no de estructura de archivos.
5. Si no encuentras un valor específico (un color, un breakpoint) o hay ambigüedad, pregunta antes de inventar un valor "parecido". Nunca asumas.

Lo único permitido como adición visual nueva: skeleton loaders en estados de carga donde el original no los tenía.

**No hagas esto**: no "mejores" el diseño por iniciativa propia, no cambies proporciones, colores, ni disposición de elementos aunque creas que se vería mejor. Cualquier cambio visual respecto al original debe ser propuesto y aprobado antes de implementarse, no decidido unilateralmente.

## Stack

- Next.js 15, App Router, TypeScript
- Tailwind CSS
- Sin backend propio — consume 5 endpoints públicos del backend de Flystock (ver `ARCHITECTURE.md`)
- Despliegue en Vercel

## Reglas generales de código

- Componentes pequeños y enfocados en una sola responsabilidad. Nada de archivos de cientos de líneas mezclando UI, lógica de fetch y estado.
- Lógica de datos (fetch, transformación) va en `hooks/` o `lib/`, no dentro de los componentes de UI.
- Tipar todo con TypeScript — especialmente las respuestas de los endpoints (`types/catalog.ts`).
- Usar `next/image` para toda imagen de producto, apuntando al bucket S3 existente vía `remotePatterns`.
- Server Components por defecto; usar `"use client"` solo donde hay interactividad real (carrito, checkout, selección de variantes).

## Lo que este proyecto NO debe hacer

- No implementar autenticación ni manejo de sesión.
- No incluir ninguna pantalla o lógica del POS interno (facturación, inventario, gestión de pedidos, dashboard admin).
- No modificar el backend de Flystock — este proyecto es estrictamente un consumidor de los endpoints ya existentes.
- No introducir dependencias de pago (sin CDN de imágenes de pago, sin servicios de transformación de imágenes de terceros) salvo que se apruebe explícitamente.
- **No implementar vista de orden/pedido** — ver/trackear un pedido después de creado es responsabilidad del POS (pos.flystock.com.co). Este proyecto solo crea la orden y genera el share link; la visualización posterior no vive aquí.

## Endpoints disponibles

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/public/catalog/c/:shortId/product-ids` | IDs de productos + metadata del catálogo |
| POST | `/public/catalog/products/previews` | Detalle de productos (batch) |
| POST | `/public/catalog-orders` | Crear orden |
| POST | `/share/order/:orderId` | Generar link compartible de WhatsApp |

Ninguno requiere autenticación.

## Comandos

```bash
npm run dev       # desarrollo local
npm run build     # build de producción
npm run lint      # lint
```
/**
 * Lógica pura del theming del catálogo (sin React), reutilizada por ThemeRoot.
 * Separada para poder testearla de forma aislada y determinística.
 *
 * Mapeo 1:1 entre las claves del objeto `theme` (catalog.theme, camelCase) y las
 * variables CSS declaradas en globals.css (:root). Ver tabla B del plan.
 * `pageBg` NO está aquí: tiene lógica condicional propia (reemplaza background.jpg).
 */
export const THEME_KEY_TO_CSS_VAR: Record<string, string> = {
  textPrimary: "--color-text-primary",
  textSecondary: "--color-text-secondary",
  headerBg: "--color-header-bg",
  searchBg: "--color-search-bg",
  searchFocus: "--color-search-focus",
  categoryActiveBg: "--color-category-active-bg",
  categoryActiveText: "--color-category-active-text",
  cardBg: "--color-card-bg",
  cardSelectRing: "--color-card-select-ring",
  cardCheck: "--color-card-check",
  cardInputFocus: "--color-card-input-focus",
  priceColor: "--color-price",
  cardDeleteBtn: "--color-card-delete-btn",
  cartBg: "--color-cart-bg",
  cartConfirmBtn: "--color-cart-confirm-btn",
  cartRemoveItemBtnBg: "--color-cart-remove-item-btn-bg",
  cartRemoveItemBtnText: "--color-cart-remove-item-btn-text",
  floatingCartBtn: "--color-floating-cart-btn",
  headerWhatsappBtn: "--color-header-whatsapp-btn",
  checkoutInputFocus: "--color-checkout-input-focus",
  checkoutError: "--color-checkout-error",
  checkoutSubmitBtn: "--color-checkout-submit-btn",
  spinnerColor: "--color-spinner",
  gridCollapseBtn: "--color-grid-collapse-btn",
};

export const DEFAULT_BACKGROUND = "#f0f2f5 url(/background.jpg) center/cover fixed";

export type Theme = Record<string, string>;

/** Construye el objeto de estilos inline (CSS vars + background) para un theme dado. */
export function buildRootStyle(theme: Theme): Record<string, string> {
  const style: Record<string, string> = { fontFamily: "Ubuntu, sans-serif" };
  for (const [themeKey, cssVar] of Object.entries(THEME_KEY_TO_CSS_VAR)) {
    const value = theme[themeKey];
    if (value) style[cssVar] = value;
  }
  // Fondo general: color sólido si pageBg está configurado; si no, la imagen de siempre.
  style.background = theme.pageBg ? theme.pageBg : DEFAULT_BACKGROUND;
  return style;
}

/** Predicado de aceptación de un mensaje THEME_UPDATE válido del admin. */
export function isValidThemeUpdate(
  data: unknown,
  eventOrigin: string,
  adminOrigin: string | undefined
): boolean {
  if (!adminOrigin || eventOrigin !== adminOrigin) return false;
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    d.type === "THEME_UPDATE" &&
    d.source === "flystock-admin" &&
    !!d.theme &&
    typeof d.theme === "object"
  );
}

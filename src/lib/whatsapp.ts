import { CartItem } from "@/types/catalog";

export interface CustomerData {
  name: string;
  phone: string;
  address?: string;
  neighborhood?: string;
  department?: string;
  city?: string;
  notes?: string;
}

export function buildWhatsAppMessage(
  cart: CartItem[],
  customerData: CustomerData | null,
  orderNumber: string,
  shareUrl: string | null,
  getCartTotal: () => number
): string {
  const lines = cart.map((item) => {
    let line = item.productName;
    if (item.variantOptions?.length)
      line += "\n  " + item.variantOptions.map((v) => `${v.variantName}: ${v.optionValue}`).join(", ");
    line += `\n  Cantidad: ${item.quantity}`;
    if (item.unitPrice > 0) line += `\n  ${Math.round(item.unitPrice).toLocaleString("es-CO")} c/u`;
    return line;
  });
  const total = getCartTotal();
  let msg = `🛍️ Pedido #${orderNumber} — ${cart.length} producto${cart.length !== 1 ? "s" : ""}:\n\n${lines.join("\n\n")}`;
  if (total > 0) msg += `\n\nTotal estimado: ${Math.round(total).toLocaleString("es-CO")}`;
  if (customerData) {
    msg += `\n\n--- Datos de entrega ---`;
    msg += `\nNombre: ${customerData.name}`;
    msg += `\nTeléfono: ${customerData.phone}`;
    if (customerData.address) msg += `\nDirección: ${customerData.address}`;
    if (customerData.neighborhood) msg += `\nBarrio/Apto: ${customerData.neighborhood}`;
    if (customerData.city && customerData.department) msg += `\nUbicación: ${customerData.city}, ${customerData.department}`;
    if (customerData.notes) msg += `\nNotas: ${customerData.notes}`;
  }
  if (shareUrl) msg += `\n\n📋 Ver pedido: ${shareUrl}`;
  msg += `\n\n¡Gracias!`;
  return msg;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/[^\d+]/g, "");
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isIOS
    ? `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
}

"use client";
import { useState, useEffect } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import { MdImage } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { CartItem } from "@/types/catalog";

interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
  onConfirm: () => void;
  onUpdateCart: (cart: CartItem[]) => void;
  requiresCheckout?: boolean;
  creatingOrder?: boolean;
}

export default function CartModal({ cart, onClose, onConfirm, onUpdateCart, requiresCheckout, creatingOrder }: CartModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const removeItem = (idx: number) => {
    const updated = cart.filter((_, i) => i !== idx);
    onUpdateCart(updated);
    if (!updated.length) handleClose();
  };

  const updateQty = (idx: number, qty: number) => {
    if (qty < 1) { removeItem(idx); return; }
    const updated = cart.map((item, i) =>
      i === idx
        ? { ...item, quantity: qty, totalPrice: (parseFloat(String(item.unitPrice)) || 0) * qty }
        : item
    );
    onUpdateCart(updated);
  };

  const total = cart.reduce((s, i) => s + (parseFloat(String(i.totalPrice)) || 0), 0);

  // ─── Shared item renderer ─────────────────────────────────────────────────
  const renderItems = () => (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {cart.map((item, idx) => (
        <div key={item.cartItemId || `${item.productId}-${idx}`} className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-white">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
            {item.productImageUrl
              ? <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
              : <MdImage className="w-6 h-6 text-gray-300" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{item.productName}</p>
            {item.variantOptions?.length > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {item.variantOptions.map((v) => `${v.variantName}: ${v.optionValue}`).join(", ")}
              </p>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => updateQty(idx, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-lg cursor-pointer">−</button>
                <span className="w-8 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
                <button onClick={() => updateQty(idx, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-lg cursor-pointer">+</button>
              </div>
              {item.unitPrice > 0 && (
                <span className="font-bold text-gray-800 text-sm">
                  ${Math.round((parseFloat(String(item.unitPrice)) || 0) * item.quantity).toLocaleString("es-CO")}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => removeItem(idx)} className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 flex-shrink-0 self-start cursor-pointer">
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );

  const renderFooter = (fullWidth: boolean) => (
    <div className="px-5 py-4 border-t border-gray-100">
      {total > 0 && (
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600 font-medium">Total estimado:</span>
          <span className="text-xl font-bold text-gray-900">${total.toLocaleString("es-CO")}</span>
        </div>
      )}
      <button
        onClick={onConfirm}
        disabled={creatingOrder}
        className={`${fullWidth ? "w-full" : "w-full"} text-white py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-70 cursor-pointer`}
        style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}
      >
        <FaWhatsapp className="w-5 h-5" />
        {creatingOrder ? "Procesando..." : requiresCheckout ? "Continuar con mis datos" : "Enviar pedido por WhatsApp"}
      </button>
    </div>
  );

  return (
    <>
      {/* ═══ MOBILE: bottom sheet modal (unchanged behavior) ═══ */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={handleClose}
        >
          <div
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl flex flex-col transition-all duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Resumen del pedido</h2>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
                <FiX className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {renderItems()}
            {renderFooter(true)}
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP: right sidebar drawer ═══ */}
      <div className="hidden md:block">
        {/* Overlay */}
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={handleClose}
        />
        {/* Panel */}
        <div
          className={`fixed top-0 right-0 bottom-0 z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
          style={{ width: "420px", maxWidth: "100vw" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Resumen del pedido</h2>
              <p className="text-xs text-gray-400 mt-0.5">{cart.length} producto{cart.length !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={handleClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
              <FiX className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          {renderItems()}
          {renderFooter(true)}
        </div>
      </div>
    </>
  );
}

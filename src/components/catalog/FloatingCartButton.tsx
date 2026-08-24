"use client";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { CartItem } from "@/types/catalog";

interface FloatingCartButtonProps {
  cart: CartItem[];
  cartTotal: number;
  onOpenCart: () => void;
}

export default function FloatingCartButton({ cart, cartTotal, onOpenCart }: FloatingCartButtonProps) {
  const [showCartHover, setShowCartHover] = useState(false);

  if (!cart.length) return null;

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden fixed bottom-5 left-4 right-4 z-[100]">
        <button
          onClick={onOpenCart}
          className="wa-pulse w-full text-white border-none rounded-2xl flex items-center gap-3 px-4 py-3 cursor-pointer"
          style={{ background: "linear-gradient(135deg,#25d366,#1ea952)", boxShadow: "0 6px 24px rgba(37,211,102,0.4)" }}
        >
          <div className="bg-white/20 rounded-xl p-2 flex items-center justify-center flex-shrink-0">
            <FaWhatsapp size={20} />
          </div>
          <div className="flex flex-col text-left flex-1 min-w-0">
            <span className="text-xs font-medium text-white/90">{cart.length} productos · ${cartTotal.toLocaleString("es-CO")}</span>
            <span className="text-base font-bold">Ver resumen del pedido</span>
          </div>
          <FiChevronRight size={16} />
        </button>
      </div>

      {/* Desktop */}
      <div
        className="hidden md:flex fixed right-6 bottom-10 z-[100] flex-col items-end gap-2"
        onMouseEnter={() => setShowCartHover(true)}
        onMouseLeave={() => setShowCartHover(false)}
      >
        {showCartHover && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-72 mb-2">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
              <span className="font-bold text-gray-800">Tu pedido</span>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{cart.length} productos</span>
            </div>
            <div className="flex flex-col gap-2 mb-3">
              {cart.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  {item.productImageUrl
                    ? <img src={item.productImageUrl} alt={item.productName} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                    : <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  {item.totalPrice > 0 && <span className="text-sm font-bold text-green-600">${item.totalPrice.toLocaleString("es-CO")}</span>}
                </div>
              ))}
              {cart.length > 4 && <p className="text-center text-xs text-gray-400 italic">+{cart.length - 4} más</p>}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 font-bold text-gray-800">
              <span>Total:</span>
              <span className="text-lg text-green-600">${cartTotal.toLocaleString("es-CO")}</span>
            </div>
          </div>
        )}
        <button
          onClick={onOpenCart}
          className="wa-pulse flex items-center gap-3 px-5 py-3.5 rounded-full text-white font-bold text-sm border-none cursor-pointer whitespace-nowrap"
          style={{ background: "linear-gradient(135deg,#25d366,#1ea952)", boxShadow: "0 6px 24px rgba(37,211,102,0.45)" }}
        >
          <FaWhatsapp size={20} />
          <span>{cart.length} productos · ${cartTotal.toLocaleString("es-CO")}</span>
          <FiChevronRight size={16} />
        </button>
      </div>
    </>
  );
}

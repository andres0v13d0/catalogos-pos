"use client";
import { useEffect, useState } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";

interface ErrorToastProps {
  message: string | null;
  onDismiss: () => void;
  duration?: number; // ms, 0 = no auto-dismiss
}

export default function ErrorToast({ message, onDismiss, duration = 6000 }: ErrorToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) { setVisible(false); return; }
    // pequeño delay para animar entrada
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (!message || !duration) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed inset-x-0 top-5 z-[2000] flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto flex items-start gap-3 bg-white border border-red-200 shadow-2xl rounded-2xl px-5 py-4 max-w-sm w-full transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
        }`}
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
          <FiAlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-gray-800">Error al crear el pedido</p>
          <p className="text-sm text-gray-500 mt-0.5">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

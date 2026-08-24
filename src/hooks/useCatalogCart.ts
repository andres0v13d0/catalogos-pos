"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { CartItem } from "@/types/catalog";

export interface SavedConfig {
  [productId: string]: CartItem;
}

export function useCatalogCart(shortId: string) {
  const cartKey = `flystock_cart_${shortId}`;
  const configKey = `flystock_config_${shortId}`;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedConfigs, setSavedConfigs] = useState<Map<string, CartItem>>(new Map());
  const [hydrated, setHydrated] = useState(false);

  const selectedIds = useMemo(() => new Set(cart.map((i) => i.productId)), [cart]);

  // Restore cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) setCart(JSON.parse(saved));
    } catch { /* ignore */ }
    try {
      const saved = localStorage.getItem(configKey);
      if (saved) setSavedConfigs(new Map(Object.entries(JSON.parse(saved))));
    } catch { /* ignore */ }
    setHydrated(true);
  }, [cartKey, configKey]);

  // Persist cart
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(cartKey, JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart, cartKey, hydrated]);

  // Persist configs
  useEffect(() => {
    if (!hydrated) return;
    try {
      const obj: Record<string, CartItem> = {};
      savedConfigs.forEach((v, k) => { obj[k] = v; });
      localStorage.setItem(configKey, JSON.stringify(obj));
    } catch { /* ignore */ }
  }, [savedConfigs, configKey, hydrated]);

  const toggleProduct = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateCartItem = useCallback((item: CartItem) => {
    const sanitized: CartItem = {
      ...item,
      unitPrice: parseFloat(String(item.unitPrice)) || 0,
      totalPrice: parseFloat(String(item.totalPrice)) || 0,
      quantity: parseInt(String(item.quantity)) || 1,
    };
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === sanitized.productId && !i.combinationId);
      if (idx > -1) { const u = [...prev]; u[idx] = sanitized; return u; }
      return [...prev, sanitized];
    });
    setSavedConfigs((prev) => {
      const m = new Map(prev);
      m.set(sanitized.productId, sanitized);
      return m;
    });
  }, []);

  const updateVariantItems = useCallback((productId: string, items: CartItem[]) => {
    if (!items.length) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    const sanitizedItems = items.map((item, idx) => ({
      ...item,
      cartItemId: `${productId}_${idx}`,
      productId,
      unitPrice: parseFloat(String(item.unitPrice)) || 0,
      totalPrice: parseFloat(String(item.totalPrice)) || 0,
      quantity: parseInt(String(item.quantity)) || 1,
    }));
    setCart((prev) => {
      const withoutProduct = prev.filter((i) => i.productId !== productId);
      return [...withoutProduct, ...sanitizedItems];
    });
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((s, i) => s + (parseFloat(String(i.totalPrice)) || 0), 0);
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setSavedConfigs(new Map());
    try {
      localStorage.removeItem(cartKey);
      localStorage.removeItem(configKey);
    } catch { /* ignore */ }
  }, [cartKey, configKey]);

  return {
    cart, setCart, selectedIds, savedConfigs, hydrated,
    toggleProduct, updateCartItem, updateVariantItems, getCartTotal, clearCart,
  };
}

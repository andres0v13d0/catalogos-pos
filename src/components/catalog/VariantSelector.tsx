"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { FiX } from "react-icons/fi";
import QuantitySelector from "./QuantitySelector";
import { Variant, Combination } from "@/types/catalog";

interface VariantOptionDef {
  variantId: string;
  variantName: string;
  options: { optionId: string; value: string }[];
}

interface Row {
  id: number;
  selections: Record<string, string>;
  quantity: number;
}

interface RowItem {
  combinationId: string | null;
  variantOptions: { variantName: string; optionValue: string }[];
  quantity: number;
  unitPrice: number;
  selections: Record<string, string>;
}

interface CartItemForVariant {
  combinationId?: string | null;
  variantOptions?: { variantName: string; optionValue: string }[];
  quantity: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  combinations: Combination[];
  cartItems: CartItemForVariant[];
  onRowsChange: (items: RowItem[]) => void;
  getPriceForCombo: (combo: Combination) => number;
}

export default function VariantSelector({
  variants,
  combinations,
  cartItems = [],
  onRowsChange,
  getPriceForCombo,
}: VariantSelectorProps) {
  const variantOptions: VariantOptionDef[] = variants.map((v) => {
    const optionsSet = new Map<string, { optionId: string; value: string }>();
    combinations.forEach((combo) => {
      const opt = combo.variantOptions?.find((vo) => vo.variantId === v.variantId);
      if (opt && !optionsSet.has(opt.optionId)) {
        optionsSet.set(opt.optionId, { optionId: opt.optionId, value: opt.value });
      }
    });
    return { variantId: v.variantId, variantName: v.variantName, options: [...optionsSet.values()] };
  });

  const buildEmptyRow = (): Row => {
    const selections: Record<string, string> = {};
    variantOptions.forEach((v) => { selections[v.variantId] = ""; });
    return { id: Date.now() + Math.random(), selections, quantity: 0 };
  };

  const buildRowsFromCart = useCallback((): Row[] => {
    if (!cartItems.length) return [buildEmptyRow()];
    const rows: Row[] = cartItems.map((item, i) => {
      const selections: Record<string, string> = {};
      if (item.combinationId) {
        const combo = combinations.find((c) => c.id === item.combinationId);
        if (combo) {
          variantOptions.forEach((v) => {
            const opt = combo.variantOptions?.find((vo) => vo.variantId === v.variantId);
            if (opt) selections[v.variantId] = opt.optionId;
          });
        }
      }
      if (!Object.values(selections).some(Boolean) && item.variantOptions?.length) {
        item.variantOptions.forEach((vo) => {
          const variantDef = variantOptions.find((v) => v.variantName === vo.variantName);
          if (variantDef) {
            const opt = variantDef.options.find((o) => o.value === vo.optionValue);
            if (opt) selections[variantDef.variantId] = opt.optionId;
          }
        });
      }
      return { id: Date.now() + i + Math.random(), selections, quantity: item.quantity || 0 };
    });
    rows.push(buildEmptyRow());
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, combinations]);

  const [rows, setRows] = useState<Row[]>(buildRowsFromCart);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    setRows(buildRowsFromCart());
  }, [cartItems, buildRowsFromCart]);

  const findCombination = (selections: Record<string, string>) => {
    return combinations.find((combo) =>
      variantOptions.every((v) => {
        const selectedOptionId = selections[v.variantId];
        if (!selectedOptionId) return false;
        return combo.variantOptions?.some(
          (vo) => vo.variantId === v.variantId && vo.optionId === selectedOptionId
        );
      })
    );
  };

  const isCombinationAvailable = (selections: Record<string, string>) => {
    const combo = findCombination(selections);
    if (!combo) return false;
    if (combo.stock !== undefined && combo.stock <= 0) return false;
    return true;
  };

  const emitChange = (updatedRows: Row[]) => {
    const validRows = updatedRows.filter((row) => {
      const allSelected = variantOptions.every((v) => row.selections[v.variantId]);
      return allSelected && row.quantity > 0;
    });
    const items: RowItem[] = validRows.map((row) => {
      const combo = findCombination(row.selections);
      const resolvedPrice = getPriceForCombo(combo || ({} as Combination));
      return {
        combinationId: combo?.id || null,
        variantOptions: variantOptions.map((v) => ({
          variantName: v.variantName,
          optionValue: v.options.find((o) => o.optionId === row.selections[v.variantId])?.value || "",
        })),
        quantity: row.quantity,
        unitPrice: resolvedPrice,
        selections: row.selections,
      };
    });
    isInternalChange.current = true;
    onRowsChange(items);
  };

  const handleChange = (rowId: number, field: string, value: string | number) => {
    setRows((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== rowId) return r;
        if (field === "quantity") return { ...r, quantity: value as number };
        return { ...r, selections: { ...r.selections, [field]: value as string } };
      });
      const modified = updated.find((r) => r.id === rowId)!;
      const allSelected = variantOptions.every((v) => modified.selections[v.variantId]);
      const isComplete = allSelected && modified.quantity > 0;
      const isLast = updated[updated.length - 1].id === rowId;
      if (isComplete && isLast) updated.push(buildEmptyRow());
      setTimeout(() => emitChange(updated), 0);
      return updated;
    });
  };

  const handleRemove = (rowId: number) => {
    setRows((prev) => {
      const updated = prev.filter((r) => r.id !== rowId);
      const result = updated.length ? updated : [buildEmptyRow()];
      setTimeout(() => emitChange(result), 0);
      return result;
    });
  };

  const selectClass = "w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition-colors bg-white text-gray-800 appearance-none cursor-pointer";

  const filledRows = rows.filter((r) =>
    variantOptions.some((v) => r.selections[v.variantId]) || r.quantity
  );
  const hasMultipleFilledRows = filledRows.length > 1;

  return (
    <div className="p-3 bg-gray-50 border-t-2 border-gray-200" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const allSelected = variantOptions.every((v) => row.selections[v.variantId]);
          const isComplete = allSelected && row.quantity > 0;
          const isEmpty = variantOptions.every((v) => !row.selections[v.variantId]) && !row.quantity;
          const hasPartial = variantOptions.some((v) => row.selections[v.variantId]) || row.quantity > 0;

          let comboUnavailable = false;
          if (allSelected) comboUnavailable = !isCombinationAvailable(row.selections);

          const gridCols = `repeat(${variantOptions.length + 1}, 1fr)${hasMultipleFilledRows && !isEmpty ? " 32px" : ""}`;

          return (
            <div
              key={row.id}
              className={`grid gap-2 items-end p-3 rounded-xl border-2 transition-all ${
                comboUnavailable ? "border-red-300 bg-red-50" :
                isComplete ? "border-green-400 bg-green-50" :
                "border-gray-200 bg-white hover:border-orange-300"
              }`}
              style={{ gridTemplateColumns: gridCols }}
            >
              {variantOptions.map((v) => (
                <div key={v.variantId}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{v.variantName}:</label>
                  <select
                    value={row.selections[v.variantId] || ""}
                    onChange={(e) => { e.stopPropagation(); handleChange(row.id, v.variantId, e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    className={`${selectClass} ${!row.selections[v.variantId] && hasPartial ? "border-red-400 bg-red-50" : ""}`}
                  >
                    <option value="">Seleccionar...</option>
                    {v.options.map((opt) => (
                      <option key={opt.optionId} value={opt.optionId}>{opt.value}</option>
                    ))}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cant:</label>
                <QuantitySelector
                  value={row.quantity}
                  onChange={(val) => handleChange(row.id, "quantity", val)}
                  className={!row.quantity && hasPartial ? "border-red-400 bg-red-50" : ""}
                />
              </div>
              {hasMultipleFilledRows && !isEmpty && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(row.id); }}
                  className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors flex-shrink-0 cursor-pointer"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

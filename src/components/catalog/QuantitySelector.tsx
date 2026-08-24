"use client";
import { useState, useEffect } from "react";

interface QuantitySelectorProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
}

export default function QuantitySelector({ value, onChange, className = "" }: QuantitySelectorProps) {
  const [customMode, setCustomMode] = useState(value > 12);

  useEffect(() => {
    if (value <= 12) setCustomMode(false);
  }, [value]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const val = e.target.value;
    if (val === "custom") {
      setCustomMode(true);
      return;
    }
    onChange(parseInt(val) || 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onChange(parseInt(e.target.value) || 0);
  };

  const handleInputBlur = () => {
    if (!value || value <= 12) setCustomMode(false);
  };

  const selectClass = `w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition-colors bg-white text-gray-800 appearance-none cursor-pointer ${className}`;

  if (customMode) {
    return (
      <input
        type="number"
        min="1"
        value={value || ""}
        placeholder="Cantidad"
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onClick={(e) => e.stopPropagation()}
        autoFocus
        className={selectClass}
      />
    );
  }

  return (
    <select
      value={value || ""}
      onChange={handleSelectChange}
      onClick={(e) => e.stopPropagation()}
      className={selectClass}
    >
      <option value="">Seleccionar...</option>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
        <option key={n} value={n}>
          {n} {n === 1 ? "unidad" : "unidades"}
        </option>
      ))}
      <option value="custom">Otra cantidad...</option>
    </select>
  );
}

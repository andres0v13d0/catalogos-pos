"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaWhatsapp } from "react-icons/fa";
import colombiaData from "@/data/colombia.json";
import { CustomerData } from "@/lib/whatsapp";

interface CheckoutModalProps {
  onClose: () => void;
  onConfirm: (data: CustomerData) => void;
  creatingOrder: boolean;
  error?: string | null;
}

interface DepartmentEntry {
  id: number;
  departamento: string;
  ciudades: string[];
}

export default function CheckoutModal({ onClose, onConfirm, creatingOrder, error }: CheckoutModalProps) {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    neighborhood: "",
    department: "",
    city: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const departments: DepartmentEntry[] = colombiaData as DepartmentEntry[];
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const handleDepartmentChange = (dept: string) => {
    set("department", dept);
    set("city", "");
    const selectedDept = departments.find((d) => d.departamento === dept);
    setFilteredCities(selectedDept ? selectedDept.ciudades : []);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Los nombres son requeridos";
    if (!form.lastName.trim()) e.lastName = "Los apellidos son requeridos";
    if (!form.phone.trim()) e.phone = "El teléfono es requerido";
    if (!form.address.trim()) e.address = "La dirección es requerida";
    if (!form.department) e.department = "El departamento es requerido";
    if (!form.city) e.city = "La ciudad es requerida";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onConfirm({
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      phone: form.phone,
      address: form.address,
      neighborhood: form.neighborhood.trim(),
      department: form.department,
      city: form.city,
      notes: form.notes,
    });
  };

  const inputClass = (field: string) =>
    `w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-orange-400"}`;

  const selectClass = (field: string) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all appearance-none bg-white text-gray-800 cursor-pointer ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-orange-400"}`;

  return (
    <>
      {/* ═══ MOBILE: bottom sheet (unchanged) ═══ */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-[1000] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={handleClose}
        >
          <div
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl flex flex-col transition-all duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Datos de entrega</h2>
                <p className="text-xs text-gray-500 mt-0.5">Completa tus datos para finalizar el pedido</p>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
                <FiX className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Form — single column on mobile */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombres completos *</label>
                <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Tus nombres" className={inputClass("firstName")} />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellidos *</label>
                <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Tus apellidos" className={inputClass("lastName")} />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono WhatsApp *</label>
                <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Ej: 3001234567" type="tel" className={inputClass("phone")} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección completa *</label>
                <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Calle, carrera, número..." className={inputClass("address")} />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Barrio / Casa / Apto / Torre</label>
                <input value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} placeholder="Barrio, casa, apartamento, torre..." className={inputClass("neighborhood")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Departamento *</label>
                <select value={form.department} onChange={(e) => handleDepartmentChange(e.target.value)} className={selectClass("department")}>
                  <option value="">Selecciona un departamento</option>
                  {departments.map((d) => (<option key={d.departamento} value={d.departamento}>{d.departamento}</option>))}
                </select>
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad *</label>
                <select value={form.city} onChange={(e) => set("city", e.target.value)} className={selectClass("city")} disabled={!form.department}>
                  <option value="">Selecciona una ciudad</option>
                  {filteredCities.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas adicionales</label>
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Instrucciones especiales, referencias, etc." rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-orange-400 transition-all resize-none" />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100">
              {error && (
                <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={creatingOrder}
                className="w-full text-white py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-70 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}
              >
                {creatingOrder ? <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" /> : <FaWhatsapp className="w-5 h-5" />}
                {creatingOrder ? "Procesando..." : "Confirmar y enviar por WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP: centered wide modal with 2-col grid ═══ */}
      <div className="hidden md:block">
        {/* Overlay */}
        <div
          className={`fixed inset-0 z-[1000] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={handleClose}
        />
        {/* Modal panel */}
        <div
          className={`fixed inset-0 z-[1000] flex items-center justify-center p-6 pointer-events-none transition-all duration-300 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-2xl max-h-[85vh] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Datos de entrega</h2>
                <p className="text-sm text-gray-500 mt-0.5">Completa tus datos para finalizar el pedido</p>
              </div>
              <button onClick={handleClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                <FiX className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Form — 2-col grid on desktop */}
            <div className="flex-1 overflow-y-auto px-7 py-6">
              <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                {/* Nombre — col 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombres completos *</label>
                  <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Tus nombres" className={inputClass("firstName")} />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                {/* Apellido — col 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellidos *</label>
                  <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Tus apellidos" className={inputClass("lastName")} />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                </div>
                {/* Teléfono — col 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono WhatsApp *</label>
                  <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Ej: 3001234567" type="tel" className={inputClass("phone")} />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                {/* Barrio — col 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Barrio / Casa / Apto / Torre</label>
                  <input value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} placeholder="Barrio, apartamento, torre..." className={inputClass("neighborhood")} />
                </div>
                {/* Dirección — full width */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección completa *</label>
                  <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Calle, carrera, número..." className={inputClass("address")} />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>
                {/* Departamento — col 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Departamento *</label>
                  <select value={form.department} onChange={(e) => handleDepartmentChange(e.target.value)} className={selectClass("department")}>
                    <option value="">Selecciona un departamento</option>
                    {departments.map((d) => (<option key={d.departamento} value={d.departamento}>{d.departamento}</option>))}
                  </select>
                  {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
                </div>
                {/* Ciudad — col 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad *</label>
                  <select value={form.city} onChange={(e) => set("city", e.target.value)} className={selectClass("city")} disabled={!form.department}>
                    <option value="">Selecciona una ciudad</option>
                    {filteredCities.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
                {/* Notas — full width */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas adicionales</label>
                  <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Instrucciones especiales, referencias, etc." rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-orange-400 transition-all resize-none" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-5 border-t border-gray-100 flex flex-col gap-3">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={creatingOrder}
                  className="px-8 py-3.5 rounded-2xl text-base font-bold flex items-center justify-center gap-3 text-white transition-all disabled:opacity-70 cursor-pointer hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}
                >
                  {creatingOrder ? <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" /> : <FaWhatsapp className="w-5 h-5" />}
                  {creatingOrder ? "Procesando..." : "Confirmar y enviar por WhatsApp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

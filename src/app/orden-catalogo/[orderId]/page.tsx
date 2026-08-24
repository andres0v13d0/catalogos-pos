import { getPublicCatalogOrder } from "@/lib/api";
import { FiPackage, FiAlertTriangle, FiMapPin, FiPhone, FiUser, FiFileText } from "react-icons/fi";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  processing: { label: "En proceso", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "Enviado", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-700" },
  canceled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderPage({ params }: PageProps) {
  const { orderId } = await params;

  let order;
  try {
    order = await getPublicCatalogOrder(orderId);
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f0f2f5" }}>
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm text-center">
          <FiAlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Pedido no encontrado</h2>
          <p className="text-gray-500 text-sm">El pedido que buscas no existe o no está disponible.</p>
        </div>
      </div>
    );
  }

  const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
  const storeName = order.bodega?.publicName || order.bodega?.name || order.catalog?.publicName || "Tienda";
  const total = Number(order.totalAmount);

  return (
    <div className="min-h-screen pb-12" style={{ background: "#f0f2f5", fontFamily: "Ubuntu, sans-serif" }}>
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#fa7e17,#ff9a3d)" }}
        >
          {storeName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs text-gray-500">Pedido de</p>
          <p className="font-bold text-gray-800 text-sm">{storeName}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-4">
        {/* Número de orden y estado */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-gray-800">Pedido #{order.orderNumber}</h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleDateString("es-CO", {
              year: "numeric", month: "long", day: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <FiPackage className="text-orange-400 w-4 h-4" />
            <span className="font-semibold text-gray-700 text-sm">
              {order.items?.length} producto{order.items?.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                {item.productImageUrl ? (
                  <img src={item.productImageUrl} alt={item.productName}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FiPackage className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{item.productName}</p>
                  {item.variantOptions && item.variantOptions.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.variantOptions.map((v) => `${v.variantName}: ${v.optionValue}`).join(" · ")}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Cantidad: {item.quantity}</p>
                </div>
                {Number(item.unitPrice) > 0 && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-800">
                      ${Math.round(Number(item.totalPrice)).toLocaleString("es-CO")}
                    </p>
                    <p className="text-xs text-gray-400">
                      ${Math.round(Number(item.unitPrice)).toLocaleString("es-CO")} c/u
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {total > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Total estimado</span>
              <span className="text-lg font-bold text-gray-800">
                ${Math.round(total).toLocaleString("es-CO")}
              </span>
            </div>
          )}
        </div>

        {/* Datos de entrega */}
        {(order.customerName || order.customerPhone || order.customerAddress) && (
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <p className="font-semibold text-gray-700 text-sm mb-1">Datos de entrega</p>
            {order.customerName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{order.customerName}</span>
              </div>
            )}
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{order.customerPhone}</span>
              </div>
            )}
            {order.customerAddress && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <FiMapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>
                  {order.customerAddress}
                  {order.customerNeighborhood && `, ${order.customerNeighborhood}`}
                  {order.customerCity && ` — ${order.customerCity}`}
                  {order.customerDepartment && `, ${order.customerDepartment}`}
                </span>
              </div>
            )}
            {order.notes && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <FiFileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>{order.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

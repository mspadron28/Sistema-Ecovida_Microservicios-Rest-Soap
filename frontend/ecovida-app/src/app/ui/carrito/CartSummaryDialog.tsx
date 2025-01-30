"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/utils/cartContext";
import { getSession } from "next-auth/react";
import { FaTimes } from "react-icons/fa";

export default function CartSummaryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cartItems, totalPrice, totalQuantity, removeCartItem } = useCart();
  const [loading, setLoading] = useState(false);

  const handleFinalizarCompra = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);

    try {
      // Obtener el token de autenticación
      const session = await getSession();
      if (!session || !session.user) {
        throw new Error("No hay sesión activa");
      }
      const userToken = session.user.token;

      const response = await fetch("http://localhost:3000/api/pedidos/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`, // ✅ Se agrega el token
        },
        body: JSON.stringify({
          items: cartItems.map(({ idProducto, cantidad }) => ({
            idProducto,
            cantidad,
          })),
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("❌ Error en el servidor:", responseData);
        throw new Error(`Error al procesar el pedido: ${responseData.message || "Sin detalles"}`);
      }

      // Eliminar todos los productos del carrito tras la compra
      for (const item of cartItems) {
        await removeCartItem(item.idProducto);
      }

      onClose(); // Cerrar el popup después de la compra
    } catch (error) {
      console.error("❌ Error al finalizar la compra:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-lg shadow-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-600">
            🛒 Resumen del Carrito
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-sm text-gray-600">Producto</th>
                <th className="p-2 text-sm text-gray-600 text-center">Cantidad</th>
                <th className="p-2 text-sm text-gray-600 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.idProducto} className="border-b">
                  <td className="p-2 text-gray-800">{item.nombre}</td>
                  <td className="p-2 text-center">{item.cantidad}</td>
                  <td className="p-2 text-right">${(item.precio * item.cantidad)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <p className="text-md font-semibold text-gray-800">
            🛍️ Total de productos: <span className="text-green-600">{totalQuantity}</span>
          </p>
          <p className="text-lg font-bold text-gray-800">
            💰 Precio Total: <span className="text-cyan-600">${totalPrice}</span>
          </p>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            disabled={loading}
          >
            <FaTimes /> Cerrar
          </button>

          <button
            onClick={handleFinalizarCompra}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            disabled={loading}
          >
            {loading ? "Procesando..." : "Finalizar compra"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

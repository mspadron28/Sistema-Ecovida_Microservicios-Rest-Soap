"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "@/utils/cartContext";
import Image from "next/image";
import Link from "next/link";
import { FaExclamationTriangle, FaMinus, FaPlus } from "react-icons/fa";
import CartSummaryDialog from "../ui/carrito/CartSummaryDialog";
import { getSession } from "next-auth/react";

export default function CartPage() {
  const { cartItems, updateCartItem, removeCartItem, addToCart } = useCart();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stockData, setStockData] = useState<{ [idProducto: number]: number }>(
    {}
  );

  // Obtener stock de cada producto en el carrito
  useEffect(() => {
    const fetchStockData = async () => {
      const session = await getSession();
      if (!session || !session.user) {
        console.error("No se encontró la sesión del usuario.");
        return;
      }
      const userToken = session.user.token;

      const stockPromises = cartItems.map(async (item) => {
        try {
          const response = await fetch(
            `http://localhost:3000/api/productos/stock/${item.idProducto}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Error al obtener el stock del producto ${item.idProducto}`
            );
          }

          const data = await response.json();
          return { idProducto: item.idProducto, stock: data.stock };
        } catch (error) {
          console.error(error);
          return { idProducto: item.idProducto, stock: 0 }; // Si falla, asumir stock 0 para evitar errores
        }
      });

      const stockResults = await Promise.all(stockPromises);
      const stockMap = stockResults.reduce((acc, curr) => {
        acc[curr.idProducto] = curr.stock;
        return acc;
      }, {} as { [idProducto: number]: number });

      setStockData(stockMap);
    };

    if (cartItems.length > 0) {
      fetchStockData();
    }
  }, [cartItems]);

  const handleRemoveItem = (itemId: number) => {
    removeCartItem(itemId);
  };

  const totalItems = cartItems.reduce(
    (total, item) => total + item.cantidad,
    0
  );
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.cantidad * item.precio,
    0
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-green-600">
        Carrito de Compras
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-lg font-medium">Tu carrito está vacío.</p>
          <Link href="/">
            <button className="text-green-500 underline">Ir a comprar</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-green-500 text-white">
              <tr>
                <th className="p-4 text-left">Producto</th>
                <th className="p-4 text-center">Cantidad</th>
                <th className="p-4 text-center">Precio</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => {
                const stockDisponible = stockData[item.idProducto] ?? 0;
                const isMaxStock = item.cantidad >= stockDisponible;

                return (
                  <tr key={item.idProducto} className="border-b">
                    <td className="p-4 flex items-center gap-4">
                      <Image
                        src={"/images/oat.png"}
                        alt={item.nombre}
                        width={70}
                        height={70}
                        className="rounded-md shadow"
                      />
                      <span className="font-medium">{item.nombre}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              updateCartItem(item.idProducto, false)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                          >
                            <FaMinus />
                          </button>
                          <span className="text-lg font-medium">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() =>
                              updateCartItem(item.idProducto, true)
                            }
                            className={`px-2 py-1 rounded transition ${
                              isMaxStock
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                            disabled={isMaxStock}
                          >
                            <FaPlus />
                          </button>
                        </div>
                        {isMaxStock && (
                          <p className="text-yellow-600 text-xs mt-1">
                            Máximo stock alcanzado
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center font-medium">
                      ${item.precio}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => removeCartItem(item.idProducto)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-6">
            <div className="text-lg font-semibold">
              Subtotal ({totalItems} productos):{" "}
              <span className="text-green-600 font-bold">${totalPrice}</span>
            </div>

            <button
              onClick={() => setIsDialogOpen(true)}
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 text-lg"
            >
              Proceder al Pago
            </button>
          </div>
        </div>
      )}

      <CartSummaryDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}

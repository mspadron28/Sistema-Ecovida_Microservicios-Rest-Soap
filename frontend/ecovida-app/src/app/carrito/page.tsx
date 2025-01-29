"use client";

import React from "react";
import { useCart } from "@/utils/cartContext";
import Image from "next/image";
import Link from "next/link";
import { FaMinus, FaPlus } from "react-icons/fa";

export default function CartPage() {
  const { cartItems, updateCartItem, removeCartItem, addToCart } = useCart();

  const handleRemoveItem = (itemId: number) => {
    removeCartItem(itemId);
  };

  // Datos quemados para agregar un producto
  const handleAddItem = () => {
    const newItem = {
      idProducto: Math.floor(Math.random() * 1000), // ID aleatorio para pruebas
      nombre: "Producto de Prueba",
      cantidad: 1,
      precio: 100.0,
      imagen: "/placeholder.png", // Imagen genérica
    };
    addToCart(newItem);
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        Carrito de Compras
      </h1>
      <div className="mb-4 text-center">
        <button
          onClick={handleAddItem}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Agregar Producto de Prueba
        </button>
      </div>
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-lg font-medium">Tu carrito está vacío.</p>
          <Link href="/">
            <button className="text-green-500 underline">Ir a comprar</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-4">Producto</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.idProducto} className="border-b">
                  <td className="p-4 flex items-center gap-4">
                    <Image
                      src={"/images/oat.png"}
                      alt={item.nombre}
                      width={50}
                      height={50}
                      className="rounded"
                    />
                    <span>{item.nombre}</span>
                  </td>
                  <td className="p-4 space-x-3">
                    <button
                      onClick={() => updateCartItem(item.idProducto, false)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      <FaMinus />
                    </button>

                    <span className="text-lg">{item.cantidad}</span>

                    <button
                      onClick={() => updateCartItem(item.idProducto, true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                    >
                      <FaPlus />
                    </button>
                  </td>

                  <td className="p-4">${item.precio}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleRemoveItem(item.idProducto)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">
              Subtotal ({totalItems}{" "}
              {totalItems === 1 ? "producto" : "productos"}
              ): ${totalPrice.toFixed(2)}
            </div>
            <Link href="/checkout">
              <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                Proceder al Pago
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

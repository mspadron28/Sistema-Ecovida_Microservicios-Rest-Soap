"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CheckCircle, AlertCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/utils/cartContext"; // Importa el hook del contexto del carrito

interface Producto {
  id_producto: number;
  nombre: string;
  precio: number;
  stock: number;
  status: boolean;
}

export default function CategoryDetailPage() {
  const { nombre } = useParams(); // Maneja los parámetros dinámicos correctamente
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hook del carrito
  const { cartItems, addToCart, updateCartItem } = useCart();

  useEffect(() => {
    if (!nombre) return;

    async function fetchProductos() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/productos/categoria/${nombre}`
        );
        if (!response.ok) {
          throw new Error("Error al obtener los productos");
        }
        const data = await response.json();
        setProductos(data);
      } catch (err) {
        setError(
          "No se pudieron cargar los productos. Por favor, inténtalo de nuevo."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProductos();
  }, [nombre]);

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span className="text-green-500">
            <CheckCircle size={32} />
          </span>
          Productos de {nombre}
        </h1>
      </header>

      {loading && (
        <div className="text-center py-8">
          <p className="text-lg font-medium">Cargando productos...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-lg font-medium text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && productos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-lg font-medium">
            No hay productos disponibles en esta categoría actualmente.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((producto) => {
          const existeEnCarrito = cartItems.some(
            (item) => item.idProducto === producto.id_producto
          );

          return (
            <Card key={producto.id_producto} className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <span className="text-green-500">
                    <CheckCircle size={20} />
                  </span>
                  {producto.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-cyan-600">
                  {producto.precio
                    ? `$${producto.precio}`
                    : "Precio no disponible"}
                </p>
                <p
                  className={`text-sm mt-2 flex items-center gap-1 ${
                    producto.stock > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {producto.stock > 0 ? (
                    <>
                      <CheckCircle size={16} /> Disponible
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} /> Agotado
                    </>
                  )}
                </p>
                <p
                  className={`text-sm mt-1 flex items-center gap-1 ${
                    producto.status ? "text-green-500" : "text-gray-500"
                  }`}
                >
                  {producto.status ? (
                    <>
                      <CheckCircle size={16} /> Activo
                    </>
                  ) : (
                    <>Inactivo</>
                  )}
                </p>
              </CardContent>
              <CardFooter>
                <button
                  onClick={() => {
                    const productoEnCarrito = cartItems.find(
                      (item) => item.idProducto === producto.id_producto
                    );
                    if (productoEnCarrito) {
                      updateCartItem(producto.id_producto, true);
                    } else {
                      addToCart({
                        idProducto: producto.id_producto,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        cantidad: 1,
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    cartItems.some(
                      (item) => item.idProducto === producto.id_producto
                    )
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white`}
                  disabled={producto.stock === 0}
                >
                  <ShoppingCart size={16} />{" "}
                  {cartItems.some(
                    (item) => item.idProducto === producto.id_producto
                  )
                    ? "Añadir uno más"
                    : "Agregar al Carrito"}
                </button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

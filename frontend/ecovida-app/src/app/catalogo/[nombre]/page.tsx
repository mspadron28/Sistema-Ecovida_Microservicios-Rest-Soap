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
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Edit3,
  PlusCircle,
} from "lucide-react";
import { useCart } from "@/utils/cartContext"; // Importa el hook del contexto del carrito
import { useSession } from "next-auth/react";
import FormProducto from "@/app/ui/catalogo/FormProducto";
import { Role } from "@/lib/roles.enum";

interface Producto {
  id_producto: number;
  id_categoria: number;
  nombre: string;
  precio: number;
  stock: number;
  status: boolean;
}

export default function CategoryDetailPage() {
  const { nombre } = useParams(); // Nombre de la categoría
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGestorProductos, setIsGestorProductos] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const { data: session } = useSession();
  const { cartItems, addToCart, updateCartItem } = useCart();

  // ✅ Verificar si el usuario es GESTOR_PRODUCTOS y obtener token
  useEffect(() => {
    if (session?.user) {
      setToken(session.user.token);
      setIsGestorProductos(session.user.roles.includes(Role.GESTOR_PRODUCTOS));
    }
  }, [session]);

  // ✅ Obtener productos de la categoría
  useEffect(() => {
    if (!nombre || !token) return;

    async function fetchProductos() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/productos/categoria/${nombre}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener los productos");
        }

        const data = await response.json();
        setProductos(data);
      } catch (err) {
        setError("No se pudieron cargar los productos. Por favor, inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    fetchProductos();
  }, [nombre, token, openForm]);

  return (
    <div className="container mx-auto p-4 mt-12">
      <header className="mt-10 flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span className="text-green-500">
            <CheckCircle size={32} />
          </span>
          Productos de {nombre}
        </h1>

        {/* ✅ Botón para crear producto (solo para gestores de productos) */}
        {isGestorProductos && (
          <Button
            className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700"
            onClick={() => {
              setProductoSeleccionado(null); // Crear nuevo producto
              setOpenForm(true);
            }}
          >
            <PlusCircle size={18} /> Crear Producto
          </Button>
        )}
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
          const productoEnCarrito = cartItems.find(
            (item) => item.idProducto === producto.id_producto
          );

          const cantidadEnCarrito = productoEnCarrito
            ? productoEnCarrito.cantidad
            : 0;
          const stockMaximoAlcanzado = cantidadEnCarrito >= producto.stock;

          return (
            <Card key={producto.id_producto} className="shadow-lg rounded-lg">
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <span className="text-green-500">
                    <CheckCircle size={20} />
                  </span>
                  {producto.nombre}
                </CardTitle>

                {/* ✅ Botón de modificar (solo para gestores de productos) */}
                {isGestorProductos && (
                  <Button
                    className="bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-2 px-3"
                    size="sm"
                    onClick={() => {
                      setProductoSeleccionado(producto);
                      setOpenForm(true);
                    }}
                  >
                    <Edit3 size={16} />
                  </Button>
                )}
              </CardHeader>

              <CardContent>
                <p className="text-xl font-semibold text-cyan-600">
                  {producto.precio ? `$${producto.precio}` : "Precio no disponible"}
                </p>

                {/* ✅ Mostrar stock solo si el usuario es gestor de productos */}
                {isGestorProductos ? (
                  <p className="text-2xl font-bold mt-3 flex items-center gap-2">
                    {producto.stock > 0 ? (
                      <>
                        <CheckCircle className="text-green-500" size={24} />
                        {producto.stock} en stock
                      </>
                    ) : (
                      <>
                        <AlertCircle className="text-red-500" size={24} />
                        Agotado
                      </>
                    )}
                  </p>
                ) : (
                  <p className={`text-lg font-semibold mt-3 ${producto.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                    {producto.stock > 0 ? "✅ Disponible" : "❌ No disponible"}
                  </p>
                )}
              </CardContent>

              {/* ✅ Botón "Agregar al carrito" solo para usuarios */}
              {!isGestorProductos && (
                <CardFooter className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
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
                    className={`w-full text-white rounded-md flex items-center gap-2 ${
                      productoEnCarrito
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                    disabled={producto.stock === 0 || !producto.status || stockMaximoAlcanzado}
                  >
                    <ShoppingCart size={16} />
                    {stockMaximoAlcanzado
                      ? "Stock máximo alcanzado"
                      : productoEnCarrito
                      ? "Añadir uno más"
                      : "Agregar al Carrito"}
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>

         {/* ✅ Renderizar FormProducto si se abre */}
         {openForm && token && (
        <FormProducto
          open={openForm}
          onClose={() => setOpenForm(false)}
          idProducto={productoSeleccionado?.id_producto}
          productoActual={productoSeleccionado || undefined}
          idCategoria={productos[0]?.id_categoria || 0}
          token={token}
        />
      )}
    </div>
  );
}

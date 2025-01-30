"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaLeaf, FaCheckCircle, FaClock } from "react-icons/fa";

interface Pedido {
  id_pedido: number;
  estado: string;
  fecha_pedido: string;
  precioTotalPedido: string;
  cantidadTotalPedido: number;
  detalle_pedido: {
    id_producto: number;
    cantidad: number;
    precio_unitario: string;
    subtotal: string;
    nombre: string;
  }[];
}

export default function PedidosPage() {
  const { data: session, status } = useSession();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!session || !session.user) {
        setError("No se encontró la sesión del usuario.");
        setLoading(false);
        return;
      }

      const userToken = session.user.token;

      try {
        const response = await fetch("http://localhost:3000/api/pedidos/usuario", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener los pedidos.");
        }

        const data = await response.json();
        setPedidos(data);
      } catch (err: any) {
        setError(err.message || "Error desconocido.");
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 md:px-8">
      {/* Título principal */}
      <div className="text-center mb-8 mt-20">
        <div className="flex items-center justify-center">
          <FaLeaf className="text-green-500 mr-2" size={32} />
          <h1 className="text-3xl font-bold text-green-600">
            Mis Pedidos - EcoVida
          </h1>
        </div>
        <p className="text-gray-600 mt-2">
          Bienvenido, {session?.user?.nombre || "Usuario"}.
        </p>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center">
          <p>No tienes pedidos registrados.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pedidos.map((pedido) => (
            <Card
              key={pedido.id_pedido}
              className="shadow-md flex flex-col justify-between border border-gray-200 rounded-lg"
            >
              {/* Encabezado */}
              <CardHeader className="bg-gray-50 p-4 border-b">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      Pedido #{pedido.id_pedido}
                    </CardTitle>
                    <div className="flex items-center">
                      {pedido.estado === "Entregado" ? (
                        <>
                          <FaCheckCircle
                            className="text-green-500 mr-2"
                            size={20}
                          />
                          <span className="text-green-500 font-medium">
                            Entregado
                          </span>
                        </>
                      ) : (
                        <>
                          <FaClock className="text-yellow-500 mr-2" size={20} />
                          <span className="text-yellow-500 font-medium">
                            {pedido.estado}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Fecha: {new Date(pedido.fecha_pedido).toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>

              {/* Contenido */}
              <CardContent className="p-4 flex flex-col gap-4">
                <ul className="space-y-2">
                  {pedido.detalle_pedido.map((detalle) => (
                    <li
                      key={detalle.id_producto}
                      className="grid grid-cols-3 items-center gap-2"
                    >
                      <span className="text-gray-700 col-span-1">
                        {detalle.nombre}
                      </span>
                      <span className="text-center text-gray-500 col-span-1">
                        x{detalle.cantidad}
                      </span>
                      <span className="text-right text-gray-700 font-medium col-span-1">
                        ${detalle.subtotal}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-200 pt-4 flex flex-col gap-1">
                  <p className="text-gray-700 font-semibold text-sm">
                    Total:{" "}
                    <span className="text-cyan-600 font-bold text-base">
                      ${pedido.precioTotalPedido}
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Cantidad total: {pedido.cantidadTotalPedido}
                  </p>
                </div>
                <Button
                  className="w-full bg-cyan-500 text-white rounded-md hover:bg-cyan-600 mt-4"
                  size="lg"
                >
                  Ver Detalles
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

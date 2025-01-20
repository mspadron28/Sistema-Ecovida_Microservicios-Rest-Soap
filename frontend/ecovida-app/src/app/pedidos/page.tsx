'use client';

import React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaLeaf, FaCheckCircle, FaClock } from "react-icons/fa";
import { Role } from "@/lib/roles.enum";


const pedidos = [
  {
    numeroPedido: "12345",
    estado: "Entregado",
    productos: [
      { nombre: "Manzanas Orgánicas", cantidad: 2, precio: "$3.00" },
      { nombre: "Panela", cantidad: 1, precio: "$2.50" },
    ],
  },
  {
    numeroPedido: "12346",
    estado: "En Proceso",
    productos: [
      { nombre: "Aguacates", cantidad: 4, precio: "$8.00" },
      { nombre: "Café Orgánico", cantidad: 1, precio: "$10.00" },
    ],
  },
];

export default function PedidosPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No tienes acceso a esta página. Por favor inicia sesión.</p>
      </div>
    );
  }

  const rolesUsuario = session.user.roles || [];
  const isAdmin = rolesUsuario.includes(Role.ADMINISTRADOR);
  const isGestorPedidos = rolesUsuario.includes(Role.GESTOR_PEDIDOS);
  const isUsuario = rolesUsuario.includes(Role.USUARIO);

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
          Bienvenido, {session.user.nombre} (
          {isAdmin
            ? "Administrador"
            : isGestorPedidos
            ? "Gestor de Pedidos"
            : isUsuario
            ? "Usuario"
            : "Otro Rol"}
          ).
        </p>
      </div>

      {/* Verificar rol */}
      {isAdmin && (
        <div className="mb-6 text-center text-blue-500">
          <p>¡Eres administrador! Tienes acceso a funcionalidades avanzadas.</p>
        </div>
      )}
      {isGestorPedidos && (
        <div className="mb-6 text-center text-purple-500">
          <p>¡Eres gestor de pedidos! Puedes gestionar los pedidos en esta página.</p>
        </div>
      )}
      {isUsuario && (
        <div className="mb-6 text-center text-green-500">
          <p>¡Eres un usuario estándar! Aquí están tus pedidos.</p>
        </div>
      )}

      {/* Listado de pedidos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pedidos.map((pedido) => (
          <Card
            key={pedido.numeroPedido}
            className="shadow-md flex flex-col justify-between"
          >
            <CardHeader className="bg-gray-50 p-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">
                  Pedido #{pedido.numeroPedido}
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
                        En Proceso
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <ul className="space-y-2">
                {pedido.productos.map((producto, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-700">{producto.nombre}</span>
                    <span className="text-gray-500">
                      x{producto.cantidad}
                    </span>
                    <span className="text-gray-700 font-medium">
                      {producto.precio}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-cyan-500 text-white rounded-md hover:bg-cyan-600"
                size="lg"
              >
                Verificar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

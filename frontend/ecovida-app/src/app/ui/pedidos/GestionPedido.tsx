"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getSession } from "next-auth/react";
import { Role } from "@/lib/roles.enum";
import { formatISO } from "date-fns";

interface GestionPedidoProps {
  open: boolean;
  onClose: () => void;
  idPedido: number; // ID del pedido que se gestiona
}

export default function GestionPedido({ open, onClose, idPedido }: GestionPedidoProps) {
  const [fechaEnvio, setFechaEnvio] = useState<string>("");
  const [fechaEntrega, setFechaEntrega] = useState<string>("");
  const [metodoEnvio, setMetodoEnvio] = useState("Servientrega");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Opciones de envío
  const opcionesEnvio = [
    "Servientrega",
    "Urbano Express",
    "Laarcourier",
    "Tramaco Express",
    "Deblex Ecuador",
  ];

  // Establecer la fecha de envío automáticamente al abrir el diálogo
  useEffect(() => {
    if (open) {
      const now = new Date();
      setFechaEnvio(formatISO(now)); // Formato completo ISO-8601 con fecha y hora en UTC
    }
  }, [open]);

  // Manejar el envío del formulario
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const session = await getSession();
      if (!session || !session.user || !session.user.roles.includes(Role.GESTOR_PEDIDOS)) {
        setError("No tienes permisos para gestionar pedidos.");
        return;
      }

      // Validación: La fecha de entrega debe ser después de la fecha de envío
      const envioDate = new Date(fechaEnvio);
      const entregaDate = new Date(fechaEntrega);

      if (entregaDate <= envioDate) {
        setError("La fecha de entrega debe ser posterior a la fecha de envío.");
        setLoading(false);
        return;
      }

      // Convertir fecha de entrega a formato ISO con hora UTC
      const fechaEntregaISO = formatISO(entregaDate);

      // 1️⃣ **Registrar el envío en la API**
      const responseEnvio = await fetch("http://localhost:3000/api/envios/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({
          id_pedido: idPedido,
          fecha_envio: fechaEnvio,
          fecha_entrega: fechaEntregaISO,
          estado: "PENDIENTE",
          metodo_envio: metodoEnvio,
        }),
      });

      if (!responseEnvio.ok) {
        throw new Error("Error al registrar el envío.");
      }

      // 2️⃣ **Actualizar el estado del pedido a "ENVIADO"**
      const responseEstado = await fetch(`http://localhost:3000/api/pedidos/${idPedido}/enviar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
      });

      if (!responseEstado.ok) {
        throw new Error("Error al actualizar el estado del pedido.");
      }

      onClose(); // ✅ Cerrar el diálogo después de completar ambas solicitudes
    } catch (error: any) {
      setError(error.message || "Error desconocido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-lg shadow-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-cyan-600">📦 Gestionar Envío</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* ID del pedido (no editable) */}
          <p className="text-gray-700">
            <strong>ID Pedido:</strong> {idPedido}
          </p>

          {/* Fecha de Envío (Automática) */}
          <p className="text-gray-700">
            <strong>Fecha de Envío:</strong> {new Date(fechaEnvio).toLocaleString()}
          </p>

          {/* Fecha de Entrega */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Entrega</label>
            <input
              type="date"
              className="w-full border border-gray-300 p-2 rounded-md"
              min={fechaEnvio.split("T")[0]} // Restringimos para que no seleccione antes de la fecha de envío
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
            />
          </div>

          {/* Método de Envío */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Método de Envío</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={metodoEnvio}
              onChange={(e) => setMetodoEnvio(e.target.value)}
            >
              {opcionesEnvio.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>

          {/* Estado (Siempre "PENDIENTE") */}
          <p className="text-gray-700">
            <strong>Estado:</strong> PENDIENTE
          </p>

          {/* Mostrar errores si hay */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600"
              disabled={loading || !fechaEntrega}
            >
              {loading ? "Enviando..." : "Registrar Envío"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

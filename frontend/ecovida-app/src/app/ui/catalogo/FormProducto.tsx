"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FormProductoProps {
  open: boolean;
  onClose: () => void;
  idProducto?: number;
  productoActual?: { nombre: string; precio: number; stock: number };
  idCategoria: number;
  token: string;
}

export default function FormProducto({
  open,
  onClose,
  idProducto,
  productoActual,
  idCategoria,
  token,
}: FormProductoProps) {
  const [nombre, setNombre] = useState(productoActual?.nombre || "");
  const [precio, setPrecio] = useState(productoActual?.precio.toString() || "");
  const [stock, setStock] = useState(productoActual?.stock.toString() || "0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Resetear el formulario cuando se abre
  useEffect(() => {
    if (open) {
      setNombre(productoActual?.nombre || "");
      setPrecio(productoActual?.precio.toString() || "");
      setStock(productoActual?.stock.toString() || "0");
      setError(null);
    }
  }, [open, productoActual]);

  // ✅ Manejar la solicitud de creación o actualización
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Convertir stock a número entero y validar
      const parsedStock = Number.parseInt(stock, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        setError("El stock debe ser un número entero positivo.");
        setLoading(false);
        return;
      }

      // ✅ Validar y convertir precio a string con dos decimales
      const parsedPrecio = Number.parseFloat(precio);
      if (isNaN(parsedPrecio) || parsedPrecio <= 0) {
        setError("El precio debe ser un número válido mayor a 0.");
        setLoading(false);
        return;
      }

      // ✅ Convertir el precio a string con máximo dos decimales sin usar toFixed()
      const precioString = `${Math.floor(parsedPrecio * 100) / 100}`;

      const url = idProducto
        ? `http://localhost:3000/api/productos/update/${idProducto}`
        : "http://localhost:3000/api/productos";

      const method = idProducto ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          precio: precioString, // ✅ Enviar precio como string con 2 decimales
          stock: parsedStock, // ✅ Enviar stock como número entero
          id_categoria: idCategoria,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Error al ${idProducto ? "modificar" : "crear"} el producto.`
        );
      }

      onClose();
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
          <DialogTitle className="text-xl font-bold text-green-600">
            {idProducto ? "✏️ Editar Producto" : "➕ Crear Producto"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo de nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <Input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-md"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* Campo de precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Precio
            </label>
            <Input
              type="number"
              className="w-full border border-gray-300 p-2 rounded-md"
              value={precio}
              onChange={(e) => {
                const valor = e.target.value.replace(/[^0-9.]/g, ""); // ✅ Solo permite números y punto decimal
                if (/^\d*\.?\d{0,2}$/.test(valor)) {
                  setPrecio(valor);
                }
              }}
            />
          </div>

          {/* Campo de stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stock
            </label>
            <Input
              type="number"
              className="w-full border border-gray-300 p-2 rounded-md"
              value={stock}
              onChange={(e) => {
                const valor = e.target.value.replace(/\D/g, ""); // ✅ Solo números enteros
                setStock(valor || "0"); // Evitar valores vacíos
              }}
              min="0"
            />
          </div>

          {/* Categoría (Solo visible, no editable) */}
          <p className="text-gray-700">
            <strong>Categoría:</strong> {idCategoria}
          </p>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              disabled={loading || !nombre.trim() || !precio || !stock}
            >
              {loading ? "Guardando..." : idProducto ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

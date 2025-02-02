"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FormCategoriaProps {
  open: boolean;
  onClose: () => void;
  idCategoria?: number; // Opcional, si existe significa que es edición
  nombreActual?: string; // Nombre actual de la categoría (para edición)
  token: string; // Token de autenticación
}

export default function FormCategoria({ open, onClose, idCategoria, nombreActual, token }: FormCategoriaProps) {
  const [nombre, setNombre] = useState(nombreActual || ""); // Estado del nombre
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNombre(nombreActual || "");
      setError(null);
    }
  }, [open, nombreActual]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = idCategoria
        ? `http://localhost:3000/api/categorias/update/${idCategoria}`
        : "http://localhost:3000/api/categorias";

      const method = idCategoria ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
      });

      if (!response.ok) {
        throw new Error(`Error al ${idCategoria ? "modificar" : "crear"} la categoría.`);
      }

      onClose(); // Cerrar el formulario tras la acción exitosa
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
            {idCategoria ? "✏️ Editar Categoría" : "➕ Crear Categoría"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo de nombre */}
          <Input
            type="text"
            className="w-full border border-gray-300 p-2 rounded-md"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600" disabled={loading || !nombre.trim()}>{loading ? "Guardando..." : idCategoria ? "Actualizar" : "Crear"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

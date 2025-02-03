"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Role } from "@/lib/roles.enum";

// ✅ Mapeo de roles permitidos (nombres)
const validRoles = ["Usuario", "Gestor_Productos", "Gestor_Pedidos", "Admin"];

interface FormUserProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
  userRole?: string;
  token: string;
  isRegister?: boolean; // ✅ Nuevo: Determina si es registro
}

export default function FormUser({ open, onClose, userId, userName, userRole, token, isRegister }: FormUserProps) {
  const [nombre, setNombre] = useState(userName || "");
  const [email, setEmail] = useState(""); // ✅ Nuevo: Email para registro
  const [password, setPassword] = useState(""); // ✅ Nuevo: Contraseña para registro
  const [role, setRole] = useState(userRole || "Usuario");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNombre(userName || "");
      setRole(userRole || "Usuario");
      setEmail("");
      setPassword("");
      setError(null);
    }
  }, [open, userName, userRole]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = isRegister
        ? "http://localhost:3000/api/auth/register" // ✅ Endpoint para registro
        : `http://localhost:3000/api/auth/users/${userId}`; // ✅ Endpoint para modificación

      const method = isRegister ? "POST" : "PATCH";

      const body = isRegister
        ? JSON.stringify({ name: nombre, email, password, roles: [role] }) // ✅ Cuerpo de registro
        : JSON.stringify({ nombre, roles: [role] }); // ✅ Cuerpo de modificación

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`Error al ${isRegister ? "registrar" : "modificar"} el usuario.`);
      }

      onClose(); // ✅ Cerrar el formulario tras éxito
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
            {isRegister ? "➕ Registrar Usuario" : "✏️ Editar Usuario"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo Nombre */}
          <Input
            type="text"
            className="w-full border border-gray-300 p-2 rounded-md"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del usuario"
          />

          {/* Campos adicionales para registro */}
          {isRegister && (
            <>
              <Input
                type="email"
                className="w-full border border-gray-300 p-2 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
              />
              <Input
                type="password"
                className="w-full border border-gray-300 p-2 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
              />
            </>
          )}

          {/* Selector de Rol */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md"
          >
            {validRoles.map((roleName) => (
              <option key={roleName} value={roleName}>
                {roleName}
              </option>
            ))}
          </select>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Botones de Acción */}
          <div className="flex justify-between">
            <Button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600" disabled={loading || !nombre.trim()}>
              {loading ? "Guardando..." : isRegister ? "Registrar" : "Actualizar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

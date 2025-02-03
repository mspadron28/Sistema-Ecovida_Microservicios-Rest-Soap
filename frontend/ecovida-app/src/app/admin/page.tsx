"use client";

import { useState, useEffect, JSX } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Role } from "@/lib/roles.enum";
import { FaUserShield, FaUser, FaBox, FaClipboardList, FaEdit, FaTrashAlt, FaCheck, FaUserPlus } from "react-icons/fa";
import { IoStorefrontSharp } from "react-icons/io5";
import FormUser from "../ui/admin/FormUser";

// ✅ Mapeo de roles por ID a nombres
const roleIdToName: Record<string, string> = {
  [Role.ADMINISTRADOR]: "Admin",
  [Role.USUARIO]: "Usuario",
  [Role.GESTOR_PRODUCTOS]: "Gestor_Productos",
  [Role.GESTOR_PEDIDOS]: "Gestor_Pedidos",
};

// ✅ Mapeo de roles a iconos
const roleMap: Record<string, { name: string; icon: JSX.Element }> = {
  Usuario: { name: "Usuario", icon: <FaUser className="text-blue-500" size={20} /> },
  Gestor_Productos: { name: "Gestor de Productos", icon: <FaBox className="text-green-500" size={20} /> },
  Gestor_Pedidos: { name: "Gestor de Pedidos", icon: <FaClipboardList className="text-yellow-500" size={20} /> },
  Admin: { name: "Administrador", icon: <FaUserShield className="text-red-500" size={20} /> },
};

// ✅ Interfaz para el usuario
interface User {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  fechaRegistro: string;
  roles: string[]; // La API devuelve un array con los IDs de los roles
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRegister, setIsRegister] = useState(false);

  // ✅ Obtener la lista de usuarios
  useEffect(() => {
    if (!session?.user?.token) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/auth/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener los usuarios.");
        }

        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError("No se pudieron cargar los usuarios.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [session, selectedUser,isRegister]);

  // ✅ Manejar activación/desactivación (toggle)
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/auth/users/${userId}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cambiar el estado del usuario.");
      }

      const data = await response.json();

      // ✅ Actualizar lista de usuarios
      setUsers(users.map((user) => (user.id === userId ? { ...user, activo: data.activo } : user)));
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6 mt-12">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <IoStorefrontSharp className="text-green-600 text-3xl" />
          <h1 className="text-3xl font-bold text-green-700">Panel de Administración</h1>
        </div>
        <Button
          onClick={() => {
            setIsRegister(true);
            setSelectedUser(null);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <FaUserPlus />
          Crear Usuario
        </Button>
      </div>

      {/* Mensajes de carga o error */}
      {loading && <p className="text-center text-lg">Cargando usuarios...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Lista de usuarios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          const roleName = roleIdToName[user.roles[0]] || "Desconocido";
          return (
            <Card key={user.id} className="shadow-md rounded-lg bg-white border border-gray-200">
              <CardHeader className="p-4 border-b flex items-center gap-3">
                {roleMap[roleName]?.icon || <FaUser className="text-gray-500" size={20} />}
                <CardTitle className="text-lg font-semibold">{user.nombre}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <p className="text-gray-700 text-sm">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Registrado el:</strong> {new Date(user.fechaRegistro).toLocaleDateString()}
                </p>
                <p className={`text-sm font-semibold ${user.activo ? "text-green-500" : "text-red-500"}`}>
                  {user.activo ? "🟢 Activo" : "🔴 Inactivo"}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Rol:</strong> {roleName}
                </p>
              </CardContent>
              <CardFooter className="p-4 flex justify-between">
                {/* Botón para editar */}
                <Button
                  className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
                  onClick={() => {
                    setSelectedUser({ ...user, roles: [roleName] });
                    setIsRegister(false);
                  }}
                >
                  <FaEdit />
                  Editar
                </Button>

                {/* Botón para activar/desactivar usuario */}
                <Button
                  className={`px-3 py-2 rounded-md flex items-center gap-2 ${
                    user.activo ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                  } text-white`}
                  onClick={() => handleToggleUserStatus(user.id)}
                >
                  {user.activo ? <FaTrashAlt /> : <FaCheck />}
                  {user.activo ? "Desactivar" : "Activar"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Formulario de edición/registro de usuario */}
      {(selectedUser || isRegister) && (
        <FormUser
          open={!!selectedUser || isRegister}
          onClose={() => {
            setSelectedUser(null);
            setIsRegister(false);
          }}
          userId={selectedUser?.id}
          userName={selectedUser?.nombre}
          userRole={selectedUser?.roles[0]}
          token={session?.user?.token || ""}
          isRegister={isRegister}
        />
      )}
    </div>
  );
}

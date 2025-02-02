"use client";

import React, { useEffect, useState } from "react";
import { useSession, getSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaLeaf, FaPlus, FaEdit } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { Role } from "@/lib/roles.enum";
import FormCategoria from "../ui/catalogo/FormCategoria";

interface Categoria {
  id_categoria: number;
  nombre: string;
}

export default function CatalogPage() {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGestorProductos, setIsGestorProductos] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);

  // ✅ Obtener sesión y validar rol + token
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          setToken(session.user.token);
          setIsGestorProductos(session.user.roles.includes(Role.GESTOR_PRODUCTOS));
        }
      } catch {
        setToken(null);
        setIsGestorProductos(false);
      }
    };

    fetchSession();
  }, []);

  // ✅ Obtener todas las categorías con autenticación
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3000/api/categorias", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setCategories(data))
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
      });
  }, [token,openForm]);

  return (
    <div className="min-h-screen bg-white px-4 py-6 md:px-8">
      {/* Encabezado Principal */}
      <div className="text-center mb-8 mt-20">
        <div className="flex items-center justify-center">
          <FaLeaf className="text-green-500 mr-2" size={32} />
          <h1 className="text-3xl font-bold text-green-600">Nuestro Eco Catálogo</h1>
        </div>
        {/* ✅ Botón para crear una nueva categoría (solo visible para gestores de productos) */}
        {isGestorProductos && (
          <div className="flex justify-center mt-4">
            <Button
              className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700"
              onClick={() => {
                setCategoriaSeleccionada(null);
                setOpenForm(true);
              }}
            >
              <FaPlus /> Crear Nueva Categoría
            </Button>
          </div>
        )}
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="text-center text-red-500 mb-6">
          <p>Error al cargar las categorías: {error}</p>
        </div>
      )}

      {/* Sección de Categorías */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id_categoria} className="shadow-md flex flex-col justify-between">
            <CardHeader className="bg-gray-50 p-4 flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{category.nombre}</CardTitle>
              {/* ✅ Botón de modificar alineado a la derecha */}
              {isGestorProductos && (
                <Button
                  className="bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-2"
                  size="sm"
                  onClick={() => {
                    setCategoriaSeleccionada(category);
                    setOpenForm(true);
                  }}
                >
                  <FaEdit />
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center">
              <Image
                src={`/images/categories/${category.nombre.toLowerCase()}.png`}
                alt={category.nombre}
                width={300}
                height={160}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <Link href={`/catalogo/${category.nombre}`}>
                <Button className="w-full bg-cyan-500 text-white rounded-md hover:bg-cyan-600" size="lg">
                  Revisar
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ Formulario para crear/editar categoría */}
      {openForm && token && (
        <FormCategoria
          open={openForm}
          onClose={() => setOpenForm(false)}
          idCategoria={categoriaSeleccionada?.id_categoria}
          nombreActual={categoriaSeleccionada?.nombre}
          token={token}
        />
      )}
    </div>
  );
}

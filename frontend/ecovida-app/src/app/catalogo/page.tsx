"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaLeaf } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
interface Categoria {
  id_categoria: number;
  nombre: string;
}

export default function CatalogPage() {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/categorias")
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
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 py-6 md:px-8">
      {/* Encabezado Principal */}
      <div className="text-center mb-8 mt-20">
        <div className="flex items-center justify-center">
          <FaLeaf className="text-green-500 mr-2" size={32} />
          <h1 className="text-3xl font-bold text-green-600">
            Nuestro Eco Catálogo
          </h1>
        </div>
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
          <Card
            key={category.id_categoria}
            className="shadow-md flex flex-col justify-between"
          >
            <CardHeader className="bg-gray-50 p-4">
              <CardTitle className="text-lg font-semibold">
                {category.nombre}
              </CardTitle>
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
                <Button
                  className="w-full bg-cyan-500 text-white rounded-md hover:bg-cyan-600"
                  size="lg"
                >
                  Revisar
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import ImageCarousel from "@/app/ui/inicio/ImageCarousel"; // Nuevo componente de carrusel

export default function Home() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-green-50 mt-10 py-16 px-8 md:px-16 flex flex-col md:flex-row items-center gap-8">
        {/* Texto del Hero */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold text-green-700">
            Come Orgánico, Vive Bien
          </h1>
          <p className="mt-4 text-lg md:text-xl text-green-600">
            Productos de temporada y ecológicos
          </p>
        </div>

        {/* Nuevo Carousel de productos ecológicos */}
        <div className="flex-1 w-full max-w-2xl">
          <ImageCarousel />
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 px-8 md:px-16">
        <h2 className="text-3xl font-bold text-green-700 text-center mb-12">
          Categorías
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Verduras", image: "/images/vegetables.png" },
            { title: "Frutas", image: "/images/fruits.png" },
            { title: "Granos", image: "/images/grains.png" },
            { title: "Cuidado Personal", image: "/images/personal-care.png" },
            { title: "Artículos Ecológicos", image: "/images/eco-items.png" },
          ].map((category, index) => (
            <Card
              key={index}
              className="relative w-full h-[300px] overflow-hidden rounded-lg shadow-lg"
            >
              {/* Imagen de fondo que cubre todo el contenedor */}
              <Image
                src={category.image}
                alt={category.title}
                layout="fill"
                objectFit="cover"
                className="absolute inset-0 w-full h-full"
              />

              {/* Capa oscura para mejorar la visibilidad del texto */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>

              {/* Título de la categoría sobre la imagen */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold text-center px-4 bg-black bg-opacity-60 rounded-md py-2">
                  {category.title}
                </h3>
              </div>
            </Card>
          ))}
        </div>
      </section>

    </main>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import CarouselHome from "./ui/inicio/CarouselHome"; // Importa el componente

export default function Home() {
  const products = [
    { name: "Manzanas Orgánicas", price: "$3.99", image: "/images/apple.png" },
    { name: "Tomates Cherry", price: "$2.49", image: "/images/tomatocherry.png" },
    { name: "Avena Ecológica", price: "$5.99", image: "/images/oat.png" },
  ];

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
            Productos de temporada
          </p>
        </div>

        {/* Carousel de productos */}
        <div className="flex-1">
          <CarouselHome products={products} />
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 px-8 md:px-16">
        <h2 className="text-3xl font-bold text-green-700 text-center mb-12">
          Categorías
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[{ title: "Verduras", image: "/images/vegetables.png" }, { title: "Frutas", image: "/images/fruits.png" }, { title: "Granos", image: "/images/grains.png" }].map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition">
              <CardHeader>
                <Image
                  src={category.image}
                  alt={category.title}
                  width={300}
                  height={300}
                  className="rounded-t-lg object-cover"
                />
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-semibold text-gray-800 text-center">
                  {category.title}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      <section className="py-16 px-8 md:px-16 bg-green-50">
        <h2 className="text-3xl font-bold text-green-700 text-center mb-12">
          Productos Destacados
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[{ name: "Manzanas Orgánicas", price: "$3.99", image: "/images/apple.png" }, { name: "Zanahorias", price: "$1.99", image: "/images/carrot.png" }, { name: "Leche de Almendras", price: "$4.99", image: "/images/almond-milk.png" }, { name: "Pan Integral", price: "$2.49", image: "/images/bread.png" }].map((product, index) => (
            <Card key={index} className="hover:shadow-lg transition">
              <CardHeader>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="rounded-t-lg object-cover"
                />
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold text-gray-800 text-center">
                  {product.name}
                </h3>
                <p className="text-green-600 font-bold text-center">{product.price}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                  Agregar al Carrito
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

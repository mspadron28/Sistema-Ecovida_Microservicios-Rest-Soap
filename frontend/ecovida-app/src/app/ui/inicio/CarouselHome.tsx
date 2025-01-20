"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

interface Product {
  name: string;
  price: string;
  image: string;
}

interface CarouselHomeProps {
  products: Product[];
}

export default function CarouselHome({ products }: CarouselHomeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Avanzar automáticamente cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [products.length]);

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full max-w-md mx-auto"
    >
      <CarouselContent>
        {products.map((product, index) => (
          <CarouselItem
            key={index}
            className={`transition-opacity duration-300 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Card>
              <CardContent className="text-center p-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="mx-auto rounded-md object-cover"
                />
                <h3 className="mt-4 text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-green-600 font-bold">{product.price}</p>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-between mt-4">
        <CarouselPrevious
          onClick={() =>
            setCurrentIndex((currentIndex - 1 + products.length) % products.length)
          }
          className="bg-green-500 text-white rounded-full px-3 py-1 hover:bg-green-600"
        />
        <CarouselNext
          onClick={() => setCurrentIndex((currentIndex + 1) % products.length)}
          className="bg-green-500 text-white rounded-full px-3 py-1 hover:bg-green-600"
        />
      </div>
    </Carousel>
  );
}

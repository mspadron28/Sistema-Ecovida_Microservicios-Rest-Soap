import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { productos } from "@/lib";
import Image from "next/image";
import { FaShoppingCart } from "react-icons/fa";
import { FaPaw } from "react-icons/fa";
import { ImWhatsapp } from "react-icons/im";
import { motion } from "framer-motion";

const ImageCarousel: React.FC = () => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState<number | null>(null);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap());

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const interval = setInterval(() => {
      api.scrollNext();
      setIsHovered(null); // Reset animación cuando cambia el carrusel
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="flex flex-col  w-full h-full relative">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {productos.map((_, index) => (
            <CarouselItem key={index} className="flex">
              <div className="w-[200] h-full">
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src={`/images/${productos[index % productos.length]}.png`}
                    width={300}
                    height={255}
                    layout="responsive"
                    alt={`Imagen ${index}`}
                    className="object-contain"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

  
    </div>
  );
};

export default ImageCarousel;

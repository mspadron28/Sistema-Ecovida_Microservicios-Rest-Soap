"use client";

import { CartProvider } from "@/utils/cartContext";
import { SessionProvider } from "next-auth/react";// Importa el contexto del carrito

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
      {children}
      </CartProvider>
        
    </SessionProvider>
  );
}

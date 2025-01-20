"use client";

import Link from "next/link";
import { useState } from "react";
import { FaLeaf, FaHome, FaShoppingCart, FaBars} from "react-icons/fa";
import { GrCatalog } from "react-icons/gr";

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full flex items-center justify-between px-6 py-4 z-50">
      {/* Identidad de la marca */}
      <div className="flex items-center gap-2">
        <FaLeaf className="text-green-500 text-2xl" />
        <h1 className="text-2xl font-semibold text-green-700">EcoVida</h1>
      </div>

      {/* Secciones del menú */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition"
        >
          <FaHome className="text-xl" />
          <span>Home</span>
        </Link>
        <Link
          href="/catalogo"
          className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition"
        >
          <GrCatalog  className="text-xl" />
          <span>Catalogo</span>
        </Link>
        <Link
          href="/pedidos"
          className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition"
        >
          <FaShoppingCart className="text-xl" />
          <span>Pedidos</span>
        </Link>
    
      </div>

      {/* Botón de Login */}
      <div className="hidden md:block">
        <Link
          href="/auth/login"
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Login
        </Link>
      </div>

      {/* Menú móvil */}
      <div className="md:hidden flex items-center">
        <button
          className="text-gray-800 text-2xl"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          <FaBars />
        </button>
        {isMobileMenuOpen && (
          <div className="absolute top-16 right-6 bg-white shadow-lg rounded-md p-4 flex flex-col items-start gap-4 z-50">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaHome className="text-xl" />
              <span>Home</span>
            </Link>
            <Link
              href="/pedidos"
              className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaShoppingCart className="text-xl" />
              <span>Pedidos</span>
            </Link>
            <Link
              href="/auth/login"
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg w-full transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

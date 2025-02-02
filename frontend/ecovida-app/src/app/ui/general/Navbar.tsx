"use client";

import { useCart } from "@/utils/cartContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaLeaf, FaHome, FaShoppingCart, FaBars, FaUserShield } from "react-icons/fa";
import { BiTask } from "react-icons/bi";
import { GrCatalog } from "react-icons/gr";
import { signOut, useSession } from "next-auth/react";
import { Role } from "@/lib/roles.enum";


export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalQuantity } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Validar si el usuario tiene el rol de ADMINISTRADOR
  useEffect(() => {
    if (session?.user) {
      setIsAdmin(session.user.roles.includes(Role.ADMINISTRADOR));
    }
  }, [session]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full flex items-center justify-between px-6 py-4 z-50">
      {/* Identidad de la marca */}
      <div className="flex items-center gap-2">
        <FaLeaf className="text-green-500 text-2xl" />
        <h1 className="text-2xl font-semibold text-green-700">EcoVida</h1>
      </div>

      {/* Secciones del menú */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition">
          <FaHome className="text-xl" />
          <span>Home</span>
        </Link>
        <Link href="/catalogo" className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition">
          <GrCatalog className="text-xl" />
          <span>Catálogo</span>
        </Link>
        <Link href="/pedidos" className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition">
          <BiTask className="text-xl" />
          <span>Pedidos</span>
        </Link>
        <Link href="/carrito" className="relative flex items-center gap-2 text-gray-800 hover:text-green-600 transition">
          <FaShoppingCart className="text-2xl" />
          {/* Indicador de cantidad de productos en el carrito */}
          {totalQuantity > 0 && (
            <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {totalQuantity}
            </span>
          )}
          <span>Carrito</span>
        </Link>

        {/* ✅ Enlace a Admin (solo si es administrador) */}
        {isAdmin && (
          <Link href="/admin" className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition">
            <FaUserShield className="text-xl" />
            <span>Admin</span>
          </Link>
        )}
      </div>

      {/* Botón de Login / Logout */}
      <div className="hidden md:block">
        {session ? (
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition">
            Cerrar sesión
          </button>
        ) : (
          <Link href="/auth/login" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition">
            Login
          </Link>
        )}
      </div>

      {/* Menú móvil */}
      <div className="md:hidden flex items-center">
        <button className="text-gray-800 text-2xl" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
          <FaBars />
        </button>
        {isMobileMenuOpen && (
          <div className="absolute top-16 right-6 bg-white shadow-lg rounded-md p-4 flex flex-col items-start gap-4 z-50">
            <Link href="/" className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition" onClick={() => setMobileMenuOpen(false)}>
              <FaHome className="text-xl" />
              <span>Home</span>
            </Link>
            <Link href="/catalogo" className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition" onClick={() => setMobileMenuOpen(false)}>
              <GrCatalog className="text-xl" />
              <span>Catálogo</span>
            </Link>
            <Link href="/pedidos" className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition" onClick={() => setMobileMenuOpen(false)}>
              <BiTask className="text-xl" />
              <span>Pedidos</span>
            </Link>
            <Link href="/carrito" className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition" onClick={() => setMobileMenuOpen(false)}>
              <FaShoppingCart className="text-xl" />
              <span>Carrito</span>
            </Link>

            {/* ✅ Enlace Admin en versión móvil (solo si es administrador) */}
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition" onClick={() => setMobileMenuOpen(false)}>
                <FaUserShield className="text-xl" />
                <span>Admin</span>
              </Link>
            )}

            {session ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg w-full transition"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg w-full transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

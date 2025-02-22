"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaLeaf } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/"); // Redirige al usuario al home tras iniciar sesión
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-100 to-green-300">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 sm:p-8">
        {/* Logo y título */}
        <div className="text-center mb-6">
          <FaLeaf className="text-green-600 text-4xl mx-auto" />
          <h1 className="text-3xl font-bold text-green-700 mt-2">Bienvenido</h1>
          <p className="text-gray-600">Inicia sesión para continuar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Mensaje de error */}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Enlace para registrarse */}
        <p className="text-center text-sm text-gray-600 mt-4">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register">
            <span className="text-green-600 font-semibold hover:underline cursor-pointer">
              Regístrate aquí
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

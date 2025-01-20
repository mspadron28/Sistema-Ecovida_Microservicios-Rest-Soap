import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Authentication failed");
        }

        if (res.ok && data?.token) {
          // Retorna el usuario con los datos necesarios para NextAuth
          return {
            id: data.user.id,
            nombre: data.user.nombre,
            email: data.user.email,
            roles: data.user.roles,
            token: data.token,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nombre = user.nombre;
        token.email = user.email;
        token.roles = user.roles;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        nombre: token.nombre as string,
        email: token.email as string,
        roles: token.roles as string[],
        token: token.accessToken as string,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 5, // Tiempo en segundos para la sesión
  },
  jwt: {
    maxAge: 60 * 5, // Tiempo en segundos para el token
  },
  logger: {
    debug: console.log,
    error: console.error,
    warn: console.warn,
  },
};

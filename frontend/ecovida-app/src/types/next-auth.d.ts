import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nombre: string;
      email: string;
      roles: string[];
      token: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    nombre: string;
    email: string;
    roles: string[];
    token: string;
  }

  interface JWT {
    id: string;
    nombre: string;
    email: string;
    roles: string[];
    accessToken: string;
  }
}

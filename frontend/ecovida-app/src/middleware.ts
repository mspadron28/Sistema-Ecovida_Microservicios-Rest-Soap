import { withAuth } from "next-auth/middleware";

export default withAuth({});

export const config = {
  matcher: ["/carrito/:path*", "/carrito"], // Protege todas las rutas bajo /pedidos
};

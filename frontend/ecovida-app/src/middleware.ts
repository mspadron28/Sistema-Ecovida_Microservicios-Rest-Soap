import { withAuth } from "next-auth/middleware";

export default withAuth({});

export const config = {
  matcher: ["/carrito/:path*", "/carrito","/pedidos/:path*", "/pedidos","/catalogo/:path*", "/catalogo"], // Protege todas las rutas bajo /pedidos
};

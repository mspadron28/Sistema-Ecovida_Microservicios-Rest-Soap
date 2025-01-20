import { withAuth } from "next-auth/middleware";

export default withAuth({});

export const config = {
  matcher: ["/pedidos/:path*", "/pedidos"], // Protege todas las rutas bajo /pedidos
};

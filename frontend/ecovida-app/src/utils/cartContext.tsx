"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getSession } from "next-auth/react";
import { Role } from "@/lib/roles.enum";

// Interfaz para los items del carrito
interface CartItem {
  idProducto: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

// Interfaz del contexto
interface CartContextProps {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  updateCartItem: (idProducto: number, increase: boolean) => void;
  removeCartItem: (idProducto: number) => void;
  resetCart: () => void;
  totalPrice: number;
  totalQuantity: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [token, setToken] = useState<string | null>(null);
  const [isUsuario, setIsUsuario] = useState(false);


// Obtener la sesión y validar el rol del usuario
useEffect(() => {
  const fetchSession = async () => {
    try {
      const session = await getSession();
      
      // Verificamos que el usuario tenga el rol de USUARIO
      const usuarioValido = session?.user?.roles.includes(Role.USUARIO);
      setIsUsuario(!!usuarioValido);

      // Si es usuario, guardamos el token
      if (usuarioValido) {
        if (session && session.user) {
          setToken(session.user.token);
        }
      }
    } catch {
      setIsUsuario(false);
    }
  };

  fetchSession();
}, []);


  // Obtener el carrito desde el backend al cargar
  useEffect(() => {
    if (!token || !isUsuario) return; // No ejecuta si no es usuario o no hay token
    const fetchCart = async () => {
      if (!token) return; // Esperar a que el token esté disponible

      try {
        const response = await fetch(
          "http://localhost:3000/api/carritos/user",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 404) {
        console.log("El usuario aún no tiene un carrito. Esperando...");
        return;
      }
        if (!response.ok) {
          throw new Error("Error al obtener los datos del carrito");
        }

        const data = await response.json();

        const items = data.carrito_detalle.map((detalle: any) => ({
          idProducto: detalle.id_producto,
          nombre: detalle.nombre,
          precio: parseFloat(detalle.precio_unitario),
          cantidad: detalle.cantidad,
        }));

        setCartItems(items);
        setTotalPrice(data.precioTotal);
        setTotalQuantity(data.cantidadTotal);
      } catch (error) {
        console.error("Error al cargar el carrito:", error);
      }
    };

    fetchCart();
  }, [token,isUsuario]);  // Solo se ejecuta si el usuario tiene el rol correcto

  // **Actualizar totalQuantity cada vez que cambie cartItems**
  useEffect(() => {
    setTotalQuantity(
      cartItems.reduce((total, item) => total + item.cantidad, 0)
    );
  }, [cartItems]);

  // Función para agregar un producto al carrito en el backend
  const addToCart = async (item: CartItem) => {
    if (!token) {
      console.error("El token no está disponible.");
      return;
    }

    try {
      // Verificar si el producto ya existe en el carrito
      const existingItem = cartItems.find(
        (cartItem) => cartItem.idProducto === item.idProducto
      );

      if (existingItem) {
        // Si el producto ya está en el carrito, solo incrementa la cantidad en el backend
        await updateCartItem(item.idProducto, true);
        return;
      }

      // Si no existe, enviamos solo este producto al backend
      const response = await fetch("http://localhost:3000/api/carritos/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ idProducto: item.idProducto, cantidad: 1 }],
        }),
      });

      if (!response.ok) {
        throw new Error("Error al agregar el producto al carrito");
      }

      // Si se agrega correctamente, actualizar el estado local sin afectar otros productos
      setCartItems((prevCart) => [...prevCart, { ...item, cantidad: 1 }]);
      setTotalQuantity((prevTotal) => prevTotal + 1);
      setTotalPrice((prevTotal) => prevTotal + item.precio);
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  };

  // Actualizar cantidad de un producto
  const updateCartItem = async (idProducto: number, increase: boolean) => {
    if (!token) {
      console.error("El token no está disponible.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/carritos/actualizar-cantidad",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            idProducto,
            stock: 1, // Siempre ajustar de uno en uno
            increase,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Error al actualizar la cantidad del producto en el carrito"
        );
      }

      const data = await response.json();
      const nuevaCantidad = data.nuevaCantidad;

      // Actualizar solo el producto modificado en el estado local
      setCartItems((prevCart) =>
        prevCart.map((item) =>
          item.idProducto === idProducto
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
      );

      // Recalcular los totales usando el nuevo estado
      setCartItems((prevCart) => {
        const newTotalPrice = prevCart.reduce(
          (total, item) => total + item.precio * item.cantidad,
          0
        );
        const newTotalQuantity = prevCart.reduce(
          (total, item) => total + item.cantidad,
          0
        );

        setTotalPrice(newTotalPrice);
        setTotalQuantity(newTotalQuantity);

        return prevCart;
      });
    } catch (error) {
      console.error("Error al actualizar la cantidad del producto:", error);
    }
  };

  // Remover un item del carrito
  const removeCartItem = async (idProducto: number) => {
    if (!token) {
      console.error("El token no está disponible.");
      return;
    }

    try {
      // Llamada al backend para eliminar el producto del carrito en la base de datos
      const response = await fetch(
        "http://localhost:3000/api/carritos/eliminar-item",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ idProducto }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el producto del carrito");
      }

      // Actualizar el estado local eliminando el producto
      setCartItems((prevCart) =>
        prevCart.filter((item) => item.idProducto !== idProducto)
      );

      // Recalcular los totales
      const newTotalPrice = cartItems.reduce(
        (total, item) =>
          item.idProducto !== idProducto
            ? total + item.precio * item.cantidad
            : total,
        0
      );
      const newTotalQuantity = cartItems.reduce(
        (total, item) =>
          item.idProducto !== idProducto ? total + item.cantidad : total,
        0
      );

      setTotalPrice(newTotalPrice);
      setTotalQuantity(newTotalQuantity);
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  };

  // Resetear el carrito
  const resetCart = () => {
    setCartItems([]);
    setTotalPrice(0);
    setTotalQuantity(0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateCartItem,
        removeCartItem,
        resetCart,
        totalPrice,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}

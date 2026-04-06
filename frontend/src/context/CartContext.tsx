import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// ── Cart item: room info stored BEFORE booking is created ──
export interface CartRoom {
  roomId: string;
  roomTypeName: string;
  roomNumber: string;
  image?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  capacity: number;
  amenities?: string[];
}

export interface CartContextValue {
  cartItems: CartRoom[];
  cartCount: number;
  addToCart: (item: CartRoom) => void;
  removeFromCart: (roomId: string) => void;
  clearCart: () => void;
  // Legacy aliases kept for compat
  cartIds: string[];
}

const CART_KEY = "hotel_cart_v2";

const CartContext = createContext<CartContextValue>({
  cartItems: [],
  cartCount: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  cartIds: [],
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartRoom[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const persist = (items: CartRoom[]) => {
    setCartItems(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  };

  const addToCart = (item: CartRoom) => {
    setCartItems(prev => {
      // Avoid duplicate rooms with same dates
      const exists = prev.some(
        p => p.roomId === item.roomId &&
          p.checkIn === item.checkIn &&
          p.checkOut === item.checkOut
      );
      if (exists) return prev;
      const next = [...prev, item];
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeFromCart = (roomId: string) => {
    persist(cartItems.filter(i => i.roomId !== roomId));
  };

  const clearCart = () => persist([]);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount: cartItems.length,
      addToCart,
      removeFromCart,
      clearCart,
      cartIds: cartItems.map(i => i.roomId), // legacy compat
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

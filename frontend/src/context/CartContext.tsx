import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useCartStore } from "../store/cartStore";
import type { CartRoom } from "../store/cartStore";

export type { CartRoom };

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const setUserId = useCartStore(state => state.setUserId);
  
  // React to auth changes and update cart scope
  useEffect(() => {
    const userId = user?.id || "guest";
    setUserId(userId);
  }, [user, setUserId]);

  return <>{children}</>;
};

export const useCart = () => {
  // Rather than selecting individual fields, standard contextual usage returns the whole store
  return useCartStore();
};

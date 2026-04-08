import { create } from "zustand";

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

export interface CartStoreValue {
  cartItems: CartRoom[];
  cartCount: number;
  cartIds: string[];
  currentUserId: string;
  setUserId: (userId: string) => void;
  addToCart: (item: CartRoom) => void;
  removeFromCart: (roomId: string) => void;
  clearCart: () => void;
}

const getCartKey = (userId: string) => `hotel_cart_v2_${userId}`;

const loadCart = (userId: string): CartRoom[] => {
  try {
    const stored = localStorage.getItem(getCartKey(userId));
    if (!stored) return [];
    
    const parsed: any[] = JSON.parse(stored);
    const validItems = parsed.filter(item => 
      item.roomId && 
      item.checkIn && 
      item.checkOut && 
      typeof item.guests === "number" && item.guests > 0 &&
      typeof item.totalPrice === "number" && item.totalPrice >= 0
    );

    if (validItems.length !== parsed.length) {
      console.warn(`[CartStore] Cleaned invalid items`);
      localStorage.setItem(getCartKey(userId), JSON.stringify(validItems));
    }
    return validItems;
  } catch (err) {
    console.error("[CartStore] Error parsing cart data:", err);
    return [];
  }
};

const saveCart = (userId: string, items: CartRoom[]) => {
  localStorage.setItem(getCartKey(userId), JSON.stringify(items));
};

// Start with guest, will be hydrated securely via CartContext bridge
const initialItems = loadCart("guest");

export const useCartStore = create<CartStoreValue>()((set, get) => ({
  cartItems: initialItems,
  cartCount: initialItems.length,
  cartIds: initialItems.map(i => i.roomId),
  currentUserId: "guest",
  
  setUserId: (userId: string) => {
    if (get().currentUserId === userId) return; // Prevent unnecessary recalculation
    const items = loadCart(userId);
    set({ 
      currentUserId: userId, 
      cartItems: items, 
      cartCount: items.length, 
      cartIds: items.map(i => i.roomId) 
    });
  },

  addToCart: (item: CartRoom) => {
    set((state) => {
      const exists = state.cartItems.some(
        p => p.roomId === item.roomId && 
            p.checkIn === item.checkIn && 
            p.checkOut === item.checkOut
      );
      if (exists) return state;
      const next = [...state.cartItems, item];
      saveCart(state.currentUserId, next);
      return { 
        cartItems: next, 
        cartCount: next.length, 
        cartIds: next.map(i => i.roomId) 
      };
    });
  },
  
  removeFromCart: (roomId: string) => {
    set((state) => {
      const next = state.cartItems.filter(i => i.roomId !== roomId);
      saveCart(state.currentUserId, next);
      return { 
        cartItems: next, 
        cartCount: next.length, 
        cartIds: next.map(i => i.roomId) 
      };
    });
  },

  clearCart: () => {
    set((state) => {
      saveCart(state.currentUserId, []);
      return { cartItems: [], cartCount: 0, cartIds: [] };
    });
  }
}));

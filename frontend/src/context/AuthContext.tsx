import type { ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

// Dummy provider to keep the tree intact
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const setLoading = useAuthStore(state => state.setLoading);
  
  // Ensure loading is true until next tick (emulating the old context behavior if anyone depended on it briefly),
  // but Zustand persist is synchronous with localStorage so loading is generally fast.
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return <>{children}</>;
};

export const useAuth = () => useAuthStore();

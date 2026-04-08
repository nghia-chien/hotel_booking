import type { ReactNode } from "react";
import { useDataStore } from "../store/dataStore";

// Provide a dummy wrapper to avoid breaking App.tsx React Tree
export const DataProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const useData = () => {
  return useDataStore();
};

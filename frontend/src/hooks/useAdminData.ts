import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../api/client";
import type { HttpMethod } from "../api/client";

interface UseAdminDataOptions {
  path: string;
  method?: HttpMethod;
  immediate?: boolean;
}

interface UseAdminDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
  reload: () => Promise<void>;
}

export function useAdminData<T>({
  path,
  method = "GET",
  immediate = true,
}: UseAdminDataOptions): UseAdminDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; data: T }>(
        path,
        method,
        undefined,
        { auth: true }
      );
      setData(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [path, method]);

  useEffect(() => {
    if (immediate) void reload();
  }, [reload, immediate]);

  return { data, loading, error, success, setError, setSuccess, reload };
}

import { useState, useCallback } from 'react';
import { searchRooms } from '../api/booking.api';
import type { SearchResultItem } from '../types/room';
import type { PropertySearchParams } from '../types/property';

interface UsePropertySearchReturn {
  results: SearchResultItem[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  search: (params: PropertySearchParams | string) => Promise<void>;
  reset: () => void;
}

export default function usePropertySearch(): UsePropertySearchReturn {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const search = useCallback(async (params: PropertySearchParams | string) => {
    try {
      setLoading(true);
      setError(null);

      let queryString: string;

      if (typeof params === 'string') {
        // Backward compat: dùng trực tiếp
        queryString = params;
      } else {
        // Object mode: build URLSearchParams
        if (!params.checkIn || !params.checkOut) {
          setLoading(false);
          return;
        }
        const qs = new URLSearchParams({
          checkIn: params.checkIn.toISOString(),
          checkOut: params.checkOut.toISOString(),
          guests: String(params.guests),
        });
        queryString = qs.toString();
      }

      const res = await searchRooms(queryString);
      if (res.success) {
        setResults(res.data);
      } else {
        setError('Failed to fetch rooms');
      }
      setHasSearched(true);
    } catch (err) {
      setError((err as Error).message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setLoading(false);
    setError(null);
    setHasSearched(false);
  }, []);

  return { results, loading, error, hasSearched, search, reset };
}

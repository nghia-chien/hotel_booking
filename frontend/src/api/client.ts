export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
}

export class ApiError extends Error {
  statusCode: number;
  errorCode: string;
  details?: any;

  constructor(message: string, statusCode: number, errorCode: string, details?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

export async function apiRequest<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
  options: ApiRequestOptions = {}
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };

  if (options.auth) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  let res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body
      ? isFormData
        ? (body as FormData)
        : JSON.stringify(body)
      : undefined,
    ...options
  });

  // Interceptor: Handle 401 Unauthorized
  if (res.status === 401 && options.auth && !path.includes("/refresh-token")) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken })
          });
          
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newAccessToken = data.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);
            isRefreshing = false;
            onRefreshed(newAccessToken);
          } else {
            // Refresh token is also invalid/expired
            isRefreshing = false;
            onRefreshed("");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login"; // Force redirect
          }
        } catch (err) {
          isRefreshing = false;
          onRefreshed("");
        }
      }

      // Wait for the new token
      const newToken = await new Promise<string>((resolve) => {
        addRefreshSubscriber(resolve);
      });

      if (newToken) {
        // Retry the original request with the new token
        (headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        res = await fetch(`${API_BASE_URL}${path}`, {
          method,
          headers,
          body: body
            ? isFormData
              ? (body as FormData)
              : JSON.stringify(body)
            : undefined,
          ...options
        });
      } else {
        // Refresh failed, throw the original 401 error
      }
    }
  }

  const contentType = res.headers.get("Content-Type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${res.status}`;
    const errorCode = data?.errorCode || "UNKNOWN_ERROR";
    throw new ApiError(message, res.status, errorCode, data?.details);
  }

  return data as T;
}


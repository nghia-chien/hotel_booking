import { API_BASE_URL } from "../api/client"

export const toImageUrl = (url: string) =>
  url.startsWith("/") ? `${API_BASE_URL}${url}` : url

export const formatUSD = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value)
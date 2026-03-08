import { API_BASE_URL } from "../api/client"

export const toImageUrl = (url: string) =>
  url.startsWith("/") ? `${API_BASE_URL}${url}` : url

export const formatUSD = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value)

export const estimateRating = (roomId: string) => {
  let hash = 0
  for (let i = 0; i < roomId.length; i++)
    hash = (hash * 31 + roomId.charCodeAt(i)) >>> 0

  return 3.8 + (hash % 13) / 10
}
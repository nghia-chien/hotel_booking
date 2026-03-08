export const amenityCatalog = [
  { key: "wifi", label: "Wi-Fi" },
  { key: "pool", label: "Hồ bơi" },
  { key: "breakfast", label: "Bữa sáng" },
  { key: "parking", label: "Bãi đỗ xe" },
  { key: "gym", label: "Phòng gym" }
] as const

export type AmenityKey = (typeof amenityCatalog)[number]["key"]
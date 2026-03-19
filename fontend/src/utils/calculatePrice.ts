// chưa dùng tới 

export function calculatePrice(
  checkIn: Date,
  checkOut: Date,
  price: number
) {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const hour = Math.ceil(diffMs / (1000 * 60 * 60));

  if (hour >= 24) {
    const day = Math.floor(hour / 24);
    const remainHour = hour % 24;
    return day *19.2 * price  + remainHour * price;
  }

  return hour * price;
}

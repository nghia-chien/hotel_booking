## ERD (MongoDB collections)

Hệ thống dùng MongoDB + Mongoose, các collection chính:

- **`users`**: tài khoản (role: `user | admin | staff`)
- **`roomtypes`**: loại phòng (base price, mô tả, sức chứa mặc định)
- **`rooms`**: phòng cụ thể (roomNumber, roomType, capacity, amenities, policies, images)
- **`pricingrules`**: rule giá theo mùa (gắn với `roomType`, khoảng ngày, cộng fixed/percentage, weekend/holiday)
- **`bookings`**: đặt phòng (customer, room, roomType, checkIn/out, guests, totalPrice, status, paymentStatus, cancellationDeadline, refundPercentage...)
- **`payments`**: giao dịch thanh toán (booking, customer, amount, method: `mock/stripe/paypal/refund`, status: `PENDING/SUCCESS/FAILED`, metadata)

### Quan hệ (mức logical)

- **Room → RoomType**: `rooms.roomType` → `roomtypes._id`
- **Booking → User**: `bookings.customer` → `users._id`
- **Booking → Room**: `bookings.room` → `rooms._id`
- **Booking → RoomType**: `bookings.roomType` → `roomtypes._id`
- **PricingRule → RoomType**: `pricingrules.roomType` → `roomtypes._id`
- **Payment → Booking/User**: `payments.booking` → `bookings._id`, `payments.customer` → `users._id`

### Mermaid ERD (tham khảo)

```mermaid
erDiagram
  USERS ||--o{ BOOKINGS : "customer"
  ROOMS ||--o{ BOOKINGS : "room"
  ROOMTYPES ||--o{ ROOMS : "type"
  ROOMTYPES ||--o{ PRICINGRULES : "pricing rules"
  BOOKINGS ||--o{ PAYMENTS : "payments"

  USERS {
    ObjectId _id
    string name
    string email
    string password
    string role
  }
  ROOMTYPES {
    ObjectId _id
    string name
    number basePrice
    number defaultCapacity
    string description
  }
  ROOMS {
    ObjectId _id
    string roomNumber
    ObjectId roomType
    number capacity
    string[] amenities
    string policies
    string[] images
    boolean isActive
  }
  PRICINGRULES {
    ObjectId _id
    ObjectId roomType
    date startDate
    date endDate
    string priceType
    number value
    boolean applyWeekend
    boolean applyHolidays
  }
  BOOKINGS {
    ObjectId _id
    ObjectId customer
    ObjectId room
    ObjectId roomType
    date checkIn
    date checkOut
    number guests
    number totalPrice
    string status
    string paymentStatus
    date cancellationDeadline
    number refundPercentage
    number refundedAmount
  }
  PAYMENTS {
    ObjectId _id
    ObjectId booking
    ObjectId customer
    number amount
    string method
    string status
    string transactionId
    object metadata
  }
```


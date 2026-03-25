# Hotel Booking — Project Context

## Stack
Backend : Node.js + Express, JWT auth, REST API
Frontend: React + TypeScript, React Router, Axios
Database: [điền MySQL hoặc PostgreSQL]
ORM     : [điền Sequelize hoặc Prisma]
Payment : VNPay
sử dụng lệnh yarn thay vì npm hay pnpm

## Folder structure
backend/src/
  controllers/   ← logic xử lý
  models/        ← User, Room, RoomType, Booking, Payment
  routes/        ← định nghĩa endpoint
  middleware/    ← isAuth.js, isAdmin.js

frontend/src/
  pages/         ← các trang (.tsx)
  components/    ← component tái sử dụng
  services/      ← axios instance + API calls
  hooks/         ← custom hooks

## Auth
Token: JWT, lưu localStorage key "token"
Header: Authorization: Bearer [token]
isAuth  → verify token, gán req.user
isAdmin → check req.user.role === 'admin'

## API response format
Success: { success: true,  data: ..., message: "..." }
Error  : { success: false, message: "lý do lỗi" }

## Đã có sẵn (không tạo lại)
- Auth: login, register, forgot/reset password
- SearchRoom.tsx, RoomDetail.tsx
- MyBookingsPage.tsx (chỉ là danh sách, chưa có detail page)
- AdminBookings, AdminRooms, AdminRoomTypes
- AdminPricing, AdminReports (có recharts)
- VNPay payment flow
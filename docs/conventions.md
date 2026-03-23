## Backend
- Mọi route handler: async/await + try/catch
- Error: res.status(4xx).json({ success: false, message })
- Không dùng callback style
- Validate input với express-validator hoặc Joi
  [điền cái nào đang dùng]

## Frontend
- Component file: PascalCase.tsx
- Dùng React Hook Form cho mọi form
- Không dùng `any` trong TypeScript
- API calls đặt trong /services/ — không gọi axios
  trực tiếp trong component
- State management: [điền Context API / Zustand / Redux]

## Thư viện đã cài (không cài thêm khi không cần)
- recharts     ← dùng cho mọi chart
- react-router-dom v[điền version]
- axios
- [liệt kê thêm nếu có]
- react-big-calendar ← dùng cho mọi calendar view
- qrcode.react       ← đã cài ở P1
- pdfkit             ← đã cài ở P1 (backend only)
- nodemailer   ← email (backend only)
- react-big-calendar ← đã có từ P2

## Database
- Model name: singular (User, Room, Booking)
- Timestamp: createdAt, updatedAt (auto)
- [điền thêm convention DB nếu có]

## Models đã có (sau P2)
- Review: bookingId, userId, roomId,
          rating(1-5), comment, isVisible, createdAt
- Room: đã có thêm avgRating, totalReviews
- Notification: userId, type, title, message,
                isRead, link, createdAt
## Pattern: createNotification
- Luôn gọi sau logic chính trong controller
- Không await — fire and forget
  (không để notification làm chậm response)
- Import từ helpers/notification.helper.js

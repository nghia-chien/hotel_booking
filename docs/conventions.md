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
## Design System (thêm vào conventions.md)
Fonts: Cormorant Garamond (display) + DM Sans (body)
Tokens: frontend/src/styles/tokens.css — dùng var(--...) only
Colors: cream=#FAF8F5, gold=#C9A84C, ink=#1A1614

## Architecture Rules
Luồng dắt buộc: Page → Hook → Service → API
- Component KHÔNG gọi axios/fetch trực tiếp
- Hook KHÔNG render JSX
- Service KHÔNG import React

## Component creation checklist
Trước khi tạo component mới:
1. Atom đã có trong /ui/ chưa? → Dùng lại
2. Cần tạo: dùng token var(--...), không hardcode màu
3. Props interface: narrow, không lẫn concern
4. Phải có: loading + error + empty state
5. Không vượt 200 lines → tách sub-component

## Inheritance rule
Chỉ 1 nơi dùng class inheritance: BaseService
Mọi nơi khác: composition (props, children, hooks)
# 🏨 Hotel Booking Management System

> [!TIP]
> **Technical Interviewer?** Check out the [Comprehensive Technical Review & Architecture Guide](./TECHNICAL_REVIEW.md) for deep-dives into system design, diagrams, and engineering decisions.

A professional, modern, and full-featured hotel booking platform built with **Node.js (Express)** and **React (Vite)**. The system supports multi-language, real-time availability checks, secure payments, and a powerful admin dashboard.

---

## 🌟 Key Features

### 👤 For Customers
- **Search & Filter**: Find rooms by date, capacity, price, and amenities.
- **Booking Flow**: Add multiple rooms to a user-specific cart and checkout seamlessly.
- **Payment Integration**: Integrated with **VNPay** and **PayPal** for secure transactions.
- **Notifications**: Get real-time updates on booking status and payments.
- **Language**: Full support for **Vietnamese** and **English**.
- **Profile**: Manage personal information, change passwords, and upload avatars.

### 🛠 For Administrators
- **Dashboard**: Real-time business performance analytics and occupancy reports.
- **Inventory Management**: Manage Room Types and individual Rooms with image uploads.
- **Pricing Strategy**: Configure seasonal pricing, weekend surcharges, and holiday rates.
- **Booking Management**: Approve check-ins/check-outs and handle cancellations.
- **Content Moderation**: Review and approve customer feedback.
- **System Monitoring**: View all registered users and system activities.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS + Custom Vanilla CSS components
- **State Management**: React Context API
- **Internationalization**: i18next (en/vi)
- **Visualization**: Recharts & React Big Calendar

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB (Mongoose ODM)
- **Security**: Helmet.js, Express Rate Limit (DDoS/Brute-force protection)
- **Logging**: Structured JSON logging via **Winston** (RequestId tracing)
- **Auth**: JWT with Access & Refresh Token mechanism
- **Payment Gateways**: VNPay, PayPal

---

## 📂 Project Structure

```text
hotel_booking/
├── backend/            # Express.js Server
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Mongoose schemas
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API endpoints
│   │   └── utils/       # Helpers (JWT, Pagination, Pricing)
├── frontend/           # React Client (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI elements
│   │   ├── context/    # Global state (Auth, Cart, Theme)
│   │   ├── features/   # Domain-specific logic (Hooks, Hooks)
│   │   ├── locales/    # i18n translations (vi, en)
│   │   └── pages/      # Route-level components
├── nginx/              # Nginx web server config
├── docker-compose.yml  # Docker orchestration
└── README.md           # You are here
```

---

## 🔐 Security & Reliability

- **Header Security**: Using `Helmet` to enforce standard security headers.
- **Request Rate Limiting**: 
    - Auth endpoints (Brute-force protection): Max 10 reqs/15min.
    - Public APIs: Max 100 reqs/15min.
- **Request Isolation**: Every API request is assigned a unique `crypto.randomUUID()` (RequestId) for trace logs.
- **CORS Configuration**: Whitelisted origins only (Preflight ready).
- **Concurrency Mitigation**: Application-level validation for room booking collision checks.

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Yarn or NPM

### 1. Backend Setup
1. Navigate to the `backend` folder.
2. Create a `.env` file from `.env.example`.
3. Configure your MongoDB URI, JWT Secret, and payment credentials.
4. Run:
   ```bash
   npm install
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` folder.
2. Create a `.env` file from `.env.example`.
3. Set `VITE_API_URL` to your backend address.
4. Run:
   ```bash
   yarn install
   yarn dev
   ```

### 3. Docker Deployment (Optional)
Run the entire stack using Docker Compose:
```bash
docker-compose up --build
```

---

## 🧪 Testing

The project uses **Playwright** for end-to-end testing.
To run tests:
```bash
npx playwright test
```

---

## 📄 License & Version
- **Version**: 1.0.0
- **Authors**: Nghia-Chien 
- **License**: MIT

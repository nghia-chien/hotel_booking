# Admin Pages Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Loại bỏ ~600 lines duplication trong `pages/Admin/` bằng cách extract shared components, một custom hook, và mở rộng service layer — không thay đổi UI/UX.

**Architecture:** Tạo 3 lớp shared: (1) `components/admin/` cho StatusBadge + AdminPageHeader + AlertMessage, (2) `hooks/useAdminData.ts` cho load/error/loading pattern, (3) mở rộng `api/admin.api.ts` cho tất cả admin endpoints. Pages chỉ còn business logic riêng của mình.

**Tech Stack:** React 18, TypeScript strict, existing `apiRequest` client, không cài thêm package nào.

---

## File structure

```
fontend/src/
├── components/admin/          ← NEW
│   ├── StatusBadge.tsx        ← extract từ 5 files
│   ├── AdminPageHeader.tsx    ← extract từ 6 files
│   └── AlertMessage.tsx       ← extract từ 4 files
├── hooks/
│   └── useAdminData.ts        ← NEW: generic load/error/loading
├── api/
│   └── admin.api.ts           ← EXPAND: thêm tất cả admin endpoints
└── pages/Admin/
    ├── AdminDashboard.tsx     ← MODIFY: dùng shared
    ├── AdminBookingsPage.tsx  ← MODIFY: dùng shared
    ├── AdminCalendar.tsx      ← MODIFY: dùng shared
    ├── AdminRoomTypesPage.tsx ← MODIFY: dùng shared
    ├── AdminRoomsPage.tsx     ← MODIFY: dùng shared
    ├── AdminPricingRulesPage.tsx ← MODIFY: dùng shared
    ├── AdminReportsPage.tsx   ← MODIFY: dùng shared
    ├── AdminReviews.tsx       ← MODIFY: dùng shared
    └── AdminUsers.tsx         ← MODIFY: dùng shared
```

---

## Task 1: `StatusBadge` shared component

**Files:**
- Create: `fontend/src/components/admin/StatusBadge.tsx`
- Test: manual render check (không có unit test setup)

**Context:** Component này hiện tại được định nghĩa lại trong:
- `AdminDashboard.tsx` (lines ~230-240)
- `AdminBookingsPage.tsx` (lines ~170-185)
- `AdminCalendar.tsx` (lines ~290-305)
- `BookingDetailPage.tsx` (lines ~35-50)
- `AdminUsers.tsx` (lines ~165-175)

Tất cả dùng cùng `configs` object với 5 status: `Confirmed, Pending, Cancelled, CheckedIn, CheckedOut`.

- [ ] **Step 1: Tạo file `StatusBadge.tsx`**

```tsx
// fontend/src/components/admin/StatusBadge.tsx
import { cn } from "../ui/utils";

type BookingStatus =
  | "Confirmed"
  | "Pending"
  | "Cancelled"
  | "CheckedIn"
  | "CheckedOut";

interface StatusBadgeProps {
  status: string;
  /** "pill" = rounded-full (default), "tag" = rounded-lg */
  variant?: "pill" | "tag";
  className?: string;
}

const STATUS_CONFIGS: Record<
  BookingStatus,
  { bg: string; text: string; label: string }
> = {
  Confirmed:  { bg: "bg-emerald-50", text: "text-emerald-700", label: "Đã xác nhận" },
  Pending:    { bg: "bg-amber-50",   text: "text-amber-700",   label: "Chờ duyệt" },
  Cancelled:  { bg: "bg-red-50",     text: "text-red-700",     label: "Đã hủy" },
  CheckedIn:  { bg: "bg-blue-50",    text: "text-blue-700",    label: "Đã nhận phòng" },
  CheckedOut: { bg: "bg-gray-50",    text: "text-gray-700",    label: "Đã trả phòng" },
};

const FALLBACK = { bg: "bg-gray-50", text: "text-gray-700" };

export function StatusBadge({
  status,
  variant = "pill",
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status as BookingStatus] ?? {
    ...FALLBACK,
    label: status,
  };
  return (
    <span
      className={cn(
        "px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-transparent",
        variant === "pill" ? "rounded-full" : "rounded-lg",
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;
```

- [ ] **Step 2: Tạo barrel export `fontend/src/components/admin/index.ts`**

```ts
export { StatusBadge } from "./StatusBadge";
```

- [ ] **Step 3: Xóa local `StatusBadge` và import shared trong từng file**

Trong mỗi file dưới, xóa function `StatusBadge` ở cuối file và thêm import:

```tsx
// Thêm vào đầu file (sau các import hiện có)
import { StatusBadge } from "../../components/admin";
```

Files cần sửa:
- `pages/Admin/AdminDashboard.tsx` — xóa `function StatusBadge(...)` ở dưới cùng
- `pages/Admin/AdminBookingsPage.tsx` — xóa `function StatusBadge(...)`
- `pages/Admin/AdminCalendar.tsx` — xóa cả 2 `StatusBadge` (trang + modal)
- `pages/BookingDetailPage.tsx` — xóa local `StatusBadge` (dùng variant="pill")
- `pages/Admin/AdminUsers.tsx` — giữ `RoleBadge` (khác), xóa chỉ `StatusBadge`

> **Lưu ý `AdminCalendar`:** Local dùng `rounded-lg` thay vì `rounded-full`. Khi replace, truyền `variant="tag"`.

- [ ] **Step 4: Verify build không lỗi**

```bash
cd fontend && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add fontend/src/components/admin/
git add fontend/src/pages/Admin/AdminDashboard.tsx
git add fontend/src/pages/Admin/AdminBookingsPage.tsx
git add fontend/src/pages/Admin/AdminCalendar.tsx
git add fontend/src/pages/BookingDetailPage.tsx
git add fontend/src/pages/Admin/AdminUsers.tsx
git commit -m "refactor: extract StatusBadge to shared admin component"
```

---

## Task 2: `AdminPageHeader` shared component

**Files:**
- Create: `fontend/src/components/admin/AdminPageHeader.tsx`
- Modify: 6 admin pages

**Context:** Mỗi admin page có một `<header>` block với cấu trúc giống hệt nhau:
```tsx
<header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b ...">
  <div>
    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-2 block">
      {eyebrow}
    </span>
    <h1 className="font-serif text-3xl font-bold ...">{title}</h1>
    <p className="text-[var(--color-text-secondary)] text-sm mt-2">{subtitle}</p>
  </div>
  {/* optional right-side actions */}
</header>
```

- [ ] **Step 1: Tạo `AdminPageHeader.tsx`**

```tsx
// fontend/src/components/admin/AdminPageHeader.tsx
import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[var(--color-border)]">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-2 block">
          {eyebrow}
        </span>
        <h1 className="font-serif text-3xl font-bold text-[var(--color-text-primary)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[var(--color-text-secondary)] text-sm mt-2">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}

export default AdminPageHeader;
```

- [ ] **Step 2: Update barrel export**

```ts
// fontend/src/components/admin/index.ts
export { StatusBadge } from "./StatusBadge";
export { AdminPageHeader } from "./AdminPageHeader";
```

- [ ] **Step 3: Replace header block trong 6 files**

Trong mỗi file, xóa `<header>...</header>` block và replace bằng:

**AdminBookingsPage.tsx:**
```tsx
<AdminPageHeader
  eyebrow="Hệ thống quản trị"
  title="Quản lý Đặt phòng"
  subtitle="Theo dõi, phê duyệt và thực hiện quy trình Check-in/Check-out cho khách hàng."
/>
```

**AdminCalendar.tsx:**
```tsx
<AdminPageHeader
  eyebrow="Quản lý vận hành"
  title="Lịch Booking"
  subtitle="Theo dõi tình trạng trống/đầy phòng, quản lý lịch check-in/check-out trực quan."
  actions={
    <>
      {loading && <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary-dark)]" />}
      <div className="flex bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-1 shadow-sm">
        {(["month", "week", "day"] as View[]).map((v) => (
          <button key={v} onClick={() => setView(v)} className={cn(...)}>
            {v === "month" ? "Tháng" : v === "week" ? "Tuần" : "Ngày"}
          </button>
        ))}
      </div>
    </>
  }
/>
```

**AdminRoomTypesPage.tsx, AdminRoomsPage.tsx, AdminPricingRulesPage.tsx, AdminReportsPage.tsx, AdminReviews.tsx, AdminUsers.tsx:** tương tự — extract eyebrow/title/subtitle từ local header, đặt actions nếu có.

- [ ] **Step 4: Verify build**

```bash
cd fontend && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add fontend/src/components/admin/
git add fontend/src/pages/Admin/
git commit -m "refactor: extract AdminPageHeader to shared component"
```

---

## Task 3: `AlertMessage` shared component

**Files:**
- Create: `fontend/src/components/admin/AlertMessage.tsx`
- Modify: `AdminBookingsPage`, `AdminRoomTypesPage`, `AdminRoomsPage`, `AdminPricingRulesPage`

**Context:** Pattern này lặp lại ở 4 pages:
```tsx
{error && (
  <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
    <SomeIcon className="w-5 h-5 flex-shrink-0" />
    <p className="text-sm font-medium">{error}</p>
  </div>
)}
{message && (
  <div className="bg-emerald-50 text-emerald-700 ...">
    ...
  </div>
)}
```

- [ ] **Step 1: Tạo `AlertMessage.tsx`**

```tsx
// fontend/src/components/admin/AlertMessage.tsx
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "../ui/utils";

interface AlertMessageProps {
  error?: string | null;
  success?: string | null;
  className?: string;
}

export function AlertMessage({ error, success, className }: AlertMessageProps) {
  if (!error && !success) return null;
  return (
    <div className={cn("space-y-2 animate-in slide-in-from-top-2 duration-300", className)}>
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update barrel export**

```ts
export { StatusBadge } from "./StatusBadge";
export { AdminPageHeader } from "./AdminPageHeader";
export { AlertMessage } from "./AlertMessage";
```

- [ ] **Step 3: Replace alert blocks trong 4 files**

Ví dụ trong `AdminBookingsPage.tsx`:
```tsx
// Trước:
{error && <div className="bg-red-50 ..."><XCircle .../><p>{error}</p></div>}
{message && <div className="bg-emerald-50 ..."><CheckCircle2 .../><p>{message}</p></div>}

// Sau:
<AlertMessage error={error} success={message} />
```

Rename state `message` → `success` hoặc dùng prop `success={message}` tùy file.

- [ ] **Step 4: Commit**

```bash
git add fontend/src/components/admin/
git add fontend/src/pages/Admin/AdminBookingsPage.tsx
git add fontend/src/pages/Admin/AdminRoomTypesPage.tsx
git add fontend/src/pages/Admin/AdminRoomsPage.tsx
git add fontend/src/pages/Admin/AdminPricingRulesPage.tsx
git commit -m "refactor: extract AlertMessage to shared admin component"
```

---

## Task 4: `useAdminData` custom hook

**Files:**
- Create: `fontend/src/hooks/useAdminData.ts`
- Modify: `AdminBookingsPage`, `AdminRoomTypesPage`, `AdminRoomsPage`, `AdminPricingRulesPage`

**Context:** Pattern `load/error/loading/message` với async fetch lặp lại giống nhau ở 4+ pages. Ví dụ từ `AdminBookingsPage`:
```tsx
const [bookings, setBookings] = useState<Booking[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [message, setMessage] = useState<string | null>(null);

const loadBookings = async () => {
  setError(null); setMessage(null); setLoading(true);
  try {
    const res = await apiRequest<...>("/api/bookings", "GET", undefined, { auth: true });
    setBookings(res.data);
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setLoading(false);
  }
};
useEffect(() => { void loadBookings(); }, []);
```

- [ ] **Step 1: Tạo `useAdminData.ts`**

```ts
// fontend/src/hooks/useAdminData.ts
import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../api/client";
import type { HttpMethod } from "../api/client";

interface UseAdminDataOptions<T> {
  path: string;
  method?: HttpMethod;
  /** Chạy fetch ngay khi mount */
  immediate?: boolean;
}

interface UseAdminDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
  reload: () => Promise<void>;
}

export function useAdminData<T>({
  path,
  method = "GET",
  immediate = true,
}: UseAdminDataOptions<T>): UseAdminDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; data: T }>(
        path,
        method,
        undefined,
        { auth: true }
      );
      setData(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [path, method]);

  useEffect(() => {
    if (immediate) void reload();
  }, [reload, immediate]);

  return { data, loading, error, success, setError, setSuccess, reload };
}
```

- [ ] **Step 2: Apply hook trong `AdminBookingsPage.tsx`**

```tsx
// Trước: 15+ lines của useState + loadBookings + useEffect
// Sau:
const {
  data: bookings,
  loading,
  error,
  success: message,
  setError,
  setSuccess: setMessage,
  reload: loadBookings,
} = useAdminData<Booking[]>({ path: "/api/bookings" });

// Dùng bình thường, bookings có thể null khi loading
const bookingList = bookings ?? [];
```

- [ ] **Step 3: Apply trong `AdminRoomTypesPage.tsx`**

Page này load 1 list — pattern giống hệt. Thêm `useAdminData` cho room types.

- [ ] **Step 4: Verify behavior không đổi**

Mở browser, vào `/admin/bookings` — list vẫn load, check-in/check-out actions vẫn hoạt động.

- [ ] **Step 5: Commit**

```bash
git add fontend/src/hooks/useAdminData.ts
git add fontend/src/pages/Admin/AdminBookingsPage.tsx
git add fontend/src/pages/Admin/AdminRoomTypesPage.tsx
git commit -m "refactor: extract useAdminData hook for load/error pattern"
```

---

## Task 5: Mở rộng `admin.api.ts`

**Files:**
- Modify: `fontend/src/api/admin.api.ts`

**Context:** Hiện tại `admin.api.ts` chỉ có `getDashboardStats`. Tất cả các admin call khác dùng `apiRequest` trực tiếp trong component — vi phạm convention đã ghi trong `docs/conventions.md` ("API calls đặt trong /services/ — không gọi axios trực tiếp trong component").

- [ ] **Step 1: Thêm typed functions vào `admin.api.ts`**

```ts
// Append vào fontend/src/api/admin.api.ts

// ── Bookings ──
export interface Booking {
  _id: string;
  status: string;
  paymentStatus: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}

export const getAdminBookings = () =>
  apiRequest<{ success: boolean; data: Booking[] }>("/api/bookings", "GET", undefined, { auth: true });

export const checkInBooking = (id: string) =>
  apiRequest(`/api/bookings/${id}/check-in`, "POST", null, { auth: true });

export const checkOutBooking = (id: string) =>
  apiRequest(`/api/bookings/${id}/check-out`, "POST", null, { auth: true });

// ── Calendar ──
export interface CalendarData {
  roomId: string;
  roomName: string;
  roomNumber: string;
  bookings: {
    bookingId: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: string;
  }[];
}

export const getCalendarBookings = (startDate: string, endDate: string) =>
  apiRequest<{ success: boolean; data: CalendarData[] }>(
    `/api/admin/bookings/calendar?startDate=${startDate}&endDate=${endDate}`,
    "GET",
    undefined,
    { auth: true }
  );

// ── Users ──
export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "admin" | "staff";
  isActive: boolean;
  createdAt: string;
}

export const getAdminUsers = (page: number, limit: number, search: string) =>
  apiRequest<{ success: boolean; data: AdminUser[]; totalCount: number }>(
    `/api/admin/users?page=${page}&limit=${limit}&search=${search}`,
    "GET",
    undefined,
    { auth: true }
  );

export const updateUserRole = (userId: string, role: string) =>
  apiRequest(`/api/admin/users/${userId}/role`, "PATCH", { role }, { auth: true });

export const updateUserStatus = (userId: string, isActive: boolean) =>
  apiRequest(`/api/admin/users/${userId}/status`, "PATCH", { isActive }, { auth: true });
```

- [ ] **Step 2: Update `AdminBookingsPage` để dùng typed functions**

```tsx
// Trước:
await apiRequest(`/api/bookings/${id}/check-in`, "POST", null, { auth: true });

// Sau:
import { getAdminBookings, checkInBooking, checkOutBooking } from "../../api/admin.api";
await checkInBooking(id);
```

- [ ] **Step 3: Update `AdminUsers.tsx`**

```tsx
import { getAdminUsers, updateUserRole, updateUserStatus } from "../../api/admin.api";

// Thay toàn bộ apiRequest calls bằng typed functions
const res = await getAdminUsers(page, limit, search);
await updateUserRole(userId, newRole);
await updateUserStatus(userId, !currentStatus);
```

- [ ] **Step 4: TypeScript check**

```bash
cd fontend && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add fontend/src/api/admin.api.ts
git add fontend/src/pages/Admin/AdminBookingsPage.tsx
git add fontend/src/pages/Admin/AdminUsers.tsx
git commit -m "refactor: expand admin.api.ts with typed functions per conventions"
```

---

## Tổng kết

Sau khi hoàn thành 5 tasks:

| Metric | Before | After |
|--------|--------|-------|
| `StatusBadge` definitions | 5 | 1 |
| Page header blocks | 6 copies | 1 component |
| Alert JSX blocks | 4 copies | 1 component |
| `load/error/loading` useState | 4+ duplicates | 1 hook |
| Raw `apiRequest` calls in admin pages | ~15 | 0 |

**Không có breaking changes** — UI/UX giữ nguyên 100%. Tất cả refactor là pure extraction.

---

## Prompt gợi ý cho Cursor / Claude Code

Dùng prompt này khi mở plan trong agent:

```
Implement task [N] from this plan exactly as written.
- Read the "Context" block first to understand what you're replacing.
- Do NOT change any className, UI logic, or business behavior.
- After each file change, run `npx tsc --noEmit` to verify.
- Commit only the files listed in the task's git command.
```

import { HashRouter , Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RoomsPage from "./pages/SearchRoom";
import RoomDetail from "./pages/RoomDetail";
import NotFoundPage from "./pages/NotFoundPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookingsPage from "./pages/Admin/AdminBookingsPage";
import AdminRoomTypesPage from "./pages/Admin/AdminRoomTypesPage";
import AdminRoomsPage from "./pages/Admin/AdminRoomsPage";
import AdminPricingRulesPage from "./pages/Admin/AdminPricingRulesPage";
import AdminReportsPage from "./pages/Admin/AdminReportsPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminCalendar from "./pages/Admin/AdminCalendar";
import AdminReviews from "./pages/Admin/AdminReviews";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { CartProvider } from "./context/CartContext";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import BookingDetailPage from "./pages/BookingDetailPage";
import NotificationsPage from "./pages/NotificationsPage";
import FAQPage from "./pages/FAQPage";
import PolicyPage from "./pages/PolicyPage";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <DataProvider>
          <HashRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/roomdetail/:id" element={<RoomDetail />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/policy" element={<PolicyPage />} />

              {/* PUBLIC */}
              <Route path="/payment/result" element={<PaymentSuccessPage />} />
              <Route path="/payment/cancel" element={<PaymentCancelPage />} />

              {/* PROTECTED */}
              <Route element={<ProtectedRoute roles={["user", "admin", "staff"]} />}>
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/my-bookings/:id" element={<BookingDetailPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route element={<ProtectedRoute roles={["admin", "staff"]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                <Route path="/admin/room-types" element={<AdminRoomTypesPage />} />
                <Route path="/admin/rooms" element={<AdminRoomsPage />} />
                <Route
                  path="/admin/pricing-rules"
                  element={<AdminPricingRulesPage />}
                />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/calendar" element={<AdminCalendar />} />
              </Route>

              <Route element={<ProtectedRoute roles={["admin"]} />}>
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
        </DataProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
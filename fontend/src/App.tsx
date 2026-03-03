import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RoomsPage from "./pages/RoomsPage";
import NotFoundPage from "./pages/NotFoundPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminRoomTypesPage from "./pages/AdminRoomTypesPage";
import AdminRoomsPage from "./pages/AdminRoomsPage";
import AdminPricingRulesPage from "./pages/AdminPricingRulesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute roles={["user", "admin", "staff"]} />}>
              <Route path="/my-bookings" element={<MyBookingsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["admin", "staff"]} />}>
              <Route path="/admin/bookings" element={<AdminBookingsPage />} />
              <Route path="/admin/room-types" element={<AdminRoomTypesPage />} />
              <Route path="/admin/rooms" element={<AdminRoomsPage />} />
              <Route
                path="/admin/pricing-rules"
                element={<AdminPricingRulesPage />}
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
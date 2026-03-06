import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RoomsPage from "./pages/SearchRoom";
import RoomDetail from "./pages/RoomDetail";
import NotFoundPage from "./pages/NotFoundPage";
import MyBookingsPage from "./pages/User/MyBookingsPage";
import AdminBookingsPage from "./pages/Admin/AdminBookingsPage";
import AdminRoomTypesPage from "./pages/Admin/AdminRoomTypesPage";
import AdminRoomsPage from "./pages/Admin/AdminRoomsPage";
import AdminPricingRulesPage from "./pages/Admin/AdminPricingRulesPage";
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
            <Route path="/roomdetail/:id" element={<RoomDetail />} />
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
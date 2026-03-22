import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600/95 text-white backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          HotelBooking
        </Link>

        <div className="space-x-4 flex items-center text-sm">
          <Link to="/rooms" className="hover:text-blue-100">
            Tìm phòng
          </Link>
          {user && (
            <>
              <Link to="/my-bookings" className="hover:text-blue-100">
                Booking của tôi
              </Link>
              <Link to="/profile" className="hover:text-blue-100">
                Hồ sơ
              </Link>
              {(user.role === "admin" || user.role === "staff") && (
                <>
                  <Link to="/admin/bookings" className="hover:text-blue-100">
                    Quản lý booking
                  </Link>
                  <Link to="/admin/room-types" className="hover:text-blue-100">
                    Loại phòng
                  </Link>
                  <Link to="/admin/rooms" className="hover:text-blue-100">
                    Phòng
                  </Link>
                  <Link
                    to="/admin/pricing-rules"
                    className="hover:text-blue-100"
                  >
                    Giá theo mùa
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin/users" className="hover:text-blue-100">
                      Quản lý user
                    </Link>
                  )}
                  <Link to="/admin/reviews" className="hover:text-blue-100">
                    Đánh giá
                  </Link>
                  <Link to="/admin/calendar" className="hover:text-blue-100">
                    Lịch phòng
                  </Link>
                  <Link to="/admin/reports" className="hover:text-blue-100">
                    Báo cáo
                  </Link>
                </>
              )}
              <NotificationBell />
              <span className="text-sm text-blue-100 font-bold border-l border-white/20 pl-4">
                {user.fullName} ({user.role})
              </span>
              <button
                onClick={logout}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm"
              >
                Đăng xuất
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="hover:text-blue-100">
                Đăng nhập
              </Link>
              <Link to="/register" className="hover:text-blue-100">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
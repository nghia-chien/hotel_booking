import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="space-y-12">
      <section className="grid gap-10 md:grid-cols-2 items-center">
        <div>
          <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase mb-3">
            Smart Hotel Booking
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Đặt phòng khách sạn
            <span className="text-blue-600"> nhanh chóng</span> và{" "}
            <span className="text-blue-600">an toàn</span>.
          </h1>
          <p className="text-gray-600 mb-6">
            Tìm kiếm phòng theo ngày, giá, sức chứa và loại phòng. Quản lý
            booking, check-in / check-out và giá theo mùa trên một nền tảng duy
            nhất.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/rooms"
              className="px-5 py-3 rounded-lg bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition"
            >
              Bắt đầu tìm phòng
            </Link>
            <Link
              to="/login"
              className="px-5 py-3 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-100 transition"
            >
              Đăng nhập quản lý booking
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-400 shadow-xl flex items-center justify-center text-white">
            <div className="space-y-4 px-8">
              <p className="text-lg font-semibold">
                Trạng thái phòng theo thời gian thực
              </p>
              <p className="text-sm text-blue-50">
                Không còn lo over-booking. Hệ thống tự động kiểm tra trùng
                lịch, chính sách huỷ và giá theo mùa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Đặt phòng trực tuyến</h3>
          <p className="text-sm text-gray-600">
            Tìm kiếm theo ngày nhận / trả phòng, sức chứa, giá và loại phòng.
            Thanh toán mock, theo dõi booking cá nhân.
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Quản lý giá theo mùa</h3>
          <p className="text-sm text-gray-600">
            Thiết lập pricing rules theo khoảng ngày, cuối tuần / ngày lễ, tự
            động tính tổng tiền khi đặt phòng.
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Dashboard cho Admin</h3>
          <p className="text-sm text-gray-600">
            CRUD phòng, loại phòng, pricing rules. Quản lý booking, check-in /
            check-out và xem occupancy rate.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
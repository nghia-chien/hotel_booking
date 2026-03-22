import { ShieldCheck, BookOpen, Clock, Archive } from "lucide-react";

const PolicySection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => {
  return (
    <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4 hover:shadow-xl hover:scale-[1.01] transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors"></div>
      <h2 className="flex items-center gap-3 text-2xl font-black text-gray-900 leading-none">
        <Icon className="w-8 h-8 text-blue-600 p-1.5 bg-blue-50 rounded-xl" />
        {title}
      </h2>
      <div className="space-y-4 text-gray-600 leading-relaxed text-sm lg:text-base relative z-10 pl-11">
        {children}
      </div>
    </section>
  );
};

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
          <BookOpen className="w-4 h-4" /> Chính sách
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Chính sách & Quy định</h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed italic">
          Các điều khoản và quy định nhằm bảo vệ quyền lợi của khách hàng và đảm bảo chất lượng dịch vụ tốt nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <PolicySection title="Chính sách đặt phòng" icon={Clock}>
          <ul className="list-disc space-y-3">
            <li>Mọi yêu cầu đặt phòng sẽ được hệ thống xác nhận ngay lập tức nếu còn phòng trống và quý khách hoàn tất thủ tục thanh toán.</li>
            <li>Hệ thống sẽ giữ phòng cho quý khách trong vòng tối đa <span className="font-bold text-blue-600">30 phút</span> kể từ khi tạo booking. Nếu sau thời gian này quý khách chưa thanh toán, booking sẽ tự động bị huỷ.</li>
            <li>Thông tin xác nhận booking sẽ được gửi qua email của quý khách ngay sau khi giao dịch thành công.</li>
          </ul>
        </PolicySection>

        <PolicySection title="Chính sách huỷ phòng" icon={ShieldCheck}>
          <div className="space-y-4 bg-red-50/30 p-6 rounded-2xl border border-red-100">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 bg-red-500 rounded-full"></div>
              <p><span className="font-bold text-gray-900">Huỷ phòng trước 24 giờ:</span> Quý khách sẽ được hoàn tiền 100% qua cổng VNPay. Thời gian xử lý từ 3-5 ngày làm việc tuỳ hệ thống ngân hàng.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 bg-red-500 rounded-full"></div>
              <p><span className="font-bold text-gray-900">Huỷ phòng trong vòng 24 giờ:</span> Chúng tôi rất tiếc không thể hoàn hoàn tiền cho các trường hợp huỷ gấp sau thời gian trên.</p>
            </div>
            <div className="flex items-start gap-4 border-t border-red-100 pt-4">
              <div className="w-2 h-2 mt-2 bg-red-500 rounded-full"></div>
              <p><span className="font-bold text-gray-900 italic">No-show:</span> Nếu quý khách không đến nhận phòng mà không có thông báo huỷ trước đó, phí phạt sẽ tương đương với giá trị 1 đêm nghỉ đầu tiên hoặc toàn bộ booking tùy vào quy định cụ thể.</p>
            </div>
          </div>
        </PolicySection>

        <PolicySection title="Chính sách check-in / check-out" icon={Archive}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-2xl outline outline-1 outline-blue-100/50">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <span className="text-xs font-black uppercase tracking-widest text-blue-500">Giờ nhận phòng</span>
              <p className="text-2xl font-bold mt-1">Từ 14:00</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm text-right md:text-left">
              <span className="text-xs font-black uppercase tracking-widest text-blue-500">Giờ trả phòng</span>
              <p className="text-2xl font-bold mt-1">Trước 12:00</p>
            </div>
          </div>
          <p className="mt-4 italic text-sm">Việc nhận phòng sớm hoặc trả phòng muộn sau khung giờ trên sẽ bị tính phụ phí nghỉ thêm <span className="font-bold text-blue-600">50% giá 1 đêm</span> (tuỳ thuộc vào tình trạng phòng trống tại thời điểm đó).</p>
        </PolicySection>

        <PolicySection title="Chính sách bảo mật" icon={ShieldCheck}>
          <p>Tại Hotel Booking, chúng tôi cam kết tuyệt đối về an toàn dữ liệu khách hàng:</p>
          <ul className="list-disc space-y-3 mt-3">
            <li>Toàn bộ thông tin cá nhân và tài khoản thanh toán được mã hoá theo chuẩn bảo mật SSL cao nhất.</li>
            <li>Chúng tôi cam kết không chia sẻ hoặc cung cấp thông tin của quý khách cho bất kỳ bên thứ ba nào trừ trường hợp có yêu cầu từ cơ quan chức năng có thẩm quyền.</li>
            <li>Quý khách có toàn quyền quản lý, sửa đổi hoặc yêu cầu xoá thông tin cá nhân của mình trực tiếp trong mục Hồ sơ.</li>
          </ul>
        </PolicySection>
      </div>
    </div>
  );
}

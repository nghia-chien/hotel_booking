import { useState } from "react";
import { ChevronDown, HelpCircle, BookOpen, User, Zap } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  return (
    <div className="group border-b border-gray-100 last:border-0 shadow-sm transition-all hover:shadow-md rounded-2xl bg-white mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left transition-all"
      >
        <span className={`font-bold text-gray-900 transition-colors ${isOpen ? "text-blue-600" : "group-hover:text-blue-500"}`}>
          {question}
        </span>
        <div className={`p-1 rounded-full transition-all duration-300 ${isOpen ? "bg-blue-50 text-blue-600 rotate-180" : "bg-gray-50 text-gray-400"}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="p-5 pt-0 text-gray-600 leading-relaxed text-sm bg-blue-50/20 rounded-b-2xl">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  const sections = [
    {
      title: "Đặt phòng",
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        {
          id: "dp-1",
          q: "Tôi có thể huỷ booking không?",
          a: "Có. Nếu bạn huỷ trước 24h so với ngày Check-in, bạn sẽ được hoàn 100% số tiền đã thanh toán. Nếu huỷ trong vòng 24h, chúng tôi rất tiếc không thể hoàn tiền."
        },
        {
          id: "dp-2",
          q: "Thanh toán được những phương thức nào?",
          a: "Chúng tôi hỗ trợ thanh toán qua cổng VNPay, bao gồm: Thẻ ATM nội địa, Quét mã QR, Thẻ Visa/Mastercard."
        },
        {
          id: "dp-3",
          q: "Check-in sớm/muộn có được không?",
          a: "Bạn hoàn toàn có thể check-in sớm hoặc muộn tùy vào tình trạng phòng trống. Tuy nhiên, vui lòng liên hệ bộ phận lễ tân trước ít nhất 6 tiếng để được hỗ trợ tốt nhất."
        }
      ]
    },
    {
      title: "Tài khoản",
      icon: <User className="w-5 h-5" />,
      items: [
        {
          id: "tk-1",
          q: "Quên mật khẩu làm thế nào?",
          a: "Bạn có thể sử dụng chức năng 'Quên mật khẩu' tại trang Đăng nhập. Một email hướng dẫn đặt lại mật khẩu sẽ được gửi đến hòm thư của bạn."
        },
        {
          id: "tk-2",
          q: "Đổi thông tin cá nhân ở đâu?",
          a: "Sau khi đăng nhập, hãy truy cập vào mục 'Hồ sơ' trên thanh menu chính. Tại đây bạn có thể cập nhật thông tin cá nhân và ảnh đại diện."
        }
      ]
    },
    {
      title: "Phòng & Dịch vụ",
      icon: <Zap className="w-5 h-5" />,
      items: [
        {
          id: "pd-1",
          q: "Phòng có wifi không?",
          a: "Tất cả các phòng và khu vực sảnh chờ đều được trang bị Wifi tốc độ cao hoàn toàn miễn phí."
        },
        {
          id: "pd-2",
          q: "Cho thú cưng không?",
          a: "Vì lý do vệ sinh và tránh dị ứng cho các khách hàng khác, khách sạn hiện chưa cho phép mang theo thú cưng."
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
          <HelpCircle className="w-4 h-4" /> FAQ
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Câu hỏi thường gặp</h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
          Chúng tôi đã tổng hợp những thắc mắc phổ biến nhất để giúp bạn có trải nghiệm đặt phòng và lưu trú thuận tiện nhất.
        </p>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title} className="space-y-6">
            <h2 className="flex items-center gap-2.5 text-xl font-bold text-gray-800 italic border-l-4 border-blue-600 pl-4">
              {section.icon}
              {section.title}
            </h2>
            <div className="grid grid-cols-1 gap-1">
              {section.items.map((item) => (
                <FAQItem
                  key={item.id}
                  question={item.q}
                  answer={item.a}
                  isOpen={openIndex === item.id}
                  onToggle={() => toggle(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-3xl p-8 text-center text-white space-y-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
        <h3 className="text-2xl font-bold relative z-10">Vẫn còn thắc mắc?</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto relative z-10">
          Đừng ngần ngại liên hệ với chúng tôi qua Hotline hoặc Email để được giải đáp trực tiếp 24/7.
        </p>
        <div className="flex flex-wrap justify-center gap-4 relative z-10">
          <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Hotline: 1900 1234
          </div>
          <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-sm font-bold">
            Email: help@hotel.com
          </div>
        </div>
      </div>
    </div>
  );
}

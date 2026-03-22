import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t mt-16 py-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-gray-600">
        <div className="space-y-2 text-center md:text-left">
          <p className="font-bold text-gray-900 tracking-wide uppercase text-xs">© 2026 Hotel Booking System</p>
          <p className="opacity-60 italic">Giải pháp quản lý đặt phòng chuyên nghiệp và hiện đại.</p>
        </div>
        
        <div className="flex gap-8 font-black uppercase tracking-tighter text-xs">
          <Link to="/faq" className="hover:text-blue-600 transition-colors">FAQ - Hỏi đáp</Link>
          <Link to="/policy" className="hover:text-blue-600 transition-colors">Chính sách & Quy định</Link>
        </div>
        
        <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Version 1.0.4-LTS</p>
      </div>
    </footer>
  );
};

export default Footer;
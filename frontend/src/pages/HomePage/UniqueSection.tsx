import { useTranslation } from 'react-i18next';
import { Star, BadgeCheck, Shield, RefreshCw, Sparkles, Award, HeartHandshake } from 'lucide-react';

const SELLING_POINTS = [
  {
    Icon: Star,
    iconBg: 'bg-amber-500/10 text-amber-600 border-amber-200/60',
    titleKey: 'uniqueSection.points.quality.title',
    titleFallback: 'Tiêu chuẩn 5 sao vượt trội',
    descKey: 'uniqueSection.points.quality.desc',
    descFallback: 'Mỗi phòng và dịch vụ đều được kiểm định khắt khe để đảm bảo trải nghiệm trọn vẹn nhất.',
    badge: 'Cam kết chất lượng',
  },
  {
    Icon: BadgeCheck,
    iconBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60',
    titleKey: 'uniqueSection.points.price.title',
    titleFallback: 'Giá tốt nhất & Minh bạch',
    descKey: 'uniqueSection.points.price.desc',
    descFallback: 'Mức giá trực tiếp từ khách sạn, không phí ẩn và luôn có ưu đãi độc quyền dành cho thành viên.',
    badge: null,
  },
  {
    Icon: Shield,
    iconBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/60',
    titleKey: 'uniqueSection.points.secure.title',
    titleFallback: 'Bảo mật & Thanh toán an toàn',
    descKey: 'uniqueSection.points.secure.desc',
    descFallback: 'Hỗ trợ đa dạng phương thức thanh toán an toàn qua cổng VNPay đạt chuẩn quốc tế.',
    badge: null,
  },
  {
    Icon: RefreshCw,
    iconBg: 'bg-sky-500/10 text-sky-600 border-sky-200/60',
    titleKey: 'uniqueSection.points.refund.title',
    titleFallback: 'Chính sách hoàn hủy linh hoạt',
    descKey: 'uniqueSection.points.refund.desc',
    descFallback: 'Dễ dàng thay đổi kế hoạch chuyến đi với chính sách hỗ trợ hoàn tiền rõ ràng và nhanh gọn.',
    badge: null,
  },
];

const STATS = [
  { number: '1,000+', label: 'Phòng nghỉ cao cấp', sub: 'Tuyển chọn khắp toàn quốc', color: 'from-amber-500 to-amber-600' },
  { number: '124K+', label: 'Khách hàng hài lòng', sub: 'Tin tưởng và đồng hành', color: 'from-emerald-500 to-teal-600' },
  { number: '4.9★', label: 'Đánh giá trung bình', sub: 'Dựa trên hơn 80.000 nhận xét', color: 'from-indigo-500 to-blue-600' },
  { number: '99.8%', label: 'Hài lòng về dịch vụ', sub: 'Hỗ trợ khách hàng 24/7', color: 'from-purple-500 to-pink-600' },
];

export default function UniqueSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 -left-48 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-48 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('uniqueSection.eyebrow', 'Giá trị độc bản')}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
              {t('uniqueSection.title', 'Vì sao hàng ngàn du khách luôn chọn chúng tôi?')}
            </h2>
            <p className="text-slate-500 text-base mb-10 max-w-2xl">
              Chúng tôi mang đến giải pháp lưu trú hoàn hảo kết hợp giữa công nghệ đặt phòng tiện lợi và chất lượng phục vụ chuẩn mực 5 sao.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {SELLING_POINTS.map(({ Icon, iconBg, titleKey, titleFallback, descKey, descFallback, badge }) => (
                <div
                  key={titleKey}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${iconBg} shadow-2xs group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        {badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-amber-600 transition-colors">
                    {t(titleKey, titleFallback)}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t(descKey, descFallback)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT STATS SHOWCASE */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-6 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Thành tựu & Cam kết</span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-white mb-2">
                Đồng hành cùng những chuyến đi trọn vẹn
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-8">
                Tự hào là đối tác tin cậy của hàng trăm thương hiệu khách sạn và khu nghỉ dưỡng hàng đầu.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {STATS.map(({ number, label, sub }) => (
                  <div
                    key={label}
                    className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <p className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-300">
                      {number}
                    </p>
                    <p className="text-xs font-bold text-white mt-1">
                      {label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {sub}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-300">
                  Cam kết bảo vệ quyền lợi du khách 100% trong mọi tình huống phát sinh.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
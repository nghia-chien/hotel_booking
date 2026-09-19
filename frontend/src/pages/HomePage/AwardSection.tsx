import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import StarRating from '../../components/ui/StarRating';

export default function AwardSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const perks = [
    'Dịch vụ quản gia riêng 24/7 và xe đưa đón hạng sang',
    'Bữa sáng tiêu chuẩn ẩm thực quốc tế 5 sao miễn phí',
    'Quyền sử dụng độc quyền hồ bơi vô cực trên tầng thượng',
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-32 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{t('awardSection.eyebrow', 'Khu nghỉ dưỡng được vinh danh quốc tế')}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.2] mb-6">
              {t('awardSection.title', 'Trải nghiệm đỉnh cao được thế giới công nhận')}
            </h2>

            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed font-light">
              {t(
                'awardSection.subtitle',
                'Hơn cả một nơi lưu trú, chúng tôi kiến tạo những khoảnh khắc nghỉ dưỡng riêng tư, tinh tế và đáng nhớ nhất trong đời bạn.'
              )}
            </p>

            {/* PERKS LIST */}
            <div className="space-y-3 mb-10">
              {perks.map((perk, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-sm text-slate-200">{perk}</span>
                </div>
              ))}
            </div>

            {/* STATS COUNTERS */}
            <div className="flex items-center gap-8 sm:gap-12 pt-6 border-t border-slate-800">
              <div>
                <p className="font-serif text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                  15+
                </p>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Năm phục vụ thượng khách</p>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div>
                <p className="font-serif text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                  50+
                </p>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Giải thưởng du lịch toàn cầu</p>
              </div>
            </div>
          </div>

          {/* RIGHT SHOWCASE CARD */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50 group relative">
              {/* IMAGE SHOWCASE */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
                  alt="Presidential Luxury Villa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                {/* AWARD FLOATING BADGE */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-bold shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    World Luxury Stay 2025
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-base font-bold text-white drop-shadow-sm">
                      Presidential Ocean Villa
                    </h3>
                    <p className="text-xs text-slate-300">Biệt thự Tổng Thống Hướng Biển</p>
                  </div>
                  <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700">
                    <StarRating rating={5.0} size="sm" showValue />
                  </div>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
                  <span>Diện tích 120m² · 2 Phòng ngủ</span>
                  <span className="text-emerald-400 font-semibold">Tầm nhìn 360°</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">Giá ưu đãi đặc quyền</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xs text-amber-400 font-bold">$</span>
                      <span className="font-serif text-2xl font-bold text-white">350</span>
                      <span className="text-xs text-slate-400">/đêm</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/rooms')}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <span>Khám phá ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
import type { PropertySearchParams } from '../../types/property';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BookingSearchForm from '../../components/search/BookingSearchForm';
import bg from '@/assets/bg.jpg';
import { Sparkles, ShieldCheck, Zap, Headphones, Compass } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (params: PropertySearchParams) => void;
  loading: boolean;
}

export default function HeroSection({ onSearch, loading }: HeroSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const quickTags = [
    { label: '🏖️ Hướng biển', query: 'resort' },
    { label: '✨ Phòng Tổng Thống', query: 'suite' },
    { label: '🌿 Villa riêng tư', query: 'villa' },
    { label: '🏊 Hồ bơi vô cực', query: 'pool' },
  ];

  return (
    <section className="relative min-h-[680px] lg:min-h-[720px] flex flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-24">
      {/* BACKGROUND IMAGE & LUXURY OVERLAYS */}
      <div
        className="absolute inset-0 z-0 scale-105 transform motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Cinematic Dark Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-900/60 to-slate-950/90 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent z-0 pointer-events-none" />

      {/* Ambient glowing orbs */}
      <div className="absolute top-12 left-1/4 w-80 h-80 rounded-full bg-amber-400/15 blur-[120px] z-0 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-blue-500/15 blur-[140px] z-0 pointer-events-none" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 text-center max-w-5xl mx-auto w-full flex flex-col items-center">
        {/* TRUST BADGE */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-white text-xs font-semibold mb-6 shadow-lg shadow-black/20 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          <span className="tracking-wide">
            {t('hero.badge', '🎉 Hơn 124.000+ Kỳ nghỉ thượng lưu hoàn hảo')}
          </span>
        </div>

        {/* HERO TITLE */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15] mb-6 drop-shadow-md">
          {t('hero.title1', 'Kỳ nghỉ đẳng cấp tại các khu nghỉ dưỡng')}{' '}
          <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400">
            {t('hero.title2', 'Khách sạn sang trọng bậc nhất')}
          </span>
        </h1>

        {/* SUBTITLE */}
        <p className="text-slate-200/90 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          {t(
            'hero.subtitle',
            'Trải nghiệm không gian nghỉ dưỡng đỉnh cao với tiện nghi 5 sao, dịch vụ tận tâm và ưu đãi độc quyền dành riêng cho bạn.'
          )}
        </p>

        {/* SEARCH FORM CONTAINER */}
        <div className="w-full max-w-4xl shadow-2xl rounded-3xl">
          <BookingSearchForm
            variant="hero"
            onSearch={onSearch}
            loading={loading}
            className="w-full"
          />
        </div>

        {/* QUICK SEARCH TAGS */}
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap text-xs text-white/80">
          <span className="flex items-center gap-1 text-amber-300 font-semibold mr-1">
            <Compass className="w-3.5 h-3.5" /> Khám phá nhanh:
          </span>
          {quickTags.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => navigate('/rooms')}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-white/90 transition-all hover:scale-105 cursor-pointer"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* KEY VALUE PILLS */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 text-left max-w-3xl w-full">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">100% Đảm bảo giá tốt</p>
              <p className="text-[11px] text-slate-300">Không phí ẩn, minh bạch</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Xác nhận tức thì</p>
              <p className="text-[11px] text-slate-300">Nhận phòng nhanh chóng</p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Dịch vụ Concierge 24/7</p>
              <p className="text-[11px] text-slate-300">Hỗ trợ riêng theo yêu cầu</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import type { PropertySearchParams } from '../../types/property';
import BookingSearchForm from '../../components/search/BookingSearchForm';

interface HeroSectionProps {
  onSearch: (params: PropertySearchParams) => void;
  loading: boolean;
}

export default function HeroSection({ onSearch, loading }: HeroSectionProps) {
  return (
    <section className="relative min-h-[620px] flex flex-col items-center justify-center overflow-hidden px-4 py-20">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(135deg, #0d1b2a 0%, #1a2744 50%, #1e3a2f 100%)',
        }}
      />

      {/* Decorative Orbs */}
      <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-[var(--color-primary)]/10 blur-3xl z-0 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full bg-blue-400/10 blur-3xl z-0 pointer-events-none" />

      {/* CONTENT */}
      <div className="relative z-10 text-center max-w-4xl mx-auto w-full flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-8">
          <span>🎉</span> 124.8K+ Khách hàng hài lòng
        </div>

        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Nghỉ dưỡng tại những Resort tuyệt vời,
          <br />
          <span className="text-[var(--color-primary)]">
            Lưu trú trong Khách sạn sang trọng.
          </span>
        </h1>

        <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
          Tìm kiếm và đặt phòng nhanh chóng — hơn 1,000 lựa chọn phù hợp với mọi
          nhu cầu.
        </p>

        <BookingSearchForm
          variant="hero"
          onSearch={onSearch}
          loading={loading}
          className="w-full max-w-3xl"
        />
      </div>
    </section>
  );
}

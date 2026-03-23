import { useNavigate } from 'react-router-dom';
import StarRating from '../../components/ui/StarRating';

export default function AwardSection() {
  const navigate = useNavigate();

  return (
    <section
      className="relative py-20 overflow-hidden"
      style={{ backgroundColor: '#1A1A2E' }}
    >
      {/* Decorative */}
      <div
        className="absolute right-0 top-0 w-1/2 h-full pointer-events-none"
        style={{
          transform: 'skewX(-12deg)',
          background: 'rgba(255,255,255,0.02)',
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT CONTENT */}
          <div>
            <span className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest mb-4 block">
              Giải thưởng quốc tế
            </span>
            <h2 className="font-serif text-4xl font-bold text-white leading-tight mb-6">
              Được công nhận toàn cầu với các giải thưởng dịch vụ khách sạn xuất
              sắc.
            </h2>
            <p className="text-white/60 text-lg mb-10">
              Chúng tôi không chỉ cung cấp chỗ ở — chúng tôi tạo ra kỳ nghỉ đáng
              nhớ.
            </p>
            <div className="flex gap-12">
              {[
                { number: '15+', label: 'Năm kinh nghiệm' },
                { number: '50+', label: 'Giải thưởng' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-serif text-4xl font-bold text-[var(--color-primary)]">
                    {s.number}
                  </p>
                  <p className="text-white/60 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="flex justify-end">
            <div className="bg-white rounded-2xl overflow-hidden shadow-[var(--shadow-xl)] max-w-xs w-full">
              {/* Image placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-sky-200 via-teal-200 to-blue-300 flex items-center justify-center">
                <p className="text-slate-600 text-sm font-medium">
                  Moonlit Grove Lodge
                </p>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Moonlit Grove Lodge - Zurich
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Switzerland
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  4 khách · 2 phòng ngủ · 2 WC
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-[var(--color-text-primary)]">
                    $246/đêm
                  </span>
                  <StarRating rating={4.9} size="sm" showValue />
                </div>
                <button
                  onClick={() => navigate('/rooms')}
                  className="w-full mt-4 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-xl py-2.5 font-bold text-sm hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer"
                >
                  Đặt ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

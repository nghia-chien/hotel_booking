import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Quote, Sparkles, CheckCircle2 } from 'lucide-react';
import StarRating from '../../components/ui/StarRating';
import { cn } from '../../components/ui/utils';

const TESTIMONIALS = [
  {
    id: '1',
    quote: 'Kỳ nghỉ tuyệt vời nhất mà gia đình tôi từng có. Không gian villa sang trọng, đồ ăn tuyệt hảo và dịch vụ quản gia chu đáo đến từng chi tiết.',
    quoteKey: 'testimonials.list.0.quote',
    author: 'Nguyễn Thành Nam',
    authorKey: 'testimonials.list.0.author',
    location: 'Hà Nội · Đã ở Presidential Villa (5 đêm)',
    locationKey: 'testimonials.list.0.location',
    rating: 5,
    avatar: 'NN',
  },
  {
    id: '2',
    quote: 'Quy trình đặt phòng và thanh toán cực kỳ nhanh gọn. Khách sạn đúng y như hình ảnh, tầm nhìn hoàng hôn từ ban công phòng Suite vô cùng tráng lệ.',
    quoteKey: 'testimonials.list.1.quote',
    author: 'Trần Linh Chi',
    authorKey: 'testimonials.list.1.author',
    location: 'TP. Hồ Chí Minh · Đã ở Ocean Suite (3 đêm)',
    locationKey: 'testimonials.list.1.location',
    rating: 5,
    avatar: 'TL',
  },
  {
    id: '3',
    quote: 'Dịch vụ vượt trên cả sự mong đợi. Đội ngũ hỗ trợ 24/7 nhiệt tình, phòng ốc thơm tho và tiện nghi tiêu chuẩn 5 sao quốc tế.',
    quoteKey: 'testimonials.list.2.quote',
    author: 'Phạm Hoàng Long',
    authorKey: 'testimonials.list.2.author',
    location: 'Đà Nẵng · Đã ở Deluxe King (4 đêm)',
    locationKey: 'testimonials.list.2.location',
    rating: 5,
    avatar: 'PH',
  },
];

export default function TestimonialSection() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const current = TESTIMONIALS[activeIndex];

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* BADGE */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('testimonials.eyebrow', 'Cảm nhận từ khách hàng')}</span>
        </div>

        {/* TITLE */}
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-12">
          {t('testimonials.title', 'Những khoảnh khắc đáng nhớ cùng chúng tôi')}
        </h2>

        {/* TESTIMONIAL CARD */}
        <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 sm:p-12 shadow-2xl transition-all duration-500">
          <Quote className="w-12 h-12 text-amber-400/20 absolute top-6 left-6 -scale-x-100 pointer-events-none" />

          <div className="flex justify-center mb-6">
            <StarRating rating={current.rating} size="md" />
          </div>

          <blockquote className="font-serif text-lg sm:text-2xl text-slate-100 italic leading-relaxed mb-8 max-w-2xl mx-auto font-light">
            "{t(current.quoteKey, current.quote)}"
          </blockquote>

          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-extrabold text-base shadow-lg ring-4 ring-white/10">
              {current.avatar}
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <p className="font-bold text-white text-base">
                  {t(current.authorKey, current.author)}
                </p>
                <span title="Khách hàng đã xác thực" className="inline-flex">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t(current.locationKey, current.location)}
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
            title="Đánh giá trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300 cursor-pointer',
                  i === activeIndex
                    ? 'w-8 bg-amber-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                )}
                title={`Đến đánh giá ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={activeIndex === TESTIMONIALS.length - 1}
            onClick={() =>
              setActiveIndex((i) => Math.min(TESTIMONIALS.length - 1, i + 1))
            }
            className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
            title="Đánh giá tiếp theo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
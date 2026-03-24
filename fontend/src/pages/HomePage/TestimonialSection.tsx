import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StarRating from '../../components/ui/StarRating';
import { cn } from '../../components/ui/utils';
import type { Testimonial } from '../../types/property';

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote:
      'Tôi đã đặt phòng qua đây và trải nghiệm thực sự tuyệt vời! Quy trình nhanh chóng, phòng sạch sẽ và nhân viên rất thân thiện.',
    author: 'Nguyễn Minh Tuấn',
    location: 'Hà Nội',
    rating: 5,
    avatar: 'NT',
  },
  {
    id: '2',
    quote:
      'Giá cả hợp lý, phòng đẹp hơn mong đợi. Sẽ tiếp tục sử dụng dịch vụ cho những chuyến đi tiếp theo.',
    author: 'Trần Thị Lan',
    location: 'TP. Hồ Chí Minh',
    rating: 5,
    avatar: 'TL',
  },
  {
    id: '3',
    quote:
      'Hệ thống đặt phòng trực quan, dễ dùng. Tôi thích tính năng xem lịch và giá theo ngày.',
    author: 'Phạm Quốc Hùng',
    location: 'Đà Nẵng',
    rating: 4,
    avatar: 'PH',
  },
];

export default function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = TESTIMONIALS[activeIndex];

  return (
    <section className="py-20 bg-[var(--color-primary)] rounded-b-3xl">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="text-[var(--color-primary-foreground)]/60 text-xs font-bold uppercase tracking-widest mb-3">
          Khách hàng nói gì
        </p>
        <h2 className="font-serif text-3xl font-bold text-[var(--color-primary-foreground)] mb-12">
          Trải nghiệm thực từ khách hàng của chúng tôi
        </h2>

        {/* CARD */}
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[var(--shadow-xl)] flex flex-col items-center">
          <div className="flex justify-center mb-4">
            <StarRating rating={current.rating} size="md" />
          </div>
          <blockquote className="font-serif text-xl text-[var(--color-text-primary)] italic leading-relaxed mb-8">
            "{current.quote}"
          </blockquote>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-primary)]/20 flex items-center justify-center font-bold text-[var(--color-text-primary)] text-lg">
              {current.avatar}
            </div>
            <p className="font-semibold text-[var(--color-text-primary)]">
              {current.author}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {current.location}
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            className="w-10 h-10 rounded-full bg-[var(--color-primary-foreground)]/20 hover:bg-[var(--color-primary-foreground)]/40 disabled:opacity-30 transition-colors flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--color-primary-foreground)]" />
          </button>

          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'rounded-full transition-all duration-300 cursor-pointer',
                  i === activeIndex
                    ? 'w-6 h-2 bg-[var(--color-primary-foreground)]'
                    : 'w-2 h-2 bg-[var(--color-primary-foreground)]/30'
                )}
              />
            ))}
          </div>

          <button
            disabled={activeIndex === TESTIMONIALS.length - 1}
            onClick={() =>
              setActiveIndex((i) => Math.min(TESTIMONIALS.length - 1, i + 1))
            }
            className="w-10 h-10 rounded-full bg-[var(--color-primary-foreground)]/20 hover:bg-[var(--color-primary-foreground)]/40 disabled:opacity-30 transition-colors flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-[var(--color-primary-foreground)]" />
          </button>
        </div>
      </div>
    </section>
  );
}

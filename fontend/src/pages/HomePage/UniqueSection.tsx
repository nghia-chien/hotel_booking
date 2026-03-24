import { Star, BadgeCheck, Shield, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

const SELLING_POINTS = [
  {
    Icon: Star,
    title: 'Chất lượng & Tiện nghi hàng đầu',
    desc: 'Phòng được tuyển chọn kỹ lưỡng, đánh giá TB 4.8★',
    badge: '4.8★ Avg Rating',
  },
  {
    Icon: BadgeCheck,
    title: 'Đảm bảo giá tốt nhất',
    desc: 'Chúng tôi đảm bảo giá cạnh tranh nhất cho mọi lựa chọn.',
    badge: null,
  },
  {
    Icon: Shield,
    title: 'Thanh toán bảo mật',
    desc: 'Giao dịch được mã hóa SSL, bảo vệ qua cổng VNPay.',
    badge: null,
  },
  {
    Icon: RefreshCw,
    title: 'Hoàn tiền dễ dàng',
    desc: 'Hủy trước 24h → hoàn 100%, không câu hỏi thêm.',
    badge: null,
  },
];

const STATS = [
  { number: '1,000+', label: 'Phòng sẵn có' },
  { number: '124K+', label: 'Lượt đặt phòng' },
  { number: '4.8★', label: 'Đánh giá trung bình' },
  { number: '98%', label: 'Khách hàng hài lòng' },
];

export default function UniqueSection() {
  return (
    <section className="py-16 bg-white rounded-t-3xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT CONTENT */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-3">
              Tại sao chọn chúng tôi
            </p>
            <h2 className="font-serif text-3xl font-bold text-[var(--color-text-primary)] mb-10">
              Điều gì khiến chúng tôi khác biệt
            </h2>

            <div className="space-y-8">
              {SELLING_POINTS.map(({ Icon, title, desc, badge }) => (
                <div key={title} className="flex gap-4 last:mb-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[var(--color-text-primary)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {title}
                      </h3>
                      {badge && (
                        <Badge variant="primary" size="sm">
                          {badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT STATS */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map(({ number, label }) => (
              <div
                key={label}
                className="rounded-2xl bg-[var(--color-surface)] p-6 text-center"
              >
                <p className="font-serif text-3xl font-bold text-[var(--color-text-primary)]">
                  {number}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

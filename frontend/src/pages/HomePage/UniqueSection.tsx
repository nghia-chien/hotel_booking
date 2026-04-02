import { useTranslation } from '../../../node_modules/react-i18next'; 
import { Star, BadgeCheck, Shield, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

const SELLING_POINTS = [
  {
    Icon: Star,
    titleKey: 'uniqueSection.points.quality.title',
    descKey: 'uniqueSection.points.quality.desc',
    badgeKey: 'uniqueSection.points.quality.badge',
  },
  {
    Icon: BadgeCheck,
    titleKey: 'uniqueSection.points.price.title',
    descKey: 'uniqueSection.points.price.desc',
    badgeKey: null,
  },
  {
    Icon: Shield,
    titleKey: 'uniqueSection.points.secure.title',
    descKey: 'uniqueSection.points.secure.desc',
    badgeKey: null,
  },
  {
    Icon: RefreshCw,
    titleKey: 'uniqueSection.points.refund.title',
    descKey: 'uniqueSection.points.refund.desc',
    badgeKey: null,
  },
];

const STATS = [
  { number: '1,000+', labelKey: 'uniqueSection.stats.rooms' },
  { number: '124K+', labelKey: 'uniqueSection.stats.bookings' },
  { number: '4.8★', labelKey: 'uniqueSection.stats.rating' },
  { number: '98%', labelKey: 'uniqueSection.stats.satisfaction' },
];

export default function UniqueSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-white rounded-t-3xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT CONTENT */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-3">
              {t('uniqueSection.eyebrow')}
            </p>
            <h2 className="font-serif text-3xl font-bold text-[var(--color-text-primary)] mb-10">
              {t('uniqueSection.title')}
            </h2>

            <div className="space-y-8">
              {SELLING_POINTS.map(({ Icon, titleKey, descKey, badgeKey }) => (
                <div key={titleKey} className="flex gap-4 last:mb-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[var(--color-text-primary)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {t(titleKey)}
                      </h3>
                      {badgeKey && (
                        <Badge variant="primary" size="sm">
                          {t(badgeKey)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {t(descKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT STATS */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map(({ number, labelKey }) => (
              <div
                key={labelKey}
                className="rounded-2xl bg-[var(--color-surface)] p-6 text-center"
              >
                <p className="font-serif text-3xl font-bold text-[var(--color-text-primary)]">
                  {number}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {t(labelKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
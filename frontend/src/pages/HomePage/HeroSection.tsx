import type { PropertySearchParams } from '../../types/property';
import { useTranslation } from '../../../node_modules/react-i18next';
import BookingSearchForm from '../../components/search/BookingSearchForm';
import bg from "@/assets/bg.jpg";
interface HeroSectionProps {
  onSearch: (params: PropertySearchParams) => void;
  loading: boolean;
}

export default function HeroSection({ onSearch, loading }: HeroSectionProps) {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-[620px] flex flex-col items-center justify-center overflow-hidden px-4 py-20">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: '50px'
        }}
      />

      {/* Decorative Orbs */}
      <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-[var(--color-primary)]/10 blur-3xl z-0 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full bg-blue-400/10 blur-3xl z-0 pointer-events-none" />

      {/* CONTENT */}
      <div className="relative z-10 text-center max-w-4xl mx-auto w-full flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-8">
          <span>{t('hero.badge')}</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          {t('hero.title1')}
          <br />
          <span className="text-[var(--color-primary)]">{t('hero.title2')}</span>
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">{t('hero.subtitle')}</p>

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

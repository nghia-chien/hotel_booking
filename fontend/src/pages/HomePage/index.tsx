import usePropertySearch from '../../hooks/usePropertySearch';
import HeroSection from './HeroSection';
import FeaturedSection from './FeaturedSection';
import UniqueSection from './UniqueSection';
import AwardSection from './AwardSection';
import TestimonialSection from './TestimonialSection';

const HomePage = () => {
  const { loading, search } = usePropertySearch();

  return (
    <main className="min-h-screen bg-[var(--color-surface)]">
      <HeroSection onSearch={search} loading={loading} />
      <FeaturedSection />
      <UniqueSection />
      <AwardSection />
      <TestimonialSection />
    </main>
  );
};

export default HomePage;

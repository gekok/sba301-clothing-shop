import { CATEGORY_NAV, PRODUCT_IMAGES, TRUST_BADGES } from '../data/homeData.js';
import { useFeaturedProducts } from '../hooks/useFeaturedProducts.js';
import HeroSection from '../components/HeroSection.jsx';
import TrustBadges from '../components/TrustBadges.jsx';
import CategoryShowcase from '../components/CategoryShowcase.jsx';
import PromoBanner from '../components/PromoBanner.jsx';
import FeaturedProducts from '../components/FeaturedProducts.jsx';
import '../styles/home.css';

const Home = () => {
  const { products: featuredProducts } = useFeaturedProducts(3);

  return (
    <div className="bg-white">
      <HeroSection />
      <TrustBadges badges={TRUST_BADGES} />
      <CategoryShowcase categories={CATEGORY_NAV} />
      <PromoBanner />
      <FeaturedProducts products={featuredProducts} productImages={PRODUCT_IMAGES} />
    </div>
  );
}

export default Home;

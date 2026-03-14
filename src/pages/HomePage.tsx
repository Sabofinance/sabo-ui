// src/pages/HomePage.tsx
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { FeaturesSection } from '../components/FeaturesSection';
import { FXStruggleSection } from '../components/FXStruggleSection';
import { MarketplaceSections } from '../components/MarketplaceSections';
import { ExchangeMethodsSection } from '../components/ExchangeMethodsSection';
import { SecuritySection } from '../components/SecuritySection'; // New Import
import { Footer } from '../components/Footer';

export const HomePage = () => {
  return (
    <div className="home-page" style={{ overflowX: 'hidden' }}>
      <Header />
      <Hero />
      <FeaturesSection />
      <FXStruggleSection />
      <MarketplaceSections />
      <ExchangeMethodsSection />
      {/* Added after exchange section as requested */}
      <SecuritySection /> 
      <Footer />
    </div>
  );
};
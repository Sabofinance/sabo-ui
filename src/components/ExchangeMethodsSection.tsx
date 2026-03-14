// src/components/ExchangeMethodsSection.tsx
import '../assets/css/ExchangeMethodsSection.css';
import exchangeCardsImage from '../assets/images/exchange-methods-full.png';

export const ExchangeMethodsSection = () => {
  return (
    <section className="exchange-methods-wrapper">
      <div className="layout-stack">
        {/* Gray rounded plate behind the cards */}
        <div className="gray-bg-plate" />

        {/* The two floating phone cards */}
        <div className="cards-layer">
          <img
            src={exchangeCardsImage}
            alt="SABO Standard Exchange and P2P Marketplace"
            className="exchange-main-graphic"
          />
        </div>
      </div>
    </section>
  );
};
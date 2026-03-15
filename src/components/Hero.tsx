import '../assets/css/Hero.css';
import heroCardImage from '../assets/images/Frame.png';
import CurrencyConverter from './CurrencyConverter';

export const Hero = () => {
  return (
    <section className="hero">

      {/* Text content */}
      <div className="hero-text-content">
        <h1 className="hero-title">
          Taking your Finances<br />Global with Sabo
        </h1>
        <p className="hero-subtitle">
          Unlock a seamless international experience that empowers you
          <br className="desktop-only" />
          to send, receive, and manage funds anywhere in the world.
        </p>

        <div className="hero-cta-wrapper">
          <button className="btn-get-started btn-3d">
            Launch Your Wallet
          </button>
        </div>
      </div>

      {/* Illustration + converter stacked */}
      <div className="hero-illustration-full">
        <img
          src={heroCardImage}
          alt="Sabo global finance illustration"
          className="illustration-img"
        />

        {/* Converter always on top — no hover interaction on image */}
        <div className="hero-converter-wrap">
          <CurrencyConverter />
        </div>
      </div>

    </section>
  );
};
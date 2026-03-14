// src/components/Hero.tsx
import { useState } from 'react';
import '../assets/css/Hero.css';
import heroCardImage from '../assets/images/Frame.png';

export const Hero = () => {
  const [isImageHovered, setIsImageHovered] = useState(false);

  return (
    <section className="hero">
      {/* Container for text to keep it centered */}
      <div className="hero-text-content">
        <h1 className="hero-title">
          Taking your Finances<br />Global with Sabo
        </h1>
        <p className="hero-subtitle">
          Unlock a seamless international experience that empowers you<br className="desktop-only" />
          to send, receive, and manage funds anywhere in the world.
        </p>
        
        <div className="hero-cta-wrapper">
          <button className="btn-get-started btn-3d">
            Launch Your Wallet
          </button>
        </div>
      </div>

      {/* Full-Width Image Container with 3D hover effect */}
      <div 
        className="hero-illustration-full image-3d-wrapper"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
      >
        <img 
          src={heroCardImage} 
          alt="Sabo global finance illustration" 
          className={`illustration-img ${isImageHovered ? 'image-3d-hover' : ''}`}
        />
      </div>
    </section>
  );
};
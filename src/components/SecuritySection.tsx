// src/components/SecuritySection.tsx
import '../assets/css/SecuritySection.css';
import securityIllustration from '../assets/images/security-lock-phone.png';

const securityFeatures = [
  {
    // More refined lock icon (heavier stroke, cleaner)
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
      </svg>
    ),
    title: "Account Security",
    description: "Experience peace of mind with a platform built to safeguard your identity, your data, and every transaction you make."
  },
  {
    // Nicer shield icon with check
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="M8 11l3 3 6-6"></path>
      </svg>
    ),
    title: "Fraud Prevention",
    description: "Stay confident with real-time protection designed to detect, block, and stop suspicious activity before it reaches you."
  },
  {
    // Elegant heart icon with smooth curves
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    ),
    title: "24/7 Human Support",
    description: "Day or night, you can always speak to someone who’s ready to guide you, solve issues, and keep your experience smooth."
  }
];

export const SecuritySection = () => {
  return (
    <section className="security-section">
      <div className="security-container">
        
        <div className="security-main-row">
          <div className="security-text-content">
            <h2 className="security-heading">
              We love to give precedence to your financial security
            </h2>
            <p className="security-subtext">
              Security that lets you send, receive, and transact with confidence.
            </p>
            
            {/* Clean button – no icons */}
            <button className="get-started-btn">
              Get started
            </button>
          </div>
          
          <div className="security-visual-content">
            <img 
              src={securityIllustration} 
              alt="Security phone with floating padlock" 
              className="security-illustration-img" 
            />
          </div>
        </div>

        <div className="security-features-grid">
          {securityFeatures.map((item) => (
            <div className="security-feature-card" key={item.title}>
              <div className="security-card-icon">
                {item.icon}
              </div>
              <h3 className="security-card-title">{item.title}</h3>
              <p className="security-card-description">{item.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
// src/components/FeaturesSection.tsx
import '../assets/css/FeaturesSection.css';
import paperPlaneImage from '../assets/images/rocket-coin.png'; 

export const FeaturesSection = () => {
  const features = [
    {
      // Heart Icon (solid)
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ),
      title: "Send money to your loved ones with your virtual accounts",
      description: "Transfer funds to friends and family effortlessly using your secure virtual account. Enjoy fast delivery, reliable processing, and complete peace of mind with every transaction."
    },
    {
      // Bank/Building Icon (solid)
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v2h20V7l-10-5zm0 5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-8 4v9h2v-9H4zm4 0v9h2v-9H8zm4 0v9h2v-9h-2zm4 0v9h2v-9h-2zm4 0v9h2v-9h-2z"/>
        </svg>
      ),
      title: "Receive money into your wallet and send to your bank account",
      description: "Receive payments instantly and manage your money in one place. Move funds from your wallet to your bank account seamlessly, giving you full control and flexibility wherever you need it."
    },
    {
      // Double ATM Card Icon (two cards overlapped)
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H8c-1.1 0-2 .9-2 2v2h2V6h12v8h-2v2h2c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
          <path d="M16 8H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 2v2H4v-2h12zM4 18v-4h12v4H4z"/>
        </svg>
      ),
      title: "Exchange your local currencies for international currencies at great rates",
      description: "Convert your local currency to global currencies in just a few taps. Benefit from competitive exchange rates, quick processing, and a seamless experience built for convenience."
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        
        {/* Top Header Section */}
        <div className="features-header-split">
          <div className="features-text-block">
            <h2 className="features-title-main">
              The Easiest Way for Africans in the Diaspora to Send Money Back Home
            </h2>
            <p className="features-desc-main">
              A payment platform built by Africans for Africans in the diaspora facing the challenges 
              of sending money to their loved ones or paying bills back at home.
            </p>
          </div>
          
          <div className="features-visual-block">
            <img src={paperPlaneImage} alt="Paper plane illustration" className="plane-img" />
          </div>
        </div>

        {/* Features Grid Section */}
        <div className="features-info-grid">
          {features.map((item, idx) => (
            <div className="feature-column" key={idx}>
              <div className="icon-bg-circle">
                {item.icon}
              </div>
              <h3 className="feature-item-title">{item.title}</h3>
              <p className="feature-item-text">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
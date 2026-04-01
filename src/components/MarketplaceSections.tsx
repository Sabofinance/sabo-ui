// src/components/MarketplaceSections.tsx
import '../assets/css/MarketplaceSections.css';

import studentsImg from '../assets/images/for-students.png';
import workersImg from '../assets/images/for-workers.png';
import businessImg from '../assets/images/for-business.png';
import familyImg from '../assets/images/for-family.png';

const lifeCards = [
  { img: studentsImg, title: "For Students Studying Abroad" },
  { img: workersImg, title: "For Diaspora Workers Supporting Home" },
  { img: businessImg, title: "For Small Businesses Trading Globally" },
  { img: familyImg, title: "Keeping Family Support Safe, Simple, and Stress-Free" }
];

export const MarketplaceSections = () => {
  const handleSendMoney = () => {
    // Redirect to signup/register page
    window.location.href = '/signup'; // or use React Router navigate
  };

  return (
    <div className="marketplace-wrapper">
      {/* Built for Everyday Life Section */}
      <section className="everyday-section">
        <div className="everyday-container">
          <div className="everyday-conent-grid">
            <div className="everyday-text-col">
              <h2 className="everyday-title">Built for everyday Life.</h2>
            </div>
            
            <div className="everyday-slider-col">
              <div className="marquee-wrapper">
                <div className="marquee-content">
                  {[...lifeCards, ...lifeCards].map((card, index) => (
                    <div className="life-card" key={index}>
                      <img src={card.img} alt={card.title} />
                      <div className="card-overlay">
                        <p>{card.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="everyday-cta-col">
               <h3 className="cta-italic-text">A safer way to exchange starts here.</h3>
               <button className="send-money-btn" onClick={handleSendMoney}>
                  Send money now
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Join our Marketlist Section */}
      <section className="marketlist-section">
        <div className="marketlist-container">
          <h2 className="marketlist-title">Join our Marketlist</h2>
          <p className="marketlist-subtitle">
            A payment platform built by Africans for Africans in the diaspora facing the challenges 
            of sending money to their loved ones or paying bills back at home.
          </p>
          
          <div className="market-input-group">
            <input type="email" placeholder="Enter your email address" className="email-field" />
            <button className="arrow-submit-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
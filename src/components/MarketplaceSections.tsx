// src/components/MarketplaceSections.tsx
import { useEffect } from "react";
import "../assets/css/MarketplaceSections.css";

import studentsImg from "../assets/images/for-students.png";
import workersImg from "../assets/images/for-workers.png";
import businessImg from "../assets/images/for-business.png";
import familyImg from "../assets/images/for-family.png";

declare global {
  interface Window {
    ml?: (...args: any[]) => void;
  }
}

const lifeCards = [
  { img: studentsImg, title: "For Students Studying Abroad" },
  { img: workersImg, title: "For Diaspora Workers Supporting Home" },
  { img: businessImg, title: "For Small Businesses Trading Globally" },
  {
    img: familyImg,
    title: "Keeping Family Support Safe, Simple, and Stress-Free",
  },
];

export const MarketplaceSections = () => {
  useEffect(() => {
    if (document.querySelector("script[data-mailerlite]")) return;

    const script = document.createElement("script");
    script.setAttribute("data-mailerlite", "true");
    script.innerHTML = `
      (function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[])
      .push(arguments);},l=d.createElement(e),l.async=1,l.src=u,
      n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})
      (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
      ml('account', '2303159');
    `;
    document.head.appendChild(script);
  }, []);

  const handleSendMoney = () => {
    window.location.href = "/signup";
  };

  return (
    <div className="marketplace-wrapper">
      {/* Built for Everyday Life Section */}
      <section className="everyday-section">
        <div className="everyday-container">
          <div className="everyday-content-grid">
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
              <h3 className="cta-italic-text">
                A safer way to exchange starts here.
              </h3>
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
            A payment platform built by Africans for Africans in the diaspora
            facing the challenges of sending money to their loved ones or paying
            bills back at home.
          </p>

          {/* ✅ Now correctly inside marketlist-container */}
          <div className="left">
            <div className="ml-embedded text" data-form="W2LW3T" />
          </div>
        </div>
      </section>
    </div>
  );
};

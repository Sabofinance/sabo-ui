// src/components/FXStruggleSection.tsx
import '../assets/css/FXStruggleSection.css';

import feeIcon from '../assets/images/fee-icon.png';
import slowIcon from '../assets/images/clock-icon.png';
import scamIcon from '../assets/images/shield-icon.png';

export const FXStruggleSection = () => {
  const struggles = [
    {
      id: "fees",
      image: feeIcon,
      title: "High fees",
      description: (
        <>
          Banks and remittance apps take a large cut. <strong>SABO keeps costs low and clear.</strong>
        </>
      )
    },
    {
      id: "slow",
      image: slowIcon,
      title: "Slow transfers",
      description: (
        <>
          Traditional channels can take days. <strong>SABO settles inside your wallets in minutes.</strong>
        </>
      )
    },
    {
      id: "scam",
      image: scamIcon,
      title: "Scam risk",
      description: (
        <>
          Group chats are unpredictable. SABO removes direct bank transfers and <strong>replaces them with secure wallet-to-wallet exchange.</strong>
        </>
      )
    }
  ];

  return (
    <section className="fx-struggle-section">
      <div className="fx-inner-container">
        <h2 className="fx-heading">
          <span className="fx-light">The FX struggle is real.</span><br />
          SABO makes it easier.
        </h2>

        <div className="fx-grid">
          {struggles.map((item) => (
            <div className="fx-item-card" key={item.id}>
              <div className="fx-visual-box">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className={`fx-img-overlap img-${item.id}`} 
                />
              </div>
              <div className="fx-text-box">
                <h3 className="fx-card-h3">{item.title}</h3>
                <p className="fx-card-p">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
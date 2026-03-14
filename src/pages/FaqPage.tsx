import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../assets/css/FaqPage.css';

import faqHeroImg from '../assets/images/faq-hero.png'; // your image

const faqData = [
  {
    question: "How does Sabo work?",
    answer: "Sabo is a payment platform built by Africans for Africans in the diaspora. We simplify sending money to loved ones and paying bills back home with instant, secure wallet-to-wallet transfers."
  },
  {
    question: "Is my money safe?",
    answer: "Absolutely. We utilize bank-grade encryption, multi-layer security, and escrow systems to protect your funds during every transaction."
  },
  {
    question: "What currencies can I exchange?",
    answer: "You can exchange NGN, USD, GBP, and CAD with transparent rates and low fees."
  },
  {
    question: "What are the fees?",
    answer: "Sabo keeps costs low with transparent fees. Conversion fees are clearly shown before you confirm, and there are no hidden spreads."
  },
  {
    question: "How long do withdrawals take?",
    answer: "Withdrawals to Nigerian banks are typically processed within minutes. International withdrawals may take 1-2 business days depending on your bank."
  },
  {
    question: "How do I secure my account?",
    answer: "We recommend enabling 2FA, using our built-in biometric security features, and never sharing your login credentials with anyone."
  }
];

export const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-page-container">
      <Header />

      {/* HERO – shorter and sweet */}
      <section className="faq-hero">
        <div className="faq-hero-background"></div>
        <div className="faq-hero-content">
          <div className="faq-hero-text">
            <span className="badge">✨ Knowledge Base</span>
            <h1 className="faq-hero-title">How can we help?</h1>
            <div className="search-bar-wrapper">
              <input type="text" placeholder="Search for questions..." className="search-input" />
              <button className="search-btn">Search</button>
            </div>
          </div>
          <div className="faq-hero-image-wrapper">
            <img src={faqHeroImg} alt="FAQ support" className="faq-hero-image" />
            <div className="image-glow"></div>
          </div>
        </div>
      </section>

      {/* FAQ LIST – styled like screenshot */}
      <section className="faq-list-section">
        <div className="faq-list-container">
          <h2 className="faq-main-heading">
            You’ve got some money questions?<br />
            <span>we’ve got them answered.</span>
          </h2>
          <p className="faq-subheading">
            Here are some of the questions we’ve been asked recently.
          </p>

          <div className="faq-accordion">
            {faqData.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`faq-item ${isOpen ? 'open' : ''}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <div className="faq-question">
                    <span className="faq-bullet">○</span>
                    <h3>{item.question}</h3>
                    <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                  </div>
                  <div className="faq-answer" style={{ maxHeight: isOpen ? '200px' : '0' }}>
                    <p>{item.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
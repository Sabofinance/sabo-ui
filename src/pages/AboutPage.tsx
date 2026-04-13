import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../assets/css/AboutPage.css';

// Local image imports (replace with your actual file names)
import heroBgImg from '../assets/images/about-hero.png'; // Your hero background image
import originStoryImg from '../assets/images/our-origin-story.png'; // Your origin story image

export const AboutPage = () => {
  const teamMembers = [
    { name: 'Elubosoye Fadiora', role: 'Founder & CEO' },
    { name: 'Nnamdi Onyia', role: 'Head of Product' },
    { name: 'Rotimi Fawumi', role: 'Chief Data Officer' },
    { name: 'Ifeoluwa Success', role: 'Platform Reliability Engineer' },
  ];

  const GenericAvatar = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#e8edf0" />
      <circle cx="50" cy="38" r="18" fill="#b0bec5" />
      <ellipse cx="50" cy="85" rx="28" ry="22" fill="#b0bec5" />
    </svg>
  );

  return (
    <div className="about-page">
      <Header />

      {/* 1. HERO SECTION with local background image */}
      <section 
        className="about-hero" 
        style={{ backgroundImage: `url(${heroBgImg})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="about-badge">ABOUT US</span>
          <h1 className="about-main-title">
            Building the Future of <br /> 
            Currency Exchange for <br /> 
            Nigerians Everywhere
          </h1>
          <p className="about-sub-title">
            Sabo is on a mission to make exchanging money fast, <br />
            safe, and fair for Nigerians at home and abroad.
          </p>
        </div>

        <div className="mission-vision-grid">
          <div className="mv-card">
            <div className="mv-icon-box">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div>
              <h3>Our Mission</h3>
              <p>To provide Nigerians with a transparent, peer-to-peer platform that makes currency exchange effortless, secure, and fair.</p>
            </div>
          </div>
          <div className="mv-card">
            <div className="mv-icon-box">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div>
              <h3>Our Vision</h3>
              <p>To become the most trusted global fintech platform for Nigerians, bridging the gap between local and international finance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ORIGIN STORY with local image */}
      <section className="origin-story-section">
        <div className="origin-image-container">
          <img src={originStoryImg} alt="Hands holding dollar bills" className="origin-img" />
          <div className="origin-overlay">
            <h2>OUR ORIGIN <br /> STORY</h2>
          </div>
        </div>

        <div className="origin-text-content">
          <h2 className="origin-heading">Inspired by the Aboki Culture. <br /> Rebuilt for the Digital Age.</h2>
          <p>
            For decades, Nigerians relied on <strong>"Abokis"</strong> — trusted currency exchangers found in 
            places like Sabo, airports, and community centers.
          </p>
          
          <div className="aboki-lists-grid">
            <div className="aboki-list-card">
              <p>Aboki always was built on:</p>
              <ul>
                <li>Deep personal relationships</li>
                <li>They were fast & easy</li>
                <li>And they made life move easier.</li>
              </ul>
            </div>
            <div className="aboki-list-card">
              <p>As Nigerians moved across the world, it became hard to access:</p>
              <ul>
                <li>Offshore groups</li>
                <li>Telegram groups</li>
                <li>Trust issues, risk of scams</li>
              </ul>
            </div>
          </div>

          <div className="origin-conclusion">
            <p>But with digital came a new problem — <strong>Risk.</strong></p>
            <p>People began sending money to strangers, hoping they would keep their word.</p>
            <p>SABO was created to protect this community spirit while removing the danger.</p>
            <p>
              We digitized the original "Aboki" experience — keeping the trust, the fairness, the 
              flexibility — but adding structure, security, and instant settlement through wallets.
            </p>
            <p className="final-quote">SABO is not just an App.<br />It’s the evolution of a culture Nigerians already trust.</p>
          </div>
        </div>
      </section>

      {/* 3. BRAND PRINCIPLES (THE SABO WAY) */}
      <section className="sabo-way-section">
        <div className="sabo-way-header">
          <h2>THE SABO WAY</h2>
          <p>OUR BRAND PRINCIPLES</p>
        </div>
        
        <div className="principles-grid">
          <div className="principle-item">
            <span className="p-num">1. Trust First</span>
            <p>Every feature, policy, and design choice starts with one question: "Does this make exchanging money safer and more transparent?"</p>
          </div>
          <div className="principle-item">
            <span className="p-num">2. Built for Nigerians, not Imported</span>
            <p>SABO is tailor-made for Nigerian realities — both at home and abroad.</p>
          </div>
          <div className="principle-item">
            <span className="p-num">3. Wallet-Centric Architecture</span>
            <p>Every user has NGN, USD, GBP, and CAD wallets. No bank-to-bank exposure. No scams.</p>
          </div>
          <div className="principle-item">
            <span className="p-num">4. Simple, Clear, Human</span>
            <p>No hidden charges. No jargon. Just clean, honest FX.</p>
          </div>
        </div>
      </section>

      {/* 4. MEET OUR TEAM (placeholders) */}
      <section className="team-section">
        <h2 className="team-title">Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div className="team-card" key={index}>
              <div className="team-avatar">
                <GenericAvatar />
              </div>
              <h4>{member.name}</h4>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
        <button className="join-us-btn">Join Us</button>
      </section>

      <Footer />
    </div>
  );
};
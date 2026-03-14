import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../assets/css/ContactPage.css';
import contactHeroImg from '../assets/images/contact-hero.png'; // Replace with your image

export const ContactPage = () => {
  return (
    <div className="contact-page-container">
      <Header />

      {/* HERO – white & lime, with subtle 3D depth */}
      <section className="contact-hero">
        <img src={contactHeroImg} alt="Contact Sabo" className="contact-hero-image" />
        <div className="contact-hero-overlay"></div>
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">
            Get in <span className="lime-text">touch</span>
          </h1>
          <div className="lime-underline"></div>
          <p className="contact-hero-subtitle">
            We’d love to hear from you. Reach out and let’s talk.
          </p>
        </div>
      </section>

      {/* CONTACT INFO + FORM */}
      <section className="contact-info-section">
        <div className="contact-container">
          <div className="contact-grid">
            {/* Left: Contact Details */}
            <div className="contact-details">
              <h2 className="contact-details-title">Contact Information</h2>
              <p className="contact-details-subtitle">We're here to help 24/7</p>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <h4>Visit us</h4>
                  <p>123 Sabo Street, Lagos, Nigeria</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                </div>
                <div>
                  <h4>Call us</h4>
                  <p>+234 800 123 4567</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <h4>Email us</h4>
                  <p>hello@sabo.africa</p>
                </div>
              </div>

              <div className="contact-social">
                <a href="#" className="social-icon" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="social-icon" aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
                <a href="#" className="social-icon" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="social-icon" aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="contact-form">
              <h3>Send a message</h3>
              <form>
                <div className="form-group">
                  <input type="text" placeholder="Your name" />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Email address" />
                </div>
                <div className="form-group">
                  <textarea rows={5} placeholder="How can we help?"></textarea>
                </div>
                <button type="submit" className="send-btn">Send message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* GOOGLE MAP – with subtle 3D tilt */}
      <section className="contact-map-section">
        <div className="map-container">
          <iframe
            title="Sabo location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126914.43708361864!2d3.279531593307096!3d6.548369379335161!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
            allowFullScreen
            loading="lazy"
            className="google-map"
          ></iframe>
        </div>
      </section>

      <Footer />
    </div>
  );
};
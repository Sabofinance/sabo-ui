import React from "react";
import { Link } from "react-router-dom";
import { Header } from "./../components/Header";
import "../assets/css/AuthPage.css";

const AccountDeletedPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-main">
          <div className="auth-form-section" style={{ width: "100%" }}>
            <div className="auth-form-wrapper" style={{ maxWidth: 560, margin: "0 auto" }}>
              <h2 className="auth-title">Account Deleted</h2>
              <p className="auth-subtitle">
                Your account has been deleted successfully. You can sign up again anytime.
              </p>

              <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 18, background: "#fff7e6", border: "1px solid #fde68a" }}>
                <div style={{ fontWeight: 900, marginBottom: 4 }}>Thank you</div>
                <div style={{ color: "#6b7280", fontSize: 14 }}>
                  If you have any questions, contact support from the homepage.
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
                <Link to="/signup" className="btn-primary" style={{ textDecoration: "none", flex: "1 1 240px" }}>
                  Create a new account
                </Link>
                <Link to="/" className="action-btn" style={{ textDecoration: "none", flex: "1 1 200px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountDeletedPage;


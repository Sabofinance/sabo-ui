import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import "../assets/css/AuthPage.css";
import loginImage from "../assets/images/3d-illustration-login.png";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  // Demo credentials (only these work)
  const demoCredentials = {
    identifier: "demo@sabo.com",
    password: "demo123",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error when user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    // Clear general error when user types
    if (generalError) setGeneralError("");
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.identifier.trim()) newErrors.identifier = "Email or username is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(""); // clear any previous general error

    if (validate()) {
      // Check against demo credentials
      if (
        formData.identifier === demoCredentials.identifier &&
        formData.password === demoCredentials.password
      ) {
        console.log("Login successful with demo account");
        navigate('/dashboard');
      } else {
        setGeneralError("Invalid email/username or password.");
      }
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login");
    // For demo, just navigate (or you could restrict this too)
    navigate('/dashboard');
  };

  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-main">
          <div className="auth-image-section">
            <img src={loginImage} alt="SABO illustration" className="auth-image" />
          </div>

          <div className="auth-form-section">
            <div className="auth-form-wrapper">
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">
                Sign in to your SABO account to send, receive, and manage your money securely.
              </p>

              {generalError && <div className="general-error">{generalError}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="identifier" className="form-label">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className={`form-input ${errors.identifier ? "error" : ""}`}
                    placeholder="Enter your email or username"
                    autoComplete="username"
                  />
                  {errors.identifier && <span className="error-text">{errors.identifier}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-input ${errors.password ? "error" : ""}`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePassword}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <Link to="/forgot-password" className="forgot-link">
                    Forgot your password?
                  </Link>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <button type="submit" className="auth-btn">Sign In</button>
              </form>

              <div className="divider">
                <span>or</span>
              </div>

              <button className="google-btn" onClick={handleGoogleLogin}>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.92c-.25 1.35-1 2.5-2.13 3.27v2.68h3.44c2.01-1.85 3.17-4.57 3.17-8.21z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.44-2.68c-.95.64-2.17 1.02-3.84 1.02-2.95 0-5.46-1.99-6.35-4.67H2.18v2.93C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.65 14.68c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18V7.4H2.18C1.43 9.05 1 10.98 1 13c0 2.02.43 3.95 1.18 5.6l2.47-1.92z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.4l2.47 1.92c.89-2.68 3.4-4.67 6.35-4.67z"
                  />
                </svg>
                Continue with Google
              </button>

              <p className="auth-switch">
                Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
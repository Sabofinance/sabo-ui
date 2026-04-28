import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Header } from "../components/Header";
import authApi from "../lib/api/auth.api";
import type { ForgotPasswordRequest } from "../modules/auth/types/type";
import "../assets/css/AuthPage.css";
import maskImage from "../assets/images/Mask group.png";
import assetImage from "../assets/images/Asset 8@4x 1.png";

const ForgotPasswordPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordRequest>();
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (data: ForgotPasswordRequest) => {
    setGeneralError("");
    setSuccessMessage("");
    try {
      const response = await authApi.forgotPassword(data);
      // Per backend behavior: always show the same confirmation regardless of whether email exists.
      void response;
      setSuccessMessage("If an account exists for this email, you’ll receive a password reset link shortly.");
    } catch (error: any) {
      // Even on errors, avoid revealing whether the email exists.
      void error;
      setSuccessMessage("If an account exists for this email, you’ll receive a password reset link shortly.");
    }
  };

  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-main">
          <div className="auth-image-section">
            <img src={maskImage} alt="Background mask" className="auth-mask-bg" />
            <img src={assetImage} alt="SABO illustration" className="auth-image" />
          </div>

          <div className="auth-form-section">
            <div className="auth-form-wrapper">
              <h2 className="auth-title">Forgot Password</h2>
              <p className="auth-subtitle">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {generalError && <div className="general-error">{generalError}</div>}
              {successMessage && <div className="success-message" style={{ color: 'green', marginBottom: '1rem', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>{successMessage}</div>}

              {!successMessage && (
                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register("email", { 
                        required: "Email is required",
                        pattern: { value: /\S+@\S+\.\S+/, message: "Email is invalid" }
                      })}
                      className={`form-input ${errors.email ? "error" : ""}`}
                      placeholder="Enter your email"
                    />
                    {errors.email && <span className="error-text">{errors.email.message}</span>}
                  </div>

                  <button 
                    type="submit" 
                    className="auth-btn" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              )}

              <p className="auth-switch" style={{ marginTop: '2rem' }}>
                <Link to="/login" className="auth-link">Return to Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
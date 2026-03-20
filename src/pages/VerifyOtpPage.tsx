import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Header } from "../components/Header";
import { useAuth } from "../context/AuthContext";
import type { OtpRequest } from "../modules/auth/types/type";
import "../assets/css/AuthPage.css";
import loginImage from "../assets/images/3d-illustration-login.png";

const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpRequest>();
  const [generalError, setGeneralError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem('pendingEmail');
    if (!pendingEmail) {
      navigate('/login');
    } else {
      setEmail(pendingEmail);
    }
  }, [navigate]);

  const onSubmit = async (data: OtpRequest) => {
    setGeneralError("");
    try {
      await verifyOtp({ email, otp: data.otp });
      navigate('/dashboard');
    } catch (error: any) {
      setGeneralError(error.message || "Invalid OTP. Please try again.");
    }
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
              <h2 className="auth-title">Verify OTP</h2>
              <p className="auth-subtitle">
                Enter the one-time password sent to {email}.
              </p>

              {generalError && <div className="general-error">{generalError}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                <div className="form-group">
                  <label htmlFor="otp" className="form-label">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    {...register("otp", { 
                      required: "OTP is required",
                      minLength: { value: 4, message: "OTP is usually 4-6 digits" }
                    })}
                    className={`form-input ${errors.otp ? "error" : ""}`}
                    placeholder="Enter your OTP code"
                  />
                  {errors.otp && <span className="error-text">{errors.otp.message}</span>}
                </div>

                <button 
                  type="submit" 
                  className="auth-btn" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </button>
              </form>

              <p className="auth-switch">
                <Link to="/login" className="auth-link">Back to Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyOtpPage;
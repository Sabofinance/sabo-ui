import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Header } from "../../components/Header";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "../../assets/css/AuthPage.css";
import maskImage from "../../assets/images/Mask group.png";

type AdminLoginForm = { email: string; password: string };

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin, isAdminLoading } = useAdminAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdminLoginForm>();
  const [generalError, setGeneralError] = useState("");

  const onSubmit = async (data: AdminLoginForm) => {
    setGeneralError("");
    try {
      await adminLogin(data);
      // Step 1 success: move to OTP step; store email for the next step.
      sessionStorage.setItem("adminPendingEmail", data.email);
      navigate("/admin/verify-otp");
    } catch (e: any) {
      setGeneralError(e?.message || "Admin login failed.");
    }
  };

  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-main">
          <div className="auth-image-section">
            <img src={maskImage} alt="Background mask" className="auth-mask-bg" />
            <svg 
              viewBox="0 0 400 400" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="auth-image"
            >
              {/* Main Dashboard Panel */}
              <rect x="40" y="80" width="320" height="220" rx="16" fill="#0A1E28" />
              
              {/* Header Bar */}
              <path d="M40 96 C40 87.1634 47.1634 80 56 80 H344 C352.837 80 360 87.1634 360 96 V120 H40 V96 Z" fill="#112A38" />
              <circle cx="65" cy="100" r="6" fill="#FF5F56" />
              <circle cx="85" cy="100" r="6" fill="#FFBD2E" />
              <circle cx="105" cy="100" r="6" fill="#27C93F" />
              
              {/* Sidebar */}
              <rect x="60" y="140" width="60" height="140" rx="8" fill="#112A38" />
              <rect x="70" y="155" width="40" height="8" rx="4" fill="#C8F032" opacity="0.8" />
              <rect x="70" y="175" width="40" height="8" rx="4" fill="#ffffff" opacity="0.2" />
              <rect x="70" y="195" width="40" height="8" rx="4" fill="#ffffff" opacity="0.2" />
              <rect x="70" y="215" width="40" height="8" rx="4" fill="#ffffff" opacity="0.2" />
              
              {/* Chart Area */}
              <rect x="140" y="140" width="200" height="80" rx="8" fill="#112A38" />
              <path d="M150 200 L180 170 L210 185 L260 150 L320 175" stroke="#C8F032" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="180" cy="170" r="4" fill="#C8F032" />
              <circle cx="210" cy="185" r="4" fill="#C8F032" />
              <circle cx="260" cy="150" r="4" fill="#C8F032" />
              
              {/* Bottom Widgets */}
              <rect x="140" y="230" width="90" height="50" rx="8" fill="#112A38" />
              <rect x="150" y="245" width="40" height="6" rx="3" fill="#ffffff" opacity="0.3" />
              <rect x="150" y="260" width="60" height="6" rx="3" fill="#ffffff" opacity="0.1" />

              <rect x="250" y="230" width="90" height="50" rx="8" fill="#112A38" />
              <rect x="260" y="245" width="50" height="6" rx="3" fill="#ffffff" opacity="0.3" />
              <rect x="260" y="260" width="30" height="6" rx="3" fill="#ffffff" opacity="0.1" />

              {/* Shield / Security Overlay */}
              <g transform="translate(240, 190) scale(1.1)">
                <path d="M50 0 L90 18V45C90 70 72 93 50 100C27 93 10 70 10 45V18L50 0Z" fill="#C8F032" stroke="#0A1E28" strokeWidth="6" strokeLinejoin="round" />
                <path d="M35 48 L45 58 L65 35" stroke="#0A1E28" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </div>

          <div className="auth-form-section">
            <div className="auth-form-wrapper">
              <h2 className="auth-title">Admin Access</h2>
              <p className="auth-subtitle">
                Secure login for moderators & compliance.
              </p>

              {generalError && <div className="general-error">{generalError}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register("email", { required: "Email is required" })}
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="Enter admin email"
                    autoComplete="username"
                  />
                  {errors.email && <span className="error-text">{errors.email.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                    })}
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                  />
                  {errors.password && <span className="error-text">{errors.password.message}</span>}
                </div>

                <button
                  type="submit"
                  className="auth-btn"
                  disabled={isSubmitting || isAdminLoading}
                >
                  {isSubmitting ? "Verifying..." : "Continue"}
                </button>
              </form>

              <p className="auth-switch" style={{ marginTop: 14 }}>
                Not an admin? <span style={{ color: "var(--primary)", cursor: "pointer" }} onClick={() => navigate("/login")}>Go to user login</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;


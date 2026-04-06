import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Header } from "../../components/Header";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "../../assets/css/AuthPage.css";
import adminLoginImage from "../../assets/images/3d-illustration-login.png";

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
            <img src={adminLoginImage} alt="Admin login illustration" className="auth-image" />
          </div>

          <div className="auth-form-section">
            <div className="auth-form-wrapper">
              <img
                src="/Sabo logo.png"
                alt="Sabo Finance"
                style={{ height: '40px', width: 'auto', objectFit: 'contain', marginBottom: '16px' }}
              />
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


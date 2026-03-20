import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Header } from "../../components/Header";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "../../assets/css/AuthPage.css";
import adminLoginImage from "../../assets/images/3d-illustration-login.png";

type AdminOtpForm = {
  otp: string;
};

const AdminVerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminVerifyOtp, isAdminLoading } = useAdminAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdminOtpForm>();
  const [generalError, setGeneralError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("adminPendingEmail");
    if (!pendingEmail) {
      navigate("/admin/login");
    } else {
      setEmail(pendingEmail);
    }
  }, [navigate]);

  const onSubmit = async (data: AdminOtpForm) => {
    setGeneralError("");
    try {
      await adminVerifyOtp({ email, otp: data.otp });
      sessionStorage.removeItem("adminPendingEmail");
      navigate("/dashboard/admin");
    } catch (e: any) {
      setGeneralError(e?.message || "Invalid OTP. Please try again.");
    }
  };

  const goBack = () => {
    sessionStorage.removeItem("adminPendingEmail");
    navigate("/admin/login");
  };

  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-main">
          <div className="auth-image-section">
            <img src={adminLoginImage} alt="Admin OTP illustration" className="auth-image" />
          </div>

          <div className="auth-form-section">
            <div className="auth-form-wrapper">
              <h2 className="auth-title">Verify Admin OTP</h2>
              <p className="auth-subtitle">
                Enter the one-time code sent to {email}.
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
                    inputMode="numeric"
                    {...register("otp", {
                      required: "OTP is required",
                      minLength: { value: 4, message: "OTP is usually 4-6 digits" },
                    })}
                    className={`form-input ${errors.otp ? "error" : ""}`}
                    placeholder="Enter admin OTP"
                  />
                  {errors.otp && <span className="error-text">{errors.otp.message}</span>}
                </div>

                <button type="submit" className="auth-btn" disabled={isSubmitting || isAdminLoading}>
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </button>
              </form>

              <p className="auth-switch" style={{ marginTop: 14 }}>
                <span style={{ color: "var(--primary)", cursor: "pointer" }} onClick={goBack}>Back to admin login</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminVerifyOtpPage;


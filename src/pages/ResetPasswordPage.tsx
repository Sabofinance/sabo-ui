import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Header } from "../components/Header";
import authApi from "../lib/api/auth.api";
import type { ResetPasswordRequest } from "../modules/auth/types/type";
import "../assets/css/AuthPage.css";
import loginImage from "../assets/images/3d-illustration-login.png";

interface ResetFormInputs extends ResetPasswordRequest {
  confirmPassword?: string;
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormInputs>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const password = watch("password");

  useEffect(() => {
    if (!token) {
      setGeneralError("Invalid or missing reset token. Please request a new reset link.");
    }
  }, [token]);

  const onSubmit = async (data: ResetFormInputs) => {
    if (!token) return;
    setGeneralError("");
    setSuccessMessage("");
    try {
      const response = await authApi.resetPassword({
        token,
        password: data.password,
      });

      if (response.success) {
        setSuccessMessage("Password reset successful. You can now sign in with your new password.");
      } else {
        setGeneralError(
          response.error?.message ||
            "This reset link is invalid or has expired. Please request a new one.",
        );
      }
    } catch (error: any) {
      setGeneralError(
        error.response?.data?.error?.message ||
          error.message ||
          "This reset link is invalid or has expired. Please request a new one.",
      );
    }
  };

  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-main">
          <div className="auth-image-section">
            <img
              src={loginImage}
              alt="SABO illustration"
              className="auth-image"
            />
          </div>

          <div className="auth-form-section">
            <div className="auth-form-wrapper">
              <h2 className="auth-title">Reset Password</h2>
              <p className="auth-subtitle">Enter your new password below.</p>

              {generalError && (
                <div className="general-error">{generalError}</div>
              )}
              {successMessage && (
                <div
                  className="success-message"
                  style={{
                    color: "green",
                    marginBottom: "1rem",
                    padding: "10px",
                    backgroundColor: "#e6ffe6",
                    borderRadius: "4px",
                  }}
                >
                  {successMessage}
                </div>
              )}

              {token && !successMessage ? (
                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      New Password
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        className={`form-input ${errors.password ? "error" : ""}`}
                        placeholder="Create a new password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePassword}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="error-text">
                        {errors.password.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                        className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={toggleConfirmPassword}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="error-text">
                        {errors.confirmPassword.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="auth-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              ) : (
                <p style={{ marginTop: "2rem" }}>
                  Please check your email for a valid reset link.
                </p>
              )}

              <p className="auth-switch" style={{ marginTop: "2rem" }}>
                {successMessage ? (
                  <button
                    type="button"
                    className="auth-btn"
                    onClick={() => navigate("/login")}
                    style={{ width: "100%" }}
                  >
                    Continue to login
                  </button>
                ) : (
                  <Link to="/login" className="auth-link">
                    Return to Login
                  </Link>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;

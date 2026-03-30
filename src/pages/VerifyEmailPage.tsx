import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "../components/Header";
import authApi from "../lib/api/auth.api";
import "../assets/css/AuthPage.css";

type Status = "idle" | "loading" | "success" | "error";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token. Please use the link in your email.");
        return;
      }
      setStatus("loading");
      setMessage("");
      const res = await authApi.verifyEmail(token);
      if (res.success) {
        setStatus("success");
        setMessage("Email verified successfully. You can now sign in.");
      } else {
        setStatus("error");
        setMessage(res.error?.message || "Email verification failed. Please request a new verification link.");
      }
    };
    void run();
  }, [token]);

  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-main">
          <div className="auth-form-section" style={{ width: "100%" }}>
            <div className="auth-form-wrapper" style={{ maxWidth: 520, margin: "0 auto" }}>
              <h2 className="auth-title">Verify Email</h2>
              <p className="auth-subtitle">We’re verifying your email address.</p>

              {status === "loading" && (
                <div className="success-message" style={{ marginTop: 12 }}>
                  Verifying...
                </div>
              )}
              {status === "success" && (
                <div className="success-message" style={{ marginTop: 12, color: "green" }}>
                  {message}
                </div>
              )}
              {status === "error" && (
                <div className="general-error" style={{ marginTop: 12 }}>
                  {message}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <Link to="/login" className="auth-btn" style={{ textDecoration: "none", textAlign: "center" }}>
                  Go to login
                </Link>
                <Link to="/" className="google-btn" style={{ textDecoration: "none", textAlign: "center" }}>
                  Back home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;


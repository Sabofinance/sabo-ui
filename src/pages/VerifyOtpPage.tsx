import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { useAuth } from "../context/AuthContext";
import "../assets/css/AuthPage.css";
import loginImage from "../assets/images/3d-illustration-login.png";

const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();
  const [generalError, setGeneralError] = useState("");
  const [email, setEmail] = useState("");

  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: 6 }, () => ""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const [secondsLeft, setSecondsLeft] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const otp = useMemo(() => digits.join(""), [digits]);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem('pendingEmail');
    if (!pendingEmail) {
      navigate('/login');
    } else {
      setEmail(pendingEmail);
    }
  }, [navigate]);

  useEffect(() => {
    setSecondsLeft(60);
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    try {
      if (otp.length !== 6) {
        setGeneralError("Please enter the 6-digit code.");
        return;
      }
      setSubmitting(true);
      await verifyOtp({ email, otp });
      navigate('/dashboard');
    } catch (error: any) {
      setGeneralError(error.message || "Invalid OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || resending) return;
    setGeneralError("");
    setResending(true);
    try {
     navigate('/login');
    } catch (err: any) {
      setGeneralError(err?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const focusIndex = (i: number) => {
    const el = inputsRef.current[i];
    if (el) el.focus();
  };

  const setDigit = (i: number, v: string) => {
    const next = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const copy = [...prev];
      copy[i] = next;
      return copy;
    });
    if (next && i < 5) focusIndex(i + 1);
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      focusIndex(i - 1);
      setDigits((prev) => {
        const copy = [...prev];
        copy[i - 1] = "";
        return copy;
      });
    }
    if (e.key === "ArrowLeft" && i > 0) focusIndex(i - 1);
    if (e.key === "ArrowRight" && i < 5) focusIndex(i + 1);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text") || "";
    const nums = text.replace(/\D/g, "").slice(0, 6).split("");
    if (!nums.length) return;
    e.preventDefault();
    setDigits((prev) => {
      const copy = [...prev];
      for (let i = 0; i < 6; i++) copy[i] = nums[i] ?? "";
      return copy;
    });
    focusIndex(Math.min(nums.length, 6) - 1);
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

              <form onSubmit={onSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">
                    OTP Code
                  </label>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 10 }}>
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputsRef.current[i] = el;
                        }}
                        value={d}
                        onChange={(e) => setDigit(i, e.target.value)}
                        onKeyDown={(e) => onKeyDown(i, e)}
                        onPaste={onPaste}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        aria-label={`OTP digit ${i + 1}`}
                        style={{
                          width: 44,
                          height: 52,
                          textAlign: "center",
                          fontSize: 18,
                          fontWeight: 700,
                          borderRadius: 10,
                          border: "1px solid #E2E8F0",
                          outline: "none",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ marginTop: 10, textAlign: "center", color: "#64748B", fontSize: 13 }}>
                    {secondsLeft > 0 ? (
                    <>You can request a new OTP in {secondsLeft}s</>
                    ) : (
                    <div>
                      <button
                        type="button"
                        className="auth-btn"
                        style={{ width: "auto", padding: "8px 16px", marginTop: 8 }}
                        onClick={handleResend}
                        disabled={resending}
                      >
                        {resending ? "Resending..." : "Resend OTP"}
                      </button>
                      <div style={{ marginTop: 6 }}>
                        Didn’t get a code? Resend OTP to {email}.
                      </div>
                    </div>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="auth-btn" 
                  disabled={submitting || otp.length !== 6}
                >
                  {submitting ? "Verifying..." : "Verify OTP"}
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
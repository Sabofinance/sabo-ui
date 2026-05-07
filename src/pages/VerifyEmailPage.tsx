import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import authApi from "../lib/api/auth.api";
import { Header } from "../components/Header";
import { CircleCheckBig, Mail, TriangleAlert } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

/* ─── tiny inline styles kept as objects so no extra CSS file is needed ─── */
const styles = {
  root: {
    minHeight: "100vh",
    background: "#faf9f7",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    flexDirection: "column" as const,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    borderBottom: "0.5px solid #e3e0d9",
    background: "#fff",
  },
  logo: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 22,
    color: "#1a1916",
    letterSpacing: "-0.3px",
    textDecoration: "none",
  },
  navLink: {
    fontSize: 13,
    color: "#888780",
    textDecoration: "none",
  },
  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
  },
  card: {
    background: "#fff",
    border: "0.5px solid #e3e0d9",
    borderRadius: 20,
    width: "100%",
    maxWidth: 480,
    overflow: "hidden",
    boxShadow: "0 2px 32px rgba(0,0,0,0.06)",
  },
  cardTop: {
    background: "#f5f2ee",
    padding: "40px 44px 32px",
    borderBottom: "0.5px solid #e3e0d9",
    textAlign: "center" as const,
  },
  steps: {
    display: "flex",
    justifyContent: "center",
    gap: 6,
    marginBottom: 24,
  },
  cardBody: { padding: "32px 44px" },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 26,
    fontWeight: 400,
    color: "#1a1916",
    margin: "0 0 8px",
    letterSpacing: "-0.3px",
  },
  subtitle: {
    fontSize: 14,
    color: "#888780",
    margin: 0,
    lineHeight: 1.6,
    fontWeight: 300,
  },
  actions: { display: "flex", gap: 10, marginBottom: 24 },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "24px 0",
  },
  dividerLine: { flex: 1, height: "0.5px", background: "#e3e0d9" },
  dividerText: { fontSize: 12, color: "#b4b2a9" },
};

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function IconRing({ status }: { status: Status }) {
const map: Record<
  Status,
  {
    ring: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  idle: {
    ring: "",
    bg: "#fff",
    border: "#d3d1c7",
    icon: <Mail className="w-6 h-6" />,
  },

  loading: {
    ring: "pulse",
    bg: "#EEEDFE",
    border: "#AFA9EC",
    icon: <Mail className="w-6 h-6" />,
  },

  success: {
    ring: "",
    bg: "#E1F5EE",
    border: "#5DCAA5",
    icon: <CircleCheckBig className="w-6 h-6 text-green-600" />,
  },

  error: {
    ring: "",
    bg: "#FCEBEB",
    border: "#F09595",
    icon: <TriangleAlert className="w-6 h-6 text-red-500" />,
  },
};
  const { bg, border, icon } = map[status];
  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        border: `1.5px solid ${border}`,
        background: bg,
        transition: "all 0.4s ease",
      }}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
    </div>
  );
}

function StepBar({ status }: { status: Status }) {
  const stepStyle = (active: boolean, done: boolean) => ({
    height: 4,
    borderRadius: 2,
    background: done ? "#1D9E75" : active ? "#534AB7" : "#d3d1c7",
    transition: "all 0.4s ease",
  });
  return (
    <div style={styles.steps}>
      <div style={{ ...stepStyle(false, true), width: 16 }} />
      <div
        style={{
          ...stepStyle(status !== "idle", status === "success"),
          width: 32,
        }}
      />
      <div style={{ ...stepStyle(false, status === "success"), width: 16 }} />
    </div>
  );
}

function StatusBox({ status, message }: { status: Status; message: string }) {
  if (status === "idle" || !message) return null;
  const map = {
    loading: { bg: "#EEEDFE", color: "#3C3489" },
    success: { bg: "#E1F5EE", color: "#085041" },
    error: { bg: "#FCEBEB", color: "#791F1F" },
  } as const;
  const { bg, color } = map[status as keyof typeof map];
  return (
    <div
      style={{
        background: bg,
        color,
        borderRadius: 12,
        padding: "16px 18px",
        fontSize: 14,
        lineHeight: 1.6,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 24,
      }}
    >
      {status === "loading" ? (
        <Spinner />
      ) : (
        <span style={{ fontSize: 16, marginTop: 1 }}>
          {status === "success" ? "✓" : "!"}
        </span>
      )}
      <span>{message}</span>
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 16,
        height: 16,
        border: "2px solid #AFA9EC",
        borderTopColor: "#534AB7",
        borderRadius: "50%",
        flexShrink: 0,
        marginTop: 2,
        animation: "vep-spin 0.8s linear infinite",
      }}
    />
  );
}

function Btn({
  to,
  primary,
  children,
}: {
  to: string;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      style={{
        flex: 1,
        padding: "12px 16px",
        borderRadius: 10,
        fontSize: 14,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        cursor: "pointer",
        textAlign: "center",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        border: "0.5px solid",
        transition: "all 0.18s ease",
        ...(primary
          ? { background: "#1a1916", color: "#faf9f7", borderColor: "#1a1916" }
          : {
              background: "transparent",
              color: "#5F5E5A",
              borderColor: "#d3d1c7",
            }),
      }}
    >
      {children}
    </Link>
  );
}

/* ─── main component ──────────────────────────────────────────────────────── */

const cardCopy: Record<Status, { title: string; subtitle: string }> = {
  idle: {
    title: "Check your inbox",
    subtitle: "Use the link we sent to verify your email address.",
  },
  loading: {
    title: "Verify your email",
    subtitle: "We're confirming your email address — just a moment.",
  },
  success: {
    title: "Email confirmed!",
    subtitle: "Your account is now active and ready to use.",
  },
  error: {
    title: "Verification failed",
    subtitle: "Something went wrong. Try requesting a fresh link.",
  },
};

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus("error");
        setMessage(
          "Missing verification token. Please use the link in your email.",
        );
        return;
      }
      setStatus("loading");
      setMessage("Verifying your token, please hold on…");
      const res = await authApi.verifyEmail(token);
      if (res.success) {
        setStatus("success");
        setMessage("Email verified successfully. You can now sign in.");
      } else {
        setStatus("error");
        setMessage(
          res.error?.message ||
            "Email verification failed. Please request a new verification link.",
        );
      }
    };
    void run();
  }, [token]);

  const { title, subtitle } = cardCopy[status];

  return (
    <>
      {/* Inject spin keyframe once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes vep-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={styles.root}>
        {/* Header */}
     <Header/>
        {/* Main */}
        <main style={styles.main}>
          <div style={styles.card}>
            {/* Card top */}
            <div style={styles.cardTop}>
              <StepBar status={status} />
              <IconRing status={status} />
              <h1 style={styles.heading}>{title}</h1>
              <p style={styles.subtitle}>{subtitle}</p>
            </div>

            {/* Card body */}
            <div style={styles.cardBody}>
              <StatusBox status={status} message={message} />

              <div style={styles.actions}>
                <Btn to="/login" primary>
                  → Go to login
                </Btn>
                <Btn to="/">⌂ Back home</Btn>
              </div>

              <div style={styles.divider}>
                <div style={styles.dividerLine} />
                <span style={styles.dividerText}>didn't get an email?</span>
                <div style={styles.dividerLine} />
              </div>

              <Btn to="/resend">↻ Resend verification link</Btn>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default VerifyEmailPage;

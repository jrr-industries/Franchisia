import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, ArrowLeft, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";

const inputStyle = {
  width: 48,
  height: 56,
  fontSize: 24,
  fontWeight: 700,
  textAlign: "center",
  border: "2px solid var(--outline-variant)",
  borderRadius: 10,
  backgroundColor: "var(--surface-container-low)",
  color: "var(--on-surface)",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const focusedInputStyle = {
  ...inputStyle,
  borderColor: "var(--primary)",
  boxShadow: "0 0 0 3px rgba(37,99,235,0.15)",
};

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user, sendVerificationEmail, verifyOtp, resendOtp, refreshSession } = useAuth();
  const { addToast } = useToast();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const inputRefs = useRef([]);
  const otpSentRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    if (user?.emailVerified) {
      const hasRole = user?.role && user?.role !== "none";
      if (hasRole) navigate("/dashboard", { replace: true });
      else navigate("/onboarding/select-role", { replace: true });
      return;
    }
    if (otpSentRef.current) return;
    otpSentRef.current = true;
    const fetchOtp = async () => {
      try {
        await sendVerificationEmail();
        setOtpSent(true);
      } catch (err) {
        addToast(err.message, "error");
      }
    };
    fetchOtp();
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (status === "success") return;
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
    setCanResend(true);
  }, [timer, status]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setMessage("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  }, []);

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setMessage("Please enter all 6 digits");
      return;
    }
    setIsVerifying(true);
    setStatus("verifying");
    try {
      await verifyOtp(code);
      setStatus("success");
      setMessage("Email verified successfully!");
      await refreshSession();
      addToast("Email verified! Welcome to Franchisia.", "success");
      setTimeout(() => navigate("/onboarding/select-role"), 2000);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Invalid code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendOtp();
      setOtp(["", "", "", "", "", ""]);
      setTimer(30);
      setCanResend(false);
      setStatus("idle");
      setMessage("New code sent to your email");
      addToast("New verification code sent", "success");
      inputRefs.current[0]?.focus();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsResending(false);
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (status === "success") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={28} style={{ color: "var(--accent)" }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Email Verified!</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
            Your email has been successfully verified. Redirecting to onboarding...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%" }}>
        <div style={{ marginBottom: 32 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 22, color: "var(--primary)", marginBottom: 24, textDecoration: "none" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--primary)", display: "inline-block" }} />
            Franchisia
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: "var(--on-surface)" }}>Verify Your Email</h1>
          <p style={{ color: "var(--on-surface-variant)", fontSize: 15, lineHeight: 1.6 }}>
            Enter the 6-digit verification code sent to <strong style={{ color: "var(--on-surface)" }}>{user?.email || email}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              onFocus={(e) => e.target.select()}
              style={otp[index] ? focusedInputStyle : inputStyle}
              disabled={isVerifying}
            />
          ))}
        </div>

        {message && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14,
            fontWeight: 500,
            backgroundColor: status === "error" ? "#FEE2E2" : status === "success" ? "#DCFCE7" : status === "verifying" ? "#EFF6FF" : "#F0F9FF",
            color: status === "error" ? "#991B1B" : status === "success" ? "#166534" : "#1E40AF",
          }}>
            {status === "error" && <XCircle size={16} />}
            {status === "success" && <CheckCircle size={16} />}
            {status === "verifying" && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {message}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={isVerifying || otp.join("").length !== 6}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "12px 24px",
            borderRadius: 10,
            border: "none",
            backgroundColor: "var(--primary)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: isVerifying || otp.join("").length !== 6 ? "not-allowed" : "pointer",
            opacity: isVerifying || otp.join("").length !== 6 ? 0.6 : 1,
            transition: "all 0.2s",
            marginBottom: 20,
          }}
        >
          {isVerifying ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
          {isVerifying ? "Verifying..." : "Verify Email"}
        </button>

        <div style={{ textAlign: "center" }}>
          {!canResend ? (
            <p style={{ color: "var(--on-surface-variant)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Clock size={14} />
              Resend code in {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontSize: 14,
                fontWeight: 600,
                cursor: isResending ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                opacity: isResending ? 0.6 : 1,
              }}
            >
              {isResending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

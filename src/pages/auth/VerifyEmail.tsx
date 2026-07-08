import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { authClient } from "../../lib/auth-client";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const callbackURL = searchParams.get("callbackURL");
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const verify = async () => {
      try {
        const { error } = await authClient.verifyEmail({ token });
        if (error) {
          setStatus("error");
        } else {
          setStatus("success");
          if (callbackURL) {
            setTimeout(() => {
              window.location.href = callbackURL;
            }, 2000);
          }
        }
      } catch {
        setStatus("error");
      }
    };
    verify();
  }, [token, callbackURL]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        {status === "verifying" && (
          <>
            <Loader2 size={48} style={{ animation: "spin 1s linear infinite", color: "var(--primary)", marginBottom: 24 }} />
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Verifying your email...</h1>
            <p style={{ color: "var(--text-secondary)" }}>Please wait while we verify your email address.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <CheckCircle size={28} style={{ color: "var(--accent)" }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Email Verified!</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
              Your email has been successfully verified. You can now access all features.
            </p>
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14 }}>
              Continue to Login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <XCircle size={28} style={{ color: "var(--danger)" }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Verification Failed</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
              The verification link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14 }}>
              Back to Login
            </Link>
          </>
        )}
        {status === "invalid" && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <XCircle size={28} style={{ color: "var(--danger)" }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Invalid Link</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
              No verification token found. Please check your email for the correct link.
            </p>
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14 }}>
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

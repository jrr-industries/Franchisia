import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await forgotPassword(data.email);
      setSent(true);
      addToast("Password reset email sent.", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Mail size={28} style={{ color: "var(--accent)" }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Password reset email sent</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.6 }}>
            Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
          </p>
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%" }}>
        <div style={{ marginBottom: 32 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 22, color: "var(--primary)", marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--primary)", display: "inline-block" }} />
            Franchisia
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Forgot Password?</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            Enter your email address and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input
                {...register("email")}
                type="email"
                placeholder="john@example.com"
                style={{ width: "100%", padding: "10px 16px 10px 36px", fontSize: 14, color: "var(--text)", backgroundColor: "var(--surface)", border: "2px solid var(--border)", borderRadius: "var(--radius-sm)", outline: "none" }}
              />
            </div>
            {errors.email && <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "12px 24px",
              borderRadius: "var(--radius-sm)",
              border: "2px solid var(--primary)",
              backgroundColor: "var(--primary)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24 }}>
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

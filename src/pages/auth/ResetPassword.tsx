import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";

const resetSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      addToast("Invalid or missing reset token.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(data.password, token);
      setSuccess(true);
      addToast("Password reset successfully!", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={28} style={{ color: "var(--accent)" }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Password Reset</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.6 }}>
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <Link
            to="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 32px",
              borderRadius: "var(--radius-sm)",
              border: "2px solid var(--primary)",
              backgroundColor: "var(--primary)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign In
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
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Reset Password</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>New Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                style={{ width: "100%", padding: "10px 36px", fontSize: 14, color: "var(--text)", backgroundColor: "var(--surface)", border: "2px solid var(--border)", borderRadius: "var(--radius-sm)", outline: "none" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{errors.password.message}</p>}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>Confirm New Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input
                {...register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                style={{ width: "100%", padding: "10px 36px", fontSize: 14, color: "var(--text)", backgroundColor: "var(--surface)", border: "2px solid var(--border)", borderRadius: "var(--radius-sm)", outline: "none" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !token}
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
              opacity: isSubmitting || !token ? 0.7 : 1,
            }}
          >
            {isSubmitting ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24 }}>
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14 }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

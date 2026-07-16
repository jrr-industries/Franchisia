import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";

const signupSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  confirmPassword: z.string(),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const inputStyle = {
  width: "100%",
  padding: "10px 16px",
  fontSize: 14,
  color: "var(--on-surface)",
  backgroundColor: "var(--surface-container-low)",
  border: "1px solid var(--outline-variant)",
  borderRadius: 10,
  outline: "none",
  transition: "border-color 0.2s",
};

const socialBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  width: "100%",
  padding: "12px 16px",
  borderRadius: 10,
  border: "1px solid var(--outline-variant)",
  backgroundColor: "var(--surface)",
  color: "var(--on-surface)",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const primaryBtnStyle = {
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
  cursor: "pointer",
  transition: "all 0.2s",
};

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginSocial, socialLoading } = useAuth();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await signup(data.name, data.email, data.password);
      addToast("Account created! Check your email for the verification code.", "success");
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  const handleSocialLogin = async (provider) => {
    if (socialLoading) return;
    try {
      await loginSocial(provider);
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div data-page="signup" style={{ minHeight: "100vh", display: "flex" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "var(--surface)" }}>
        <div style={{ maxWidth: 420, width: "100%" }}>
          <div style={{ marginBottom: 40 }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 22, color: "var(--primary)", marginBottom: 32, textDecoration: "none" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--primary)", display: "inline-block" }} />
              Franchisia
            </Link>
            <h1 className="auth-title" style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: "var(--on-surface)" }}>Create your account</h1>
            <p style={{ color: "var(--on-surface-variant)", fontSize: 15 }}>Join the professional franchise network.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => handleSocialLogin("google")}
              disabled={!!socialLoading}
              style={{ ...socialBtnStyle, opacity: socialLoading === "google" ? 0.7 : socialLoading && socialLoading !== "google" ? 0.5 : 1, cursor: socialLoading ? "not-allowed" : "pointer" }}
            >
              {socialLoading === "google" ? (
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              )}
              {socialLoading === "google" ? "Redirecting..." : "Continue with Google"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "var(--outline-variant)" }} />
            <span style={{ color: "var(--on-surface-variant)", fontSize: 13, fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "var(--outline-variant)" }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--on-surface)" }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--on-surface-variant)", pointerEvents: "none" }} />
                <input
                  {...register("name")}
                  placeholder="John Doe"
                  style={{ ...inputStyle, paddingLeft: 36 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,74,198,0.15)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              {errors.name && <p style={{ fontSize: 12, color: "var(--error)", marginTop: 4 }}>{errors.name.message}</p>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--on-surface)" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--on-surface-variant)", pointerEvents: "none" }} />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="john@example.com"
                  style={{ ...inputStyle, paddingLeft: 36 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,74,198,0.15)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              {errors.email && <p style={{ fontSize: 12, color: "var(--error)", marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--on-surface)" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--on-surface-variant)", pointerEvents: "none" }} />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,74,198,0.15)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--on-surface-variant)", cursor: "pointer", display: "flex" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 12, color: "var(--error)", marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--on-surface)" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--on-surface-variant)", pointerEvents: "none" }} />
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,74,198,0.15)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--on-surface-variant)", cursor: "pointer", display: "flex" }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p style={{ fontSize: 12, color: "var(--error)", marginTop: 4 }}>{errors.confirmPassword.message}</p>}
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <input
                {...register("agreeTerms")}
                type="checkbox"
                id="agreeTerms"
                style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--primary)" }}
              />
              <label htmlFor="agreeTerms" style={{ fontSize: 13, color: "var(--on-surface-variant)", lineHeight: 1.5 }}>
                I agree to the <Link to="/terms" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Privacy Policy</Link>.
              </label>
            </div>
            {errors.agreeTerms && <p style={{ fontSize: 12, color: "var(--error)", marginTop: -8 }}>{errors.agreeTerms.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting || !!socialLoading}
              style={{
                ...primaryBtnStyle,
                opacity: isSubmitting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,74,198,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              {isSubmitting ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--on-surface-variant)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 480px) {
          [data-page="signup"] > div:first-child { padding: 16px !important; }
          [data-page="signup"] .auth-title { font-size: 24px !important; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

import { useState } from "react";
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

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginSocial } = useAuth();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await signup(data.name, data.email, data.password);
      setVerificationEmail(data.email);
      setVerificationSent(true);
      addToast("Account created! Please check your email for verification.", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      await loginSocial(provider);
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  if (verificationSent) {
    return (
      <div style={{ minHeight: "100vh", display: "flex" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Mail size={28} style={{ color: "var(--accent)" }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Check your email</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.6 }}>
              We've sent a verification link to
            </p>
            <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 24 }}>{verificationEmail}</p>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
              Please verify your email before logging in.
            </p>
            <button
              onClick={() => {}}
              style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 16 }}
            >
              Resend Email
            </button>
            <div>
              <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14 }}>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 440, width: "100%" }}>
          <div style={{ marginBottom: 32 }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 22, color: "var(--primary)", marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--primary)", display: "inline-block" }} />
              Franchisia
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create your account</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Join the professional franchise network.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => handleSocialLogin("google")}
              style={socialBtnStyle}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button
              onClick={() => handleSocialLogin("linkedin")}
              style={socialBtnStyle}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Continue with LinkedIn
            </button>
            <button
              onClick={() => handleSocialLogin("facebook")}
              style={socialBtnStyle}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Continue with Facebook
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input
                  {...register("name")}
                  placeholder="John Doe"
                  style={{ ...inputStyle, paddingLeft: 36 }}
                />
              </div>
              {errors.name && <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{errors.name.message}</p>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="john@example.com"
                  style={{ ...inputStyle, paddingLeft: 36 }}
                />
              </div>
              {errors.email && <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36 }}
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
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{errors.confirmPassword.message}</p>}
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <input
                {...register("agreeTerms")}
                type="checkbox"
                id="agreeTerms"
                style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--primary)" }}
              />
              <label htmlFor="agreeTerms" style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                I agree to the <Link to="/terms" style={{ color: "var(--primary)", fontWeight: 500 }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: "var(--primary)", fontWeight: 500 }}>Privacy Policy</Link>.
              </label>
            </div>
            {errors.agreeTerms && <p style={{ fontSize: 12, color: "var(--danger)", marginTop: -8 }}>{errors.agreeTerms.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...primaryBtnStyle,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const socialBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  width: "100%",
  padding: "12px 16px",
  borderRadius: "var(--radius-sm)",
  border: "2px solid var(--border)",
  backgroundColor: "var(--surface)",
  color: "var(--text)",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const inputStyle = {
  width: "100%",
  padding: "10px 16px",
  fontSize: 14,
  color: "var(--text)",
  backgroundColor: "var(--surface)",
  border: "2px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  outline: "none",
  transition: "border-color 0.2s",
};

const primaryBtnStyle = {
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
  transition: "all 0.2s",
};

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import { Loader2, Rocket } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:3001/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to complete onboarding");
      const data = await res.json();
      updateUser({ ...user, onboardingCompleted: true });
      addToast("Welcome to Franchisia!", "success");
      navigate("/dashboard");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "var(--background)" }}>
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Rocket size={36} style={{ color: "var(--primary)" }} />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Welcome to Franchisia!</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
          You're all set to start exploring franchise opportunities. 
          Connect with franchisors, discover investment opportunities, 
          and grow your professional network.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 40 }}>
          {[
            { title: "Discover", desc: "Browse franchise opportunities" },
            { title: "Connect", desc: "Network with industry leaders" },
            { title: "Grow", desc: "Build your franchise portfolio" },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                padding: 20,
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 40px",
            borderRadius: "var(--radius-sm)",
            border: "2px solid var(--primary)",
            backgroundColor: "var(--primary)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
          {isSubmitting ? "Setting up..." : "Get Started"}
        </button>
      </div>
    </div>
  );
}

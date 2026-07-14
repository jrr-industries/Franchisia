import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle, Loader2 } from "lucide-react";
import { useNewsletterSubscribe, usePublicSettings, getSectionContent } from "../hooks/useCMS";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const subscribe = useNewsletterSubscribe();
  const { data: sectionSettings } = usePublicSettings();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate({ email, name: name || undefined });
  };

  if (subscribe.isSuccess) {
    return (
      <section style={{ padding: "80px 0", backgroundColor: "var(--primary)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <CheckCircle size={48} color="#fff" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 8 }}>You're subscribed!</h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }}>Stay tuned for franchise insights and opportunities.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--primary)" }}>
      <div className="container" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Mail size={36} color="#fff" style={{ margin: "0 auto 16px", opacity: 0.9 }} />
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{getSectionContent(sectionSettings, 'newsletter', { heading: 'Stay Updated' }).heading}</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
            {getSectionContent(sectionSettings, 'newsletter', { description: 'Get franchise opportunities and industry insights delivered directly to your inbox.' }).description}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, maxWidth: 500, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                flex: "0 1 200px", padding: "14px 18px", borderRadius: 10, border: "none",
                fontSize: 14, outline: "none", backgroundColor: "rgba(255,255,255,0.15)",
                color: "#fff", placeholder: { color: "rgba(255,255,255,0.5)" },
              }}
            />
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: "1 1 220px", padding: "14px 18px", borderRadius: 10, border: "none",
                fontSize: 14, outline: "none", backgroundColor: "rgba(255,255,255,0.15)",
                color: "#fff", minWidth: 200,
              }}
            />
            <button
              type="submit"
              disabled={subscribe.isPending}
              style={{
                padding: "14px 28px", borderRadius: 10, border: "none", backgroundColor: "#fff",
                color: "var(--primary)", fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8, transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              {subscribe.isPending ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              Subscribe
            </button>
          </form>

          {subscribe.isError && (
            <p style={{ marginTop: 16, fontSize: 13, color: "rgba(255,200,200,0.9)" }}>
              {subscribe.error?.message || "Something went wrong. Try again."}
            </p>
          )}
        </motion.div>
      </div>
      <style>{`
        input::placeholder { color: rgba(255,255,255,0.5); }
      `}</style>
    </section>
  );
}

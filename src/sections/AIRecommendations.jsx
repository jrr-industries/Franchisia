import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Brain, TrendingUp, Bell } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Smart Matching",
    desc: "AI analyzes your profile to find the best franchise fit",
  },
  {
    icon: TrendingUp,
    title: "Predictive Insights",
    desc: "Data-driven projections for growth potential",
  },
  {
    icon: Bell,
    title: "Personalized Alerts",
    desc: "Get notified when opportunities match your criteria",
  },
];

export default function AIRecommendations() {
  const navigate = useNavigate();

  const handleNotifyMe = () => {
    navigate("/");
    setTimeout(() => {
      const el = document.getElementById("newsletter");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>AI-Powered Franchise Matching</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            Receive personalized recommendations based on your interests and investment goals.
          </p>
        </motion.div>

        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "linear-gradient(135deg, var(--primary), #2563eb)",
              marginBottom: 24,
              boxShadow: "0 8px 32px rgba(0,74,198,0.2)",
            }}
          >
            <Sparkles size={48} color="#fff" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: 20,
              backgroundColor: "rgba(0,74,198,0.1)",
              color: "var(--primary)",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 32,
            }}
          >
            Coming Soon
          </motion.div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 900, margin: "0 auto 40px" }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              style={{
                padding: 24,
                backgroundColor: "var(--surface)",
                border: "1px solid var(--outline-variant)",
                borderRadius: 12,
                textAlign: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <f.icon size={32} color="var(--primary)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--on-surface)", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "var(--on-surface-variant)", lineHeight: 1.5 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{ textAlign: "center" }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNotifyMe}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 10,
              border: "none",
              backgroundColor: "var(--primary)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,74,198,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          >
            <Bell size={18} />
            Notify Me When Available
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

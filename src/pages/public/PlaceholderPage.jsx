import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Construction, FileText, Users, Briefcase, Calendar } from "lucide-react";
import Button from "../../components/ui/Button";

const sectionIcon = {
  blog: FileText,
  partners: Users,
  careers: Briefcase,
  events: Calendar,
};

const cardPlaceholders = {
  blog: [
    { title: "Industry Insights", desc: "Latest trends and analysis from franchise industry experts." },
    { title: "Success Stories", desc: "Real stories from franchisors and franchisees who grew their business." },
    { title: "Expert Guides", desc: "Step-by-step guides to help you navigate the franchise world." },
    { title: "Company News", desc: "Updates and announcements from the Franchisia team." },
  ],
  partners: [
    { title: "Technology Partners", desc: "Software and tools to streamline franchise operations." },
    { title: "Financial Partners", desc: "Banks, investors, and financial institutions for funding." },
    { title: "Service Providers", desc: "Legal, marketing, and consulting services for franchises." },
    { title: "Supplier Network", desc: "Trusted suppliers for franchise operations worldwide." },
  ],
  careers: [
    { title: "Engineering", desc: "Build the future of franchise networking technology." },
    { title: "Product & Design", desc: "Create intuitive experiences for our global community." },
    { title: "Sales & Marketing", desc: "Help franchises grow their reach and impact." },
    { title: "Operations", desc: "Keep our platform running smoothly for millions of users." },
  ],
  events: [
    { title: "Franchise Expos", desc: "Meet franchisors and explore opportunities in person." },
    { title: "Webinars", desc: "Learn from industry leaders in live online sessions." },
    { title: "Networking Meetups", desc: "Connect with professionals in your area." },
    { title: "Workshops", desc: "Hands-on sessions to develop your franchise skills." },
  ],
};

export default function PlaceholderPage({ title, description, type = "page" }) {
  const Icon = sectionIcon[type] || Construction;
  const cards = cardPlaceholders[type] || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ padding: "60px 0 40px", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container" style={{ maxWidth: 1000, margin: "0 auto" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
            <Link to="/" style={{ color: "var(--primary)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span>{title}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ padding: "48px 32px", borderRadius: 16, background: "linear-gradient(135deg, var(--primary-light), var(--surface))", border: "1px solid var(--border)", marginBottom: 32 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Icon size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{title}</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 600 }}>
                  {description || `This page is coming soon and will be available in a future update. Stay tuned for exciting content and features.`}
                </p>
              </div>
            </div>
          </motion.div>

          {cards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "var(--text-secondary)" }}>Coming Soon</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
                {cards.map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ y: -4 }}
                    style={{ padding: 24, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "var(--primary)" }}>
                      <Icon size={20} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{card.title}</h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{card.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ textAlign: "center", padding: "40px 24px", borderRadius: 16, border: "1px dashed var(--border)", backgroundColor: "var(--background)" }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              style={{ marginBottom: 16 }}
            >
              <Construction size={40} color="var(--primary)" style={{ opacity: 0.6 }} />
            </motion.div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
              This section is under development. Content will be managed through the Admin CMS.
            </p>
            <Link to="/">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="primary" icon={<ArrowLeft size={16} />}>Back to Home</Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
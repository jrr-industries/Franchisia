import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Handshake, Building2, Landmark, Scale, Megaphone, Users, Globe, Mail } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const partnerCategories = [
  { icon: Building2, title: "Technology Partners", desc: "Software, platforms, and tools for franchise operations.", count: 0 },
  { icon: Landmark, title: "Banking & Finance", desc: "Banks, lenders, and investment partners.", count: 0 },
  { icon: Scale, title: "Legal Partners", desc: "Law firms specializing in franchise law.", count: 0 },
  { icon: Megaphone, title: "Marketing Partners", desc: "Agencies and marketing service providers.", count: 0 },
];

export default function Partners() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section style={{ padding: "60px 0 40px", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container" style={{ maxWidth: 1000, margin: "0 auto" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
            <Link to="/" style={{ color: "var(--primary)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span>Partners</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ padding: "48px 32px", borderRadius: 16, background: "linear-gradient(135deg, var(--primary-light), var(--surface))", border: "1px solid var(--border)", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Handshake size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Partners</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 600 }}>
                  We collaborate with leading organizations to deliver the best franchise experience.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Handshake size={18} color="var(--primary)" /> Partner Categories
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {partnerCategories.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
                    whileHover={{ y: -4 }} style={{ padding: 24, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "var(--primary)" }}>
                      <Icon size={20} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{p.title}</h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8 }}>{p.desc}</p>
                    <Badge variant="default" style={{ fontSize: 10 }}>{p.count} partners</Badge>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ textAlign: "center", padding: "48px 24px", borderRadius: 12, border: "1px dashed var(--border)", backgroundColor: "var(--background)", marginBottom: 32 }}>
            <Users size={40} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Become a Partner</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Partner listings will appear here once the Admin CMS is configured.</p>
            <Button variant="primary" size="sm" icon={<Mail size={14} />}>Contact Partnerships Team</Button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            style={{ textAlign: "center", padding: "32px 24px", borderRadius: 12, border: "1px dashed var(--border)", backgroundColor: "var(--surface-container-lowest)", marginBottom: 32 }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Partner data will be managed through the Admin CMS.</p>
            <Link to="/"><motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Button variant="outline" size="sm" icon={<ArrowLeft size={14} />}>Back to Home</Button></motion.div></Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
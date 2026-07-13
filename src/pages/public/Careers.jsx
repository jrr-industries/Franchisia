import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, MapPin, Clock, DollarSign, Users, Heart, Target, Award, Star, Search } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const benefits = [
  { icon: Target, title: "Remote First", desc: "Work from anywhere in the world." },
  { icon: Award, title: "Learning Budget", desc: "Annual budget for courses and conferences." },
  { icon: Heart, title: "Health Coverage", desc: "Comprehensive medical, dental, and vision." },
  { icon: Star, title: "Equity", desc: "Stock options for all full-time employees." },
];

const departments = ["Engineering", "Product", "Design", "Marketing", "Sales", "Operations"];

const sampleJobs = [];

export default function Careers() {
  const [activeDept, setActiveDept] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = sampleJobs.filter(j =>
    (activeDept === "All" || j.department === activeDept) &&
    (!search || j.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section style={{ padding: "60px 0 40px", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container" style={{ maxWidth: 1000, margin: "0 auto" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
            <Link to="/" style={{ color: "var(--primary)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span>Careers</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ padding: "48px 32px", borderRadius: 16, background: "linear-gradient(135deg, var(--primary-light), var(--surface))", border: "1px solid var(--border)", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Briefcase size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Careers at Franchisia</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 600 }}>
                  Join our mission to transform the franchise industry. We're building the future of franchise networking.
                </p>
              </div>
            </div>
            <div style={{ position: "relative", maxWidth: 480 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search open positions..." style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Heart size={18} color="var(--primary)" /> Life & Benefits
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {benefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
                    whileHover={{ y: -4 }} style={{ padding: 24, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--primary)" }}>
                      <Icon size={20} />
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{b.title}</h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{b.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Open Positions</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {["All", ...departments].map(d => (
                <button key={d} onClick={() => setActiveDept(d)}
                  style={{ padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, border: "1px solid", cursor: "pointer",
                    borderColor: activeDept === d ? "var(--primary)" : "var(--border)", backgroundColor: activeDept === d ? "var(--primary-light)" : "transparent", color: activeDept === d ? "var(--primary)" : "var(--text-secondary)", transition: "all 0.15s" }}>
                  {d}
                </button>
              ))}
            </div>
            {filtered.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filtered.map((job, i) => (
                  <motion.div key={job.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    whileHover={{ y: -2 }} style={{ padding: 20, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, cursor: "pointer" }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{job.title}</h3>
                      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Briefcase size={14} /> {job.department}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={14} /> {job.location}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> {job.type}</span>
                      </div>
                    </div>
                    <Button size="sm">Apply</Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "48px 24px", borderRadius: 12, border: "1px dashed var(--border)", backgroundColor: "var(--background)" }}>
                <Users size={40} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No openings available currently.</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>We're always looking for great talent. Check back soon!</p>
              </motion.div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ textAlign: "center", padding: "32px 24px", borderRadius: 12, border: "1px dashed var(--border)", backgroundColor: "var(--surface-container-lowest)", marginBottom: 32 }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Job listings will be managed through the Admin CMS.</p>
            <Link to="/"><motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Button variant="outline" size="sm" icon={<ArrowLeft size={14} />}>Back to Home</Button></motion.div></Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Globe, Monitor, Handshake, Network, Search } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const eventTypes = ["All", "Expo", "Meetup", "Webinar", "Workshop"];

const sampleEvents = [];

export default function Events() {
  const [activeType, setActiveType] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = sampleEvents.filter(e =>
    (activeType === "All" || e.type === activeType) &&
    (!search || e.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section style={{ padding: "60px 0 40px", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container" style={{ maxWidth: 1000, margin: "0 auto" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
            <Link to="/" style={{ color: "var(--primary)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span>Events</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ padding: "48px 32px", borderRadius: 16, background: "linear-gradient(135deg, var(--primary-light), var(--surface))", border: "1px solid var(--border)", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Calendar size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Events</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 600 }}>
                  Discover franchise expos, networking events, webinars, and workshops.
                </p>
              </div>
            </div>
            <div style={{ position: "relative", maxWidth: 480 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
          </motion.div>

          <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
            {eventTypes.map(t => (
              <button key={t} onClick={() => setActiveType(t)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, border: "1px solid", cursor: "pointer",
                  borderColor: activeType === t ? "var(--primary)" : "var(--border)", backgroundColor: activeType === t ? "var(--primary-light)" : "transparent", color: activeType === t ? "var(--primary)" : "var(--text-secondary)", transition: "all 0.15s" }}>
                {t === "Expo" && <Globe size={14} />}
                {t === "Meetup" && <Handshake size={14} />}
                {t === "Webinar" && <Monitor size={14} />}
                {t === "Workshop" && <Users size={14} />}
                {t}
              </button>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={18} color="var(--primary)" /> Upcoming Events
            </h2>
            {filtered.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {filtered.map((event, i) => (
                  <motion.div key={event.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    whileHover={{ y: -2 }} style={{ padding: 20, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}>
                        {event.type === "Webinar" ? <Monitor size={20} /> : event.type === "Meetup" ? <Handshake size={20} /> : <Globe size={20} />}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{event.title}</h3>
                        <div style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--text-muted)", flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={14} /> {event.date}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={14} /> {event.location}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> {event.time}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="info" style={{ fontSize: 10, flexShrink: 0 }}>{event.type}</Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "48px 24px", borderRadius: 12, border: "1px dashed var(--border)", backgroundColor: "var(--background)", marginBottom: 32 }}>
                <Network size={40} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No upcoming events.</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Events will be listed here once scheduled. Check back soon!</p>
              </motion.div>
            )}
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
            {[
              { icon: Globe, title: "Franchise Expo", desc: "Meet franchisors and explore opportunities in person.", type: "Expo" },
              { icon: Handshake, title: "Investor Meetup", desc: "Connect with investors and franchise brokers.", type: "Meetup" },
              { icon: Monitor, title: "Webinars", desc: "Live online sessions with industry experts.", type: "Webinar" },
              { icon: Users, title: "Workshops", desc: "Hands-on sessions to develop franchise skills.", type: "Workshop" },
            ].map((e, i) => {
              const Icon = e.icon;
              return (
                <motion.div key={e.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                  whileHover={{ y: -4 }} style={{ padding: 24, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "var(--primary)" }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{e.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8 }}>{e.desc}</p>
                  <Badge variant="default" style={{ fontSize: 10 }}>{e.type}</Badge>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ textAlign: "center", padding: "32px 24px", borderRadius: 12, border: "1px dashed var(--border)", backgroundColor: "var(--surface-container-lowest)", marginBottom: 32 }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Events will be managed through the Admin CMS.</p>
            <Link to="/"><motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Button variant="outline" size="sm" icon={<ArrowLeft size={14} />}>Back to Home</Button></motion.div></Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
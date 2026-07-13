import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Globe, Monitor, Handshake, Network, Search, Loader2, AlertCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useEvents } from "../../hooks/useCMS";

const statusFilters = ["All", "upcoming", "ongoing", "completed"];

export default function Events() {
  const [activeStatus, setActiveStatus] = useState("All");
  const [search, setSearch] = useState("");
  const { data: events, isLoading, isError } = useEvents(activeStatus === "All" ? undefined : activeStatus);

  const filtered = useMemo(() => {
    if (!events?.length) return [];
    return events.filter((e) =>
      (!search || e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.venue?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [events, search]);

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <section style={{ padding: "60px 0 40px", backgroundColor: "var(--surface-container-lowest)" }}>
          <div className="container" style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ padding: 20, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", height: 80 }} />
              ))}
            </div>
          </div>
        </section>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <section style={{ padding: "60px 0 40px", backgroundColor: "var(--surface-container-lowest)" }}>
          <div className="container" style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <AlertCircle size={40} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Failed to load events</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Please try again later.</p>
            </div>
          </div>
        </section>
      </motion.div>
    );
  }

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
            {statusFilters.map((s) => (
              <button key={s} onClick={() => setActiveStatus(s)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, border: "1px solid", cursor: "pointer",
                  borderColor: activeStatus === s ? "var(--primary)" : "var(--border)", backgroundColor: activeStatus === s ? "var(--primary-light)" : "transparent", color: activeStatus === s ? "var(--primary)" : "var(--text-secondary)", transition: "all 0.15s", textTransform: "capitalize" }}>
                {s === "All" ? null : s === "upcoming" ? <Calendar size={14} /> : s === "ongoing" ? <Monitor size={14} /> : <Clock size={14} />}
                {s}
              </button>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={18} color="var(--primary)" /> Events
            </h2>
            {filtered.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {filtered.map((event, i) => (
                  <motion.div key={event.id || event.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    whileHover={{ y: -2 }} style={{ padding: 20, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}>
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{event.title}</h3>
                        <div style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--text-muted)", flexWrap: "wrap" }}>
                          {event.date && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={14} /> {event.date}</span>}
                          {event.venue && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={14} /> {event.venue}</span>}
                          {event.time && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> {event.time}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {event.status && <Badge variant={event.status === "upcoming" ? "info" : event.status === "ongoing" ? "success" : "default"} style={{ fontSize: 10, flexShrink: 0, textTransform: "capitalize" }}>{event.status}</Badge>}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "48px 24px", borderRadius: 12, border: "1px dashed var(--border)", backgroundColor: "var(--background)", marginBottom: 32 }}>
                <Network size={40} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No events found</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Events will be listed here once scheduled. Check back soon!</p>
              </motion.div>
            )}
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
            {[
              { icon: Globe, title: "Franchise Expo", desc: "Meet franchisors and explore opportunities in person." },
              { icon: Handshake, title: "Investor Meetup", desc: "Connect with investors and franchise brokers." },
              { icon: Monitor, title: "Webinars", desc: "Live online sessions with industry experts." },
              { icon: Users, title: "Workshops", desc: "Hands-on sessions to develop franchise skills." },
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
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

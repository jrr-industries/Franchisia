import { motion } from "framer-motion";
import { CalendarDays, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import { useEvents, usePublicSettings, getSectionContent } from "../hooks/useCMS";

export default function UpcomingEvents() {
  const { data: events, isLoading, isError } = useEvents("upcoming");
  const { data: sectionSettings } = usePublicSettings();

  if (isLoading) {
    return (
      <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center" }}>
          <Loader2 size={32} className="spin" color="var(--primary)" />
        </div>
      </section>
    );
  }

  if (!events?.length || isError) {
    return (
      <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'events', { heading: 'Upcoming Events' }).heading}</h2>
            <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
              {getSectionContent(sectionSettings, 'events', { description: 'Join us at industry events, webinars, and networking sessions.' }).description}
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
            {[1, 2].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{ padding: 32, backgroundColor: "var(--surface)", border: "1px dashed var(--outline-variant)", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220, opacity: 0.5 }}
              >
                <CalendarDays size={32} color="var(--outline-variant)" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 14, color: "var(--on-surface-variant)", fontStyle: "italic", textAlign: "center" }}>No upcoming events currently scheduled</p>
                <p style={{ fontSize: 12, color: "var(--on-surface-variant)", marginTop: 4, textAlign: "center" }}>Future events and webinars will be listed here</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'events', { heading: 'Upcoming Events' }).heading}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {getSectionContent(sectionSettings, 'events', { description: 'Join us at industry events, webinars, and networking sessions.' }).description}
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
          {events.map((event, i) => (
            <motion.div
              key={event.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              style={{
                padding: 28,
                backgroundColor: "var(--surface)",
                border: "1px solid var(--outline-variant)",
                borderRadius: 12,
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{
                position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                background: "linear-gradient(180deg, var(--primary), var(--primary-container))",
              }} />
              <div style={{ marginBottom: 16, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--on-surface)", marginBottom: 6, lineHeight: 1.4 }}>{event.title}</h3>
                  {event.eventType && (
                    <span style={{ display: "inline-block", padding: "2px 10px", fontSize: 11, fontWeight: 700, backgroundColor: "rgba(0,74,198,0.08)", color: "var(--primary)", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {event.eventType}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {event.date && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--on-surface-variant)" }}>
                    <CalendarDays size= {16} color="var(--primary)" />
                    {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </div>
                )}
                {event.venue && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--on-surface-variant)" }}>
                    <MapPin size={16} color="var(--primary)" />
                    {event.venue}
                  </div>
                )}
                {event.organizer && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--on-surface-variant)" }}>
                    <Users size={16} color="var(--primary)" />
                    Organized by {event.organizer}
                  </div>
                )}
              </div>

              {event.registrationLink ? (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "10px 20px", backgroundColor: "var(--primary)", color: "#fff",
                    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    textDecoration: "none", cursor: "pointer", transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,74,198,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                >
                  Register Now <ArrowRight size={14} />
                </a>
              ) : (
                <span style={{ fontSize: 13, color: "var(--on-surface-variant)", fontStyle: "italic" }}>
                  Registration details available upon request
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

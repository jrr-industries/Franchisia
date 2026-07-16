import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useCareers, usePublicSettings, getSectionContent } from "../hooks/useCMS";

export default function CareersSection() {
  const { data: careers, isLoading, isError } = useCareers();
  const { data: sectionSettings } = usePublicSettings();

  if (isLoading || isError || !careers?.length) return null;

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'careers', { heading: 'Join Our Team' }).heading}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {getSectionContent(sectionSettings, 'careers', { description: 'Help us shape the future of franchising.' }).description}
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {careers.map((career, i) => (
            <motion.div
              key={career.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              style={{ padding: 24, backgroundColor: "var(--surface)", border: "1px solid var(--outline-variant)", borderRadius: 12, transition: "all 0.2s", display: "flex", flexDirection: "column" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--on-surface)", marginBottom: 4 }}>{career.title}</h3>
                  {career.department && (
                    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "var(--primary)", backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)", padding: "3px 10px", borderRadius: 6, letterSpacing: 0.5 }}>
                      {career.department}
                    </span>
                  )}
                </div>
                <Briefcase size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
              </div>

              {career.shortDescription && (
                <p style={{ fontSize: 14, color: "var(--on-surface-variant)", lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {career.shortDescription}
                </p>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: "auto", marginBottom: 16 }}>
                {career.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--on-surface-variant)" }}>
                    <MapPin size={14} />
                    {career.location}
                  </div>
                )}
                {career.employmentType && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--on-surface-variant)" }}>
                    <Clock size={14} />
                    {career.employmentType}
                  </div>
                )}
              </div>

              {career.salaryRange && (
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", marginBottom: 16 }}>{career.salaryRange}</p>
              )}

              <Link
                to={career.applyUrl || `/careers/${career.id}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "var(--primary)",
                  textDecoration: "none", marginTop: "auto", transition: "gap 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.gap = "10px"; }}
                onMouseLeave={(e) => { e.currentTarget.style.gap = "6px"; }}
              >
                Apply Now <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

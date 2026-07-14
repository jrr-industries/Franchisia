import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Users, MapPin, BadgeCheck, Loader2 } from "lucide-react";
import { useFeaturedCompanies, usePublicSettings, getSectionContent } from "../hooks/useCMS";

export default function FeaturedCompanies() {
  const { data: companies, isLoading, isError } = useFeaturedCompanies();
  const { data: sectionSettings } = usePublicSettings();

  if (isLoading) {
    return (
      <section style={{ padding: "80px 0", backgroundColor: "var(--surface)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center" }}>
          <Loader2 size={32} className="spin" color="var(--primary)" />
        </div>
      </section>
    );
  }

  if (isError || !companies?.length) {
    return (
      <section style={{ padding: "80px 0", backgroundColor: "var(--surface)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'featured_companies', { heading: 'Featured Companies' }).heading}</h2>
            <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
              {getSectionContent(sectionSettings, 'featured_companies', { description: 'Verified brands actively expanding.' }).description}
            </p>
          </motion.div>
          <div style={{ padding: 60, color: "var(--on-surface-variant)" }}>
            <Building2 size={48} style={{ margin: "0 auto 16px", opacity: 0.25 }} />
            <p style={{ fontSize: 15, margin: 0 }}>Premium franchise brands will be featured here once they join our network.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'featured_companies', { heading: 'Featured Companies' }).heading}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {getSectionContent(sectionSettings, 'featured_companies', { description: 'Verified brands actively expanding.' }).description}
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {companies.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              style={{
                padding: 24, borderRadius: 12, border: "1px solid var(--outline-variant)",
                backgroundColor: "var(--surface)", transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt={c.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: "var(--surface-container-high)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building2 size={20} color="var(--primary)" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "var(--on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                    {c.isVerified && <BadgeCheck size={14} color="var(--primary)" />}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>{c.industry}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--on-surface-variant)", lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {c.description || "Professional franchise opportunity provider."}
              </p>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--on-surface-variant)", marginBottom: 16 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={14} /> {c._count?.followers || 0}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Building2 size={14} /> {c._count?.listings || 0} listings</span>
                {c.city && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={14} /> {c.city}</span>}
              </div>
              <Link to={`/company/${c.slug}`} style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>
                View Company &rarr;
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: "center", marginTop: 32 }}>
          <Link to="/discover" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 8, backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "box-shadow 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,74,198,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
            View All Companies &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

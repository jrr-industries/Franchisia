import { motion } from "framer-motion";
import { Globe, ExternalLink, Loader2 } from "lucide-react";
import { usePartners, usePublicSettings, getSectionContent } from "../hooks/useCMS";

function groupByCategory(partners) {
  return partners.reduce((acc, p) => {
    const cat = p.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});
}

export default function PartnersSection() {
  const { data: partners, isLoading } = usePartners();
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

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'partners', { heading: 'Our Partners' }).heading}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {getSectionContent(sectionSettings, 'partners', { description: 'Collaborating with industry leaders to deliver the best franchise experience.' }).description}
          </p>
        </motion.div>

        {!partners?.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {[1, 2, 3, 4].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{ padding: 24, backgroundColor: "var(--surface)", border: "1px dashed var(--outline-variant)", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, opacity: 0.5 }}
              >
                <Globe size={32} color="var(--outline-variant)" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 14, color: "var(--on-surface-variant)", fontStyle: "italic" }}>Partner information will appear here</p>
              </motion.div>
            ))}
          </div>
        ) : (
          Object.entries(groupByCategory(partners)).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 40 }}>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ fontSize: 18, fontWeight: 700, color: "var(--on-surface)", marginBottom: 20, paddingBottom: 8, borderBottom: "2px solid var(--primary)", display: "inline-block" }}
              >
                {category}
              </motion.h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {items.map((partner, i) => (
                  <motion.div
                    key={partner.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    style={{ padding: 24, backgroundColor: "var(--surface)", border: "1px solid var(--outline-variant)", borderRadius: 12, transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      {partner.logo ? (
                        <img src={partner.logo} alt={partner.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "contain" }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: "linear-gradient(135deg, var(--primary), var(--primary-dark, #4338ca))", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.7 }}>
                          <Globe size={20} color="#fff" />
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--on-surface)", marginBottom: 2 }}>{partner.name}</h4>
                        {partner.category && (
                          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "var(--primary)", backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)", padding: "2px 8px", borderRadius: 5 }}>
                            {partner.category}
                          </span>
                        )}
                      </div>
                    </div>
                    {partner.description && (
                      <p style={{ fontSize: 13, color: "var(--on-surface-variant)", lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {partner.description}
                      </p>
                    )}
                    {partner.website && (
                      <a href={partner.website} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--primary)", textDecoration: "none", transition: "gap 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.gap = "8px"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.gap = "4px"; }}
                      >
                        <ExternalLink size={13} />
                        Visit website
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

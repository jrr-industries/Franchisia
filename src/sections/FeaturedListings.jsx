import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Building2, MapPin, Eye, BadgeCheck, Loader2 } from "lucide-react";
import Button from "../components/ui/Button";
import { useFeaturedListings, usePublicSettings, getSectionContent } from "../hooks/useCMS";

export default function FeaturedListings() {
  const navigate = useNavigate();
  const { data: listings, isLoading, isError } = useFeaturedListings();
  const { data: sectionSettings } = usePublicSettings();

  if (isLoading || isError || !listings?.length) return null;

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'featured_listings', { heading: 'Featured Franchise Opportunities' }).heading}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {getSectionContent(sectionSettings, 'featured_listings', { description: 'Explore investment-ready opportunities.' }).description}
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {listings.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              style={{
                padding: 24, borderRadius: 12, border: "1px solid var(--outline-variant)",
                backgroundColor: "var(--surface)", cursor: "pointer",
                position: "relative", overflow: "hidden",
              }}
              onClick={() => navigate(`/listing/${l.slug}`)}
            >
              {l.company?.bannerUrl && (
                <div style={{ height: 100, margin: -24, marginBottom: 16, overflow: "hidden" }}>
                  <img src={l.company.bannerUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                {l.company?.logoUrl ? (
                  <img src={l.company.logoUrl} alt={l.company.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "var(--surface-container-high)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Briefcase size={20} color="var(--primary)" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--on-surface)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</span>
                  <span style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "flex", alignItems: "center", gap: 4 }}>
                    {l.company?.name}
                    {l.company?.isVerified && <BadgeCheck size={12} color="var(--primary)" />}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--on-surface-variant)", lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {l.description || "Detailed opportunity information available upon request."}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: "var(--on-surface-variant)", marginBottom: 16 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Building2 size={14} /> {l.industry}</span>
                {l.city && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={14} /> {l.city}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye size={14} /> {l.viewCount || 0}</span>
              </div>
              {l.investmentMin && (
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)", marginBottom: 12 }}>
                  ₹{Number(l.investmentMin).toLocaleString()}{l.investmentMax ? ` - ₹${Number(l.investmentMax).toLocaleString()}` : ""}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); }}>
                  Save Listing
                </Button>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/listing/${l.slug}`); }}>
                  Apply Now
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: "center", marginTop: 32 }}>
          <Link to="/discover"><Button>View All Opportunities <Briefcase size={16} /></Button></Link>
        </motion.div>
      </div>
    </section>
  );
}

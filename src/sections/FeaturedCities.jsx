import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Loader2 } from "lucide-react";
import { useFeaturedCities, usePublicSettings, getSectionContent } from "../hooks/useCMS";

export default function FeaturedCities() {
  const { data: cities, isLoading } = useFeaturedCities();
  const { data: sectionSettings } = usePublicSettings();

  if (isLoading || !cities?.length) return null;

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'featured_cities', { heading: 'Opportunities by City' }).heading}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {getSectionContent(sectionSettings, 'featured_cities', { description: 'Explore franchise opportunities in top business hubs across India.' }).description}
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {cities.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Link to={`/discover?city=${encodeURIComponent(city.name)}`}
                style={{
                  display: "block", padding: 24, borderRadius: 12, textDecoration: "none",
                  border: "1px solid var(--outline-variant)", backgroundColor: "var(--surface)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <MapPin size={24} color="var(--primary)" style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--on-surface)", marginBottom: 4 }}>{city.name}</h3>
                <p style={{ fontSize: 13, color: "var(--on-surface-variant)", marginBottom: 8 }}>{city.state}</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>
                  {city.listingCount || 0} opportunities
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Film, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useMedia, usePublicSettings, getSectionContent } from "../hooks/useCMS";

export default function MediaGallery() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const { data, isLoading, isError } = useMedia({ page, limit: 12, type: typeFilter || undefined });
  const { data: sectionSettings } = usePublicSettings();
  const [lightbox, setLightbox] = useState(null);

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;

  if (isLoading) {
    return (
      <section style={{ padding: "80px 0", backgroundColor: "var(--surface)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center" }}>
          <Loader2 size={32} className="spin" color="var(--primary)" />
        </div>
      </section>
    );
  }

  if (isError || !items.length) {
    return (
      <section style={{ padding: "80px 0", backgroundColor: "var(--surface)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'media', { heading: 'Community Gallery' }).heading}</h2>
            <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
              {getSectionContent(sectionSettings, 'media', { description: 'Highlights from our events and community.' }).description}
            </p>
          </motion.div>
          <div style={{ padding: 60, color: "var(--on-surface-variant)" }}>
            <Image size={48} style={{ margin: "0 auto 16px", opacity: 0.25 }} />
            <p style={{ fontSize: 15, margin: 0 }}>Media content will be displayed here once available.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'media', { heading: 'Community Gallery' }).heading}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {getSectionContent(sectionSettings, 'media', { description: 'Highlights from our events and community.' }).description}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            {["", "image", "video"].map((t) => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                style={{
                  padding: "8px 20px", borderRadius: 100, border: `1px solid ${typeFilter === t ? "var(--primary)" : "var(--outline-variant)"}`,
                  backgroundColor: typeFilter === t ? "var(--primary)" : "transparent",
                  color: typeFilter === t ? "#fff" : "var(--on-surface-variant)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {t === "" ? "All" : t === "image" ? "Images" : "Videos"}
              </button>
            ))}
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {items.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4 }}
              style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer", position: "relative", aspectRatio: "4/3", backgroundColor: "var(--surface-container-high)", border: "1px solid var(--outline-variant)" }}
              onClick={() => setLightbox(m)}
            >
              {m.type === "video" ? (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--surface-container-high)" }}>
                  <Film size={32} color="var(--primary)" style={{ opacity: 0.5 }} />
                </div>
              ) : (
                <img src={m.url} alt={m.alt || m.fileName || "Media"} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px", background: "linear-gradient(transparent, rgba(0,0,0,0.6))" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#fff" }}>
                  {m.type === "video" ? <Film size={12} /> : <Image size={12} />}
                  {m.fileName || m.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 32 }}>
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid var(--outline-variant)", backgroundColor: "var(--surface)", color: "var(--on-surface)", cursor: "pointer", fontSize: 13, opacity: page <= 1 ? 0.5 : 1 }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid var(--outline-variant)", backgroundColor: "var(--surface)", color: "var(--on-surface)", cursor: "pointer", fontSize: 13, opacity: page >= totalPages ? 0.5 : 1 }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)}
              style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 8 }}>
              <X size={24} />
            </button>
            {lightbox.type === "video" ? (
              <div style={{ color: "#fff", textAlign: "center" }}>
                <Film size={64} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
                <p>{lightbox.fileName || "Video"}</p>
              </div>
            ) : (
              <img src={lightbox.url} alt={lightbox.alt || ""} style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12, objectFit: "contain" }} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

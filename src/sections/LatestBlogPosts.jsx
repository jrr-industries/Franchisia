import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useBlogPosts, usePublicSettings, getSectionContent } from "../hooks/useCMS";

export default function LatestBlogPosts() {
  const { data, isLoading, isError } = useBlogPosts({ page: 1, limit: 3 });
  const { data: sectionSettings } = usePublicSettings();

  if (isLoading || isError) return null;

  const posts = data?.items || [];

  if (!posts.length) return null;

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'blog', { heading: 'Latest Franchise Insights' }).heading}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {getSectionContent(sectionSettings, 'blog', { description: 'Industry news, expert advice and business strategies.' }).description}
          </p>
        </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {posts.map((post, i) => (
              <motion.div
                key={post.slug || post.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--outline-variant)", borderRadius: 12, overflow: "hidden", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <Link to={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  {post.featuredImage ? (
                    <img src={post.featuredImage} alt={post.title} style={{ width: "100%", height: 200, objectFit: "cover" }} loading="lazy" />
                  ) : (
                    <div style={{ width: "100%", height: 200, background: "linear-gradient(135deg, var(--primary), var(--primary-container))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Calendar size={48} color="rgba(255,255,255,0.3)" />
                    </div>
                  )}
                  <div style={{ padding: 20 }}>
                    {post.category && (
                      <span style={{ display: "inline-block", padding: "2px 10px", fontSize: 11, fontWeight: 700, backgroundColor: "rgba(0,74,198,0.08)", color: "var(--primary)", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                        {post.category}
                      </span>
                    )}
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--on-surface)", marginBottom: 8, lineHeight: 1.4 }}>{post.title}</h3>
                    {post.shortDescription && (
                      <p style={{ fontSize: 14, color: "var(--on-surface-variant)", lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {post.shortDescription}
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--on-surface-variant)" }}>
                      {post.publishDate && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={12} /> {new Date(post.publishDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                      )}
                      {post.readingTime && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={12} /> {post.readingTime}
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
                      Read More <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        
      </div>
    </section>
  );
}

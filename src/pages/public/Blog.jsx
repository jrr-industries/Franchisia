import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, FileText, Tag, Clock, BookOpen, TrendingUp, Briefcase, Newspaper, Lightbulb, Loader2, AlertCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useBlogPosts } from "../../hooks/useCMS";

const categoryIcons = {
  Technology: TrendingUp,
  Investment: TrendingUp,
  Marketing: Lightbulb,
  Legal: Briefcase,
  Expansion: BookOpen,
};

export default function Blog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { data, isLoading, isError } = useBlogPosts({ page: 1, limit: 50 });

  const blogItems = data?.items || [];

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(blogItems.map((a) => a.category).filter(Boolean))];
    return cats;
  }, [blogItems]);

  const filtered = useMemo(() => {
    return blogItems.filter((a) =>
      (activeCategory === "All" || a.category === activeCategory) &&
      (!search || a.title?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [blogItems, activeCategory, search]);

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <section style={{ padding: "60px 0 40px", backgroundColor: "var(--surface-container-lowest)" }}>
          <div className="container" style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ padding: 24, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", height: 140 }}>
                  <div style={{ width: "60%", height: 14, backgroundColor: "var(--border)", borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ width: "80%", height: 10, backgroundColor: "var(--border)", borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: "40%", height: 10, backgroundColor: "var(--border)", borderRadius: 4 }} />
                </div>
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
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Failed to load blog posts</p>
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
            <span>Blog</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ padding: "48px 32px", borderRadius: 16, background: "linear-gradient(135deg, var(--primary-light), var(--surface))", border: "1px solid var(--border)", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <FileText size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Blog</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 600 }}>
                  Insights, stories, and expert advice from the franchise industry.
                </p>
              </div>
            </div>
            <div style={{ position: "relative", maxWidth: 480 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
          </motion.div>

          <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
            {categories.map((cat) => {
              const Icon = categoryIcons[cat] || Tag;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, border: "1px solid", cursor: "pointer",
                    borderColor: activeCategory === cat ? "var(--primary)" : "var(--border)", backgroundColor: activeCategory === cat ? "var(--primary-light)" : "transparent", color: activeCategory === cat ? "var(--primary)" : "var(--text-secondary)", transition: "all 0.15s" }}>
                  <Icon size={14} /> {cat}
                </button>
              );
            })}
          </div>

          {filtered.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
                {filtered.map((article, i) => (
                  <motion.div key={article.id || article.slug || article.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.03 }}
                    whileHover={{ y: -4 }}
                    style={{ padding: 20, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", cursor: "pointer" }}>
                    <Badge variant={article.featured ? "success" : "default"} style={{ marginBottom: 8, fontSize: 10 }}>{article.category || "General"}</Badge>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{article.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--text-muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {article.readTime || `${Math.ceil((article.content?.length || 0) / 1000)} min` || "N/A"} read</span>
                      {article.featured && <Badge variant="success" style={{ fontSize: 9 }}>Featured</Badge>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "48px 24px", borderRadius: 12, border: "1px dashed var(--border)", backgroundColor: "var(--background)", marginBottom: 32 }}>
              <Newspaper size={40} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No articles found</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Try adjusting your search or category filter.</p>
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

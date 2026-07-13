import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, FileText, Tag, Clock, ChevronRight, BookOpen, TrendingUp, Briefcase, Newspaper, Lightbulb } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const categories = [
  { label: "All", icon: Tag },
  { label: "Investment", icon: TrendingUp },
  { label: "Marketing", icon: Lightbulb },
  { label: "Legal", icon: FileText },
  { label: "Technology", icon: Briefcase },
  { label: "Expansion", icon: BookOpen },
];

const featuredArticles = [
  { title: "The Future of Franchise Networking in 2026", category: "Technology", readTime: "5 min", featured: true },
  { title: "How to Choose the Right Franchise Opportunity", category: "Investment", readTime: "8 min", featured: true },
  { title: "Legal Considerations for Franchise Agreements", category: "Legal", readTime: "6 min", featured: true },
];

const recentArticles = [
  { title: "Marketing Strategies for New Franchise Owners", category: "Marketing", readTime: "4 min" },
  { title: "Expanding Your Franchise Across State Lines", category: "Expansion", readTime: "7 min" },
  { title: "Technology Tools Every Franchise Needs", category: "Technology", readTime: "5 min" },
  { title: "Understanding Franchise Fees and Royalties", category: "Investment", readTime: "6 min" },
  { title: "Building a Strong Franchise Brand Identity", category: "Marketing", readTime: "4 min" },
  { title: "Exit Strategies for Franchise Business Owners", category: "Legal", readTime: "8 min" },
];

export default function Blog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = recentArticles.filter(a =>
    (activeCategory === "All" || a.category === activeCategory) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()))
  );

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
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.label} onClick={() => setActiveCategory(cat.label)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, border: "1px solid", cursor: "pointer",
                    borderColor: activeCategory === cat.label ? "var(--primary)" : "var(--border)", backgroundColor: activeCategory === cat.label ? "var(--primary-light)" : "transparent", color: activeCategory === cat.label ? "var(--primary)" : "var(--text-secondary)", transition: "all 0.15s" }}>
                  <Icon size={14} /> {cat.label}
                </button>
              );
            })}
          </div>

          {featuredArticles.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={18} color="var(--primary)" /> Featured Articles
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {featuredArticles.map((article, i) => (
                  <motion.div key={article.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
                    whileHover={{ y: -4 }}
                    style={{ padding: 24, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", cursor: "pointer" }}>
                    <Badge variant="info" style={{ marginBottom: 8, fontSize: 10 }}>{article.category}</Badge>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{article.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--text-muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {article.readTime} read</span>
                      {article.featured && <Badge variant="success" style={{ fontSize: 9 }}>Featured</Badge>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Latest Articles</h2>
            {filtered.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
                {filtered.map((article, i) => (
                  <motion.div key={article.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.03 }}
                    whileHover={{ y: -4 }}
                    style={{ padding: 20, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", cursor: "pointer" }}>
                    <Badge variant="default" style={{ marginBottom: 8, fontSize: 10 }}>{article.category}</Badge>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{article.title}</h3>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-muted)" }}><Clock size={12} /> {article.readTime} read</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "48px 24px", borderRadius: 12, border: "1px dashed var(--border)", backgroundColor: "var(--background)", marginBottom: 32 }}>
                <Newspaper size={40} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No articles found</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Try adjusting your search or category filter.</p>
              </motion.div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ textAlign: "center", padding: "32px 24px", borderRadius: 12, border: "1px dashed var(--border)", backgroundColor: "var(--surface-container-lowest)", marginBottom: 32 }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Blog content will be managed through the Admin CMS.</p>
            <Link to="/"><motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Button variant="outline" size="sm" icon={<ArrowLeft size={14} />}>Back to Home</Button></motion.div></Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Construction, FileText, Users, Briefcase, Calendar, MapPin, AlertCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import { useBlogPosts, usePartners, useCareers, useEvents } from "../../hooks/useCMS";

const sectionIcon = {
  blog: FileText,
  partners: Users,
  careers: Briefcase,
  events: Calendar,
};

function TypeContent({ type }) {
  switch (type) {
    case "blog": {
      const { data, isLoading, isError } = useBlogPosts({ page: 1, limit: 12 });
      const items = data?.items || [];
      if (isLoading) return <TypeSkeleton />;
      if (isError) return <TypeError />;
      if (!items.length) return <TypeEmpty type={type} />;
      return items.map((item, i) => (
        <motion.div key={item.id || item.slug || item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
          whileHover={{ y: -4 }} style={{ padding: 24, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "var(--primary)" }}>
            <FileText size={20} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{item.title}</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.description || item.excerpt || ""}</p>
        </motion.div>
      ));
    }
    case "partners": {
      const { data: items, isLoading, isError } = usePartners();
      if (isLoading) return <TypeSkeleton />;
      if (isError) return <TypeError />;
      if (!items?.length) return <TypeEmpty type={type} />;
      return items.map((item, i) => (
        <motion.div key={item.id || item.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
          whileHover={{ y: -4 }} style={{ padding: 24, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "var(--primary)" }}>
            <Users size={20} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{item.name}</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.description}</p>
        </motion.div>
      ));
    }
    case "careers": {
      const { data: items, isLoading, isError } = useCareers();
      if (isLoading) return <TypeSkeleton />;
      if (isError) return <TypeError />;
      if (!items?.length) return <TypeEmpty type={type} />;
      return items.map((item, i) => (
        <motion.div key={item.id || item.jobTitle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
          whileHover={{ y: -4 }} style={{ padding: 24, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "var(--primary)" }}>
            <Briefcase size={20} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{item.jobTitle}</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.description}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {item.department && <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Briefcase size={12} /> {item.department}</span>}
            {item.location && <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {item.location}</span>}
          </div>
        </motion.div>
      ));
    }
    case "events": {
      const { data: items, isLoading, isError } = useEvents();
      if (isLoading) return <TypeSkeleton />;
      if (isError) return <TypeError />;
      if (!items?.length) return <TypeEmpty type={type} />;
      return items.map((item, i) => (
        <motion.div key={item.id || item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
          whileHover={{ y: -4 }} style={{ padding: 24, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "var(--primary)" }}>
            <Calendar size={20} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{item.title}</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.description}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {item.date && <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {item.date}</span>}
            {item.venue && <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {item.venue}</span>}
          </div>
        </motion.div>
      ));
    }
    default:
      return null;
  }
}

function TypeSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} style={{ padding: 24, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", height: 140 }} />
      ))}
    </div>
  );
}

function TypeError() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ textAlign: "center", padding: "48px 24px", marginBottom: 32 }}>
      <AlertCircle size={40} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
      <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>Failed to load data</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Please try again later.</p>
    </motion.div>
  );
}

function TypeEmpty({ type }) {
  const labels = { blog: "articles", partners: "partners", careers: "positions", events: "events" };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ textAlign: "center", padding: "48px 24px", borderRadius: 12, border: "1px dashed var(--border)", backgroundColor: "var(--background)", marginBottom: 32 }}>
      <Construction size={40} color="var(--primary)" style={{ marginBottom: 12, opacity: 0.6 }} />
      <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>No {labels[type] || "data"} yet</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Content will be managed through the Admin CMS.</p>
    </motion.div>
  );
}

export default function PlaceholderPage({ title, description, type = "page" }) {
  const Icon = sectionIcon[type] || Construction;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ padding: "60px 0 40px", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container" style={{ maxWidth: 1000, margin: "0 auto" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
            <Link to="/" style={{ color: "var(--primary)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span>{title}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ padding: "48px 32px", borderRadius: 16, background: "linear-gradient(135deg, var(--primary-light), var(--surface))", border: "1px solid var(--border)", marginBottom: 32 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Icon size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{title}</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 600 }}>
                  {description || `This page is coming soon and will be available in a future update. Stay tuned for exciting content and features.`}
                </p>
              </div>
            </div>
          </motion.div>

          {type !== "page" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "var(--text-secondary)" }}>Content</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
                <TypeContent type={type} />
              </div>
            </motion.div>
          )}

          {type === "page" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ textAlign: "center", padding: "40px 24px", borderRadius: 16, border: "1px dashed var(--border)", backgroundColor: "var(--background)" }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                style={{ marginBottom: 16 }}
              >
                <Construction size={40} color="var(--primary)" style={{ opacity: 0.6 }} />
              </motion.div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
                This section is under development. Content will be managed through the Admin CMS.
              </p>
              <Link to="/">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="primary" icon={<ArrowLeft size={16} />}>Back to Home</Button>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Search, Layers, Users, GitPullRequest,
  Building2, Briefcase, Globe, MapPin, TrendingUp, Grid3X3,
  Map, Cpu, Star, Newspaper, CalendarDays, Briefcase as BriefcaseIcon,
  Users2, Image, CreditCard, Mail, HelpCircle, Phone, PanelBottom,
  Eye, EyeOff, ExternalLink, Settings, Tag, DollarSign,
  Languages, FileType, Ruler,
} from "lucide-react";

const sections = [
  { id: "hero", label: "Hero", icon: LayoutDashboard, path: "/admin/home/hero", color: "#6366F1", description: "Hero banners, CTAs, backgrounds" },
  { id: "statistics", label: "Platform Statistics", icon: BarChart3, path: "/admin/home/statistics", color: "#F59E0B", description: "Counter stats and metrics" },
  { id: "marketplace-search", label: "Marketplace Search", icon: Search, path: "/admin/home/marketplace-search", color: "#10B981", description: "Search section settings" },
  { id: "features", label: "Platform Features", icon: Layers, path: "/admin/home/features", color: "#3B82F6", description: "Feature cards with icons" },
  { id: "user-roles", label: "User Roles", icon: Users, path: "/admin/home/user-roles", color: "#8B5CF6", description: "Franchisor, Franchisee, Investor etc." },
  { id: "how-it-works", label: "How It Works", icon: GitPullRequest, path: "/admin/home/how-it-works", color: "#EC4899", description: "Step-by-step process" },
  { id: "featured-companies", label: "Featured Companies", icon: Building2, path: "/admin/home/featured-companies", color: "#14B8A6", description: "Manage featured companies" },
  { id: "featured-opportunities", label: "Featured Opportunities", icon: Briefcase, path: "/admin/home/featured-opportunities", color: "#F97316", description: "Featured listings" },
  { id: "global-network", label: "Global Network", icon: Globe, path: "/admin/home/global-network", color: "#06B6D4", description: "Network section settings" },
  { id: "map-locations", label: "Map & Locations", icon: MapPin, path: "/admin/home/map-locations", color: "#84CC16", description: "Interactive map settings" },
  { id: "global-metrics", label: "Global Metrics", icon: TrendingUp, path: "/admin/home/global-metrics", color: "#E11D48", description: "Global stat counters" },
  { id: "industries", label: "Industries", icon: Grid3X3, path: "/admin/home/industries", color: "#7C3AED", description: "Industry categories" },
  { id: "cities", label: "Cities", icon: Map, path: "/admin/home/cities", color: "#0EA5E9", description: "Featured cities" },
  { id: "ai-recommendations", label: "AI Recommendations", icon: Cpu, path: "/admin/home/ai-recommendations", color: "#D946EF", description: "AI section settings" },
  { id: "testimonials", label: "Testimonials", icon: Star, path: "/admin/home/testimonials", color: "#F59E0B", description: "User testimonials" },
  { id: "blog", label: "Blog", icon: Newspaper, path: "/admin/home/blog", color: "#10B981", description: "Blog posts management" },
  { id: "events", label: "Events", icon: CalendarDays, path: "/admin/home/events", color: "#3B82F6", description: "Upcoming events" },
  { id: "careers", label: "Careers", icon: BriefcaseIcon, path: "/admin/home/careers", color: "#8B5CF6", description: "Job openings" },
  { id: "partners", label: "Partners", icon: Users2, path: "/admin/home/partners", color: "#EC4899", description: "Partner logos" },
  { id: "media", label: "Media Gallery", icon: Image, path: "/admin/home/media", color: "#14B8A6", description: "Images and videos" },
  { id: "pricing", label: "Pricing", icon: CreditCard, path: "/admin/home/pricing", color: "#F97316", description: "Pricing plans" },
  { id: "newsletter", label: "Newsletter", icon: Mail, path: "/admin/home/newsletter", color: "#06B6D4", description: "Newsletter settings" },
  { id: "faq", label: "FAQ", icon: HelpCircle, path: "/admin/home/faq", color: "#84CC16", description: "Frequently asked questions" },
  { id: "contact", label: "Contact", icon: Phone, path: "/admin/home/contact", color: "#6366F1", description: "Contact information" },
  { id: "footer", label: "Footer", icon: Settings, path: "/admin/home/footer", color: "#E11D48", description: "Footer settings" },
  { id: "business-types", label: "Business Types", icon: Tag, path: "/admin/master-data/business-types", color: "#0EA5E9", description: "Single Unit, Multi Unit, Master Franchise etc." },
  { id: "opportunity-types", label: "Opportunity Types", icon: Briefcase, path: "/admin/master-data/opportunity-types", color: "#F59E0B", description: "Single Outlet, Master Franchise, Joint Venture etc." },
  { id: "investment-ranges", label: "Investment Ranges", icon: DollarSign, path: "/admin/master-data/investment-ranges", color: "#10B981", description: "Investment amount brackets" },
  { id: "company-sizes", label: "Company Sizes", icon: Ruler, path: "/admin/master-data/company-sizes", color: "#8B5CF6", description: "Employee count ranges" },
  { id: "languages", label: "Languages", icon: Languages, path: "/admin/master-data/languages", color: "#EC4899", description: "Supported languages" },
  { id: "currencies", label: "Currencies", icon: DollarSign, path: "/admin/master-data/currencies", color: "#F97316", description: "Currency options" },
  { id: "document-types", label: "Document Types", icon: FileType, path: "/admin/master-data/document-types", color: "#14B8A6", description: "Document type categories" },
];

const s = {
  page: { padding: 24 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 700, margin: 0 },
  subtitle: { fontSize: 15, color: "var(--text-muted)", marginTop: 8 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },
  card: {
    padding: 20, borderRadius: 14, border: "1px solid var(--border)",
    backgroundColor: "var(--surface)", cursor: "pointer",
    transition: "all 0.2s ease", position: "relative", overflow: "hidden",
  },
  iconWrapper: {
    width: 44, height: 44, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: 600, margin: 0 },
  cardDesc: { fontSize: 13, color: "var(--text-muted)", marginTop: 6, margin: 0, lineHeight: 1.4 },
};

export default function AdminHome() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Landing Page CMS</h1>
        <p style={s.subtitle}>Manage every section of the landing page. Each card opens its own editor.</p>
      </div>

      <div style={s.grid}>
        {sections.map((section) => {
          const isHovered = hoveredId === section.id;
          return (
            <motion.div
              key={section.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                ...s.card,
                borderColor: isHovered ? section.color : "var(--border)",
                transform: isHovered ? "translateY(-2px)" : "none",
                boxShadow: isHovered ? `0 8px 24px ${section.color}15` : "none",
              }}
              onMouseEnter={() => setHoveredId(section.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => navigate(section.path)}
            >
              <div style={{ ...s.iconWrapper, backgroundColor: `${section.color}15` }}>
                <section.icon size={22} color={section.color} />
              </div>
              <h3 style={s.cardTitle}>{section.label}</h3>
              <p style={s.cardDesc}>{section.description}</p>

              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ position: "absolute", bottom: 12, right: 12, color: "var(--text-muted)" }}
                >
                  <ExternalLink size={14} />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

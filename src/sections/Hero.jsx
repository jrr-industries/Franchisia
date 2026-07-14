import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Globe, Users, Building2, MapPin, Network, BadgeCheck, Loader2 } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useHeroSlides, usePublicSettings, useStats } from "../hooks/useCMS";

const nodes = [
  { x: 20, y: 25, size: 6, delay: 0 },
  { x: 45, y: 15, size: 8, delay: 0.5 },
  { x: 70, y: 30, size: 5, delay: 1 },
  { x: 30, y: 55, size: 7, delay: 1.5 },
  { x: 60, y: 50, size: 6, delay: 2 },
  { x: 80, y: 60, size: 5, delay: 2.5 },
  { x: 15, y: 70, size: 4, delay: 3 },
  { x: 50, y: 75, size: 6, delay: 3.5 },
  { x: 75, y: 20, size: 5, delay: 4 },
  { x: 40, y: 40, size: 4, delay: 4.5 },
];

const connections = [
  [0, 1], [0, 3], [1, 2], [1, 4],
  [2, 8], [3, 4], [3, 5], [3, 6],
  [4, 7], [4, 9], [5, 7], [6, 7],
  [7, 9], [8, 4], [8, 9],
];

const statIcons = [Building2, Users, Globe, MapPin];
const defaultStats = [
  { icon: Building2, value: "50,000+", label: "Registered Professionals" },
  { icon: Users, value: "10,000+", label: "Marketplace Listings" },
  { icon: Globe, value: "2,500+", label: "Verified Companies" },
  { icon: MapPin, value: "100+", label: "Cities" },
];

export default function Hero() {
  const { isAuthenticated, user } = useAuth();
  const { data: heroSlides, isLoading: slidesLoading } = useHeroSlides();
  const { data: settings, isLoading: settingsLoading } = usePublicSettings();
  const { data: statsData, isLoading: statsLoading } = useStats();
  const [quoteIndex, setQuoteIndex] = useState(0);

  const slide = Array.isArray(heroSlides) && heroSlides.length > 0 ? heroSlides[0] : null;
  const heroSettings = settings?.hero || settings || {};

  const rawQuotes = slide?.quotes || heroSettings.rotatingQuotes || heroSettings.heroQuotes || "";
  const quotes = typeof rawQuotes === "string" ? rawQuotes.split("\n").filter(Boolean) : Array.isArray(rawQuotes) ? rawQuotes : [];
  const activeQuotes = quotes.length > 0 ? quotes : [];

  const heroHeadline = slide?.title || slide?.headline || heroSettings.headline || heroSettings.heroHeadline || "";
  const heroDescription = slide?.subtitle || slide?.description || heroSettings.description || heroSettings.heroDescription || "";
  const ctaText = slide?.ctaText || heroSettings.ctaText || "";
  const ctaUrl = slide?.ctaUrl || heroSettings.ctaUrl || "";
  const secondaryCtaText = slide?.secondaryCtaText || heroSettings.secondaryCtaText || "";
  const secondaryCtaUrl = slide?.secondaryCtaUrl || heroSettings.secondaryCtaUrl || "";

  const heroStats = (statsData || []).length > 0
    ? (statsData || []).slice(0, 4).map((s, i) => ({
        icon: statIcons[i] || Building2,
        value: s.value,
        label: s.label,
      }))
    : [];

  useEffect(() => {
    if (activeQuotes.length <= 1) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % activeQuotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeQuotes.length]);

  if (slidesLoading || settingsLoading || statsLoading) {
    return (
      <section style={{ minHeight: "700px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={48} color="var(--primary)" />
        </motion.div>
      </section>
    );
  }

  const displayHeadline = heroHeadline || "Find the Perfect Franchise Opportunity.";
  const displayDescription = heroDescription || "Connect with verified franchisors, franchisees, investors, consultants, and suppliers on India's fastest-growing franchise ecosystem.";
  const displayStats = heroStats.length > 0 ? heroStats.slice(0, 4) : defaultStats;

  return (
    <section style={{ minHeight: "700px", display: "flex", alignItems: "center", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%, rgba(0,74,198,0.06), transparent 60%)", pointerEvents: "none" }} />
      <div className="container" style={{ position: "relative", zIndex: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ marginBottom: 16 }}>
            <motion.svg
              width="64" height="64" viewBox="0 0 24 24"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#004ac6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <rect width="24" height="24" rx="4" fill="url(#logo-grad)" />
              <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: "-0.02em", color: "var(--on-surface)" }}>
            {displayHeadline}
          </h1>
          <div style={{ height: 32, marginBottom: 24, position: "relative" }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                style={{ fontSize: 17, color: "var(--primary)", fontWeight: 500, position: "absolute", left: 0, top: 0 }}
              >
                "{activeQuotes[quoteIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>
          <p style={{ fontSize: 18, color: "var(--on-surface-variant)", lineHeight: 1.6, marginBottom: 32, maxWidth: 560 }}>
            {displayDescription}
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {isAuthenticated ? (
              user?.role && user?.role !== "none" ? (
                <Link to="/onboarding/status"><motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Button size="lg">View Status <ArrowRight size={18} /></Button></motion.div></Link>
              ) : (
                <Link to="/onboarding/select-role"><motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Button size="lg">Complete Your Profile <ArrowRight size={18} /></Button></motion.div></Link>
              )
            ) : (
              <>
                <Link to={ctaUrl || "/discover"}><motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Button size="lg">{ctaText || "Explore Marketplace"} <ArrowRight size={18} /></Button></motion.div></Link>
                <Link to={secondaryCtaUrl || "/signup"}><motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Button variant="outline" size="lg">{secondaryCtaText || "Register Your Business"}</Button></motion.div></Link>
              </>
            )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}
            >
              <BadgeCheck size={16} color="var(--primary)" />
              <span style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>Trusted by franchise professionals across India.</span>
            </motion.div>
          </motion.div>

          <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hero-visual-lg"
        >
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -24, background: "rgba(0,74,198,0.06)", filter: "blur(64px)", borderRadius: "50%", opacity: 0.6 }} />
            <div style={{ position: "relative", borderRadius: 16, border: "1px solid var(--outline-variant)", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", backgroundColor: "var(--surface)" }}>
              <div style={{ padding: 24 }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 12, background: "linear-gradient(145deg, var(--primary-light), #daf3e5)", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 40%, rgba(0,74,198,0.1), transparent 60%)" }} />
                  {nodes.map((node, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 3, delay: node.delay, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        position: "absolute", left: `${node.x}%`, top: `${node.y}%`,
                        width: node.size * 2, height: node.size * 2,
                        borderRadius: "50%", backgroundColor: "var(--primary)",
                        boxShadow: `0 0 ${node.size * 3}px rgba(0,74,198,0.3)`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  ))}
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                    {connections.map(([from, to], i) => (
                      <motion.line
                        key={i}
                        x1={`${nodes[from].x}%`} y1={`${nodes[from].y}%`}
                        x2={`${nodes[to].x}%`} y2={`${nodes[to].y}%`}
                        stroke="var(--primary)"
                        strokeWidth="1.5"
                        strokeOpacity="0.2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatType: "reverse" }}
                      />
                    ))}
                  </svg>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}
                  >
                    <Network size={48} color="var(--primary)" style={{ opacity: 0.15 }} />
                  </motion.div>
                  {displayStats && (
                    <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {displayStats.map((stat, i) => (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            style={{
                              padding: "8px 12px", borderRadius: 8,
                              backgroundColor: "rgba(255,255,255,0.85)",
                              backdropFilter: "blur(4px)",
                              display: "flex", alignItems: "center", gap: 8,
                            }}
                          >
                            <stat.icon size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{stat.value}</div>
                              <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.2 }}>{stat.label}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "center", marginTop: 16, fontSize: 14, fontWeight: 600, color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Globe size={16} />
                  Global Franchise Network
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <style>{`
        @media (min-width: 1024px) {
          .hero-visual-lg { display: block !important; }
        }
        @media (max-width: 1023px) {
          .hero-visual-lg { display: none !important; }
        }
      `}</style>
    </section>
  );
}

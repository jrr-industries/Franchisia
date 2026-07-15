import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BadgeCheck, Loader2 } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useHeroSlides } from "../hooks/useCMS";
import { useQuery } from "@tanstack/react-query";

export default function Hero() {
  const { isAuthenticated, user } = useAuth();
  const { data: heroSlides, isLoading: slidesLoading } = useHeroSlides();
  const { data: heroSettings, isLoading: heroSettingsLoading } = useQuery({
    queryKey: ["public", "hero"],
    queryFn: () => fetch("/api/public/hero").then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
  const [quoteIndex, setQuoteIndex] = useState(0);

  const slide = Array.isArray(heroSlides) && heroSlides.length > 0 ? heroSlides[0] : null;

  const rawQuotes = slide?.quotes || heroSettings?.rotatingQuotes || heroSettings?.heroQuotes || "";
  const quotes = typeof rawQuotes === "string" ? rawQuotes.split("\n").filter(Boolean) : Array.isArray(rawQuotes) ? rawQuotes : [];
  const activeQuotes = quotes.length > 0 ? quotes : [];

  const title = slide?.title || slide?.headline || heroSettings?.title || heroSettings?.headline || heroSettings?.heroHeadline || "";
  const subtitle = slide?.subtitle || slide?.description || heroSettings?.subtitle || heroSettings?.description || heroSettings?.heroDescription || "";
  const primaryButtonText = slide?.ctaText || heroSettings?.primaryButtonText || heroSettings?.ctaText || "";
  const primaryButtonUrl = slide?.ctaUrl || heroSettings?.primaryButtonUrl || heroSettings?.ctaUrl || "";
  const secondaryButtonText = slide?.secondaryCtaText || heroSettings?.secondaryButtonText || heroSettings?.secondaryCtaText || "";
  const secondaryButtonUrl = slide?.secondaryCtaUrl || heroSettings?.secondaryButtonUrl || heroSettings?.secondaryCtaUrl || "";
  const backgroundImage = heroSettings?.backgroundImage || "";
  const heroIllustration = heroSettings?.heroIllustration || "";

  useEffect(() => {
    if (activeQuotes.length <= 1) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % activeQuotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeQuotes.length]);

  if (slidesLoading || heroSettingsLoading) {
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

  if (!heroSettings && !slide) return null;

  return (
    <section style={{ minHeight: "700px", display: "flex", alignItems: "center", overflow: "hidden", position: "relative", ...(backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}) }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%, rgba(0,74,198,0.06), transparent 60%)", pointerEvents: "none" }} />
      <div className="container" style={{ position: "relative", zIndex: 10, display: "grid", gridTemplateColumns: heroIllustration ? "1fr 1fr" : "1fr", gap: 32, alignItems: "center" }}>
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
            {title}
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
            {subtitle}
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
                <Link to={primaryButtonUrl || "/discover"}><motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Button size="lg">{primaryButtonText || "Explore Marketplace"} <ArrowRight size={18} /></Button></motion.div></Link>
                <Link to={secondaryButtonUrl || "/signup"}><motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Button variant="outline" size="lg">{secondaryButtonText || "Register Your Business"}</Button></motion.div></Link>
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

        {heroIllustration && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-visual-lg"
          >
            <img src={heroIllustration} alt="Hero illustration" style={{ width: "100%", maxWidth: 500, height: "auto" }} />
          </motion.div>
        )}
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

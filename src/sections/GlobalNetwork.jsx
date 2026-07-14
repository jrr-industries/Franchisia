import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Globe, Users, Building2, Briefcase, MapPin, Loader2 } from "lucide-react";
import { useStats } from "../hooks/useCMS";

function AnimatedCounter({ value, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const numeric = parseInt(value.replace(/[^0-9]/g, "")) || 0;
    if (numeric === 0) { setCount(0); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * numeric));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  const suffix = value.replace(/[0-9]/g, "");
  return <span ref={ref}>{count}{suffix}</span>;
}

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

const statDefaults = [
  { icon: Users, value: "10K+", label: "Professionals" },
  { icon: Building2, value: "500+", label: "Companies" },
  { icon: Briefcase, value: "1K+", label: "Listings" },
  { icon: MapPin, value: "100+", label: "Countries" },
];

const statIcons = [Users, Building2, Briefcase, MapPin];

export default function GlobalNetwork() {
  const { data: stats, isLoading } = useStats();
  const hasStats = stats?.length > 0;

  if (isLoading) {
    return (
      <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center" }}>
          <Loader2 size={32} className="spin" color="var(--primary)" />
        </div>
      </section>
    );
  }

  const displayStats = hasStats
    ? stats.slice(0, 4).map((s, i) => ({
        icon: statIcons[i] || Users,
        value: s.value,
        label: s.label,
      }))
    : statDefaults;

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>Global Network</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            Connecting entrepreneurs, investors, and franchise experts worldwide.
          </p>
        </motion.div>

        <div className="global-network-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
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
                    <Globe size={48} color="var(--primary)" style={{ opacity: 0.15 }} />
                  </motion.div>
                </div>
                <div style={{ textAlign: "center", marginTop: 16, fontSize: 14, fontWeight: 600, color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Globe size={16} />
                  Global Network Reach
                </div>
              </div>
            </div>
          </motion.div>

          <div className="global-network-counters" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {displayStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: 24,
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--outline-variant)",
                  borderRadius: 12,
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <stat.icon size={28} color="var(--primary)" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--on-surface)", marginBottom: 4 }}>
                  {hasStats ? <AnimatedCounter value={stat.value} /> : stat.value}
                </div>
                <div style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .global-network-grid { grid-template-columns: 1fr !important; }
            .global-network-counters { grid-template-columns: 1fr 1fr !important; }
          }
          @media (max-width: 480px) {
            .global-network-counters { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

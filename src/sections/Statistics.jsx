import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useStats } from "../hooks/useCMS";

function AnimatedCounter({ value, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const numeric = parseInt(value.replace(/[^0-9]/g, "")) || 0;
    const suffix = value.replace(/[0-9]/g, "");
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

  const numeric = parseInt(value.replace(/[^0-9]/g, "")) || 0;
  const suffix = value.replace(/[0-9]/g, "");
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Statistics() {
  const { data: stats } = useStats();

  if (!stats?.length) {
    return (
      <section style={{ padding: '80px 0', backgroundColor: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', opacity: 0.6 }}>Platform statistics will be displayed once available.</p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: 960,
          margin: '0 auto',
        }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="stat-item"
              style={{
                textAlign: 'center',
                padding: '20px 40px',
                minWidth: 180,
                flex: '0 1 auto',
                position: 'relative',
              }}
            >
              <div className="stat-value" style={{
                fontSize: 48,
                fontWeight: 700,
                color: 'var(--primary-fixed)',
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.2,
                marginBottom: 4,
              }}>
                <AnimatedCounter value={s.value} />
              </div>
              <div style={{
                fontSize: 13,
                color: 'var(--on-surface-variant)',
                fontWeight: 500,
                letterSpacing: '0.01em',
              }}>
                {s.label}
              </div>
              {i < stats.length - 1 && (
                <div className="stat-divider" style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 1,
                  height: 40,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                }} />
              )}
            </motion.div>
          ))}
        </motion.div>
        <style>{`
          @media (max-width: 768px) {
            .stat-item { min-width: 140px !important; padding: 16px 20px !important; }
            .stat-value { font-size: 36px !important; }
            .stat-divider { display: none !important; }
          }
          @media (max-width: 480px) {
            .stat-item { min-width: 50% !important; padding: 12px 16px !important; }
            .stat-item:nth-child(2n) .stat-divider { display: none !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

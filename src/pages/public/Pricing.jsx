import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, Loader2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { usePlans } from "../../hooks/useCMS";

export default function Pricing() {
  const navigate = useNavigate();
  const { data: plans, isLoading, isError } = usePlans();

  const allFeatureKeys = useMemo(() => {
    if (!plans?.length) return [];
    return [...new Set(plans.flatMap((p) => Object.keys(p.features || {})))];
  }, [plans]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--text-secondary)" }}>Failed to load pricing plans.</p>
      </div>
    );
  }

  if (!plans?.length) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--text-secondary)" }}>No pricing plans available at this time.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ textAlign: "center", marginBottom: 48 }}>
            <Badge variant="info" style={{ marginBottom: 12 }}>Pricing</Badge>
            <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Simple, Transparent Pricing</h1>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto" }}>
              Choose the plan that fits your needs. No hidden fees.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 60 }}>
            {plans.map((plan, index) => (
              <motion.div
                key={plan.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -4 }}
                style={{
                  backgroundColor: "var(--surface)",
                  border: `2px solid ${plan.isPopular ? "var(--primary)" : "var(--outline-variant)"}`,
                  borderRadius: 16, padding: 32, position: "relative",
                  boxShadow: plan.isPopular ? "0 8px 32px rgba(0,74,198,0.15)" : "none",
                }}
              >
                {plan.isPopular && (
                  <span style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", backgroundColor: "var(--primary)", color: "#fff", padding: "4px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Most Popular
                  </span>
                )}
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "var(--on-surface)" }}>{plan.name}</h3>
                <p style={{ fontSize: 14, color: "var(--on-surface-variant)", marginBottom: 20 }}>{plan.description}</p>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: "var(--on-surface)" }}>
                    {Number(plan.price) === 0 ? "$0" : `$${Number(plan.price)}`}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--on-surface-variant)" }}>
                    {Number(plan.price) === 0 ? "/forever" : `/${plan.interval}`}
                  </span>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={plan.isPopular ? "primary" : "outline"}
                    fullWidth
                    onClick={() => navigate(Number(plan.price) === 0 ? "/signup" : `/payment?plan=${plan.slug}`)}
                  >
                    {Number(plan.price) === 0 ? "Get Started" : plan.isPopular ? "Upgrade" : "Choose Enterprise"} <ArrowRight size={16} />
                  </Button>
                </motion.div>
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                  {Object.entries(plan.features || {}).map(([feature, included]) => (
                    <div key={feature} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--on-surface-variant)" }}>
                      {included ? <Check size={16} color="var(--primary)" /> : <X size={16} color="var(--text-muted)" />}
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {allFeatureKeys.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ textAlign: "center", marginBottom: 48 }}>
              <Badge variant="info" style={{ marginBottom: 12 }}>Comparison</Badge>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Compare Plans</h2>
              <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto 32px" }}>
                See exactly what you get with each plan.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600, textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ padding: "16px 20px", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>Feature</th>
                      {plans.map((p) => (
                        <th key={p.slug} style={{ textAlign: "center", padding: "16px 20px", fontSize: 14, fontWeight: 600, color: p.isPopular ? "var(--primary)" : "" }}>
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allFeatureKeys.map((feature) => (
                      <tr key={feature} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "14px 20px", fontSize: 14 }}>{feature}</td>
                        {plans.map((p) => {
                          const included = p.features?.[feature];
                          return (
                            <td key={p.slug} style={{ textAlign: "center", padding: "14px 20px" }}>
                              {included ? <Check size={18} color="var(--accent)" style={{ margin: "0 auto" }} /> : <X size={18} color="var(--text-muted)" style={{ margin: "0 auto" }} />}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

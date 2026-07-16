import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { usePlans, usePublicSettings, getSectionContent } from "../hooks/useCMS";
import Button from "../components/ui/Button";

export default function PricingSection() {
  const navigate = useNavigate();
  const { data: plans, isLoading, isError } = usePlans();
  const { data: sectionSettings } = usePublicSettings();

  if (isLoading || isError || !plans?.length) return null;

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }} id="pricing">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'pricing', { heading: 'Simple, Transparent Pricing' }).heading}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {getSectionContent(sectionSettings, 'pricing', { description: 'Choose the plan that fits your goals.' }).description}
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          {plans.map((plan, index) => {
            const features = plan.features && typeof plan.features === "object" ? plan.features : {};
            return (
              <motion.div
                key={plan.slug || plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
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
                    {plan.price === 0 ? "$0" : `$${plan.price}`}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--on-surface-variant)" }}>
                    {plan.price === 0 ? "/forever" : `/${plan.interval}`}
                  </span>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={plan.isPopular ? "primary" : "outline"}
                    fullWidth
                    onClick={() => navigate(plan.price === 0 ? "/signup" : `/payment?plan=${plan.slug}`)}
                  >
                    {plan.price === 0 ? "Get Started" : "Upgrade"} <ArrowRight size={16} />
                  </Button>
                </motion.div>
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                  {Object.entries(features).filter(([, included]) => included).map(([feature]) => (
                    <div key={feature} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--on-surface-variant)" }}>
                      <Check size={16} color="var(--primary)" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

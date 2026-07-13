import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, CreditCard, Shield, Lock, Zap,
  Wallet, Building2, Landmark, Smartphone, Radio,
  ChevronRight, HelpCircle, Loader2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { usePlans, useFAQ } from "../../hooks/useCMS";

const paymentMethods = [
  { icon: CreditCard, name: "Cards", desc: "Visa, Mastercard, Amex" },
  { icon: Building2, name: "Net Banking", desc: "All major banks" },
  { icon: Smartphone, name: "UPI", desc: "Google Pay, PhonePe, Paytm" },
  { icon: Wallet, name: "Wallet", desc: "Paytm, Mobikwik, Freecharge" },
  { icon: Landmark, name: "Razorpay", desc: "Coming soon" },
  { icon: Radio, name: "Stripe", desc: "Coming soon" },
];

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planSlug = searchParams.get("plan") || "professional";
  const { data: plans, isLoading: plansLoading, isError: plansError } = usePlans();
  const { data: faqs, isLoading: faqsLoading } = useFAQ();
  const [selectedPlan, setSelectedPlan] = useState(planSlug);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const plan = plans?.find((p) => p.slug === selectedPlan) || plans?.[1] || plans?.[0] || null;
  const isFree = plan ? Number(plan.price) === 0 : true;
  const priceDisplay = isFree ? "$0" : billingCycle === "yearly" ? `$${Number(plan.price) * 10}` : `$${Number(plan.price)}`;
  const periodDisplay = isFree ? "forever" : billingCycle === "yearly" ? "/year" : `/${plan?.interval || "month"}`;

  const allFeatureKeys = useMemo(() => {
    if (!plans?.length) return [];
    return [...new Set(plans.flatMap((p) => Object.keys(p.features || {})))];
  }, [plans]);

  if (plansLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />
      </div>
    );
  }

  if (plansError) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--text-secondary)" }}>Failed to load plans.</p>
      </div>
    );
  }

  if (!plans?.length) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--text-secondary)" }}>No plans available at this time.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section style={{ padding: "60px 0", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container" style={{ maxWidth: 900, margin: "0 auto" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
            <span onClick={() => navigate("/")} style={{ color: "var(--primary)", cursor: "pointer", textDecoration: "none" }}>Home</span>
            <span>/</span>
            <span onClick={() => navigate("/pricing")} style={{ color: "var(--primary)", cursor: "pointer", textDecoration: "none" }}>Pricing</span>
            <span>/</span>
            <span>Payment</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ padding: "48px 32px", borderRadius: 16, background: "linear-gradient(135deg, var(--primary-light), var(--surface))", border: "1px solid var(--border)", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <CreditCard size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Payment</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Choose your plan and complete payment to unlock premium features.
                </p>
              </div>
            </div>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Select Plan</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {plans.map((p) => (
                  <motion.div key={p.slug} onClick={() => setSelectedPlan(p.slug)}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    style={{ padding: 16, borderRadius: 12, border: `2px solid ${selectedPlan === p.slug ? "var(--primary)" : "var(--border)"}`, backgroundColor: selectedPlan === p.slug ? "var(--primary-light)" : "var(--surface)", cursor: "pointer", position: "relative", transition: "all 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</span>
                          {p.isPopular && <Badge variant="info" style={{ fontSize: 9 }}>Popular</Badge>}
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{p.description}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 20, fontWeight: 800 }}>${Number(p.price)}</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>/{p.interval}</span>
                      </div>
                    </div>
                    {selectedPlan === p.slug && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, borderRadius: "50%", backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check size={12} color="#fff" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {!isFree && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--text-secondary)" }}>Billing Cycle</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["monthly", "yearly"].map((cycle) => (
                      <button key={cycle} onClick={() => setBillingCycle(cycle)}
                        style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: `1px solid ${billingCycle === cycle ? "var(--primary)" : "var(--border)"}`, backgroundColor: billingCycle === cycle ? "var(--primary-light)" : "var(--surface)", color: billingCycle === cycle ? "var(--primary)" : "var(--text-secondary)", cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.15s" }}>
                        {cycle === "monthly" ? "Monthly" : "Yearly (2 months free)"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {plan && (
                <Card padding="20px">
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Plan Features</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.entries(plan.features || {}).map(([feature, included]) => included ? (
                      <div key={feature} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                        <Check size={14} color="var(--primary)" />
                        {feature}
                      </div>
                    ) : null)}
                  </div>
                </Card>
              )}

              {allFeatureKeys.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Compare All Plans</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--border)" }}>
                          <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600 }}>Feature</th>
                          {plans.map((p) => (
                            <th key={p.slug} style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600, color: selectedPlan === p.slug ? "var(--primary)" : "" }}>{p.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allFeatureKeys.map((feature) => (
                          <tr key={feature} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "8px 12px" }}>{feature}</td>
                            {plans.map((p) => {
                              const included = p.features?.[feature];
                              return (
                                <td key={p.slug} style={{ padding: "8px 12px", textAlign: "center" }}>
                                  {included ? <Check size={14} color="var(--accent)" style={{ margin: "0 auto" }} /> : <span style={{ color: "var(--text-muted)" }}>-</span>}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Payment Method</h2>

              <div style={{ marginBottom: 20 }}>
                <div style={{ padding: 20, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <Lock size={20} color="var(--primary)" />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>Secure Payments</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Your payment information is encrypted and secure.</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {paymentMethods.map((pm) => {
                      const Icon = pm.icon;
                      return (
                        <div key={pm.name}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", opacity: 0.6, cursor: "not-allowed" }}>
                          <Icon size={20} color="var(--text-muted)" />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 500 }}>{pm.name}</p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{pm.desc}</p>
                          </div>
                          <Badge variant="default" style={{ fontSize: 9 }}>Coming Soon</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ padding: 24, borderRadius: 12, border: "2px dashed var(--border)", backgroundColor: "var(--background)", textAlign: "center" }}>
                  <Zap size={36} color="var(--primary)" style={{ marginBottom: 12, opacity: 0.5 }} />
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Payment Integration Coming Soon</h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 400, margin: "0 auto 16px" }}>
                    Franchisia is currently in early access. Subscription payments will be enabled once payment gateway integration is completed.
                  </p>
                  <div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: 12, color: "var(--text-muted)", flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Shield size={14} /> Razorpay</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Radio size={14} /> Stripe</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Smartphone size={14} /> UPI</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><CreditCard size={14} /> Cards</span>
                  </div>
                </div>
              </div>

              {plan && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>Order Summary</p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-secondary)" }}>
                    <span>{plan.name} Plan ({billingCycle})</span>
                    <span>{priceDisplay}{periodDisplay}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-secondary)" }}>
                    <span>GST (18%)</span>
                    <span>--</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <span>Total</span>
                    <span>{priceDisplay}{periodDisplay}</span>
                  </div>
                  <Button variant="primary" fullWidth size="lg" disabled style={{ marginTop: 8 }}>
                    <Lock size={16} /> Pay {priceDisplay}
                  </Button>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
                    Payment gateway not yet integrated.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {!faqsLoading && faqs?.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <HelpCircle size={18} color="var(--primary)" /> Frequently Asked Questions
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {faqs.map((faq) => {
                  const question = faq.q || faq.question;
                  const answer = faq.a || faq.answer;
                  if (!question) return null;
                  return (
                    <div key={question} style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--surface)", cursor: "pointer" }}
                      onClick={() => setExpandedFaq(expandedFaq === question ? null : question)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{question}</span>
                        <ChevronRight size={16} style={{ transform: expandedFaq === question ? "rotate(90deg)" : "", transition: "transform 0.15s" }} />
                      </div>
                      <AnimatePresence>
                        {expandedFaq === question && (
                          <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 12, lineHeight: 1.6, overflow: "hidden" }}>
                            {answer}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            style={{ textAlign: "center" }}>
            <Button variant="outline" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate("/pricing")}>
              Back to Pricing
            </Button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}

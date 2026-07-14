import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Loader2, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";
import { useSiteContact, usePublicSettings, getSectionContent } from "../hooks/useCMS";

const socialIcons = { linkedin: Linkedin, twitter: Twitter, facebook: Facebook, instagram: Instagram };

export default function ContactSection() {
  const { data: contact, isLoading, isError } = useSiteContact();
  const { data: sectionSettings } = usePublicSettings();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const c = contact || {};
  const email = c.email || "hello@franchisia.com";
  const phone = c.phone || "+1 (555) 123-4567";
  const address = c.address || "123 Business Ave, Suite 100";
  const businessHours = c.businessHours || "Mon-Fri: 9AM-6PM";
  const socialLinks = c.socialLinks || null;

  if (isLoading) {
    return (
      <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center" }}>
          <Loader2 size={32} className="spin" color="var(--primary)" />
        </div>
      </section>
    );
  }

  const contactCards = [
    { icon: Mail, label: "Email", value: email, gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
    { icon: Phone, label: "Phone", value: phone, gradient: "linear-gradient(135deg, #22c55e, #16a34a)" },
    { icon: MapPin, label: "Address", value: address, gradient: "linear-gradient(135deg, #f59e0b, #eab308)" },
    { icon: Clock, label: "Business Hours", value: businessHours, gradient: "linear-gradient(135deg, #ec4899, #f43f5e)" },
  ];

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'contact', { heading: 'Get in Touch' }).heading}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {getSectionContent(sectionSettings, 'contact', { description: "Have questions? We'd love to hear from you." }).description}
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {contactCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  style={{ padding: 24, backgroundColor: "var(--surface)", border: "1px solid var(--outline-variant)", borderRadius: 12, transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: card.gradient, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <Icon size={18} color="#fff" />
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{card.label}</p>
                  <p style={{ fontSize: 14, color: "var(--on-surface)", fontWeight: 500, lineHeight: 1.5 }}>{card.value}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ padding: 32, backgroundColor: "var(--surface)", border: "1px solid var(--outline-variant)", borderRadius: 12 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <MessageSquare size={20} color="var(--primary)" />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--on-surface)" }}>Send us a message</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={handleChange("name")}
                  style={{
                    padding: "12px 16px", borderRadius: 10, border: "1px solid var(--outline-variant)",
                    fontSize: 14, outline: "none", backgroundColor: "var(--surface)",
                    color: "var(--on-surface)", width: "100%", boxSizing: "border-box",
                  }}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  value={formData.email}
                  onChange={handleChange("email")}
                  style={{
                    padding: "12px 16px", borderRadius: 10, border: "1px solid var(--outline-variant)",
                    fontSize: 14, outline: "none", backgroundColor: "var(--surface)",
                    color: "var(--on-surface)", width: "100%", boxSizing: "border-box",
                  }}
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                required
                value={formData.subject}
                onChange={handleChange("subject")}
                style={{
                  padding: "12px 16px", borderRadius: 10, border: "1px solid var(--outline-variant)",
                  fontSize: 14, outline: "none", backgroundColor: "var(--surface)",
                  color: "var(--on-surface)", width: "100%", boxSizing: "border-box", marginBottom: 16,
                }}
              />
              <textarea
                placeholder="Your Message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange("message")}
                style={{
                  padding: "12px 16px", borderRadius: 10, border: "1px solid var(--outline-variant)",
                  fontSize: 14, outline: "none", backgroundColor: "var(--surface)",
                  color: "var(--on-surface)", width: "100%", boxSizing: "border-box", resize: "vertical", marginBottom: 16,
                  fontFamily: "inherit",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "14px 28px", borderRadius: 10, border: "none", backgroundColor: "var(--primary)",
                  color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                <Send size={16} />
                Send Message
              </button>
            </form>

            {submitted && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 16, fontSize: 14, color: "var(--primary)", fontWeight: 600 }}
              >
                Message sent! We'll get back to you soon.
              </motion.p>
            )}

            {socialLinks && typeof socialLinks === "object" && Object.keys(socialLinks).length > 0 && (
              <div style={{ display: "flex", gap: 12, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--outline-variant)" }}>
                <span style={{ fontSize: 13, color: "var(--on-surface-variant)", marginRight: 8, alignSelf: "center" }}>Follow us:</span>
                {Object.entries(socialLinks).map(([key, url]) => {
                  const Icon = socialIcons[key.toLowerCase()];
                  if (!Icon || !url) return null;
                  return (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "var(--surface)", border: "1px solid var(--outline-variant)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-surface-variant)", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.color = "var(--on-surface-variant)"; }}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

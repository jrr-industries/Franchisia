import Badge from '../../components/ui/Badge';

const sections = [
  {
    title: 'Information We Collect',
    content: 'We collect information you provide when creating an account, including your name, email address, phone number, company details, and professional information. We also collect usage data such as pages visited, features used, and interactions with other users to improve our services.',
  },
  {
    title: 'How We Use Your Information',
    content: 'Your information is used to provide and improve our services, facilitate connections between franchise professionals, send relevant notifications and updates, analyze platform usage, and ensure compliance with our terms. We may also use your email to send service-related communications.',
  },
  {
    title: 'Information Sharing',
    content: 'We do not sell your personal information. We may share information with other users as part of the platform\'s networking features, with service providers who assist in operating our platform, or when required by law. Your profile information is visible to other registered users.',
  },
  {
    title: 'Data Security',
    content: 'We implement industry-standard security measures including encryption, secure servers, and access controls to protect your data. However, no method of transmission over the internet is 100% secure. We regularly review and update our security practices.',
  },
  {
    title: 'Your Rights',
    content: 'You have the right to access, correct, or delete your personal information. You can update your profile settings at any time. You may also request a copy of your data or close your account by contacting our support team.',
  },
  {
    title: 'Cookies & Tracking',
    content: 'We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can manage cookie preferences through your browser settings. Disabling cookies may affect certain platform features.',
  },
  {
    title: 'Third-Party Services',
    content: 'Our platform may contain links to third-party services. We are not responsible for the privacy practices of these services. We encourage you to review their privacy policies before providing any personal information.',
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this privacy policy from time to time. We will notify you of significant changes via email or through the platform. Continued use of the platform after changes constitutes acceptance of the updated policy.',
  },
  {
    title: 'Contact Us',
    content: 'If you have questions about this privacy policy or how we handle your data, please contact us at privacy@franchisia.com or through our Contact page.',
  },
];

export default function Privacy() {
  return (
    <div>
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Badge variant="info" style={{ marginBottom: 12 }}>Legal</Badge>
            <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>Privacy Policy</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Last updated: January 1, 2024</p>
          </div>

          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 48 }}>
            This Privacy Policy describes how Franchisia collects, uses, and protects your personal information when you use our platform. By using Franchisia, you agree to the collection and use of information in accordance with this policy.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {sections.map((s, i) => (
              <div key={i}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
                  {i + 1}. {s.title}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

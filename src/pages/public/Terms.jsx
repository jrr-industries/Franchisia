import Badge from '../../components/ui/Badge';

const sections = [
  {
    title: 'Acceptance of Terms',
    content: 'By accessing or using Franchisia, you agree to be bound by these Terms of Service. If you do not agree to all the terms, you may not access or use our services. These terms apply to all visitors, users, and others who access or use the platform.',
  },
  {
    title: 'Account Registration',
    content: 'You must provide accurate, current, and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.',
  },
  {
    title: 'User Conduct',
    content: 'You agree to use the platform responsibly and professionally. Prohibited activities include: posting false or misleading information, harassing other users, spamming, uploading malicious content, violating intellectual property rights, or engaging in any illegal activity. We reserve the right to suspend or terminate accounts that violate these rules.',
  },
  {
    title: 'Intellectual Property',
    content: 'The Franchisia platform, including its design, logos, text, graphics, and software, is owned by Franchisia and protected by intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written consent. User-generated content remains the property of its creator.',
  },
  {
    title: 'Limitation of Liability',
    content: 'Franchisia is provided "as is" without warranties of any kind. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform. We do not guarantee the accuracy of listings or the success of franchise ventures facilitated through our network.',
  },
  {
    title: 'Termination',
    content: 'We may terminate or suspend your account at any time for violation of these terms or for any other reason. Upon termination, your right to use the platform will immediately cease. You may terminate your account at any time by contacting our support team.',
  },
  {
    title: 'Dispute Resolution',
    content: 'Any disputes arising from these terms shall be resolved through binding arbitration in accordance with the laws of the State of California. You agree to resolve disputes on an individual basis and waive the right to participate in class actions.',
  },
  {
    title: 'Changes to Terms',
    content: 'We reserve the right to modify these terms at any time. We will notify users of material changes via email or platform notification. Continued use of Franchisia after changes constitutes acceptance of the new terms.',
  },
  {
    title: 'Contact Information',
    content: 'For questions about these Terms of Service, please contact us at legal@franchisia.com or through our Contact page at franchisia.com/contact.',
  },
];

export default function Terms() {
  return (
    <div>
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Badge variant="info" style={{ marginBottom: 12 }}>Legal</Badge>
            <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>Terms of Service</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Last updated: January 1, 2024</p>
          </div>

          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 48 }}>
            These Terms of Service govern your use of the Franchisia platform. Please read these terms carefully before using our services.
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

import Badge from '../../components/ui/Badge';
import { usePage } from '../../hooks/useCMS';

const fallbackSections = [
  {
    title: 'Information We Collect',
    content: 'Franchisia collects your name, email address, and profile information to provide authentication and platform services.',
  },
  {
    title: 'How We Use Your Information',
    content: 'Your information is used to provide and improve our services, facilitate connections between franchise professionals, send relevant notifications and updates, analyze platform usage, and ensure compliance with our terms.',
  },
  {
    title: 'Information Sharing',
    content: 'We do not sell your personal information.',
  },
  {
    title: 'Data Security',
    content: 'Information is stored securely and used only to operate the platform.',
  },
  {
    title: 'Your Rights',
    content: 'You have the right to access, correct, or delete your personal information. You can update your profile settings at any time.',
  },
  {
    title: 'Cookies & Tracking',
    content: 'We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content.',
  },
  {
    title: 'Third-Party Services',
    content: 'Our platform may contain links to third-party services. We are not responsible for their privacy practices.',
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this privacy policy from time to time. We will notify you of significant changes via email or through the platform.',
  },
  {
    title: 'Contact Us',
    content: 'For questions, contact: jrr.industries6@gmail.com',
  },
];

function parseSections(content) {
  if (!content) return fallbackSections;
  const lines = content.split('\n').filter(Boolean);
  const sections = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { title: line.replace('## ', '').trim(), content: '' };
    } else if (current) {
      current.content += (current.content ? '\n' : '') + line;
    }
  }
  if (current) sections.push(current);
  return sections.length > 0 ? sections : fallbackSections;
}

export default function Privacy() {
  const { data: page, isLoading } = usePage('privacy');
  const sections = parseSections(page?.content);

  if (isLoading) {
    return (
      <div>
        <section style={{ padding: '80px 0' }}>
          <div className="container" style={{ maxWidth: 800, textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Badge variant="info" style={{ marginBottom: 12 }}>Legal</Badge>
            <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>{page?.title || 'Privacy Policy'}</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Last updated: {page?.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'January 1, 2024'}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {sections.map((s, i) => (
              <div key={i}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
                  {i + 1}. {s.title}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
import Badge from '../../components/ui/Badge';
import { usePage } from '../../hooks/useCMS';

const fallbackSections = [
  {
    title: 'Acceptance of Terms',
    content: 'By using Franchisia, you agree to use the platform lawfully.',
  },
  {
    title: 'Account Registration',
    content: 'You must provide accurate, current, and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.',
  },
  {
    title: 'User Conduct',
    content: 'Users are responsible for the content they upload. Franchisia may suspend accounts that violate these terms.',
  },
  {
    title: 'Intellectual Property',
    content: 'The Franchisia platform, including its design, logos, text, graphics, and software, is owned by Franchisia and protected by intellectual property laws.',
  },
  {
    title: 'Limitation of Liability',
    content: 'Franchisia is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform.',
  },
  {
    title: 'Termination',
    content: 'We may terminate or suspend your account at any time for violation of these terms. You may terminate your account by contacting our support team.',
  },
  {
    title: 'Dispute Resolution',
    content: 'Any disputes arising from these terms shall be resolved through binding arbitration in accordance with applicable laws.',
  },
  {
    title: 'Changes to Terms',
    content: 'We reserve the right to modify these terms at any time. We will notify users of material changes via email or platform notification.',
  },
  {
    title: 'Contact',
    content: 'Contact: jrr.industries6@gmail.com',
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

export default function Terms() {
  const { data: page, isLoading } = usePage('terms');
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
            <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>{page?.title || 'Terms of Service'}</h1>
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
import { useState, useEffect } from 'react';
import { ClipboardList, Loader2, ExternalLink } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const API = '/api';

const statusColors = {
  submitted: { bg: '#DBEAFE', color: '#1E40AF' },
  reviewed: { bg: '#FEF3C7', color: '#92400E' },
  accepted: { bg: '#D1FAE5', color: '#065F46' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
  withdrawn: { bg: '#F3F4F6', color: '#374151' },
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch(`${API}/applications/my`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load applications');
        const data = await res.json();
        setApplications(data.applications || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Applications</h1>
        <Card hover={false} padding="48px" style={{ textAlign: 'center' }}>
          <ClipboardList size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Failed to load applications</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Applications</h1>
      {applications.length === 0 ? (
        <Card hover={false} padding="48px" style={{ textAlign: 'center' }}>
          <ClipboardList size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>No applications found</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>Browse listings and apply to get started.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {applications.map((app) => (
            <Card key={app.id} hover={false} padding="20px">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                      {app.listing?.title || 'Listing'}
                    </h3>
                    <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'} style={{ fontSize: 11 }}>
                      {app.status}
                    </Badge>
                  </div>
                  {app.listing?.company?.name && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 4px' }}>
                      {app.listing.company.name}
                    </p>
                  )}
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  {app.coverMessage && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, fontStyle: 'italic' }}>
                      "{app.coverMessage.substring(0, 200)}{app.coverMessage.length > 200 ? '...' : ''}"
                    </p>
                  )}
                </div>
                {app.listing?.slug && (
                  <a href={`/listing/${app.listing.slug}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    View Listing <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

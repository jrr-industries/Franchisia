import { useState, useEffect } from 'react';
import { FolderOpen, Loader2, FileText, Download, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const API = '/api';

const docTypes = ['identity', 'business', 'financial', 'legal', 'other'];

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(`${API}/users/me/documents`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
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
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Documents</h1>
        <Card hover={false} padding="48px" style={{ textAlign: 'center' }}>
          <FolderOpen size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Failed to load documents</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Documents</h1>
      {documents.length === 0 ? (
        <Card hover={false} padding="48px" style={{ textAlign: 'center' }}>
          <FolderOpen size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>No documents found</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>Upload documents from your profile settings.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {documents.map((doc) => (
            <Card key={doc.id} hover={false} padding="20px">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{doc.title || doc.fileName || 'Untitled'}</h3>
                    {doc.type && <Badge variant="default" style={{ fontSize: 10 }}>{doc.type}</Badge>}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    {doc.fileName && `${doc.fileName} · `}{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noreferrer" style={{ padding: 8, borderRadius: 8, color: 'var(--text-muted)', display: 'flex', textDecoration: 'none' }}>
                      <Eye size={18} />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

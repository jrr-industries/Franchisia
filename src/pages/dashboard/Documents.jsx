import { useState, useEffect, useRef } from 'react';
import { FolderOpen, Loader2, FileText, Eye, Trash2, Upload, ChevronDown } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const API = '/api';

const docTypes = ['identity', 'business', 'financial', 'legal', 'other'];

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [docType, setDocType] = useState('identity');
  const [typeOpen, setTypeOpen] = useState(false);
  const fileRef = useRef(null);

  const fetchDocs = async () => {
    try {
      const res = await fetch(`${API}/users/me/documents`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDocuments(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch(`${API}/uploads/application-document`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Upload failed');
      }
      const { url, fileName } = await uploadRes.json();
      const createRes = await fetch(`${API}/users/me/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: docType, url, fileName }),
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || 'Failed to save document');
      }
      await fetchDocs();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/users/me/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>My Documents</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setTypeOpen((prev) => !prev)}
              style={{
                padding: '8px 14px', fontSize: 13, fontWeight: 600,
                backgroundColor: 'var(--surface)', color: 'var(--on-surface)',
                border: '1px solid var(--outline-variant)', borderRadius: 10,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              {docType.charAt(0).toUpperCase() + docType.slice(1)}
              <ChevronDown size={14} />
            </button>
            {typeOpen && (
              <>
                <div onClick={() => setTypeOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)',
                  borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  zIndex: 11, minWidth: 140, overflow: 'hidden',
                }}>
                  {docTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setDocType(t); setTypeOpen(false); }}
                      style={{
                        display: 'block', width: '100%', padding: '10px 14px',
                        fontSize: 13, fontWeight: t === docType ? 700 : 500,
                        color: t === docType ? 'var(--primary)' : 'var(--on-surface-variant)',
                        backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 700,
              backgroundColor: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.jpg,.jpeg,.png" onChange={handleUpload} style={{ display: 'none' }} />
        </div>
      </div>

      {error && (
        <Card hover={false} padding="12px 16px" style={{ marginBottom: 16, borderLeft: '3px solid var(--danger)' }}>
          <p style={{ fontSize: 13, color: 'var(--danger)', margin: 0 }}>{error}</p>
        </Card>
      )}

      {documents.length === 0 ? (
        <Card hover={false} padding="48px" style={{ textAlign: 'center' }}>
          <FolderOpen size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>No documents found</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>Click "Upload" above to add a document.</p>
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
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{doc.fileName || 'Untitled'}</h3>
                    {doc.type && <Badge variant="default" style={{ fontSize: 10 }}>{doc.type}</Badge>}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noreferrer" style={{ padding: 8, borderRadius: 8, color: 'var(--text-muted)', display: 'flex', textDecoration: 'none' }}>
                      <Eye size={18} />
                    </a>
                  )}
                  <button onClick={() => handleDelete(doc.id)} style={{ padding: 8, borderRadius: 8, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
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
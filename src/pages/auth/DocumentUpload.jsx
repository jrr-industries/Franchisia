import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, X, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const requiredDocs = {
  franchisor: [
    { type: 'business_registration', label: 'Company Registration Certificate', accept: '.pdf,.jpg,.png' },
    { type: 'company_logo', label: 'Company Logo', accept: '.jpg,.png,.svg' },
  ],
  supplier: [
    { type: 'business_registration', label: 'Business Registration Certificate', accept: '.pdf,.jpg,.png' },
    { type: 'gst_certificate', label: 'GST/Tax Certificate', accept: '.pdf,.jpg,.png' },
  ],
  consultant: [
    { type: 'business_registration', label: 'Business Registration (if applicable)', accept: '.pdf,.jpg,.png' },
    { type: 'professional_license', label: 'Professional License/Certificate', accept: '.pdf,.jpg,.png' },
  ],
};

export default function DocumentUpload() {
  const { user, uploadDocument, submitForReview } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const role = user?.role;
  const docs = requiredDocs[role] || [];

  const handleFileSelect = async (docType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = docType.accept;
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading((prev) => ({ ...prev, [docType.type]: true }));
      setError('');

      try {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const result = await uploadDocument({
          type: docType.type,
          url: base64,
          fileName: file.name,
        });

        setDocuments((prev) => ({ ...prev, [docType.type]: result.document }));
      } catch (err) {
        setError(err.message);
      } finally {
        setUploading((prev) => ({ ...prev, [docType.type]: false }));
      }
    };
    input.click();
  };

  const handleSubmitForReview = async () => {
    if (docs.length > 0) {
      const missing = docs.filter((d) => !documents[d.type]);
      if (missing.length > 0) {
        setError(`Please upload: ${missing.map((d) => d.label).join(', ')}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await submitForReview();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const allUploaded = docs.length === 0 || docs.every((d) => documents[d.type]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <Card padding="40px" hover={false} style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 24, color: 'var(--primary)', marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
            Franchisia
          </Link>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Upload size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Upload Documents</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Upload the required documents for verification
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius-sm)', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {docs.map((doc) => {
            const isUploaded = !!documents[doc.type];
            const isLoading = uploading[doc.type];
            return (
              <div
                key={doc.type}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${isUploaded ? 'var(--success)' : 'var(--border)'}`,
                  backgroundColor: isUploaded ? '#F0FDF4' : 'var(--surface)',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: isUploaded ? '#D1FAE5' : 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isUploaded ? '#10B981' : 'var(--text-muted)',
                }}>
                  {isUploaded ? <CheckCircle size={20} /> : <FileText size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{doc.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {isUploaded ? documents[doc.type].fileName : `Accepts: ${doc.accept}`}
                  </p>
                </div>
                <button
                  onClick={() => handleFileSelect(doc)}
                  disabled={isLoading}
                  style={{
                    padding: '8px 16px', fontSize: 13, fontWeight: 500,
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    backgroundColor: isUploaded ? 'transparent' : 'var(--primary)',
                    color: isUploaded ? 'var(--primary)' : '#fff',
                    border: isUploaded ? '2px solid var(--primary)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isLoading ? 'Uploading...' : isUploaded ? 'Replace' : 'Upload'}
                </button>
              </div>
            );
          })}
          {docs.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, padding: 24 }}>
              No documents required for your role.
            </p>
          )}
        </div>

        <Button
          onClick={handleSubmitForReview}
          size="lg"
          icon={<ArrowRight size={18} />}
          fullWidth
          disabled={submitting || !allUploaded}
        >
          {submitting ? 'Submitting...' : 'Submit for Review'}
        </Button>
      </Card>
    </div>
  );
}

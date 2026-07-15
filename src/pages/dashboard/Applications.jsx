import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Loader2, Eye, Check, X, Star, Video, User, Mail, Phone, DollarSign, MapPin } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

const API = '/api';

const statusColors = {
  pending: { bg: '#FEF3C7', color: '#92400E' },
  reviewing: { bg: '#DBEAFE', color: '#1E40AF' },
  shortlisted: { bg: '#D1FAE5', color: '#065F46' },
  interview: { bg: '#F3E8FF', color: '#6B21A8' },
  accepted: { bg: '#D1FAE5', color: '#065F46' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
  withdrawn: { bg: '#F3F4F6', color: '#374151' },
};

export default function Applications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const isCompanyOwner = user?.role === 'franchisor' || user?.role === 'admin';
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApps = async () => {
    setLoading(true);
    try {
      const endpoint = isCompanyOwner ? `${API}/applications/company` : `${API}/applications/my`;
      const res = await fetch(endpoint, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, [isCompanyOwner]);

  const handleStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        addToast(`Application ${status}`, 'success');
        fetchApps();
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to update', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleWithdraw = async (id) => {
    const res = await fetch(`${API}/applications/${id}/withdraw`, { method: 'PUT', credentials: 'include' });
    if (res.ok) { addToast('Application withdrawn', 'success'); fetchApps(); }
    else addToast('Failed to withdraw', 'error');
  };

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
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>{isCompanyOwner ? 'Applications Received' : 'My Applications'}</h1>
      {applications.length === 0 ? (
        <Card hover={false} padding="48px" style={{ textAlign: 'center' }}>
          <ClipboardList size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>No applications found</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
            {isCompanyOwner ? 'Applications for your listings will appear here.' : 'Browse listings and apply to get started.'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {applications.map((app) => {
            const sc = statusColors[app.status] || { bg: '#F3F4F6', color: '#374151' };
            const pi = app.personalInfo || {};
            const fi = app.financialInfo || {};

            return (
              <Card
                key={app.id}
                hover={true}
                padding="20px"
                onClick={() => navigate(`/dashboard/application/${app.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
                    {isCompanyOwner && (
                      <Avatar
                        src={pi.profilePhoto || app.applicant?.image}
                        name={pi.fullName || app.applicant?.name}
                        size={44}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                          {isCompanyOwner ? (pi.fullName || app.applicant?.name || 'Unknown') : (app.listing?.title || 'Listing')}
                        </h3>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, backgroundColor: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>
                          {app.status}
                        </span>
                      </div>
                      {isCompanyOwner && pi.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {pi.email}</span>
                          {pi.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {pi.phone}</span>}
                        </div>
                      )}
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                        {isCompanyOwner ? (
                          <>Applied to: <strong>{app.listing?.title || '—'}</strong> at {app.listing?.company?.name || '—'}</>
                        ) : (
                          <>{app.listing?.company?.name || '—'}</>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                        {fi.investmentBudget && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <DollarSign size={12} /> ${Number(fi.investmentBudget).toLocaleString()} budget
                          </span>
                        )}
                        {(app.locationPreference?.preferredCity || app.locationPreference?.preferredCountry) && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} /> {[app.locationPreference.preferredCity, app.locationPreference.preferredState, app.locationPreference.preferredCountry].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
                    <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/application/${app.id}`); }}>
                      Details
                    </Button>
                    {isCompanyOwner && app.status === 'pending' && (
                      <>
                        <Button variant="ghost" size="sm" icon={<Eye size={14} />} style={{ color: '#1E40AF' }} onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'reviewing'); }}>
                          Review
                        </Button>
                        <Button variant="ghost" size="sm" icon={<Star size={14} />} style={{ color: '#065F46' }} onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'shortlisted'); }}>
                          Shortlist
                        </Button>
                        <Button variant="ghost" size="sm" icon={<X size={14} />} style={{ color: '#991B1B' }} onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'rejected'); }}>
                          Reject
                        </Button>
                      </>
                    )}
                    {isCompanyOwner && app.status === 'reviewing' && (
                      <>
                        <Button variant="ghost" size="sm" icon={<Star size={14} />} style={{ color: '#065F46' }} onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'shortlisted'); }}>
                          Shortlist
                        </Button>
                        <Button variant="ghost" size="sm" icon={<Video size={14} />} style={{ color: '#6B21A8' }} onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'interview'); }}>
                          Interview
                        </Button>
                        <Button variant="ghost" size="sm" icon={<X size={14} />} style={{ color: '#991B1B' }} onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'rejected'); }}>
                          Reject
                        </Button>
                      </>
                    )}
                    {isCompanyOwner && app.status === 'shortlisted' && (
                      <>
                        <Button variant="ghost" size="sm" icon={<Video size={14} />} style={{ color: '#6B21A8' }} onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'interview'); }}>
                          Interview
                        </Button>
                        <Button variant="ghost" size="sm" icon={<X size={14} />} style={{ color: '#991B1B' }} onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'rejected'); }}>
                          Reject
                        </Button>
                      </>
                    )}
                    {isCompanyOwner && app.status === 'interview' && (
                      <>
                        <Button variant="ghost" size="sm" icon={<Check size={14} />} style={{ color: '#065F46' }} onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'accepted'); }}>
                          Accept
                        </Button>
                        <Button variant="ghost" size="sm" icon={<X size={14} />} style={{ color: '#991B1B' }} onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'rejected'); }}>
                          Reject
                        </Button>
                      </>
                    )}
                    {!isCompanyOwner && (app.status === 'pending' || app.status === 'reviewing') && (
                      <Button variant="ghost" size="sm" icon={<X size={14} />} style={{ color: '#991B1B' }} onClick={(e) => { e.stopPropagation(); handleWithdraw(app.id); }}>
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
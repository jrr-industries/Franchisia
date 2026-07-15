import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Briefcase, DollarSign,
  Globe, Calendar, Clock, CheckCircle, XCircle, Eye, MessageSquare,
  Download, FileText, Award, TrendingUp, Building2, Loader2,
  Check, AlertCircle, Star, Video,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

const API = '/api';

const statusConfig = {
  pending: { label: 'Pending', color: '#92400E', bg: '#FEF3C7', icon: Clock },
  reviewing: { label: 'Reviewing', color: '#1E40AF', bg: '#DBEAFE', icon: Eye },
  shortlisted: { label: 'Shortlisted', color: '#065F46', bg: '#D1FAE5', icon: Star },
  interview: { label: 'Interview', color: '#6B21A8', bg: '#F3E8FF', icon: Video },
  accepted: { label: 'Accepted', color: '#065F46', bg: '#D1FAE5', icon: CheckCircle },
  rejected: { label: 'Rejected', color: '#991B1B', bg: '#FEE2E2', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: '#374151', bg: '#F3F4F6', icon: XCircle },
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/applications/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setApp(data);
    } catch {
      addToast('Failed to load application', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApp(); }, [id]);

  const handleStatus = async (status) => {
    try {
      const res = await fetch(`${API}/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        addToast(`Application ${status}`, 'success');
        fetchApp();
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to update', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <h2>Application Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/dashboard/applications')}>Back to Applications</Button>
      </div>
    );
  }

  const sc = statusConfig[app.status] || statusConfig.pending;
  const StatusIcon = sc.icon;
  const isCompanyOwner = user?.role === 'franchisor' || user?.role === 'admin';
  const pi = app.personalInfo || {};
  const bi = app.businessInfo || {};
  const fi = app.financialInfo || {};
  const lp = app.locationPreference || {};

  const timeline = [
    { event: 'Applied', date: app.createdAt, icon: Clock, active: true },
    { event: 'Viewed', date: app.viewedAt, icon: Eye, active: !!app.viewedAt },
    { event: 'Shortlisted', date: app.shortlistedAt, icon: Star, active: !!app.shortlistedAt },
    { event: 'Interview', date: app.interviewAt, icon: Video, active: !!app.interviewAt },
    { event: 'Accepted', date: app.acceptedAt, icon: CheckCircle, active: app.status === 'accepted' },
    { event: 'Rejected', date: app.status === 'rejected' ? app.updatedAt : null, icon: XCircle, active: app.status === 'rejected' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/dashboard/applications')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Application Details</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            {app.listing?.title} at {app.listing?.company?.name}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, backgroundColor: sc.bg, color: sc.color }}>
            <StatusIcon size={14} /> {sc.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card hover={false} padding="24px">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <Avatar src={pi.profilePhoto || app.applicant?.image} name={pi.fullName || app.applicant?.name} size={64} />
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{pi.fullName || app.applicant?.name}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0' }}>{pi.currentOccupation}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pi.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <Mail size={14} color="var(--text-muted)" /> {pi.email}
                </div>
              )}
              {pi.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <Phone size={14} color="var(--text-muted)" /> {pi.phone}
                </div>
              )}
              {pi.linkedInProfile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <Globe size={14} color="var(--text-muted)" />
                  <a href={pi.linkedInProfile} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>LinkedIn Profile</a>
                </div>
              )}
            </div>
          </Card>

          {bi.yearsOfExperience || bi.preferredIndustry ? (
            <Card hover={false} padding="24px">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={18} color="var(--primary)" /> Business Experience
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {bi.yearsOfExperience && <InfoItem label="Years Experience" value={bi.yearsOfExperience} />}
                {bi.preferredIndustry && <InfoItem label="Preferred Industry" value={bi.preferredIndustry} />}
                {bi.currentBusiness && <InfoItem label="Current Business" value={bi.currentBusiness} />}
                {bi.currentCompany && <InfoItem label="Current Company" value={bi.currentCompany} />}
                {bi.preferredBusinessModel && <InfoItem label="Business Model" value={bi.preferredBusinessModel} />}
                <InfoItem label="Franchise Experience" value={bi.previousFranchiseExperience ? 'Yes' : 'No'} />
              </div>
            </Card>
          ) : null}

          {fi.investmentBudget || fi.netWorth ? (
            <Card hover={false} padding="24px">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={18} color="var(--primary)" /> Financial Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {fi.investmentBudget && <InfoItem label="Investment Budget" value={`$${Number(fi.investmentBudget).toLocaleString()}`} />}
                {fi.netWorth && <InfoItem label="Net Worth" value={`$${Number(fi.netWorth).toLocaleString()}`} />}
                {fi.availableLiquidCapital && <InfoItem label="Liquid Capital" value={`$${Number(fi.availableLiquidCapital).toLocaleString()}`} />}
                {fi.fundingSource && <InfoItem label="Funding Source" value={fi.fundingSource} />}
                {fi.expectedTimeline && <InfoItem label="Timeline" value={fi.expectedTimeline} />}
              </div>
            </Card>
          ) : null}

          {lp.preferredCountry && (
            <Card hover={false} padding="24px">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} color="var(--primary)" /> Location Preference
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {lp.preferredCountry && <InfoItem label="Country" value={lp.preferredCountry} />}
                {lp.preferredState && <InfoItem label="State" value={lp.preferredState} />}
                {lp.preferredCity && <InfoItem label="City" value={lp.preferredCity} />}
                {lp.preferredTerritory && <InfoItem label="Territory" value={lp.preferredTerritory} />}
                <InfoItem label="Type" value={lp.isRemote ? 'Remote' : 'Local'} />
              </div>
            </Card>
          )}

          {app.documents?.length > 0 && (
            <Card hover={false} padding="24px">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="var(--primary)" /> Uploaded Documents
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {app.documents.map((doc, i) => (
                  <div key={doc.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, backgroundColor: 'var(--surface-container-low)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileText size={16} color="var(--primary)" />
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{doc.fileName}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{doc.type?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noreferrer" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Download size={14} /> Open
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {app.coverLetter && (
            <Card hover={false} padding="24px">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={18} color="var(--primary)" /> Cover Letter
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{app.coverLetter}</p>
            </Card>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card hover={false} padding="24px">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Application Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {timeline.map((t, i) => {
                const TIcon = t.icon;
                return (
                  <div key={t.event} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: t.active ? 'var(--primary)' : 'var(--surface-container-low)',
                        color: t.active ? '#fff' : 'var(--text-muted)',
                        fontSize: 12, zIndex: 1,
                      }}>
                        <TIcon size={12} />
                      </div>
                      {i < timeline.length - 1 && (
                        <div style={{
                          width: 2, flex: 1,
                          backgroundColor: t.active ? 'var(--primary)' : 'var(--border)',
                          minHeight: 24,
                        }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < timeline.length - 1 ? 16 : 0 }}>
                      <p style={{ fontSize: 14, fontWeight: t.active ? 600 : 400, margin: 0, color: t.active ? 'var(--text)' : 'var(--text-muted)' }}>
                        {t.event}
                      </p>
                      {t.date && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                          {new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {isCompanyOwner && (
            <Card hover={false} padding="24px">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {app.status === 'pending' && (
                  <>
                    <Button variant="primary" fullWidth icon={<Eye size={16} />} onClick={() => handleStatus('reviewing')}>
                      Mark as Reviewing
                    </Button>
                    <Button variant="outline" fullWidth icon={<Star size={16} />} onClick={() => handleStatus('shortlisted')}>
                      Shortlist
                    </Button>
                    <Button variant="danger" fullWidth icon={<XCircle size={16} />} onClick={() => handleStatus('rejected')}>
                      Reject
                    </Button>
                  </>
                )}
                {app.status === 'reviewing' && (
                  <>
                    <Button variant="primary" fullWidth icon={<Star size={16} />} onClick={() => handleStatus('shortlisted')}>
                      Shortlist
                    </Button>
                    <Button variant="outline" fullWidth icon={<Video size={16} />} onClick={() => handleStatus('interview')}>
                      Move to Interview
                    </Button>
                    <Button variant="danger" fullWidth icon={<XCircle size={16} />} onClick={() => handleStatus('rejected')}>
                      Reject
                    </Button>
                  </>
                )}
                {app.status === 'shortlisted' && (
                  <>
                    <Button variant="primary" fullWidth icon={<Video size={16} />} onClick={() => handleStatus('interview')}>
                      Move to Interview
                    </Button>
                    <Button variant="danger" fullWidth icon={<XCircle size={16} />} onClick={() => handleStatus('rejected')}>
                      Reject
                    </Button>
                  </>
                )}
                {app.status === 'interview' && (
                  <>
                    <Button variant="primary" fullWidth icon={<CheckCircle size={16} />} onClick={() => handleStatus('accepted')}>
                      Accept
                    </Button>
                    <Button variant="danger" fullWidth icon={<XCircle size={16} />} onClick={() => handleStatus('rejected')}>
                      Reject
                    </Button>
                  </>
                )}
                {app.status === 'accepted' && (
                  <div style={{ padding: 12, borderRadius: 8, backgroundColor: '#D1FAE5', color: '#065F46', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={18} /> Application Accepted
                  </div>
                )}
                {['rejected', 'withdrawn'].includes(app.status) && (
                  <div style={{ padding: 12, borderRadius: 8, backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <XCircle size={18} /> Application {app.status}
                  </div>
                )}
                {app.status === 'accepted' && (
                  <Button variant="secondary" fullWidth icon={<MessageSquare size={16} />} onClick={() => navigate('/messages')}>
                    Open Conversation
                  </Button>
                )}
              </div>
            </Card>
          )}

          {!isCompanyOwner && app.status === 'pending' && (
            <Card hover={false} padding="24px">
              <Button variant="outline" fullWidth icon={<XCircle size={16} />} onClick={async () => {
                const res = await fetch(`${API}/applications/${id}/withdraw`, { method: 'PUT', credentials: 'include' });
                if (res.ok) { addToast('Application withdrawn', 'success'); fetchApp(); }
                else addToast('Failed to withdraw', 'error');
              }}>
                Withdraw Application
              </Button>
            </Card>
          )}

          {app.notes && (
            <Card hover={false} padding="24px">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={18} color="var(--primary)" /> Internal Notes
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {typeof app.notes === 'string' ? app.notes : JSON.stringify(app.notes, null, 2)}
              </p>
            </Card>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function InfoItem({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
    </div>
  );
}
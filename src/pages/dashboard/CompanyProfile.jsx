import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Globe, MessageSquare, UserPlus, ExternalLink, Star,
  Briefcase, Users, TrendingUp, Calendar, CheckCircle, Phone,
  Mail, Clock, DollarSign, ChevronRight, Heart, Share2, Check,
  Building2, Award, Target, Plus, Edit3, Trash2, Send, Eye, FileSignature,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import CompanyPoliciesView from './CompanyPoliciesView';

const API = '/api';

const s = {
  page: { maxWidth: 1000, margin: '0 auto' },
  cover: {
    height: 280, borderRadius: 'var(--radius-lg)',
    background: 'linear-gradient(135deg, #1E3A5F, var(--primary), #7C3AED)',
    position: 'relative', marginBottom: 64,
  },
  infoRow: {
    display: 'flex', alignItems: 'flex-end', gap: 24, padding: '0 32px',
    marginTop: -56, position: 'relative', zIndex: 1,
  },
  infoText: { flex: 1 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
  name: { fontSize: 24, fontWeight: 700 },
  title: { fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 },
  metaRow: { display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 },
  meta: { fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 },
  btns: { display: 'flex', gap: 12, marginLeft: 'auto', alignItems: 'flex-end', paddingBottom: 4 },
  statsRow: {
    display: 'flex', gap: 32, padding: '20px 32px', borderBottom: '1px solid var(--border)', marginBottom: 24,
  },
  stat: { textAlign: 'center' },
  statVal: { fontSize: 20, fontWeight: 700 },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  desc: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 },
  oppCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 12,
  },
  oppInfo: { flex: 1 },
  oppName: { fontWeight: 600, fontSize: 15, marginBottom: 4 },
  oppMeta: { fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' },
  reviewCard: {
    padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 12,
  },
  stars: { display: 'flex', gap: 2, color: '#F59E0B', marginBottom: 8 },
  contactCard: {
    display: 'flex', alignItems: 'center', gap: 16, padding: 16,
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 12,
  },
  statCard: {
    padding: '20px', flex: 1, minWidth: 200, textAlign: 'center',
  },
  skeleton: {
    borderRadius: 'var(--radius-md)', background: 'linear-gradient(90deg, var(--border) 25%, var(--surface) 50%, var(--border) 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
  },
  textarea: {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', backgroundColor: 'var(--background)',
    color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical',
    minHeight: 100, fontFamily: 'inherit', boxSizing: 'border-box',
  },
};

function SkeletonLine({ width = '100%', height = 14, mb = 8 }) {
  return <div style={{ ...s.skeleton, width, height, marginBottom: mb }} />;
}

function SkeletonBlock({ height = 80, mb = 12 }) {
  return <div style={{ ...s.skeleton, height, marginBottom: mb }} />;
}

function SkeletonLoader() {
  return (
    <div style={s.page}>
      <div style={{ ...s.skeleton, height: 280, borderRadius: 'var(--radius-lg)', marginBottom: 64 }} />
      <div style={{ display: 'flex', gap: 24, padding: '0 32px', marginTop: -56, alignItems: 'flex-end' }}>
        <div style={{ ...s.skeleton, width: 64, height: 64, borderRadius: '50%', border: '4px solid var(--surface)' }} />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="220px" height={24} mb={4} />
          <SkeletonLine width="160px" height={14} mb={4} />
          <SkeletonLine width="180px" height={13} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 32, padding: '20px 32px', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <SkeletonLine width="50px" height={20} mb={4} />
            <SkeletonLine width="60px" height={13} />
          </div>
        ))}
      </div>
      <Card padding="28px">
        <SkeletonBlock height={200} />
      </Card>
    </div>
  );
}

function formatCount(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

function formatDate(year) {
  if (!year) return '';
  return String(year);
}

function formatCurrency(val) {
  if (!val && val !== 0) return '';
  const n = Number(val);
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export default function CompanyProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [followStatus, setFollowStatus] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageSending, setMessageSending] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewContent, setNewReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [opportunities, setOpportunities] = useState([]);
  const [opportunityModal, setOpportunityModal] = useState(null);
  const [oppForm, setOppForm] = useState({ title: '', description: '', industry: '', investmentMin: '', investmentMax: '', franchiseFee: '', royaltyFee: '', roiPercentage: '', breakEvenMonths: '', location: '', city: '', country: '', state: '', areaRequired: '', requirements: '', support: '', training: '', businessType: '' });
  const [oppSubmitting, setOppSubmitting] = useState(false);
  const [oppStatusTab, setOppStatusTab] = useState('active');

  const fetchOpportunities = useCallback(async (companyId) => {
    if (!companyId) return;
    try {
      const res = await fetch(`${API}/listings/company/${companyId}`, { credentials: 'include' });
      if (res.ok) {
        const d = await res.json();
        setOpportunities(d.listings || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (company?.id) fetchOpportunities(company.id);
  }, [company?.id, fetchOpportunities]);

  const openCreateOpp = () => {
    setOppForm({ title: '', description: '', industry: company?.industry || '', investmentMin: '', investmentMax: '', franchiseFee: '', royaltyFee: '', roiPercentage: '', breakEvenMonths: '', location: '', city: '', country: '', state: '', areaRequired: '', requirements: '', support: '', training: '', businessType: '' });
    setOpportunityModal('create');
  };

  const openEditOpp = (opp) => {
    setOppForm({
      title: opp.title || '',
      description: opp.description || '',
      industry: opp.industry || '',
      investmentMin: opp.investmentMin?.toString() || '',
      investmentMax: opp.investmentMax?.toString() || '',
      franchiseFee: opp.franchiseFee?.toString() || '',
      royaltyFee: opp.royaltyFee || '',
      roiPercentage: opp.roiPercentage?.toString() || '',
      breakEvenMonths: opp.breakEvenMonths?.toString() || '',
      location: opp.location || '',
      city: opp.city || '',
      country: opp.country || '',
      state: opp.state || '',
      areaRequired: opp.areaRequired || '',
      requirements: opp.requirements || '',
      support: opp.support || '',
      training: opp.training || '',
      businessType: opp.businessType || '',
    });
    setOpportunityModal('edit-' + opp.id);
  };

  const handleOppFormChange = (key, value) => {
    setOppForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveOpp = async () => {
    if (!oppForm.title.trim() || !oppForm.industry.trim()) {
      addToast('Title and industry are required', 'error');
      return;
    }
    setOppSubmitting(true);
    try {
      const isEdit = opportunityModal && opportunityModal !== 'create';
      const url = isEdit
        ? `${API}/listings/${opportunityModal.replace('edit-', '')}`
        : `${API}/listings`;
      const method = isEdit ? 'PUT' : 'POST';

      const body = {
        companyId: company.id,
        title: oppForm.title.trim(),
        slug: isEdit ? undefined : oppForm.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: oppForm.description.trim() || undefined,
        industry: oppForm.industry.trim(),
        businessType: oppForm.businessType.trim() || undefined,
        investmentMin: oppForm.investmentMin ? parseFloat(oppForm.investmentMin) : undefined,
        investmentMax: oppForm.investmentMax ? parseFloat(oppForm.investmentMax) : undefined,
        franchiseFee: oppForm.franchiseFee ? parseFloat(oppForm.franchiseFee) : undefined,
        royaltyFee: oppForm.royaltyFee || undefined,
        roiPercentage: oppForm.roiPercentage ? parseFloat(oppForm.roiPercentage) : undefined,
        breakEvenMonths: oppForm.breakEvenMonths ? parseInt(oppForm.breakEvenMonths) : undefined,
        location: oppForm.location || undefined,
        city: oppForm.city || undefined,
        country: oppForm.country || undefined,
        state: oppForm.state || undefined,
        areaRequired: oppForm.areaRequired || undefined,
        requirements: oppForm.requirements || undefined,
        support: oppForm.support || undefined,
        training: oppForm.training || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        addToast(`Opportunity ${isEdit ? 'updated' : 'created'}!`, 'success');
        setOpportunityModal(null);
        fetchOpportunities(company.id);
        fetchCompany();
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to save', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    } finally {
      setOppSubmitting(false);
    }
  };

  const handlePublishOpp = async (id) => {
    try {
      const res = await fetch(`${API}/listings/${id}/publish`, { method: 'PUT', credentials: 'include' });
      if (res.ok) { addToast('Opportunity published!', 'success'); fetchOpportunities(company.id); }
      else { const err = await res.json(); addToast(err.error || 'Failed', 'error'); }
    } catch { addToast('Network error', 'error'); }
  };

  const handleUnpublishOpp = async (id) => {
    try {
      const res = await fetch(`${API}/listings/${id}/unpublish`, { method: 'PUT', credentials: 'include' });
      if (res.ok) { addToast('Opportunity unpublished', 'success'); fetchOpportunities(company.id); }
      else { const err = await res.json(); addToast(err.error || 'Failed', 'error'); }
    } catch { addToast('Network error', 'error'); }
  };

  const handleCloseOpp = async (id) => {
    try {
      const res = await fetch(`${API}/listings/${id}/close`, { method: 'PUT', credentials: 'include' });
      if (res.ok) { addToast('Opportunity closed', 'success'); fetchOpportunities(company.id); }
      else { const err = await res.json(); addToast(err.error || 'Failed', 'error'); }
    } catch { addToast('Network error', 'error'); }
  };

  const handleDeleteOpp = async (id) => {
    if (!confirm('Delete this opportunity?')) return;
    try {
      const res = await fetch(`${API}/listings/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { addToast('Opportunity deleted', 'success'); fetchOpportunities(company.id); fetchCompany(); }
      else { const err = await res.json(); addToast(err.error || 'Failed', 'error'); }
    } catch { addToast('Network error', 'error'); }
  };

  const fetchCompany = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/companies/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load company profile');
      const data = await res.json();
      setCompany(data);
      if (data.isFollowing !== undefined) {
        setFollowStatus({ following: data.isFollowing, followerCount: data._count?.followers ?? data.followerCount ?? 0 });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchFollowStatus = useCallback(async () => {
    if (!company?.id) return;
    try {
      const res = await fetch(`${API}/follow/company/${company.id}/status`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFollowStatus((prev) => ({ ...prev, following: data.following }));
      }
    } catch {
      // silently fail
    }
  }, [company?.id]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const fetchReviews = useCallback(async (p = 1) => {
    if (!company?.id) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`${API}/public/reviews?companyId=${company.id}&page=${p}&limit=5`, { credentials: 'include' });
      if (res.ok) {
        const d = await res.json();
        setReviews(d.reviews || []);
        setReviewsTotal(d.total || 0);
        setReviewsPage(d.page || 1);
      }
    } catch {} finally {
      setReviewsLoading(false);
    }
  }, [company?.id]);

  useEffect(() => {
    if (company?.id) fetchReviews();
  }, [company?.id, fetchReviews]);

  useEffect(() => {
    if (company?.id && currentUser) {
      fetchFollowStatus();
    }
  }, [company?.id, currentUser, fetchFollowStatus]);

  const handleFollowToggle = useCallback(async () => {
    if (!company?.id || followLoading) return;
    setFollowLoading(true);
    const wasFollowing = followStatus?.following;
    setFollowStatus((prev) => ({
      ...prev,
      following: !prev?.following,
      followerCount: (prev?.followerCount || 0) + (wasFollowing ? -1 : 1),
    }));
    try {
      const res = await fetch(`${API}/follow/company/${company.id}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setFollowStatus((prev) => ({ ...prev, following: data.following }));
        addToast(data.following ? 'You are now following this company' : 'Unfollowed successfully', 'success');
      } else {
        setFollowStatus((prev) => ({
          ...prev,
          following: wasFollowing,
          followerCount: (prev?.followerCount || 0) + (wasFollowing ? 1 : -1),
        }));
        addToast('Failed to update follow status', 'error');
      }
    } catch {
      setFollowStatus((prev) => ({
        ...prev,
        following: wasFollowing,
        followerCount: (prev?.followerCount || 0) + (wasFollowing ? 1 : -1),
      }));
      addToast('Failed to update follow status', 'error');
    } finally {
      setFollowLoading(false);
    }
  }, [company?.id, followStatus, followLoading, addToast]);

  const handleSendMessage = useCallback(async () => {
    if (!messageContent.trim() || !company?.ownerId) return;
    setMessageSending(true);
    try {
      const res = await fetch(`${API}/messages/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipientId: company.ownerId, content: messageContent }),
      });
      if (res.ok) {
        addToast('Message request sent!', 'success');
        setMessageModalOpen(false);
        setMessageContent('');
      } else {
        addToast('Failed to send message request', 'error');
      }
    } catch {
      addToast('Failed to send message request', 'error');
    } finally {
      setMessageSending(false);
    }
  }, [messageContent, company?.ownerId, addToast]);

  const handleSubmitReview = useCallback(async () => {
    if (!newReviewContent.trim() || reviewSubmitting) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API}/companies/${company.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating: newRating, title: newReviewTitle.trim(), content: newReviewContent.trim() }),
      });
      if (res.ok) {
        const review = await res.json();
        setReviews(prev => [review, ...prev]);
        setReviewsTotal(prev => prev + 1);
        setReviewFormOpen(false);
        setNewRating(5);
        setNewReviewTitle('');
        setNewReviewContent('');
        addToast('Review submitted!', 'success');
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to submit review', 'error');
      }
    } catch {
      addToast('Failed to submit review', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  }, [newRating, newReviewTitle, newReviewContent, company?.id, reviewSubmitting, addToast]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/company/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      addToast('Company URL copied to clipboard!', 'success');
    }).catch(() => {
      addToast('Failed to copy URL', 'error');
    });
  }, [id, addToast]);

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div style={{ ...s.page, textAlign: 'center', padding: 80 }}>
        <p style={{ color: 'var(--danger)', fontSize: 16 }}>{error}</p>
        <Button variant="outline" size="sm" onClick={fetchCompany} style={{ marginTop: 16 }}>Retry</Button>
      </div>
    );
  }

  if (!company) return null;

  const c = company;
  const followerCount = followStatus?.followerCount ?? c._count?.followers ?? c.followerCount ?? 0;
  const listingCount = c._count?.listings ?? c.listingCount ?? 0;
  const isOwnCompany = currentUser && (c.ownerId === currentUser.id);

  const oppStatuses = ['draft', 'active', 'closed'];
  const oppLabels = { draft: 'Draft', active: 'Open', closed: 'Closed' };
  const oppColors = { draft: '#6B7280', active: '#10B981', closed: '#DC2626' };
  const filteredOpps = opportunities.filter((o) => oppStatusTab === 'all' || o.status === oppStatusTab);
  const oppCounts = { draft: 0, active: 0, closed: 0, all: opportunities.length };
  opportunities.forEach((o) => { if (oppCounts[o.status] !== undefined) oppCounts[o.status]++; });

  const aboutContent = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h3 style={s.sectionTitle}>About</h3>
      <p style={s.desc}>{c.description || 'No description provided.'}</p>

      {c.industry && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <Card padding="20px" style={s.statCard}>
            <Building2 size={24} color="var(--primary)" />
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>{c.industry}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Industry</div>
          </Card>
          {c.foundedYear && (
            <Card padding="20px" style={s.statCard}>
              <Calendar size={24} color="var(--accent)" />
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>{formatDate(c.foundedYear)}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Founded</div>
            </Card>
          )}
          {c.employeeCount && (
            <Card padding="20px" style={s.statCard}>
              <Users size={24} color="#F59E0B" />
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>{formatCount(c.employeeCount)}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Employees</div>
            </Card>
          )}
          <Card padding="20px" style={s.statCard}>
            <Target size={24} color="#10B981" />
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>{formatCount(c._count?.listings ?? 0)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Opportunities</div>
          </Card>
        </div>
      )}
    </motion.div>
  );

  const opportunitiesContent = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={s.sectionTitle}>Opportunities</h3>
        {isOwnCompany && (
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={openCreateOpp}>
            Create Opportunity
          </Button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', ...oppStatuses].map((st) => (
          <button
            key={st}
            onClick={() => setOppStatusTab(st)}
            style={{
              padding: '5px 14px', fontSize: 13, fontWeight: 500, borderRadius: 100,
              border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
              borderColor: oppStatusTab === st ? 'var(--primary)' : 'var(--border)',
              backgroundColor: oppStatusTab === st ? 'var(--primary-light)' : 'transparent',
              color: oppStatusTab === st ? 'var(--primary)' : 'var(--text-secondary)',
            }}
          >
            {st === 'all' ? 'All' : oppLabels[st] || st} ({oppCounts[st] || 0})
          </button>
        ))}
      </div>

      {filteredOpps.length > 0 ? filteredOpps.map((opp) => (
        <div key={opp.id} style={s.oppCard}>
          <div style={s.oppInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={s.oppName}>{opp.title}</div>
              <Badge variant={opp.status === 'active' ? 'success' : opp.status === 'draft' ? 'default' : 'secondary'}
                style={{ fontSize: 10, padding: '1px 8px' }}>
                {oppLabels[opp.status] || opp.status}
              </Badge>
            </div>
            <div style={s.oppMeta}>
              {(opp.investmentMin || opp.investmentMax) && (
                <span><DollarSign size={14} style={{ verticalAlign: 'middle' }} /> {formatCurrency(opp.investmentMin)}-{formatCurrency(opp.investmentMax)}</span>
              )}
              {(opp.location || opp.city) && (
                <span><MapPin size={14} style={{ verticalAlign: 'middle' }} /> {opp.location || opp.city}</span>
              )}
              {opp.roiPercentage && <span><TrendingUp size={14} style={{ verticalAlign: 'middle' }} /> {opp.roiPercentage}% ROI</span>}
              {opp.franchiseFee && <span>Fee: ${Number(opp.franchiseFee).toLocaleString()}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {isOwnCompany ? (
              <>
                {opp.status === 'draft' && (
                  <Button size="sm" variant="primary" onClick={() => handlePublishOpp(opp.id)} style={{ padding: '2px 8px', fontSize: 11 }}>
                    <Send size={12} /> Publish
                  </Button>
                )}
                {opp.status === 'active' && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => handleUnpublishOpp(opp.id)} style={{ padding: '2px 8px', fontSize: 11 }}>
                      Unpublish
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleCloseOpp(opp.id)} style={{ padding: '2px 8px', fontSize: 11, color: '#DC2626' }}>
                      Close
                    </Button>
                  </>
                )}
                {opp.status === 'closed' && (
                  <Button size="sm" variant="ghost" onClick={() => handlePublishOpp(opp.id)} style={{ padding: '2px 8px', fontSize: 11 }}>
                    Reopen
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => openEditOpp(opp)} style={{ padding: '2px 8px', fontSize: 11 }}>
                  <Edit3 size={12} /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteOpp(opp.id)} style={{ padding: '2px 8px', fontSize: 11, color: 'var(--danger)' }}>
                  <Trash2 size={12} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/listing/${opp.slug || opp.id}`)} style={{ padding: '2px 8px', fontSize: 11 }}>
                  <Eye size={12} />
                </Button>
              </>
            ) : opp.status === 'active' ? (
              <>
                <Button size="sm" variant="primary" onClick={() => navigate(`/listing/${opp.slug || opp.id}`)} style={{ padding: '2px 8px', fontSize: 11 }}>
                  Apply
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
                  fetch(`${API}/bookmarks`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: opp.id }) })
                    .then((r) => r.ok ? addToast('Saved!', 'success') : null);
                }} style={{ padding: '2px 8px', fontSize: 11 }}>
                  <Heart size={12} /> Save
                </Button>
              </>
            ) : null}
          </div>
        </div>
      )) : (
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No opportunities {oppStatusTab !== 'all' ? oppLabels[oppStatusTab]?.toLowerCase() : ''}.</p>
      )}

      <Modal isOpen={!!opportunityModal} onClose={() => setOpportunityModal(null)}
        title={opportunityModal === 'create' ? 'Create Opportunity' : 'Edit Opportunity'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 500, overflowY: 'auto' }}>
          {['title', 'description', 'industry', 'businessType'].map((f) => (
            <div key={f}>
              <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
              {f === 'description' ? (
                <textarea value={oppForm[f]} onChange={(e) => handleOppFormChange(f, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 60, boxSizing: 'border-box' }} />
              ) : (
                <input value={oppForm[f]} onChange={(e) => handleOppFormChange(f, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              )}
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['investmentMin', 'Min Investment ($)'], ['investmentMax', 'Max Investment ($)'], ['franchiseFee', 'Franchise Fee ($)'], ['royaltyFee', 'Royalty Fee (%)'], ['roiPercentage', 'ROI (%)'], ['breakEvenMonths', 'Break-Even (months)']].map(([key, label]) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
                <input type="number" value={oppForm[key]} onChange={(e) => handleOppFormChange(key, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[['location', 'Location'], ['city', 'City'], ['country', 'Country'], ['state', 'State'], ['areaRequired', 'Area Required']].map(([key, label]) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
                <input value={oppForm[key]} onChange={(e) => handleOppFormChange(key, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          {['requirements', 'support', 'training'].map((f) => (
            <div key={f}>
              <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
              <textarea value={oppForm[f]} onChange={(e) => handleOppFormChange(f, e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 50, boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => setOpportunityModal(null)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveOpp} disabled={oppSubmitting}>
              {oppSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );

  const reviewsContent = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Reviews</h3>
          {c.reviewCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', gap: 2, color: '#F59E0B' }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= Math.round(c.averageRating || 0) ? '#F59E0B' : 'none'} />)}
              </span>
              <span>{Number(c.averageRating || 0).toFixed(1)}</span>
              <span>({c.reviewCount} review{c.reviewCount !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>
        {currentUser && !isOwnCompany && (
          <Button variant="primary" size="sm" icon={<Star size={14} />}
            onClick={() => setReviewFormOpen(true)}>
            Write Review
          </Button>
        )}
      </div>

      {reviewsLoading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading reviews...</div>
      ) : reviews.length > 0 ? (
        <>
          {reviews.map((r) => (
            <div key={r.id} style={s.reviewCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <Avatar name={r.reviewer?.name} src={r.reviewer?.image} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.reviewer?.name || 'Anonymous'}</div>
                  <div style={{ display: 'flex', gap: 2, color: '#F59E0B' }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= r.rating ? '#F59E0B' : 'none'} />)}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              {r.title && <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{r.title}</div>}
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{r.content}</p>
            </div>
          ))}
          {reviewsTotal > 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <Pagination current={reviewsPage} total={Math.ceil(reviewsTotal / 5)} onChange={(p) => fetchReviews(p)} />
            </div>
          )}
        </>
      ) : (
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</p>
      )}

      <Modal isOpen={reviewFormOpen} onClose={() => setReviewFormOpen(false)} title="Write a Review">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Rating</label>
            <div style={{ display: 'flex', gap: 4, color: '#F59E0B' }}>
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={24} fill={s <= newRating ? '#F59E0B' : 'none'}
                  style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                  onClick={() => setNewRating(s)}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }} />
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Title (optional)</label>
            <input value={newReviewTitle} onChange={e => setNewReviewTitle(e.target.value)}
              placeholder="Summarize your experience"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Review</label>
            <textarea value={newReviewContent} onChange={e => setNewReviewContent(e.target.value)}
              placeholder="Share your experience working with this company..."
              style={s.textarea} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="sm" onClick={() => setReviewFormOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSubmitReview}
              disabled={!newReviewContent.trim() || reviewSubmitting}>
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );

  const contactContent = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h3 style={s.sectionTitle}>Contact Information</h3>
      {[
        { icon: <Phone size={20} />, label: 'Phone', value: c.phone },
        { icon: <Mail size={20} />, label: 'Email', value: c.email },
        { icon: <Globe size={20} />, label: 'Website', value: c.website },
        { icon: <MapPin size={20} />, label: 'Address', value: [c.address, c.city, c.country].filter(Boolean).join(', ') },
      ].filter((item) => item.value).map((item, i) => (
        <div key={i} style={s.contactCard}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {item.icon}
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 1 }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div>
          </div>
        </div>
      ))}
      {!c.phone && !c.email && !c.website && !c.address && !c.city && !c.country && (
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No contact information available.</p>
      )}
    </motion.div>
  );

  const policiesContent = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <CompanyPoliciesView companyId={c.id} />
    </motion.div>
  );

  const tabs = [
    { id: 'about', label: 'About', content: aboutContent },
    { id: 'opportunities', label: 'Opportunities', content: opportunitiesContent },
    { id: 'reviews', label: 'Reviews', content: reviewsContent },
    { id: 'contact', label: 'Contact', content: contactContent },
    { id: 'policies', label: 'Policies & Terms', content: policiesContent },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={s.page}
    >
      <div style={{
        ...s.cover,
        ...(c.bannerUrl ? {
          background: `url(${c.bannerUrl}) center/cover no-repeat`,
        } : {}),
      }} />

      <div style={s.infoRow}>
        <Avatar src={c.logoUrl} name={c.name || 'Company'} size={64} style={{ border: '4px solid var(--surface)' }} />
        <div style={s.infoText}>
          <div style={s.nameRow}>
            <h1 style={s.name}>{c.name}</h1>
            {c.isVerified && <VerifiedBadge size={20} />}
          </div>
          {c.industry && (
            <div style={s.title}><Briefcase size={14} />{c.industry}{c.status ? ` • ${c.status}` : ''}</div>
          )}
          <div style={s.metaRow}>
            {(c.city || c.country) && (
              <div style={s.meta}><MapPin size={14} />{[c.city, c.country].filter(Boolean).join(', ')}</div>
            )}
            <div style={s.meta}><Users size={14} /> {formatCount(followerCount)} Followers</div>
            {c.foundedYear && <div style={s.meta}><Calendar size={14} /> Founded {formatDate(c.foundedYear)}</div>}
          </div>
        </div>
        <div style={s.btns}>
          {!isOwnCompany && currentUser && (
            <>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant={followStatus?.following ? 'secondary' : 'primary'}
                  size="sm"
                  icon={followStatus?.following ? <Check size={16} /> : <UserPlus size={16} />}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  onMouseEnter={(e) => {
                    if (followStatus?.following) {
                      e.currentTarget.textContent = 'Unfollow';
                      e.currentTarget.style.borderColor = 'var(--danger)';
                      e.currentTarget.style.color = 'var(--danger)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (followStatus?.following) {
                      e.currentTarget.textContent = 'Following';
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.color = '';
                    }
                  }}
                >
                  {followStatus?.following ? 'Following' : 'Follow'}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<MessageSquare size={16} />}
                  onClick={() => setMessageModalOpen(true)}
                >
                  Message
                </Button>
              </motion.div>
            </>
          )}
          {!isOwnCompany && opportunities.filter((o) => o.status === 'active').length > 0 && (
            <Link to="/discover">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="accent" size="sm" icon={<ExternalLink size={16} />}>Apply</Button>
              </motion.div>
            </Link>
          )}
          {c.website && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm" icon={<Globe size={16} />}>Website</Button>
              </a>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="ghost"
              size="sm"
              icon={<Share2 size={16} />}
              onClick={handleShare}
            >
              Share
            </Button>
          </motion.div>
        </div>
      </div>

      <div style={s.statsRow}>
        <div style={s.stat}>
          <div style={s.statVal}>{formatCount(followerCount)}</div>
          <div style={s.statLabel}>Followers</div>
        </div>
        <div style={s.stat}>
          <div style={s.statVal}>{formatCount(listingCount)}</div>
          <div style={s.statLabel}>Open Positions</div>
        </div>
        {c.foundedYear && (
          <div style={s.stat}>
            <div style={s.statVal}>{formatDate(c.foundedYear)}</div>
            <div style={s.statLabel}>Founded</div>
          </div>
        )}
        {c.employeeCount && (
          <div style={s.stat}>
            <div style={s.statVal}>{formatCount(c.employeeCount)}</div>
            <div style={s.statLabel}>Employees</div>
          </div>
        )}
      </div>

      <Card padding="28px">
        <Tabs tabs={tabs} />
      </Card>

      <Modal isOpen={messageModalOpen} onClose={() => setMessageModalOpen(false)} title="Send Message Request">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Send a message to {c.owner?.name || 'the company owner'}. They will be notified and can choose to accept.
          </p>
          <textarea
            style={s.textarea}
            placeholder="Write your message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="sm" onClick={() => setMessageModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              icon={<MessageSquare size={16} />}
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || messageSending}
            >
              {messageSending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

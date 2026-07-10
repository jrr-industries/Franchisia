import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Globe, MessageSquare, UserPlus, ExternalLink, Star,
  Briefcase, Users, TrendingUp, Calendar, CheckCircle, Phone,
  Mail, Clock, DollarSign, ChevronRight, Heart, Share2, Check,
  Building2, Award, Target
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import Pagination from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

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

export default function CompanyProfile() {
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
  const listingCount = c._count?.listings ?? c.listings?.length ?? c.listingCount ?? 0;
  const listings = c.listings || [];
  const isOwnCompany = currentUser && (c.ownerId === currentUser.id);

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
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>{formatCount(c._count?.listings ?? c.listings?.length ?? 0)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Opportunities</div>
          </Card>
        </div>
      )}
    </motion.div>
  );

  const opportunitiesContent = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h3 style={s.sectionTitle}>Available Opportunities</h3>
      {listings.length > 0 ? (
        listings.map((opp, i) => (
          <div key={opp.id || i} style={s.oppCard}>
            <div style={s.oppInfo}>
              <div style={s.oppName}>{opp.name || opp.title}</div>
              <div style={s.oppMeta}>
                {opp.investmentRange && (
                  <span><DollarSign size={14} style={{ verticalAlign: 'middle' }} /> {opp.investmentRange}</span>
                )}
                {(opp.location || opp.city) && (
                  <span><MapPin size={14} style={{ verticalAlign: 'middle' }} /> {opp.location || opp.city}</span>
                )}
                {opp.type && <Badge variant="info">{opp.type}</Badge>}
                {opp.industry && <Badge variant="info">{opp.industry}</Badge>}
              </div>
            </div>
            <Link to="/discover">
              <Button variant="primary" size="sm">Apply</Button>
            </Link>
          </div>
        ))
      ) : (
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No opportunities available at this time.</p>
      )}
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

  const tabs = [
    { id: 'about', label: 'About', content: aboutContent },
    { id: 'opportunities', label: 'Opportunities', content: opportunitiesContent },
    { id: 'reviews', label: 'Reviews', content: reviewsContent },
    { id: 'contact', label: 'Contact', content: contactContent },
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
          {!isOwnCompany && listings.length > 0 && (
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

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, DollarSign, TrendingUp, Briefcase, Calendar, Heart,
  MessageSquare, Share2, CheckCircle, Clock, Building2, Eye,
  ChevronLeft, ChevronRight, BadgeCheck, FileSignature,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import CompanyPoliciesView from '../dashboard/CompanyPoliciesView';

const API = '/api';

export default function ListingDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [coverMessage, setCoverMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(null);
  const [showPolicies, setShowPolicies] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API}/listings/${slug}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setListing(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!listing?.id || !user) return;
    fetch(`${API}/bookmarks/check/${listing.id}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setBookmarked(d.bookmarked); })
      .catch(() => {});
  }, [listing?.id, user]);

  const handleToggleBookmark = async () => {
    if (!listing?.id || bookmarking) return;
    setBookmarking(true);
    const was = bookmarked;
    setBookmarked(!was);
    try {
      if (was) {
        const listRes = await fetch(`${API}/bookmarks`, { credentials: 'include' });
        const listData = await listRes.json();
        const bm = listData.bookmarks?.find(b => b.listingId === listing.id);
        if (bm) await fetch(`${API}/bookmarks/${bm.id}`, { method: 'DELETE', credentials: 'include' });
      } else {
        await fetch(`${API}/bookmarks`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'include', body: JSON.stringify({ listingId: listing.id }),
        });
      }
      addToast(was ? 'Removed' : 'Saved!', 'success');
    } catch {
      setBookmarked(was);
      addToast('Failed', 'error');
    } finally {
      setBookmarking(false);
    }
  };

  const handleApply = async () => {
    if (!listing?.id || applying) return;
    setApplying(true);
    try {
      const res = await fetch(`${API}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          listingId: listing.id,
          coverMessage: coverMessage.trim() || undefined,
          acceptedPolicyVersion: policyAccepted?.policyVersion || null,
          acceptedPolicyTerms: 'I have read and agree to the company\'s Franchise Terms & Conditions.',
          acceptedAt: policyAccepted?.acceptedAt || null,
        }),
      });
      if (res.ok) {
        addToast('Application submitted!', 'success');
        setApplyModal(false);
        setCoverMessage('');
        setShowPolicies(true);
        setPolicyAccepted(null);
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to apply', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handlePolicyAccept = (acceptance) => {
    setPolicyAccepted(acceptance);
    setShowPolicies(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => addToast('Link copied!', 'success'))
      .catch(() => addToast('Failed to copy', 'error'));
  };

  const resetApplyModal = () => {
    setApplyModal(false);
    setShowPolicies(true);
    setPolicyAccepted(null);
    setCoverMessage('');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 0' }}>
        <div style={{ height: 24, width: '60%', background: 'var(--border)', borderRadius: 8, marginBottom: 16 }} />
        <div style={{ height: 16, width: '40%', background: 'var(--border)', borderRadius: 8, marginBottom: 32 }} />
        <div style={{ height: 200, background: 'var(--border)', borderRadius: 12 }} />
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: 80 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Opportunity Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>This listing may have been removed or the link is invalid.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/discover')} style={{ marginTop: 16 }}>Browse Opportunities</Button>
      </div>
    );
  }

  const l = listing;
  const c = l.company || {};

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card hover={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Avatar src={c.logoUrl} name={c.name} size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>{l.title}</h1>
              {c.isVerified && <VerifiedBadge size={18} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
              <Building2 size={14} />
              <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate(`/company/${c.slug || c.id}`)}>{c.name}</span>
              {l.industry && <><span>|</span><span>{l.industry}</span></>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {l.investmentMin && (
            <div style={{ padding: '10px 16px', borderRadius: 8, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
              <DollarSign size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600 }}>${Number(l.investmentMin).toLocaleString()}{l.investmentMax ? ` - $${Number(l.investmentMax).toLocaleString()}` : '+'}</span>
            </div>
          )}
          {l.roiPercentage && (
            <div style={{ padding: '10px 16px', borderRadius: 8, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
              <TrendingUp size={16} color="#D97706" />
              <span style={{ fontWeight: 600 }}>{l.roiPercentage}% ROI</span>
            </div>
          )}
          {l.franchiseFee && (
            <div style={{ padding: '10px 16px', borderRadius: 8, backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
              <Briefcase size={16} color="#8B5CF6" />
              <span style={{ fontWeight: 600 }}>Fee: ${Number(l.franchiseFee).toLocaleString()}</span>
            </div>
          )}
          {(l.location || l.city) && (
            <div style={{ padding: '10px 16px', borderRadius: 8, backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
              <MapPin size={16} color="#0284C7" />
              <span>{l.location || l.city}{l.country ? `, ${l.country}` : ''}</span>
            </div>
          )}
        </div>

        {l.images && l.images.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Gallery</h3>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {l.images.map((img, i) => (
                <img key={i} src={img} alt={`Listing image ${i + 1}`}
                  style={{ width: 240, height: 180, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
                  onClick={() => window.open(img, '_blank')} />
              ))}
            </div>
          </div>
        )}

        {l.description && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Description</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{l.description}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {l.areaRequired && (
            <div><span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>Area Required</span><span style={{ fontSize: 14, fontWeight: 500 }}>{l.areaRequired}</span></div>
          )}
          {l.breakEvenMonths && (
            <div><span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>Break-Even Period</span><span style={{ fontSize: 14, fontWeight: 500 }}>{l.breakEvenMonths} months</span></div>
          )}
          {l.royaltyFee && (
            <div><span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>Royalty Fee</span><span style={{ fontSize: 14, fontWeight: 500 }}>{l.royaltyFee}</span></div>
          )}
          {l.businessType && (
            <div><span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>Business Type</span><span style={{ fontSize: 14, fontWeight: 500 }}>{l.businessType}</span></div>
          )}
        </div>

        {l.requirements && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Requirements</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{l.requirements}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, marginBottom: l.support || l.training ? 16 : 0 }}>
          {l.support && (
            <Card padding="16px" style={{ flex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Support</h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{l.support}</p>
            </Card>
          )}
          {l.training && (
            <Card padding="16px" style={{ flex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Training</h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{l.training}</p>
            </Card>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
          <Calendar size={14} />
          <span>Published {l.publishedAt ? new Date(l.publishedAt).toLocaleDateString() : 'N/A'}</span>
          <span>|</span>
          <Eye size={14} />
          <span>{l.viewCount || 0} views</span>
          <span>|</span>
          <Briefcase size={14} />
          <span>{l.applicationCount || 0} applications</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          {user && (
            <Button variant="primary" icon={<Briefcase size={16} />} onClick={() => setApplyModal(true)}>
              Apply Now
            </Button>
          )}
          <Button variant={bookmarked ? 'secondary' : 'outline'} icon={<Heart size={16} />}
            onClick={handleToggleBookmark} disabled={bookmarking}>
            {bookmarked ? 'Saved' : 'Save'}
          </Button>
          <Button variant="outline" icon={<MessageSquare size={16} />}
            onClick={() => {
              if (c.ownerId) {
                fetch(`${API}/messages/request`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                  body: JSON.stringify({ recipientId: c.ownerId, content: `Hi, I'm interested in ${l.title}` }),
                }).then(r => r.ok ? addToast('Message sent!', 'success') : null);
              }
            }}>
            Message Company
          </Button>
          <Button variant="ghost" icon={<Share2 size={16} />} onClick={handleShare}>
            Share
          </Button>
        </div>
      </Card>

      <Modal isOpen={applyModal} onClose={resetApplyModal} title={showPolicies ? "Review Company Policies" : `Apply to ${l.title}`}
        width={showPolicies ? "800px" : undefined}>
        <AnimatePresence mode="wait">
          {showPolicies ? (
            <motion.div key="policies" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '12px 16px', borderRadius: 8, backgroundColor: 'var(--primary-light)' }}>
                <FileSignature size={20} color="var(--primary)" />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>Step 1: Review & Accept Policies</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Please review the company's franchise terms before applying</p>
                </div>
              </div>
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <CompanyPoliciesView
                  companyId={c.id}
                  listingId={l.id}
                  onAccept={handlePolicyAccept}
                  accepted={policyAccepted}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="application" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '12px 16px', borderRadius: 8, backgroundColor: '#daf3e5' }}>
                <BadgeCheck size={20} color="#10633a" />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#10633a' }}>Step 2: Submit Application</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Terms accepted v{policyAccepted?.policyVersion} on {policyAccepted ? new Date(policyAccepted.acceptedAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowPolicies(true)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 12, fontWeight: 500, textDecoration: 'underline' }}
                >
                  Review again
                </button>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Send your application to {c.name}. Include a cover message to help your application stand out.
              </p>
              <textarea
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                placeholder="Tell the franchisor why you're interested..."
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)', color: 'var(--text)', fontSize: 14,
                  outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 100, boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                <Button variant="secondary" size="sm" onClick={resetApplyModal}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleApply} disabled={applying}>
                  {applying ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </motion.div>
  );
}

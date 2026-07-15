import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import {
  MapPin, DollarSign, TrendingUp, Briefcase, Calendar, Heart,
  MessageSquare, Share2, Building2, Eye,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import ApplyWizard from '../../components/ApplyWizard';

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
  const [showWizard, setShowWizard] = useState(false);
  const [myApplication, setMyApplication] = useState(null);

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

  useEffect(() => {
    if (!listing?.id || !user) return;
    fetch(`${API}/applications/my`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : [])
      .then((apps) => {
        const match = (Array.isArray(apps) ? apps : []).find((a) => a.listingId === listing.id);
        if (match) setMyApplication(match);
      })
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => addToast('Link copied!', 'success'))
      .catch(() => addToast('Failed to copy', 'error'));
  };

  const handleApplied = (application) => {
    setMyApplication(application);
    setShowWizard(false);
    addToast('Application submitted successfully!', 'success');
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
          {user && !myApplication && (
            <Button variant="primary" icon={<Briefcase size={16} />} onClick={() => setShowWizard(true)}>
              Apply Now
            </Button>
          )}
          {user && myApplication && myApplication.status !== 'accepted' && (
            <Button variant="secondary" icon={<Briefcase size={16} />} disabled>
              Applied
            </Button>
          )}
          {user && myApplication?.status === 'accepted' && (
            <Button variant="primary" icon={<MessageSquare size={16} />}
              onClick={() => navigate('/messages')}>
              Open Conversation
            </Button>
          )}
          <Button variant={bookmarked ? 'secondary' : 'outline'} icon={<Heart size={16} />}
            onClick={handleToggleBookmark} disabled={bookmarking}>
            {bookmarked ? 'Saved' : 'Save Listing'}
          </Button>
          <Button variant="ghost" icon={<Share2 size={16} />} onClick={handleShare}>
            Share
          </Button>
        </div>
      </Card>

      {showWizard && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)', padding: 20, overflowY: 'auto',
        }} onClick={() => setShowWizard(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 800 }}>
            <ApplyWizard listing={l} onComplete={handleApplied} onClose={() => setShowWizard(false)} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

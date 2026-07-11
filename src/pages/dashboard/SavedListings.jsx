import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, Trash2, DollarSign, MapPin, Building2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';

const API = '/api';

export default function SavedListings() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/bookmarks`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setBookmarks(d.bookmarks || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    try {
      const res = await fetch(`${API}/bookmarks/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
        addToast('Removed from saved', 'success');
      }
    } catch {
      addToast('Failed to remove', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Saved Listings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Opportunities you've bookmarked for later.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading...</div>
      ) : bookmarks.length === 0 ? (
        <Card hover={false} padding="48px" style={{ textAlign: 'center' }}>
          <Heart size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No saved listings yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Save opportunities you're interested in to review them later.</p>
          <Button variant="primary" onClick={() => navigate('/discover')}>Browse Opportunities</Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookmarks.map((b) => {
            const l = b.listing;
            const c = l?.company;
            return (
              <motion.div key={b.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card hover={false} padding="16px">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 10, backgroundColor: '#FCE7F3',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Heart size={20} color="#DB2777" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, cursor: 'pointer' }}
                        onClick={() => navigate(`/listing/${l?.slug || l?.id}`)}>
                        {l?.title || 'Untitled Opportunity'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <Building2 size={12} />
                        <span style={{ cursor: 'pointer', color: 'var(--primary)' }}
                          onClick={() => navigate(`/company/${c?.slug || c?.id}`)}>
                          {c?.name || 'Unknown Company'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        {(l?.investmentMin || l?.investmentMax) && (
                          <span><DollarSign size={12} style={{ verticalAlign: 'middle' }} /> ${Number(l.investmentMin || 0).toLocaleString()}{l.investmentMax ? ` - $${Number(l.investmentMax).toLocaleString()}` : ''}</span>
                        )}
                        {(l?.location || l?.city) && (
                          <span><MapPin size={12} style={{ verticalAlign: 'middle' }} /> {l.location || l.city}</span>
                        )}
                        <span>Saved {new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <Button size="sm" variant="primary" onClick={() => navigate(`/listing/${l?.slug || l?.id}`)}
                        style={{ padding: '4px 10px', fontSize: 12 }}>
                        View
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleRemove(b.id)}
                        style={{ padding: '4px 10px', fontSize: 12, color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

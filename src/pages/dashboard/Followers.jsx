import { useState, useEffect } from 'react';
import { Heart, Loader2, Users, UserPlus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';

const API = '/api';

export default function Followers() {
  const { user } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('followers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) { setLoading(false); return; }
      setLoading(true);
      try {
        const [followersRes, followingRes] = await Promise.all([
          fetch(`${API}/follow/${user.id}/followers`, { credentials: 'include' }),
          fetch(`${API}/follow/${user.id}/following`, { credentials: 'include' }),
        ]);
        if (followersRes.ok) {
          const fData = await followersRes.json();
          setFollowers(fData.followers || []);
        }
        if (followingRes.ok) {
          const fData = await followingRes.json();
          setFollowing(fData.following || []);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

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
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Followers</h1>
        <Card hover={false} padding="48px" style={{ textAlign: 'center' }}>
          <Heart size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Failed to load followers</p>
        </Card>
      </div>
    );
  }

  const items = activeTab === 'followers' ? followers : following;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Network</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setActiveTab('followers')} style={{ padding: '10px 20px', borderRadius: 8, border: activeTab === 'followers' ? '2px solid var(--primary)' : '1px solid var(--border)', backgroundColor: activeTab === 'followers' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'followers' ? 'var(--primary)' : 'var(--text)', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={16} /> Followers ({followers.length})
        </button>
        <button onClick={() => setActiveTab('following')} style={{ padding: '10px 20px', borderRadius: 8, border: activeTab === 'following' ? '2px solid var(--primary)' : '1px solid var(--border)', backgroundColor: activeTab === 'following' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'following' ? 'var(--primary)' : 'var(--text)', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserPlus size={16} /> Following ({following.length})
        </button>
      </div>
      {items.length === 0 ? (
        <Card hover={false} padding="48px" style={{ textAlign: 'center' }}>
          <Heart size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>No {activeTab} yet</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>{activeTab === 'followers' ? 'Connect with others to grow your network.' : 'Follow users to see their activity.'}</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {items.map((person) => (
            <Card key={person.id} hover={false} padding="16px">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={person.name} src={person.image} size={40} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{person.name || 'Unknown'}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{person.role || 'User'}</p>
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

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Briefcase, MessageSquare, UserPlus, Calendar,
  GraduationCap, Star, ExternalLink, Award, ThumbsUp, Globe,
  Share2, Flag, Check, CheckCircle, Link as LinkIcon, X,
  Send, Settings, Edit3
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import { useToast } from '../../components/ui/Toast';

const API = '/api';

const s = {
  page: { maxWidth: 1000, margin: '0 auto' },
  cover: {
    height: 220, borderRadius: 'var(--radius-lg)',
    background: 'linear-gradient(135deg, var(--primary), #7C3AED, var(--accent))',
    position: 'relative', marginBottom: 60,
  },
  infoRow: {
    display: 'flex', alignItems: 'flex-end', gap: 24, padding: '0 32px',
    marginTop: -50, position: 'relative', zIndex: 1,
  },
  infoText: { flex: 1 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 24, fontWeight: 700 },
  title: { fontSize: 15, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 },
  loc: { fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 },
  stats: {
    display: 'flex', gap: 32, padding: '20px 32px', borderBottom: '1px solid var(--border)', marginBottom: 24,
  },
  stat: { textAlign: 'center' },
  statVal: { fontSize: 22, fontWeight: 700 },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 },
  btns: { display: 'flex', gap: 12, marginLeft: 'auto', alignItems: 'flex-end', paddingBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  expCard: {
    padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    marginBottom: 12,
  },
  expHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  expRole: { fontWeight: 600, fontSize: 15 },
  expCompany: { fontSize: 14, color: 'var(--text-secondary)', marginBottom: 2 },
  expDate: { fontSize: 13, color: 'var(--text-muted)' },
  skillChip: {
    display: 'inline-flex', padding: '6px 16px', backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)', borderRadius: 100, fontSize: 13, fontWeight: 500,
  },
  bio: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 },
  link: { fontSize: 13, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' },
  socialRow: { display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 },
  infoItem: { fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 },
  skeleton: {
    borderRadius: 'var(--radius-md)', background: 'linear-gradient(90deg, var(--border) 25%, var(--surface) 50%, var(--border) 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
  },
  edCard: {
    padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    marginBottom: 12,
  },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', backgroundColor: 'var(--background)',
    color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', backgroundColor: 'var(--background)',
    color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical',
    minHeight: 100, fontFamily: 'inherit', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', backgroundColor: 'var(--background)',
    color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
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
      <div style={{ ...s.skeleton, height: 220, borderRadius: 'var(--radius-lg)', marginBottom: 60 }} />
      <div style={{ display: 'flex', gap: 24, padding: '0 32px', marginTop: -50, alignItems: 'flex-end' }}>
        <div style={{ ...s.skeleton, width: 80, height: 80, borderRadius: '50%', border: '4px solid var(--surface)' }} />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="200px" height={24} mb={4} />
          <SkeletonLine width="160px" height={15} mb={6} />
          <SkeletonLine width="120px" height={13} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 32, padding: '20px 32px', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <SkeletonLine width="50px" height={22} mb={4} />
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

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatRole(role) {
  if (!role) return '';
  return role.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Profile() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const profileId = searchParams.get('id');
  const isOwnProfile = !profileId || (currentUser && profileId === currentUser.id);

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [followStatus, setFollowStatus] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);

  const [mutualStatus, setMutualStatus] = useState(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageSending, setMessageSending] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSending, setReportSending] = useState(false);

  const userId = profileId || currentUser?.id;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/users/${userId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setProfileUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchMutualStatus = useCallback(async () => {
    if (!userId || isOwnProfile || !currentUser) return;
    try {
      const res = await fetch(`${API}/follow/user/${userId}/mutual-status`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFollowStatus({ following: data.following, followerCount: data.followerCount, followingCount: data.followingCount });
        setMutualStatus(data);
      }
    } catch {}
  }, [userId, isOwnProfile, currentUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchMutualStatus();
  }, [fetchMutualStatus]);

  const handleFollowToggle = useCallback(async () => {
    if (!userId || followLoading) return;
    setFollowLoading(true);
    const wasFollowing = followStatus?.following;
    setFollowStatus((prev) => ({
      ...prev,
      following: !prev?.following,
      followerCount: (prev?.followerCount || 0) + (wasFollowing ? -1 : 1),
    }));
    try {
      const res = await fetch(`${API}/follow/user/${userId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setFollowStatus((prev) => ({ ...prev, following: data.following }));
        addToast(data.following ? 'You are now following this user' : 'Unfollowed successfully', 'success');
        if (data.conversation) {
          setMutualStatus((prev) => ({ ...prev, mutual: true, conversationId: data.conversation.id }));
        } else {
          fetchMutualStatus();
        }
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
  }, [userId, followStatus, followLoading, addToast, fetchMutualStatus]);

  const handleMessageClick = useCallback(() => {
    if (mutualStatus?.mutual) {
      if (mutualStatus.conversationId) {
        navigate(`/messages?conversation=${mutualStatus.conversationId}`);
      } else {
        navigate('/messages');
      }
    } else {
      setMessageModalOpen(true);
    }
  }, [mutualStatus, navigate]);

  const handleSendMessage = useCallback(async () => {
    if (!messageContent.trim()) return;
    setMessageSending(true);
    try {
      const res = await fetch(`${API}/messages/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipientId: userId, content: messageContent }),
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
  }, [messageContent, userId, addToast]);

  const handleReport = useCallback(async () => {
    setReportSending(true);
    try {
      const res = await fetch(`${API}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetId: userId, targetType: 'user', reason: reportReason, description: reportDescription }),
      });
      if (res.ok) {
        addToast('Report submitted successfully', 'success');
        setReportModalOpen(false);
        setReportReason('spam');
        setReportDescription('');
      } else {
        addToast('Failed to submit report', 'error');
      }
    } catch {
      addToast('Failed to submit report', 'error');
    } finally {
      setReportSending(false);
    }
  }, [userId, reportReason, reportDescription, addToast]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/dashboard/profile?id=${userId}`;
    navigator.clipboard.writeText(url).then(() => {
      addToast('Profile URL copied to clipboard!', 'success');
    }).catch(() => {
      addToast('Failed to copy URL', 'error');
    });
  }, [userId, addToast]);

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div style={{ ...s.page, textAlign: 'center', padding: 80 }}>
        <p style={{ color: 'var(--danger)', fontSize: 16 }}>{error}</p>
        <Button variant="outline" size="sm" onClick={fetchProfile} style={{ marginTop: 16 }}>Retry</Button>
      </div>
    );
  }

  if (!profileUser) return null;

  const u = profileUser;
  const followerCount = followStatus?.followerCount ?? u.followerCount ?? 0;
  const followingCount = followStatus?.followingCount ?? u.followingCount ?? 0;

  const tabs = [
    {
      id: 'about',
      label: 'About',
      content: (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {u.bio && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={s.sectionTitle}>Bio</h3>
              <p style={s.bio}>{u.bio}</p>
            </div>
          )}

          {u.experience && u.experience.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={s.sectionTitle}>Experience</h3>
              {u.experience.map((exp, i) => (
                <div key={i} style={s.expCard}>
                  <div style={s.expHeader}>
                    <div>
                      <div style={s.expRole}>{exp.role}</div>
                      <div style={s.expCompany}>{exp.company}</div>
                    </div>
                    <div style={s.expDate}>
                      {exp.startDate ? formatDate(exp.startDate) : ''} - {exp.isCurrent ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                    </div>
                  </div>
                  {exp.description && <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {u.education && u.education.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={s.sectionTitle}>Education</h3>
              {u.education.map((edu, i) => (
                <div key={i} style={s.edCard}>
                  <div style={s.expHeader}>
                    <div>
                      <div style={s.expRole}>{edu.degree || edu.field}</div>
                      <div style={s.expCompany}>{edu.school}</div>
                    </div>
                    <div style={s.expDate}>
                      {edu.startYear || ''}{edu.startYear && edu.endYear ? ' - ' : ''}{edu.endYear || ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {u.skills && u.skills.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={s.sectionTitle}>Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {u.skills.map((skill, i) => (
                  <Badge key={i} variant="info">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ),
    },
    {
      id: 'interests',
      label: 'Interests',
      content: (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {u.industries && u.industries.length > 0 ? (
            <>
              <h3 style={s.sectionTitle}>Industry Interests</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {u.industries.map((item, i) => (
                  <span key={i} style={s.skillChip}>{item}</span>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No interests listed yet.</p>
          )}
        </motion.div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={s.page}
    >
      <div style={s.cover} />

      <div style={s.infoRow}>
        <Avatar src={u.image} name={u.name || 'User'} size={80} style={{ border: '4px solid var(--surface)' }} />
        <div style={s.infoText}>
          <div style={s.nameRow}>
            <h1 style={s.name}>{u.name || 'User'}</h1>
            {u.verified && <VerifiedBadge size={20} />}
            {(() => {
              const lastActive = mutualStatus?.lastActiveAt || u.lastActiveAt;
              const isOnline = lastActive && (Date.now() - new Date(lastActive).getTime()) < 300000;
              return isOnline ? <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block', marginLeft: 4 }} title="Online" /> : null;
            })()}
          </div>
          {u.role && (
            <div style={s.title}>
              <Briefcase size={14} />
              {formatRole(u.role)}
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
            {u.location && (
              <div style={s.loc}><MapPin size={14} />{u.location}</div>
            )}
            {u.createdAt && (
              <div style={s.loc}><Calendar size={14} />Joined {formatDate(u.createdAt)}</div>
            )}
          </div>
          {u.headline && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{u.headline}</p>
          )}
        </div>
        <div style={s.btns}>
          {isOwnProfile ? (
            <>
              <Link to="/settings">
                <Button variant="outline" size="sm" icon={<Edit3 size={16} />}>Edit Profile</Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="sm" icon={<Settings size={16} />}>Settings</Button>
              </Link>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant={followStatus?.following ? 'secondary' : 'primary'}
                  size="sm"
                  icon={followStatus?.following ? <Check size={16} /> : <UserPlus size={16} />}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  style={
                    followStatus?.following
                      ? { transition: 'all 0.2s' }
                      : undefined
                  }
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
              <motion.div whileHover={mutualStatus?.mutual ? { scale: 1.03 } : {}} whileTap={mutualStatus?.mutual ? { scale: 0.97 } : {}}>
                <Button
                  variant={mutualStatus?.mutual ? 'primary' : 'secondary'}
                  size="sm"
                  icon={<MessageSquare size={16} />}
                  onClick={handleMessageClick}
                  disabled={!mutualStatus?.mutual}
                  title={!mutualStatus?.mutual ? 'Follow each other to start messaging' : ''}
                  style={!mutualStatus?.mutual ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {mutualStatus?.mutual ? 'Message' : mutualStatus?.following ? 'Waiting for Follow Back' : 'Message'}
                </Button>
              </motion.div>
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
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Flag size={16} />}
                  onClick={() => setReportModalOpen(true)}
                >
                  Report
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <div style={s.stats}>
        <div style={s.stat}>
          <div style={s.statVal}>{followerCount}</div>
          <div style={s.statLabel}>Followers</div>
        </div>
        <div style={s.stat}>
          <div style={s.statVal}>{followingCount}</div>
          <div style={s.statLabel}>Following</div>
        </div>
        {u.companyName && (
          <div style={s.stat}>
            <div style={s.statVal}>{u.companyName}</div>
            <div style={s.statLabel}>Company</div>
          </div>
        )}
      </div>

      <Card padding="28px">
        <Tabs tabs={tabs} />
      </Card>

      <Modal isOpen={messageModalOpen} onClose={() => setMessageModalOpen(false)} title="Send Message Request">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Send a message request to {u.name}. They will be notified and can choose to accept.
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
              icon={<Send size={16} />}
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || messageSending}
            >
              {messageSending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Report User">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>Reason</label>
            <select
              style={s.select}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="fake-profile">Fake Profile</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>Description</label>
            <textarea
              style={s.textarea}
              placeholder="Provide additional details..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="sm" onClick={() => setReportModalOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Flag size={16} />}
              onClick={handleReport}
              disabled={reportSending}
            >
              {reportSending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

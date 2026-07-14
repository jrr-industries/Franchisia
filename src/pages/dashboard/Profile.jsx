import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Briefcase, MessageSquare, UserPlus, Calendar,
  GraduationCap, Star, ExternalLink, Award, ThumbsUp, Globe,
  Share2, Flag, Check, CheckCircle, X,
  Send, Settings, Edit3, Save, Camera
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import { useToast } from '../../components/ui/Toast';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import SearchableSelect from '../../components/ui/SearchableSelect';
import { useIndustries, useLocations } from '../../hooks/useCMS';

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

function OnlineDot({ userId }) {
  const online = useOnlineStatus(userId);
  if (!online) return null;
  return <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block', marginLeft: 4 }} title="Online" />;
}

function formatRole(role) {
  if (!role) return '';
  return role.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function RoleProfileInfo({ u }) {
  const fieldStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', borderBottom: '1px solid var(--border)',
    fontSize: 14,
  };
  const labelStyle = { fontWeight: 500, color: 'var(--text-secondary)', flexShrink: 0, minWidth: 150 };
  const valueStyle = { color: 'var(--text)', textAlign: 'right', wordBreak: 'break-word' };

  const commonFields = [
    { label: 'Phone', value: u.phone },
    { label: 'Website', value: u.website },
  ].filter((f) => f.value);

  let roleFields = [];
  if (u.role === 'franchisor') {
    roleFields = [
      { label: 'Company Name', value: u.companyName },
      { label: 'Brand Name', value: u.brandName },
      { label: 'Registration No.', value: u.businessRegistrationNumber },
      { label: 'GST Number', value: u.gstNumber },
      { label: 'Business Email', value: u.businessEmail },
      { label: 'Years in Business', value: u.yearsInBusiness ? `${u.yearsInBusiness} yrs` : null },
      { label: 'Number of Outlets', value: u.numberOfOutlets ? `${u.numberOfOutlets}` : null },
      { label: 'Company Description', value: u.companyDescription || u.bio },
    ];
  } else if (u.role === 'franchisee') {
    roleFields = [
      { label: 'Investment Budget', value: u.investmentCapacity ? `$${Number(u.investmentCapacity).toLocaleString()}` : null },
      { label: 'Preferred Industry', value: u.preferredIndustry },
      { label: 'Business Experience', value: u.headline },
    ];
  } else if (u.role === 'investor') {
    roleFields = [
      { label: 'Investment Range', value: u.investmentRange },
      { label: 'Preferred Industry', value: u.preferredIndustry },
      { label: 'Company', value: u.companyName },
    ];
  } else if (u.role === 'consultant') {
    roleFields = [
      { label: 'Consultancy Name', value: u.consultancyName },
      { label: 'Years of Experience', value: u.experienceYears ? `${u.experienceYears} yrs` : null },
      { label: 'Certifications', value: u.certifications },
    ];
  } else if (u.role === 'supplier') {
    roleFields = [
      { label: 'Company Name', value: u.companyName },
      { label: 'Services', value: u.headline },
      { label: 'Contact Person', value: u.contactPerson },
      { label: 'GST Number', value: u.gstNumber },
    ];
  }

  const allFields = [...commonFields, ...roleFields.filter((f) => f.value)];
  if (allFields.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={s.sectionTitle}>Profile Information</h3>
      <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {allFields.map((f, i) => (
          <div key={i} style={i === allFields.length - 1 ? { ...fieldStyle, borderBottom: 'none' } : fieldStyle}>
            <span style={labelStyle}>{f.label}</span>
            <span style={valueStyle}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Profile() {
  const { user: currentUser } = useAuth();
  const { data: industriesData, isLoading: industriesLoading } = useIndustries();
  const { data: locationsData, isLoading: locationsLoading } = useLocations();
  const INDUSTRIES = ['All', ...(Array.isArray(industriesData) ? industriesData.filter(Boolean) : [])];
  const LOCATIONS = locationsData || {};

  function getCountries() { return Object.keys(LOCATIONS); }
  function getStates(country) { const c = LOCATIONS[country]; return c ? Object.keys(c) : []; }
  function getCities(country, state) { if (!country || !state) return []; const s = LOCATIONS[country]; return s?.[state] || []; }

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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', headline: '', bio: '', location: '', country: '', state: '', city: '', website: '', phone: '', industry: '', companyName: '', brandName: '', businessRegistrationNumber: '', gstNumber: '', businessEmail: '', numberOfOutlets: '', yearsInBusiness: '', companyDescription: '', contactPerson: '', consultancyName: '', certifications: '', preferredIndustry: '', investmentRange: '', investmentCapacity: '', experienceYears: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    if (editModalOpen && profileUser) {
      const u = profileUser;
      setEditForm({
        name: u.name || '',
        headline: u.headline || '',
        bio: u.bio || '',
        location: u.location || '',
        country: u.country || 'India',
        state: u.state || '',
        city: u.city || '',
        website: u.website || '',
        phone: u.phone || '',
        industry: (u.industries || [])[0] || '',
        companyName: u.companyName || '',
        brandName: u.brandName || '',
        businessRegistrationNumber: u.businessRegistrationNumber || '',
        gstNumber: u.gstNumber || '',
        businessEmail: u.businessEmail || '',
        numberOfOutlets: u.numberOfOutlets ? String(u.numberOfOutlets) : '',
        yearsInBusiness: u.yearsInBusiness ? String(u.yearsInBusiness) : '',
        companyDescription: u.companyDescription || '',
        contactPerson: u.contactPerson || '',
        consultancyName: u.consultancyName || '',
        certifications: u.certifications || '',
        preferredIndustry: u.preferredIndustry || '',
        investmentRange: u.investmentRange || '',
        investmentCapacity: u.investmentCapacity ? String(u.investmentCapacity) : '',
        experienceYears: u.experienceYears ? String(u.experienceYears) : '',
      });
    }
  }, [editModalOpen, profileUser]);

  useEffect(() => {
    setEditForm(prev => {
      if (prev.country !== 'India') {
        setAvailableStates([]);
        setAvailableCities([]);
        return { ...prev, state: '', city: '' };
      }
      const states = getStates(prev.country);
      setAvailableStates(states);
      if (!states.includes(prev.state)) {
        setAvailableCities([]);
        return { ...prev, state: '', city: '' };
      }
      const cities = getCities(prev.country, prev.state);
      setAvailableCities(cities);
      if (!cities.includes(prev.city)) {
        return { ...prev, city: '' };
      }
      return prev;
    });
  }, [editForm.country, editForm.state]);

  const handleSaveProfile = useCallback(async () => {
    setEditSaving(true);
    try {
      const locationParts = [editForm.city, editForm.state, editForm.country].filter(Boolean);
      const body = {
        fullName: editForm.name,
        headline: editForm.headline,
        bio: editForm.bio,
        location: locationParts.join(', '),
        country: editForm.country || null,
        state: editForm.state || null,
        city: editForm.city || null,
        website: editForm.website,
        phone: editForm.phone,
        industries: editForm.industry ? [editForm.industry] : [],
        companyName: editForm.companyName || null,
        brandName: editForm.brandName || null,
        businessRegistrationNumber: editForm.businessRegistrationNumber || null,
        gstNumber: editForm.gstNumber || null,
        businessEmail: editForm.businessEmail || null,
        numberOfOutlets: editForm.numberOfOutlets || null,
        yearsInBusiness: editForm.yearsInBusiness || null,
        companyDescription: editForm.companyDescription || null,
        contactPerson: editForm.contactPerson || null,
        consultancyName: editForm.consultancyName || null,
        certifications: editForm.certifications || null,
        preferredIndustry: editForm.preferredIndustry || null,
        investmentRange: editForm.investmentRange || null,
        investmentCapacity: editForm.investmentCapacity || null,
        experienceYears: editForm.experienceYears || null,
      };
      const res = await fetch(`${API}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfileUser((prev) => ({ ...prev, ...updated }));
        addToast('Profile updated successfully', 'success');
        setEditModalOpen(false);
      } else {
        addToast('Failed to update profile', 'error');
      }
    } catch {
      addToast('Failed to update profile', 'error');
    }
    setEditSaving(false);
  }, [editForm, addToast]);

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

  const handleUploadAvatar = useCallback(async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API}/uploads/profile-picture`, { method: 'POST', credentials: 'include', body: formData });
      if (res.ok) {
        const data = await res.json();
        setProfileUser((prev) => ({ ...prev, image: data.url }));
        addToast('Profile picture updated', 'success');
      } else {
        addToast('Failed to upload picture', 'error');
      }
    } catch {
      addToast('Failed to upload picture', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  }, [addToast]);

  const handleUploadBanner = useCallback(async (file) => {
    if (!file) return;
    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API}/uploads/profile-banner`, { method: 'POST', credentials: 'include', body: formData });
      if (res.ok) {
        const data = await res.json();
        setProfileUser((prev) => ({ ...prev, companyBanner: data.url }));
        addToast('Banner updated', 'success');
      } else {
        addToast('Failed to upload banner', 'error');
      }
    } catch {
      addToast('Failed to upload banner', 'error');
    } finally {
      setUploadingBanner(false);
    }
  }, [addToast]);

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

  const handleMessageClick = useCallback(async () => {
    if (!userId) return;
    try {
      const existingRes = await fetch(`${API}/messages/conversations/with/${userId}`, { credentials: 'include' });
      if (existingRes.ok) {
        const existingData = await existingRes.json();
        if (existingData.conversation) {
          navigate(`/messages?conversation=${existingData.conversation.id}`);
          return;
        }
      }
      const res = await fetch(`${API}/messages/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participantId: userId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          navigate(`/messages?conversation=${data.conversation.id}`);
        } else {
          navigate('/messages');
        }
      } else {
        setMessageModalOpen(true);
      }
    } catch {
      setMessageModalOpen(true);
    }
  }, [userId, navigate]);

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

          <RoleProfileInfo u={u} />

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
              <h3 style={s.sectionTitle}>Primary Industry</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {u.industries.map((item, i) => (
                  <span key={i} style={s.skillChip}>{item}</span>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No industry selected yet.</p>
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
      <div
        style={{
          ...s.cover,
          ...(u.companyBanner ? { background: `url(${u.companyBanner}) center/cover no-repeat` } : {}),
          cursor: isOwnProfile ? 'pointer' : 'default',
          overflow: 'hidden',
        }}
        onClick={() => isOwnProfile && bannerInputRef.current?.click()}
      >
        {isOwnProfile && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
            <Camera size={28} color="#fff" />
          </div>
        )}
        <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadBanner(f); e.target.value = ''; }} />
      </div>

      <div style={s.infoRow}>
        <div style={{ position: 'relative', cursor: isOwnProfile ? 'pointer' : 'default', flexShrink: 0 }} onClick={() => isOwnProfile && avatarInputRef.current?.click()}>
          <Avatar src={u.image} name={u.name || 'User'} size={80} style={{ border: '4px solid var(--surface)' }} />
          {isOwnProfile && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
              <Camera size={20} color="#fff" />
            </div>
          )}
          <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadAvatar(f); e.target.value = ''; }} />
        </div>
        <div style={s.infoText}>
          <div style={s.nameRow}>
            <h1 style={s.name}>          {u.name || 'User'}</h1>
            {u.verified && <VerifiedBadge size={20} />}
            {u.id && <OnlineDot userId={u.id} />}
          </div>
          {u.role && (
            <div style={s.title}>
              <Briefcase size={14} />
              {formatRole(u.role)}
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
            {(() => {
              const locParts = [u.city, u.state, u.country].filter(Boolean);
              const displayLoc = locParts.length > 0 ? locParts.join(', ') : u.location;
              return displayLoc ? (
                <div style={s.loc}><MapPin size={14} />{displayLoc}</div>
              ) : null;
            })()}
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
              <Button variant="outline" size="sm" icon={<Edit3 size={16} />} onClick={() => setEditModalOpen(true)}>Edit Profile</Button>
              <Button variant="ghost" size="sm" icon={<Settings size={16} />} onClick={() => navigate('/settings')}>Settings</Button>
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
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<MessageSquare size={16} />}
                  onClick={handleMessageClick}
                >
                  Message
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

      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Profile" width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflow: 'auto' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
            Common Information
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Full Name</label>
            <input style={s.input} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Your full name" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Headline</label>
            <input style={s.input} value={editForm.headline} onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })} placeholder="e.g. Franchise Investor & Business Owner" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Bio</label>
            <textarea style={s.textarea} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell us about yourself" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <SearchableSelect
              label="Country"
              options={getCountries()}
              value={editForm.country}
              onChange={(v) => setEditForm({ ...editForm, country: v })}
              placeholder="Select country"
            />
            {editForm.country === 'India' && (
              <SearchableSelect
                label="State"
                options={availableStates}
                value={editForm.state}
                onChange={(v) => setEditForm({ ...editForm, state: v })}
                placeholder="Select state"
              />
            )}
            {editForm.country === 'India' && editForm.state && (
              <SearchableSelect
                label="City"
                options={availableCities}
                value={editForm.city}
                onChange={(v) => setEditForm({ ...editForm, city: v })}
                placeholder="Select city"
              />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <SearchableSelect
              label="Primary Industry"
              options={INDUSTRIES}
              value={editForm.industry}
              onChange={(v) => setEditForm({ ...editForm, industry: v })}
              placeholder="Select your industry"
            />
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Phone</label>
              <input style={s.input} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Website</label>
            <input style={s.input} value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} placeholder="https://" />
          </div>
          {profileUser?.role && profileUser?.role !== 'none' && profileUser?.role !== 'admin' && (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginTop: 8 }}>
                {formatRole(profileUser.role)} Information
              </div>

              {(profileUser.role === 'franchisor' || profileUser.role === 'supplier') && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Company Name</label>
                  <input style={s.input} value={editForm.companyName} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} placeholder="Company name" />
                </div>
              )}

              {profileUser.role === 'franchisor' && (
                <>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Brand Name</label>
                    <input style={s.input} value={editForm.brandName} onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })} placeholder="Brand name" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Business Email</label>
                    <input style={s.input} value={editForm.businessEmail} onChange={(e) => setEditForm({ ...editForm, businessEmail: e.target.value })} placeholder="business@example.com" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Company Registration No.</label>
                    <input style={s.input} value={editForm.businessRegistrationNumber} onChange={(e) => setEditForm({ ...editForm, businessRegistrationNumber: e.target.value })} placeholder="Registration number" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>GST Number (Optional)</label>
                    <input style={s.input} value={editForm.gstNumber} onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value })} placeholder="GST number" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Years in Business</label>
                      <input type="number" style={s.input} value={editForm.yearsInBusiness} onChange={(e) => setEditForm({ ...editForm, yearsInBusiness: e.target.value })} placeholder="e.g. 5" />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Number of Outlets</label>
                      <input type="number" style={s.input} value={editForm.numberOfOutlets} onChange={(e) => setEditForm({ ...editForm, numberOfOutlets: e.target.value })} placeholder="e.g. 10" />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Company Description</label>
                    <textarea style={s.textarea} value={editForm.companyDescription} onChange={(e) => setEditForm({ ...editForm, companyDescription: e.target.value })} placeholder="Describe your company" />
                  </div>
                </>
              )}

              {profileUser.role === 'franchisee' && (
                <>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Investment Budget</label>
                    <input style={s.input} value={editForm.investmentCapacity} onChange={(e) => setEditForm({ ...editForm, investmentCapacity: e.target.value })} placeholder="e.g. 50000" />
                  </div>
                  <SearchableSelect
                    label="Preferred Industry"
                    options={INDUSTRIES}
                    value={editForm.preferredIndustry}
                    onChange={(v) => setEditForm({ ...editForm, preferredIndustry: v })}
                    placeholder="Select preferred industry"
                  />
                </>
              )}

              {profileUser.role === 'investor' && (
                <>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Investment Range</label>
                    <input style={s.input} value={editForm.investmentRange} onChange={(e) => setEditForm({ ...editForm, investmentRange: e.target.value })} placeholder="e.g. $100,000 - $1,000,000" />
                  </div>
                  <SearchableSelect
                    label="Preferred Industry"
                    options={INDUSTRIES}
                    value={editForm.preferredIndustry}
                    onChange={(v) => setEditForm({ ...editForm, preferredIndustry: v })}
                    placeholder="Select preferred industry"
                  />
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Company (Optional)</label>
                    <input style={s.input} value={editForm.companyName} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} placeholder="Your company" />
                  </div>
                </>
              )}

              {profileUser.role === 'consultant' && (
                <>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Consultancy Name</label>
                    <input style={s.input} value={editForm.consultancyName} onChange={(e) => setEditForm({ ...editForm, consultancyName: e.target.value })} placeholder="Consultancy name" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Years of Experience</label>
                    <input type="number" style={s.input} value={editForm.experienceYears} onChange={(e) => setEditForm({ ...editForm, experienceYears: e.target.value })} placeholder="e.g. 8" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Certifications</label>
                    <input style={s.input} value={editForm.certifications} onChange={(e) => setEditForm({ ...editForm, certifications: e.target.value })} placeholder="e.g. CFE, Certified Franchise Executive" />
                  </div>
                </>
              )}

              {profileUser.role === 'supplier' && (
                <>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Services Offered</label>
                    <input style={s.input} value={editForm.headline} onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })} placeholder="Services you offer" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Contact Person</label>
                    <input style={s.input} value={editForm.contactPerson} onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })} placeholder="Contact person name" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>GST Number (Optional)</label>
                    <input style={s.input} value={editForm.gstNumber} onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value })} placeholder="GST number" />
                  </div>
                </>
              )}
            </>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <Button variant="secondary" size="sm" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveProfile} disabled={editSaving} icon={<Save size={14} />}>
              {editSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

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

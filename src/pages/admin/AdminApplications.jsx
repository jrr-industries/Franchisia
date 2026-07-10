import { ClipboardList } from 'lucide-react';

export default function AdminApplications() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <ClipboardList size={40} color="#8B5CF6" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Applications</h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400 }}>
        Review and manage franchise applications submitted by users. Coming in the next update.
      </p>
    </div>
  );
}

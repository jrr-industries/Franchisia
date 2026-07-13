import { Construction } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      textAlign: 'center',
      backgroundColor: 'var(--surface)',
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#FEF3C7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
      }}>
        <Construction size={36} color="#D97706" />
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)' }}>
        Under Maintenance
      </h1>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, lineHeight: 1.6, margin: '0 0 32px' }}>
        We're currently performing scheduled maintenance to improve your experience.
        We'll be back shortly. Thank you for your patience.
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: '#FCD34D',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Scheduled maintenance in progress</span>
      </div>
    </div>
  );
}

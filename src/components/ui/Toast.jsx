import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: <CheckCircle size={20} />,
  error: <AlertCircle size={20} />,
  info: <Info size={20} />,
  warning: <AlertTriangle size={20} />,
};

const colors = {
  success: { bg: 'var(--accent-light)', border: 'var(--accent)', icon: 'var(--accent)' },
  error: { bg: '#FEE2E2', border: '#EF4444', icon: '#EF4444' },
  info: { bg: '#DBEAFE', border: '#3B82F6', icon: '#3B82F6' },
  warning: { bg: '#FEF3C7', border: '#F59E0B', icon: '#F59E0B' },
};

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
        {toasts.map((toast) => {
          const c = colors[toast.type] || colors.info;
          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 16px',
                backgroundColor: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
                animation: 'slideIn 0.3s ease',
              }}
            >
              <span style={{ color: c.icon, flexShrink: 0, marginTop: 2 }}>{icons[toast.type]}</span>
              <p style={{ fontSize: 14, flex: 1, color: 'var(--text)' }}>{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', flexShrink: 0, display: 'flex' }}>
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

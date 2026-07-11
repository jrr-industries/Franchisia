import { useState, useRef, useEffect, useMemo } from 'react';

const styles = {
  wrapper: { position: 'relative' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', backgroundColor: 'var(--background)',
    color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
    marginTop: 4, borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-md)', maxHeight: 240, overflow: 'auto',
  },
  option: {
    padding: '10px 14px', fontSize: 14, cursor: 'pointer',
    transition: 'background 0.1s',
  },
  noResult: {
    padding: '12px 14px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center',
  },
};

export default function SearchableSelect({ options = [], value, onChange, placeholder, label, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const wrapperRef = useRef(null);

  const filtered = useMemo(() => {
    if (!search) return options;
    return options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setSearch(option);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} style={styles.wrapper}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>
          {label}
          {required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <input
        style={styles.input}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          if (e.target.value !== value) onChange('');
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder || 'Search or select...'}
      />
      {isOpen && (
        <div style={styles.dropdown}>
          {filtered.length > 0 ? (
            filtered.map((option) => (
              <div
                key={option}
                style={{
                  ...styles.option,
                  backgroundColor: option === value ? 'var(--primary-light)' : 'transparent',
                  color: option === value ? 'var(--primary)' : 'var(--text)',
                  fontWeight: option === value ? 600 : 400,
                }}
                onClick={() => handleSelect(option)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = option === value ? 'var(--primary-light)' : 'transparent'}
              >
                {option}
              </div>
            ))
          ) : (
            <div style={styles.noResult}>No matching options</div>
          )}
        </div>
      )}
    </div>
  );
}

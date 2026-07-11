import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, X, User, Building2, Briefcase, MessageSquare, TrendingUp, Clock, ArrowUpDown } from "lucide-react";
import Avatar from "./ui/Avatar";

const RECENT_SEARCHES_KEY = "franchisia_recent_searches";

function highlightText(text, query) {
  if (!text || !query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? `<mark style="background:var(--primary-light);color:var(--primary);padding:0 2px;border-radius:2px">${part}</mark>`
      : part
  ).join("");
}

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch { return []; }
}

function saveRecentSearch(query) {
  const searches = getRecentSearches().filter((s) => s !== query);
  searches.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, 8)));
}

export default function SearchBar({ placeholder = "Search users, companies, franchises..." }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const recentSearches = getRecentSearches();

  const fetchResults = useCallback(async (q) => {
    if (q.trim().length < 2) { setResults(null); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => fetchResults(query), 300);
    } else {
      setResults(null);
    }
    setSelectedIdx(-1);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchResults]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalResults = results
    ? results.users.length + results.companies.length + results.franchises.length + results.conversations.length + results.opportunities.length
    : 0;

  const flatResults = results
    ? [
        ...results.users.map((r) => ({ ...r, _type: "user" })),
        ...results.companies.map((r) => ({ ...r, _type: "company" })),
        ...results.franchises.map((r) => ({ ...r, _type: "franchise" })),
        ...results.conversations.map((r) => ({ ...r, _type: "conversation" })),
        ...results.opportunities.map((r) => ({ ...r, _type: "opportunity" })),
      ]
    : [];

  const handleSelect = (item) => {
    setOpen(false);
    setQuery("");
    saveRecentSearch(query);
    switch (item._type) {
      case "user": navigate(`/profile?id=${item.id}`); break;
      case "company": navigate(`/company/${item.slug || item.id}`); break;
      case "franchise": navigate(`/listing/${item.slug || item.id}`); break;
      case "conversation": navigate(`/messages?conversation=${item.id}`); break;
      case "opportunity": navigate(`/listing/${item.slug || item.id}`); break;
    }
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    const total = flatResults.length;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, total - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, -1)); }
    else if (e.key === "Enter" && selectedIdx >= 0 && flatResults[selectedIdx]) {
      e.preventDefault(); handleSelect(flatResults[selectedIdx]);
    }
    else if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: 480 }}>
      <div style={{ position: "relative" }}>
        <SearchIcon size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none", zIndex: 1 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setShowRecent(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          style={{
            width: "100%", padding: "8px 36px 8px 36px", fontSize: 13,
            backgroundColor: "var(--background)", border: "1px solid var(--border)",
            borderRadius: 100, color: "var(--text)", outline: "none",
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex" }}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 6,
          backgroundColor: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 200,
          maxHeight: 420, overflow: "auto",
        }}>
          {loading && (
            <div style={{ padding: 20, textAlign: "center" }}>
              <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
            </div>
          )}

          {!loading && !query && showRecent && recentSearches.length > 0 && (
            <>
              <div style={{ padding: "10px 14px 4px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={12} /> Recent Searches
              </div>
              {recentSearches.map((s, i) => (
                <button key={i} onClick={() => { setQuery(s); setShowRecent(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 14px", fontSize: 13, border: "none", background: "none", color: "var(--text)", textAlign: "left", cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Clock size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  {s}
                </button>
              ))}
            </>
          )}

          {!loading && !query && showRecent && recentSearches.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              <SearchIcon size={24} style={{ margin: "0 auto 8px", display: "block", opacity: 0.5 }} />
              Start typing to search
            </div>
          )}

          {!loading && query && query.trim().length < 2 && (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Type at least 2 characters to search
            </div>
          )}

          {!loading && query && query.trim().length >= 2 && totalResults === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No results found for "{query}"
            </div>
          )}

          {!loading && results && totalResults > 0 && (
            <div>
              {results.users.length > 0 && (
                <Section label="Users" icon={<User size={14} />}>
                  {results.users.map((u, i) => {
                    const idx = flatResults.indexOf({ ...u, _type: "user" });
                    return (
                      <ResultItem key={u.id} selected={selectedIdx === idx} onClick={() => handleSelect({ ...u, _type: "user" })} onHover={() => setSelectedIdx(idx)}>
                        <Avatar name={u.name} src={u.image} size={28} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: highlightText(u.name, query) }} />
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.headline || u.role || u.email}</div>
                        </div>
                      </ResultItem>
                    );
                  })}
                </Section>
              )}

              {results.companies.length > 0 && (
                <Section label="Companies" icon={<Building2 size={14} />}>
                  {results.companies.map((c, i) => {
                    const idx = flatResults.indexOf({ ...c, _type: "company" });
                    return (
                      <ResultItem key={c.id} selected={selectedIdx === idx} onClick={() => handleSelect({ ...c, _type: "company" })} onHover={() => setSelectedIdx(idx)}>
                        {c.logoUrl ? <img src={c.logoUrl} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} /> : <Building2 size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: highlightText(c.name, query) }} />
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.industry}{c.city ? ` · ${c.city}` : ""}</div>
                        </div>
                      </ResultItem>
                    );
                  })}
                </Section>
              )}

              {results.franchises.length > 0 && (
                <Section label="Franchises" icon={<TrendingUp size={14} />}>
                  {results.franchises.map((f, i) => {
                    const idx = flatResults.indexOf({ ...f, _type: "franchise" });
                    return (
                      <ResultItem key={f.id} selected={selectedIdx === idx} onClick={() => handleSelect({ ...f, _type: "franchise" })} onHover={() => setSelectedIdx(idx)}>
                        <Briefcase size={20} style={{ color: "var(--accent)", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: highlightText(f.title, query) }} />
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.company?.name}{f.industry ? ` · ${f.industry}` : ""}</div>
                        </div>
                      </ResultItem>
                    );
                  })}
                </Section>
              )}

              {results.conversations.length > 0 && (
                <Section label="Messages" icon={<MessageSquare size={14} />}>
                  {results.conversations.map((c, i) => {
                    const idx = flatResults.indexOf({ ...c, _type: "conversation" });
                    const otherUser = c.participants?.[0]?.user;
                    return (
                      <ResultItem key={c.id} selected={selectedIdx === idx} onClick={() => handleSelect({ ...c, _type: "conversation" })} onHover={() => setSelectedIdx(idx)}>
                        <Avatar name={otherUser?.name} src={otherUser?.image} size={28} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>Conversation with {otherUser?.name || "Unknown"}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.messages?.[0]?.content}</div>
                        </div>
                      </ResultItem>
                    );
                  })}
                </Section>
              )}

              {results.opportunities.length > 0 && (
                <Section label="Opportunities" icon={<ArrowUpDown size={14} />}>
                  {results.opportunities.map((o, i) => {
                    const idx = flatResults.indexOf({ ...o, _type: "opportunity" });
                    return (
                      <ResultItem key={o.id} selected={selectedIdx === idx} onClick={() => handleSelect({ ...o, _type: "opportunity" })} onHover={() => setSelectedIdx(idx)}>
                        <TrendingUp size={20} style={{ color: "var(--warning)", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: highlightText(o.title, query) }} />
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{o.company?.name}</div>
                        </div>
                      </ResultItem>
                    );
                  })}
                </Section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ label, icon, children }) {
  return (
    <>
      <div style={{ padding: "8px 14px 4px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
        {icon} {label}
      </div>
      {children}
    </>
  );
}

function ResultItem({ selected, onClick, onHover, children }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 14px",
        fontSize: 13, border: "none", background: selected ? "var(--surface-hover)" : "transparent",
        color: "var(--text)", textAlign: "left", cursor: "pointer",
        transition: "background 0.1s",
      }}
      role="option"
      aria-selected={selected}
    >
      {children}
    </button>
  );
}

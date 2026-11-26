import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { trustyService } from '../services';

// ── Icons (inline SVG to avoid extra imports) ──────────────────
const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const IcBot      = ({ s, c }) => <Icon size={s} className={c} d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM9 12h6M9 16h4M5 8h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />;
const IcSend     = ({ s, c }) => <Icon size={s} className={c} d="m22 2-7 20-4-9-9-4 20-7z" />;
const IcClose    = ({ s, c }) => <Icon size={s} className={c} d="M18 6 6 18M6 6l12 12" />;
const IcMin      = ({ s, c }) => <Icon size={s} className={c} d="M5 12h14" />;
const IcSpark    = ({ s, c }) => <Icon size={s} className={c} d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />;
const IcRefresh  = ({ s, c }) => <Icon size={s} className={c} d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 3v5h5m13 8a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16m18 5v-5h-5" />;

const INTENT_LABELS = {
  ANALYSIS_EXPLAIN:  '🔍 Analysis',
  RECRUITER_CHECK:   '👤 Recruiter',
  COMPANY_CHECK:     '🏢 Company',
  OFFER_LETTER:      '📄 Offer Letter',
  COMMUNITY_INTEL:   '🌐 Community',
  SCAM_EDUCATION:    '📚 Education',
  TRUST_SCORE:       '📊 Trust Score',
  SIMILAR_INCIDENTS: '🔗 Similar Cases',
  ONBOARDING:        '🚀 Guide',
  GENERAL:           '💬 General',
};

const QUICK_PROMPTS = [
  'Why is my last analysis high risk?',
  'What does the trust score mean?',
  'How do registration fee scams work?',
  'Has this company been reported before?',
  'What should I do if a job asks for a fee?',
  'Explain the risk patterns found',
];

const PAGE_LABELS = {
  '/analyze':           'Job Analysis',
  '/dashboard':         'Dashboard',
  '/verify-recruiter':  'Recruiter Verification',
  '/offer-letter':      'Offer Letter Review',
  '/report':            'Community Report',
  '/community-reports': 'Community Intelligence',
};

// ── Message bubble ──────────────────────────────────────────────
const Bubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
          <IcSpark s={11} c="text-white" />
        </div>
      )}
      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
        isUser
          ? 'bg-gray-900 text-white rounded-br-sm'
          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
      }`}>
        {msg.content}
        {msg.intent && !isUser && (
          <div className="mt-1.5 pt-1.5 border-t border-gray-100">
            <span className="text-2xs text-gray-400">{INTENT_LABELS[msg.intent] || '💬'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Typing indicator ────────────────────────────────────────────
const Typing = () => (
  <div className="flex gap-2 justify-start mb-2">
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
      <IcSpark s={11} c="text-white" />
    </div>
    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  </div>
);

// ── Proactive pill ──────────────────────────────────────────────
const ProactivePill = ({ text, onClick, onDismiss }) => (
  <div className="absolute bottom-20 right-0 w-72 bg-white border border-violet-200 rounded-2xl shadow-lg p-3 animate-fade-up">
    <button onClick={onDismiss} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
      <IcClose s={12} />
    </button>
    <div className="flex items-start gap-2">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
        <IcSpark s={11} c="text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-violet-700 mb-0.5">Trusty</p>
        <p className="text-xs text-gray-700 leading-relaxed">{text}</p>
        <button onClick={onClick}
          className="mt-2 text-xs font-medium text-violet-600 hover:text-violet-800 underline underline-offset-2">
          Ask Trusty →
        </button>
      </div>
    </div>
  </div>
);

// ── Main Trusty Widget ──────────────────────────────────────────
export const Trusty = ({ analysisId = null }) => {
  const location   = useLocation();
  const page       = PAGE_LABELS[location.pathname] || 'TrustGraph';
  const pagePath   = location.pathname.replace('/', '') || 'dashboard';

  const [open,        setOpen]        = useState(false);
  const [minimized,   setMinimized]   = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [proactive,   setProactive]   = useState(null);
  const [showQuick,   setShowQuick]   = useState(true);
  const [error,       setError]       = useState('');
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Fetch proactive suggestion when page changes
  useEffect(() => {
    if (!open) {
      trustyService.getProactiveSuggestion(pagePath, analysisId)
        .then(({ suggestion }) => { if (suggestion) setProactive(suggestion); })
        .catch(() => {});
    }
  }, [location.pathname, analysisId]);

  // Initial greeting when first opened
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi, I'm Trusty — your AI fraud investigation copilot on TrustGraph.\n\nI can help you understand analysis results, investigate recruiters, review offer letters, and detect scam patterns using real platform data.\n\nYou're currently on the ${page} page. What would you like to investigate?`,
      }]);
    }
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setError('');
    setShowQuick(false);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      // Build history for API (exclude system messages)
      const history = messages
        .filter(m => m.role !== 'system')
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const { response, intent } = await trustyService.chat(
        msg,
        history,
        analysisId,
        { page: pagePath, pageLabel: page }
      );

      setMessages(prev => [...prev, { role: 'assistant', content: response, intent }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Trusty is temporarily unavailable. Please try again.';
      if (err.response?.status === 429) {
        setError('Rate limit reached — please wait a moment and try again.');
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
      }
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, analysisId, page, pagePath]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const clearChat = () => {
    setMessages([]);
    setShowQuick(true);
    setError('');
    setTimeout(() => setOpen(true), 50);
  };

  // Hide on public pages
  const hiddenPaths = ['/', '/login', '/register', '/forgot-password', '/community-reports'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">

      {/* Proactive pill */}
      {proactive && !open && (
        <ProactivePill
          text={proactive}
          onClick={() => { setProactive(null); setOpen(true); }}
          onDismiss={() => setProactive(null)}
        />
      )}

      {/* Chat window */}
      {open && !minimized && (
        <div className="mb-3 w-80 sm:w-96 bg-gray-50 border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 shrink-0">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <IcSpark s={14} c="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Trusty</p>
              <p className="text-2xs text-white/70">AI Fraud Investigator · {page}</p>
            </div>
            <button onClick={clearChat} title="New conversation"
              className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors">
              <IcRefresh s={13} />
            </button>
            <button onClick={() => setMinimized(true)}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors">
              <IcMin s={13} />
            </button>
            <button onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors">
              <IcClose s={13} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
            {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
            {loading && <Typing />}
            {error && (
              <div className="text-center py-1">
                <span className="text-2xs text-red-500 bg-red-50 border border-red-100 rounded-full px-2 py-0.5">{error}</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {showQuick && messages.length <= 1 && (
            <div className="px-3 pb-2 shrink-0">
              <p className="text-2xs text-gray-400 mb-1.5 font-medium">Suggested questions</p>
              <div className="flex flex-wrap gap-1">
                {QUICK_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => handleSend(p)}
                    className="text-2xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-colors">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-1 shrink-0 border-t border-gray-100 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask Trusty anything about this investigation..."
                rows={1}
                disabled={loading}
                className="flex-1 text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 placeholder-gray-400 text-gray-900 resize-none max-h-20 disabled:opacity-50"
                style={{ lineHeight: '1.4' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                }}
              />
              <button onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all shrink-0">
                <IcSend s={13} c="text-white" />
              </button>
            </div>
            <p className="text-2xs text-gray-300 text-center mt-1.5">
              Powered by Groq · Answers use real platform data
            </p>
          </div>
        </div>
      )}

      {/* Minimized bar */}
      {open && minimized && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg cursor-pointer"
          onClick={() => setMinimized(false)}>
          <IcSpark s={13} c="text-white" />
          <span className="text-xs font-medium text-white">Trusty</span>
          {messages.length > 0 && (
            <span className="bg-white/30 text-white text-2xs rounded-full px-1.5 py-0.5">{messages.length}</span>
          )}
        </div>
      )}

      {/* FAB trigger */}
      <button
        onClick={() => { setOpen(v => !v); setMinimized(false); }}
        className={`w-13 h-13 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open
            ? 'bg-gray-900 hover:bg-gray-700 rotate-0'
            : 'bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 hover:scale-110'
        }`}
        style={{ width: 52, height: 52 }}
        title="Ask Trusty"
      >
        {open ? <IcClose s={18} c="text-white" /> : <IcSpark s={20} c="text-white" />}
        {!open && proactive && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>
    </div>
  );
};

import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';

/* ── Button ─────────────────────────────────────────────────── */
export const Button = ({ children, variant = 'primary', size = 'md', className = '', loading = false, ...props }) => {
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1';
  const variants = {
    primary:   'bg-gray-900 text-white hover:bg-gray-700 border border-gray-900',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300',
    danger:    'bg-red-600 text-white border border-red-600 hover:bg-red-700',
    success:   'bg-green-700 text-white border border-green-700 hover:bg-green-800',
    ghost:     'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent',
    outline:   'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    link:      'bg-transparent text-gray-600 hover:text-gray-900 border-none underline-offset-2 hover:underline px-0 py-0',
  };
  const sizes = {
    xs: 'text-xs px-2.5 py-1',
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-3.5 py-2',
    lg: 'text-sm px-5 py-2.5',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {loading && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />}
      {children}
    </button>
  );
};

/* ── Card ───────────────────────────────────────────────────── */
export const Card = ({ children, className = '', hover = false, padding = true }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-card ${padding ? 'p-5' : ''} ${hover ? 'transition-colors hover:border-gray-300 cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

/* ── Section Header ─────────────────────────────────────────── */
export const SectionHeader = ({ title, description, action }) => (
  <div className="flex items-start justify-between gap-4 mb-5">
    <div>
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    {action}
  </div>
);

/* ── Badge ──────────────────────────────────────────────────── */
export const Badge = ({ children, variant = 'default', size = 'md', dot = false, className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-600 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger:  'bg-red-50 text-red-700 border-red-200',
    info:    'bg-blue-50 text-blue-700 border-blue-200',
    purple:  'bg-purple-50 text-purple-700 border-purple-200',
    neutral: 'bg-gray-50 text-gray-500 border-gray-200',
  };
  const dotColors = {
    default: 'bg-gray-400', success: 'bg-green-500', warning: 'bg-amber-500',
    danger: 'bg-red-500', info: 'bg-blue-500', purple: 'bg-purple-500', neutral: 'bg-gray-400',
  };
  const sizes = { sm: 'px-1.5 py-0.5 text-2xs', md: 'px-2 py-0.5 text-xs', lg: 'px-2.5 py-1 text-xs' };
  return (
    <span className={`inline-flex items-center gap-1 rounded border font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

/* ── Status Badge ───────────────────────────────────────────── */
export const StatusBadge = ({ status }) => {
  const map = {
    Verified:    { variant: 'success', label: 'Verified' },
    Suspicious:  { variant: 'warning', label: 'Suspicious' },
    'High Risk': { variant: 'danger',  label: 'High Risk' },
    Pending:     { variant: 'neutral', label: 'Pending' },
    Dismissed:   { variant: 'default', label: 'Dismissed' },
    'Low Risk':  { variant: 'success', label: 'Low Risk' },
    'Medium Risk': { variant: 'warning', label: 'Medium Risk' },
  };
  const cfg = map[status] || { variant: 'default', label: status };
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
};

/* ── InputField ─────────────────────────────────────────────── */
export const InputField = ({ label, error, hint, icon: Icon, className = '', required, ...props }) => (
  <div className={`space-y-1 ${className}`}>
    {label && (
      <label className="block text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
      <input
        className={`w-full ${Icon ? 'pl-9' : 'px-3'} pr-3 py-2 text-sm bg-white border ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:border-gray-400 focus:ring-gray-200'} rounded focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-400 text-gray-900`}
        {...props}
      />
    </div>
    {error && <p className="text-red-600 text-xs flex items-center gap-1"><AlertTriangle size={11} />{error}</p>}
    {hint && !error && <p className="text-gray-400 text-xs">{hint}</p>}
  </div>
);

/* ── TextArea ───────────────────────────────────────────────── */
export const TextArea = ({ label, error, hint, required, className = '', ...props }) => (
  <div className={`space-y-1 ${className}`}>
    {label && (
      <label className="block text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <textarea
      className={`w-full px-3 py-2 text-sm bg-white border ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:border-gray-400 focus:ring-gray-200'} rounded focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-400 text-gray-900 resize-none`}
      {...props}
    />
    {error && <p className="text-red-600 text-xs flex items-center gap-1"><AlertTriangle size={11} />{error}</p>}
    {hint && !error && <p className="text-gray-400 text-xs">{hint}</p>}
  </div>
);

/* ── Select ─────────────────────────────────────────────────── */
export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className={`space-y-1 ${className}`}>
    {label && <label className="block text-xs font-medium text-gray-700">{label}</label>}
    <select
      className={`w-full px-3 py-2 text-sm bg-white border ${error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300 focus:border-gray-400 focus:ring-gray-200'} rounded focus:outline-none focus:ring-2 transition-colors text-gray-900 cursor-pointer`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-red-600 text-xs">{error}</p>}
  </div>
);

/* ── Alert ──────────────────────────────────────────────────── */
export const Alert = ({ type = 'info', children, onClose, className = '' }) => {
  const styles = {
    error:   'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info:    'bg-blue-50 border-blue-200 text-blue-800',
  };
  const icons = {
    error: <AlertTriangle size={14} className="text-red-500 shrink-0" />,
    success: <CheckCircle size={14} className="text-green-500 shrink-0" />,
    warning: <AlertTriangle size={14} className="text-amber-500 shrink-0" />,
    info: <Info size={14} className="text-blue-500 shrink-0" />,
  };
  return (
    <div className={`flex items-start gap-2.5 px-3.5 py-3 rounded border text-xs leading-relaxed ${styles[type]} ${className}`}>
      <span className="mt-0.5">{icons[type]}</span>
      <p className="flex-1">{children}</p>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X size={12} />
        </button>
      )}
    </div>
  );
};

/* ── Risk Indicator (replaces gauge) ────────────────────────── */
export const RiskIndicator = ({ score, className = '' }) => {
  const isHigh = score > 70;
  const isMed  = score > 40;
  const level  = isHigh ? 'High Risk' : isMed ? 'Medium Risk' : 'Low Risk';
  const color  = isHigh ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-green-600';
  const textColor = isHigh ? 'text-red-700' : isMed ? 'text-amber-700' : 'text-green-700';
  const badgeVar  = isHigh ? 'danger' : isMed ? 'warning' : 'success';
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`text-2xl font-bold mono ${textColor}`}>{score}</span>
          <div>
            <Badge variant={badgeVar} dot size="md">{level}</Badge>
            <p className="text-2xs text-gray-400 mt-0.5">Risk Score / 100</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Threat Level</p>
          <p className={`text-sm font-semibold ${textColor}`}>{level}</p>
        </div>
      </div>
      <div className="risk-bar-track">
        <div className={`risk-bar-fill ${color}`} style={{ width: `${score}%` }} />
      </div>
      <div className="flex justify-between text-2xs text-gray-400">
        <span>0 — Safe</span>
        <span>50 — Moderate</span>
        <span>100 — Critical</span>
      </div>
    </div>
  );
};

/* ── Stat Card ──────────────────────────────────────────────── */
export const StatCard = ({ label, value, icon: Icon, change, changeLabel }) => (
  <Card>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change !== undefined && (
          <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)} {changeLabel || 'this month'}
          </p>
        )}
      </div>
      {Icon && (
        <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg shrink-0">
          <Icon size={16} className="text-gray-500" />
        </div>
      )}
    </div>
  </Card>
);

/* ── Loader / Skeleton ──────────────────────────────────────── */
export const Loader = ({ rows = 3 }) => (
  <div className="space-y-3 py-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 36, opacity: 1 - i * 0.15 }} />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <Card>
    <div className="space-y-3">
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-7 w-1/2" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  </Card>
);

/* ── Modal ──────────────────────────────────────────────────── */
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`bg-white border border-gray-200 rounded-xl w-full ${maxWidth} shadow-modal animate-fade-up max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

/* ── Empty State ────────────────────────────────────────────── */
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    {Icon && (
      <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl mb-3">
        <Icon size={24} className="text-gray-400" />
      </div>
    )}
    <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
    {description && <p className="text-xs text-gray-400 max-w-xs mb-4 leading-relaxed">{description}</p>}
    {action}
  </div>
);

/* ── Pagination ─────────────────────────────────────────────── */
export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
      <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="xs" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          <ChevronLeft size={12} /> Prev
        </Button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 rounded text-xs font-medium transition-colors ${p === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {p}
          </button>
        ))}
        <Button variant="secondary" size="xs" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Next <ChevronRight size={12} />
        </Button>
      </div>
    </div>
  );
};

/* ── Divider ────────────────────────────────────────────────── */
export const Divider = ({ label }) => (
  <div className="relative my-4">
    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
    {label && (
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-2xs text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
    )}
  </div>
);

/* ── Check Row ──────────────────────────────────────────────── */
export const CheckRow = ({ valid, label, detail }) => (
  <div className={`flex items-start gap-3 px-3.5 py-3 rounded border text-sm ${valid ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
    {valid
      ? <CheckCircle size={15} className="text-green-600 shrink-0 mt-0.5" />
      : <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />}
    <div>
      <p className={`text-xs font-medium ${valid ? 'text-green-800' : 'text-red-800'}`}>{label}</p>
      {detail && <p className={`text-2xs mt-0.5 ${valid ? 'text-green-600' : 'text-red-600'}`}>{detail}</p>}
    </div>
  </div>
);

/* ── Flag Item ──────────────────────────────────────────────── */
export const FlagItem = ({ text, severity = 'danger' }) => {
  const colors = {
    danger:  'bg-red-50 border-red-100 text-red-700',
    warning: 'bg-amber-50 border-amber-100 text-amber-700',
    info:    'bg-blue-50 border-blue-100 text-blue-700',
  };
  const dots = { danger: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500' };
  return (
    <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded border text-xs ${colors[severity]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${dots[severity]}`} />
      <span>{text}</span>
    </div>
  );
};

/* ── Page Header ────────────────────────────────────────────── */
export const PageHeader = ({ title, description, action, badge }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <div className="flex items-center gap-2 mb-0.5">
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        {badge}
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
    {action}
  </div>
);

/* ── Search Input ───────────────────────────────────────────── */
export const SearchInput = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`relative ${className}`}>
    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 placeholder:text-gray-400 text-gray-900"
    />
  </div>
);

/* ── Inline Label-Value pair ────────────────────────────────── */
export const DataRow = ({ label, value, mono = false }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
    <span className="text-xs text-gray-500 shrink-0">{label}</span>
    <span className={`text-xs font-medium text-gray-900 text-right truncate ${mono ? 'mono' : ''}`}>{value || '—'}</span>
  </div>
);

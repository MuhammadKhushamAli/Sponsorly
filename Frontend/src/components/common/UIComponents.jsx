import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-gradient-brand text-white hover:shadow-brand focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
    outline:   'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost:     'text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    danger:    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// ── Input with validation ─────────────────────────────────────────────────────
export const Input = ({ label, error, helper, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-sm font-semibold text-gray-700">{label}</label>
    )}
    <input
      className={`px-4 py-2.5 border-2 rounded-xl text-sm focus:border-primary-500 transition-colors
        ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}
        ${className}`}
      {...props}
    />
    {error  && <p className="text-xs text-red-500 flex items-center gap-1"><XCircle size={12} />{error}</p>}
    {helper && !error && <p className="text-xs text-gray-400">{helper}</p>}
  </div>
);

// ── Inline field error (for complex custom inputs) ────────────────────────────
export const FieldError = ({ error }) =>
  error ? (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1 slide-down">
      <XCircle size={11} /> {error}
    </p>
  ) : null;

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary:   'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    accent:    'bg-accent-100 text-accent-800',
    success:   'bg-green-100 text-green-800',
    warning:   'bg-yellow-100 text-yellow-800',
    error:     'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${variants[variant] ?? variants.primary} ${className}`}>
      {children}
    </span>
  );
};

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-4', lg: 'w-12 h-12 border-4' };
  return (
    <div className={`animate-spin rounded-full border-primary-200 border-t-primary-500 ${sizes[size]} ${className}`} />
  );
};

// ── Animated Modal ────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md', className = '' }) => {
  // Trap scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxW = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl', full: 'max-w-4xl' };

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className={`modal-content bg-white rounded-2xl shadow-2xl w-full ${maxW[size] ?? maxW.md} ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
};

// ── Alert (inline) ────────────────────────────────────────────────────────────
export const Alert = ({ type = 'info', message, title, onClose, className = '' }) => {
  const cfg = {
    success: { cls: 'bg-green-50 border-green-200 text-green-800',  Icon: CheckCircle },
    error:   { cls: 'bg-red-50 border-red-200 text-red-800',        Icon: XCircle },
    warning: { cls: 'bg-yellow-50 border-yellow-200 text-yellow-800', Icon: AlertTriangle },
    info:    { cls: 'bg-blue-50 border-blue-200 text-blue-800',     Icon: Info },
  };
  const { cls, Icon } = cfg[type] ?? cfg.info;

  return (
    <div className={`border rounded-xl p-4 flex items-start gap-3 fade-in ${cls} ${className}`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-semibold text-sm mb-0.5">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 p-0.5 rounded hover:bg-black/10">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider = ({ label, className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="flex-1 border-t border-gray-200" />
    {label && <span className="text-xs text-gray-400 font-medium px-1">{label}</span>}
    <div className="flex-1 border-t border-gray-200" />
  </div>
);

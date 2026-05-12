/**
 * Global Toast System
 * -------------------
 * Usage:
 *   import { useToast } from '../context/ToastContext';
 *   const toast = useToast();
 *   toast.success('Saved!');
 *   toast.error('Something went wrong');
 *   toast.info('Check your email');
 *   toast.warning('Rate limit approaching');
 */
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let _id = 0;
const nextId = () => ++_id;

// ── Individual toast item ─────────────────────────────────────────────────────
const ICONS = {
  success: <CheckCircle size={18} className="text-green-500 shrink-0" />,
  error:   <XCircle    size={18} className="text-red-500 shrink-0" />,
  warning: <AlertTriangle size={18} className="text-yellow-500 shrink-0" />,
  info:    <Info       size={18} className="text-blue-500 shrink-0" />,
};

const BORDERS = {
  success: 'border-l-green-500',
  error:   'border-l-red-500',
  warning: 'border-l-yellow-500',
  info:    'border-l-blue-500',
};

const PROGRESS_COLORS = {
  success: 'bg-green-500',
  error:   'bg-red-500',
  warning: 'bg-yellow-500',
  info:    'bg-blue-500',
};

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 280);
  }, [toast.id, onRemove]);

  React.useEffect(() => {
    const timer = setTimeout(dismiss, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [dismiss, toast.duration]);

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 bg-white border border-gray-100 border-l-4 ${BORDERS[toast.type]}
        rounded-xl shadow-lg px-4 py-3.5 min-w-[280px] max-w-sm overflow-hidden
        ${exiting ? 'toast-exit' : 'toast-enter'}`}
    >
      {ICONS[toast.type]}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-bold text-gray-900 leading-tight">{toast.title}</p>
        )}
        <p className={`text-sm text-gray-600 leading-snug ${toast.title ? 'mt-0.5' : ''}`}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={dismiss}
        className="shrink-0 p-0.5 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-100"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${PROGRESS_COLORS[toast.type]} toast-progress`}
        style={{ animationDuration: `${toast.duration ?? 4000}ms` }}
      />
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type, message, options = {}) => {
    const id = nextId();
    setToasts((prev) => [
      ...prev,
      { id, type, message, ...options },
    ]);
    return id;
  }, []);

  const api = {
    success: (msg, opts) => add('success', msg, opts),
    error:   (msg, opts) => add('error',   msg, opts),
    warning: (msg, opts) => add('warning', msg, opts),
    info:    (msg, opts) => add('info',    msg, opts),
    dismiss: remove,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast container — fixed bottom-right */}
      <div
        id="toast-container"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

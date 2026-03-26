// ─── Shared Module UI Primitives ──────────────────────────────────────────────
// Used across all modules. Import individually.

import { useState, useCallback, useRef } from 'react';
import Icon from '../components/common/Icon';

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="font-display text-2xl text-slate-900">{title}</h2>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── Search + Filter Bar ───────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input pl-10 text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}

export function FilterTab({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt) => {
        const label = typeof opt === 'string' ? opt : opt.label;
        const val   = typeof opt === 'string' ? opt : opt.value;
        return (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
              value === val
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = 'search', title = 'Nothing found', desc = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Icon name={icon} className="w-7 h-7 text-slate-300" />
      </div>
      <p className="font-display text-lg text-slate-600">{title}</p>
      {desc && <p className="text-sm text-slate-400 max-w-xs">{desc}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
export function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${danger ? 'bg-red-50' : 'bg-brand-50'}`}>
          <Icon name={danger ? 'close' : 'check'} className={`w-6 h-6 ${danger ? 'text-red-500' : 'text-brand-500'}`} />
        </div>
        <h3 className="font-display text-xl text-slate-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-slate-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          >
            {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form Drawer / Modal Shell ─────────────────────────────────────────────────
export function FormModal({ title, onClose, onSubmit, loading, children, submitLabel = 'Save', wide = false }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] flex flex-col animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="font-display text-xl text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
          <button onClick={onSubmit} className="btn-primary flex-1" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving…
              </span>
            ) : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="label">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  const cfg = {
    success: { bg: 'bg-teal-600',  icon: 'check' },
    error:   { bg: 'bg-red-600',   icon: 'close' },
    info:    { bg: 'bg-brand-600', icon: 'bell'  },
  }[type] || { bg: 'bg-teal-600', icon: 'check' };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 ${cfg.bg} text-white px-5 py-3 rounded-2xl shadow-xl animate-slide-up`}>
      <Icon name={cfg.icon} className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <Icon name="close" className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── useToast hook ─────────────────────────────────────────────────────────────

export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback((message, type = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const ToastEl = toast ? <Toast message={toast.message} type={toast.type} onClose={hide} /> : null;

  return { show, ToastEl };
}

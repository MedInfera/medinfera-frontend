import { createContext, useContext, useState, useCallback } from 'react';
import Icon from '../components/common/Icon.jsx';

const NotifContext = createContext(null);
let notifId = 0;

const CFG = {
  success: { bg: 'bg-teal-600',  icon: 'check' },
  error:   { bg: 'bg-red-600',   icon: 'close' },
  info:    { bg: 'bg-brand-600', icon: 'bell'  },
  warning: { bg: 'bg-amber-500', icon: 'bell'  },
};

function Toast({ toast, onDismiss }) {
  const c = CFG[toast.type] || CFG.info;
  return (
    <div className={`flex items-center gap-3 ${c.bg} text-white px-5 py-3.5 rounded-2xl shadow-xl min-w-72 max-w-sm animate-slide-up`}>
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <Icon name={c.icon} className="w-3.5 h-3.5" />
      </div>
      <span className="text-sm font-medium flex-1 leading-snug">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="text-white/60 hover:text-white flex-shrink-0">
        <Icon name="close" className="w-4 h-4" />
      </button>
    </div>
  );
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++notifId;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const success = useCallback((m) => notify(m, 'success'), [notify]);
  const error   = useCallback((m) => notify(m, 'error', 5000), [notify]);
  const info    = useCallback((m) => notify(m, 'info'), [notify]);
  const warning = useCallback((m) => notify(m, 'warning'), [notify]);

  return (
    <NotifContext.Provider value={{ notify, success, error, info, warning }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end pointer-events-none">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </div>
      )}
    </NotifContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotify must be inside <NotificationProvider>');
  return ctx;
}

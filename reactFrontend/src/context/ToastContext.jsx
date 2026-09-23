import React, { createContext, useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { SvgIcon } from '../components/ui';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((message, options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current, { id, message, ...options }]);
    window.setTimeout(() => dismiss(id), options.duration || 6000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            className="pointer-events-auto animate-fadeIn rounded-2xl border border-violet-100 bg-white px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <SvgIcon name="spark" className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{item.message}</p>
                {item.to && item.action && (
                  <Link
                    to={item.to}
                    onClick={() => dismiss(item.id)}
                    className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-violet-600 hover:text-violet-700"
                  >
                    {item.action}
                    <SvgIcon name="arrowRight" className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                aria-label="Dismiss"
              >
                <SvgIcon name="close" className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

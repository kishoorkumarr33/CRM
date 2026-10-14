import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCRM();

  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  const bgMap = {
    success: 'border-emerald-500/20 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100',
    error: 'border-rose-500/20 bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100',
    warning: 'border-amber-500/20 bg-amber-50/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100',
    info: 'border-sky-500/20 bg-sky-50/95 dark:bg-sky-950/90 text-sky-900 dark:text-sky-100',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xs transition-all duration-300 transform translate-y-0 ${bgMap[toast.type]}`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {iconMap[toast.type]}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-md opacity-60 hover:opacity-100 transition"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

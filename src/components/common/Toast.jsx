import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast = () => {
  const { toast } = useApp();

  if (!toast.show) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle size={18} className="text-rose-400" />;
      case 'info':
        return <Info size={18} className="text-sky-400" />;
      default:
        return <CheckCircle2 size={18} className="text-emerald-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'error': return 'border-rose-500/40 bg-slate-900/95 text-rose-100';
      case 'info': return 'border-sky-500/40 bg-slate-900/95 text-sky-100';
      default: return 'border-emerald-500/40 bg-slate-900/95 text-emerald-100';
    }
  };

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-up px-4 w-full max-w-sm pointer-events-none no-print">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl ${getBorderColor()}`}
      >
        <div className="flex-shrink-0">{getIcon()}</div>
        <p className="text-xs sm:text-sm font-semibold tracking-tight">{toast.message}</p>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const ModalDrawer = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-is-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-is-open');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-is-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div className="modal-drawer-root fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 print:p-0 print:static print:block animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity no-print"
        onClick={onClose}
      />

      {/* Drawer / Modal Container */}
      <div
        className={`modal-drawer-container relative w-full ${maxWidth} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 animate-slide-up sm:animate-fade-in max-h-[90vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:rounded-none print:overflow-visible print:w-full print:max-w-none print:bg-white print:text-black my-auto`}
      >
        {/* Mobile Pull Bar */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 no-print">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 no-print">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-drawer-body p-5 overflow-y-auto space-y-4 print:p-0 print:overflow-visible">
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
export default ModalDrawer;

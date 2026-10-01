import React from 'react';
import { useApp } from '../../context/AppContext';

export const KopSurat = ({ title, subtitle }) => {
  const { schoolSettings } = useApp();

  return (
    <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center select-text">
      <div className="flex items-center justify-between gap-4">
        {/* School Logo */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
          {schoolSettings?.logo_url ? (
            <img
              src={schoolSettings.logo_url}
              alt="Logo Sekolah"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center text-xl shadow-sm">
              SMK
            </div>
          )}
        </div>

        {/* Letterhead Text */}
        <div className="flex-1 text-center">
          {schoolSettings?.governing_body && (
            <h4 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200 whitespace-pre-line leading-tight mb-0.5">
              {schoolSettings.governing_body}
            </h4>
          )}
          <h2 className="text-sm sm:text-lg font-black tracking-tight uppercase text-slate-950 dark:text-white leading-tight">
            {schoolSettings?.school_name || 'SMK NEGERI 1 NUSANTARA'}
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {schoolSettings?.address} | Telp: {schoolSettings?.phone} | NPSN: {schoolSettings?.npsn}
          </p>
          <p className="text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400">
            Website: {schoolSettings?.website} | Email: {schoolSettings?.email}
          </p>
        </div>

        {/* Balance spacer */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 hidden sm:block"></div>
      </div>

      {/* Double Border Line */}
      <div className="mt-2 border-t border-slate-900 border-b-2 border-slate-900 pt-0.5"></div>

      {/* Document Specific Title */}
      {title && (
        <div className="mt-3">
          <h3 className="font-extrabold text-sm sm:text-base uppercase underline text-slate-900 dark:text-white">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-slate-600 dark:text-slate-400">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};

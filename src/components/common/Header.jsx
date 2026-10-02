import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ModalDrawer } from './ModalDrawer';
import {
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  School,
  LayoutDashboard,
  ClipboardCheck,
  GraduationCap,
  Users,
  Settings,
  Calendar,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  Database,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const Header = () => {
  const {
    theme,
    setTheme,
    schoolSettings,
    classes,
    activeTab,
    setActiveTab,
    academicYears,
    activeAcademicYear,
    activeSemester,
    switchAcademicPeriod,
    syncToCloud,
    pullFromCloud,
    isSyncingToCloud,
    isSyncingFromCloud,
    isSupabaseConfigured,
    lastSyncTime
  } = useApp();

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [tempYear, setTempYear] = useState(activeAcademicYear);
  const [tempSemester, setTempSemester] = useState(activeSemester);

  const isHomeroomTeacher = (classes || []).some(c => c.is_homeroom_class);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Beranda Guru';
      case 'attendance': return 'Presensi & Jurnal';
      case 'walas': return 'Wali Kelas (Walas)';
      case 'homeroom': return 'Guru Wali & Bimbingan';
      case 'ai-tools': return 'AI Tools Hub';
      case 'settings': return 'Master Data & Profil';
      default: return 'SIAKAD Mandiri';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'attendance', label: 'Presensi', icon: ClipboardCheck },
    ...(isHomeroomTeacher ? [{ id: 'walas', label: 'Walas', icon: GraduationCap }] : []),
    { id: 'homeroom', label: 'Guru Wali', icon: Users },
    { id: 'ai-tools', label: 'AI Tools', icon: Sparkles, isHighlight: true },
    { id: 'settings', label: 'Master Data', icon: Settings },
  ];

  const handleOpenPeriodModal = () => {
    setTempYear(activeAcademicYear);
    setTempSemester(activeSemester);
    setIsPeriodModalOpen(true);
  };

  const handleApplyPeriod = () => {
    switchAcademicPeriod(tempYear, tempSemester);
    setIsPeriodModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 px-3 py-2 sm:px-5 lg:px-7 transition-all no-print">
      <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-900/30 text-white font-black text-base sm:text-lg select-none">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1">
                {getPageTitle()}
              </h1>
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Personal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[130px] sm:max-w-[180px] font-medium">
              {schoolSettings?.school_name || 'SMK Negeri 1 Teknologi'}
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs (Hidden on mobile, visible on lg/desktop) */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-slate-900/5 dark:shadow-black/20'
                    : item.isHighlight
                    ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? 'text-emerald-600 dark:text-emerald-400' : item.isHighlight ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'}
                />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.isHighlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cloud Sync Icon Button (Compact Icon-Only) */}
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className={`relative p-2 sm:p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm ${
              isSyncingToCloud || isSyncingFromCloud
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                : isSupabaseConfigured
                ? 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            title={
              isSupabaseConfigured
                ? `Sinkronisasi Cloud (${lastSyncTime ? `Terakhir: ${lastSyncTime}` : 'Online'})`
                : 'Sinkronisasi Cloud (Supabase Offline / Belum Dikonfigurasi)'
            }
            aria-label="Sinkronisasi Cloud"
          >
            {isSyncingToCloud || isSyncingFromCloud ? (
              <RefreshCw size={17} className="animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
            ) : (
              <Cloud size={17} className={isSupabaseConfigured ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
            )}
            {isSupabaseConfigured && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shrink-0"></span>
            )}
          </button>

          {/* Active Academic Year Badge (Clickable Quick Switcher) */}
          <button
            onClick={handleOpenPeriodModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-500/30 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-all cursor-pointer active:scale-95 shadow-sm"
            title="Klik untuk mengubah Tahun Ajaran & Semester Aktif"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="whitespace-nowrap">{activeAcademicYear} {activeSemester === '1' ? 'Ganjil' : 'Genap'}</span>
            <ChevronDown size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 transition-all active:scale-95 shadow-sm cursor-pointer"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-amber-400" />
            ) : (
              <Moon size={17} className="text-indigo-600" />
            )}
          </button>

          {/* Teacher Profile Avatar / Settings & Master Data Shortcut */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 ${
              activeTab === 'settings'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-emerald-500/10'
                : 'bg-slate-100/80 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
            title="Buka Pengaturan Profil & Master Data"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-xs shadow-md shrink-0">
              {schoolSettings?.teacher_name?.charAt(0) || 'G'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[100px] md:max-w-[140px]">
                {schoolSettings?.teacher_name?.split(',')[0] || 'Guru'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Profil & Data
              </div>
            </div>
          </button>
        </div>

      </div>

      {/* Modal Quick Switcher Periode */}
      <ModalDrawer
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        title="Ganti Tahun Ajaran & Semester Aktif"
      >
        <div className="space-y-4 text-left">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Pemisahan Data Otomatis Sesuai Periode Aktif</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Data presensi harian, nilai siswa, jurnal mengajar, dan absensi walas tersimpan terpisah per periode. Saat beralih ke periode baru, lembar data akan bersih kembali.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Pilih Tahun Ajaran
            </label>
            <select
              value={tempYear}
              onChange={(e) => setTempYear(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.name}>
                  Tahun Ajaran {ay.name} {ay.name === activeAcademicYear ? '(Sedang Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Pilih Semester
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTempSemester('1')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  tempSemester === '1'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Semester 1 (Ganjil)</span>
                  {tempSemester === '1' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Juli - Desember
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTempSemester('2')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  tempSemester === '2'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Semester 2 (Genap)</span>
                  {tempSemester === '2' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Januari - Juni
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsPeriodModalOpen(false);
                setActiveTab('settings');
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Settings size={13} />
              <span>Kelola Daftar Tahun Ajaran</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPeriodModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyPeriod}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
              >
                Terapkan Periode
              </button>
            </div>
          </div>
        </div>
      </ModalDrawer>

      {/* Modal Sinkronisasi Data Online (Supabase Cloud) */}
      <ModalDrawer
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        title="Sinkronisasi Data Online & Cloud"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 text-left">
          {/* Status Bar */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            isSupabaseConfigured
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-500/30 text-amber-900 dark:text-amber-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl shrink-0 ${
                isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}>
                <Cloud size={18} />
              </div>
              <div>
                <p className="font-extrabold">
                  {isSupabaseConfigured ? 'Supabase Cloud Terhubung' : 'Supabase Belum Dikonfigurasi'}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {lastSyncTime ? `Terakhir Sinkron: ${lastSyncTime}` : 'Belum pernah disinkronkan'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSyncModalOpen(false);
                setActiveTab('settings');
              }}
              className="text-xs font-bold underline shrink-0 hover:opacity-80"
            >
              Pengaturan API
            </button>
          </div>

          {/* Two Main Action Buttons: Upload & Tarik Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* 1. Upload Data ke Cloud */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CloudUpload size={22} />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Upload Data ke Cloud
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Unggah seluruh database lokal (14 tabel) dari perangkat ini ke Supabase Cloud secara instan.
                </p>
              </div>

              <button
                type="button"
                disabled={isSyncingToCloud || isSyncingFromCloud}
                onClick={async () => {
                  await syncToCloud();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer"
              >
                {isSyncingToCloud ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Mengunggah Data...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload size={15} />
                    <span>Upload ke Cloud Sekarang</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Tarik Data dari Cloud */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <CloudDownload size={22} />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Tarik Data Online
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Unduh data terbaru dari Supabase Cloud untuk memperbarui database lokal di perangkat ini.
                </p>
              </div>

              <button
                type="button"
                disabled={isSyncingToCloud || isSyncingFromCloud}
                onClick={async () => {
                  await pullFromCloud();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-indigo-900/20 active:scale-95 transition-all cursor-pointer"
              >
                {isSyncingFromCloud ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Menarik Data...</span>
                  </>
                ) : (
                  <>
                    <CloudDownload size={15} />
                    <span>Tarik Data Online</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info & Data Coverage */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Cakupan Sinkronisasi 14 Tabel Database:</span>
            </p>
            <p className="leading-relaxed">
              Profil Sekolah, Tahun Ajaran, Rombel/Kelas, Siswa, Mapel, Jadwal Rutin, Presensi Harian, Jurnal Mengajar, Nilai Capaian Siswa, Agenda Bimbingan BK, Siswa Binaan, Kunjungan Rumah, Kalender Libur, dan Rekap Absensi Walas.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </ModalDrawer>
    </header>
  );
};

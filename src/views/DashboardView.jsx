import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModalDrawer } from '../components/common/ModalDrawer';
import {
  Calendar,
  Clock,
  CheckCircle2,
  CheckCheck,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  ChevronRight,
  GraduationCap,
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  Database,
  MapPin,
  ArrowRight,
  Sparkles,
  FileText,
  Download,
  ExternalLink,
  Tag,
  AlertCircle,
  Check
} from 'lucide-react';

export const DashboardView = () => {
  const {
    schoolSettings,
    schedules,
    classes,
    subjects,
    students,
    attendanceRecords,
    teachingJournals,
    setActiveTab,
    attendanceSubTab,
    setAttendanceSubTab,
    setSelectedScheduleId,
    selectedDate,
    syncToCloud,
    pullFromCloud,
    isSyncingToCloud,
    isSyncingFromCloud,
    isSupabaseConfigured,
    lastSyncTime,
    versionLogs,
    showToast
  } = useApp();

  // App Version State & Update Checker
  const currentVersion = versionLogs?.[0]?.version || 'v2.9.0';
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateResult, setUpdateResult] = useState({
    checked: false,
    hasUpdate: false,
    latestVersion: currentVersion,
    currentVersion: currentVersion,
    releaseNotes: '',
    releaseDate: '',
    downloadUrl: 'https://github.com/fadlirahman1987/siakadpersonal/releases',
    error: null
  });

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setIsUpdateModalOpen(true);
    setUpdateResult({
      checked: false,
      hasUpdate: false,
      latestVersion: currentVersion,
      currentVersion: currentVersion,
      releaseNotes: '',
      releaseDate: '',
      downloadUrl: 'https://github.com/fadlirahman1987/siakadpersonal/releases',
      error: null
    });

    try {
      const response = await fetch('https://api.github.com/repos/fadlirahman1987/siakadpersonal/releases/latest', {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });

      if (response.status === 404) {
        setUpdateResult({
          checked: true,
          hasUpdate: false,
          latestVersion: currentVersion,
          currentVersion: currentVersion,
          releaseNotes: 'Belum ada rilis publik di GitHub Releases. Versi yang Anda jalankan adalah versi pembangunan terkini.',
          releaseDate: 'Terbaru',
          downloadUrl: 'https://github.com/fadlirahman1987/siakadpersonal/releases',
          error: null
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Gagal menghubungi server rilis GitHub (Status: ${response.status})`);
      }

      const data = await response.json();
      const remoteTag = data.tag_name || data.name || '';
      const cleanRemote = remoteTag.replace(/^v/, '').trim();
      const cleanCurrent = currentVersion.replace(/^v/, '').trim();

      // Check if remote version is strictly different from local version
      const hasNewVersion = cleanRemote && cleanRemote !== cleanCurrent;

      const exeAsset = data.assets?.find(a => 
        a.name.endsWith('.exe') || a.name.endsWith('.msi') || a.name.endsWith('.zip')
      );
      const downloadLink = exeAsset?.browser_download_url || data.html_url || 'https://github.com/fadlirahman1987/siakadpersonal/releases';

      setUpdateResult({
        checked: true,
        hasUpdate: hasNewVersion,
        latestVersion: remoteTag || currentVersion,
        currentVersion: currentVersion,
        releaseNotes: data.body || 'Tidak ada catatan rilis.',
        releaseDate: data.published_at 
          ? new Date(data.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          : '',
        downloadUrl: downloadLink,
        error: null
      });

      if (hasNewVersion) {
        showToast(`Pembaruan versi ${remoteTag} tersedia!`, 'info');
      } else {
        showToast(`Aplikasi sudah dalam versi terbaru (${currentVersion}).`, 'success');
      }
    } catch (err) {
      setUpdateResult({
        checked: true,
        hasUpdate: false,
        latestVersion: currentVersion,
        currentVersion: currentVersion,
        releaseNotes: '',
        releaseDate: '',
        downloadUrl: 'https://github.com/fadlirahman1987/siakadpersonal/releases',
        error: err.message || 'Koneksi internet bermasalah saat memeriksa server rilis.'
      });
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  // Summary statistics
  const totalClasses = classes.length;
  const totalStudents = students.length;
  const homeroomClass = classes.find(c => c.is_homeroom_class);
  const homeroomStudents = students.filter(s => s.class_id === homeroomClass?.id);

  // Quick count for today's active schedule attendance
  const todayKey = `1_${selectedDate}`;
  const todayRecord = attendanceRecords[todayKey];
  const presentCount = todayRecord ? Object.values(todayRecord.records).filter(v => v === 'H').length : 0;
  const totalInClass = 8;
  const attendanceRate = totalInClass > 0 ? Math.round((presentCount / totalInClass) * 100) : 0;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      
      {/* Quick Stat Tiles with Vibrant Gradients */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Total Kelas */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400/25 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/15 rounded-full blur-xl pointer-events-none -mr-4 -mt-4"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-100 tracking-wide">Total Kelas</span>
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-inner">
                <Users size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">{totalClasses}</p>
            <p className="text-[11px] text-blue-100/85 mt-0.5 font-medium">Rombel aktif diajar</p>
          </div>
        </div>

        {/* Card 2: Siswa Binaan */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/25 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/15 rounded-full blur-xl pointer-events-none -mr-4 -mt-4"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-100 tracking-wide">Siswa Binaan</span>
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-inner">
                <Award size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">{homeroomStudents.length}</p>
            <p className="text-[11px] text-emerald-100/90 mt-0.5 font-bold flex items-center gap-1">
              <span>★</span> {homeroomClass?.name || 'Wali Kelas'}
            </p>
          </div>
        </div>

        {/* Card 3: Jadwal Hari Ini */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white shadow-lg shadow-orange-500/20 border border-amber-300/25 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/15 rounded-full blur-xl pointer-events-none -mr-4 -mt-4"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-100 tracking-wide">Jadwal Hari Ini</span>
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-inner">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">2 Sesi</p>
            <p className="text-[11px] text-amber-100/85 mt-0.5 font-medium">Lab Komputer & Teori</p>
          </div>
        </div>

        {/* Card 4: Kehadiran Hari Ini */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/20 border border-purple-400/25 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/15 rounded-full blur-xl pointer-events-none -mr-4 -mt-4"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-100 tracking-wide">Kehadiran Hari Ini</span>
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-inner">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">{attendanceRate}%</p>
            <p className="text-[11px] text-purple-100/90 mt-0.5 font-bold">
              {presentCount} dari {totalInClass} Hadir
            </p>
          </div>
        </div>
      </div>

      {/* 3 & 4. Desktop-responsive Layout: Today's Schedule + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Today's Teaching Schedule */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>Jadwal Mengajar Hari Ini</span>
            </h3>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1"
            >
              <span>Buka Semua</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {schedules.slice(0, 2).map((sch, idx) => {
              const cls = classes.find(c => c.id === sch.class_id);
              const sub = subjects.find(s => s.id === sch.subject_id);
              const isFirst = idx === 0;
              const classStudentsCount = students.filter(s => s.class_id === sch.class_id).length;
              const sessionKey = `${sch.id}_${selectedDate}`;
              const attRecord = attendanceRecords[sessionKey];
              const hasAttendance = Boolean(attRecord?.records && Object.keys(attRecord.records).length > 0);
              const presentCount = attRecord?.records ? Object.values(attRecord.records).filter(v => v === 'H').length : 0;
              const hasJournal = (teachingJournals || []).some(j => j.schedule_id === sch.id && j.date === selectedDate);

              return (
                <div
                  key={sch.id}
                  onClick={() => {
                    setSelectedScheduleId(sch.id);
                    setAttendanceSubTab('attendance');
                    setActiveTab('attendance');
                  }}
                  className={`p-4 rounded-2xl transition-all cursor-pointer active:scale-[0.99] glass-card group ${
                    isFirst
                      ? 'border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          {cls?.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {sch.day_name}
                        </span>
                        {isFirst && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 animate-pulse">
                            Sesi Sekarang
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {sub?.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-slate-400" />
                          {sch.start_time} - {sch.end_time} WIB
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" />
                          {sch.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={13} className="text-slate-400" />
                          {classStudentsCount} Siswa
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Buka Jadwal"
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-white group-hover:bg-emerald-600 transition-colors flex-shrink-0"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  {/* Quick Action Tags: Isi Absensi & Isi Jurnal */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3">
                    {/* Tag Cepat Presensi */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScheduleId(sch.id);
                        setAttendanceSubTab('attendance');
                        setActiveTab('attendance');
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${
                        hasAttendance
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                      title={hasAttendance ? 'Lihat & Edit Presensi Sesi Ini' : 'Isi Presensi Sesi Ini'}
                    >
                      {hasAttendance ? (
                        <CheckCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <CheckCircle2 size={14} className="text-slate-400 group-hover:text-emerald-500" />
                      )}
                      <span>
                        {hasAttendance ? `Presensi Terisi (${presentCount}/${classStudentsCount})` : 'Isi Presensi'}
                      </span>
                    </button>

                    {/* Tag Cepat Jurnal */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScheduleId(sch.id);
                        setAttendanceSubTab('journal');
                        setActiveTab('attendance');
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${
                        hasJournal
                          ? 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                          : 'bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                      title={hasJournal ? 'Lihat & Edit Jurnal Sesi Ini' : 'Isi Jurnal KBM Sesi Ini'}
                    >
                      <BookOpen size={14} className={hasJournal ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
                      <span>{hasJournal ? '✓ Jurnal Terisi' : 'Isi Jurnal'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Quick Action Launcher */}
        <div className="lg:col-span-5 space-y-3">
          {/* Header Aksi Cepat + Versi App & Tombol Cek Update */}
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Aksi Cepat Guru</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <Tag size={11} />
                <span>{currentVersion}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckUpdate}
              disabled={isCheckingUpdate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Periksa ketersediaan pembaruan versi baru di GitHub"
            >
              <RefreshCw size={13} className={isCheckingUpdate ? 'animate-spin text-emerald-600 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'} />
              <span>{isCheckingUpdate ? 'Memeriksa...' : 'Cek Update'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            
            <button
              onClick={() => {
                setSelectedScheduleId(1);
                setAttendanceSubTab('attendance');
                setActiveTab('attendance');
              }}
              className="flex flex-col items-center justify-center p-4 rounded-2xl glass-card hover:bg-slate-100 dark:hover:bg-slate-800/80 text-center transition-all active:scale-95 group"
            >
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-2">
                <CheckCircle2 size={22} />
              </div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Presensi & Jurnal</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">1-Tap Set Hadir</span>
            </button>

            <button
              onClick={() => {
                setSelectedScheduleId(1);
                setAttendanceSubTab('grades');
                setActiveTab('attendance');
              }}
              className="flex flex-col items-center justify-center p-4 rounded-2xl glass-card hover:bg-slate-100 dark:hover:bg-slate-800/80 text-center transition-all active:scale-95 group"
            >
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform mb-2">
                <GraduationCap size={22} />
              </div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Rekap Nilai Siswa</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Leger & KKM</span>
            </button>

            <button
              onClick={() => setActiveTab('homeroom')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl glass-card hover:bg-slate-100 dark:hover:bg-slate-800/80 text-center transition-all active:scale-95 group"
            >
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-2">
                <Users size={22} />
              </div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Guru Wali & BK</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Home Visit & Siswa</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-tools')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl glass-card hover:bg-slate-100 dark:hover:bg-slate-800/80 text-center transition-all active:scale-95 group"
            >
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-300 group-hover:scale-110 transition-transform mb-2">
                <Sparkles size={22} />
              </div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Kalkulator RPE & AI</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Pekan Efektif Pintar</span>
            </button>

          </div>

          {/* Cloud Synchronization Hub Card */}
          <div className="glass-card p-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-slate-500/5 to-emerald-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <Cloud size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Sinkronisasi Cloud
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {lastSyncTime ? `Sinkron: ${lastSyncTime}` : 'Supabase Database 14 Tabel'}
                  </p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
              }`}>
                {isSupabaseConfigured ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={isSyncingToCloud || isSyncingFromCloud}
                onClick={async () => {
                  await syncToCloud();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
                title="Upload seluruh data lokal ke Supabase Cloud"
              >
                {isSyncingToCloud ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <CloudUpload size={14} />
                )}
                <span>{isSyncingToCloud ? 'Upload...' : 'Upload Data'}</span>
              </button>

              <button
                type="button"
                disabled={isSyncingToCloud || isSyncingFromCloud}
                onClick={async () => {
                  await pullFromCloud();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
                title="Tarik data terbaru dari Supabase Cloud"
              >
                {isSyncingFromCloud ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <CloudDownload size={14} />
                )}
                <span>{isSyncingFromCloud ? 'Tarik...' : 'Tarik Online'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Modal Pemeriksaan Pembaruan Aplikasi */}
      <ModalDrawer
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Pembaruan Aplikasi SIAKAD"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-slate-800 dark:text-slate-200">
          
          {/* State 1: Checking in progress */}
          {isCheckingUpdate && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <RefreshCw size={32} className="animate-spin" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Memeriksa Versi Terbaru...</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Menghubungkan ke repositori GitHub untuk mendeteksi rilis installer resmi terbaru.
              </p>
            </div>
          )}

          {/* State 2: Error Connection */}
          {!isCheckingUpdate && updateResult.error && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
                <AlertCircle size={20} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-rose-800 dark:text-rose-300">Gagal Memeriksa Rilis</p>
                  <p className="text-rose-700 dark:text-rose-400/90">{updateResult.error}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Versi Terpasang:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentVersion}</span>
              </div>
              <button
                type="button"
                onClick={handleCheckUpdate}
                className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Coba Periksa Ulang</span>
              </button>
            </div>
          )}

          {/* State 3: Update Available */}
          {!isCheckingUpdate && !updateResult.error && updateResult.hasUpdate && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 text-center space-y-2">
                <div className="inline-flex p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 mb-1">
                  <Sparkles size={24} />
                </div>
                <h4 className="font-black text-base text-emerald-900 dark:text-emerald-200">
                  Pembaruan Baru Tersedia!
                </h4>
                <div className="flex items-center justify-center gap-2 text-xs font-bold pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {currentVersion}
                  </span>
                  <ArrowRight size={14} className="text-emerald-600" />
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-sm">
                    {updateResult.latestVersion}
                  </span>
                </div>
                {updateResult.releaseDate && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    Dirilis pada: {updateResult.releaseDate}
                  </p>
                )}
              </div>

              {/* Release Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Catatan Pembaruan:
                </label>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                  {updateResult.releaseNotes}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <a
                  href={updateResult.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Download size={15} />
                  <span>Unduh Rilis Versi {updateResult.latestVersion}</span>
                </a>
                <a
                  href="https://github.com/fadlirahman1987/siakadpersonal/releases"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Lihat di Halaman GitHub Releases</span>
                </a>
              </div>
            </div>
          )}

          {/* State 4: Already Up to Date */}
          {!isCheckingUpdate && !updateResult.error && !updateResult.hasUpdate && (
            <div className="py-4 text-center space-y-3 animate-fade-in">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                <Check size={28} />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Aplikasi Sudah Versi Terbaru
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Anda sedang menjalankan versi <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{currentVersion}</strong>. Tidak ada pembaruan tertunda.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Versi Terpasang:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentVersion}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Status Repositori:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">fadlirahman1987/siakadpersonal</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

        </div>
      </ModalDrawer>

    </div>
  );
};

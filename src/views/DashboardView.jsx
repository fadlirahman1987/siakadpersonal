import React from 'react';
import { useApp } from '../context/AppContext';
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
  FileText
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
    lastSyncTime
  } = useApp();

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
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 px-1">Aksi Cepat Guru</h3>
          <div className="grid grid-cols-2 gap-3">
            
            <button
              onClick={() => {
                setSelectedScheduleId(1);
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

    </div>
  );
};

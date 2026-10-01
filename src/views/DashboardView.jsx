import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Award,
  ChevronRight,
  GraduationCap,
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  Database
} from 'lucide-react';

export const DashboardView = () => {
  const {
    schoolSettings,
    schedules,
    classes,
    subjects,
    students,
    attendanceRecords,
    setActiveTab,
    setSelectedScheduleId,
    selectedDate,
    syncToCloud,
    pullFromCloud,
    isSyncingToCloud,
    isSyncingFromCloud,
    isSupabaseConfigured,
    lastSyncTime
  } = useApp();

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
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
      
      {/* 1. Hero Teacher Greeting Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-slate-900 to-indigo-950 border border-emerald-500/20 p-5 sm:p-7 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-2">
              <Sparkles size={13} className="text-emerald-400" />
              <span>SIAKAD Mobile-First Active</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {getGreeting()}, {schoolSettings?.teacher_name?.split(',')[0] || 'Bapak/Ibu Guru'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-md">
              Siap mengajar hari ini? Akses presensi 1-sentuhan dan jurnal terintegrasi langsung dari genggaman Anda.
            </p>
          </div>

          {/* Quick CTA to Attendance */}
          <button
            onClick={() => {
              setSelectedScheduleId(1);
              setActiveTab('attendance');
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <span>Mulai Presensi Cepat</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. Quick Stat Tiles with Vibrant Gradients */}
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

              return (
                <div
                  key={sch.id}
                  onClick={() => {
                    setSelectedScheduleId(sch.id);
                    setActiveTab('attendance');
                  }}
                  className={`p-4 rounded-2xl transition-all cursor-pointer active:scale-[0.98] glass-card ${
                    isFirst
                      ? 'border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
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
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{sub?.name}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-slate-400" />
                          {sch.start_time} - {sch.end_time} WIB
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" />
                          {sch.room}
                        </span>
                      </div>
                    </div>

                    <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-emerald-600 transition-colors flex-shrink-0">
                      <ArrowRight size={16} />
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

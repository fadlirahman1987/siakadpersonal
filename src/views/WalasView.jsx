import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { KopSurat } from '../components/common/KopSurat';
import { exportWalasAttendanceToExcel } from '../utils/excelExport';
import {
  GraduationCap,
  Calendar,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  Clock,
  Award,
  Sparkles,
  Filter,
  CheckCheck,
  FileText,
  Layers,
  ChevronRight,
  Settings,
  Download
} from 'lucide-react';

export const WalasView = () => {
  const {
    classes,
    students,
    schoolSettings,
    walasMonthlyAttendance,
    updateWalasStudentAttendance,
    batchUpdateWalasAttendance,
    attendanceRecords,
    schedules,
    activeAcademicYear,
    activeSemester,
    showToast,
    setActiveTab
  } = useApp();

  // Filter ONLY homeroom classes (kelas binaan guru ini)
  const homeroomClasses = useMemo(() => {
    return (classes || []).filter(c => c.is_homeroom_class);
  }, [classes]);

  const defaultClass = homeroomClasses[0] || null;

  const [selectedClassId, setSelectedClassId] = useState(() => defaultClass?.id || '');
  const [selectedSemester, setSelectedSemester] = useState(activeSemester || '1'); // '1' (Ganjil: Juli-Des) | '2' (Genap: Jan-Jun)
  const [academicYear, setAcademicYear] = useState(activeAcademicYear || '2026/2027');
  const [activeMode, setActiveMode] = useState('monthly'); // 'monthly' | 'matrix' | 'print'
  const [selectedMonth, setSelectedMonth] = useState(() => activeSemester === '2' ? 'Januari' : 'Juli');
  const [searchQuery, setSearchQuery] = useState('');
  const [printType, setPrintType] = useState('semester'); // 'month' | 'semester'
  const [effectiveDays, setEffectiveDays] = useState(22); // Default effective school days in the active month

  // Sync when active period in context changes or homeroom classes update
  React.useEffect(() => {
    if (activeSemester) {
      setSelectedSemester(activeSemester);
      setSelectedMonth(activeSemester === '2' ? 'Januari' : 'Juli');
    }
    if (activeAcademicYear) {
      setAcademicYear(activeAcademicYear);
    }
    if (homeroomClasses.length > 0 && !homeroomClasses.some(c => c.id === Number(selectedClassId))) {
      setSelectedClassId(homeroomClasses[0].id);
    }
  }, [activeAcademicYear, activeSemester, homeroomClasses, selectedClassId]);


  // Months definition based on semester
  const semesterMonths = useMemo(() => {
    if (selectedSemester === '1') {
      return ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    } else {
      return ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'];
    }
  }, [selectedSemester]);

  // Keep selectedMonth in sync when switching semester
  const currentSemesterMonths = semesterMonths;
  const activeMonth = currentSemesterMonths.includes(selectedMonth) ? selectedMonth : currentSemesterMonths[0];

  const selectedClass = homeroomClasses.find(c => c.id === Number(selectedClassId)) || homeroomClasses[0] || { id: 0, name: '-', major: '-' };
  const classStudents = useMemo(() => {
    if (!selectedClass?.id) return [];
    return students
      .filter(s => s.class_id === Number(selectedClass.id))
      .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis?.includes(searchQuery));
  }, [students, selectedClass, searchQuery]);

  // Helper to read attendance record with H, S, I, A, D
  const getRecord = (studentId, month = activeMonth) => {
    const key = `${selectedClassId}_${selectedSemester}_${month}_${studentId}`;
    return walasMonthlyAttendance[key] || { h: 0, s: 0, i: 0, a: 0, d: 0, notes: '' };
  };

  // Handle single student input change
  const handleInputChange = (studentId, field, value) => {
    const numVal = field === 'notes' ? value : Math.max(0, parseInt(value, 10) || 0);
    updateWalasStudentAttendance(selectedClassId, selectedSemester, activeMonth, studentId, {
      [field]: numVal
    });
  };

  // Quick Action: Fill all students Hadir (H) based on effective school days
  const handleAutoFillHadir = () => {
    const updates = {};
    classStudents.forEach(st => {
      const key = `${selectedClassId}_${selectedSemester}_${activeMonth}_${st.id}`;
      const cur = walasMonthlyAttendance[key] || { s: 0, i: 0, a: 0, d: 0, notes: '' };
      const nonHadir = (Number(cur.s) || 0) + (Number(cur.i) || 0) + (Number(cur.a) || 0) + (Number(cur.d) || 0);
      const calculatedH = Math.max(0, effectiveDays - nonHadir);
      updates[key] = {
        h: calculatedH,
        s: cur.s || 0,
        i: cur.i || 0,
        a: cur.a || 0,
        d: cur.d || 0,
        notes: cur.notes || ''
      };
    });
    batchUpdateWalasAttendance(updates);
    showToast(`Nilai Hadir (H) otomatis dihitung dari ${effectiveDays} hari efektif untuk bulan ${activeMonth}!`, 'success');
  };

  // Quick Action: Fill all empty as 0
  const handleQuickFillZero = () => {
    const updates = {};
    classStudents.forEach(st => {
      const key = `${selectedClassId}_${selectedSemester}_${activeMonth}_${st.id}`;
      const cur = walasMonthlyAttendance[key] || { h: 0, s: 0, i: 0, a: 0, d: 0, notes: '' };
      updates[key] = {
        h: cur.h || 0,
        s: cur.s || 0,
        i: cur.i || 0,
        a: cur.a || 0,
        d: cur.d || 0,
        notes: cur.notes || ''
      };
    });
    batchUpdateWalasAttendance(updates);
    showToast(`Nilai absensi default berhasil disetel untuk bulan ${activeMonth}!`, 'info');
  };

  // Quick Action: Sync / Pull from KBM Daily Attendance
  const handleSyncFromKbmAttendance = () => {
    if (!attendanceRecords || Object.keys(attendanceRecords).length === 0) {
      showToast('Belum ada data presensi KBM harian yang tersimpan.', 'info');
      return;
    }

    const monthMap = {
      'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
      'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
    };
    const targetMonthIdx = monthMap[activeMonth];

    const classScheduleIds = schedules.filter(sc => sc.class_id === Number(selectedClassId)).map(sc => sc.id);

    const aggregated = {};
    classStudents.forEach(st => {
      aggregated[st.id] = { h: 0, s: 0, i: 0, a: 0, d: 0 };
    });

    Object.values(attendanceRecords).forEach(session => {
      if (classScheduleIds.includes(session.schedule_id) && session.date) {
        const d = new Date(session.date);
        if (!isNaN(d.getTime()) && d.getMonth() === targetMonthIdx) {
          Object.entries(session.records || {}).forEach(([stId, status]) => {
            const numStId = Number(stId);
            if (aggregated[numStId]) {
              if (status === 'H') aggregated[numStId].h += 1;
              else if (status === 'S') aggregated[numStId].s += 1;
              else if (status === 'I') aggregated[numStId].i += 1;
              else if (status === 'A') aggregated[numStId].a += 1;
              else if (status === 'D') aggregated[numStId].d += 1;
            }
          });
        }
      }
    });

    const updates = {};
    classStudents.forEach(st => {
      const key = `${selectedClassId}_${selectedSemester}_${activeMonth}_${st.id}`;
      const cur = walasMonthlyAttendance[key] || { notes: '' };
      updates[key] = {
        h: aggregated[st.id]?.h || 0,
        s: aggregated[st.id]?.s || 0,
        i: aggregated[st.id]?.i || 0,
        a: aggregated[st.id]?.a || 0,
        d: aggregated[st.id]?.d || 0,
        notes: cur.notes || (aggregated[st.id]?.a > 0 ? 'Perlu konfirmasi ketidakhadiran' : '')
      };
    });

    batchUpdateWalasAttendance(updates);
    showToast(`Berhasil menarik ringkasan presensi KBM untuk bulan ${activeMonth}!`, 'success');
  };

  // Semester Aggregates for each student (H, S, I, A, D)
  const studentSemesterStats = useMemo(() => {
    const stats = {};
    classStudents.forEach(st => {
      let totalH = 0;
      let totalS = 0;
      let totalI = 0;
      let totalA = 0;
      let totalD = 0;
      semesterMonths.forEach(m => {
        const rec = getRecord(st.id, m);
        totalH += (Number(rec.h) || 0);
        totalS += (Number(rec.s) || 0);
        totalI += (Number(rec.i) || 0);
        totalA += (Number(rec.a) || 0);
        totalD += (Number(rec.d) || 0);
      });
      const totalHari = totalH + totalS + totalI + totalA + totalD;
      const totalAbsen = totalS + totalI + totalA;
      
      let percentHadir = 100;
      if (totalHari > 0) {
        percentHadir = Math.min(100, Math.max(0, Math.round(((totalH + totalD) / totalHari) * 100)));
      } else if (totalAbsen > 0) {
        const estimatedTotal = semesterMonths.length * 22;
        percentHadir = Math.max(0, Math.round(((estimatedTotal - totalAbsen) / estimatedTotal) * 100));
      }

      stats[st.id] = {
        totalH,
        totalS,
        totalI,
        totalA,
        totalD,
        totalHari,
        totalAbsen,
        percentHadir
      };
    });
    return stats;
  }, [classStudents, semesterMonths, walasMonthlyAttendance, selectedClassId, selectedSemester]);

  // Overall Class Summary
  const classSummary = useMemo(() => {
    let totalClassH = 0;
    let totalClassS = 0;
    let totalClassI = 0;
    let totalClassA = 0;
    let totalClassD = 0;
    let studentsWithWarning = [];

    classStudents.forEach(st => {
      const stStat = studentSemesterStats[st.id];
      if (stStat) {
        totalClassH += stStat.totalH;
        totalClassS += stStat.totalS;
        totalClassI += stStat.totalI;
        totalClassA += stStat.totalA;
        totalClassD += stStat.totalD;
        if (stStat.totalA >= 3) {
          studentsWithWarning.push({ student: st, stat: stStat });
        }
      }
    });

    return {
      totalClassH,
      totalClassS,
      totalClassI,
      totalClassA,
      totalClassD,
      studentsWithWarning
    };
  }, [classStudents, studentSemesterStats]);

  // Handle Excel (.xlsx) export for Walas attendance
  const handleExportWalasExcel = (overrideType = null) => {
    try {
      const type = overrideType || printType || 'semester';
      exportWalasAttendanceToExcel({
        selectedClass,
        academicYear,
        selectedSemester,
        activeMonth,
        printType: type,
        semesterMonths,
        classStudents,
        getRecord,
        studentSemesterStats,
        schoolSettings
      });
      showToast(`Rekapitulasi Absensi ${type === 'semester' ? '1 Semester' : `Bulan ${activeMonth}`} berhasil diekspor ke Excel (.xlsx)!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengekspor data ke Excel: ' + err.message, 'error');
    }
  };

  const homeroomClass = classes.find(c => c.is_homeroom_class);
  const isHomeroomTeacher = Boolean(homeroomClass);

  if (!isHomeroomTeacher) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4 animate-fade-in space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-md">
          <GraduationCap size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Fitur Wali Kelas Belum Aktif
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Halaman ini khusus ditampilkan apabila Anda ditugaskan sebagai <strong>Wali Kelas</strong> pada salah satu rombel binaan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer"
        >
          <Settings size={15} />
          <span>Atur Rombel Binaan di Master Data</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 animate-fade-in">

      {/* 1. Filter Control Bar (Mirrors AttendanceView design) */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Filter 1: Pilih Kelas Rombel Binaan Walas */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Filter size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>Kelas Binaan Walas</span>
            </label>
            {homeroomClasses.length > 1 ? (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm"
              >
                {homeroomClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    ⭐ {c.name} ({c.major})
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs">
                <span>⭐ {selectedClass?.name || 'Kelas Binaan'}</span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {selectedClass?.major}
                </span>
              </div>
            )}
          </div>

          {/* Filter 2: Pilih Semester */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>Semester</span>
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm"
            >
              <option value="1">Semester 1 (Ganjil: Jul - Des)</option>
              <option value="2">Semester 2 (Genap: Jan - Jun)</option>
            </select>
          </div>

          {/* Filter 3: Tahun Ajaran */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>Tahun Ajaran</span>
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm text-center"
              placeholder="2026/2027"
            />
          </div>

          {/* Filter 4: Cari Siswa */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Search size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>Pencarian Siswa</span>
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nama / NIS siswa..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm"
              />
            </div>
          </div>

        </div>

        {/* Schedule & Class Meta Summary Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedClass?.name}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedClass?.major}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">T.P {academicYear} ({selectedSemester === '1' ? 'Ganjil' : 'Genap'})</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">{classStudents.length} Siswa Terdaftar</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Wali Kelas:</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
              {schoolSettings?.teacher_name || 'Bapak/Ibu Guru'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Segmented Navigation Tabs (Matching exact desktop navbar pill style) */}
      <div className="flex items-center justify-start overflow-x-auto pb-1 scrollbar-none no-print">
        <nav className="inline-flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
          {[
            { id: 'monthly', label: 'Input Absensi Bulanan', icon: Calendar },
            { id: 'matrix', label: 'Matriks Rekap 1 Semester', icon: FileSpreadsheet },
            { id: 'print', label: 'Cetak Dokumen Resmi', icon: Printer },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeMode === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveMode(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-slate-900/5 dark:shadow-black/20'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  size={15}
                  className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. KPI Status Cards (H, S, I, A, D) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 no-print">
        <div className="glass-card p-3.5 rounded-2xl flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Siswa</p>
            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{classStudents.length} Siswa</h4>
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Hadir (H)</p>
            <h4 className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400">
              {classSummary.totalClassH} Hari
            </h4>
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Sakit (S) / Izin (I)</p>
            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {classSummary.totalClassS} S • {classSummary.totalClassI} I
            </h4>
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Alpa (A)</p>
            <h4 className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">
              {classSummary.totalClassA} Hari
            </h4>
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
            <Award size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Dispensasi (D)</p>
            <h4 className="text-base sm:text-lg font-black text-purple-700 dark:text-purple-300">
              {classSummary.totalClassD} Hari
            </h4>
          </div>
        </div>
      </div>

      {/* Warning Alert Banner for Students with High Alpa */}
      {classSummary.studentsWithWarning.length > 0 && activeMode !== 'print' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-300">
            <AlertTriangle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold">
                Perhatian: Terdapat {classSummary.studentsWithWarning.length} siswa dengan akumulasi Alpa &ge; 3 hari di semester ini:
              </p>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-400/90 mt-0.5">
                {classSummary.studentsWithWarning.map(w => `${w.student.name} (${w.stat.totalA} Alpa)`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('homeroom')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-all self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <span>Tindak Lanjut di Guru Wali / BK</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: INPUT PER BULAN (H, S, I, A, D)                    */}
      {/* ========================================================= */}
      {activeMode === 'monthly' && (
        <div className="space-y-4 no-print">
          
          {/* Month List Choice & Quick Actions Bar */}
          <div className="glass-card p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Compact Month List Choice */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-xs">
                <Calendar size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Pilih Bulan:</span>
                <select
                  value={activeMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-white font-black text-xs sm:text-sm focus:outline-none cursor-pointer pr-1"
                >
                  {semesterMonths.map(month => (
                    <option key={month} value={month} className="dark:bg-slate-900">
                      Bulan {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick helper tools */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs shadow-xs">
                <span className="text-[11px] font-bold text-slate-500">Hari Efektif:</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={effectiveDays}
                  onChange={(e) => setEffectiveDays(Math.max(1, Number(e.target.value) || 22))}
                  className="w-10 text-center font-bold text-xs bg-slate-100 dark:bg-slate-800 rounded px-1 py-0.5 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAutoFillHadir}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                title="Hitung Hadir (H) otomatis = Hari Efektif - (S + I + A + D)"
              >
                <Sparkles size={13} />
                <span>Auto-Hitung (H)</span>
              </button>

              <button
                type="button"
                onClick={handleQuickFillZero}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <CheckCircle2 size={13} />
                <span>Set Default (0)</span>
              </button>
            </div>
          </div>

          {/* Monthly Attendance Input Table with H, S, I, A, D */}
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Daftar Rekap Absensi Siswa — Bulan {activeMonth} ({selectedClass.name})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Masukkan jumlah hari kehadiran dan ketidakhadiran siswa (<strong>H, S, I, A, D</strong>) selama bulan {activeMonth}.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl">
                Otomatis Tersimpan
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3 w-28">NIS</th>
                    <th className="py-3 px-3">Nama Siswa</th>
                    <th className="py-3 px-2 w-12 text-center">L/P</th>
                    
                    {/* H, S, I, A, D Columns */}
                    <th className="py-3 px-2 w-16 text-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-black">
                      Hadir (H)
                    </th>
                    <th className="py-3 px-2 w-16 text-center bg-blue-500/10 text-blue-700 dark:text-blue-300 font-black">
                      Sakit (S)
                    </th>
                    <th className="py-3 px-2 w-16 text-center bg-amber-500/10 text-amber-700 dark:text-amber-300 font-black">
                      Izin (I)
                    </th>
                    <th className="py-3 px-2 w-16 text-center bg-rose-500/10 text-rose-700 dark:text-rose-300 font-black">
                      Alpa (A)
                    </th>
                    <th className="py-3 px-2 w-16 text-center bg-purple-500/10 text-purple-700 dark:text-purple-300 font-black">
                      Dispensasi (D)
                    </th>

                    <th className="py-3 px-2 w-20 text-center font-black">
                      Total Hari
                    </th>
                    <th className="py-3 px-2 w-16 text-center font-black text-emerald-700 dark:text-emerald-400">
                      % Hadir
                    </th>
                    <th className="py-3 px-3 min-w-[200px]">Catatan / Keterangan Wali Kelas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {classStudents.map((st, idx) => {
                    const record = getRecord(st.id, activeMonth);
                    const h = Number(record.h) || 0;
                    const s = Number(record.s) || 0;
                    const i = Number(record.i) || 0;
                    const a = Number(record.a) || 0;
                    const d = Number(record.d) || 0;
                    const totalHari = h + s + i + a + d;
                    const pctHadir = totalHari > 0 ? Math.round(((h + d) / totalHari) * 100) : (h > 0 ? 100 : 0);
                    const hasHighAlpa = a >= 3;

                    return (
                      <tr
                        key={st.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors ${
                          hasHighAlpa ? 'bg-rose-500/5' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-600 dark:text-slate-400">{st.nis}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-extrabold text-slate-900 dark:text-white">{st.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{st.nisn ? `NISN: ${st.nisn}` : ''}</div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-600 dark:text-slate-400">
                          {st.gender || 'L'}
                        </td>

                        {/* 1. Hadir (H) */}
                        <td className="py-2 px-1 text-center bg-emerald-500/5">
                          <input
                            type="number"
                            min="0"
                            value={record.h ?? 0}
                            onChange={(e) => handleInputChange(st.id, 'h', e.target.value)}
                            className="w-13 text-center py-1 rounded-lg border border-emerald-300 dark:border-emerald-900/60 bg-white dark:bg-slate-950 font-bold text-xs text-emerald-700 dark:text-emerald-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>

                        {/* 2. Sakit (S) */}
                        <td className="py-2 px-1 text-center bg-blue-500/5">
                          <input
                            type="number"
                            min="0"
                            value={record.s ?? 0}
                            onChange={(e) => handleInputChange(st.id, 's', e.target.value)}
                            className="w-13 text-center py-1 rounded-lg border border-blue-300 dark:border-blue-900/60 bg-white dark:bg-slate-950 font-bold text-xs text-blue-700 dark:text-blue-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </td>

                        {/* 3. Izin (I) */}
                        <td className="py-2 px-1 text-center bg-amber-500/5">
                          <input
                            type="number"
                            min="0"
                            value={record.i ?? 0}
                            onChange={(e) => handleInputChange(st.id, 'i', e.target.value)}
                            className="w-13 text-center py-1 rounded-lg border border-amber-300 dark:border-amber-900/60 bg-white dark:bg-slate-950 font-bold text-xs text-amber-700 dark:text-amber-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                        </td>

                        {/* 4. Alpa (A) */}
                        <td className="py-2 px-1 text-center bg-rose-500/5">
                          <input
                            type="number"
                            min="0"
                            value={record.a ?? 0}
                            onChange={(e) => handleInputChange(st.id, 'a', e.target.value)}
                            className={`w-13 text-center py-1 rounded-lg border font-bold text-xs focus:outline-none focus:ring-1 ${
                              Number(record.a) > 0
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 focus:border-rose-500 focus:ring-rose-500'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:border-slate-500'
                            }`}
                          />
                        </td>

                        {/* 5. Dispensasi (D) */}
                        <td className="py-2 px-1 text-center bg-purple-500/5">
                          <input
                            type="number"
                            min="0"
                            value={record.d ?? 0}
                            onChange={(e) => handleInputChange(st.id, 'd', e.target.value)}
                            className="w-13 text-center py-1 rounded-lg border border-purple-300 dark:border-purple-900/60 bg-white dark:bg-slate-950 font-bold text-xs text-purple-700 dark:text-purple-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          />
                        </td>

                        {/* Total Hari */}
                        <td className="py-2.5 px-2 text-center font-bold text-slate-700 dark:text-slate-300">
                          {totalHari} Hari
                        </td>

                        {/* % Hadir */}
                        <td className="py-2.5 px-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-lg font-black text-xs ${
                              pctHadir >= 90
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : pctHadir >= 75
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {pctHadir}%
                          </span>
                        </td>

                        {/* Catatan / Keterangan */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={record.notes || ''}
                            onChange={(e) => handleInputChange(st.id, 'notes', e.target.value)}
                            placeholder="Catatan surat dokter, dispensasi OSIS/lomba..."
                            className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MATRIKS REKAP 1 SEMESTER (H, S, I, A, D)           */}
      {/* ========================================================= */}
      {activeMode === 'matrix' && (
        <div className="space-y-4 no-print">
          <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Matriks Rekapitulasi Absensi 1 Semester ({selectedSemester === '1' ? 'Semester Ganjil' : 'Semester Genap'})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rangkuman kehadiran 6 bulan ({semesterMonths.join(', ')}) per siswa beserta akumulasi kolom <strong>H, S, I, A, D</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportWalasExcel('semester')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  title="Ekspor matriks absensi semester ke format Microsoft Excel (.xlsx)"
                >
                  <FileSpreadsheet size={14} />
                  <span>Export to XLSX</span>
                </button>
                <button
                  onClick={() => setActiveMode('print')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Cetak Dokumen Leger Absensi</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-center border-b border-slate-300 dark:border-slate-700">
                    <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 w-8">No</th>
                    <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 w-24">NIS</th>
                    <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-left min-w-[160px]">Nama Siswa</th>
                    <th rowSpan={2} className="py-2.5 px-1 border-r border-slate-300 dark:border-slate-700 w-8">L/P</th>

                    {/* Month Headers (H, S, I, A, D) */}
                    {semesterMonths.map(m => (
                      <th key={m} colSpan={5} className="py-1.5 px-1 border-r border-slate-300 dark:border-slate-700 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300">
                        {m}
                      </th>
                    ))}

                    {/* Total Semester Headers */}
                    <th colSpan={6} className="py-1.5 px-2 bg-indigo-500/10 text-indigo-900 dark:text-indigo-300">
                      Total 1 Semester
                    </th>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] font-bold text-center border-b border-slate-300 dark:border-slate-700">
                    {semesterMonths.map(m => (
                      <React.Fragment key={m}>
                        <th className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-800 text-emerald-600 w-6">H</th>
                        <th className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-800 text-blue-600 w-6">S</th>
                        <th className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-800 text-amber-600 w-6">I</th>
                        <th className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-800 text-rose-600 w-6">A</th>
                        <th className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-800 text-purple-600 w-6">D</th>
                      </React.Fragment>
                    ))}
                    <th className="py-1 px-1 border-r border-slate-300 dark:border-slate-800 text-emerald-700 font-black w-8">H</th>
                    <th className="py-1 px-1 border-r border-slate-300 dark:border-slate-800 text-blue-700 font-black w-8">S</th>
                    <th className="py-1 px-1 border-r border-slate-300 dark:border-slate-800 text-amber-700 font-black w-8">I</th>
                    <th className="py-1 px-1 border-r border-slate-300 dark:border-slate-800 text-rose-700 font-black w-8">A</th>
                    <th className="py-1 px-1 border-r border-slate-300 dark:border-slate-800 text-purple-700 font-black w-8">D</th>
                    <th className="py-1 px-1 font-black bg-indigo-500/15 text-indigo-900 dark:text-indigo-300 w-12">% Hadir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {classStudents.map((st, idx) => {
                    const stStat = studentSemesterStats[st.id] || { totalH: 0, totalS: 0, totalI: 0, totalA: 0, totalD: 0, totalAbsen: 0, percentHadir: 100 };
                    return (
                      <tr key={st.id} className="text-center text-[11px] hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="py-1.5 px-1 border-r border-slate-200 dark:border-slate-800 text-slate-500">{idx + 1}</td>
                        <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 font-mono">{st.nis}</td>
                        <td className="py-1.5 px-3 border-r border-slate-200 dark:border-slate-800 text-left font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                          {st.name}
                        </td>
                        <td className="py-1.5 px-1 border-r border-slate-200 dark:border-slate-800 font-semibold">{st.gender || 'L'}</td>

                        {/* Month H, S, I, A, D Cells */}
                        {semesterMonths.map(m => {
                          const r = getRecord(st.id, m);
                          return (
                            <React.Fragment key={m}>
                              <td className="py-1 px-0.5 border-r border-slate-200 dark:border-slate-800 text-emerald-700 font-semibold">
                                {r.h > 0 ? r.h : '-'}
                              </td>
                              <td className="py-1 px-0.5 border-r border-slate-200 dark:border-slate-800 text-blue-600 font-semibold">
                                {r.s > 0 ? r.s : '-'}
                              </td>
                              <td className="py-1 px-0.5 border-r border-slate-200 dark:border-slate-800 text-amber-600 font-semibold">
                                {r.i > 0 ? r.i : '-'}
                              </td>
                              <td className={`py-1 px-0.5 border-r border-slate-200 dark:border-slate-800 font-bold ${r.a > 0 ? 'text-rose-600 bg-rose-500/10' : 'text-slate-400'}`}>
                                {r.a > 0 ? r.a : '-'}
                              </td>
                              <td className="py-1 px-0.5 border-r border-slate-200 dark:border-slate-800 text-purple-600 font-semibold">
                                {r.d > 0 ? r.d : '-'}
                              </td>
                            </React.Fragment>
                          );
                        })}

                        {/* Semester Aggregates (H, S, I, A, D) */}
                        <td className="py-1 px-1 border-r border-slate-200 dark:border-slate-800 font-black text-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20">
                          {stStat.totalH}
                        </td>
                        <td className="py-1 px-1 border-r border-slate-200 dark:border-slate-800 font-black text-blue-700 bg-blue-50/50 dark:bg-blue-950/20">
                          {stStat.totalS}
                        </td>
                        <td className="py-1 px-1 border-r border-slate-200 dark:border-slate-800 font-black text-amber-700 bg-amber-50/50 dark:bg-amber-950/20">
                          {stStat.totalI}
                        </td>
                        <td className={`py-1 px-1 border-r border-slate-200 dark:border-slate-800 font-black ${stStat.totalA >= 3 ? 'text-rose-600 bg-rose-100 dark:bg-rose-950/50' : 'text-rose-700 bg-rose-50/50'}`}>
                          {stStat.totalA}
                        </td>
                        <td className="py-1 px-1 border-r border-slate-200 dark:border-slate-800 font-black text-purple-700 bg-purple-50/50 dark:bg-purple-950/20">
                          {stStat.totalD}
                        </td>
                        <td className="py-1 px-1 font-black bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300">
                          {stStat.percentHadir}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CETAK REKAPITULASI (PRINT VIEW)                    */}
      {/* ========================================================= */}
      {activeMode === 'print' && (
        <div className="space-y-6">
          
          {/* Print Toolbar (Hidden during print) */}
          <div className="glass-card p-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-600 text-white">
                <Printer size={18} />
              </span>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Pratinjau Cetak Dokumen Rekapitulasi Wali Kelas
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dokumen siap cetak format resmi (Kolom <strong>H, S, I, A, D</strong>) standar dinas pendidikan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setPrintType('semester')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    printType === 'semester' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Rekap 1 Semester Penuh
                </button>
                <button
                  type="button"
                  onClick={() => setPrintType('month')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    printType === 'month' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Rekap Bulan {activeMonth}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleExportWalasExcel()}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Ekspor dokumen rekap absensi ke format Microsoft Excel (.xlsx)"
              >
                <FileSpreadsheet size={15} />
                <span>Export to XLSX</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={15} />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>

          {/* Printable White Sheet Canvas */}
          <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 select-text overflow-x-auto print:p-0 print:shadow-none print:border-none print:m-0">
            
            <KopSurat
              title={printType === 'semester' ? 'REKAPITULASI ABSENSI BULANAN SISWA (WALI KELAS)' : `REKAPITULASI ABSENSI SISWA BULAN ${activeMonth.toUpperCase()}`}
              subtitle={`Tahun Pelajaran ${academicYear} — ${selectedSemester === '1' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)'}`}
            />

            {/* Document Meta Info */}
            <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-slate-400 my-2">
              <div>
                <p><strong>Kelas / Rombel:</strong> {selectedClass.name} ({selectedClass.major})</p>
                <p><strong>Wali Kelas:</strong> {schoolSettings?.teacher_name || 'Nama Wali Kelas'}</p>
                <p><strong>NIP:</strong> {schoolSettings?.teacher_nip || '-'}</p>
              </div>
              <div className="text-right">
                <p><strong>Tahun Pelajaran:</strong> {academicYear}</p>
                <p><strong>Semester:</strong> {selectedSemester === '1' ? '1 (Ganjil)' : '2 (Genap)'}</p>
                <p><strong>Jumlah Siswa:</strong> {classStudents.length} Orang ({classStudents.filter(s => s.gender === 'L').length} L / {classStudents.filter(s => s.gender === 'P').length} P)</p>
              </div>
            </div>

            {/* Print Table Option 1: Semester Matrix (H, S, I, A, D) */}
            {printType === 'semester' ? (
              <table className="w-full text-left text-xs border border-slate-400 border-collapse my-3">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold text-center border-b border-slate-400 text-[10px]">
                    <th rowSpan={2} className="py-2 px-1 border-r border-slate-400 w-7">No</th>
                    <th rowSpan={2} className="py-2 px-2 border-r border-slate-400 w-20">NIS</th>
                    <th rowSpan={2} className="py-2 px-2 border-r border-slate-400 text-left min-w-[140px]">Nama Siswa</th>
                    <th rowSpan={2} className="py-2 px-1 border-r border-slate-400 w-7">L/P</th>
                    {semesterMonths.map(m => (
                      <th key={m} colSpan={5} className="py-1 px-1 border-r border-slate-400">
                        {m}
                      </th>
                    ))}
                    <th colSpan={6} className="py-1 px-1 bg-slate-200">Total 1 Semester</th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-800 text-[8px] font-bold text-center border-b border-slate-400">
                    {semesterMonths.map(m => (
                      <React.Fragment key={m}>
                        <th className="py-1 px-0.5 border-r border-slate-400 w-4">H</th>
                        <th className="py-1 px-0.5 border-r border-slate-400 w-4">S</th>
                        <th className="py-1 px-0.5 border-r border-slate-400 w-4">I</th>
                        <th className="py-1 px-0.5 border-r border-slate-400 w-4">A</th>
                        <th className="py-1 px-0.5 border-r border-slate-400 w-4">D</th>
                      </React.Fragment>
                    ))}
                    <th className="py-1 px-0.5 border-r border-slate-400 w-5">H</th>
                    <th className="py-1 px-0.5 border-r border-slate-400 w-5">S</th>
                    <th className="py-1 px-0.5 border-r border-slate-400 w-5">I</th>
                    <th className="py-1 px-0.5 border-r border-slate-400 w-5">A</th>
                    <th className="py-1 px-0.5 border-r border-slate-400 w-5">D</th>
                    <th className="py-1 px-1 w-8">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {classStudents.map((st, i) => {
                    const stStat = studentSemesterStats[st.id] || { totalH: 0, totalS: 0, totalI: 0, totalA: 0, totalD: 0, totalAbsen: 0, percentHadir: 100 };
                    return (
                      <tr key={st.id} className="text-center text-[9px]">
                        <td className="py-1 px-1 border-r border-slate-300">{i + 1}</td>
                        <td className="py-1 px-1 border-r border-slate-300 font-mono">{st.nis}</td>
                        <td className="py-1 px-2 border-r border-slate-300 text-left font-bold">{st.name}</td>
                        <td className="py-1 px-1 border-r border-slate-300">{st.gender || 'L'}</td>
                        {semesterMonths.map(m => {
                          const r = getRecord(st.id, m);
                          return (
                            <React.Fragment key={m}>
                              <td className="py-1 px-0.5 border-r border-slate-300 font-semibold">{r.h > 0 ? r.h : '-'}</td>
                              <td className="py-1 px-0.5 border-r border-slate-300">{r.s > 0 ? r.s : '-'}</td>
                              <td className="py-1 px-0.5 border-r border-slate-300">{r.i > 0 ? r.i : '-'}</td>
                              <td className="py-1 px-0.5 border-r border-slate-300 font-bold">{r.a > 0 ? r.a : '-'}</td>
                              <td className="py-1 px-0.5 border-r border-slate-300">{r.d > 0 ? r.d : '-'}</td>
                            </React.Fragment>
                          );
                        })}
                        <td className="py-1 px-0.5 border-r border-slate-300 font-bold">{stStat.totalH}</td>
                        <td className="py-1 px-0.5 border-r border-slate-300 font-bold">{stStat.totalS}</td>
                        <td className="py-1 px-0.5 border-r border-slate-300 font-bold">{stStat.totalI}</td>
                        <td className="py-1 px-0.5 border-r border-slate-300 font-bold text-rose-700">{stStat.totalA}</td>
                        <td className="py-1 px-0.5 border-r border-slate-300 font-bold">{stStat.totalD}</td>
                        <td className="py-1 px-1 font-bold bg-slate-100">{stStat.percentHadir}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* Print Table Option 2: Monthly List (H, S, I, A, D) */
              <table className="w-full text-left text-xs border border-slate-400 border-collapse my-3">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 text-center text-[11px]">
                    <th className="py-2 px-2 border-r border-slate-400 w-10">No</th>
                    <th className="py-2 px-3 border-r border-slate-400 w-28">NIS</th>
                    <th className="py-2 px-3 border-r border-slate-400 text-left">Nama Siswa</th>
                    <th className="py-2 px-2 border-r border-slate-400 w-12">L/P</th>
                    <th className="py-2 px-2 border-r border-slate-400 w-14">Hadir (H)</th>
                    <th className="py-2 px-2 border-r border-slate-400 w-14">Sakit (S)</th>
                    <th className="py-2 px-2 border-r border-slate-400 w-14">Izin (I)</th>
                    <th className="py-2 px-2 border-r border-slate-400 w-14">Alpa (A)</th>
                    <th className="py-2 px-2 border-r border-slate-400 w-16">Dispensasi (D)</th>
                    <th className="py-2 px-2 border-r border-slate-400 w-16">% Hadir</th>
                    <th className="py-2 px-3">Keterangan / Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {classStudents.map((st, i) => {
                    const r = getRecord(st.id, activeMonth);
                    const h = Number(r.h) || 0;
                    const s = Number(r.s) || 0;
                    const iVal = Number(r.i) || 0;
                    const a = Number(r.a) || 0;
                    const d = Number(r.d) || 0;
                    const tot = h + s + iVal + a + d;
                    const pct = tot > 0 ? Math.round(((h + d) / tot) * 100) : (h > 0 ? 100 : 0);

                    return (
                      <tr key={st.id} className="text-center text-[11px]">
                        <td className="py-1.5 px-2 border-r border-slate-300">{i + 1}</td>
                        <td className="py-1.5 px-3 border-r border-slate-300 font-mono">{st.nis}</td>
                        <td className="py-1.5 px-3 border-r border-slate-300 text-left font-bold">{st.name}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">{st.gender || 'L'}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 font-bold text-emerald-800">{h}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">{s}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">{iVal}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 font-bold text-rose-700">{a}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">{d}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 font-bold bg-slate-100">{pct}%</td>
                        <td className="py-1.5 px-3 text-left text-slate-700 text-[10px]">{r.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Formal Signature Block */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs break-inside-avoid">
              <div>
                <p>Mengetahui,</p>
                <p>Kepala Sekolah</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{schoolSettings?.principal_name || 'Nama Kepala Sekolah'}</p>
                <p>NIP. {schoolSettings?.principal_nip || '-'}</p>
              </div>
              <div>
                <p>{schoolSettings?.address?.split(',')[0] || 'Jakarta'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Wali Kelas {selectedClass.name},</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{schoolSettings?.teacher_name || 'Nama Wali Kelas'}</p>
                <p>NIP. {schoolSettings?.teacher_nip || '-'}</p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

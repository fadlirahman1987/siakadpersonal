import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ModalDrawer } from '../components/common/ModalDrawer';
import { KopSurat } from '../components/common/KopSurat';
import {
  Calendar,
  Clock,
  CheckCheck,
  BookOpen,
  Send,
  User,
  CheckCircle,
  FileText,
  AlertTriangle,
  History,
  Sparkles,
  Search,
  CheckCircle2,
  Printer,
  ChevronRight,
  Plus,
  BarChart3,
  Award,
  Download,
  Edit2,
  Edit3,
  SlidersHorizontal,
  TrendingUp,
  FileSpreadsheet,
  GraduationCap,
  Save,
  Percent,
  Check,
  XCircle,
  Trash2,
  Settings2,
  RotateCcw,
  HelpCircle,
  Info,
  PlusCircle,
  Layers,
  Filter,
  X
} from 'lucide-react';

export const AttendanceView = () => {
  const {
    schedules,
    classes,
    subjects,
    students,
    selectedScheduleId,
    setSelectedScheduleId,
    selectedDate,
    setSelectedDate,
    attendanceRecords,
    updateAttendanceStatus,
    setAllPresent,
    updateKbmStatus,
    grades,
    kkm,
    updateKkm,
    updateStudentGrade,
    assessmentConfig,
    updateAssessmentConfig,
    addAssessmentCategory,
    updateAssessmentCategory,
    deleteAssessmentCategory,
    addAssessmentColumn,
    updateAssessmentColumn,
    deleteAssessmentColumn,
    resetAssessmentConfig,
    applyAssessmentPreset,
    calculateStudentGrade,
    teachingJournals,
    saveTeachingJournal,
    updateTeachingJournal,
    deleteTeachingJournal,
    schoolSettings,
    showToast
  } = useApp();

  // Mode View: 'attendance' (Presensi) | 'grades' (Rekap Nilai) | 'journal' (Form Jurnal KBM) | 'journal-history' (Riwayat Jurnal)
  const [activeSubTab, setActiveSubTab] = useState('attendance');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Class & Subject filters
  const initialSchedule = schedules.find(s => s.id === selectedScheduleId) || schedules[0];
  const [selectedClassId, setSelectedClassId] = useState(initialSchedule?.class_id || classes[0]?.id || 1);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSchedule?.subject_id || subjects[0]?.id || 1);
  
  // Journal Edit State
  const [editingJournalId, setEditingJournalId] = useState(null);

  // Journal History Search & Filters
  const [historyFilterClass, setHistoryFilterClass] = useState('all');
  const [historyFilterSubject, setHistoryFilterSubject] = useState('all');
  const [historySearch, setHistorySearch] = useState('');
  
  // Printing Modals State
  const [isPrintAttendanceModalOpen, setIsPrintAttendanceModalOpen] = useState(false);
  const [isPrintAllAttendanceModalOpen, setIsPrintAllAttendanceModalOpen] = useState(false);
  const [isPrintLegerModalOpen, setIsPrintLegerModalOpen] = useState(false);
  const [isPrintAllJournalsModalOpen, setIsPrintAllJournalsModalOpen] = useState(false);
  const [selectedJournalForPrint, setSelectedJournalForPrint] = useState(null);

  // Grade Edit Drawer & Assessment Modal State
  const [selectedStudentForEditGrade, setSelectedStudentForEditGrade] = useState(null);
  const [isKkmEditOpen, setIsKkmEditOpen] = useState(false);
  const [tempKkm, setTempKkm] = useState(kkm || 75);
  const [isAssessmentConfigModalOpen, setIsAssessmentConfigModalOpen] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({ name: '', shortName: '', weight: 20 });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newColumnInputs, setNewColumnInputs] = useState({});

  // Synchronize when selectedScheduleId changes from outside (e.g. Dashboard)
  useEffect(() => {
    if (selectedScheduleId) {
      const sch = schedules.find(s => s.id === selectedScheduleId);
      if (sch) {
        setSelectedClassId(sch.class_id);
        setSelectedSubjectId(sch.subject_id);
      }
    }
  }, [selectedScheduleId, schedules]);

  // Active class and subject derived from filters
  const activeClass = classes.find(c => c.id === Number(selectedClassId)) || classes[0];
  const activeSubject = subjects.find(s => s.id === Number(selectedSubjectId)) || subjects[0];
  
  // Active schedule details based on Class & Subject
  const activeSchedule = schedules.find(s => s.class_id === activeClass?.id && s.subject_id === activeSubject?.id) || schedules.find(s => s.id === selectedScheduleId) || {
    id: selectedScheduleId || 1,
    class_id: activeClass?.id,
    subject_id: activeSubject?.id,
    day_name: 'Senin',
    start_time: '07:30',
    end_time: '10:00',
    room: 'Lab / Ruang Kelas'
  };

  // Filter change handlers
  const handleClassFilterChange = (classId) => {
    const cid = Number(classId);
    setSelectedClassId(cid);
    const matchingSchedule = schedules.find(s => s.class_id === cid && s.subject_id === Number(selectedSubjectId));
    if (matchingSchedule) {
      setSelectedScheduleId(matchingSchedule.id);
    } else {
      const anyForClass = schedules.find(s => s.class_id === cid);
      if (anyForClass) {
        setSelectedSubjectId(anyForClass.subject_id);
        setSelectedScheduleId(anyForClass.id);
      }
    }
  };

  const handleSubjectFilterChange = (subjectId) => {
    const sid = Number(subjectId);
    setSelectedSubjectId(sid);
    const matchingSchedule = schedules.find(s => s.class_id === Number(selectedClassId) && s.subject_id === sid);
    if (matchingSchedule) {
      setSelectedScheduleId(matchingSchedule.id);
    }
  };
  
  // Students in active class
  const classStudents = students.filter(s => s.class_id === activeClass?.id);
  const filteredStudents = classStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nis.includes(searchQuery)
  );

  // Grades Key: `${class_id}_${subject_id}`
  const gradeKey = `${activeClass?.id}_${activeSubject?.id}`;
  const currentClassGrades = grades[gradeKey] || {};

  // Total weight configured
  const totalConfiguredWeight = (assessmentConfig || []).reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

  // Attendance records for active schedule & date
  const sessionKey = `${activeSchedule?.id}_${selectedDate}`;
  const currentSession = attendanceRecords[sessionKey] || {
    schedule_id: activeSchedule?.id,
    date: selectedDate,
    kbm_status: 'Tatap Muka',
    records: {}
  };

  // Find existing journal for this session
  const existingJournal = teachingJournals.find(
    j => (editingJournalId && j.id === editingJournalId) || (j.schedule_id === activeSchedule?.id && j.date === selectedDate)
  );

  const [journalForm, setJournalForm] = useState({
    topic_material: existingJournal?.topic_material || '',
    learning_objectives: existingJournal?.learning_objectives || '',
    teaching_activities: existingJournal?.teaching_activities || '',
    obstacles_and_solutions: existingJournal?.obstacles_and_solutions || '',
    kbm_status: existingJournal?.kbm_status || currentSession.kbm_status || 'Tatap Muka'
  });

  // Sync form when schedule or date or editingJournalId changes
  useEffect(() => {
    const found = teachingJournals.find(
      j => (editingJournalId && j.id === editingJournalId) || (j.schedule_id === activeSchedule?.id && j.date === selectedDate)
    );
    if (found) {
      setJournalForm({
        topic_material: found.topic_material || '',
        learning_objectives: found.learning_objectives || '',
        teaching_activities: found.teaching_activities || '',
        obstacles_and_solutions: found.obstacles_and_solutions || '',
        kbm_status: found.kbm_status || 'Tatap Muka'
      });
    } else {
      setJournalForm({
        topic_material: '',
        learning_objectives: '',
        teaching_activities: '',
        obstacles_and_solutions: '',
        kbm_status: currentSession.kbm_status || 'Tatap Muka'
      });
    }
  }, [activeSchedule?.id, selectedDate, editingJournalId, teachingJournals]);

  // Attendance Status Summary Counts
  const attendanceCounts = { H: 0, S: 0, I: 0, D: 0, A: 0 };
  classStudents.forEach(s => {
    const st = currentSession.records[s.id] || 'A';
    if (attendanceCounts[st] !== undefined) attendanceCounts[st]++;
  });

  const attendanceRate = classStudents.length > 0 
    ? Math.round((attendanceCounts.H / classStudents.length) * 100) 
    : 0;

  const handleStatusClick = (studentId, status) => {
    updateAttendanceStatus(activeSchedule.id, selectedDate, studentId, status);
  };

  // Explicit Save Feedback Handlers
  const handleSaveAttendance = () => {
    showToast(`Data Presensi Kelas ${activeClass?.name || 'Kelas'} (${activeSubject?.name || 'Mapel'}) tanggal ${selectedDate} tersimpan dengan sukses!`, 'success');
  };

  const handleSaveAllGrades = () => {
    showToast(`Seluruh Rekap Nilai Siswa Kelas ${activeClass?.name || 'Kelas'} (${activeSubject?.name || 'Mapel'}) berhasil disimpan!`, 'success');
  };

  // Cumulative Attendance Calculation for "Cetak Semua Rekap Absensi"
  const classScheduleIds = (schedules || []).filter(s => s.class_id === activeClass?.id).map(s => s.id);
  
  const classRecordedSessions = Object.entries(attendanceRecords || {})
    .filter(([key, session]) => {
      const schId = session?.schedule_id || Number(key.split('_')[0]);
      return classScheduleIds.includes(schId) || schId === activeSchedule?.id;
    })
    .map(([, session]) => session)
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  const allRecordedDates = Array.from(new Set([
    ...classRecordedSessions.map(s => s.date),
    selectedDate
  ])).filter(Boolean).sort();

  const studentCumulativeAttendance = classStudents.map((st) => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let dispensasi = 0;
    let alpa = 0;

    allRecordedDates.forEach(d => {
      const matchSession = classRecordedSessions.find(s => s.date === d) || (d === selectedDate ? currentSession : null);
      const code = matchSession?.records?.[st.id] || (d === selectedDate ? (currentSession.records[st.id] || 'A') : 'A');
      if (code === 'H') hadir++;
      else if (code === 'S') sakit++;
      else if (code === 'I') izin++;
      else if (code === 'D') dispensasi++;
      else if (code === 'A') alpa++;
    });

    const totalSesi = allRecordedDates.length || 1;
    const persentase = Math.round(((hadir + dispensasi) / totalSesi) * 100);

    let predikat = 'Sangat Baik';
    let predikatCode = 'SB';
    if (persentase < 75) {
      predikat = 'Perlu Pembinaan';
      predikatCode = 'PP';
    } else if (persentase < 85) {
      predikat = 'Cukup';
      predikatCode = 'C';
    } else if (persentase < 90) {
      predikat = 'Baik';
      predikatCode = 'B';
    }

    return {
      student: st,
      hadir,
      sakit,
      izin,
      dispensasi,
      alpa,
      totalSesi,
      persentase,
      predikat,
      predikatCode
    };
  });

  const cumulativeClassRate = studentCumulativeAttendance.length > 0
    ? Math.round(studentCumulativeAttendance.reduce((sum, s) => sum + s.persentase, 0) / studentCumulativeAttendance.length)
    : 100;

  // Export CSV Rekapitulasi Absensi Semester
  const exportAttendanceRecapToCSV = () => {
    const headers = ['No', 'NIS', 'Nama Siswa', 'L/P'];
    allRecordedDates.forEach(d => {
      headers.push(`"Tgl ${d}"`);
    });
    headers.push('"Total Hadir (H)"', '"Total Sakit (S)"', '"Total Izin (I)"', '"Total Dispensasi (D)"', '"Total Alpa (A)"', '"Total Sesi KBM"', '"Persentase Kehadiran (%)"', '"Predikat"');

    const rows = studentCumulativeAttendance.map((item, idx) => {
      const row = [
        idx + 1,
        `"${item.student.nis}"`,
        `"${item.student.name}"`,
        `"${item.student.gender}"`
      ];

      allRecordedDates.forEach(d => {
        const matchSession = classRecordedSessions.find(s => s.date === d) || (d === selectedDate ? currentSession : null);
        const code = matchSession?.records?.[item.student.id] || (d === selectedDate ? (currentSession.records[item.student.id] || 'A') : 'A');
        row.push(`"${code}"`);
      });

      row.push(
        item.hadir,
        item.sakit,
        item.izin,
        item.dispensasi,
        item.alpa,
        item.totalSesi,
        `"${item.persentase}%"`,
        `"${item.predikat}"`
      );

      return row;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Absensi_Semester_${activeClass?.name || 'Kelas'}_${activeSubject?.name || 'Mapel'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Rekapitulasi Absensi 1 Semester berhasil diekspor ke CSV!', 'success');
  };

  const handleSaveJournal = (e) => {
    e.preventDefault();
    if (!journalForm.topic_material.trim()) {
      showToast('Topik / materi pembelajaran wajib diisi!', 'error');
      return;
    }

    if (editingJournalId) {
      updateTeachingJournal(editingJournalId, {
        schedule_id: activeSchedule.id,
        date: selectedDate,
        ...journalForm
      });
      setEditingJournalId(null);
    } else {
      saveTeachingJournal({
        schedule_id: activeSchedule.id,
        date: selectedDate,
        ...journalForm
      });
    }

    updateKbmStatus(activeSchedule.id, selectedDate, journalForm.kbm_status);
  };

  const handleEditJournalFromHistory = (journal) => {
    const sch = schedules.find(s => s.id === journal.schedule_id);
    if (sch) {
      setSelectedClassId(sch.class_id);
      setSelectedSubjectId(sch.subject_id);
      setSelectedScheduleId(sch.id);
    }
    setSelectedDate(journal.date);
    setEditingJournalId(journal.id);
    setJournalForm({
      topic_material: journal.topic_material || '',
      learning_objectives: journal.learning_objectives || '',
      teaching_activities: journal.teaching_activities || '',
      obstacles_and_solutions: journal.obstacles_and_solutions || '',
      kbm_status: journal.kbm_status || 'Tatap Muka'
    });
    setActiveSubTab('journal');
    showToast(`Memuat jurnal tanggal ${journal.date} ke editor. Silakan sunting dan simpan.`, 'info');
  };

  const handleDeleteJournalItem = (journal) => {
    if (window.confirm(`Yakin ingin menghapus catatan jurnal tanggal "${journal.date}" (${journal.topic_material})?`)) {
      deleteTeachingJournal(journal.id);
      if (editingJournalId === journal.id) {
        setEditingJournalId(null);
      }
    }
  };

  // Grade Calculations Helper
  const calculateFinalGrade = (studentGrade, kkmValue = (kkm || 75)) => {
    return calculateStudentGrade(studentGrade, kkmValue, assessmentConfig);
  };

  // Grade Summary Analytics for the whole class
  const gradeAnalytics = (() => {
    if (classStudents.length === 0) {
      return { avgClassNA: 0, highestNA: 0, lowestNA: 0, passedCount: 0, remedialCount: 0, passRate: 0 };
    }

    let totalNA = 0;
    let highestNA = 0;
    let lowestNA = 100;
    let passedCount = 0;
    let remedialCount = 0;

    classStudents.forEach(st => {
      const stGrade = currentClassGrades[st.id] || {};
      const { na, isTuntas } = calculateFinalGrade(stGrade, kkm);
      totalNA += na;
      if (na > highestNA) highestNA = na;
      if (na < lowestNA) lowestNA = na;
      if (isTuntas) passedCount++;
      else remedialCount++;
    });

    const avgClassNA = Math.round(totalNA / classStudents.length);
    const passRate = Math.round((passedCount / classStudents.length) * 100);

    return {
      avgClassNA,
      highestNA: highestNA || 0,
      lowestNA: lowestNA === 100 && classStudents.length === 0 ? 0 : lowestNA,
      passedCount,
      remedialCount,
      passRate
    };
  })();

  // Export CSV Leger Nilai (Dynamic columns & categories)
  const exportGradesToCSV = () => {
    const headers = ['No', 'NIS', 'Nama Siswa'];
    (assessmentConfig || []).forEach(cat => {
      (cat.columns || []).forEach(col => {
        headers.push(`"${col.label} (${cat.shortName || cat.name})"`);
      });
      headers.push(`"Rata-rata ${cat.shortName || cat.name} (${cat.weight}%)"`);
    });
    headers.push('"Nilai Akhir (NA)"', '"Predikat"', '"Status"');

    const rows = classStudents.map((st, idx) => {
      const stGrade = currentClassGrades[st.id] || {};
      const res = calculateFinalGrade(stGrade, kkm);
      const row = [
        idx + 1,
        `"${st.nis}"`,
        `"${st.name}"`
      ];
      (assessmentConfig || []).forEach(cat => {
        (cat.columns || []).forEach(col => {
          row.push(stGrade[col.id] ?? 0);
        });
        row.push(res.categoryAverages?.[cat.id] ?? 0);
      });
      row.push(res.na, `"${res.predikat}"`, `"${res.isTuntas ? 'Tuntas' : 'Remedial'}"`);
      return row;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leger_Nilai_${activeClass?.name || 'Kelas'}_${activeSubject?.name || 'Mapel'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leger Nilai berhasil diekspor ke CSV!', 'success');
  };

  // 5 Status definitions for Attendance
  const statusConfig = [
    { key: 'H', label: 'Hadir', activeClass: 'bg-emerald-600 text-white shadow-emerald-600/30' },
    { key: 'S', label: 'Sakit', activeClass: 'bg-blue-600 text-white shadow-blue-600/30' },
    { key: 'I', label: 'Izin', activeClass: 'bg-amber-600 text-white shadow-amber-600/30' },
    { key: 'D', label: 'Dispensasi', activeClass: 'bg-purple-600 text-white shadow-purple-600/30' },
    { key: 'A', label: 'Alpa', activeClass: 'bg-rose-600 text-white shadow-rose-600/30' }
  ];

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      
      {/* 1. Class, Subject & Date Filter Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Filter 1: Kelas / Rombel */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Filter size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>Filter Kelas / Rombel</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassFilterChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.major})
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Mata Pelajaran */}
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <BookOpen size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>Filter Mata Pelajaran</span>
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectFilterChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Tanggal KBM */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>Tanggal KBM</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm"
            />
          </div>

        </div>

        {/* Schedule Info Summary Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeClass?.name}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{activeSubject?.name}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">{activeSchedule?.start_time} - {activeSchedule?.end_time} WIB</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">{classStudents.length} Siswa Terdaftar</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Status KBM:</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
              {journalForm.kbm_status || currentSession.kbm_status || 'Tatap Muka'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Segmented Tabs: Presensi vs Rekap Absensi Semester vs Rekap Nilai vs Form Jurnal KBM vs Riwayat Jurnal */}
      <div className="flex items-center justify-start overflow-x-auto pb-1 scrollbar-none no-print">
        <nav className="inline-flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
          {[
            { id: 'attendance', label: 'Presensi', icon: CheckCheck },
            { id: 'attendance-recap', label: 'Rekap Absensi (Semester)', icon: FileText },
            { id: 'grades', label: 'Rekap Nilai', icon: BarChart3 },
            { id: 'journal', label: 'Form Jurnal', icon: BookOpen },
            { id: 'journal-history', label: 'Riwayat Jurnal', icon: History },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
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

      {/* 3. TAB 1: PRESENSI SISWA & CETAK PRESENSI */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-4">
          
          {/* Quick Action Toolbar & Live Status Counters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Status Counters Bar */}
            <div className="grid grid-cols-5 gap-1.5 flex-1 max-w-md">
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-center">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Hadir</span>
                <span className="text-base font-black text-emerald-800 dark:text-emerald-300">{attendanceCounts.H}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-500/30 text-center">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">Sakit</span>
                <span className="text-base font-black text-blue-800 dark:text-blue-300">{attendanceCounts.S}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 text-center">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Izin</span>
                <span className="text-base font-black text-amber-800 dark:text-amber-300">{attendanceCounts.I}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-500/30 text-center">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400">Disp</span>
                <span className="text-base font-black text-purple-800 dark:text-purple-300">{attendanceCounts.D}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/30 text-center">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400">Alpa</span>
                <span className="text-base font-black text-rose-800 dark:text-rose-300">{attendanceCounts.A}</span>
              </div>
            </div>

            {/* Action Buttons: Simpan Presensi, Set All Present, Cetak Presensi PDF, Cetak Semua Rekap Absensi & Jump to Journal Form */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSaveAttendance}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
                title="Simpan status presensi tanggal ini"
              >
                <Save size={16} />
                <span>Simpan Presensi</span>
              </button>

              <button
                onClick={() => setAllPresent(activeSchedule.id, selectedDate, classStudents)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs active:scale-95 transition-all"
                title="Set semua siswa hadir dalam 1 klik"
              >
                <CheckCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>Set Hadir</span>
              </button>

              <button
                onClick={() => setIsPrintAttendanceModalOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs active:scale-95 transition-all"
                title="Cetak Presensi Sesi Ini (PDF)"
              >
                <Printer size={15} />
                <span>Cetak Sesi Ini</span>
              </button>

              <button
                onClick={() => setIsPrintAllAttendanceModalOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
                title="Cetak Rekapitulasi Semua Absensi Semester (PDF)"
              >
                <FileText size={15} />
                <span>Cetak Semua Rekap Absensi</span>
              </button>

              <button
                onClick={() => setActiveSubTab('journal')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs active:scale-95 transition-all"
              >
                <BookOpen size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>Isi Jurnal</span>
              </button>
            </div>

          </div>

          {/* Student Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama atau NIS siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          {/* Student Attendance Card Stack (Responsive 2-col on desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            {filteredStudents.length === 0 ? (
              <div className="col-span-full text-center py-10 glass-card rounded-2xl">
                <User size={32} className="mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tidak ada data siswa ditemukan</p>
              </div>
            ) : (
              filteredStudents.map((student, index) => {
                const currentStatus = currentSession.records[student.id] || 'A';

                return (
                  <div
                    key={student.id}
                    className="glass-card p-3.5 sm:p-4 rounded-2xl hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
                        {index + 1}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 flex-shrink-0">
                        {student.gender === 'L' ? '👦' : '👧'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">{student.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">NIS: {student.nis} • {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                      </div>
                    </div>

                    {/* 5-Status Interactive Button Group */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80">
                      {statusConfig.map((item) => {
                        const isSelected = currentStatus === item.key;

                        return (
                          <button
                            key={item.key}
                            onClick={() => handleStatusClick(student.id, item.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all active:scale-90 ${
                              isSelected
                                ? `${item.activeClass} shadow-md`
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            {item.key}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Reassurance & Save Presensi Bar */}
          {filteredStudents.length > 0 && (
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Presensi Terkoneksi & Tersimpan</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Setiap klik status kehadiran tersimpan otomatis. Tekan <strong>Simpan Presensi</strong> untuk mengunci catatan sesi ini.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsPrintAllAttendanceModalOpen(true)}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Printer size={14} />
                  <span>Cetak Semua Rekap</span>
                </button>
                <button
                  onClick={handleSaveAttendance}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Save size={14} />
                  <span>Simpan Presensi</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3B. TAB 2: REKAPITULASI ABSENSI SISWA 1 SEMESTER PENUH */}
      {activeSubTab === 'attendance-recap' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Top Control Bar: Title, Class/Subject Metadata, CSV Export & Cetak PDF */}
          <div className="glass-card p-4 rounded-3xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={20} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Rekapitulasi Absensi Siswa 1 Semester</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span>Kelas: <strong className="text-emerald-600 dark:text-emerald-400">{activeClass?.name}</strong></span>
                  <span>•</span>
                  <span>Mapel: <strong className="text-slate-800 dark:text-white">{activeSubject?.name}</strong></span>
                  <span>•</span>
                  <span>Total Pertemuan: <strong className="text-slate-800 dark:text-white">{allRecordedDates.length} Sesi KBM</strong></span>
                  <span>•</span>
                  <span>Periode: <strong className="text-emerald-600 dark:text-emerald-400">Semester Ganjil 2026/2027</strong></span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSaveAttendance}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
                  title="Simpan rekap absensi semester"
                >
                  <Save size={15} />
                  <span>Simpan Rekap Absensi</span>
                </button>

                <button
                  onClick={exportAttendanceRecapToCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs active:scale-95 transition-all shadow-sm"
                  title="Unduh file Excel / CSV Rekap Absensi Semester"
                >
                  <FileSpreadsheet size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Ekspor CSV</span>
                </button>

                <button
                  onClick={() => setIsPrintAllAttendanceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
                  title="Cetak Berkas Rekapitulasi Presensi Resmi (PDF)"
                >
                  <Printer size={15} />
                  <span>Cetak Rekap (PDF)</span>
                </button>
              </div>
            </div>

            {/* Attendance Analytics Bar (4 Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Rata-rata Kehadiran Kelas</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{cumulativeClassRate}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Total Kehadiran Kumulatif</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  <span className="text-emerald-600 dark:text-emerald-400">{studentCumulativeAttendance.reduce((sum, s) => sum + s.hadir, 0)}</span> Sesi Hadir
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Akumulasi Izin / Sakit / Disp / Alpa</div>
                <div className="text-xs font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-blue-600" title="Sakit">S:{studentCumulativeAttendance.reduce((sum, s) => sum + s.sakit, 0)}</span>
                  <span className="text-amber-600" title="Izin">I:{studentCumulativeAttendance.reduce((sum, s) => sum + s.izin, 0)}</span>
                  <span className="text-purple-600" title="Dispensasi">D:{studentCumulativeAttendance.reduce((sum, s) => sum + s.dispensasi, 0)}</span>
                  <span className="text-rose-600 font-black" title="Alpa">A:{studentCumulativeAttendance.reduce((sum, s) => sum + s.alpa, 0)}</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <span>Kehadiran 100%</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    {studentCumulativeAttendance.filter(s => s.persentase === 100).length} Siswa
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cumulativeClassRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama atau NIS siswa dalam rekap absensi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          {/* 1. Desktop Interactive Attendance Recap Table */}
          <div className="hidden md:block glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 w-10 text-center sticky left-0 z-20 bg-slate-100 dark:bg-slate-900">No</th>
                    <th className="py-3 px-3 min-w-[170px] sticky left-10 z-20 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Nama Siswa</th>
                    <th className="py-3 px-2 w-12 text-center">L/P</th>

                    {/* Sesi KBM Dates Headers */}
                    {allRecordedDates.map((dateStr, dIdx) => (
                      <th key={dateStr} className="py-3 px-1.5 w-14 text-center border-r border-slate-200/60 dark:border-slate-800/60" title={`Sesi KBM: ${dateStr}`}>
                        <div className="text-[9px] text-slate-400 font-normal">Sesi {dIdx + 1}</div>
                        <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{dateStr.slice(5)}</div>
                      </th>
                    ))}

                    {/* Cumulative Summary Headers */}
                    <th className="py-3 px-2 w-12 text-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold" title="Total Hadir (H)">H</th>
                    <th className="py-3 px-2 w-12 text-center bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold" title="Total Sakit (S)">S</th>
                    <th className="py-3 px-2 w-12 text-center bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold" title="Total Izin (I)">I</th>
                    <th className="py-3 px-2 w-12 text-center bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold" title="Total Dispensasi (D)">D</th>
                    <th className="py-3 px-2 w-12 text-center bg-rose-500/10 text-rose-700 dark:text-rose-300 font-extrabold" title="Total Alpa (A)">A</th>
                    <th className="py-3 px-2.5 w-16 text-center bg-slate-200/50 dark:bg-slate-800/50 font-bold">Total</th>
                    <th className="py-3 px-3 w-28 text-center bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-black">% Hadir</th>
                    <th className="py-3 px-3 w-20 text-center" title="Predikat Kehadiran: SB (Sangat Baik), B (Baik), C (Cukup), PP (Perlu Pembinaan)">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={10 + allRecordedDates.length} className="py-8 text-center text-slate-500 font-medium">
                        Tidak ada siswa ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const item = studentCumulativeAttendance.find(s => s.student.id === student.id) || {
                        student,
                        hadir: 0,
                        sakit: 0,
                        izin: 0,
                        dispensasi: 0,
                        alpa: 0,
                        totalSesi: allRecordedDates.length || 1,
                        persentase: 100,
                        predikat: 'Sangat Baik',
                        predikatCode: 'SB'
                      };

                      return (
                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-xs">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-400 sticky left-0 z-10 bg-white dark:bg-slate-900">{idx + 1}</td>
                          <td className="py-2.5 px-3 sticky left-10 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            <div className="font-bold text-slate-900 dark:text-white">{student.name}</div>
                            <div className="text-[10px] text-slate-500">NIS: {student.nis}</div>
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-600 dark:text-slate-400 font-semibold">{student.gender}</td>

                          {/* Sesi Status Badges */}
                          {allRecordedDates.map((dateStr) => {
                            const matchSession = classRecordedSessions.find(s => s.date === dateStr) || (dateStr === selectedDate ? currentSession : null);
                            const code = matchSession?.records?.[student.id] || (dateStr === selectedDate ? (currentSession.records[student.id] || 'A') : 'A');

                            return (
                              <td key={dateStr} className="py-2 px-1 text-center border-r border-slate-200/50 dark:border-slate-800/50">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black ${
                                  code === 'H' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' :
                                  code === 'S' ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300' :
                                  code === 'I' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' :
                                  code === 'D' ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300' :
                                  'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                }`}>
                                  {code}
                                </span>
                              </td>
                            );
                          })}

                          {/* Cumulative Counts */}
                          <td className="py-2.5 px-2 text-center font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50/5">{item.hadir}</td>
                          <td className="py-2.5 px-2 text-center font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/5">{item.sakit}</td>
                          <td className="py-2.5 px-2 text-center font-semibold text-amber-700 dark:text-amber-300 bg-amber-50/5">{item.izin}</td>
                          <td className="py-2.5 px-2 text-center font-semibold text-purple-700 dark:text-purple-300 bg-purple-50/5">{item.dispensasi}</td>
                          <td className="py-2.5 px-2 text-center font-black text-rose-700 dark:text-rose-300 bg-rose-50/5">{item.alpa}</td>
                          <td className="py-2.5 px-2.5 text-center font-bold text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/30">{item.totalSesi}</td>

                          {/* Percentage Bar & Number */}
                          <td className="py-2.5 px-3 bg-emerald-500/5">
                            <div className="flex items-center justify-between gap-2 text-xs font-black text-emerald-700 dark:text-emerald-300 mb-1">
                              <span>{item.persentase}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.persentase >= 85 ? 'bg-emerald-500' : item.persentase >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${item.persentase}%` }}
                              ></div>
                            </div>
                          </td>

                          {/* Predikat Singkatan */}
                          <td className="py-2.5 px-3 text-center">
                            <span
                              title={`${item.predikatCode} - ${item.predikat} (${item.persentase}%)`}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide inline-block ${
                                item.predikatCode === 'SB' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' :
                                item.predikatCode === 'B' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700' :
                                item.predikatCode === 'C' ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30' :
                                'bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30 shadow-xs'
                              }`}
                            >
                              {item.predikatCode}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Legend Note Under Table */}
            <div className="p-3 sm:p-3.5 bg-slate-50/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs shrink-0">
                  <Info size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Keterangan Predikat:</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                  <span className="font-black">SB</span> = Sangat Baik (&ge;90%)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] border border-slate-300 dark:border-slate-700">
                  <span className="font-black">B</span> = Baik (85-89%)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold text-[11px] border border-amber-500/30">
                  <span className="font-black">C</span> = Cukup (75-84%)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-800 dark:text-rose-300 font-bold text-[11px] border border-rose-500/30">
                  <span className="font-black">PP</span> = Perlu Pembinaan (&lt;75%)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                *Kalkulasi otomatis dari persentase kehadiran 1 semester.
              </span>
            </div>
          </div>

          {/* 2. Mobile Responsive Card View */}
          <div className="md:hidden space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-10 glass-card rounded-2xl">
                <User size={32} className="mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tidak ada data siswa ditemukan</p>
              </div>
            ) : (
              filteredStudents.map((student, index) => {
                const item = studentCumulativeAttendance.find(s => s.student.id === student.id) || {
                  student,
                  hadir: 0,
                  sakit: 0,
                  izin: 0,
                  dispensasi: 0,
                  alpa: 0,
                  totalSesi: allRecordedDates.length || 1,
                  persentase: 100,
                  predikat: 'Sangat Baik',
                  predikatCode: 'SB'
                };

                return (
                  <div
                    key={student.id}
                    className="glass-card p-4 rounded-2xl space-y-3 hover:border-slate-400 dark:hover:border-slate-700 transition-all border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 text-center text-xs font-bold text-slate-400">{index + 1}</span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{student.name}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">NIS: {student.nis} • {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">{item.persentase}%</span>
                        <span
                          title={`${item.predikatCode}: ${item.predikat}`}
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                            item.predikatCode === 'SB' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                            item.predikatCode === 'B' ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200' :
                            item.predikatCode === 'C' ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300' :
                            'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {item.predikatCode} ({item.predikat})
                        </span>
                      </div>
                    </div>

                    {/* 5-Count Pills Grid */}
                    <div className="grid grid-cols-5 gap-1.5 text-center text-xs pt-1">
                      <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                        <div className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400">Hadir</div>
                        <div className="text-sm font-black text-emerald-900 dark:text-emerald-200">{item.hadir}</div>
                      </div>
                      <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50">
                        <div className="text-[9px] font-bold text-blue-700 dark:text-blue-400">Sakit</div>
                        <div className="text-sm font-black text-blue-900 dark:text-blue-200">{item.sakit}</div>
                      </div>
                      <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
                        <div className="text-[9px] font-bold text-amber-700 dark:text-amber-400">Izin</div>
                        <div className="text-sm font-black text-amber-900 dark:text-amber-200">{item.izin}</div>
                      </div>
                      <div className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50">
                        <div className="text-[9px] font-bold text-purple-700 dark:text-purple-400">Disp</div>
                        <div className="text-sm font-black text-purple-900 dark:text-purple-200">{item.dispensasi}</div>
                      </div>
                      <div className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50">
                        <div className="text-[9px] font-bold text-rose-700 dark:text-rose-400">Alpa</div>
                        <div className="text-sm font-black text-rose-900 dark:text-rose-200">{item.alpa}</div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.persentase >= 85 ? 'bg-emerald-500' : item.persentase >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.persentase}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Reassurance & Export Bar */}
          {filteredStudents.length > 0 && (
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Rekapitulasi Kehadiran 1 Semester Siap Cetak</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Total {allRecordedDates.length} sesi pertemuan tercatat & dihitung secara otomatis (Hadir, Sakit, Izin, Dispensasi, Alpa).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={exportAttendanceRecapToCSV}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <FileSpreadsheet size={14} />
                  <span>Ekspor CSV</span>
                </button>
                <button
                  onClick={() => setIsPrintAllAttendanceModalOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Printer size={14} />
                  <span>Cetak Rekap (PDF)</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. TAB 3: REKAP NILAI SISWA (LEGER, BOBOT NILAI, KKM, CSV & CETAK PDF) */}
      {activeSubTab === 'grades' && (
        <div className="space-y-4">
          
          {/* Top Control Bar: KKM Adjuster, CSV Export, & Cetak Leger */}
          <div className="glass-card p-4 rounded-3xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap size={20} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Rekap Nilai Siswa & Leger Akademik</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span>Kelas: <strong className="text-emerald-600 dark:text-emerald-400">{activeClass?.name}</strong></span>
                  <span>•</span>
                  <span>Mapel: <strong className="text-slate-800 dark:text-white">{activeSubject?.name}</strong></span>
                  <span>•</span>
                  <span>Bobot: <span className="text-slate-700 dark:text-slate-300 font-medium">{(assessmentConfig || []).map(c => `${c.shortName || c.name} ${c.weight}%`).join(' | ')}</span></span>
                  {totalConfiguredWeight !== 100 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                      ⚠️ Total: {totalConfiguredWeight}% (Harus 100%)
                    </span>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Save All Grades Button */}
                <button
                  onClick={handleSaveAllGrades}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
                  title="Simpan seluruh rekap nilai siswa kelas ini"
                >
                  <Save size={15} />
                  <span>Simpan Rekap Nilai</span>
                </button>

                {/* Custom Weights & Columns Manager Button */}
                <button
                  onClick={() => setIsAssessmentConfigModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/50 font-bold text-xs active:scale-95 transition-all shadow-sm"
                  title="Atur Bobot Kategori dan Tambah/Hapus Kolom Penilaian"
                >
                  <SlidersHorizontal size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Atur Bobot & Kolom</span>
                </button>

                {/* KKM Pill & Quick Edit */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-xs font-bold">
                  <span>KKM:</span>
                  <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">{kkm || 75}</span>
                  <button
                    onClick={() => {
                      setTempKkm(kkm || 75);
                      setIsKkmEditOpen(true);
                    }}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
                    title="Ubah Nilai KKM"
                  >
                    <Edit3 size={12} />
                  </button>
                </div>

                {/* Export CSV */}
                <button
                  onClick={exportGradesToCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs active:scale-95 transition-all shadow-sm"
                >
                  <FileSpreadsheet size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Ekspor CSV</span>
                </button>

                {/* Print PDF Leger */}
                <button
                  onClick={() => setIsPrintLegerModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
                >
                  <Printer size={15} />
                  <span>Cetak Leger (PDF)</span>
                </button>
              </div>
            </div>

            {/* Class Grade Statistics Analytics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Rata-rata Kelas</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{gradeAnalytics.avgClassNA}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Tertinggi / Terendah</div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {gradeAnalytics.highestNA} <span className="text-slate-400 font-normal">/</span> <span className="text-rose-500">{gradeAnalytics.lowestNA}</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Ketuntasan (Tuntas / Rem)</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  <span className="text-emerald-600 dark:text-emerald-400">{gradeAnalytics.passedCount}</span> Tuntas • <span className="text-rose-500">{gradeAnalytics.remedialCount}</span> Rem
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <span>Persentase Lulus</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">{gradeAnalytics.passRate}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${gradeAnalytics.passRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari siswa untuk melihat atau input nilai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          {/* 1. Desktop Interactive Grades Table */}
          <div className="hidden md:block glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 w-10 text-center sticky left-0 z-20 bg-slate-100 dark:bg-slate-900">No</th>
                    <th className="py-3 px-3 min-w-[160px] sticky left-10 z-20 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Siswa</th>
                    {(assessmentConfig || []).map(cat => (
                      <React.Fragment key={cat.id}>
                        {(cat.columns || []).map(col => (
                          <th key={col.id} className="py-3 px-1.5 w-18 text-center" title={`${col.label} (${cat.name})`}>
                            {col.label}
                          </th>
                        ))}
                        <th className="py-3 px-2 w-20 text-center bg-slate-200/60 dark:bg-slate-800/50 text-emerald-700 dark:text-emerald-300">
                          <div>Rata {cat.shortName || cat.name}</div>
                          <div className="text-[9px] font-normal text-slate-500 dark:text-slate-400">({cat.weight}%)</div>
                        </th>
                      </React.Fragment>
                    ))}
                    <th className="py-3 px-2.5 w-20 text-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold">NA</th>
                    <th className="py-3 px-2 w-14 text-center">Predikat</th>
                    <th className="py-3 px-3 w-22 text-center">Status</th>
                    <th className="py-3 px-2 w-12 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={2 + (assessmentConfig || []).reduce((acc, cat) => acc + (cat.columns?.length || 0) + 1, 0) + 4} className="py-8 text-center text-slate-500 font-medium">
                        Tidak ada siswa ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const stGrade = currentClassGrades[student.id] || {};
                      const res = calculateFinalGrade(stGrade, kkm);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-400 sticky left-0 z-10 bg-white dark:bg-slate-900">{idx + 1}</td>
                          <td className="py-2.5 px-3 sticky left-10 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{student.name}</div>
                            <div className="text-[10px] text-slate-500">NIS: {student.nis}</div>
                          </td>

                          {/* Dynamic Inputs for all categories & columns */}
                          {(assessmentConfig || []).map(cat => (
                            <React.Fragment key={cat.id}>
                              {(cat.columns || []).map(col => (
                                <td key={col.id} className="py-1.5 px-1 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={stGrade[col.id] ?? ''}
                                    onChange={(e) => updateStudentGrade(activeClass.id, activeSubject.id, student.id, col.id, e.target.value)}
                                    placeholder="0"
                                    className="w-14 mx-auto text-center font-bold text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg py-1 px-1 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                                  />
                                </td>
                              ))}
                              {/* Category Average */}
                              <td className="py-2.5 px-2 text-center font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/20">
                                {res.categoryAverages?.[cat.id] ?? 0}
                              </td>
                            </React.Fragment>
                          ))}

                          {/* Nilai Akhir (NA) */}
                          <td className="py-2.5 px-2.5 text-center bg-emerald-500/10 font-black text-sm text-emerald-700 dark:text-emerald-300">
                            {res.na}
                          </td>

                          {/* Predikat */}
                          <td className="py-2.5 px-2 text-center font-black text-xs text-slate-800 dark:text-slate-200">
                            {res.predikat}
                          </td>

                          {/* Ketuntasan */}
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              res.isTuntas
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
                            }`}>
                              {res.isTuntas ? 'Tuntas' : 'Remedial'}
                            </span>
                          </td>

                          {/* Quick Edit Modal Trigger */}
                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => setSelectedStudentForEditGrade(student)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                              title="Edit Nilai Detail (Slider)"
                            >
                              <SlidersHorizontal size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Mobile Card View for Grades (Touch-friendly & Ergonomic) */}
          <div className="block md:hidden space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-10 glass-card rounded-2xl">
                <User size={32} className="mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tidak ada siswa ditemukan</p>
              </div>
            ) : (
              filteredStudents.map((student, idx) => {
                const stGrade = currentClassGrades[student.id] || {};
                const res = calculateFinalGrade(stGrade, kkm);

                return (
                  <div key={student.id} className="glass-card p-4 rounded-2xl space-y-3 border border-slate-200 dark:border-slate-800">
                    
                    {/* Student Top Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 text-center text-xs font-bold text-slate-400">{idx + 1}</span>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{student.name}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">NIS: {student.nis}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Final NA & Status Badge */}
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Nilai Akhir</span>
                          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{res.na} ({res.predikat})</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                          res.isTuntas
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                        }`}>
                          {res.isTuntas ? 'TUNTAS' : 'REMED'}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Inputs Grouped by Category */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      {(assessmentConfig || []).map(cat => (
                        <div key={cat.id} className="bg-slate-50/70 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800/60">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                            <span>{cat.name} ({cat.weight}%)</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                              Rata: {res.categoryAverages?.[cat.id] ?? 0}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(cat.columns || []).map(col => (
                              <div key={col.id}>
                                <label className="block text-[10px] font-medium text-slate-500 mb-1 truncate">{col.label}</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={stGrade[col.id] ?? ''}
                                  onChange={(e) => updateStudentGrade(activeClass.id, activeSubject.id, student.id, col.id, e.target.value)}
                                  placeholder="0"
                                  className="w-full text-center font-bold text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-1.5 px-2 text-slate-900 dark:text-white focus:border-emerald-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setSelectedStudentForEditGrade(student)}
                        className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <SlidersHorizontal size={13} />
                        <span>Buka Slider Nilai</span>
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Reassurance & Save Grades Bar */}
          {filteredStudents.length > 0 && (
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Rekap Nilai Siswa Terintegrasi</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Nilai akhir (NA), predikat, dan ketuntasan otomatis dikalkulasi sesuai KKM ({kkm || 75}) dan bobot kategori.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={exportGradesToCSV}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <FileSpreadsheet size={14} />
                  <span>Ekspor CSV</span>
                </button>
                <button
                  onClick={handleSaveAllGrades}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Save size={14} />
                  <span>Simpan Rekap Nilai</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. TAB 3: FORM JURNAL MENGAJAR KBM (INLINE & LENGKAP) */}
      {activeSubTab === 'journal' && (
        <form onSubmit={handleSaveJournal} className="space-y-4">
          <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Form Jurnal Pelaksanaan KBM</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kelas: <strong className="text-emerald-600 dark:text-emerald-300">{activeClass?.name}</strong> • Mapel: <strong className="text-slate-800 dark:text-white">{activeSubject?.name}</strong> • Tanggal: <strong className="text-slate-800 dark:text-white">{selectedDate}</strong>
                </p>
              </div>

              {existingJournal && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold self-start sm:self-auto">
                  <CheckCircle2 size={13} />
                  <span>Jurnal Tersimpan</span>
                </span>
              )}
            </div>

            {/* Mode Edit Banner Notice */}
            {editingJournalId && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <Edit2 size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    <strong>Mode Edit Jurnal:</strong> Menyunting catatan KBM tanggal <strong>{selectedDate}</strong> ({activeClass?.name} — {activeSubject?.name}).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingJournalId(null);
                    setJournalForm({
                      topic_material: '',
                      learning_objectives: '',
                      teaching_activities: '',
                      obstacles_and_solutions: '',
                      kbm_status: currentSession.kbm_status || 'Tatap Muka'
                    });
                    showToast('Mode edit jurnal dibatalkan. Formulir dikosongkan.', 'info');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 font-bold text-xs shrink-0 transition-colors"
                >
                  Batal Edit
                </button>
              </div>
            )}

            {/* Status Pelaksanaan KBM */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Status Pelaksanaan Pembelajaran *
              </label>
              <select
                value={journalForm.kbm_status}
                onChange={(e) => setJournalForm({ ...journalForm, kbm_status: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="Tatap Muka">Tatap Muka (Reguler di Kelas/Lab)</option>
                <option value="Online">Online / Daring (Synchronous Meeting)</option>
                <option value="Guru Dinas Luar">Guru Dinas Luar (Workshop/Tugas Kedinasan)</option>
                <option value="Guru Sakit / Izin">Guru Sakit / Berhalangan Izin</option>
                <option value="Guru Inval">Guru Inval (Piket Pengganti Mengajar)</option>
                <option value="Hari Libur">Hari Libur / Tanggal Merah</option>
              </select>
            </div>

            {/* Topik / Materi Pembelajaran */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Materi Pokok / Topik Pembelajaran *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Contoh: Arsitektur Single Page Application (SPA), State Management, dan CRUD Realtime..."
                value={journalForm.topic_material}
                onChange={(e) => setJournalForm({ ...journalForm, topic_material: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 leading-relaxed font-medium"
              />
            </div>

            {/* Tujuan Pembelajaran */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tujuan Pembelajaran (Learning Objectives)
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Siswa mampu mendesain antarmuka responsif dan menghubungkan form ke state..."
                value={journalForm.learning_objectives}
                onChange={(e) => setJournalForm({ ...journalForm, learning_objectives: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 leading-relaxed font-medium"
              />
            </div>

            {/* Aktivitas Mengajar & Metode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Aktivitas Pembelajaran & Metode KBM
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: 1. Apersepsi materi sebelumnya\n2. Live demonstrasi koding\n3. Praktik mandiri siswa & review kode"
                value={journalForm.teaching_activities}
                onChange={(e) => setJournalForm({ ...journalForm, teaching_activities: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 leading-relaxed font-medium"
              />
            </div>

            {/* Hambatan & Solusi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Kendala Pembelajaran / Catatan Khusus Siswa & Solusi
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: 2 siswa terlambat karena kendala transportasi, diberikan modul rangkuman saat praktikum..."
                value={journalForm.obstacles_and_solutions}
                onChange={(e) => setJournalForm({ ...journalForm, obstacles_and_solutions: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 leading-relaxed font-medium"
              />
            </div>

            {/* Submit & Print Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Data jurnal akan otomatis terhubung ke rekap laporan KOP sekolah.
              </span>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Print Current Journal Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJournalForPrint({
                      schedule_id: activeSchedule.id,
                      date: selectedDate,
                      ...journalForm
                    });
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer size={15} />
                  <span>Cetak Jurnal Sesi Ini</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={15} />
                  <span>{editingJournalId || existingJournal ? 'Perbarui Catatan Jurnal KBM' : 'Simpan Catatan Jurnal KBM'}</span>
                </button>
              </div>
            </div>

          </div>
        </form>
      )}

      {/* 6. TAB 4: RIWAYAT JURNAL MENGAJAR & CETAK REKAP */}
      {activeSubTab === 'journal-history' && (
        <div className="space-y-4">
          
          {/* Top Bar: Title & Bulk Print */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <History size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>Riwayat Jurnal Mengajar</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total {teachingJournals.length} Jurnal Tercatat • Dilengkapi filter kelas & mapel
              </p>
            </div>

            <button
              onClick={() => setIsPrintAllJournalsModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all self-start sm:self-auto"
            >
              <Printer size={14} />
              <span>Cetak Rekap Semua Jurnal (PDF)</span>
            </button>
          </div>

          {/* History Search & Class/Subject Filters */}
          <div className="glass-card p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Cari materi / topik atau tanggal jurnal..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={historyFilterClass}
                onChange={(e) => setHistoryFilterClass(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
              >
                <option value="all">Semua Kelas</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={historyFilterSubject}
                onChange={(e) => setHistoryFilterSubject(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
              >
                <option value="all">Semua Mapel</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Journal History Cards */}
          <div className="space-y-3">
            {(() => {
              const filteredJournals = teachingJournals.filter((journal) => {
                const sch = schedules.find(s => s.id === journal.schedule_id);
                const matchClass = historyFilterClass === 'all' || sch?.class_id === Number(historyFilterClass);
                const matchSubject = historyFilterSubject === 'all' || sch?.subject_id === Number(historyFilterSubject);
                const matchSearch = (journal.topic_material || '').toLowerCase().includes(historySearch.toLowerCase()) ||
                  (journal.date || '').includes(historySearch);
                return matchClass && matchSubject && matchSearch;
              });

              if (filteredJournals.length === 0) {
                return (
                  <div className="text-center py-10 glass-card rounded-2xl">
                    <BookOpen size={32} className="mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tidak ada data jurnal yang sesuai filter</p>
                  </div>
                );
              }

              return filteredJournals.map((journal) => {
                const sch = schedules.find(s => s.id === journal.schedule_id);
                const cls = classes.find(c => c.id === sch?.class_id);
                const sub = subjects.find(s => s.id === sch?.subject_id);

                return (
                  <div
                    key={journal.id}
                    className="glass-card p-4 rounded-2xl space-y-3 hover:border-slate-400 dark:hover:border-slate-700 transition-all border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            {cls?.name || 'Rombel'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {journal.date}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {journal.kbm_status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1.5">{sub?.name || 'Mata Pelajaran'}</h4>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                          <strong>Materi:</strong> {journal.topic_material}
                        </p>
                      </div>

                      {/* Action Buttons: Edit, Print, Delete */}
                      <div className="flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0">
                        <button
                          onClick={() => handleEditJournalFromHistory(journal)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-xs font-bold border border-amber-300 dark:border-amber-700/50 transition-colors shadow-sm"
                          title="Sunting / Edit Jurnal KBM"
                        >
                          <Edit2 size={13} />
                          <span>Edit Jurnal</span>
                        </button>

                        <button
                          onClick={() => setSelectedJournalForPrint(journal)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors shadow-sm"
                          title="Cetak Lembar Jurnal"
                        >
                          <Printer size={13} />
                          <span>Cetak</span>
                        </button>

                        <button
                          onClick={() => handleDeleteJournalItem(journal)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors border border-rose-200 dark:border-rose-800"
                          title="Hapus Catatan Jurnal"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {journal.learning_objectives && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                        <strong>Tujuan Pembelajaran:</strong> {journal.learning_objectives}
                      </p>
                    )}

                    {journal.teaching_activities && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                        <strong>Aktivitas & Metode:</strong> {journal.teaching_activities}
                      </p>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PRATINJAU & CETAK PRESENSI HARIAN SISWA (PDF RESMI) */}
      {/* ========================================================================= */}
      {isPrintAttendanceModalOpen && (
        <ModalDrawer
          isOpen={isPrintAttendanceModalOpen}
          onClose={() => setIsPrintAttendanceModalOpen(false)}
          title="Pratinjau Cetak Lembar Presensi Siswa Resmi (PDF)"
          maxWidth="max-w-4xl"
        >
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl select-text space-y-4">
            
            <KopSurat
              title="DAFTAR HADIR / PRESENSI PEMBELAJARAN (KBM)"
              subtitle="Tahun Ajaran 2026/2027 — Semester Ganjil"
            />

            {/* Academic Info */}
            <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-slate-300">
              <div>
                <p><strong>Mata Pelajaran:</strong> {activeSubject?.name}</p>
                <p><strong>Kelas / Rombel:</strong> {activeClass?.name} ({activeClass?.major})</p>
                <p><strong>Hari / Tanggal:</strong> {activeSchedule?.day_name}, {selectedDate}</p>
              </div>
              <div>
                <p><strong>Guru Pengampu:</strong> {schoolSettings?.teacher_name}</p>
                <p><strong>NIP Guru:</strong> {schoolSettings?.teacher_nip}</p>
                <p><strong>Waktu & Status:</strong> {activeSchedule?.start_time}-{activeSchedule?.end_time} WIB ({journalForm.kbm_status || currentSession.kbm_status || 'Tatap Muka'})</p>
              </div>
            </div>

            {/* Attendance Print Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400 text-center text-[11px]">
                    <th className="py-2 px-2 border-r border-slate-400 w-10">No</th>
                    <th className="py-2 px-3 border-r border-slate-400 w-28">NIS / NISN</th>
                    <th className="py-2 px-3 border-r border-slate-400 text-left">Nama Siswa</th>
                    <th className="py-2 px-2 border-r border-slate-400 w-14">L/P</th>
                    <th className="py-2 px-3 border-r border-slate-400 w-28">Status Kehadiran</th>
                    <th className="py-2 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {classStudents.map((st, i) => {
                    const stCode = currentSession.records[st.id] || 'A';
                    const statusLabelMap = {
                      H: 'Hadir (H)',
                      S: 'Sakit (S)',
                      I: 'Izin (I)',
                      D: 'Dispensasi (D)',
                      A: 'Alpa (A)'
                    };

                    return (
                      <tr key={st.id} className="text-center text-[11px]">
                        <td className="py-1.5 px-2 border-r border-slate-300">{i + 1}</td>
                        <td className="py-1.5 px-3 border-r border-slate-300 font-mono">{st.nis}</td>
                        <td className="py-1.5 px-3 border-r border-slate-300 text-left font-bold">{st.name}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">{st.gender}</td>
                        <td className="py-1.5 px-3 border-r border-slate-300 font-extrabold">
                          <span className={
                            stCode === 'H' ? 'text-emerald-700 font-black' :
                            stCode === 'S' ? 'text-blue-700' :
                            stCode === 'I' ? 'text-amber-700' :
                            stCode === 'D' ? 'text-purple-700' : 'text-rose-700 font-black'
                          }>
                            {statusLabelMap[stCode] || 'Alpa (A)'}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-slate-500 text-[10px] text-left">
                          {stCode === 'H' ? 'Mengikuti KBM Penuh' : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Attendance Summary Footer */}
            <div className="grid grid-cols-5 gap-2 p-2.5 bg-slate-100 rounded-lg text-xs font-bold text-center border border-slate-300">
              <div className="text-emerald-700">Hadir: {attendanceCounts.H}</div>
              <div className="text-blue-700">Sakit: {attendanceCounts.S}</div>
              <div className="text-amber-700">Izin: {attendanceCounts.I}</div>
              <div className="text-purple-700">Dispensasi: {attendanceCounts.D}</div>
              <div className="text-rose-700">Alpa: {attendanceCounts.A} ({attendanceRate}% Hadir)</div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
              <div>
                <p>Mengetahui,</p>
                <p>Kepala Sekolah</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{schoolSettings?.principal_name}</p>
                <p>NIP. {schoolSettings?.principal_nip}</p>
              </div>
              <div>
                <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Guru Mata Pelajaran,</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{schoolSettings?.teacher_name}</p>
                <p>NIP. {schoolSettings?.teacher_nip}</p>
              </div>
            </div>

            {/* Action Print */}
            <div className="flex justify-end gap-2 pt-4 border-t no-print">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-slate-800"
              >
                <Printer size={14} />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>

          </div>
        </ModalDrawer>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1B: PRATINJAU & CETAK REKAPITULASI SEMUA ABSENSI SISWA (PDF RESMI) */}
      {/* ========================================================================= */}
      {isPrintAllAttendanceModalOpen && (
        <ModalDrawer
          isOpen={isPrintAllAttendanceModalOpen}
          onClose={() => setIsPrintAllAttendanceModalOpen(false)}
          title="Pratinjau Cetak Rekapitulasi Seluruh Absensi Siswa (PDF)"
          maxWidth="max-w-5xl"
        >
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl select-text space-y-4">
            
            <KopSurat
              title="REKAPITULASI DAFTAR HADIR / PRESENSI SISWA"
              subtitle="Tahun Ajaran 2026/2027 — Semester Ganjil"
            />

            {/* Academic Info */}
            <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-slate-300">
              <div>
                <p><strong>Mata Pelajaran:</strong> {activeSubject?.name}</p>
                <p><strong>Kelas / Rombel:</strong> {activeClass?.name} ({activeClass?.major})</p>
                <p><strong>Total Sesi KBM Tercatat:</strong> {allRecordedDates.length} Sesi Pertemuan</p>
              </div>
              <div>
                <p><strong>Guru Pengampu:</strong> {schoolSettings?.teacher_name}</p>
                <p><strong>NIP Guru:</strong> {schoolSettings?.teacher_nip}</p>
                <p><strong>Rentang Tanggal:</strong> {allRecordedDates[0] || selectedDate} s.d. {allRecordedDates[allRecordedDates.length - 1] || selectedDate}</p>
              </div>
            </div>

            {/* Attendance Matrix Table with Date Columns */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400 text-center text-[10px]">
                    <th className="py-2 px-1 border-r border-slate-400 w-7">No</th>
                    <th className="py-2 px-2 border-r border-slate-400 w-20">NIS</th>
                    <th className="py-2 px-2.5 border-r border-slate-400 text-left min-w-[140px]">Nama Lengkap Siswa</th>
                    <th className="py-2 px-1 border-r border-slate-400 w-8">L/P</th>

                    {/* Columns per meeting/date */}
                    {allRecordedDates.map((dateStr, dIdx) => (
                      <th key={dateStr} className="py-1 px-1 border-r border-slate-400 text-[9px] min-w-[32px] leading-tight" title={`Pertemuan ke-${dIdx + 1} (${dateStr})`}>
                        <div className="font-extrabold text-slate-900">P{dIdx + 1}</div>
                        <div className="text-[8px] font-normal text-slate-600">{dateStr.slice(5).replace('-', '/')}</div>
                      </th>
                    ))}

                    {/* Summary Totals */}
                    <th className="py-2 px-1 border-r border-slate-400 w-9 bg-emerald-50 text-emerald-900 font-black" title="Total Hadir">H</th>
                    <th className="py-2 px-1 border-r border-slate-400 w-9 bg-blue-50 text-blue-900 font-bold" title="Total Sakit">S</th>
                    <th className="py-2 px-1 border-r border-slate-400 w-9 bg-amber-50 text-amber-900 font-bold" title="Total Izin">I</th>
                    <th className="py-2 px-1 border-r border-slate-400 w-9 bg-purple-50 text-purple-900 font-bold" title="Total Dispensasi">D</th>
                    <th className="py-2 px-1 border-r border-slate-400 w-9 bg-rose-50 text-rose-900 font-black" title="Total Alpa">A</th>
                    <th className="py-2 px-1.5 border-r border-slate-400 w-11 bg-slate-100 font-black">Total</th>
                    <th className="py-2 px-1.5 border-r border-slate-400 w-12 bg-emerald-100/60 font-black text-emerald-900">%</th>
                    <th className="py-2 px-2 w-24 text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {studentCumulativeAttendance.map((item, i) => (
                    <tr key={item.student.id} className="text-center text-[10px]">
                      <td className="py-1 px-1 border-r border-slate-300 font-bold">{i + 1}</td>
                      <td className="py-1 px-1.5 border-r border-slate-300 font-mono text-[9px]">{item.student.nis}</td>
                      <td className="py-1 px-2 border-r border-slate-300 text-left font-bold truncate max-w-[150px]">{item.student.name}</td>
                      <td className="py-1 px-1 border-r border-slate-300">{item.student.gender}</td>

                      {/* Status per date column (Highlights non-present dates clearly) */}
                      {allRecordedDates.map((dateStr) => {
                        const matchSession = classRecordedSessions.find(s => s.date === dateStr) || (dateStr === selectedDate ? currentSession : null);
                        const code = matchSession?.records?.[item.student.id] || (dateStr === selectedDate ? (currentSession.records[item.student.id] || 'A') : 'A');

                        return (
                          <td key={dateStr} className={`py-1 px-0.5 border-r border-slate-300 text-[10px] font-black ${
                            code === 'H' ? 'text-emerald-800' :
                            code === 'S' ? 'text-blue-800 bg-blue-100/80 font-black' :
                            code === 'I' ? 'text-amber-800 bg-amber-100/80 font-black' :
                            code === 'D' ? 'text-purple-800 bg-purple-100/80 font-black' :
                            'text-rose-800 bg-rose-200/90 font-black'
                          }`}>
                            {code}
                          </td>
                        );
                      })}

                      {/* Cumulative Recap Numbers */}
                      <td className="py-1 px-1 border-r border-slate-300 font-extrabold text-emerald-800 bg-emerald-50/40">{item.hadir}</td>
                      <td className="py-1 px-1 border-r border-slate-300 font-semibold text-blue-800 bg-blue-50/40">{item.sakit}</td>
                      <td className="py-1 px-1 border-r border-slate-300 font-semibold text-amber-800 bg-amber-50/40">{item.izin}</td>
                      <td className="py-1 px-1 border-r border-slate-300 font-semibold text-purple-800 bg-purple-50/40">{item.dispensasi}</td>
                      <td className="py-1 px-1 border-r border-slate-300 font-black text-rose-800 bg-rose-50/40">{item.alpa}</td>
                      <td className="py-1 px-1 border-r border-slate-300 font-bold bg-slate-50">{item.totalSesi}</td>
                      <td className="py-1 px-1 border-r border-slate-300 font-black text-emerald-800 bg-emerald-50/60">
                        {item.persentase}%
                      </td>
                      <td className="py-1 px-1.5 text-[9px] font-bold text-center">
                        <span className={
                          item.predikatCode === 'SB' ? 'text-emerald-800 font-black' :
                          item.predikatCode === 'B' ? 'text-slate-800 font-bold' :
                          item.predikatCode === 'C' ? 'text-amber-800 font-black' : 'text-rose-800 font-black'
                        }>
                          {item.predikatCode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend / Keterangan Kode Status Kehadiran & Predikat */}
            <div className="p-2.5 bg-slate-50 rounded-lg text-[10px] text-slate-700 border border-slate-300 space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-slate-900">Keterangan Kode Kehadiran:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-800"><span className="w-3.5 h-3.5 bg-emerald-100 border border-emerald-400 rounded text-center inline-block leading-none text-[9px]">H</span> Hadir</span>
                <span className="inline-flex items-center gap-1 font-bold text-blue-800"><span className="w-3.5 h-3.5 bg-blue-100 border border-blue-400 rounded text-center inline-block leading-none text-[9px]">S</span> Sakit</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-800"><span className="w-3.5 h-3.5 bg-amber-100 border border-amber-400 rounded text-center inline-block leading-none text-[9px]">I</span> Izin</span>
                <span className="inline-flex items-center gap-1 font-bold text-purple-800"><span className="w-3.5 h-3.5 bg-purple-100 border border-purple-400 rounded text-center inline-block leading-none text-[9px]">D</span> Dispensasi</span>
                <span className="inline-flex items-center gap-1 font-bold text-rose-800"><span className="w-3.5 h-3.5 bg-rose-200 border border-rose-500 rounded text-center inline-block leading-none text-[9px]">A</span> Alpa</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-900">Keterangan Predikat:</span>
                <span className="font-semibold text-emerald-800"><strong className="font-black">SB</strong>: Sangat Baik (&ge;90%)</span>
                <span className="font-semibold text-slate-800"><strong className="font-black">B</strong>: Baik (85-89%)</span>
                <span className="font-semibold text-amber-800"><strong className="font-black">C</strong>: Cukup (75-84%)</span>
                <span className="font-semibold text-rose-800"><strong className="font-black">PP</strong>: Perlu Pembinaan (&lt;75%)</span>
                <span className="text-slate-500 italic ml-auto text-[9px]">* Kolom berwarna menandai tanggal ketidakhadiran siswa</span>
              </div>
            </div>

            {/* Cumulative Summary Footer */}
            <div className="grid grid-cols-4 gap-2 p-2.5 bg-slate-100 rounded-lg text-xs font-bold text-center border border-slate-300">
              <div>Total Siswa: {classStudents.length}</div>
              <div>Rata-rata Kelas: <span className="text-emerald-800 font-black">{cumulativeClassRate}%</span></div>
              <div>100% Hadir: <span className="text-emerald-700">{studentCumulativeAttendance.filter(s => s.persentase === 100).length} Siswa</span></div>
              <div>Perlu Pembinaan: <span className="text-rose-700">{studentCumulativeAttendance.filter(s => s.persentase < 75).length} Siswa</span></div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
              <div>
                <p>Mengetahui,</p>
                <p>Kepala Sekolah</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{schoolSettings?.principal_name}</p>
                <p>NIP. {schoolSettings?.principal_nip}</p>
              </div>
              <div>
                <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Guru Mata Pelajaran,</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{schoolSettings?.teacher_name}</p>
                <p>NIP. {schoolSettings?.teacher_nip}</p>
              </div>
            </div>

            {/* Action Print */}
            <div className="flex justify-end gap-2 pt-4 border-t no-print">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-slate-800"
              >
                <Printer size={14} />
                <span>Cetak Rekap Absensi (PDF)</span>
              </button>
            </div>

          </div>
        </ModalDrawer>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRATINJAU & CETAK REKAP SELURUH JURNAL MENGAJAR (PDF) */}
      {/* ========================================================================= */}
      {isPrintAllJournalsModalOpen && (
        <ModalDrawer
          isOpen={isPrintAllJournalsModalOpen}
          onClose={() => setIsPrintAllJournalsModalOpen(false)}
          title="Pratinjau Cetak Rekapitulasi Jurnal Mengajar Semester (PDF)"
          maxWidth="max-w-4xl"
        >
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl select-text space-y-4">
            <KopSurat
              title="REKAPITULASI JURNAL PELAKSANAAN PEMBELAJARAN (KBM)"
              subtitle="Tahun Ajaran 2026/2027 — Semester Ganjil"
            />

            <div className="text-xs space-y-2">
              <p><strong>Nama Guru:</strong> {schoolSettings?.teacher_name} (NIP: {schoolSettings?.teacher_nip})</p>
              <p><strong>Mata Pelajaran:</strong> {activeSubject?.name} — {activeClass?.name}</p>

              <table className="w-full my-3 border border-slate-400 border-collapse text-xs text-left">
                <thead className="bg-slate-100 font-bold border-b border-slate-400 text-center text-[10px]">
                  <tr>
                    <th className="p-2 border-r border-slate-400 w-8">No</th>
                    <th className="p-2 border-r border-slate-400 w-24">Tanggal</th>
                    <th className="p-2 border-r border-slate-400 text-left">Materi Pokok / Topik KBM</th>
                    <th className="p-2 border-r border-slate-400 text-left">Tujuan & Aktivitas</th>
                    <th className="p-2 border-r border-slate-400 w-28 text-left">Kendala & Solusi</th>
                    <th className="p-2 w-20 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {teachingJournals.map((j, idx) => (
                    <tr key={j.id} className="text-[11px]">
                      <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300 text-center font-medium">{j.date}</td>
                      <td className="p-2 border-r border-slate-300 font-bold">{j.topic_material}</td>
                      <td className="p-2 border-r border-slate-300 text-[10px]">
                        {j.learning_objectives || j.teaching_activities || '-'}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-[10px] text-slate-600">
                        {j.obstacles_and_solutions || '-'}
                      </td>
                      <td className="p-2 text-center font-bold text-emerald-800">
                        {j.kbm_status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
                <div>
                  <p>Mengetahui,</p>
                  <p>Kepala Sekolah</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{schoolSettings?.principal_name}</p>
                  <p>NIP. {schoolSettings?.principal_nip}</p>
                </div>
                <div>
                  <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p>Guru Mata Pelajaran,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{schoolSettings?.teacher_name}</p>
                  <p>NIP. {schoolSettings?.teacher_nip}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t no-print">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-slate-800"
              >
                <Printer size={14} />
                <span>Cetak Rekap Jurnal (PDF)</span>
              </button>
            </div>
          </div>
        </ModalDrawer>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PRATINJAU & CETAK LEGER NILAI RESMI (PDF) */}
      {/* ========================================================================= */}
      {isPrintLegerModalOpen && (
        <ModalDrawer
          isOpen={isPrintLegerModalOpen}
          onClose={() => setIsPrintLegerModalOpen(false)}
          title="Pratinjau Cetak Leger Rekap Nilai Resmi (PDF)"
          maxWidth="max-w-4xl"
        >
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl select-text space-y-4">
            
            <KopSurat
              title="LEGER REKAPITULASI PENILAIAN HASIL BELAJAR SISWA"
              subtitle="Tahun Ajaran 2026/2027 — Semester Ganjil"
            />

            {/* Academic Info */}
            <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-slate-300">
              <div>
                <p><strong>Mata Pelajaran:</strong> {activeSubject?.name}</p>
                <p><strong>Kelas / Program:</strong> {activeClass?.name} ({activeClass?.major})</p>
                <p><strong>KKM / KKTP:</strong> {kkm || 75}</p>
              </div>
              <div>
                <p><strong>Guru Pengampu:</strong> {schoolSettings?.teacher_name}</p>
                <p><strong>NIP:</strong> {schoolSettings?.teacher_nip}</p>
                <p><strong>Bobot:</strong> {(assessmentConfig || []).map(c => `${c.shortName || c.name} ${c.weight}%`).join(' | ')}</p>
              </div>
            </div>

            {/* Print Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400 text-center text-[10px]">
                    <th className="py-2 px-2 border-r border-slate-400 w-8">No</th>
                    <th className="py-2 px-2 border-r border-slate-400 w-24">NIS</th>
                    <th className="py-2 px-2 border-r border-slate-400 text-left">Nama Siswa</th>
                    {(assessmentConfig || []).map(cat => (
                      <React.Fragment key={cat.id}>
                        {(cat.columns || []).map(col => (
                          <th key={col.id} className="py-2 px-1 border-r border-slate-400 w-12 text-center" title={`${col.label} (${cat.name})`}>
                            {col.label}
                          </th>
                        ))}
                        <th className="py-2 px-1 border-r border-slate-400 w-14 bg-slate-200/60 text-center font-bold">
                          R.{cat.shortName || cat.name}
                        </th>
                      </React.Fragment>
                    ))}
                    <th className="py-2 px-2 border-r border-slate-400 w-14 bg-emerald-50 font-black text-center">NA</th>
                    <th className="py-2 px-1 border-r border-slate-400 w-10 text-center">Pred</th>
                    <th className="py-2 px-2 w-16 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {classStudents.map((st, i) => {
                    const stGrade = currentClassGrades[st.id] || {};
                    const res = calculateFinalGrade(stGrade, kkm);

                    return (
                      <tr key={st.id} className="text-center text-[11px]">
                        <td className="py-1 px-1 border-r border-slate-300">{i + 1}</td>
                        <td className="py-1 px-1 border-r border-slate-300 font-mono">{st.nis}</td>
                        <td className="py-1 px-2 border-r border-slate-300 text-left font-bold">{st.name}</td>
                        {(assessmentConfig || []).map(cat => (
                          <React.Fragment key={cat.id}>
                            {(cat.columns || []).map(col => (
                              <td key={col.id} className="py-1 px-1 border-r border-slate-300">
                                {stGrade[col.id] !== undefined && stGrade[col.id] !== '' ? stGrade[col.id] : '-'}
                              </td>
                            ))}
                            <td className="py-1 px-1 border-r border-slate-300 bg-slate-100 font-bold">
                              {res.categoryAverages?.[cat.id] ?? '-'}
                            </td>
                          </React.Fragment>
                        ))}
                        <td className="py-1 px-1 border-r border-slate-300 font-black bg-emerald-50 text-emerald-800">{res.na}</td>
                        <td className="py-1 px-1 border-r border-slate-300 font-bold">{res.predikat}</td>
                        <td className="py-1 px-1 font-bold">
                          {res.isTuntas ? 'Tuntas' : 'Remedial'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Print Summary Footer */}
            <div className="grid grid-cols-4 gap-2 p-2 bg-slate-100 rounded-lg text-[11px] font-bold text-center border border-slate-300">
              <div>Rata-rata: {gradeAnalytics.avgClassNA}</div>
              <div>Tertinggi: {gradeAnalytics.highestNA}</div>
              <div>Terendah: {gradeAnalytics.lowestNA}</div>
              <div>Kelulusan: {gradeAnalytics.passRate}% ({gradeAnalytics.passedCount} Tuntas)</div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
              <div>
                <p>Mengetahui,</p>
                <p>Kepala Sekolah</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{schoolSettings?.principal_name}</p>
                <p>NIP. {schoolSettings?.principal_nip}</p>
              </div>
              <div>
                <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Guru Mata Pelajaran,</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{schoolSettings?.teacher_name}</p>
                <p>NIP. {schoolSettings?.teacher_nip}</p>
              </div>
            </div>

            {/* Print Button */}
            <div className="flex justify-end gap-2 pt-4 border-t no-print">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-slate-800"
              >
                <Printer size={14} />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>

          </div>
        </ModalDrawer>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PRATINJAU CETAK SINGLE JURNAL MENGAJAR (PDF) */}
      {/* ========================================================================= */}
      {selectedJournalForPrint && (
        <ModalDrawer
          isOpen={Boolean(selectedJournalForPrint)}
          onClose={() => setSelectedJournalForPrint(null)}
          title="Pratinjau Cetak Jurnal Mengajar Sesi Resmi (PDF)"
          maxWidth="max-w-2xl"
        >
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl select-text space-y-4">
            <KopSurat
              title="JURNAL PELAKSANAAN PEMBELAJARAN (KBM)"
              subtitle="Tahun Ajaran 2026/2027 — Semester Ganjil"
            />

            <div className="text-xs space-y-2 leading-relaxed">
              <table className="w-full my-2 text-xs">
                <tbody>
                  <tr>
                    <td className="w-36 py-1 font-bold">Nama Guru</td>
                    <td>: {schoolSettings?.teacher_name}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-bold">Mata Pelajaran</td>
                    <td>: {subjects.find(s => s.id === schedules.find(sc => sc.id === selectedJournalForPrint.schedule_id)?.subject_id)?.name}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-bold">Kelas / Tanggal</td>
                    <td>: {classes.find(c => c.id === schedules.find(sc => sc.id === selectedJournalForPrint.schedule_id)?.class_id)?.name} / {selectedJournalForPrint.date}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-bold">Status Pelaksanaan</td>
                    <td>: {selectedJournalForPrint.kbm_status}</td>
                  </tr>
                </tbody>
              </table>

              <div className="space-y-2 pt-2 border-t border-slate-300">
                <p><strong>1. Materi / Topik Pembelajaran:</strong><br />{selectedJournalForPrint.topic_material}</p>
                <p><strong>2. Tujuan Pembelajaran:</strong><br />{selectedJournalForPrint.learning_objectives || '-'}</p>
                <p><strong>3. Aktivitas Mengajar & Metode:</strong><br />{selectedJournalForPrint.teaching_activities || '-'}</p>
                <p><strong>4. Hambatan & Solusi:</strong><br />{selectedJournalForPrint.obstacles_and_solutions || '-'}</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div>
                  <p>Mengetahui,</p>
                  <p>Kepala Sekolah</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{schoolSettings?.principal_name}</p>
                  <p>NIP. {schoolSettings?.principal_nip}</p>
                </div>
                <div>
                  <p>Guru Mata Pelajaran,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{schoolSettings?.teacher_name}</p>
                  <p>NIP. {schoolSettings?.teacher_nip}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Printer size={14} />
                <span>Cetak Jurnal (PDF)</span>
              </button>
            </div>
          </div>
        </ModalDrawer>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EDIT KKM MODAL */}
      {/* ========================================================================= */}
      {isKkmEditOpen && (
        <ModalDrawer
          isOpen={isKkmEditOpen}
          onClose={() => setIsKkmEditOpen(false)}
          title="Pengaturan Kriteria Ketuntasan Minimal (KKM)"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tentukan ambang batas KKM / Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) untuk mata pelajaran ini. Siswa dengan Nilai Akhir (NA) di bawah angka ini akan otomatis ditandai <strong>Remedial</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nilai KKM (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={tempKkm}
                onChange={(e) => setTempKkm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-lg font-black text-center focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsKkmEditOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  updateKkm(tempKkm);
                  setIsKkmEditOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md"
              >
                Simpan KKM
              </button>
            </div>
          </div>
        </ModalDrawer>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: DETAIL SLIDER EDIT NILAI SINGLE SISWA */}
      {/* ========================================================================= */}
      {selectedStudentForEditGrade && (
        <ModalDrawer
          isOpen={Boolean(selectedStudentForEditGrade)}
          onClose={() => setSelectedStudentForEditGrade(null)}
          title={`Edit Nilai — ${selectedStudentForEditGrade.name}`}
          maxWidth="max-w-xl"
        >
          {(() => {
            const stGrade = currentClassGrades[selectedStudentForEditGrade.id] || {};
            const res = calculateFinalGrade(stGrade, kkm);

            return (
              <div className="space-y-4">
                
                {/* Live Preview Header */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Kalkulasi Nilai Akhir (NA)</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {res.na} <span className="text-sm font-bold text-slate-600 dark:text-slate-300">(Predikat: {res.predikat})</span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                    res.isTuntas
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                  }`}>
                    {res.isTuntas ? 'TUNTAS' : 'REMEDIAL'}
                  </span>
                </div>

                {/* Interactive Sliders Grouped by Categories */}
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                  {(assessmentConfig || []).map(cat => (
                    <div key={cat.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{cat.name}</span>
                          <span className="text-slate-400 font-normal">({cat.weight}%)</span>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                          Rata-rata: {res.categoryAverages?.[cat.id] ?? 0}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {(cat.columns || []).map(col => {
                          const val = stGrade[col.id] ?? 0;
                          return (
                            <div key={col.id} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <span>{col.label}</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{val}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={val}
                                  onChange={(e) => updateStudentGrade(activeClass.id, activeSubject.id, selectedStudentForEditGrade.id, col.id, e.target.value)}
                                  className="flex-1 accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={val}
                                  onChange={(e) => updateStudentGrade(activeClass.id, activeSubject.id, selectedStudentForEditGrade.id, col.id, e.target.value)}
                                  className="w-16 text-center font-bold text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-1 text-slate-900 dark:text-white focus:border-emerald-500"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      showToast(`Nilai ${selectedStudentForEditGrade.name} berhasil disimpan!`, 'success');
                      setSelectedStudentForEditGrade(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Save size={14} />
                    <span>Simpan Nilai Siswa</span>
                  </button>
                </div>

              </div>
            );
          })()}
        </ModalDrawer>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: PENGATURAN BOBOT & KOLOM PENILAIAN DIBUAT DINAMIS */}
      {/* ========================================================================= */}
      {isAssessmentConfigModalOpen && (
        <ModalDrawer
          isOpen={isAssessmentConfigModalOpen}
          onClose={() => setIsAssessmentConfigModalOpen(false)}
          title="Pengaturan Bobot & Kolom Penilaian"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 select-none">
            
            {/* 1. Status Total Bobot Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
              totalConfiguredWeight === 100
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  totalConfiguredWeight === 100 ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                }`}>
                  <Percent size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Akumulasi Bobot</div>
                  <div className="text-xl font-black flex items-center gap-2">
                    <span>{totalConfiguredWeight}%</span>
                    {totalConfiguredWeight === 100 ? (
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        ✅ Sempurna (100%)
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        ⚠️ {totalConfiguredWeight < 100 ? `Kurang ${100 - totalConfiguredWeight}%` : `Lebih ${totalConfiguredWeight - 100}%`} (Harus 100%)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {totalConfiguredWeight !== 100 && (
                <p className="text-[11px] max-w-[200px] text-right font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                  Nilai Akhir akan dinormalisasi otomatis ke 100% jika belum pas.
                </p>
              )}
            </div>

            {/* 2. Preset Kurikulum Cepat */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                ⚡ Terapkan Preset Kurikulum Cepat:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyAssessmentPreset('kumer')}
                  className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/80 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all text-xs group cursor-pointer"
                >
                  <div className="font-black text-slate-800 dark:text-white group-hover:text-emerald-600">Kurikulum Merdeka</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Formatif 50% | STS 25% | SAS 25%</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyAssessmentPreset('k13')}
                  className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/80 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all text-xs group cursor-pointer"
                >
                  <div className="font-black text-slate-800 dark:text-white group-hover:text-emerald-600">Kurikulum 2013</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Tugas 30% | UH 20% | PTS 25% | PAS 25%</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyAssessmentPreset('smk')}
                  className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/80 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all text-xs group cursor-pointer"
                >
                  <div className="font-black text-slate-800 dark:text-white group-hover:text-emerald-600">SMK / Vokasi (PjBL)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Tugas 20% | Praktik 40% | UH 15% | UKK 25%</div>
                </button>

                <button
                  type="button"
                  onClick={resetAssessmentConfig}
                  className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all text-xs flex flex-col justify-center cursor-pointer"
                >
                  <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <RotateCcw size={12} />
                    <span>Reset Standar</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Kembali ke pengaturan awal</div>
                </button>
              </div>
            </div>

            {/* 3. Daftar Kategori & Kolom Penilaian */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers size={14} className="text-emerald-600" />
                  <span>Daftar Kategori & Kolom Penilaian:</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {assessmentConfig?.length || 0} Kategori Aktif
                </span>
              </div>

              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                {(assessmentConfig || []).map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    {/* Category Header: Name, Weight & Delete */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => updateAssessmentCategory(cat.id, { name: e.target.value })}
                          className="font-extrabold text-sm text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors w-full"
                          placeholder="Nama Kategori (contoh: Tugas, Ulangan Harian, Proyek)"
                        />
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Singkatan:</span>
                          <input
                            type="text"
                            maxLength={8}
                            value={cat.shortName || ''}
                            onChange={(e) => updateAssessmentCategory(cat.id, { shortName: e.target.value })}
                            className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-transparent focus:border-emerald-500 focus:outline-none w-20"
                            placeholder="Singkat"
                          />
                        </div>
                      </div>

                      {/* Weight Control */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/50 px-3 py-1 rounded-xl">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Bobot:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={cat.weight}
                            onChange={(e) => updateAssessmentCategory(cat.id, { weight: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                            className="w-12 text-center font-black text-sm text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-lg py-0.5 focus:outline-none"
                          />
                          <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">%</span>
                        </div>

                        {assessmentConfig.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteAssessmentCategory(cat.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Kategori Penilaian"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Weight Slider */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400">0%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={cat.weight}
                        onChange={(e) => updateAssessmentCategory(cat.id, { weight: Number(e.target.value) })}
                        className="flex-1 accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400">100%</span>
                    </div>

                    {/* Columns in this category */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Kolom Penilaian Pada Kategori Ini:
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {(cat.columns || []).map((col) => (
                          <div
                            key={col.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                          >
                            <input
                              type="text"
                              value={col.label}
                              onChange={(e) => updateAssessmentColumn(cat.id, col.id, e.target.value)}
                              className="bg-transparent border-none text-xs font-bold focus:outline-none w-20 sm:w-24 text-slate-900 dark:text-white"
                            />
                            {cat.columns.length > 1 && (
                              <button
                                type="button"
                                onClick={() => deleteAssessmentColumn(cat.id, col.id)}
                                className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Hapus Kolom Ini"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}

                        {/* Quick Add Column Button / Input */}
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="+ Nama Kolom"
                            value={newColumnInputs[cat.id] || ''}
                            onChange={(e) => setNewColumnInputs({ ...newColumnInputs, [cat.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addAssessmentColumn(cat.id, newColumnInputs[cat.id]);
                                setNewColumnInputs({ ...newColumnInputs, [cat.id]: '' });
                              }
                            }}
                            className="w-28 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              addAssessmentColumn(cat.id, newColumnInputs[cat.id]);
                              setNewColumnInputs({ ...newColumnInputs, [cat.id]: '' });
                            }}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
                            title="Tambah Kolom"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* 4. Form Tambah Kategori Baru */}
            {!isAddingCategory ? (
              <button
                type="button"
                onClick={() => setIsAddingCategory(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PlusCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>Tambah Kategori Penilaian Baru (misal: Proyek, Kuis, Portofolio, Sikap)</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Tambah Kategori Penilaian Baru</h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Kategori</label>
                    <input
                      type="text"
                      placeholder="Contoh: Proyek / Portofolio / Keaktifan"
                      value={newCategoryForm.name}
                      onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                      className="w-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Bobot (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newCategoryForm.weight}
                      onChange={(e) => setNewCategoryForm({ ...newCategoryForm, weight: Number(e.target.value) })}
                      className="w-full text-xs font-bold text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCategoryForm.name.trim()) {
                        showToast('Nama kategori wajib diisi!', 'error');
                        return;
                      }
                      addAssessmentCategory(newCategoryForm);
                      setNewCategoryForm({ name: '', shortName: '', weight: 20 });
                      setIsAddingCategory(false);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Simpan Kategori Baru
                  </button>
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAssessmentConfigModalOpen(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Selesai & Terapkan Perubahan
              </button>
            </div>

          </div>
        </ModalDrawer>
      )}

    </div>
  );
};

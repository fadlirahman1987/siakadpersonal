import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { KopSurat } from '../components/common/KopSurat';
import { ModalDrawer } from '../components/common/ModalDrawer';
import { getSupabaseClient, cleanSupabaseUrl } from '../lib/supabaseClient';
import {
  School,
  Users,
  BookOpen,
  Calendar,
  Cloud,
  History,
  Printer,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Tag,
  Search,
  Key,
  Database,
  FileSpreadsheet,
  Upload,
  UserPlus,
  Table,
  LayoutGrid,
  Copy,
  Check,
  RefreshCw,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  ExternalLink,
  Code,
  Sparkles,
  FileText,
  ArrowLeftRight,
  Shuffle,
  GraduationCap,
  Clock,
  CalendarDays,
  CalendarRange,
  Layers,
  Filter,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  CheckCheck,
  HardDrive
} from 'lucide-react';

export const SettingsView = () => {
  const {
    schoolSettings,
    setSchoolSettings,
    classes,
    setClasses,
    addClass,
    updateClass,
    deleteClass,
    students,
    setStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    importBulkStudents,
    moveStudentToClass,
    swapStudentsClasses,
    batchMoveStudents,
    copyStudentsFromPeriod,
    promoteStudentsToNextGrade,
    subjects,
    setSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    schedules,
    setSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    attendanceRecords,
    setAttendanceRecords,
    grades,
    setGrades,
    assessmentConfig,
    calculateStudentGrade,
    kkm,
    teachingJournals,
    setTeachingJournals,
    guidanceSchedules,
    setGuidanceSchedules,
    homeVisits,
    setHomeVisits,
    guruWaliStudentIds,
    setGuruWaliStudentIds,
    holidays,
    setHolidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    academicYears,
    setAcademicYears,
    activeAcademicYear,
    activeSemester,
    activePeriodKey,
    switchAcademicPeriod,
    addAcademicYear,
    deleteAcademicYear,
    resetCurrentPeriodData,
    walasMonthlyAttendance,
    setWalasMonthlyAttendance,
    versionLogs,
    syncToCloud,
    pullFromCloud,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('classes'); // 'academic-year' | 'classes' | 'school' | 'subjects' | 'holidays' | 'supabase' | 'changelog' | 'print'
  const [newYearInput, setNewYearInput] = useState('');
  const [selectedTargetYear, setSelectedTargetYear] = useState(activeAcademicYear);
  const [selectedTargetSemester, setSelectedTargetSemester] = useState(activeSemester);

  // Student Swap & Move Modal States
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapStudentAId, setSwapStudentAId] = useState('');
  const [swapStudentBId, setSwapStudentBId] = useState('');

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveStudentId, setMoveStudentId] = useState('');
  const [moveTargetClassId, setMoveTargetClassId] = useState(classes[0]?.id || 1);

  // Promotion / Kenaikan Tingkat Modal State
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [promotionMappings, setPromotionMappings] = useState({});
  const [stayedStudentIds, setStayedStudentIds] = useState([]);
  const [stayedSearchQuery, setStayedSearchQuery] = useState('');

  // Open Promotion Modal with smart default mappings
  const handleOpenPromotionModal = () => {
    const initialMappings = {};
    classes.forEach(c => {
      if (c.grade_level === 'X' || c.grade_level === '10' || c.grade_level === '1') {
        const nextCls = classes.find(nc => (nc.grade_level === 'XI' || nc.grade_level === '11' || nc.grade_level === '2') && nc.major === c.major);
        initialMappings[c.id] = nextCls ? nextCls.id : 'none';
      } else if (c.grade_level === 'XI' || c.grade_level === '11' || c.grade_level === '2') {
        const nextCls = classes.find(nc => (nc.grade_level === 'XII' || nc.grade_level === '12' || nc.grade_level === '3') && nc.major === c.major);
        initialMappings[c.id] = nextCls ? nextCls.id : 'graduate';
      } else {
        initialMappings[c.id] = 'graduate';
      }
    });
    setPromotionMappings(initialMappings);
    setStayedStudentIds([]);
    setStayedSearchQuery('');
    setIsPromotionModalOpen(true);
  };
  const [studentSearch, setStudentSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [selectedFilterClass, setSelectedFilterClass] = useState('all');

  // View Mode: 'table' | 'cards' (defaults to table for desktop/spreadsheet feel)
  const [studentViewMode, setStudentViewMode] = useState('table');
  const [classViewMode, setClassViewMode] = useState('table');

  // Modals / Drawers state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isCopiedSql, setIsCopiedSql] = useState(false);
  const [isSyncingToCloud, setIsSyncingToCloud] = useState(false);
  const [isSyncingFromCloud, setIsSyncingFromCloud] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingClass, setEditingClass] = useState(null);

  // Subject Modal State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    category: 'Kejuruan'
  });

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    class_id: classes[0]?.id || 1,
    subject_id: subjects[0]?.id || 1,
    day_name: 'Senin',
    start_time: '07:30',
    end_time: '10:00',
    room: 'Lab Komputer 3'
  });

  // Holiday Modal State
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    holiday_type: 'nasional'
  });
  const [holidaySearch, setHolidaySearch] = useState('');
  const [holidayTypeFilter, setHolidayTypeFilter] = useState('all');
  const [holidayViewMode, setHolidayViewMode] = useState('table'); // 'table' | 'grid'

  // Helper calculating duration in days
  const getHolidayDuration = (start, end) => {
    if (!start) return 1;
    const startDate = new Date(start);
    const endDate = new Date(end || start);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  };

  // Helper calculating real-time status (Sedang Berlangsung, Mendatang, Selesai)
  const getHolidayStatus = (start, end) => {
    if (!start) return { label: 'Mendatang', color: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30', dot: 'bg-sky-500' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end || start);
    e.setHours(23, 59, 59, 999);

    if (today >= s && today <= e) {
      return { label: 'Sedang Berlangsung', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500 animate-pulse' };
    }
    if (today < s) {
      return { label: 'Mendatang', color: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30', dot: 'bg-sky-500' };
    }
    return { label: 'Selesai', color: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30', dot: 'bg-slate-400' };
  };

  // Helper formatting readable date string in Indonesian
  const formatHolidayRange = (start, end) => {
    if (!start) return '-';
    const sDate = new Date(start);
    const sStr = sDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    if (!end || start === end) return sStr;
    const eDate = new Date(end);
    const eStr = eDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${sStr} — ${eStr}`;
  };

  // Subject Table States
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState('all');
  const [subjectViewMode, setSubjectViewMode] = useState('table'); // 'table' | 'grid'

  // Schedule Table States
  const [scheduleFilterDay, setScheduleFilterDay] = useState('all');
  const [scheduleFilterClass, setScheduleFilterClass] = useState('all');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleViewMode, setScheduleViewMode] = useState('table'); // 'table' | 'cards'
  const daySortOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7 };

  // JSON Backup & Restore States
  const [importedJsonData, setImportedJsonData] = useState(null);
  const [importedJsonSummary, setImportedJsonSummary] = useState(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isResetDataModalOpen, setIsResetDataModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isExportingJson, setIsExportingJson] = useState(false);

  // 1. Full Export to JSON
  const handleExportFullBackupJSON = () => {
    try {
      setIsExportingJson(true);
      const backupPayload = {
        app_name: "SIAKAD Personal",
        app_version: "v2.8.0",
        export_timestamp: new Date().toISOString(),
        export_date_readable: new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' }),
        academic_period: {
          active_academic_year: activeAcademicYear,
          active_semester: activeSemester,
          active_period_key: activePeriodKey
        },
        data: {
          school_settings: schoolSettings,
          academic_years: academicYears,
          classes: classes,
          students: students,
          subjects: subjects,
          schedules: schedules,
          attendance_records: attendanceRecords,
          teaching_journals: teachingJournals,
          grades: grades,
          assessment_config: assessmentConfig,
          guidance_schedules: guidanceSchedules,
          guru_wali_students: guruWaliStudentIds,
          home_visits: homeVisits,
          holidays: holidays,
          walas_monthly_attendance: walasMonthlyAttendance,
          kkm: kkm || 75
        }
      };

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeYear = (activeAcademicYear || '2026-2027').replace(/\//g, '-');
      const dateSlug = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `SIAKAD_BACKUP_${safeYear}_SM${activeSemester}_${dateSlug}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('File cadangan JSON berhasil diunduh dan tersimpan di komputer Anda!', 'success');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch (err) {
      showToast(`Gagal mengekspor JSON: ${err.message}`, 'error');
    } finally {
      setIsExportingJson(false);
    }
  };

  // 2. Specific Data Export to JSON
  const handleExportSpecificJSON = (type) => {
    try {
      let specificData = {};
      let filename = `SIAKAD_${type}_${new Date().toISOString().split('T')[0]}.json`;

      if (type === 'siswa_kelas') {
        specificData = { classes, students };
      } else if (type === 'nilai_presensi') {
        specificData = { attendance_records: attendanceRecords, grades, assessment_config: assessmentConfig, kkm };
      } else if (type === 'jadwal_jurnal') {
        specificData = { subjects, schedules, teaching_journals: teachingJournals };
      } else if (type === 'wali_bk') {
        specificData = { guidance_schedules: guidanceSchedules, guru_wali_students: guruWaliStudentIds, home_visits: homeVisits, walas_monthly_attendance: walasMonthlyAttendance };
      }

      const payload = {
        app_name: "SIAKAD Personal",
        export_type: type,
        export_timestamp: new Date().toISOString(),
        data: specificData
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Data kategori ${type} berhasil diekspor ke JSON!`, 'success');
    } catch (err) {
      showToast(`Gagal mengekspor data: ${err.message}`, 'error');
    }
  };

  // 3. Handle Selecting / Reading JSON Backup File
  const handleSelectJSONFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      showToast('Harap pilih file dengan format .JSON!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const sourceData = parsed.data || parsed;

        // Calculate summary
        const summary = {
          classesCount: Array.isArray(sourceData.classes) ? sourceData.classes.length : 0,
          studentsCount: Array.isArray(sourceData.students) ? sourceData.students.length : 0,
          subjectsCount: Array.isArray(sourceData.subjects) ? sourceData.subjects.length : 0,
          schedulesCount: Array.isArray(sourceData.schedules) ? sourceData.schedules.length : 0,
          attendanceCount: sourceData.attendance_records ? Object.keys(sourceData.attendance_records).length : 0,
          journalsCount: Array.isArray(sourceData.teaching_journals) ? sourceData.teaching_journals.length : 0,
          gradesCount: sourceData.grades ? Object.keys(sourceData.grades).length : 0,
          holidaysCount: Array.isArray(sourceData.holidays) ? sourceData.holidays.length : 0,
          exportDate: parsed.export_date_readable || parsed.export_timestamp || 'Tidak diketahui',
          academicYear: parsed.academic_period?.active_academic_year || sourceData.school_settings?.academic_year || '-'
        };

        setImportedJsonData(sourceData);
        setImportedJsonSummary(summary);
        setIsRestoreModalOpen(true);
      } catch (err) {
        showToast(`File JSON tidak valid atau rusak: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 4. Confirm Restore
  const handleConfirmRestoreJSON = () => {
    if (!importedJsonData) return;

    try {
      const d = importedJsonData;
      
      if (d.school_settings) {
        setSchoolSettings(d.school_settings);
        localStorage.setItem('siakad_school_settings', JSON.stringify(d.school_settings));
      }
      if (Array.isArray(d.academic_years) && d.academic_years.length > 0) {
        setAcademicYears(d.academic_years);
        localStorage.setItem('siakad_academic_years', JSON.stringify(d.academic_years));
      }
      if (Array.isArray(d.classes)) {
        setClasses(d.classes);
        localStorage.setItem('siakad_classes', JSON.stringify(d.classes));
      }
      if (Array.isArray(d.students)) {
        setStudents(d.students);
        localStorage.setItem('siakad_students', JSON.stringify(d.students));
        localStorage.setItem(`siakad_students_${activePeriodKey}`, JSON.stringify(d.students));
      }
      if (Array.isArray(d.subjects)) {
        setSubjects(d.subjects);
        localStorage.setItem('siakad_subjects', JSON.stringify(d.subjects));
      }
      if (Array.isArray(d.schedules)) {
        setSchedules(d.schedules);
        localStorage.setItem('siakad_schedules', JSON.stringify(d.schedules));
      }
      if (d.attendance_records && typeof d.attendance_records === 'object') {
        setAttendanceRecords(d.attendance_records);
        localStorage.setItem(`siakad_attendance_${activePeriodKey}`, JSON.stringify(d.attendance_records));
      }
      if (Array.isArray(d.teaching_journals)) {
        setTeachingJournals(d.teaching_journals);
        localStorage.setItem(`siakad_journals_${activePeriodKey}`, JSON.stringify(d.teaching_journals));
      }
      if (d.grades && typeof d.grades === 'object') {
        setGrades(d.grades);
        localStorage.setItem(`siakad_grades_${activePeriodKey}`, JSON.stringify(d.grades));
      }
      if (d.assessment_config) {
        setAssessmentConfig(d.assessment_config);
        localStorage.setItem('siakad_assessment_config', JSON.stringify(d.assessment_config));
      }
      if (Array.isArray(d.guidance_schedules)) {
        setGuidanceSchedules(d.guidance_schedules);
        localStorage.setItem(`siakad_guidance_schedules_${activePeriodKey}`, JSON.stringify(d.guidance_schedules));
      }
      if (Array.isArray(d.guru_wali_students)) {
        setGuruWaliStudentIds(d.guru_wali_students);
        localStorage.setItem(`siakad_guru_wali_student_ids_${activePeriodKey}`, JSON.stringify(d.guru_wali_students));
      }
      if (Array.isArray(d.home_visits)) {
        setHomeVisits(d.home_visits);
        localStorage.setItem(`siakad_home_visits_${activePeriodKey}`, JSON.stringify(d.home_visits));
      }
      if (Array.isArray(d.holidays)) {
        setHolidays(d.holidays);
        localStorage.setItem('siakad_holidays', JSON.stringify(d.holidays));
      }
      if (d.walas_monthly_attendance) {
        setWalasMonthlyAttendance(d.walas_monthly_attendance);
        localStorage.setItem(`siakad_walas_monthly_attendance_${activePeriodKey}`, JSON.stringify(d.walas_monthly_attendance));
      }

      setIsRestoreModalOpen(false);
      setImportedJsonData(null);
      showToast('Alhamdulillah! Seluruh data berhasil dipulihkan 100% dari file cadangan JSON.', 'success');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      showToast(`Gagal memulihkan data: ${err.message}`, 'error');
    }
  };

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    name: '',
    nis: '',
    nisn: '',
    class_id: classes[0]?.id || 1,
    gender: 'L',
    parent_phone: '',
    address: ''
  });

  // Bulk Import Form State
  const [bulkImportForm, setBulkImportForm] = useState({
    class_id: classes[0]?.id || 1,
    rawText: ''
  });

  // Class Form State
  const [classForm, setClassForm] = useState({
    name: '',
    grade_level: 'X',
    major: 'Rekayasa Perangkat Lunak',
    is_homeroom_class: false
  });

  // School Settings form
  const [schoolForm, setSchoolForm] = useState(schoolSettings);

  // Supabase Config form
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: localStorage.getItem('siakad_sb_url') || '',
    anonKey: localStorage.getItem('siakad_sb_key') || ''
  });

  const handleSaveSchool = (e) => {
    e.preventDefault();
    setSchoolSettings(schoolForm);
    showToast('Profil sekolah dan KOP surat berhasil disimpan!', 'success');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('File harus berupa gambar (PNG, JPG, SVG, WebP)!', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran gambar logo maksimal 2MB!', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolForm(prev => ({ ...prev, logo_url: reader.result }));
        showToast('Logo sekolah berhasil dipilih! Klik Simpan Pengaturan Profil.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setSchoolForm(prev => ({ ...prev, logo_url: '' }));
    showToast('Logo dihapus! Klik Simpan Pengaturan Profil.', 'info');
  };

  const SUPABASE_SQL_SCHEMA = `-- ============================================================
-- SKRIP STRUKTUR DATABASE LENGKAP SIAKAD PERSONAL DI SUPABASE
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- 1. Tabel Profil Sekolah & Akun Guru
CREATE TABLE IF NOT EXISTS school_settings (
  id INT PRIMARY KEY DEFAULT 1,
  school_name TEXT,
  governing_body TEXT,
  npsn TEXT,
  postal_code TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  principal_name TEXT,
  principal_nip TEXT,
  teacher_name TEXT,
  teacher_nip TEXT,
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Tahun Ajaran
CREATE TABLE IF NOT EXISTS academic_years (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Rombel / Kelas
CREATE TABLE IF NOT EXISTS classes (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  grade_level TEXT,
  major TEXT,
  is_homeroom_class BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Siswa
CREATE TABLE IF NOT EXISTS students (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  nis TEXT NOT NULL,
  nisn TEXT,
  class_id BIGINT,
  gender TEXT,
  parent_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Mata Pelajaran
CREATE TABLE IF NOT EXISTS subjects (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Jadwal Mengajar KBM
CREATE TABLE IF NOT EXISTS schedules (
  id BIGINT PRIMARY KEY,
  academic_year_id BIGINT,
  semester_id INT,
  class_id BIGINT,
  subject_id BIGINT,
  day_name TEXT,
  start_time TEXT,
  end_time TEXT,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Presensi KBM Siswa
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  schedule_id BIGINT,
  date TEXT,
  kbm_status TEXT,
  records JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel Jurnal Mengajar Guru
CREATE TABLE IF NOT EXISTS teaching_journals (
  id BIGINT PRIMARY KEY,
  schedule_id BIGINT,
  date TEXT,
  topic_material TEXT,
  learning_objectives TEXT,
  teaching_activities TEXT,
  obstacles_and_solutions TEXT,
  kbm_status TEXT,
  documentation_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabel Rekap Nilai Siswa
CREATE TABLE IF NOT EXISTS grades (
  grade_key TEXT PRIMARY KEY,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabel Agenda Bimbingan Guru Wali
CREATE TABLE IF NOT EXISTS guidance_schedules (
  id TEXT PRIMARY KEY,
  title TEXT,
  scheduled_date TEXT,
  scheduled_time TEXT,
  location TEXT,
  guidance_type TEXT,
  notes TEXT,
  status TEXT,
  target_student_ids JSONB,
  attendance JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabel Siswa Binaan Guru Wali (Lintas Kelas)
CREATE TABLE IF NOT EXISTS guru_wali_students (
  student_id BIGINT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tabel Arsip Kunjungan Rumah (Home Visit)
CREATE TABLE IF NOT EXISTS home_visits (
  id TEXT PRIMARY KEY,
  student_id BIGINT,
  visit_date TEXT,
  companions TEXT,
  parents_met TEXT,
  address TEXT,
  purpose TEXT,
  findings TEXT,
  solution_agreement TEXT,
  follow_up TEXT,
  evidence_url TEXT,
  evidence_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Tabel Kalender Libur
CREATE TABLE IF NOT EXISTS holidays (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  holiday_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Tabel Presensi Bulanan Wali Kelas
CREATE TABLE IF NOT EXISTS walas_monthly_attendance (
  id TEXT PRIMARY KEY,
  period_key TEXT,
  class_id BIGINT,
  month_year TEXT,
  records JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) & Akses Anonymous
-- ============================================================
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE guru_wali_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE walas_monthly_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all on school_settings" ON school_settings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on academic_years" ON academic_years FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on classes" ON classes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on students" ON students FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on subjects" ON subjects FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on schedules" ON schedules FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on attendance_records" ON attendance_records FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on teaching_journals" ON teaching_journals FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on grades" ON grades FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on guidance_schedules" ON guidance_schedules FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on guru_wali_students" ON guru_wali_students FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on home_visits" ON home_visits FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on holidays" ON holidays FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on walas_monthly_attendance" ON walas_monthly_attendance FOR ALL TO anon USING (true) WITH CHECK (true);
`;

  const handleCopySqlScript = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setIsCopiedSql(true);
    showToast('Skrip SQL berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setIsCopiedSql(false), 3000);
  };

  const handleSaveSupabase = (e) => {
    e.preventDefault();
    const cleanedUrl = cleanSupabaseUrl(supabaseConfig.url);
    const cleanedKey = (supabaseConfig.anonKey || '').trim();
    setSupabaseConfig({ url: cleanedUrl, anonKey: cleanedKey });
    localStorage.setItem('siakad_sb_url', cleanedUrl);
    localStorage.setItem('siakad_sb_key', cleanedKey);
    showToast('Konfigurasi Supabase Cloud berhasil disimpan!', 'success');
  };

  const handleTestSupabaseConnection = async () => {
    const cleanedUrl = cleanSupabaseUrl(supabaseConfig.url);
    const cleanedKey = (supabaseConfig.anonKey || '').trim();

    setSupabaseConfig({ url: cleanedUrl, anonKey: cleanedKey });
    localStorage.setItem('siakad_sb_url', cleanedUrl);
    localStorage.setItem('siakad_sb_key', cleanedKey);

    const client = getSupabaseClient();
    if (!client) {
      showToast('Harap masukkan Project URL dan Anon Key terlebih dahulu!', 'error');
      return;
    }
    try {
      const { data, error } = await client.from('school_settings').select('*').limit(1);
      
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation "public.school_settings"')) {
          showToast('Koneksi Terhubung! Namun tabel belum dibuat. Harap jalankan Skrip SQL Schema di SQL Editor Supabase.', 'info');
        } else if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('violates row-level security')) {
          showToast('Koneksi Terhubung! Namun kebijakan RLS membatasi akses. Pastikan skrip RLS pada SQL Schema sudah dijalankan.', 'warning');
        } else if (error.message?.includes('Invalid path') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
          showToast('Format URL salah: Pastikan Project URL berupa https://<PROJECT-REF>.supabase.co (bukan URL dashboard).', 'error');
        } else {
          showToast(`Koneksi terhubung tapi ada catatan: ${error.message}`, 'info');
        }
      } else {
        showToast('Koneksi ke Supabase Cloud Berhasil 100%! Data terdeteksi.', 'success');
      }
    } catch (err) {
      showToast(`Gagal terhubung ke Supabase: ${err.message}`, 'error');
    }
  };

  const handleSyncToSupabase = async () => {
    await syncToCloud();
  };

  const handlePullFromSupabase = async () => {
    await pullFromCloud();
  };

  // Student Submit
  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.nis.trim()) {
      showToast('Nama siswa dan NIS wajib diisi!', 'error');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        ...studentForm,
        class_id: Number(studentForm.class_id)
      });
      setEditingStudent(null);
    } else {
      addStudent({
        ...studentForm,
        class_id: Number(studentForm.class_id)
      });
    }

    setIsAddStudentOpen(false);
    setStudentForm({
      name: '',
      nis: '',
      nisn: '',
      class_id: classes[0]?.id || 1,
      gender: 'L',
      parent_phone: '',
      address: ''
    });
  };

  // Bulk Import Submit
  const handleSaveBulkImport = (e) => {
    e.preventDefault();
    if (!bulkImportForm.rawText.trim()) {
      showToast('Harap masukkan data teks daftar siswa!', 'error');
      return;
    }

    const lines = bulkImportForm.rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedStudents = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        name: parts[0],
        nis: parts[1] || '',
        gender: parts[2] ? parts[2].toUpperCase() : 'L'
      };
    });

    if (parsedStudents.length === 0) {
      showToast('Tidak ada data siswa yang valid ditemukan!', 'error');
      return;
    }

    importBulkStudents(bulkImportForm.class_id, parsedStudents);
    setIsBulkImportOpen(false);
    setBulkImportForm({ class_id: classes[0]?.id || 1, rawText: '' });
  };

  // Class Handlers
  const openAddClassModal = () => {
    setEditingClass(null);
    setClassForm({
      name: '',
      grade_level: 'X',
      major: 'Rekayasa Perangkat Lunak',
      is_homeroom_class: false
    });
    setIsAddClassOpen(true);
  };

  const openEditClassModal = (cls) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name,
      grade_level: cls.grade_level || 'X',
      major: cls.major || 'Rekayasa Perangkat Lunak',
      is_homeroom_class: Boolean(cls.is_homeroom_class)
    });
    setIsAddClassOpen(true);
  };

  const handleSaveClass = (e) => {
    e.preventDefault();
    if (!classForm.name.trim()) {
      showToast('Nama kelas wajib diisi!', 'error');
      return;
    }
    if (editingClass) {
      updateClass(editingClass.id, classForm);
      setEditingClass(null);
    } else {
      addClass(classForm);
    }
    setIsAddClassOpen(false);
    setClassForm({
      name: '',
      grade_level: 'X',
      major: 'Rekayasa Perangkat Lunak',
      is_homeroom_class: false
    });
  };

  // Subject Handlers
  const openAddSubjectModal = () => {
    setEditingSubject(null);
    setSubjectForm({ name: '', code: `MAPEL-0${subjects.length + 1}`, category: 'Kejuruan' });
    setIsSubjectModalOpen(true);
  };

  const openEditSubjectModal = (sub) => {
    setEditingSubject(sub);
    setSubjectForm({ name: sub.name, code: sub.code, category: sub.category || 'Kejuruan' });
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim() || !subjectForm.code.trim()) {
      showToast('Nama mata pelajaran dan kode wajib diisi!', 'error');
      return;
    }

    if (editingSubject) {
      updateSubject(editingSubject.id, subjectForm);
    } else {
      addSubject(subjectForm);
    }
    setIsSubjectModalOpen(false);
  };

  const handleDeleteSubject = (subjectId) => {
    const sub = subjects.find(s => s.id === subjectId);
    if (window.confirm(`Yakin ingin menghapus mata pelajaran "${sub?.name}"? Jadwal yang menggunakan mapel ini juga akan terhapus.`)) {
      deleteSubject(subjectId);
    }
  };

  // Schedule Handlers
  const openAddScheduleModal = () => {
    setEditingSchedule(null);
    setScheduleForm({
      class_id: classes[0]?.id || 1,
      subject_id: subjects[0]?.id || 1,
      day_name: 'Senin',
      start_time: '07:30',
      end_time: '10:00',
      room: 'Lab Komputer 3'
    });
    setIsScheduleModalOpen(true);
  };

  const openEditScheduleModal = (sch) => {
    setEditingSchedule(sch);
    setScheduleForm({
      class_id: sch.class_id,
      subject_id: sch.subject_id,
      day_name: sch.day_name,
      start_time: sch.start_time,
      end_time: sch.end_time,
      room: sch.room || 'Ruang Teori'
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    const data = {
      ...scheduleForm,
      class_id: Number(scheduleForm.class_id),
      subject_id: Number(scheduleForm.subject_id)
    };

    if (editingSchedule) {
      updateSchedule(editingSchedule.id, data);
    } else {
      addSchedule(data);
    }
    setIsScheduleModalOpen(false);
  };

  const handleDeleteSchedule = (scheduleId) => {
    if (window.confirm('Yakin ingin menghapus jadwal mengajar ini?')) {
      deleteSchedule(scheduleId);
    }
  };

  // Holiday Modal Handlers
  const openAddHolidayModal = () => {
    setEditingHoliday(null);
    const today = new Date().toISOString().split('T')[0];
    setHolidayForm({
      name: '',
      start_date: today,
      end_date: today,
      holiday_type: 'nasional'
    });
    setIsHolidayModalOpen(true);
  };

  const openEditHolidayModal = (hol) => {
    setEditingHoliday(hol);
    setHolidayForm({
      name: hol.name || '',
      start_date: hol.start_date || '',
      end_date: hol.end_date || hol.start_date || '',
      holiday_type: hol.holiday_type || 'nasional'
    });
    setIsHolidayModalOpen(true);
  };

  const handleSaveHoliday = (e) => {
    e.preventDefault();
    if (!holidayForm.name.trim()) {
      showToast('Nama agenda libur wajib diisi!', 'warning');
      return;
    }
    if (!holidayForm.start_date) {
      showToast('Tanggal mulai libur wajib diisi!', 'warning');
      return;
    }

    const payload = {
      name: holidayForm.name.trim(),
      start_date: holidayForm.start_date,
      end_date: holidayForm.end_date || holidayForm.start_date,
      holiday_type: holidayForm.holiday_type || 'nasional'
    };

    if (editingHoliday) {
      updateHoliday(editingHoliday.id, payload);
    } else {
      addHoliday(payload);
    }
    setIsHolidayModalOpen(false);
  };

  const handleDeleteHoliday = (holidayId) => {
    const item = holidays.find(h => h.id === holidayId);
    if (window.confirm(`Yakin ingin menghapus agenda libur "${item?.name || ''}"?`)) {
      deleteHoliday(holidayId);
    }
  };

  // Filter holidays with search & type
  const filteredHolidays = (holidays || []).filter(hol => {
    if (!hol) return false;
    const matchType = holidayTypeFilter === 'all' || hol.holiday_type === holidayTypeFilter;
    const q = (holidaySearch || '').toLowerCase();
    const matchSearch = String(hol.name || '').toLowerCase().includes(q) ||
      String(hol.start_date || '').includes(q) ||
      String(hol.end_date || '').includes(q);
    return matchType && matchSearch;
  });

  // Filter students with defensive null/type guards
  const filteredStudents = (students || []).filter(s => {
    if (!s) return false;
    const matchClass = selectedFilterClass === 'all' || s.class_id === Number(selectedFilterClass);
    const searchLow = (studentSearch || '').toLowerCase();
    const nameMatch = String(s.name || '').toLowerCase().includes(searchLow);
    const nisMatch = String(s.nis || '').includes(studentSearch || '');
    return matchClass && (nameMatch || nisMatch);
  });

  // Filter version logs with defensive null guards
  const filteredLogs = (versionLogs || []).filter(log => {
    if (!log) return false;
    const searchLow = (logSearch || '').toLowerCase();
    return (
      String(log.title || '').toLowerCase().includes(searchLow) ||
      String(log.version || '').toLowerCase().includes(searchLow) ||
      String(log.tag || '').toLowerCase().includes(searchLow)
    );
  });


  return (
    <div className="space-y-4 sm:space-y-6 pb-28 animate-fade-in max-w-full overflow-hidden">
      
      {/* 1. Header Banner */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl">
        <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <School size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Master Data & Pengaturan Mandiri</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola profil sekolah, kelas, siswa, mapel, jadwal, kalender libur, serta log rilis aplikasi.
        </p>
      </div>

      {/* 2. Responsive Horizontal Scroll Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0">
        {[
          { id: 'academic-year', label: 'Tahun Ajaran & Semester', icon: Calendar },
          { id: 'classes', label: 'Kelas & Siswa', icon: Users },
          { id: 'school', label: 'Profil & KOP', icon: School },
          { id: 'subjects', label: 'Mapel & Jadwal', icon: BookOpen },
          { id: 'holidays', label: 'Kalender Libur', icon: Calendar },
          { id: 'supabase', label: 'Supabase Cloud', icon: Cloud },
          { id: 'backup', label: 'Cadangan & Backup JSON', icon: Database },
          { id: 'changelog', label: 'Version Log', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-200/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-800'
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* 3.0 TAB: TAHUN AJARAN & SEMESTER */}
      {activeTab === 'academic-year' && (
        <div className="space-y-5">
          
          {/* Active Period Highlight Card */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-emerald-100 border border-white/20 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span>Status Periode Aktif Saat Ini</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Tahun Ajaran {activeAcademicYear}
                </h3>
                <p className="text-sm font-semibold text-emerald-100 mt-1 flex items-center gap-2">
                  <span>Semester {activeSemester === '1' ? '1 (Ganjil - Juli s.d. Desember)' : '2 (Genap - Januari s.d. Juni)'}</span>
                </p>
                <p className="text-xs text-emerald-200 mt-2 max-w-xl">
                  Seluruh data presensi harian, jurnal KBM, nilai capaian siswa, dan rekap absensi bulanan walas terisolasi secara otomatis pada periode ini. Saat berganti semester atau tahun ajaran, data akan mulai kosong kembali secara otomatis tanpa menghapus data master rombel & siswa.
                </p>
              </div>

              {/* Data Summary Stats on Active Period */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shrink-0">
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <div className="text-lg font-black text-white">
                    {Object.keys(attendanceRecords || {}).length}
                  </div>
                  <div className="text-[10px] text-emerald-200 font-medium">Sesi Presensi</div>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <div className="text-lg font-black text-white">
                    {Object.keys(grades || {}).reduce((acc, k) => acc + Object.keys(grades[k] || {}).length, 0)}
                  </div>
                  <div className="text-[10px] text-emerald-200 font-medium">Nilai Siswa</div>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <div className="text-lg font-black text-white">
                    {(teachingJournals || []).length}
                  </div>
                  <div className="text-[10px] text-emerald-200 font-medium">Jurnal KBM</div>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <div className="text-lg font-black text-white">
                    {Object.keys(walasMonthlyAttendance || {}).length}
                  </div>
                  <div className="text-[10px] text-emerald-200 font-medium">Rekap Walas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Period Activation Box */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Calendar size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Ganti / Aktifkan Periode Akademik</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Pilih Tahun Ajaran dan Semester yang ingin diaktifkan. Data operasional akan dimuat sesuai periode yang dipilih.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tahun Ajaran
                </label>
                <select
                  value={selectedTargetYear}
                  onChange={(e) => setSelectedTargetYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.name}>
                      Tahun Ajaran {ay.name} {ay.name === activeAcademicYear ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Semester
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTargetSemester('1')}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedTargetSemester === '1'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    1 (Ganjil)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTargetSemester('2')}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedTargetSemester === '2'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    2 (Genap)
                  </button>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    switchAcademicPeriod(selectedTargetYear, selectedTargetSemester);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  <span>Terapkan Periode Aktif</span>
                </button>
              </div>
            </div>
          </div>

          {/* Academic Years List Management */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Daftar Tahun Ajaran
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tambahkan tahun ajaran baru atau kelola tahun ajaran yang tersedia.
                </p>
              </div>

              {/* Add New Academic Year Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newYearInput.trim()) {
                    addAcademicYear(newYearInput.trim());
                    setNewYearInput('');
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Contoh: 2027/2028"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none w-36 sm:w-44"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah</span>
                </button>
              </form>
            </div>

            {/* Table of Academic Years */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-extrabold uppercase text-[11px]">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Tahun Ajaran</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {academicYears.map((ay, idx) => {
                    const isActiveYear = ay.name === activeAcademicYear;

                    return (
                      <tr key={ay.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-500 dark:text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {ay.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {isActiveYear ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              Aktif Sekarang
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold text-[10px]">
                              Tidak Aktif
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isActiveYear && (
                              <button
                                type="button"
                                onClick={() => switchAcademicPeriod(ay.name, activeSemester)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/20 transition-all cursor-pointer"
                              >
                                Aktifkan
                              </button>
                            )}
                            {!isActiveYear && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Yakin ingin menghapus Tahun Ajaran ${ay.name}?`)) {
                                    deleteAcademicYear(ay.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                                title="Hapus Tahun Ajaran"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reset Current Period Data (Danger Zone) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h5 className="font-extrabold text-sm text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <Trash2 size={16} />
                <span>Kosongkan Data Transaksi Periode Ini</span>
              </h5>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                Mengosongkan catatan presensi, nilai siswa, dan jurnal mengajar pada periode <strong>{activeAcademicYear} Semester {activeSemester === '1' ? 'Ganjil' : 'Genap'}</strong> saja. Data Master Siswa, Kelas, dan Mapel tetap aman.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`PERINGATAN: Anda yakin ingin mengosongkan seluruh data presensi, nilai, dan jurnal pada periode ${activeAcademicYear} Semester ${activeSemester === '1' ? 'Ganjil' : 'Genap'}? Tindakan ini tidak dapat dibatalkan.`)) {
                  resetCurrentPeriodData();
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              Kosongkan Periode Ini
            </button>
          </div>

        </div>
      )}


      {/* 3.1 TAB: KELAS & SISWA */}
      {activeTab === 'classes' && (
        <div className="space-y-5">
          
          {/* Active Period & Migration Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-900/20 shrink-0 mt-0.5">
                <ArrowLeftRight size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Penempatan Rombel: {activeAcademicYear} - Semester {activeSemester === '1' ? '1 (Ganjil)' : '2 (Genap)'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Terisolasi Per Semester
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                  Perubahan kelas atau penukaran siswa (mix/rolling kelas) di semester ini <strong>tidak akan mengubah atau merusak</strong> riwayat kelas, presensi, dan nilai di semester sebelumnya.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleOpenPromotionModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-900/20 active:scale-95 transition-all cursor-pointer"
                title="Proses Kenaikan Kelas untuk Tahun Ajaran Baru"
              >
                <GraduationCap size={15} />
                <span>Kenaikan Kelas (Naik Tingkat)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSwapStudentAId(students[0]?.id || '');
                  setSwapStudentBId(students[1]?.id || '');
                  setIsSwapModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-900/20 active:scale-95 transition-all cursor-pointer"
              >
                <Shuffle size={14} />
                <span>Tukar Kelas (Swap Siswa)</span>
              </button>

              {activeSemester === '2' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Anda yakin ingin menyalin dan mereset susunan kelas seluruh siswa dari ${activeAcademicYear} Semester 1 (Ganjil)?`)) {
                      copyStudentsFromPeriod(activeAcademicYear, '1');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
                  title="Salin penempatan kelas dari Semester 1"
                >
                  <RefreshCw size={13} />
                  <span>Salin dari Sem 1</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Manajemen Siswa & Rombel</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total {students.length} siswa dalam {classes.length} rombel aktif
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setStudentForm({
                    name: '',
                    nis: `26010${Math.floor(100 + Math.random() * 900)}`,
                    nisn: '',
                    class_id: classes[0]?.id || 1,
                    gender: 'L',
                    parent_phone: '',
                    address: ''
                  });
                  setIsAddStudentOpen(true);
                }}
                className="col-span-2 sm:col-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
              >
                <UserPlus size={14} />
                <span>+ Tambah Siswa</span>
              </button>

              <button
                onClick={() => setIsBulkImportOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
              >
                <FileSpreadsheet size={14} />
                <span>Import Massal</span>
              </button>

              <button
                onClick={openAddClassModal}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs active:scale-95 transition-all"
              >
                <Plus size={14} />
                <span>+ Tambah Kelas</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: DAFTAR ROMBEL / KELAS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Daftar Rombel / Kelas</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">
                  {classes.length}
                </span>
              </h4>

              {/* View Switcher: Table vs Cards */}
              <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
                <button
                  onClick={() => setClassViewMode('table')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    classViewMode === 'table'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Tampilan Tabel"
                >
                  <Table size={13} />
                  <span className="hidden sm:inline">Tabel</span>
                </button>
                <button
                  onClick={() => setClassViewMode('cards')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    classViewMode === 'cards'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Tampilan Kartu (Grid)"
                >
                  <LayoutGrid size={13} />
                  <span className="hidden sm:inline">Kartu</span>
                </button>
              </div>
            </div>

            {/* Table View for Classes */}
            {classViewMode === 'table' ? (
              <div className="overflow-x-auto glass-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3 w-10 text-center">No</th>
                      <th className="py-3 px-3 min-w-[140px]">Nama Rombel / Kelas</th>
                      <th className="py-3 px-3 w-20 text-center">Tingkat</th>
                      <th className="py-3 px-3 min-w-[180px]">Program Keahlian / Jurusan</th>
                      <th className="py-3 px-3 w-28 text-center">Peran Guru</th>
                      <th className="py-3 px-3 w-28 text-center">Jumlah Siswa</th>
                      <th className="py-3 px-3 w-24 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {classes.map((cls, idx) => {
                      const count = students.filter(s => s.class_id === cls.id).length;
                      return (
                        <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-extrabold text-slate-900 dark:text-white text-xs">{cls.name}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {cls.grade_level || 'X'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-medium">{cls.major}</td>
                          <td className="py-2.5 px-3 text-center">
                            {cls.is_homeroom_class ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                                Wali Kelas
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                Pengajar
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                              {count} Siswa
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openEditClassModal(cls)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                                title="Edit Kelas"
                              >
                                <Edit2 size={13} />
                              </button>
                              {classes.length > 1 && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Yakin ingin menghapus kelas "${cls.name}" beserta ${count} siswa di dalamnya?`)) {
                                      deleteClass(cls.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-900/60 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 transition-colors shadow-sm"
                                  title="Hapus Kelas"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Card View for Classes */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {classes.map((cls) => {
                  const count = students.filter(s => s.class_id === cls.id).length;
                  return (
                    <div key={cls.id} className="glass-card p-3.5 sm:p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">{cls.name}</span>
                        {cls.is_homeroom_class && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                            Wali Kelas
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{cls.major}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{count} Siswa Terdaftar</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditClassModal(cls)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 transition-colors"
                            title="Edit Kelas"
                          >
                            <Edit2 size={13} />
                          </button>
                          {classes.length > 1 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Yakin ingin menghapus kelas "${cls.name}" beserta ${count} siswa di dalamnya?`)) {
                                  deleteClass(cls.id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                              title="Hapus Kelas"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: DAFTAR SISWA */}
          <div className="space-y-3 pt-2">
            
            {/* Search, Filter & View Switcher Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari siswa berdasarkan nama atau NIS..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
                />
              </div>

              {/* Filter by Class & View Switcher */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedFilterClass}
                  onChange={(e) => setSelectedFilterClass(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
                >
                  <option value="all">Semua Kelas ({students.length})</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {/* View Switcher: Table vs Cards */}
                <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700 shrink-0">
                  <button
                    onClick={() => setStudentViewMode('table')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      studentViewMode === 'table'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Tampilan Tabel Spreadsheet"
                  >
                    <Table size={13} />
                    <span className="hidden sm:inline">Tabel</span>
                  </button>
                  <button
                    onClick={() => setStudentViewMode('cards')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      studentViewMode === 'cards'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Tampilan Kartu"
                  >
                    <LayoutGrid size={13} />
                    <span className="hidden sm:inline">Kartu</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table View for Students */}
            {studentViewMode === 'table' ? (
              <div className="overflow-x-auto glass-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3 w-10 text-center sticky left-0 z-20 bg-slate-100 dark:bg-slate-900">No</th>
                      <th className="py-3 px-3 w-28 sticky left-10 z-20 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">NIS</th>
                      <th className="py-3 px-3 w-28">NISN</th>
                      <th className="py-3 px-3 min-w-[180px]">Nama Lengkap Siswa</th>
                      <th className="py-3 px-2.5 w-14 text-center">L/P</th>
                      <th className="py-3 px-3 w-28 text-center">Rombel / Kelas</th>
                      <th className="py-3 px-3 min-w-[130px]">No. HP Orang Tua</th>
                      <th className="py-3 px-3 min-w-[200px]">Alamat</th>
                      <th className="py-3 px-3 w-20 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-slate-500 font-medium">
                          Tidak ada data siswa ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st, idx) => {
                        const cls = classes.find(c => c.id === st.class_id);
                        return (
                          <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="py-2.5 px-3 text-center font-bold text-slate-400 sticky left-0 z-10 bg-white dark:bg-slate-900">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300 sticky left-10 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{st.nis}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{st.nisn || '-'}</td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900 dark:text-white text-xs">{st.name}</div>
                            </td>
                            <td className="py-2.5 px-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                st.gender === 'L'
                                  ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                              }`}>
                                {st.gender === 'L' ? 'L' : 'P'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                {cls?.name}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                              {st.parent_phone || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[220px]">
                              {st.address || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMoveStudentId(st.id);
                                    setMoveTargetClassId(st.class_id);
                                    setIsMoveModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 transition-colors shadow-sm"
                                  title="Pindah / Mutasi Rombel Siswa"
                                >
                                  <ArrowLeftRight size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingStudent(st);
                                    setStudentForm(st);
                                    setIsAddStudentOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                                  title="Edit Siswa"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => deleteStudent(st.id)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-900/60 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 transition-colors shadow-sm"
                                  title="Hapus Siswa"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Card View for Students */
              <div className="space-y-2">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-10 glass-card rounded-2xl">
                    <Users size={32} className="mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tidak ada data siswa ditemukan</p>
                    <button
                      onClick={() => setIsAddStudentOpen(true)}
                      className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
                    >
                      Tambah Siswa Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                    {filteredStudents.map((st) => {
                      const cls = classes.find(c => c.id === st.class_id);

                      return (
                        <div
                          key={st.id}
                          className="glass-card p-3 sm:p-4 rounded-2xl hover:border-slate-400 dark:hover:border-slate-700 transition-all flex items-start justify-between gap-2.5 overflow-hidden"
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                              {st.gender === 'L' ? '👦' : '👧'}
                            </div>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-full">
                                  {st.name}
                                </h4>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                                  {cls?.name}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                NIS: <strong className="text-slate-800 dark:text-slate-200">{st.nis}</strong> {st.nisn ? `• NISN: ${st.nisn}` : ''}
                              </p>
                              {st.parent_phone && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  HP: <strong className="text-slate-700 dark:text-slate-300">{st.parent_phone}</strong>
                                </p>
                              )}
                              {st.address && (
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                  {st.address}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action buttons: Move, Edit & Delete */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setMoveStudentId(st.id);
                                setMoveTargetClassId(st.class_id);
                                setIsMoveModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 transition-colors shadow-sm"
                              title="Pindah / Mutasi Rombel Siswa"
                            >
                              <ArrowLeftRight size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingStudent(st);
                                setStudentForm(st);
                                setIsAddStudentOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                              title="Edit Siswa"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => deleteStudent(st.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-900/60 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 transition-colors shadow-sm"
                              title="Hapus Siswa"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3.2 Profil Sekolah & KOP Surat */}
      {activeTab === 'school' && (
        <form onSubmit={handleSaveSchool} className="space-y-5">
          <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-5">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <School size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Identitas Sekolah & Logo Resmi KOP Surat</span>
            </h3>

            {/* SEKSI UPLOAD & PENGATURAN LOGO SEKOLAH */}
            <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Upload size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Logo Resmi Sekolah (Ditampilkan di Sisi Kiri KOP Surat)</span>
              </span>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Logo Preview Avatar */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-2 shadow-sm shrink-0 overflow-hidden">
                  {schoolForm.logo_url ? (
                    <img
                      src={schoolForm.logo_url}
                      alt="Logo Sekolah"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-1">
                      <School size={24} className="mx-auto text-slate-400 mb-0.5" />
                      <span className="text-[9px] font-bold text-slate-400 block leading-tight">Belum Ada Logo</span>
                    </div>
                  )}
                </div>

                {/* Upload & Management Controls */}
                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all">
                      <Upload size={14} />
                      <span>Unggah Logo (PNG / JPG / SVG)</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {schoolForm.logo_url && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-bold transition-all active:scale-95"
                      >
                        <Trash2 size={13} />
                        <span>Hapus Logo</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Format disarankan: <strong>PNG transparan</strong> atau <strong>JPG</strong> rasio 1:1, ukuran file maksimal <strong>2 MB</strong>. Logo akan tersimpan otomatis dan dicetak pada sisi kiri seluruh lembar dokumen resmi sekolah.
                  </p>
                </div>
              </div>
            </div>

            {/* FORM INPUT IDENTITAS SEKOLAH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Nama Sekolah Resmi *</label>
                <input
                  type="text"
                  required
                  value={schoolForm.school_name}
                  onChange={(e) => setSchoolForm({ ...schoolForm, school_name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Instansi / Dinas Pembina (Bisa Multi-Baris)</label>
                <input
                  type="text"
                  value={schoolForm.governing_body}
                  onChange={(e) => setSchoolForm({ ...schoolForm, governing_body: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">NPSN</label>
                <input
                  type="text"
                  value={schoolForm.npsn}
                  onChange={(e) => setSchoolForm({ ...schoolForm, npsn: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Telepon</label>
                <input
                  type="text"
                  value={schoolForm.phone}
                  onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={schoolForm.email}
                  onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Alamat Lengkap</label>
              <textarea
                rows={2}
                value={schoolForm.address}
                onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={schoolForm.principal_name}
                  onChange={(e) => setSchoolForm({ ...schoolForm, principal_name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={schoolForm.principal_nip}
                  onChange={(e) => setSchoolForm({ ...schoolForm, principal_nip: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Nama Guru Pemilik Akun</label>
                <input
                  type="text"
                  value={schoolForm.teacher_name}
                  onChange={(e) => setSchoolForm({ ...schoolForm, teacher_name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">NIP Guru</label>
                <input
                  type="text"
                  value={schoolForm.teacher_nip}
                  onChange={(e) => setSchoolForm({ ...schoolForm, teacher_nip: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Save size={15} />
                <span>Simpan Pengaturan Profil</span>
              </button>
            </div>

            {/* PRATINJAU LANGSUNG KOP SURAT */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                Pratinjau Tampilan KOP Surat Resmi (Sisi Kiri Berlogo):
              </span>
              <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-300 shadow-sm select-text">
                <KopSurat
                  title="CONTOH SURAT KELUAR / REKAP LAPORAN RESMI"
                  subtitle="PRATINJAU TAMPILAN KOP SURAT BERLOGO SEKOLAH"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 3.3 Mapel & Jadwal Mengajar (Table View Redesign) */}
      {activeTab === 'subjects' && (() => {
        // Filter subjects
        const filteredSubjects = (subjects || []).filter(sub => {
          if (!sub) return false;
          const matchCat = subjectCategoryFilter === 'all' || (sub.category || 'Kejuruan') === subjectCategoryFilter;
          const q = (subjectSearch || '').toLowerCase();
          const matchSearch = String(sub.name || '').toLowerCase().includes(q) ||
            String(sub.code || '').toLowerCase().includes(q) ||
            String(sub.category || '').toLowerCase().includes(q);
          return matchCat && matchSearch;
        });

        // Filter & Sort schedules by day of week and start time
        const filteredSchedules = (schedules || []).filter(sch => {
          if (!sch) return false;
          const matchDay = scheduleFilterDay === 'all' || sch.day_name === scheduleFilterDay;
          const matchClass = scheduleFilterClass === 'all' || sch.class_id === Number(scheduleFilterClass);
          const q = (scheduleSearch || '').toLowerCase();
          const sub = subjects.find(s => s.id === sch.subject_id);
          const c = classes.find(cl => cl.id === sch.class_id);
          const matchSearch = !q ||
            String(sub?.name || '').toLowerCase().includes(q) ||
            String(c?.name || '').toLowerCase().includes(q) ||
            String(sch.room || '').toLowerCase().includes(q) ||
            String(sch.day_name || '').toLowerCase().includes(q);
          return matchDay && matchClass && matchSearch;
        }).sort((a, b) => {
          const dayA = daySortOrder[a.day_name] || 99;
          const dayB = daySortOrder[b.day_name] || 99;
          if (dayA !== dayB) return dayA - dayB;
          return String(a.start_time || '').localeCompare(String(b.start_time || ''));
        });

        const subjectCategories = Array.from(new Set(subjects.map(s => s.category || 'Kejuruan'))).filter(Boolean);

        return (
          <div className="space-y-6 animate-fade-in">
            
            {/* ============================================================ */}
            {/* SECTION 1: MATA PELAJARAN YANG DIAMPU (TABLE VIEW) */}
            {/* ============================================================ */}
            <div className="space-y-3.5">
              {/* Toolbar & Filter Card */}
              <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3.5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Mata Pelajaran yang Diampu</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {subjects.length} Mapel
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Kelola daftar mata pelajaran, kode kurikulum, kelompok bidang studi, dan alokasi kelas.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Toggle View Mode */}
                    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setSubjectViewMode('table')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                          subjectViewMode === 'table'
                            ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title="Tampilan Tabel"
                      >
                        <Table size={14} />
                        <span className="hidden sm:inline">Tabel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubjectViewMode('grid')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                          subjectViewMode === 'grid'
                            ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title="Tampilan Grid Kartu"
                      >
                        <LayoutGrid size={14} />
                        <span className="hidden sm:inline">Grid Kartu</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={openAddSubjectModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Tambah Mapel</span>
                    </button>
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="Cari nama mapel, kode kurikulum, atau kategori..."
                      value={subjectSearch}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <select
                    value={subjectCategoryFilter}
                    onChange={(e) => setSubjectCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Semua Kategori ({subjects.length})</option>
                    {subjectCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Display (Table / Grid) */}
              {filteredSubjects.length === 0 ? (
                <div className="text-center py-10 glass-card rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
                  <BookOpen size={30} className="mx-auto text-slate-400 dark:text-slate-600 mb-1" />
                  <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                    {subjectSearch || subjectCategoryFilter !== 'all' ? 'Tidak ada mata pelajaran yang cocok dengan filter.' : 'Belum ada mata pelajaran terdaftar.'}
                  </p>
                  <button
                    type="button"
                    onClick={openAddSubjectModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                  >
                    <Plus size={13} />
                    <span>Tambah Mapel Pertama</span>
                  </button>
                </div>
              ) : subjectViewMode === 'table' ? (
                /* SUBJECT TABLE VIEW */
                <div className="glass-card rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[11px]">
                          <th className="py-3 px-3 sm:px-4 text-center w-12">#</th>
                          <th className="py-3 px-3 sm:px-4 min-w-[130px]">Kode Mapel</th>
                          <th className="py-3 px-3 sm:px-4 min-w-[240px]">Nama Mata Pelajaran</th>
                          <th className="py-3 px-3 sm:px-4 min-w-[160px]">Kategori / Bidang</th>
                          <th className="py-3 px-3 sm:px-4 text-center min-w-[150px]">Alokasi Jadwal KBM</th>
                          <th className="py-3 px-3 sm:px-4 text-center min-w-[100px]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredSubjects.map((sub, idx) => {
                          const linkedSchedules = schedules.filter(sc => sc.subject_id === sub.id);
                          const linkedClassNames = Array.from(new Set(linkedSchedules.map(sc => {
                            const cl = classes.find(c => c.id === sc.class_id);
                            return cl?.name;
                          }).filter(Boolean)));

                          return (
                            <tr
                              key={sub.id}
                              className="hover:bg-emerald-500/5 dark:hover:bg-slate-800/40 transition-colors group"
                            >
                              {/* 1. No */}
                              <td className="py-3.5 px-3 sm:px-4 text-center font-bold text-slate-400 dark:text-slate-500">
                                {idx + 1}
                              </td>

                              {/* 2. Kode */}
                              <td className="py-3.5 px-3 sm:px-4">
                                <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-black font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                  {sub.code}
                                </span>
                              </td>

                              {/* 3. Nama Mapel */}
                              <td className="py-3.5 px-3 sm:px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <BookOpen size={14} />
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                                      {sub.name}
                                    </div>
                                    {linkedClassNames.length > 0 && (
                                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                        Diajarkan di: {linkedClassNames.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* 4. Kategori */}
                              <td className="py-3.5 px-3 sm:px-4">
                                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {sub.category || 'Kejuruan'}
                                </span>
                              </td>

                              {/* 5. Alokasi Jadwal */}
                              <td className="py-3.5 px-3 sm:px-4 text-center">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                                  <span>{linkedSchedules.length} Sesi Jadwal</span>
                                </span>
                              </td>

                              {/* 6. Aksi */}
                              <td className="py-3.5 px-3 sm:px-4 text-center">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openEditSubjectModal(sub)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                    title="Edit Nama & Kode Mapel"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubject(sub.id)}
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                    title="Hapus Mata Pelajaran"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* SUBJECT GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSubjects.map((sub) => {
                    const scheduleCount = schedules.filter(sc => sc.subject_id === sub.id).length;

                    return (
                      <div
                        key={sub.id}
                        className="glass-card p-4 rounded-2xl space-y-3 flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-700 transition-all border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                              {sub.code}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {sub.category || 'Kejuruan'}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                            {sub.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Digunakan di <strong>{scheduleCount}</strong> jadwal kelas
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                          <button
                            onClick={() => openEditSubjectModal(sub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                            title="Edit Nama & Kode Mapel"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(sub.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                            title="Hapus Mata Pelajaran"
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* SECTION 2: JADWAL MENGAJAR RUTIN MINGGUAN (TABLE VIEW) */}
            {/* ============================================================ */}
            <div className="space-y-3.5 pt-2">
              {/* Toolbar & Filter Card */}
              <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3.5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar size={18} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Jadwal Mengajar Rutin Mingguan</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                        {schedules.length} Sesi KBM
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Atur alokasi hari, jam pembelajaran, kelas pengampu, dan ruangan belajar mengajar.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Toggle View Mode */}
                    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setScheduleViewMode('table')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                          scheduleViewMode === 'table'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title="Tampilan Tabel"
                      >
                        <Table size={14} />
                        <span className="hidden sm:inline">Tabel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleViewMode('cards')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                          scheduleViewMode === 'cards'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title="Tampilan Kartu Sesi"
                      >
                        <LayoutGrid size={14} />
                        <span className="hidden sm:inline">Kartu Sesi</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={openAddScheduleModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md shadow-indigo-900/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Tambah Jadwal</span>
                    </button>
                  </div>
                </div>

                {/* Filter Controls (Day, Class, Search) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="Cari mapel, kelas, atau ruang..."
                      value={scheduleSearch}
                      onChange={(e) => setScheduleSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                    />
                  </div>

                  <select
                    value={scheduleFilterDay}
                    onChange={(e) => setScheduleFilterDay(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Semua Hari ({schedules.length})</option>
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>

                  <select
                    value={scheduleFilterClass}
                    onChange={(e) => setScheduleFilterClass(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Semua Kelas ({classes.length} Rombel)</option>
                    {classes.map(cl => (
                      <option key={cl.id} value={cl.id}>{cl.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Schedules Display (Table / Cards) */}
              {filteredSchedules.length === 0 ? (
                <div className="text-center py-10 glass-card rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
                  <Calendar size={30} className="mx-auto text-slate-400 dark:text-slate-600 mb-1" />
                  <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                    {scheduleSearch || scheduleFilterDay !== 'all' || scheduleFilterClass !== 'all'
                      ? 'Tidak ada jadwal mengajar yang sesuai filter.'
                      : 'Belum ada jadwal mengajar yang dibuat.'}
                  </p>
                  <button
                    type="button"
                    onClick={openAddScheduleModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                  >
                    <Plus size={13} />
                    <span>Buat Jadwal Pertama</span>
                  </button>
                </div>
              ) : scheduleViewMode === 'table' ? (
                /* SCHEDULE TABLE VIEW */
                <div className="glass-card rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[11px]">
                          <th className="py-3 px-3 sm:px-4 text-center w-12">#</th>
                          <th className="py-3 px-3 sm:px-4 min-w-[150px]">Hari & Waktu KBM</th>
                          <th className="py-3 px-3 sm:px-4 min-w-[130px]">Kelas / Rombel</th>
                          <th className="py-3 px-3 sm:px-4 min-w-[220px]">Mata Pelajaran</th>
                          <th className="py-3 px-3 sm:px-4 min-w-[150px]">Ruang / Laboratorium</th>
                          <th className="py-3 px-3 sm:px-4 text-center min-w-[100px]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredSchedules.map((sch, idx) => {
                          const c = classes.find(cl => cl.id === sch.class_id);
                          const sub = subjects.find(su => su.id === sch.subject_id);

                          const dayColors = {
                            'Senin': 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
                            'Selasa': 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
                            'Rabu': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
                            'Kamis': 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
                            'Jumat': 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
                            'Sabtu': 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
                          };
                          const dayBadge = dayColors[sch.day_name] || 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';

                          return (
                            <tr
                              key={sch.id}
                              className="hover:bg-indigo-500/5 dark:hover:bg-slate-800/40 transition-colors group"
                            >
                              {/* 1. No */}
                              <td className="py-3.5 px-3 sm:px-4 text-center font-bold text-slate-400 dark:text-slate-500">
                                {idx + 1}
                              </td>

                              {/* 2. Hari & Waktu */}
                              <td className="py-3.5 px-3 sm:px-4">
                                <div className="space-y-1">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${dayBadge}`}>
                                    {sch.day_name}
                                  </span>
                                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-xs font-mono">
                                    <Clock size={12} className="text-slate-400 shrink-0" />
                                    <span>{sch.start_time} - {sch.end_time} WIB</span>
                                  </div>
                                </div>
                              </td>

                              {/* 3. Kelas */}
                              <td className="py-3.5 px-3 sm:px-4">
                                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/25">
                                  {c?.name || 'Kelas Belum Dipilih'}
                                </span>
                              </td>

                              {/* 4. Mata Pelajaran */}
                              <td className="py-3.5 px-3 sm:px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <BookOpen size={13} />
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                                      {sub?.name || 'Mata Pelajaran'}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                      {sub?.code || '-'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 5. Ruang */}
                              <td className="py-3.5 px-3 sm:px-4">
                                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {sch.room || 'Ruang Teori / Lab'}
                                </span>
                              </td>

                              {/* 6. Aksi */}
                              <td className="py-3.5 px-3 sm:px-4 text-center">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openEditScheduleModal(sch)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                    title="Edit Jadwal"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSchedule(sch.id)}
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                    title="Hapus Jadwal"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* SCHEDULE CARDS VIEW */
                <div className="space-y-2.5">
                  {filteredSchedules.map((sch) => {
                    const c = classes.find(cl => cl.id === sch.class_id);
                    const sub = subjects.find(su => su.id === sch.subject_id);

                    return (
                      <div
                        key={sch.id}
                        className="glass-card p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">
                            {sch.day_name.substring(0, 3)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                                {c?.name || 'Kelas'}
                              </span>
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {sch.day_name}, {sch.start_time} - {sch.end_time} WIB
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                              {sub?.name || 'Mata Pelajaran'}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Ruang / Lab: <strong className="text-slate-700 dark:text-slate-300">{sch.room || 'Lab Komputer'}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => openEditScheduleModal(sch)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                            title="Edit Jadwal"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(sch.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                            title="Hapus Jadwal"
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        );
      })()}

      {/* 3.4 Kalender Libur & Agenda Akademik (Table View Redesign) */}
      {activeTab === 'holidays' && (() => {
        const countNasional = (holidays || []).filter(h => h.holiday_type === 'nasional').length;
        const countSemester = (holidays || []).filter(h => h.holiday_type === 'semester').length;
        const countCutiKhusus = (holidays || []).filter(h => h.holiday_type !== 'nasional' && h.holiday_type !== 'semester').length;

        return (
          <div className="space-y-4 sm:space-y-5 animate-fade-in">
            {/* 1. Header & Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <CalendarRange size={20} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Agenda</div>
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {holidays.length} <span className="text-[10px] font-semibold text-slate-400">Agenda</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Libur Nasional</div>
                  <div className="text-base sm:text-lg font-black text-red-600 dark:text-red-400">
                    {countNasional} <span className="text-[10px] font-semibold text-slate-400">Hari</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Libur Semester</div>
                  <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {countSemester} <span className="text-[10px] font-semibold text-slate-400">Agenda</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Cuti & Khusus</div>
                  <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                    {countCutiKhusus} <span className="text-[10px] font-semibold text-slate-400">Agenda</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Control Toolbar */}
            <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3.5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar size={18} className="text-rose-600 dark:text-rose-400" />
                    <span>Kalender Libur & Agenda Akademik</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                      Tabel View
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Kelola jadwal hari libur nasional, jeda ujian/semester, cuti bersama, dan agenda dinas sekolah.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* View Mode Toggle Switcher */}
                  <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setHolidayViewMode('table')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        holidayViewMode === 'table'
                          ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      title="Tampilan Tabel (Table View)"
                    >
                      <Table size={14} />
                      <span className="hidden sm:inline">Tabel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHolidayViewMode('grid')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        holidayViewMode === 'grid'
                          ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      title="Tampilan Kartu (Grid View)"
                    >
                      <LayoutGrid size={14} />
                      <span className="hidden sm:inline">Grid Kartu</span>
                    </button>
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={openAddHolidayModal}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-900/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Tambah Hari Libur</span>
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari nama agenda libur atau tanggal (YYYY-MM-DD)..."
                    value={holidaySearch}
                    onChange={(e) => setHolidaySearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={holidayTypeFilter}
                    onChange={(e) => setHolidayTypeFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="all">Semua Kategori ({holidays.length})</option>
                    <option value="nasional">🔴 Libur Nasional / Keagamaan</option>
                    <option value="semester">🔵 Libur Semester / Sekolah</option>
                    <option value="cuti_bersama">🟡 Cuti Bersama</option>
                    <option value="khusus">🟢 Khusus / Kegiatan Sekolah</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Main Display: Table View OR Grid View */}
            {filteredHolidays.length === 0 ? (
              <div className="glass-card p-10 sm:p-12 rounded-2xl sm:rounded-3xl text-center border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Tidak Ada Agenda Libur</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm mx-auto">
                    {holidaySearch || holidayTypeFilter !== 'all' 
                      ? 'Tidak ditemukan agenda libur yang cocok dengan filter pencarian.' 
                      : 'Belum ada agenda libur yang terdaftar. Klik tombol di bawah untuk menambahkan.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddHolidayModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Agenda Sekarang</span>
                </button>
              </div>
            ) : holidayViewMode === 'table' ? (
              /* MODERN TABLE VIEW */
              <div className="glass-card rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[11px]">
                        <th className="py-3 px-3 sm:px-4 text-center w-12">#</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[220px]">Nama Agenda & Keterangan</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[150px]">Kategori / Jenis</th>
                        <th className="py-3 px-3 sm:px-4 min-w-[180px]">Rentang Tanggal</th>
                        <th className="py-3 px-3 sm:px-4 text-center min-w-[90px]">Durasi</th>
                        <th className="py-3 px-3 sm:px-4 text-center min-w-[130px]">Status Waktu</th>
                        <th className="py-3 px-3 sm:px-4 text-center min-w-[100px]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredHolidays.map((hol, idx) => {
                        const duration = getHolidayDuration(hol.start_date, hol.end_date);
                        const status = getHolidayStatus(hol.start_date, hol.end_date);
                        const dateRangeText = formatHolidayRange(hol.start_date, hol.end_date);

                        const typeColor = 
                          hol.holiday_type === 'nasional' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' :
                          hol.holiday_type === 'semester' ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' :
                          hol.holiday_type === 'cuti_bersama' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' :
                          'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';

                        const typeLabel = 
                          hol.holiday_type === 'nasional' ? 'Libur Nasional' :
                          hol.holiday_type === 'semester' ? 'Libur Semester / Sekolah' :
                          hol.holiday_type === 'cuti_bersama' ? 'Cuti Bersama' :
                          'Agenda Khusus';

                        return (
                          <tr
                            key={hol.id}
                            className="hover:bg-rose-500/5 dark:hover:bg-slate-800/40 transition-colors group"
                          >
                            {/* 1. No */}
                            <td className="py-3.5 px-3 sm:px-4 text-center font-bold text-slate-400 dark:text-slate-500">
                              {idx + 1}
                            </td>

                            {/* 2. Nama Agenda */}
                            <td className="py-3.5 px-3 sm:px-4">
                              <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                                  <Calendar size={14} />
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                                    {hol.name}
                                  </div>
                                  <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Clock size={11} />
                                    <span>Tercatat pada kalender akademik</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 3. Kategori */}
                            <td className="py-3.5 px-3 sm:px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${typeColor}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  hol.holiday_type === 'nasional' ? 'bg-rose-500' :
                                  hol.holiday_type === 'semester' ? 'bg-indigo-500' :
                                  hol.holiday_type === 'cuti_bersama' ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} />
                                <span>{typeLabel}</span>
                              </span>
                            </td>

                            {/* 4. Tanggal Pelaksanaan */}
                            <td className="py-3.5 px-3 sm:px-4">
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {dateRangeText}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                {hol.start_date}{hol.end_date && hol.end_date !== hol.start_date ? ` s/d ${hol.end_date}` : ''}
                              </div>
                            </td>

                            {/* 5. Durasi */}
                            <td className="py-3.5 px-3 sm:px-4 text-center">
                              <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {duration} Hari
                              </span>
                            </td>

                            {/* 6. Status Waktu */}
                            <td className="py-3.5 px-3 sm:px-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${status.color}`}>
                                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                                <span>{status.label}</span>
                              </span>
                            </td>

                            {/* 7. Aksi */}
                            <td className="py-3.5 px-3 sm:px-4 text-center">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditHolidayModal(hol)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                  title="Edit Hari Libur"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHoliday(hol.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                  title="Hapus Hari Libur"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* GRID CARDS VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredHolidays.map((hol) => {
                  const duration = getHolidayDuration(hol.start_date, hol.end_date);
                  const status = getHolidayStatus(hol.start_date, hol.end_date);
                  const dateRangeText = formatHolidayRange(hol.start_date, hol.end_date);

                  const typeColor = 
                    hol.holiday_type === 'nasional' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' :
                    hol.holiday_type === 'semester' ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' :
                    hol.holiday_type === 'cuti_bersama' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' :
                    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';

                  const typeLabel = 
                    hol.holiday_type === 'nasional' ? 'Libur Nasional' :
                    hol.holiday_type === 'semester' ? 'Libur Semester / Sekolah' :
                    hol.holiday_type === 'cuti_bersama' ? 'Cuti Bersama' :
                    'Agenda Khusus';

                  return (
                    <div
                      key={hol.id}
                      className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-500/40 transition-all flex flex-col justify-between gap-3 group shadow-sm hover:shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${typeColor}`}>
                              {typeLabel}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditHolidayModal(hol)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Edit Hari Libur"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHoliday(hol.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                              title="Hapus Hari Libur"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                          {hol.name}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-rose-500 shrink-0" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {dateRangeText}
                          </span>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-300">
                          {duration} Hari
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* 3.5 Supabase Cloud Configuration */}
      {activeTab === 'supabase' && (
        <div className="space-y-5">
          {/* Card Panduan Cepat Supabase */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Database size={18} />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Panduan Integrasi Database Supabase Cloud (100% Gratis)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Simpan dan sinkronkan data siswa, absensi, nilai, dan bimbingan guru wali ke cloud PostgreSQL.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsSqlModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
                >
                  <Code size={14} />
                  <span>Lihat & Salin Skrip SQL Schema</span>
                </button>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all"
                >
                  <span>Buka Supabase Dashboard</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* 3 Langkah Praktis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-black text-emerald-600 dark:text-emerald-400 block text-xs">Langkah 1: Buat Project</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Buka <strong>supabase.com</strong>, login/daftar gratis, lalu buat project baru (pilih region Singapore).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-black text-indigo-600 dark:text-indigo-400 block text-xs">Langkah 2: Jalankan SQL</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Klik tombol <strong>"Lihat & Salin Skrip SQL"</strong> di atas, buka menu <strong>SQL Editor</strong> di Supabase, paste dan jalankan (Run).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-black text-amber-600 dark:text-amber-400 block text-xs">Langkah 3: Simpan Kunci & Sync</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Salin <strong>Project URL</strong> dan <strong>Anon Key</strong> ke form di bawah, lalu klik <strong>"Upload Data ke Cloud"</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Form Konfigurasi Kunci API Supabase */}
          <form onSubmit={handleSaveSupabase} className="space-y-4">
            <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4">
              <div className="flex items-center gap-2">
                <Cloud size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Kredensial API Supabase Project
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">
                  Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseConfig.url}
                  onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">
                  Anon Public Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseConfig.anonKey}
                  onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-2">
                <button
                  type="button"
                  onClick={handleTestSupabaseConnection}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Database size={15} />
                  <span>Simpan & Tes Koneksi Supabase</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncToSupabase}
                  disabled={isSyncingToCloud}
                  className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                    isSyncingToCloud
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <ArrowUpCircle size={15} className={isSyncingToCloud ? 'animate-spin' : ''} />
                  <span>{isSyncingToCloud ? 'Sedang Mengunggah...' : 'Upload Seluruh Data Lokal ke Cloud'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePullFromSupabase}
                  disabled={isSyncingFromCloud}
                  className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                    isSyncingFromCloud
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-500 text-white'
                  }`}
                >
                  <ArrowDownCircle size={15} className={isSyncingFromCloud ? 'animate-spin' : ''} />
                  <span>{isSyncingFromCloud ? 'Sedang Menarik...' : 'Tarik Data dari Cloud ke Lokal'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 3.6 TAB: CADANGAN & BACKUP DATA (JSON) */}
      {activeTab === 'backup' && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          
          {/* Header Hero Banner */}
          <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 text-white border border-indigo-500/20 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-emerald-500/10 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold mb-1">
                  <Database size={13} className="text-indigo-400" />
                  <span>Manajemen Cadangan Offline</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Cadangan & Pemulihan Basis Data (.JSON)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Unduh seluruh data SIAKAD Anda ke dalam file <strong>.JSON</strong> sebagai cadangan offline di komputer/flashdisk. Anda dapat memulihkan seluruh data kapan saja tanpa memerlukan koneksi internet.
                </p>
              </div>

              {/* Quick Action Button in Banner */}
              <button
                type="button"
                onClick={handleExportFullBackupJSON}
                disabled={isExportingJson}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer shrink-0 self-start md:self-auto"
              >
                <Download size={17} />
                <span>Unduh Cadangan Lengkap (.JSON)</span>
              </button>
            </div>
          </div>

          {/* Quick Database Coverage Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="glass-card p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Kelas & Siswa</span>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                {classes.length} <span className="text-xs font-semibold text-slate-500">Kelas</span> / {students.length} <span className="text-xs font-semibold text-slate-500">Siswa</span>
              </p>
            </div>
            <div className="glass-card p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Mapel & Jadwal</span>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                {subjects.length} <span className="text-xs font-semibold text-slate-500">Mapel</span> / {schedules.length} <span className="text-xs font-semibold text-slate-500">Sesi</span>
              </p>
            </div>
            <div className="glass-card p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Rekap Presensi & Jurnal</span>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                {Object.keys(attendanceRecords).length} <span className="text-xs font-semibold text-slate-500">Presensi</span> / {teachingJournals.length} <span className="text-xs font-semibold text-slate-500">Jurnal</span>
              </p>
            </div>
            <div className="glass-card p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Periode Aktif</span>
              <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                {activeAcademicYear} (Sem. {activeSemester === '1' ? 'Ganjil' : 'Genap'})
              </p>
            </div>
          </div>

          {/* Main 2 Column Grid: Export & Import */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* COLUMN 1: UNDUH CADANGAN DATA (EXPORT JSON) */}
            <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Download size={22} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      1. Ekspor & Unduh File Cadangan JSON
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Simpan file arsip data lengkap ke perangkat lokal Anda.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-emerald-500" />
                    <span>File cadangan mencakup 14 entitas data:</span>
                  </p>
                  <ul className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-1">✓ Profil & KOP Sekolah</li>
                    <li className="flex items-center gap-1">✓ Tahun Ajaran & Semester</li>
                    <li className="flex items-center gap-1">✓ Rombel & Data Siswa</li>
                    <li className="flex items-center gap-1">✓ Mata Pelajaran</li>
                    <li className="flex items-center gap-1">✓ Jadwal Mengajar Rutin</li>
                    <li className="flex items-center gap-1">✓ Presensi Pembelajaran</li>
                    <li className="flex items-center gap-1">✓ Jurnal KBM</li>
                    <li className="flex items-center gap-1">✓ Nilai & Leger Siswa</li>
                    <li className="flex items-center gap-1">✓ Siswa Binaan & Bimbingan</li>
                    <li className="flex items-center gap-1">✓ Kunjungan Rumah (Home Visit)</li>
                    <li className="flex items-center gap-1">✓ Kalender Libur</li>
                    <li className="flex items-center gap-1">✓ Rekap Absensi Walas</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleExportFullBackupJSON}
                  disabled={isExportingJson}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Download size={16} />
                  <span>Unduh File Cadangan Lengkap (.JSON)</span>
                </button>

                {/* Sub Exports Section */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ekspor Data Spesifik / Per Kategori:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportSpecificJSON('siswa_kelas')}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Users size={13} className="text-blue-500" />
                      <span>Siswa & Rombel (JSON)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSpecificJSON('nilai_presensi')}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet size={13} className="text-purple-500" />
                      <span>Nilai & Presensi (JSON)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSpecificJSON('jadwal_jurnal')}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <BookOpen size={13} className="text-amber-500" />
                      <span>Jadwal & Jurnal (JSON)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSpecificJSON('wali_bk')}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <GraduationCap size={13} className="text-teal-500" />
                      <span>Wali & BK (JSON)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: PULIHKAN DATA DARI FILE (IMPORT / RESTORE JSON) */}
            <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                    <Upload size={22} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      2. Pulihkan Basis Data dari File JSON
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Impor kembali file cadangan .JSON yang pernah Anda unduh sebelumnya.
                    </p>
                  </div>
                </div>

                {/* File Upload Drop Area */}
                <label className="border-2 border-dashed border-indigo-400/40 hover:border-indigo-500 dark:border-indigo-600/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/60 group">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleSelectJSONFile}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <FileCode size={24} />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Klik di sini untuk memilih file <span className="text-indigo-600 dark:text-indigo-400">.JSON</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Sistem akan memverifikasi dan menampilkan ringkasan isi data terlebih dahulu sebelum diterapkan.
                  </p>
                </label>

                {/* Info Note */}
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Catatan Pemulihan Data:</span>
                  </p>
                  <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                    Memulihkan file cadangan akan memperbarui data lokal pada perangkat ini sesuai dengan isi file cadangan. Pastikan Anda memilih file cadangan yang sesuai.
                  </p>
                </div>
              </div>

              {/* Reset Data Danger Zone Link */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Ingin mereset data?</span>
                <button
                  type="button"
                  onClick={() => setIsResetDataModalOpen(true)}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Opsi Reset Data Lokal</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3.7 Version Log & Changelog (`/version-log`) */}
      {activeTab === 'changelog' && (
        <div className="space-y-4 sm:space-y-5 animate-fade-in">
          {/* Header Banner */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Catatan Pembaruan & Version Log</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      Rilis Aktif: v2.8.0
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Riwayat evolusi fitur, integrasi desktop, perbaikan, dan peningkatan sistem SIAKAD Personal.
                  </p>
                </div>
              </div>

              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari versi, fitur, atau rilis..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Timeline Feed */}
          {filteredLogs.length === 0 ? (
            <div className="glass-card p-10 rounded-2xl sm:rounded-3xl text-center border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <Search size={18} />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Tidak Ditemukan Version Log</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tidak ada riwayat rilis yang cocok dengan kata kunci &quot;{logSearch}&quot;.
              </p>
            </div>
          ) : (
            <div className="relative pl-4 sm:pl-6 space-y-4 before:content-[''] before:absolute before:left-[19px] sm:before:left-[27px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-emerald-500 before:via-indigo-500/40 before:to-slate-300 dark:before:to-slate-800">
              {filteredLogs.map((log, idx) => {
                const isLatest = idx === 0;
                const tagColor = 
                  log.tag === 'Desktop & UI' ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' :
                  log.tag === 'Fitur Baru' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
                  'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30';

                return (
                  <div key={idx} className="relative pl-6 sm:pl-8 group">
                    {/* Node Dot on Timeline */}
                    <div className={`absolute -left-[5px] sm:-left-[3px] top-4 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 transition-all ${
                      isLatest 
                        ? 'bg-emerald-500 ring-4 ring-emerald-500/25 animate-pulse' 
                        : 'bg-slate-400 dark:bg-slate-600 group-hover:bg-emerald-500'
                    }`} />

                    {/* Release Card */}
                    <div className={`glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all space-y-3 shadow-sm hover:shadow-md ${
                      isLatest 
                        ? 'border-emerald-500/40 ring-1 ring-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] to-transparent' 
                        : 'border-slate-200 dark:border-slate-800'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                            {log.version}
                          </span>
                          {isLatest && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                              Versi Terbaru
                            </span>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${tagColor}`}>
                            {log.tag}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{log.date}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {log.title}
                        </h4>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {log.details.map((d, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DRAWER: TAMBAH / EDIT SISWA */}
      <ModalDrawer
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        title={editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Siswa *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Muhammad Farhan Pratama..."
              value={studentForm.name}
              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Induk Siswa (NIS) *</label>
              <input
                type="text"
                required
                placeholder="2601001"
                value={studentForm.nis}
                onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">NISN (Opsional)</label>
              <input
                type="text"
                placeholder="0081234567"
                value={studentForm.nisn}
                onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kelas / Rombel *</label>
              <select
                value={studentForm.class_id}
                onChange={(e) => setStudentForm({ ...studentForm, class_id: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin</label>
              <select
                value={studentForm.gender}
                onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">No. HP / WhatsApp Orang Tua</label>
            <input
              type="text"
              placeholder="081234567890"
              value={studentForm.parent_phone}
              onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Rumah Siswa</label>
            <textarea
              rows={2}
              placeholder="Alamat lengkap tempat tinggal siswa..."
              value={studentForm.address}
              onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddStudentOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
            >
              {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
            </button>
          </div>
        </form>
      </ModalDrawer>

      {/* DRAWER: IMPORT MASSAL SISWA */}
      <ModalDrawer
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        title="Import Data Siswa Massal"
      >
        <form onSubmit={handleSaveBulkImport} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Kelas Tujuan *</label>
            <select
              value={bulkImportForm.class_id}
              onChange={(e) => setBulkImportForm({ ...bulkImportForm, class_id: Number(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.major})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tempel Daftar Nama Siswa (1 baris per siswa) *
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Format: <code>Nama Siswa, NIS (opsional), Gender L/P (opsional)</code> atau cukup paste daftar nama langsung:
            </p>
            <textarea
              rows={6}
              required
              placeholder={`Ahmad Dani, 2601009, L\nBela Safitri, 2601010, P\nCitra Kirana\nDoni Setiawan`}
              value={bulkImportForm.rawText}
              onChange={(e) => setBulkImportForm({ ...bulkImportForm, rawText: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsBulkImportOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Upload size={14} />
              <span>Proses Import</span>
            </button>
          </div>
        </form>
      </ModalDrawer>

      {/* DRAWER: TAMBAH / EDIT KELAS */}
      <ModalDrawer
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        title={editingClass ? 'Edit Rombongan Belajar (Kelas)' : 'Tambah Rombongan Belajar (Kelas) Baru'}
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Kelas *</label>
            <input
              type="text"
              required
              placeholder="Contoh: X RPL 2, XI TKJ 1, XII MM 1..."
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tingkat Kelas</label>
              <select
                value={classForm.grade_level}
                onChange={(e) => setClassForm({ ...classForm, grade_level: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="X">Kelas X (Sepuluh)</option>
                <option value="XI">Kelas XI (Sebelas)</option>
                <option value="XII">Kelas XII (Dua Belas)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jurusan / Program Keahlian</label>
              <input
                type="text"
                placeholder="Rekayasa Perangkat Lunak..."
                value={classForm.major}
                onChange={(e) => setClassForm({ ...classForm, major: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_homeroom"
              checked={classForm.is_homeroom_class}
              onChange={(e) => setClassForm({ ...classForm, is_homeroom_class: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="is_homeroom" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              Tandai sebagai Kelas Binaan (Saya adalah Wali Kelas ini)
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddClassOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
            >
              {editingClass ? 'Simpan Perubahan' : 'Buat Kelas'}
            </button>
          </div>
        </form>
      </ModalDrawer>

      {/* DRAWER: TAMBAH / EDIT MATA PELAJARAN */}
      <ModalDrawer
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Mata Pelajaran *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Pemrograman Web, Matematika Kejuruan..."
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Mapel *</label>
              <input
                type="text"
                required
                placeholder="RPL-01, MTK-01..."
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Mapel</label>
              <select
                value={subjectForm.category}
                onChange={(e) => setSubjectForm({ ...subjectForm, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="Kejuruan">Kejuruan (Produktif)</option>
                <option value="Umum">Umum (Wajib)</option>
                <option value="Muatan Lokal">Muatan Lokal</option>
                <option value="Pilihan">Pilihan / Tambahan</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
            >
              {editingSubject ? 'Simpan Perubahan' : 'Tambah Mapel'}
            </button>
          </div>
        </form>
      </ModalDrawer>

      {/* DRAWER: TAMBAH / EDIT JADWAL MENGAJAR */}
      <ModalDrawer
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={editingSchedule ? 'Edit Jadwal Mengajar' : 'Tambah Jadwal Mengajar Baru'}
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Kelas *</label>
              <select
                value={scheduleForm.class_id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, class_id: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.major})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Mata Pelajaran *</label>
              <select
                value={scheduleForm.subject_id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, subject_id: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hari Mengajar *</label>
              <select
                value={scheduleForm.day_name}
                onChange={(e) => setScheduleForm({ ...scheduleForm, day_name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Mulai *</label>
              <input
                type="time"
                required
                value={scheduleForm.start_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Selesai *</label>
              <input
                type="time"
                required
                value={scheduleForm.end_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ruangan / Lab</label>
            <input
              type="text"
              placeholder="Contoh: Lab Komputer 3, Ruang Teori 12..."
              value={scheduleForm.room}
              onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
            >
              {editingSchedule ? 'Simpan Jadwal' : 'Tambah Jadwal'}
            </button>
          </div>
        </form>
      </ModalDrawer>

      {/* Modal Skrip SQL Schema Supabase */}
      <ModalDrawer
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
        title="Skrip SQL Schema Supabase Database"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-200">
              <p className="font-bold mb-1">Panduan Eksekusi di Supabase:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300">
                <li>Buka dashboard proyek Anda di <strong>supabase.com</strong></li>
                <li>Masuk ke menu <strong>SQL Editor</strong> di bilah navigasi sebelah kiri.</li>
                <li>Klik <strong>+ New Query</strong>, tempelkan seluruh skrip di bawah ini, lalu klik <strong>RUN</strong>.</li>
                <li>Setelah berhasil, kembali ke tab Supabase di aplikasi ini dan klik <strong>Upload Seluruh Data Lokal ke Cloud</strong>.</li>
              </ol>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={handleCopySqlScript}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all active:scale-95"
              >
                {isCopiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedSql ? 'Tersalin!' : 'Salin Semua SQL'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-[50vh] leading-relaxed border border-slate-800 select-all">
              <code>{SUPABASE_SQL_SCHEMA}</code>
            </pre>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsSqlModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              Tutup
            </button>
          </div>
        </div>
      </ModalDrawer>

      {/* DRAWER: TUKAR KELAS SISWA (SWAP A & B) */}
      <ModalDrawer
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        title="Tukar Kelas Antar Siswa (Mix / Rolling Rombel)"
      >
        <div className="space-y-4 text-left">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
            <Shuffle size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Pertukaran Siswa untuk {activeAcademicYear} Semester {activeSemester === '1' ? '1 (Ganjil)' : '2 (Genap)'}</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Fitur ini akan menukar kelas Siswa A dan Siswa B secara instan. Riwayat nilai dan presensi semester sebelumnya tidak terganggu.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Student A Selector */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Siswa Pertama (Siswa A)
              </label>
              <select
                value={swapStudentAId}
                onChange={(e) => setSwapStudentAId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">-- Pilih Siswa A --</option>
                {students.map((st) => {
                  const cls = classes.find(c => c.id === st.class_id);
                  return (
                    <option key={st.id} value={st.id}>
                      {st.name} ({cls?.name || 'Tanpa Kelas'})
                    </option>
                  );
                })}
              </select>

              {swapStudentAId && (() => {
                const stA = students.find(s => s.id === Number(swapStudentAId));
                const clsA = classes.find(c => c.id === stA?.class_id);
                return (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                    Kelas Sekarang: <strong className="text-indigo-600 dark:text-indigo-400">{clsA?.name}</strong>
                  </div>
                );
              })()}
            </div>

            {/* Student B Selector */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Siswa Kedua (Siswa B)
              </label>
              <select
                value={swapStudentBId}
                onChange={(e) => setSwapStudentBId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">-- Pilih Siswa B --</option>
                {students.map((st) => {
                  const cls = classes.find(c => c.id === st.class_id);
                  return (
                    <option key={st.id} value={st.id}>
                      {st.name} ({cls?.name || 'Tanpa Kelas'})
                    </option>
                  );
                })}
              </select>

              {swapStudentBId && (() => {
                const stB = students.find(s => s.id === Number(swapStudentBId));
                const clsB = classes.find(c => c.id === stB?.class_id);
                return (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                    Kelas Sekarang: <strong className="text-indigo-600 dark:text-indigo-400">{clsB?.name}</strong>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Swap Preview Visual */}
          {swapStudentAId && swapStudentBId && (() => {
            const stA = students.find(s => s.id === Number(swapStudentAId));
            const stB = students.find(s => s.id === Number(swapStudentBId));
            const clsA = classes.find(c => c.id === stA?.class_id);
            const clsB = classes.find(c => c.id === stB?.class_id);

            return (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200">Pratinjau Pertukaran:</div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">{stA?.name}</span>
                  <span className="text-slate-400 font-mono">({clsA?.name}) &rarr; <strong className="text-emerald-600 dark:text-emerald-400">{clsB?.name}</strong></span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">{stB?.name}</span>
                  <span className="text-slate-400 font-mono">({clsB?.name}) &rarr; <strong className="text-emerald-600 dark:text-emerald-400">{clsA?.name}</strong></span>
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSwapModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!swapStudentAId || !swapStudentBId || swapStudentAId === swapStudentBId}
              onClick={() => {
                swapStudentsClasses(swapStudentAId, swapStudentBId);
                setIsSwapModalOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold text-xs shadow-md shadow-indigo-900/20 active:scale-95 transition-all cursor-pointer"
            >
              <Shuffle size={14} />
              <span>Tukar Rombel Sekarang</span>
            </button>
          </div>
        </div>
      </ModalDrawer>

      {/* DRAWER: PINDAH KELAS SISWA TUNGGAL */}
      <ModalDrawer
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        title="Pindah / Mutasi Rombel Siswa"
      >
        <div className="space-y-4 text-left">
          {(() => {
            const st = students.find(s => s.id === Number(moveStudentId));
            const currentCls = classes.find(c => c.id === st?.class_id);

            return (
              <>
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Siswa Terpilih:</div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">{st?.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    NIS: <span className="font-mono font-bold">{st?.nis}</span> • Kelas Saat Ini: <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentCls?.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pilih Kelas Tujuan Baru (Semester {activeSemester === '1' ? '1 Ganjil' : '2 Genap'}) *
                  </label>
                  <select
                    value={moveTargetClassId}
                    onChange={(e) => setMoveTargetClassId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.major}) {c.id === st?.class_id ? '(Kelas Sekarang)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsMoveModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      moveStudentToClass(moveStudentId, moveTargetClassId);
                      setIsMoveModalOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <ArrowLeftRight size={14} />
                    <span>Pindahkan Siswa</span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </ModalDrawer>

      {/* DRAWER: KENAIKAN KELAS / PROMOSI TINGKAT MASSAL */}
      <ModalDrawer
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        title={`Kenaikan Kelas / Promosi Tingkat (Tahun Ajaran ${activeAcademicYear})`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-left">
          <div className="p-3.5 bg-amber-500/10 dark:bg-amber-950/40 rounded-xl border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <GraduationCap size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Alur Kenaikan Kelas Tahun Ajaran Baru</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] opacity-90">
                <li>Siswa lama akan dinaikkan ke tingkat berikutnya (misal Kelas X &rarr; XI, XI &rarr; XII).</li>
                <li>Siswa tingkat akhir (Kelas XII / Kelas 3) akan di-set Lulus.</li>
                <li>Kelas X (Kelas 1) akan kosong dan siap Anda isi dengan siswa baru.</li>
                <li>Data tahun ajaran sebelumnya tetap tersimpan utuh di riwayatnya.</li>
              </ul>
            </div>
          </div>

          {/* SECTION 1: PEMETAAN KELAS TUJUAN */}
          <div>
            <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              1. Atur Pemetaan Kelas Tujuan Naik Tingkat:
            </h5>

            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
              {classes.map((cls) => {
                const count = students.filter(s => s.class_id === cls.id).length;
                const currentMapping = promotionMappings[cls.id] || 'graduate';

                return (
                  <div
                    key={cls.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {cls.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {cls.grade_level} ({cls.major})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Total {count} siswa terdaftar di rombel ini
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:w-56 shrink-0">
                      <span className="text-slate-400 text-xs hidden sm:inline">&rarr;</span>
                      <select
                        value={currentMapping}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPromotionMappings(prev => ({
                            ...prev,
                            [cls.id]: val
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="graduate">🎓 Lulus (Alumni / Selesai)</option>
                        <option value="none">⏸️ Tidak Naik (Tetap di Kelas Ini)</option>
                        <optgroup label="Pilih Rombel Naik Tingkat:">
                          {classes.map(targetCls => (
                            <option key={targetCls.id} value={targetCls.id}>
                              Naik ke {targetCls.name} ({targetCls.grade_level})
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: PENGECUALIAN SISWA TINGGAL KELAS (TIDAK NAIK) */}
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h5 className="font-extrabold text-xs text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>2. Siswa Tinggal Kelas / Tidak Naik Tingkat (Opsional)</span>
                {stayedStudentIds.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                    {stayedStudentIds.length} Siswa Tinggal Kelas
                  </span>
                )}
              </h5>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Centang nama siswa di bawah jika ada yang <strong>tinggal kelas</strong>. Siswa yang dicentang akan tetap berada di kelas/tingkat asalnya.
            </p>

            <input
              type="text"
              placeholder="Cari nama siswa tinggal kelas..."
              value={stayedSearchQuery}
              onChange={(e) => setStayedSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-200 dark:divide-slate-800">
              {(students || [])
                .filter(s => {
                  if (!s) return false;
                  const q = (stayedSearchQuery || '').toLowerCase();
                  const nameMatch = String(s.name || '').toLowerCase().includes(q);
                  const nisMatch = String(s.nis || '').includes(stayedSearchQuery || '');
                  return nameMatch || nisMatch;
                })
                .map(st => {
                  const cls = (classes || []).find(c => c.id === st.class_id);
                  const isChecked = (stayedStudentIds || []).includes(st.id);

                  return (
                    <label
                      key={st.id}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-rose-100/80 dark:bg-rose-950/60 font-bold text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStayedStudentIds(prev => [...prev, st.id]);
                            } else {
                              setStayedStudentIds(prev => prev.filter(id => id !== st.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 rounded border-slate-300"
                        />
                        <span>{st.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({st.nis})</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {cls?.name || 'Tanpa Kelas'}
                      </span>
                    </label>
                  );
                })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPromotionModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                const graduateClassIds = Object.keys(promotionMappings)
                  .filter(clsId => promotionMappings[clsId] === 'graduate')
                  .map(Number);

                const infoConfirm = stayedStudentIds.length > 0 
                  ? `\n\nCatatan: ${stayedStudentIds.length} siswa yang dicentang akan TETAP TINGGAL KELAS.` 
                  : '';

                if (window.confirm(`Anda yakin ingin memproses Kenaikan Kelas untuk ${activeAcademicYear}? Siswa lama akan dinaikkan ke kelas berikutnya dan kelas tingkat awal siap diisi siswa baru.${infoConfirm}`)) {
                  promoteStudentsToNextGrade(promotionMappings, graduateClassIds, stayedStudentIds);
                  setIsPromotionModalOpen(false);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-900/20 active:scale-95 transition-all cursor-pointer"
            >
              <GraduationCap size={15} />
              <span>Proses Kenaikan Kelas Sekarang</span>
            </button>
          </div>
        </div>
      </ModalDrawer>

      {/* DRAWER: TAMBAH / EDIT HARI LIBUR */}
      <ModalDrawer
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        title={editingHoliday ? 'Edit Agenda / Hari Libur' : 'Tambah Hari Libur Baru'}
      >
        <form onSubmit={handleSaveHoliday} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Hari Libur / Agenda Sekolah *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Hari Raya Idul Fitri 1448 H / Libur PTS"
              value={holidayForm.name}
              onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kategori / Jenis Libur *
            </label>
            <select
              value={holidayForm.holiday_type}
              onChange={(e) => setHolidayForm({ ...holidayForm, holiday_type: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="nasional">🔴 Libur Nasional / Hari Besar Keagamaan</option>
              <option value="semester">🔵 Libur Semester / Libur Sekolah</option>
              <option value="cuti_bersama">🟡 Cuti Bersama</option>
              <option value="khusus">🟢 Khusus / Kegiatan Sekolah</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                required
                value={holidayForm.start_date}
                onChange={(e) => {
                  const val = e.target.value;
                  setHolidayForm(prev => ({
                    ...prev,
                    start_date: val,
                    end_date: prev.end_date < val ? val : prev.end_date
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Selesai *
              </label>
              <input
                type="date"
                required
                min={holidayForm.start_date}
                value={holidayForm.end_date}
                onChange={(e) => setHolidayForm({ ...holidayForm, end_date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            💡 <strong>Tips:</strong> Jika libur hanya 1 hari, samakan tanggal mulai dan tanggal selesai. Sistem akan otomatis menandai kalender pembelajaran.
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsHolidayModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-900/20 active:scale-95 transition-all cursor-pointer"
            >
              <Save size={15} />
              <span>{editingHoliday ? 'Simpan Perubahan' : 'Tambah Libur'}</span>
            </button>
          </div>
        </form>
      </ModalDrawer>

      {/* MODAL: PREVIEW & KONFIRMASI RESTORE JSON */}
      <ModalDrawer
        isOpen={isRestoreModalOpen}
        onClose={() => {
          setIsRestoreModalOpen(false);
          setImportedJsonData(null);
        }}
        title="Konfirmasi Pemulihan Data (Restore JSON)"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-left">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
              <CheckCheck size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200">
                File Cadangan Valid & Terverifikasi
              </h4>
              <p className="text-xs text-indigo-800/80 dark:text-indigo-300 leading-relaxed">
                Sistem mendeteksi struktur file cadangan SIAKAD Personal. Berikut ringkasan data yang siap dipulihkan ke perangkat ini:
              </p>
            </div>
          </div>

          {/* Details Table / Grid */}
          {importedJsonSummary && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400">Tanggal Cadangan:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{importedJsonSummary.exportDate}</p>
                </div>
                <div>
                  <span className="text-slate-400">Periode Terdeteksi:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{importedJsonSummary.academicYear}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Rombel & Kelas:</span>
                  <p className="font-black text-slate-900 dark:text-white">{importedJsonSummary.classesCount} Kelas</p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Data Siswa:</span>
                  <p className="font-black text-slate-900 dark:text-white">{importedJsonSummary.studentsCount} Siswa</p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Mata Pelajaran:</span>
                  <p className="font-black text-slate-900 dark:text-white">{importedJsonSummary.subjectsCount} Mapel</p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Jadwal Mengajar:</span>
                  <p className="font-black text-slate-900 dark:text-white">{importedJsonSummary.schedulesCount} Sesi</p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Rekap Presensi:</span>
                  <p className="font-black text-slate-900 dark:text-white">{importedJsonSummary.attendanceCount} Record</p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Jurnal KBM:</span>
                  <p className="font-black text-slate-900 dark:text-white">{importedJsonSummary.journalsCount} Catatan</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            ⚠️ Klik <strong>&quot;Pulihkan Data Sekarang&quot;</strong> untuk menimpa basis data lokal dengan data dari file cadangan ini.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsRestoreModalOpen(false);
                setImportedJsonData(null);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmRestoreJSON}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md shadow-indigo-900/20 active:scale-95 transition-all cursor-pointer"
            >
              <Upload size={15} />
              <span>Pulihkan Data Sekarang</span>
            </button>
          </div>
        </div>
      </ModalDrawer>

      {/* MODAL: RESET DATA LOKAL DANGER ZONE */}
      <ModalDrawer
        isOpen={isResetDataModalOpen}
        onClose={() => {
          setIsResetDataModalOpen(false);
          setResetConfirmText('');
        }}
        title="Konfirmasi Reset Data Lokal"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-left">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-rose-950 dark:text-rose-200">
                Peringatan: Tindakan Ini Tidak Dapat Dibatalkan
              </h4>
              <p className="text-xs text-rose-800/80 dark:text-rose-300 leading-relaxed">
                Mereset data akan mengosongkan seluruh presensi, jurnal, nilai, dan jadwal pada periode aktif ini. Pastikan Anda sudah mengunduh file cadangan JSON terlebih dahulu.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Ketik kata <span className="text-rose-600 font-mono font-black">RESET</span> di bawah untuk konfirmasi:
            </label>
            <input
              type="text"
              placeholder="RESET"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsResetDataModalOpen(false);
                setResetConfirmText('');
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={resetConfirmText !== 'RESET'}
              onClick={() => {
                resetCurrentPeriodData();
                setIsResetDataModalOpen(false);
                setResetConfirmText('');
                showToast('Data periode aktif telah berhasil dibersihkan / direset!', 'info');
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black text-xs shadow-md shadow-rose-900/20 active:scale-95 transition-all cursor-pointer"
            >
              <Trash2 size={15} />
              <span>Bersihkan Data Sekarang</span>
            </button>
          </div>
        </div>
      </ModalDrawer>

    </div>
  );
};


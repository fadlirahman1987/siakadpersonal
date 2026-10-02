import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialSchoolSettings,
  initialAcademicYears,
  initialSemesters,
  initialClasses,
  initialSubjects,
  initialSchedules,
  initialStudents,
  initialAttendanceRecords,
  initialAssessmentConfig,
  initialGrades,
  initialTeachingJournals,
  initialGuruWaliStudentIds,
  initialGuidanceSchedules,
  initialHomeVisits,
  initialHolidays,
  initialVersionLogs
} from '../data/initialData';
import { getSupabaseClient, getSupabaseConfig } from '../lib/supabaseClient';
import confetti from 'canvas-confetti';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme (Dark by default)
  const [theme, setTheme] = useState(() => localStorage.getItem('siakad_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('siakad_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Active Navigation Tab: 'dashboard' | 'attendance' | 'homeroom' | 'ai-tools' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [attendanceSubTab, setAttendanceSubTab] = useState('attendance'); // 'attendance' | 'grades' | 'journal' | 'journal-history'
  
  // Selected Context (e.g., active schedule or active class)
  const [selectedScheduleId, setSelectedScheduleId] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Academic Year & Semester State
  const [academicYears, setAcademicYears] = useState(() => {
    const saved = localStorage.getItem('siakad_academic_years');
    return saved ? JSON.parse(saved) : initialAcademicYears;
  });

  const [activeAcademicYear, setActiveAcademicYear] = useState(() => {
    const saved = localStorage.getItem('siakad_active_academic_year');
    if (saved) return saved;
    const active = initialAcademicYears.find(y => y.is_active)?.name || '2026/2027';
    return active;
  });

  const [activeSemester, setActiveSemester] = useState(() => {
    const saved = localStorage.getItem('siakad_active_semester');
    return saved || '1'; // '1' = Ganjil, '2' = Genap
  });

  const activePeriodKey = `${activeAcademicYear}_${activeSemester}`;

  // Helper to load period-scoped data with graceful initial fallbacks
  const loadScopedData = (key, fallbackDefault) => {
    try {
      const scopedKey = `siakad_${key}_${activePeriodKey}`;
      const savedScoped = localStorage.getItem(scopedKey);
      if (savedScoped !== null) {
        return JSON.parse(savedScoped);
      }
      // If default first period (2026/2027_1), fallback to legacy storage if exists
      if (activePeriodKey === '2026/2027_1') {
        const savedLegacy = localStorage.getItem(`siakad_${key}`);
        if (savedLegacy !== null) {
          return JSON.parse(savedLegacy);
        }
        return fallbackDefault;
      }
      // Other periods default to empty array or empty object
      return Array.isArray(fallbackDefault) ? [] : {};
    } catch (e) {
      console.error(`Error loading scoped data for ${key}:`, e);
      return Array.isArray(fallbackDefault) ? [] : {};
    }
  };

  // Helper to load students scoped per academic period with smart inheritance
  const loadScopedStudents = (periodKey, year, sem) => {
    try {
      const pKey = periodKey || activePeriodKey;
      const curYear = year || activeAcademicYear;
      const curSem = sem || activeSemester;

      const savedScoped = localStorage.getItem(`siakad_students_${pKey}`);
      if (savedScoped !== null) {
        return JSON.parse(savedScoped);
      }

      // If opening Semester 2 and scoped doesn't exist yet, clone from Semester 1 of same year
      if (curSem === '2') {
        const prevPeriodKey = `${curYear}_1`;
        const prevScoped = localStorage.getItem(`siakad_students_${prevPeriodKey}`);
        if (prevScoped !== null) {
          const cloned = JSON.parse(prevScoped);
          // Persist cloned as initial state for semester 2
          localStorage.setItem(`siakad_students_${pKey}`, JSON.stringify(cloned));
          return cloned;
        }
      }

      // Check legacy global students or initial fallback
      const legacy = localStorage.getItem('siakad_students');
      if (legacy !== null) {
        return JSON.parse(legacy);
      }

      return initialStudents;
    } catch (e) {
      console.error('Error loading scoped students:', e);
      return initialStudents;
    }
  };

  // Data States with LocalStorage Persistence
  const [schoolSettings, setSchoolSettings] = useState(() => {
    const saved = localStorage.getItem('siakad_school');
    return saved ? JSON.parse(saved) : initialSchoolSettings;
  });

  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem('siakad_classes');
    return saved ? JSON.parse(saved) : initialClasses;
  });

  const [students, setStudents] = useState(() => loadScopedStudents());

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('siakad_subjects');
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [schedules, setSchedules] = useState(() => {
    const saved = localStorage.getItem('siakad_schedules');
    return saved ? JSON.parse(saved) : initialSchedules;
  });

  // Operational / Transactional records scoped per Academic Year & Semester
  const [attendanceRecords, setAttendanceRecords] = useState(() => loadScopedData('attendance', initialAttendanceRecords));

  const [grades, setGrades] = useState(() => loadScopedData('grades', initialGrades));

  const [assessmentConfig, setAssessmentConfig] = useState(() => {
    const saved = localStorage.getItem('siakad_assessment_config');
    return saved ? JSON.parse(saved) : initialAssessmentConfig;
  });

  const [kkm, setKkm] = useState(() => {
    const saved = localStorage.getItem('siakad_kkm');
    return saved ? Number(saved) : 75;
  });

  const [teachingJournals, setTeachingJournals] = useState(() => loadScopedData('journals', initialTeachingJournals));

  const [guidanceSchedules, setGuidanceSchedules] = useState(() => loadScopedData('guidance', initialGuidanceSchedules));

  const [homeVisits, setHomeVisits] = useState(() => loadScopedData('home_visits', initialHomeVisits));

  const [guruWaliStudentIds, setGuruWaliStudentIds] = useState(() => {
    const saved = localStorage.getItem('siakad_guru_wali_students');
    return saved ? JSON.parse(saved) : initialGuruWaliStudentIds;
  });

  const [holidays, setHolidays] = useState(() => {
    const saved = localStorage.getItem('siakad_holidays');
    return saved ? JSON.parse(saved) : initialHolidays;
  });

  const [walasMonthlyAttendance, setWalasMonthlyAttendance] = useState(() => loadScopedData('walas_monthly_attendance', {}));

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Academic Period Switcher Action
  const switchAcademicPeriod = (targetYear, targetSemester) => {
    const year = targetYear || activeAcademicYear;
    const sem = targetSemester || activeSemester;
    const newPeriodKey = `${year}_${sem}`;

    // Update list active flag
    setAcademicYears(prev => prev.map(y => ({
      ...y,
      is_active: y.name === year
    })));

    setActiveAcademicYear(year);
    setActiveSemester(sem);

    localStorage.setItem('siakad_active_academic_year', year);
    localStorage.setItem('siakad_active_semester', sem);

    // Load data for the target period
    const loadDataFor = (key, fallback) => {
      try {
        const saved = localStorage.getItem(`siakad_${key}_${newPeriodKey}`);
        if (saved !== null) return JSON.parse(saved);
        if (newPeriodKey === '2026/2027_1') {
          const legacy = localStorage.getItem(`siakad_${key}`);
          if (legacy !== null) return JSON.parse(legacy);
          return fallback;
        }
        return Array.isArray(fallback) ? [] : {};
      } catch (e) {
        return Array.isArray(fallback) ? [] : {};
      }
    };

    setStudents(loadScopedStudents(newPeriodKey, year, sem));
    setAttendanceRecords(loadDataFor('attendance', initialAttendanceRecords));
    setGrades(loadDataFor('grades', initialGrades));
    setTeachingJournals(loadDataFor('journals', initialTeachingJournals));
    setGuidanceSchedules(loadDataFor('guidance', initialGuidanceSchedules));
    setHomeVisits(loadDataFor('home_visits', initialHomeVisits));
    setWalasMonthlyAttendance(loadDataFor('walas_monthly_attendance', {}));

    const semLabel = sem === '1' ? 'Ganjil (Juli - Desember)' : 'Genap (Januari - Juni)';
    showToast(`Periode aktif: ${year} - Semester ${semLabel}`, 'success');
  };

  const addAcademicYear = (yearName) => {
    const trimmed = (yearName || '').trim();
    if (!trimmed) {
      showToast('Nama tahun ajaran tidak boleh kosong!', 'error');
      return;
    }
    if (academicYears.some(y => y.name === trimmed)) {
      showToast('Tahun ajaran tersebut sudah ada!', 'error');
      return;
    }
    const newYear = {
      id: Date.now(),
      name: trimmed,
      is_active: false
    };
    setAcademicYears(prev => [...prev, newYear]);
    showToast(`Tahun ajaran "${trimmed}" berhasil ditambahkan!`, 'success');
  };

  const deleteAcademicYear = (id) => {
    const target = academicYears.find(y => y.id === id);
    if (!target) return;
    if (target.name === activeAcademicYear) {
      showToast('Tidak dapat menghapus tahun ajaran yang sedang aktif!', 'error');
      return;
    }
    setAcademicYears(prev => prev.filter(y => y.id !== id));
    showToast(`Tahun ajaran "${target.name}" berhasil dihapus.`, 'info');
  };

  const resetCurrentPeriodData = () => {
    setAttendanceRecords({});
    setGrades({});
    setTeachingJournals([]);
    setGuidanceSchedules([]);
    setHomeVisits([]);
    setWalasMonthlyAttendance({});
    localStorage.removeItem(`siakad_attendance_${activePeriodKey}`);
    localStorage.removeItem(`siakad_grades_${activePeriodKey}`);
    localStorage.removeItem(`siakad_journals_${activePeriodKey}`);
    localStorage.removeItem(`siakad_guidance_${activePeriodKey}`);
    localStorage.removeItem(`siakad_home_visits_${activePeriodKey}`);
    localStorage.removeItem(`siakad_walas_monthly_attendance_${activePeriodKey}`);
    showToast(`Data transaksi periode ${activeAcademicYear} Semester ${activeSemester === '1' ? 'Ganjil' : 'Genap'} dikosongkan.`, 'info');
  };

  // Student Transfer & Swap Actions (Scoped per Period)
  const moveStudentToClass = (studentId, targetClassId) => {
    const sId = Number(studentId);
    const targetCId = Number(targetClassId);
    setStudents(prev => prev.map(st => st.id === sId ? { ...st, class_id: targetCId } : st));
    const student = students.find(s => s.id === sId);
    const targetClass = classes.find(c => c.id === targetCId);
    showToast(`Siswa "${student?.name || 'Siswa'}" dipindahkan ke "${targetClass?.name || 'Kelas'}" (${activeAcademicYear} Sem ${activeSemester === '1' ? 'Ganjil' : 'Genap'}).`, 'success');
  };

  const swapStudentsClasses = (studentIdA, studentIdB) => {
    const sIdA = Number(studentIdA);
    const sIdB = Number(studentIdB);
    const studentA = students.find(s => s.id === sIdA);
    const studentB = students.find(s => s.id === sIdB);

    if (!studentA || !studentB) {
      showToast('Data siswa yang akan ditukar tidak ditemukan!', 'error');
      return;
    }

    const classAId = studentA.class_id;
    const classBId = studentB.class_id;

    if (classAId === classBId) {
      showToast('Kedua siswa sudah berada di kelas yang sama!', 'error');
      return;
    }

    setStudents(prev => prev.map(st => {
      if (st.id === sIdA) return { ...st, class_id: classBId };
      if (st.id === sIdB) return { ...st, class_id: classAId };
      return st;
    }));

    const classAName = classes.find(c => c.id === classAId)?.name || 'Kelas A';
    const classBName = classes.find(c => c.id === classBId)?.name || 'Kelas B';

    showToast(`Berhasil menukar kelas! "${studentA.name}" ke ${classBName} & "${studentB.name}" ke ${classAName} (Semester ${activeSemester === '1' ? 'Ganjil' : 'Genap'}).`, 'success');
  };

  const batchMoveStudents = (studentIds, targetClassId) => {
    const ids = studentIds.map(Number);
    const targetCId = Number(targetClassId);
    setStudents(prev => prev.map(st => ids.includes(st.id) ? { ...st, class_id: targetCId } : st));
    const targetClass = classes.find(c => c.id === targetCId);
    showToast(`Berhasil memindahkan ${ids.length} siswa ke kelas "${targetClass?.name || 'Kelas'}"!`, 'success');
  };

  const copyStudentsFromPeriod = (fromYear, fromSemester) => {
    const srcKey = `${fromYear}_${fromSemester}`;
    const saved = localStorage.getItem(`siakad_students_${srcKey}`);
    if (!saved) {
      showToast(`Data siswa pada periode ${fromYear} Semester ${fromSemester === '1' ? 'Ganjil' : 'Genap'} belum ditemukan!`, 'error');
      return;
    }
    const cloned = JSON.parse(saved);
    setStudents(cloned);
    showToast(`Berhasil menyalin susunan siswa dari ${fromYear} Semester ${fromSemester === '1' ? 'Ganjil' : 'Genap'}!`, 'success');
  };

  // Year-End Grade Promotion / Kenaikan Tingkat Massal dengan Pengecualian Tinggal Kelas
  const promoteStudentsToNextGrade = (classMappings = {}, graduateClassIds = [], stayedStudentIds = []) => {
    const gradIds = graduateClassIds.map(Number);
    const retainedIds = stayedStudentIds.map(Number);
    
    setStudents(prev => {
      // Filter out graduated students (unless explicitly marked as stayed/retained)
      const activeStudents = prev.filter(st => {
        if (retainedIds.includes(Number(st.id))) return true;
        return !gradIds.includes(Number(st.class_id));
      });
      
      // Update class_id for promoted students
      return activeStudents.map(st => {
        // If student is staying in the same grade (tinggal kelas), do not promote
        if (retainedIds.includes(Number(st.id))) {
          return st;
        }

        const targetClassId = classMappings[st.class_id];
        if (targetClassId && targetClassId !== 'graduate' && targetClassId !== 'none') {
          return {
            ...st,
            class_id: Number(targetClassId)
          };
        }
        return st;
      });
    });

    const infoTinggal = retainedIds.length > 0 ? ` (${retainedIds.length} siswa tetap tinggal kelas)` : '';
    showToast(`Kenaikan kelas Tahun Ajaran ${activeAcademicYear} berhasil diproses!${infoTinggal}`, 'success');
  };



  // Save to LocalStorage effects
  useEffect(() => {
    localStorage.setItem('siakad_academic_years', JSON.stringify(academicYears));
  }, [academicYears]);

  useEffect(() => {
    localStorage.setItem('siakad_active_academic_year', activeAcademicYear);
  }, [activeAcademicYear]);

  useEffect(() => {
    localStorage.setItem('siakad_active_semester', activeSemester);
  }, [activeSemester]);

  useEffect(() => {
    localStorage.setItem('siakad_school', JSON.stringify(schoolSettings));
  }, [schoolSettings]);

  useEffect(() => {
    localStorage.setItem('siakad_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(`siakad_students_${activePeriodKey}`, JSON.stringify(students));
    if (activePeriodKey === '2026/2027_1') {
      localStorage.setItem('siakad_students', JSON.stringify(students));
    }
  }, [students, activePeriodKey]);

  useEffect(() => {
    localStorage.setItem('siakad_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('siakad_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(`siakad_attendance_${activePeriodKey}`, JSON.stringify(attendanceRecords));
    // Also mirror to legacy for compatibility if on default period
    if (activePeriodKey === '2026/2027_1') {
      localStorage.setItem('siakad_attendance', JSON.stringify(attendanceRecords));
    }
  }, [attendanceRecords, activePeriodKey]);

  useEffect(() => {
    localStorage.setItem(`siakad_grades_${activePeriodKey}`, JSON.stringify(grades));
    if (activePeriodKey === '2026/2027_1') {
      localStorage.setItem('siakad_grades', JSON.stringify(grades));
    }
  }, [grades, activePeriodKey]);

  useEffect(() => {
    localStorage.setItem('siakad_assessment_config', JSON.stringify(assessmentConfig));
  }, [assessmentConfig]);

  useEffect(() => {
    localStorage.setItem('siakad_kkm', kkm.toString());
  }, [kkm]);

  useEffect(() => {
    localStorage.setItem(`siakad_journals_${activePeriodKey}`, JSON.stringify(teachingJournals));
    if (activePeriodKey === '2026/2027_1') {
      localStorage.setItem('siakad_journals', JSON.stringify(teachingJournals));
    }
  }, [teachingJournals, activePeriodKey]);

  useEffect(() => {
    localStorage.setItem(`siakad_guidance_${activePeriodKey}`, JSON.stringify(guidanceSchedules));
    if (activePeriodKey === '2026/2027_1') {
      localStorage.setItem('siakad_guidance', JSON.stringify(guidanceSchedules));
    }
  }, [guidanceSchedules, activePeriodKey]);

  useEffect(() => {
    localStorage.setItem(`siakad_home_visits_${activePeriodKey}`, JSON.stringify(homeVisits));
    if (activePeriodKey === '2026/2027_1') {
      localStorage.setItem('siakad_home_visits', JSON.stringify(homeVisits));
    }
  }, [homeVisits, activePeriodKey]);

  useEffect(() => {
    localStorage.setItem('siakad_holidays', JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem('siakad_guru_wali_students', JSON.stringify(guruWaliStudentIds));
  }, [guruWaliStudentIds]);

  useEffect(() => {
    localStorage.setItem(`siakad_walas_monthly_attendance_${activePeriodKey}`, JSON.stringify(walasMonthlyAttendance));
    if (activePeriodKey === '2026/2027_1') {
      localStorage.setItem('siakad_walas_monthly_attendance', JSON.stringify(walasMonthlyAttendance));
    }
  }, [walasMonthlyAttendance, activePeriodKey]);

  // Walas (Wali Kelas) Monthly Attendance Actions
  const updateWalasStudentAttendance = (classId, semester, month, studentId, fields) => {
    const key = `${classId}_${semester}_${month}_${studentId}`;
    setWalasMonthlyAttendance(prev => {
      const current = prev[key] || { s: 0, i: 0, a: 0, notes: '' };
      return {
        ...prev,
        [key]: { ...current, ...fields }
      };
    });
  };

  const batchUpdateWalasAttendance = (updates) => {
    setWalasMonthlyAttendance(prev => ({
      ...prev,
      ...updates
    }));
    showToast('Rekap absensi bulanan berhasil disimpan!', 'success');
  };

  // Guru Wali Actions (Siswa Binaan Multi-Kelas)
  const addGuruWaliStudent = (studentId) => {
    const numId = Number(studentId);
    setGuruWaliStudentIds(prev => prev.includes(numId) ? prev : [...prev, numId]);
    const st = students.find(s => s.id === numId);
    showToast(`Siswa "${st?.name || 'Siswa'}" berhasil ditambahkan ke binaan Guru Wali!`, 'success');
  };

  const removeGuruWaliStudent = (studentId) => {
    const numId = Number(studentId);
    setGuruWaliStudentIds(prev => prev.filter(id => id !== numId));
    const st = students.find(s => s.id === numId);
    showToast(`Siswa "${st?.name || 'Siswa'}" dilepas dari binaan Guru Wali.`, 'info');
  };

  const setGuruWaliStudents = (studentIds) => {
    setGuruWaliStudentIds(studentIds.map(Number));
    showToast('Daftar siswa binaan Guru Wali berhasil diperbarui!', 'success');
  };

  // Attendance Actions
  const updateAttendanceStatus = (scheduleId, date, studentId, status) => {
    const key = `${scheduleId}_${date}`;
    setAttendanceRecords(prev => {
      const currentSession = prev[key] || {
        schedule_id: scheduleId,
        date: date,
        kbm_status: 'Tatap Muka',
        records: {}
      };

      const updatedRecords = {
        ...currentSession.records,
        [studentId]: status
      };

      return {
        ...prev,
        [key]: {
          ...currentSession,
          records: updatedRecords
        }
      };
    });
  };

  const setAllPresent = (scheduleId, date, studentList) => {
    const key = `${scheduleId}_${date}`;
    const newRecords = {};
    studentList.forEach(s => {
      newRecords[s.id] = 'H';
    });

    setAttendanceRecords(prev => ({
      ...prev,
      [key]: {
        schedule_id: scheduleId,
        date: date,
        kbm_status: prev[key]?.kbm_status || 'Tatap Muka',
        records: newRecords
      }
    }));

    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 }
      });
    } catch (e) {
      // safe fallback
    }

    showToast(`Berhasil! Seluruh ${studentList.length} siswa diset Hadir (H).`, 'success');
  };

  const updateKbmStatus = (scheduleId, date, kbmStatus) => {
    const key = `${scheduleId}_${date}`;
    setAttendanceRecords(prev => {
      const current = prev[key] || {
        schedule_id: scheduleId,
        date: date,
        kbm_status: kbmStatus,
        records: {}
      };
      return {
        ...prev,
        [key]: {
          ...current,
          kbm_status: kbmStatus
        }
      };
    });
    showToast(`Status KBM diubah ke: ${kbmStatus}`, 'info');
  };

  // Journal Actions
  const saveTeachingJournal = (journalData) => {
    setTeachingJournals(prev => {
      const existingIndex = prev.findIndex(
        j => (journalData.id && j.id === journalData.id) || (j.schedule_id === journalData.schedule_id && j.date === journalData.date)
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...journalData };
        return updated;
      } else {
        return [{ id: Date.now(), ...journalData }, ...prev];
      }
    });
    showToast('Jurnal mengajar berhasil disimpan!', 'success');
  };

  const updateTeachingJournal = (journalId, journalData) => {
    setTeachingJournals(prev => prev.map(j => (j.id === journalId ? { ...j, ...journalData } : j)));
    showToast('Jurnal mengajar berhasil diperbarui!', 'success');
  };

  const deleteTeachingJournal = (journalId) => {
    setTeachingJournals(prev => prev.filter(j => j.id !== journalId));
    showToast('Jurnal mengajar berhasil dihapus.', 'info');
  };

  // Guidance Actions
  const addGuidanceSchedule = (data) => {
    setGuidanceSchedules(prev => [{ id: Date.now(), ...data }, ...prev]);
    showToast('Agenda bimbingan berhasil dijadwalkan!', 'success');
  };

  const updateGuidanceAttendance = (guidanceId, studentId, status) => {
    setGuidanceSchedules(prev => prev.map(item => {
      if (item.id === guidanceId) {
        return {
          ...item,
          attendance: {
            ...(item.attendance || {}),
            [studentId]: status
          }
        };
      }
      return item;
    }));
  };

  const updateGuidanceSchedule = (guidanceId, guidanceData) => {
    setGuidanceSchedules(prev => prev.map(g => g.id === guidanceId ? { ...g, ...guidanceData } : g));
    showToast('Agenda bimbingan berhasil diperbarui!', 'success');
  };

  const deleteGuidanceSchedule = (guidanceId) => {
    const item = guidanceSchedules.find(g => g.id === guidanceId);
    setGuidanceSchedules(prev => prev.filter(g => g.id !== guidanceId));
    showToast(`Agenda bimbingan "${item?.title || ''}" berhasil dihapus.`, 'info');
  };

  // Student Actions
  const addStudent = (studentData) => {
    const newStudent = { id: Date.now(), ...studentData };
    setStudents(prev => [newStudent, ...prev]);
    showToast(`Siswa "${newStudent.name}" berhasil ditambahkan!`, 'success');
  };

  const updateStudent = (studentId, studentData) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...studentData } : s));
    showToast('Data siswa berhasil diperbarui!', 'success');
  };

  const deleteStudent = (studentId) => {
    const student = students.find(s => s.id === studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
    showToast(`Siswa "${student?.name || ''}" berhasil dihapus.`, 'info');
  };

  const importBulkStudents = (classId, studentList) => {
    const newStudents = studentList.map((st, i) => ({
      id: Date.now() + i,
      class_id: Number(classId),
      nis: st.nis || `26010${Math.floor(100 + Math.random() * 900)}`,
      nisn: st.nisn || '',
      name: st.name.trim(),
      gender: st.gender || 'L',
      parent_phone: st.parent_phone || '',
      address: st.address || ''
    }));
    setStudents(prev => [...prev, ...newStudents]);
    showToast(`Berhasil menambahkan ${newStudents.length} siswa baru!`, 'success');
  };

  // Class Actions
  const addClass = (classData) => {
    const newClass = { id: Date.now(), ...classData };
    setClasses(prev => [...prev, newClass]);
    showToast(`Kelas "${newClass.name}" berhasil dibuat!`, 'success');
  };

  const updateClass = (classId, classData) => {
    setClasses(prev => prev.map(c => c.id === classId ? { ...c, ...classData } : c));
    showToast('Data rombel / kelas berhasil diperbarui!', 'success');
  };

  const deleteClass = (classId) => {
    const cls = classes.find(c => c.id === classId);
    setClasses(prev => prev.filter(c => c.id !== classId));
    setStudents(prev => prev.filter(s => s.class_id !== classId));
    showToast(`Kelas "${cls?.name || ''}" dan siswanya berhasil dihapus.`, 'info');
  };

  // Subject Actions
  const addSubject = (subjectData) => {
    const newSubject = { id: Date.now(), is_active: true, ...subjectData };
    setSubjects(prev => [...prev, newSubject]);
    showToast(`Mata pelajaran "${newSubject.name}" berhasil ditambahkan!`, 'success');
  };

  const updateSubject = (subjectId, subjectData) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, ...subjectData } : s));
    showToast('Data mata pelajaran berhasil diperbarui!', 'success');
  };

  const deleteSubject = (subjectId) => {
    const sub = subjects.find(s => s.id === subjectId);
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    // Also clean up related schedules
    setSchedules(prev => prev.filter(sc => sc.subject_id !== subjectId));
    showToast(`Mata pelajaran "${sub?.name || ''}" berhasil dihapus.`, 'info');
  };

  // Schedule Actions
  const addSchedule = (scheduleData) => {
    const newSchedule = { id: Date.now(), academic_year_id: 1, semester_id: 1, ...scheduleData };
    setSchedules(prev => [...prev, newSchedule]);
    showToast('Jadwal mengajar baru berhasil ditambahkan!', 'success');
  };

  const updateSchedule = (scheduleId, scheduleData) => {
    setSchedules(prev => prev.map(sc => sc.id === scheduleId ? { ...sc, ...scheduleData } : sc));
    showToast('Jadwal mengajar berhasil diperbarui!', 'success');
  };

  const deleteSchedule = (scheduleId) => {
    setSchedules(prev => prev.filter(sc => sc.id !== scheduleId));
    showToast('Jadwal mengajar berhasil dihapus.', 'info');
  };

  // Home Visit Actions
  const addHomeVisit = (visitData) => {
    setHomeVisits(prev => [{ id: Date.now(), ...visitData }, ...prev]);
    showToast('Catatan Home Visit berhasil disimpan!', 'success');
  };

  const updateHomeVisit = (visitId, visitData) => {
    setHomeVisits(prev => prev.map(v => v.id === visitId ? { ...v, ...visitData } : v));
    showToast('Catatan Home Visit berhasil diperbarui!', 'success');
  };

  const deleteHomeVisit = (visitId) => {
    setHomeVisits(prev => prev.filter(v => v.id !== visitId));
    showToast('Catatan Home Visit berhasil dihapus.', 'info');
  };

  // Holiday Actions (Kalender Libur)
  const addHoliday = (holidayData) => {
    const newId = holidays.length > 0 ? Math.max(...holidays.map(h => Number(h.id) || 0)) + 1 : 1;
    const newHoliday = { id: newId, ...holidayData };
    setHolidays(prev => [newHoliday, ...prev]);
    showToast(`Hari libur "${newHoliday.name}" berhasil ditambahkan!`, 'success');
  };

  const updateHoliday = (holidayId, holidayData) => {
    setHolidays(prev => prev.map(h => h.id === holidayId ? { ...h, ...holidayData } : h));
    showToast('Data hari libur berhasil diperbarui!', 'success');
  };

  const deleteHoliday = (holidayId) => {
    const item = holidays.find(h => h.id === holidayId);
    setHolidays(prev => prev.filter(h => h.id !== holidayId));
    showToast(`Hari libur "${item?.name || ''}" berhasil dihapus.`, 'info');
  };

  // Grade Actions (Penilaian & KKM)
  const updateStudentGrade = (classId, subjectId, studentId, field, value) => {
    const key = `${classId}_${subjectId}`;
    const numValue = value === '' ? '' : Math.max(0, Math.min(100, Number(value) || 0));

    setGrades(prev => {
      const classSubjectGrades = prev[key] || {};
      const studentGrades = classSubjectGrades[studentId] || {};

      return {
        ...prev,
        [key]: {
          ...classSubjectGrades,
          [studentId]: {
            ...studentGrades,
            [field]: numValue
          }
        }
      };
    });
  };

  const updateKkm = (newKkm) => {
    const val = Math.max(0, Math.min(100, Number(newKkm) || 75));
    setKkm(val);
    showToast(`KKM berhasil diubah menjadi ${val}`, 'info');
  };

  // Assessment Schema & Weights Configuration Actions
  const updateAssessmentConfig = (newConfig) => {
    setAssessmentConfig(newConfig);
    showToast('Konfigurasi bobot & kolom penilaian berhasil diperbarui!', 'success');
  };

  const addAssessmentCategory = (categoryData) => {
    const newCat = {
      id: categoryData.id || `cat_${Date.now()}`,
      name: categoryData.name || 'Kategori Baru',
      shortName: categoryData.shortName || categoryData.name?.slice(0, 6) || 'Kat',
      weight: Number(categoryData.weight) || 10,
      columns: categoryData.columns && categoryData.columns.length > 0 
        ? categoryData.columns 
        : [{ id: `col_${Date.now()}`, label: `${categoryData.shortName || 'Nilai'} 1` }]
    };
    setAssessmentConfig(prev => [...prev, newCat]);
    showToast(`Kategori "${newCat.name}" berhasil ditambahkan!`, 'success');
  };

  const updateAssessmentCategory = (categoryId, updatedData) => {
    setAssessmentConfig(prev => prev.map(cat => cat.id === categoryId ? { ...cat, ...updatedData } : cat));
    showToast('Kategori penilaian berhasil diperbarui!', 'success');
  };

  const deleteAssessmentCategory = (categoryId) => {
    setAssessmentConfig(prev => {
      if (prev.length <= 1) {
        showToast('Minimal harus ada 1 kategori penilaian!', 'error');
        return prev;
      }
      return prev.filter(cat => cat.id !== categoryId);
    });
    showToast('Kategori penilaian berhasil dihapus.', 'info');
  };

  const addAssessmentColumn = (categoryId, columnLabel) => {
    setAssessmentConfig(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const colNum = (cat.columns?.length || 0) + 1;
        const label = columnLabel || `${cat.shortName || cat.name} ${colNum}`;
        const colId = `${cat.id}${colNum}_${Date.now()}`;
        return {
          ...cat,
          columns: [...(cat.columns || []), { id: colId, label }]
        };
      }
      return cat;
    }));
    showToast('Kolom penilaian baru berhasil ditambahkan!', 'success');
  };

  const updateAssessmentColumn = (categoryId, columnId, newLabel) => {
    setAssessmentConfig(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          columns: (cat.columns || []).map(col => col.id === columnId ? { ...col, label: newLabel } : col)
        };
      }
      return cat;
    }));
    showToast('Label kolom berhasil diubah.', 'success');
  };

  const deleteAssessmentColumn = (categoryId, columnId) => {
    setAssessmentConfig(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const remainingCols = (cat.columns || []).filter(col => col.id !== columnId);
        return {
          ...cat,
          columns: remainingCols
        };
      }
      return cat;
    }));
    showToast('Kolom penilaian berhasil dihapus.', 'info');
  };

  const resetAssessmentConfig = () => {
    setAssessmentConfig(initialAssessmentConfig);
    showToast('Konfigurasi penilaian berhasil direset ke standar.', 'info');
  };

  const applyAssessmentPreset = (presetKey) => {
    if (presetKey === 'kumer') {
      setAssessmentConfig([
        {
          id: 'formatif',
          name: 'Asesmen Formatif (Tugas, Diskusi & Kuis)',
          shortName: 'Formatif',
          weight: 50,
          columns: [
            { id: 'f1', label: 'Formatif 1' },
            { id: 'f2', label: 'Formatif 2' },
            { id: 'f3', label: 'Formatif 3' }
          ]
        },
        {
          id: 'sts',
          name: 'Sumatif Tengah Semester (STS)',
          shortName: 'STS',
          weight: 25,
          columns: [{ id: 'sts', label: 'STS' }]
        },
        {
          id: 'sas',
          name: 'Sumatif Akhir Semester (SAS)',
          shortName: 'SAS',
          weight: 25,
          columns: [{ id: 'sas', label: 'SAS' }]
        }
      ]);
    } else if (presetKey === 'smk') {
      setAssessmentConfig([
        {
          id: 'tugas',
          name: 'Tugas Teori / Modul',
          shortName: 'Tugas',
          weight: 20,
          columns: [
            { id: 'tugas1', label: 'Tugas 1' },
            { id: 'tugas2', label: 'Tugas 2' }
          ]
        },
        {
          id: 'praktik',
          name: 'Praktik / Proyek Kejuruan (PjBL)',
          shortName: 'Praktik',
          weight: 40,
          columns: [
            { id: 'p1', label: 'Proyek 1' },
            { id: 'p2', label: 'Proyek 2' }
          ]
        },
        {
          id: 'uh',
          name: 'Ulangan Harian / Formatif',
          shortName: 'UH',
          weight: 15,
          columns: [{ id: 'uh1', label: 'UH 1' }]
        },
        {
          id: 'pas',
          name: 'Ujian Akhir Semester / UKK',
          shortName: 'Ujian',
          weight: 25,
          columns: [{ id: 'pas', label: 'PAS / UKK' }]
        }
      ]);
    } else {
      setAssessmentConfig(initialAssessmentConfig);
    }
    showToast('Preset kurikulum berhasil diterapkan!', 'success');
  };

  // Central Grade Calculation Helper
  const calculateStudentGrade = (studentGrade, kkmValue = (kkm || 75), customConfig = assessmentConfig) => {
    const categoryAverages = {};
    let totalWeightedScore = 0;
    let totalActiveWeight = 0;

    (customConfig || []).forEach(cat => {
      const cols = cat.columns || [];
      if (cols.length === 0) {
        categoryAverages[cat.id] = 0;
        return;
      }

      let sum = 0;
      let count = 0;
      cols.forEach(col => {
        const val = studentGrade?.[col.id];
        if (val !== undefined && val !== '' && val !== null) {
          sum += Number(val) || 0;
          count++;
        }
      });

      const avg = count > 0 ? sum / count : 0;
      categoryAverages[cat.id] = Math.round(avg * 10) / 10;
      
      const catWeight = Number(cat.weight) || 0;
      totalWeightedScore += (avg * (catWeight / 100));
      totalActiveWeight += catWeight;
    });

    let na = totalWeightedScore;
    if (totalActiveWeight > 0 && totalActiveWeight !== 100) {
      na = (totalWeightedScore / totalActiveWeight) * 100;
    }
    na = Math.round(na);

    let predikat = 'D';
    if (na >= 90) predikat = 'A';
    else if (na >= 80) predikat = 'B';
    else if (na >= kkmValue) predikat = 'C';
    else predikat = 'D';

    const isTuntas = na >= kkmValue;

    return {
      categoryAverages,
      avgTugas: categoryAverages['tugas'] ?? categoryAverages['formatif'] ?? 0,
      avgUh: categoryAverages['uh'] ?? categoryAverages['praktik'] ?? 0,
      na,
      predikat,
      isTuntas
    };
  };

  // Cloud Sync State (Supabase)
  const [isSyncingToCloud, setIsSyncingToCloud] = useState(false);
  const [isSyncingFromCloud, setIsSyncingFromCloud] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => localStorage.getItem('siakad_last_sync_time') || '');

  const syncToCloud = async (silent = false) => {
    const client = getSupabaseClient();
    if (!client) {
      if (!silent) {
        showToast('Supabase belum dikonfigurasi! Buka menu Master Data > Supabase Cloud.', 'error');
      }
      return false;
    }
    setIsSyncingToCloud(true);
    try {
      // 1. School settings
      await client.from('school_settings').upsert({ id: 1, ...schoolSettings });

      // 2. Academic Years
      if (academicYears && academicYears.length > 0) {
        await client.from('academic_years').upsert(academicYears.map(ay => ({ id: ay.id, name: ay.name, is_active: ay.is_active })));
      }

      // 3. Classes
      if (classes.length > 0) {
        await client.from('classes').upsert(classes.map(c => ({ id: c.id, name: c.name, grade_level: c.grade_level, major: c.major, is_homeroom_class: c.is_homeroom_class })));
      }

      // 4. Students
      if (students.length > 0) {
        await client.from('students').upsert(students.map(s => ({ id: s.id, name: s.name, nis: s.nis, nisn: s.nisn, class_id: s.class_id, gender: s.gender, parent_phone: s.parent_phone, address: s.address })));
      }

      // 5. Subjects
      if (subjects.length > 0) {
        await client.from('subjects').upsert(subjects.map(sb => ({ id: sb.id, name: sb.name, code: sb.code, category: sb.category, is_active: sb.is_active })));
      }

      // 6. Schedules
      if (schedules.length > 0) {
        await client.from('schedules').upsert(schedules.map(sc => ({ id: sc.id, academic_year_id: sc.academic_year_id || 1, semester_id: sc.semester_id || 1, class_id: sc.class_id, subject_id: sc.subject_id, day_name: sc.day_name, start_time: sc.start_time, end_time: sc.end_time, room: sc.room })));
      }

      // 7. Attendance Records (KBM)
      if (attendanceRecords && Object.keys(attendanceRecords).length > 0) {
        const payload = Object.entries(attendanceRecords).map(([k, v]) => ({
          id: k,
          schedule_id: v.schedule_id,
          date: v.date,
          kbm_status: v.kbm_status,
          records: v.records
        }));
        await client.from('attendance_records').upsert(payload);
      }

      // 8. Teaching Journals
      if (teachingJournals && teachingJournals.length > 0) {
        await client.from('teaching_journals').upsert(teachingJournals.map(j => ({
          id: j.id,
          schedule_id: j.schedule_id,
          date: j.date,
          topic_material: j.topic_material,
          learning_objectives: j.learning_objectives,
          teaching_activities: j.teaching_activities,
          obstacles_and_solutions: j.obstacles_and_solutions,
          kbm_status: j.kbm_status,
          documentation_url: j.documentation_url
        })));
      }

      // 9. Grades
      if (grades && Object.keys(grades).length > 0) {
        const gradePayload = Object.entries(grades).map(([gk, gv]) => ({
          grade_key: gk,
          data: gv
        }));
        await client.from('grades').upsert(gradePayload);
      }

      // 10. Guidance Schedules
      if (guidanceSchedules && guidanceSchedules.length > 0) {
        await client.from('guidance_schedules').upsert(guidanceSchedules.map(g => ({ id: String(g.id), title: g.title, scheduled_date: g.scheduled_date, scheduled_time: g.scheduled_time, location: g.location, guidance_type: g.guidance_type, notes: g.notes, status: g.status, target_student_ids: g.target_student_ids, attendance: g.attendance })));
      }

      // 11. Guru Wali Students
      if (guruWaliStudentIds && guruWaliStudentIds.length > 0) {
        await client.from('guru_wali_students').upsert(guruWaliStudentIds.map(stId => ({ student_id: Number(stId) })));
      }

      // 12. Home Visits
      if (homeVisits && homeVisits.length > 0) {
        await client.from('home_visits').upsert(homeVisits.map(h => ({ id: String(h.id), student_id: h.student_id, visit_date: h.visit_date, companions: h.companions, parents_met: h.parents_met, address: h.address, purpose: h.purpose, findings: h.findings, solution_agreement: h.solution_agreement, follow_up: h.follow_up, evidence_url: h.evidence_url, evidence_link: h.evidence_link })));
      }

      // 13. Holidays
      if (holidays && holidays.length > 0) {
        await client.from('holidays').upsert(holidays.map(hol => ({ id: hol.id, name: hol.name, start_date: hol.start_date, end_date: hol.end_date, holiday_type: hol.holiday_type })));
      }

      // 14. Walas Monthly Attendance
      if (walasMonthlyAttendance && Object.keys(walasMonthlyAttendance).length > 0) {
        const walasPayload = Object.entries(walasMonthlyAttendance).map(([wk, wv]) => ({
          id: wk,
          period_key: activePeriodKey,
          records: wv
        }));
        await client.from('walas_monthly_attendance').upsert(walasPayload);
      }

      const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      setLastSyncTime(nowStr);
      localStorage.setItem('siakad_last_sync_time', nowStr);
      showToast('Seluruh data lokal (14 tabel) berhasil di-upload ke Supabase Cloud!', 'success');
      return true;
    } catch (err) {
      showToast(`Gagal upload data ke Cloud: ${err.message}`, 'error');
      return false;
    } finally {
      setIsSyncingToCloud(false);
    }
  };

  const pullFromCloud = async (skipConfirm = false) => {
    const client = getSupabaseClient();
    if (!client) {
      showToast('Supabase belum dikonfigurasi! Buka menu Master Data > Supabase Cloud.', 'error');
      return false;
    }
    if (!skipConfirm && !window.confirm('PERINGATAN: Menarik data dari Cloud akan memperbarui data lokal di perangkat ini dengan data terbaru dari Supabase. Lanjutkan?')) {
      return false;
    }
    setIsSyncingFromCloud(true);
    try {
      // 1. School settings
      const { data: schoolData } = await client.from('school_settings').select('*').limit(1).maybeSingle();
      if (schoolData) setSchoolSettings(schoolData);

      // 2. Academic Years
      const { data: yearData } = await client.from('academic_years').select('*');
      if (yearData && yearData.length > 0) setAcademicYears(yearData);

      // 3. Classes
      const { data: classData } = await client.from('classes').select('*');
      if (classData && classData.length > 0) setClasses(classData);

      // 4. Students
      const { data: studentData } = await client.from('students').select('*');
      if (studentData && studentData.length > 0) setStudents(studentData);

      // 5. Subjects
      const { data: subjectData } = await client.from('subjects').select('*');
      if (subjectData && subjectData.length > 0) setSubjects(subjectData);

      // 6. Schedules
      const { data: scheduleData } = await client.from('schedules').select('*');
      if (scheduleData && scheduleData.length > 0) setSchedules(scheduleData);

      // 7. Attendance Records
      const { data: attData } = await client.from('attendance_records').select('*');
      if (attData && attData.length > 0) {
        const attObj = {};
        attData.forEach(r => {
          attObj[r.id] = { schedule_id: r.schedule_id, date: r.date, kbm_status: r.kbm_status, records: r.records };
        });
        setAttendanceRecords(attObj);
      }

      // 8. Teaching Journals
      const { data: journalData } = await client.from('teaching_journals').select('*');
      if (journalData && journalData.length > 0) setTeachingJournals(journalData);

      // 9. Grades
      const { data: gradeData } = await client.from('grades').select('*');
      if (gradeData && gradeData.length > 0) {
        const gObj = {};
        gradeData.forEach(g => {
          gObj[g.grade_key] = g.data;
        });
        setGrades(gObj);
      }

      // 10. Guidance Schedules
      const { data: guidanceData } = await client.from('guidance_schedules').select('*');
      if (guidanceData && guidanceData.length > 0) setGuidanceSchedules(guidanceData);

      // 11. Guru Wali Students
      const { data: gwStudents } = await client.from('guru_wali_students').select('*');
      if (gwStudents && gwStudents.length > 0) setGuruWaliStudentIds(gwStudents.map(s => s.student_id));

      // 12. Home Visits
      const { data: visitData } = await client.from('home_visits').select('*');
      if (visitData && visitData.length > 0) setHomeVisits(visitData);

      // 13. Holidays
      const { data: holidayData } = await client.from('holidays').select('*');
      if (holidayData && holidayData.length > 0) setHolidays(holidayData);

      // 14. Walas Monthly Attendance
      const { data: walasData } = await client.from('walas_monthly_attendance').select('*');
      if (walasData && walasData.length > 0) {
        const wObj = {};
        walasData.forEach(w => {
          wObj[w.id] = w.records;
        });
        setWalasMonthlyAttendance(wObj);
      }

      const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      setLastSyncTime(nowStr);
      localStorage.setItem('siakad_last_sync_time', nowStr);
      showToast('Seluruh data dari Supabase Cloud berhasil ditarik dan disinkronkan ke lokal!', 'success');
      return true;
    } catch (err) {
      showToast(`Gagal menarik data dari Supabase: ${err.message}`, 'error');
      return false;
    } finally {
      setIsSyncingFromCloud(false);
    }
  };

  const isSupabaseConfigured = Boolean(getSupabaseConfig().isConfigured);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        attendanceSubTab,
        setAttendanceSubTab,
        selectedScheduleId,
        setSelectedScheduleId,
        selectedDate,
        setSelectedDate,
        schoolSettings,
        setSchoolSettings,
        classes,
        setClasses,
        students,
        setStudents,
        addStudent,
        updateStudent,
        deleteStudent,
        importBulkStudents,
        addClass,
        updateClass,
        deleteClass,
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
        updateAttendanceStatus,
        setAllPresent,
        updateKbmStatus,
        grades,
        setGrades,
        assessmentConfig,
        setAssessmentConfig,
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
        kkm,
        updateKkm,
        updateStudentGrade,
        teachingJournals,
        setTeachingJournals,
        saveTeachingJournal,
        updateTeachingJournal,
        deleteTeachingJournal,
        guidanceSchedules,
        setGuidanceSchedules,
        addGuidanceSchedule,
        updateGuidanceSchedule,
        deleteGuidanceSchedule,
        updateGuidanceAttendance,
        homeVisits,
        setHomeVisits,
        addHomeVisit,
        updateHomeVisit,
        deleteHomeVisit,
        walasMonthlyAttendance,
        setWalasMonthlyAttendance,
        updateWalasStudentAttendance,
        batchUpdateWalasAttendance,
        guruWaliStudentIds,
        setGuruWaliStudentIds,
        addGuruWaliStudent,
        removeGuruWaliStudent,
        setGuruWaliStudents,
        holidays,
        setHolidays,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        academicYears,
        setAcademicYears,
        activeAcademicYear,
        setActiveAcademicYear,
        activeSemester,
        setActiveSemester,
        activePeriodKey,
        switchAcademicPeriod,
        addAcademicYear,
        deleteAcademicYear,
        moveStudentToClass,
        swapStudentsClasses,
        batchMoveStudents,
        copyStudentsFromPeriod,
        promoteStudentsToNextGrade,
        versionLogs: initialVersionLogs,
        // Cloud Sync Methods & States
        syncToCloud,
        pullFromCloud,
        isSyncingToCloud,
        isSyncingFromCloud,
        isSupabaseConfigured,
        lastSyncTime,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

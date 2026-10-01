import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModalDrawer } from '../components/common/ModalDrawer';
import { KopSurat } from '../components/common/KopSurat';
import {
  Users,
  Calendar,
  Home,
  FileCheck,
  Plus,
  Phone,
  MapPin,
  Camera,
  ExternalLink,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  UserCheck,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Filter,
  GraduationCap,
  Layers,
  Sparkles,
  ShieldCheck,
  UserX
} from 'lucide-react';

export const HomeroomView = () => {
  const {
    classes,
    students,
    guidanceSchedules,
    addGuidanceSchedule,
    updateGuidanceSchedule,
    deleteGuidanceSchedule,
    updateGuidanceAttendance,
    homeVisits,
    addHomeVisit,
    updateHomeVisit,
    deleteHomeVisit,
    guruWaliStudentIds,
    setGuruWaliStudents,
    addGuruWaliStudent,
    removeGuruWaliStudent,
    schoolSettings,
    showToast
  } = useApp();

  // Active Sub-Tab: 'guru-wali' (Multi-Kelas) | 'guidance' | 'home-visit' | 'homeroom-class' (Wali Rombel Tertentu)
  const [activeSubTab, setActiveSubTab] = useState('guru-wali');
  
  // Drawer states
  const [isHomeVisitDrawerOpen, setIsHomeVisitDrawerOpen] = useState(false);
  const [isGuidanceDrawerOpen, setIsGuidanceDrawerOpen] = useState(false);
  const [isManageGuruWaliDrawerOpen, setIsManageGuruWaliDrawerOpen] = useState(false);
  const [isGuidanceRecapPrintOpen, setIsGuidanceRecapPrintOpen] = useState(false);
  const [isHomeVisitRecapPrintOpen, setIsHomeVisitRecapPrintOpen] = useState(false);
  const [homeVisitRecapPrintStudentFilter, setHomeVisitRecapPrintStudentFilter] = useState('all');
  const [editingGuidanceId, setEditingGuidanceId] = useState(null);
  const [editingHomeVisitId, setEditingHomeVisitId] = useState(null);
  const [homeVisitStudentFilter, setHomeVisitStudentFilter] = useState('all');
  const [selectedHomeVisitForPrint, setSelectedHomeVisitForPrint] = useState(null);

  // Filter & Search states for Guidance Agenda Tab & Printable Recap
  const [guidanceTypeFilter, setGuidanceTypeFilter] = useState('all'); // 'all' | 'Individu' | 'Kelompok' | 'Klasikal'
  const [guidanceStatusFilter, setGuidanceStatusFilter] = useState('all'); // 'all' | 'Terjadwal' | 'Selesai' | 'Dibatalkan'
  const [guidanceSearchQuery, setGuidanceSearchQuery] = useState('');
  const [recapPrintTypeFilter, setRecapPrintTypeFilter] = useState('all');

  // Filter & Search states for Guru Wali Tab
  const [filterClassForGuruWaliView, setFilterClassForGuruWaliView] = useState('all');
  const [searchGuruWaliQuery, setSearchGuruWaliQuery] = useState('');

  // Manage Guru Wali Multi-Class Picker State
  const [tempSelectedStudentIds, setTempSelectedStudentIds] = useState([]);
  const [pickerClassFilter, setPickerClassFilter] = useState('all');
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');

  // Siswa Binaan Guru Wali (Lintas Kelas / Multi-Kelas)
  const guruWaliStudents = students.filter(s => (guruWaliStudentIds || []).includes(s.id));
  const uniqueGuruWaliClasses = Array.from(new Set(guruWaliStudents.map(s => s.class_id)))
    .map(cid => classes.find(c => c.id === cid))
    .filter(Boolean);

  // Guidance Form State
  const [guidanceForm, setGuidanceForm] = useState({
    title: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '13:00',
    location: 'Ruang Bimbingan / Konseling',
    guidance_type: 'Kelompok',
    notes: '',
    status: 'Terjadwal',
    target_student_ids: guruWaliStudents.length > 0 ? [guruWaliStudents[0].id] : []
  });

  // Home Visit Form State
  const [homeVisitForm, setHomeVisitForm] = useState({
    student_id: guruWaliStudents[0]?.id || students[0]?.id || 1,
    visit_date: new Date().toISOString().split('T')[0],
    companions: 'Guru BK / Wali Kelas',
    parents_met: '',
    address: '',
    purpose: '',
    findings: '',
    solution_agreement: '',
    follow_up: '',
    evidence_url: '',
    evidence_link: ''
  });

  // Open Drawer to manage/select Guru Wali multi-class students
  const handleOpenManageGuruWaliDrawer = () => {
    setTempSelectedStudentIds([...(guruWaliStudentIds || [])]);
    setPickerClassFilter('all');
    setPickerSearchQuery('');
    setIsManageGuruWaliDrawerOpen(true);
  };

  const handleSaveManageGuruWali = (e) => {
    e.preventDefault();
    setGuruWaliStudents(tempSelectedStudentIds);
    setIsManageGuruWaliDrawerOpen(false);
  };

  const handleOpenNewGuidance = () => {
    setEditingGuidanceId(null);
    setGuidanceForm({
      title: '',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '13:00',
      location: 'Ruang Bimbingan / Konseling',
      guidance_type: 'Kelompok',
      notes: '',
      status: 'Terjadwal',
      target_student_ids: guruWaliStudents.length > 0 ? [guruWaliStudents[0].id] : []
    });
    setIsGuidanceDrawerOpen(true);
  };

  const handleEditGuidance = (guidance) => {
    setEditingGuidanceId(guidance.id);
    setGuidanceForm({
      title: guidance.title || '',
      scheduled_date: guidance.scheduled_date || new Date().toISOString().split('T')[0],
      scheduled_time: guidance.scheduled_time || '13:00',
      location: guidance.location || 'Ruang Bimbingan / Konseling',
      guidance_type: guidance.guidance_type || 'Kelompok',
      notes: guidance.notes || '',
      status: guidance.status || 'Terjadwal',
      target_student_ids: guidance.target_student_ids || []
    });
    setIsGuidanceDrawerOpen(true);
  };

  const handleDeleteGuidance = (guidance) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus agenda bimbingan "${guidance.title}"?`)) {
      deleteGuidanceSchedule(guidance.id);
    }
  };

  const handleSaveGuidance = (e) => {
    e.preventDefault();
    if (!guidanceForm.title.trim()) {
      showToast('Judul bimbingan wajib diisi!', 'error');
      return;
    }

    if (editingGuidanceId) {
      const existing = guidanceSchedules.find(g => g.id === editingGuidanceId);
      const updatedAtt = { ...(existing?.attendance || {}) };
      guidanceForm.target_student_ids.forEach(id => {
        if (!updatedAtt[id]) {
          updatedAtt[id] = 'H';
        }
      });

      updateGuidanceSchedule(editingGuidanceId, {
        ...guidanceForm,
        attendance: updatedAtt
      });
      setEditingGuidanceId(null);
    } else {
      const initialAtt = {};
      guidanceForm.target_student_ids.forEach(id => {
        initialAtt[id] = 'H';
      });
      addGuidanceSchedule({
        ...guidanceForm,
        status: guidanceForm.status || 'Terjadwal',
        attendance: initialAtt
      });
    }
    setIsGuidanceDrawerOpen(false);
  };

  const handleOpenNewHomeVisit = () => {
    setEditingHomeVisitId(null);
    const defaultStudent = guruWaliStudents[0] || students[0];
    setHomeVisitForm({
      student_id: defaultStudent?.id || 1,
      visit_date: new Date().toISOString().split('T')[0],
      companions: 'Guru BK / Wali Kelas',
      parents_met: '',
      address: defaultStudent?.address || '',
      purpose: '',
      findings: '',
      solution_agreement: '',
      follow_up: '',
      evidence_url: '',
      evidence_link: ''
    });
    setIsHomeVisitDrawerOpen(true);
  };

  const handleEditHomeVisit = (visit) => {
    setEditingHomeVisitId(visit.id);
    setHomeVisitForm({
      student_id: visit.student_id,
      visit_date: visit.visit_date || new Date().toISOString().split('T')[0],
      companions: visit.companions || 'Guru BK / Wali Kelas',
      parents_met: visit.parents_met || '',
      address: visit.address || '',
      purpose: visit.purpose || '',
      findings: visit.findings || '',
      solution_agreement: visit.solution_agreement || '',
      follow_up: visit.follow_up || '',
      evidence_url: visit.evidence_url || '',
      evidence_link: visit.evidence_link || ''
    });
    setIsHomeVisitDrawerOpen(true);
  };

  const handleDeleteHomeVisit = (visit) => {
    const student = students.find(s => s.id === visit.student_id);
    if (window.confirm(`Apakah Anda yakin ingin menghapus arsip kunjungan rumah untuk "${student?.name || 'Siswa'}"?`)) {
      deleteHomeVisit(visit.id);
    }
  };

  const handleSaveHomeVisit = (e) => {
    e.preventDefault();
    if (!homeVisitForm.purpose.trim()) {
      showToast('Tujuan kunjungan rumah wajib diisi!', 'error');
      return;
    }
    const student = students.find(s => s.id === Number(homeVisitForm.student_id));
    const payload = {
      ...homeVisitForm,
      student_id: Number(homeVisitForm.student_id),
      address: homeVisitForm.address || student?.address || 'Alamat Siswa'
    };

    if (editingHomeVisitId) {
      updateHomeVisit(editingHomeVisitId, payload);
      setEditingHomeVisitId(null);
    } else {
      addHomeVisit(payload);
    }
    setIsHomeVisitDrawerOpen(false);
  };

  const handleOpenGuidanceForStudent = (student) => {
    setEditingGuidanceId(null);
    setGuidanceForm({
      title: `Bimbingan Konseling / Guru Wali: ${student.name}`,
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '13:00',
      location: 'Ruang Bimbingan / Konseling',
      guidance_type: 'Individu',
      notes: '',
      status: 'Terjadwal',
      target_student_ids: [student.id]
    });
    setIsGuidanceDrawerOpen(true);
  };

  const handleOpenHomeVisitForStudent = (student) => {
    setEditingHomeVisitId(null);
    setHomeVisitForm({
      student_id: student.id,
      visit_date: new Date().toISOString().split('T')[0],
      companions: 'Guru BK / Wali Kelas',
      parents_met: '',
      address: student.address || '',
      purpose: `Kunjungan rumah pembinaan siswa ${student.name}`,
      findings: '',
      solution_agreement: '',
      follow_up: '',
      evidence_url: '',
      evidence_link: ''
    });
    setIsHomeVisitDrawerOpen(true);
  };

  const handleSimulatePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setHomeVisitForm({ ...homeVisitForm, evidence_url: localUrl });
      showToast('Foto bukti berhasil dipilih!', 'info');
    }
  };

  // Filtered Guru Wali students for tab 1
  const displayedGuruWaliStudents = guruWaliStudents.filter(s => {
    const matchClass = filterClassForGuruWaliView === 'all' || s.class_id === Number(filterClassForGuruWaliView);
    const matchSearch = searchGuruWaliQuery === '' || 
      s.name.toLowerCase().includes(searchGuruWaliQuery.toLowerCase()) || 
      s.nis.includes(searchGuruWaliQuery);
    return matchClass && matchSearch;
  });

  // Filtered Guidance Schedules for tab 2
  const displayedGuidanceSchedules = guidanceSchedules.filter(g => {
    const matchType = guidanceTypeFilter === 'all' || g.guidance_type === guidanceTypeFilter;
    const matchStatus = guidanceStatusFilter === 'all' || g.status === guidanceStatusFilter;
    const matchSearch = guidanceSearchQuery === '' || 
      g.title.toLowerCase().includes(guidanceSearchQuery.toLowerCase()) || 
      (g.notes && g.notes.toLowerCase().includes(guidanceSearchQuery.toLowerCase())) ||
      (g.location && g.location.toLowerCase().includes(guidanceSearchQuery.toLowerCase())) ||
      (g.target_student_ids && g.target_student_ids.some(id => {
        const st = students.find(s => s.id === id);
        return st?.name.toLowerCase().includes(guidanceSearchQuery.toLowerCase());
      }));
    return matchType && matchStatus && matchSearch;
  });

  // Filtered Guidance List for Printable Recap Modal
  const recapPrintGuidanceList = guidanceSchedules.filter(g => {
    if (recapPrintTypeFilter === 'all') return true;
    return g.guidance_type === recapPrintTypeFilter;
  });

  // Filtered Home Visit List for Printable Recap Modal
  const recapPrintHomeVisitList = homeVisits.filter(v => {
    if (homeVisitRecapPrintStudentFilter === 'all') return true;
    return v.student_id === Number(homeVisitRecapPrintStudentFilter);
  });

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      
      {/* 1. Guru Wali Header Banner Card */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-indigo-500/20 shadow-sm no-print">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-black">
              <Users size={13} />
              <span>Guru Wali (Multi-Kelas)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
              <Layers size={12} />
              <span>{uniqueGuruWaliClasses.length} Rombel Lintas Kelas</span>
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Bimbingan Guru Wali
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Membina <strong>{guruWaliStudents.length} Siswa Binaan</strong> yang dipilih secara khusus dari berbagai kelas.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenManageGuruWaliDrawer}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus size={15} />
            <span>Pilih Siswa Binaan Multi-Kelas</span>
          </button>
          <button
            onClick={handleOpenNewGuidance}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs border border-slate-300 dark:border-slate-700 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Calendar size={15} />
            <span>Jadwalkan Bimbingan</span>
          </button>
        </div>
      </div>

      {/* 2. Top Segmented Navigation Tabs (Matching exact desktop navbar pill style) */}
      <div className="flex items-center justify-start overflow-x-auto pb-1 scrollbar-none no-print">
        <nav className="inline-flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
          {[
            { id: 'guru-wali', label: `Siswa Binaan (${guruWaliStudents.length})`, icon: Users },
            { id: 'guidance', label: `Agenda Bimbingan BK (${guidanceSchedules.length})`, icon: Calendar },
            { id: 'home-visit', label: `Kunjungan Rumah (${homeVisits.length})`, icon: Home },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-slate-900/5 dark:shadow-black/20'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  size={15}
                  className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Sub Tab Contents */}

      {/* 3.1 Tab: Siswa Binaan Guru Wali (Multi-Kelas) */}
      {activeSubTab === 'guru-wali' && (
        <div className="space-y-4">
          
          {/* Filter & Search Bar */}
          <div className="glass-card p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIS siswa binaan..."
                  value={searchGuruWaliQuery}
                  onChange={(e) => setSearchGuruWaliQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={filterClassForGuruWaliView}
                onChange={(e) => setFilterClassForGuruWaliView(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="all">Semua Rombel Asal ({guruWaliStudents.length})</option>
                {classes.map(c => {
                  const countInClass = guruWaliStudents.filter(s => s.class_id === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      Kelas {c.name} ({countInClass} Siswa)
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={handleOpenManageGuruWaliDrawer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors self-start sm:self-auto"
            >
              <UserPlus size={13} />
              <span>Kelola / Tambah Siswa Lintas Kelas</span>
            </button>
          </div>

          {/* Student Grid */}
          {displayedGuruWaliStudents.length === 0 ? (
            <div className="glass-card p-10 rounded-3xl text-center space-y-3">
              <Users size={36} className="mx-auto text-indigo-400 opacity-50" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Belum Ada Siswa Binaan Terpilih</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Sebagai Guru Wali, Anda dapat membina siswa dari berbagai kelas (multi-kelas). Klik tombol di bawah untuk memilih siswa binaan Anda.
              </p>
              <button
                onClick={handleOpenManageGuruWaliDrawer}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                <UserPlus size={14} />
                <span>Pilih Siswa Lintas Kelas</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedGuruWaliStudents.map((student, idx) => {
                const studentClass = classes.find(c => c.id === student.class_id);

                return (
                  <div
                    key={student.id}
                    className="glass-card p-4 rounded-2xl space-y-3 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{student.name}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">NIS: {student.nis}</p>
                          </div>
                        </div>

                        {/* Multi-Class Origin Badge */}
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 whitespace-nowrap shadow-sm">
                          {studentClass?.name || 'Kelas ?'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Phone size={12} className="text-emerald-600 dark:text-emerald-400" />
                          <span>HP Ortu: <strong className="text-slate-800 dark:text-slate-200">{student.parent_phone || '-'}</strong></span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <MapPin size={12} className="text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                          <span className="truncate">{student.address || 'Alamat belum diinput'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60">
                      <button
                        onClick={() => {
                          if (window.confirm(`Lepas ${student.name} (${studentClass?.name}) dari daftar siswa binaan Guru Wali?`)) {
                            removeGuruWaliStudent(student.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Lepas dari Siswa Binaan"
                      >
                        <UserX size={13} />
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenGuidanceForStudent(student)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] transition-colors"
                        >
                          <Calendar size={11} />
                          <span>Bimbing</span>
                        </button>
                        <button
                          onClick={() => handleOpenHomeVisitForStudent(student)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] transition-colors"
                        >
                          <Home size={11} />
                          <span>Home Visit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3.2 Tab: Agenda Bimbingan Siswa */}
      {activeSubTab === 'guidance' && (
        <div className="space-y-4">
          
          {/* Header & Filter Toolbar */}
          <div className="glass-card p-3 sm:p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-200">
                Agenda & Histori Bimbingan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total {displayedGuidanceSchedules.length} Sesi Bimbingan Ditampilkan
              </p>
            </div>

            {/* Filter controls & Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative min-w-[160px]">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari topik / siswa..."
                  value={guidanceSearchQuery}
                  onChange={(e) => setGuidanceSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Filter Jenis: Individu / Kelompok / Semua */}
              <select
                value={guidanceTypeFilter}
                onChange={(e) => setGuidanceTypeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
              >
                <option value="all">Semua Jenis Bimbingan</option>
                <option value="Individu">Bimbingan Individu</option>
                <option value="Kelompok">Bimbingan Kelompok</option>
                <option value="Klasikal">Bimbingan Klasikal</option>
              </select>

              {/* Filter Status */}
              <select
                value={guidanceStatusFilter}
                onChange={(e) => setGuidanceStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="Terjadwal">Terjadwal</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>

              {/* Cetak Rekap Button */}
              <button
                onClick={() => {
                  setRecapPrintTypeFilter(guidanceTypeFilter);
                  setIsGuidanceRecapPrintOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-sm active:scale-95 transition-all"
                title="Cetak Rekapitulasi Laporan Bimbingan"
              >
                <Printer size={13} className="text-indigo-600 dark:text-indigo-400" />
                <span>Cetak Rekap</span>
              </button>

              {/* Jadwalkan Button */}
              <button
                onClick={handleOpenNewGuidance}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md active:scale-95"
              >
                <Plus size={14} />
                <span>Jadwalkan</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {displayedGuidanceSchedules.length === 0 ? (
              <div className="glass-card p-8 rounded-2xl text-center text-slate-500 dark:text-slate-400">
                <Calendar size={32} className="mx-auto mb-2 opacity-40 text-indigo-500" />
                <p className="font-bold text-sm">Tidak ada agenda bimbingan yang sesuai filter.</p>
                <p className="text-xs mt-1">Coba sesuaikan filter jenis (Individu / Kelompok) atau jadwalkan bimbingan baru.</p>
              </div>
            ) : (
              displayedGuidanceSchedules.map((guidance) => (
                <div
                  key={guidance.id}
                  className="glass-card p-4 rounded-2xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
                          guidance.guidance_type === 'Individu'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                            : guidance.guidance_type === 'Kelompok'
                            ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                            : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                        }`}>
                          {guidance.guidance_type}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock size={12} />
                          {guidance.scheduled_date} ({guidance.scheduled_time} WIB)
                        </span>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1">{guidance.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{guidance.location}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                        guidance.status === 'Selesai'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                          : guidance.status === 'Dibatalkan'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20'
                          : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'
                      }`}>
                        {guidance.status}
                      </span>

                      {/* Edit & Delete Action Buttons */}
                      <button
                        onClick={() => handleEditGuidance(guidance)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors"
                        title="Edit Agenda / Histori Bimbingan"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteGuidance(guidance)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 transition-colors"
                        title="Hapus Agenda Bimbingan"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {guidance.notes && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <strong>Catatan / Rencana & Hasil:</strong> {guidance.notes}
                    </p>
                  )}

                  {/* Guidance Student Attendance Checklist with Class Badge */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                      Presensi Siswa Bimbingan ({guidance.target_student_ids?.length || 0} Siswa):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {guidance.target_student_ids?.map((stId) => {
                        const st = students.find(s => s.id === stId);
                        const stClass = classes.find(c => c.id === st?.class_id);
                        const att = guidance.attendance?.[stId] || 'H';

                        return (
                          <div
                            key={stId}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200">{st?.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                              {stClass?.name}
                            </span>
                            <div className="flex items-center gap-1">
                              {['H', 'S', 'I', 'A'].map((k) => (
                                <button
                                  key={k}
                                  onClick={() => updateGuidanceAttendance(guidance.id, stId, k)}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                    att === k
                                      ? k === 'H' ? 'bg-emerald-600 text-white' : k === 'S' ? 'bg-blue-600 text-white' : k === 'I' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                  }`}
                                >
                                  {k}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3.3 Tab: Home Visit */}
      {activeSubTab === 'home-visit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-200">Arsip Kunjungan Rumah (Home Visit)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {homeVisits.length} Total Arsip Kunjungan Siswa Binaan
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={homeVisitStudentFilter}
                onChange={(e) => setHomeVisitStudentFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 focus:outline-none"
              >
                <option value="all">Semua Siswa Binaan</option>
                {guruWaliStudents.map(s => {
                  const stClass = classes.find(c => c.id === s.class_id);
                  return (
                    <option key={s.id} value={s.id}>{s.name} ({stClass?.name})</option>
                  );
                })}
              </select>

              <button
                onClick={() => {
                  setHomeVisitRecapPrintStudentFilter(homeVisitStudentFilter);
                  setIsHomeVisitRecapPrintOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-sm transition-all active:scale-95"
                title="Cetak Rekapitulasi Laporan Home Visit"
              >
                <Printer size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Cetak Rekap Kunjungan</span>
              </button>

              <button
                onClick={handleOpenNewHomeVisit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md active:scale-95"
              >
                <Plus size={14} />
                <span>Tambah Kunjungan</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {homeVisits
              .filter(v => homeVisitStudentFilter === 'all' || v.student_id === Number(homeVisitStudentFilter))
              .length === 0 ? (
                <div className="glass-card p-8 rounded-2xl text-center text-slate-500 dark:text-slate-400">
                  <Home size={32} className="mx-auto mb-2 opacity-40 text-emerald-500" />
                  <p className="font-bold text-sm">Belum ada arsip kunjungan rumah.</p>
                  <p className="text-xs mt-1">Klik tombol "Tambah Kunjungan" di atas untuk menambahkan data baru.</p>
                </div>
              ) : (
                homeVisits
                  .filter(v => homeVisitStudentFilter === 'all' || v.student_id === Number(homeVisitStudentFilter))
                  .map((visit) => {
                    const student = students.find(s => s.id === visit.student_id);
                    const studentClass = classes.find(c => c.id === student?.class_id);

                    return (
                      <div
                        key={visit.id}
                        className="glass-card p-4 rounded-2xl space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                {student?.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                                {studentClass?.name}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">Tanggal: {visit.visit_date}</span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">Tujuan: {visit.purpose}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Bertemu dengan: {visit.parents_met || '-'} • Pendamping: {visit.companions || '-'}</p>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                            <button
                              onClick={() => handleEditHomeVisit(visit)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-sm transition-colors"
                              title="Edit Catatan Home Visit"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteHomeVisit(visit)}
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 shadow-sm transition-colors"
                              title="Hapus Arsip Home Visit"
                            >
                              <Trash2 size={13} />
                            </button>
                            <button
                              onClick={() => setSelectedHomeVisitForPrint(visit)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800 shadow-sm"
                            >
                              <Printer size={13} />
                              <span>Cetak Berita Acara</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Temuan Masalah:</span>
                            <p className="text-slate-800 dark:text-slate-300 mt-0.5">{visit.findings || '-'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Kesepakatan Solusi:</span>
                            <p className="text-slate-800 dark:text-slate-300 mt-0.5">{visit.solution_agreement || '-'}</p>
                          </div>
                        </div>

                        {/* Photo Evidence & Links */}
                        {(visit.evidence_url || visit.evidence_link) && (
                          <div className="flex items-center gap-3 pt-1">
                            {visit.evidence_url && (
                              <a
                                href={visit.evidence_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                              >
                                <Camera size={13} />
                                <span>Lihat Foto Dokumentasi</span>
                              </a>
                            )}
                            {visit.evidence_link && (
                              <a
                                href={visit.evidence_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                              >
                                <ExternalLink size={13} />
                                <span>Folder Google Drive</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
          </div>
        </div>
      )}



      {/* Drawer: Kelola Siswa Binaan Guru Wali (Multi-Kelas) */}
      <ModalDrawer
        isOpen={isManageGuruWaliDrawerOpen}
        onClose={() => setIsManageGuruWaliDrawerOpen(false)}
        title="Pilih Siswa Binaan Guru Wali (Multi-Kelas)"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveManageGuruWali} className="space-y-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-900 dark:text-indigo-200">
            <p className="font-bold flex items-center gap-1.5 mb-1">
              <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>Konsep Guru Wali (Lintas Kelas)</span>
            </p>
            <p className="leading-relaxed">
              Centang siswa yang menjadi binaan Anda dari rombel mana pun (X RPL 1, XI RPL 2, XII TKJ, dsb.). Anda dapat memilih siswa dari beberapa kelas sekaligus.
            </p>
          </div>

          {/* Filter Rombel & Search Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIS siswa..."
                value={pickerSearchQuery}
                onChange={(e) => setPickerSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={pickerClassFilter}
              onChange={(e) => setPickerClassFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
            >
              <option value="all">Semua Kelas ({students.length} Siswa)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Kelas {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Multi-Class Quick Select Bar */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {tempSelectedStudentIds.length} Siswa Terpilih sebagai Binaan
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const filtered = students.filter(s => {
                    const matchClass = pickerClassFilter === 'all' || s.class_id === Number(pickerClassFilter);
                    const matchSearch = pickerSearchQuery === '' || s.name.toLowerCase().includes(pickerSearchQuery.toLowerCase());
                    return matchClass && matchSearch;
                  });
                  const idsToAdd = filtered.map(s => s.id);
                  setTempSelectedStudentIds(prev => Array.from(new Set([...prev, ...idsToAdd])));
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Pilih Semua Hasil
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={() => setTempSelectedStudentIds([])}
                className="text-slate-500 hover:underline"
              >
                Kosongkan
              </button>
            </div>
          </div>

          {/* Student Picker List */}
          <div className="max-h-72 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl space-y-1.5">
            {students
              .filter(s => {
                const matchClass = pickerClassFilter === 'all' || s.class_id === Number(pickerClassFilter);
                const matchSearch = pickerSearchQuery === '' || 
                  s.name.toLowerCase().includes(pickerSearchQuery.toLowerCase()) || 
                  s.nis.includes(pickerSearchQuery);
                return matchClass && matchSearch;
              })
              .map(student => {
                const isChecked = tempSelectedStudentIds.includes(student.id);
                const stClass = classes.find(c => c.id === student.class_id);

                return (
                  <label
                    key={student.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-900 dark:text-indigo-100 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTempSelectedStudentIds(prev => [...prev, student.id]);
                          } else {
                            setTempSelectedStudentIds(prev => prev.filter(id => id !== student.id));
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{student.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                        {stClass?.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">NIS: {student.nis}</span>
                    </div>
                  </label>
                );
              })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsManageGuruWaliDrawerOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
            >
              Simpan Siswa Binaan ({tempSelectedStudentIds.length})
            </button>
          </div>
        </form>
      </ModalDrawer>

      {/* Drawer: Input / Edit Home Visit */}
      <ModalDrawer
        isOpen={isHomeVisitDrawerOpen}
        onClose={() => {
          setIsHomeVisitDrawerOpen(false);
          setEditingHomeVisitId(null);
        }}
        title={editingHomeVisitId ? 'Edit Catatan Kunjungan Rumah (Home Visit)' : 'Catatan Kunjungan Rumah (Home Visit)'}
      >
        <form onSubmit={handleSaveHomeVisit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Siswa Target *</label>
            <select
              value={homeVisitForm.student_id}
              onChange={(e) => {
                const sId = Number(e.target.value);
                const sObj = students.find(s => s.id === sId);
                setHomeVisitForm({
                  ...homeVisitForm,
                  student_id: sId,
                  address: sObj?.address || homeVisitForm.address
                });
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              <optgroup label="Siswa Binaan Guru Wali (Lintas Kelas)">
                {guruWaliStudents.map(s => {
                  const stClass = classes.find(c => c.id === s.class_id);
                  return (
                    <option key={s.id} value={s.id}>{s.name} ({stClass?.name})</option>
                  );
                })}
              </optgroup>
              <optgroup label="Seluruh Siswa Lainnya">
                {students
                  .filter(s => !(guruWaliStudentIds || []).includes(s.id))
                  .map(s => {
                    const stClass = classes.find(c => c.id === s.class_id);
                    return (
                      <option key={s.id} value={s.id}>{s.name} ({stClass?.name})</option>
                    );
                  })}
              </optgroup>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Kunjungan</label>
              <input
                type="date"
                value={homeVisitForm.visit_date}
                onChange={(e) => setHomeVisitForm({ ...homeVisitForm, visit_date: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bertemu Orang Tua/Wali</label>
              <input
                type="text"
                placeholder="Nama orang tua..."
                value={homeVisitForm.parents_met}
                onChange={(e) => setHomeVisitForm({ ...homeVisitForm, parents_met: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Tempat Tinggal</label>
            <input
              type="text"
              placeholder="Alamat lengkap siswa..."
              value={homeVisitForm.address}
              onChange={(e) => setHomeVisitForm({ ...homeVisitForm, address: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tujuan Kunjungan *</label>
            <textarea
              rows={2}
              required
              placeholder="Contoh: Konfirmasi ketidakhadiran dan pembahasan tindak lanjut pembelajaran..."
              value={homeVisitForm.purpose}
              onChange={(e) => setHomeVisitForm({ ...homeVisitForm, purpose: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Temuan & Kondisi Lapangan</label>
            <textarea
              rows={2}
              placeholder="Temuan masalah yang disampaikan orang tua..."
              value={homeVisitForm.findings}
              onChange={(e) => setHomeVisitForm({ ...homeVisitForm, findings: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kesepakatan Solusi & Tindak Lanjut</label>
            <textarea
              rows={2}
              placeholder="Solusi yang disepakati bersama orang tua..."
              value={homeVisitForm.solution_agreement}
              onChange={(e) => setHomeVisitForm({ ...homeVisitForm, solution_agreement: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Upload Photo / Drive Link */}
          <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Foto Bukti / Cloud Storage</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs text-slate-600 dark:text-slate-300 transition-colors">
                <Camera size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Pilih Foto Bukti</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSimulatePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="url"
              placeholder="Atau tautan Google Drive / Folder Dokumentasi..."
              value={homeVisitForm.evidence_link}
              onChange={(e) => setHomeVisitForm({ ...homeVisitForm, evidence_link: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsHomeVisitDrawerOpen(false);
                setEditingHomeVisitId(null);
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
            >
              {editingHomeVisitId ? 'Simpan Perubahan' : 'Simpan Home Visit'}
            </button>
          </div>
        </form>
      </ModalDrawer>

      {/* Drawer: Add / Edit Guidance Schedule */}
      <ModalDrawer
        isOpen={isGuidanceDrawerOpen}
        onClose={() => {
          setIsGuidanceDrawerOpen(false);
          setEditingGuidanceId(null);
        }}
        title={editingGuidanceId ? 'Edit Agenda / Catatan Bimbingan' : 'Jadwalkan Agenda Bimbingan Siswa'}
      >
        <form onSubmit={handleSaveGuidance} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul / Topik Bimbingan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Konseling Persiapan Magang Industri..."
              value={guidanceForm.title}
              onChange={(e) => setGuidanceForm({ ...guidanceForm, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
              <input
                type="date"
                value={guidanceForm.scheduled_date}
                onChange={(e) => setGuidanceForm({ ...guidanceForm, scheduled_date: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Waktu</label>
              <input
                type="time"
                value={guidanceForm.scheduled_time}
                onChange={(e) => setGuidanceForm({ ...guidanceForm, scheduled_time: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis</label>
              <select
                value={guidanceForm.guidance_type}
                onChange={(e) => setGuidanceForm({ ...guidanceForm, guidance_type: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="Kelompok">Kelompok</option>
                <option value="Individu">Individu</option>
                <option value="Klasikal">Klasikal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={guidanceForm.status || 'Terjadwal'}
                onChange={(e) => setGuidanceForm({ ...guidanceForm, status: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="Terjadwal">Terjadwal</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi</label>
              <input
                type="text"
                placeholder="Ruang..."
                value={guidanceForm.location}
                onChange={(e) => setGuidanceForm({ ...guidanceForm, location: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan / Rencana Pembinaan / Hasil</label>
            <textarea
              rows={2}
              placeholder="Catatan detail bimbingan atau hasil pembahasan..."
              value={guidanceForm.notes}
              onChange={(e) => setGuidanceForm({ ...guidanceForm, notes: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Student Multi-Select Picker (Prioritize Guru Wali Students with Class Badges) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Siswa Target Bimbingan ({guidanceForm.target_student_ids?.length || 0} Dipilih) *
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setGuidanceForm({ ...guidanceForm, target_student_ids: guruWaliStudents.map(s => s.id) })}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Pilih Semua Binaan
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setGuidanceForm({ ...guidanceForm, target_student_ids: [] })}
                  className="text-slate-500 hover:underline"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            <div className="max-h-44 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl space-y-1.5">
              {students.map(s => {
                const isChecked = guidanceForm.target_student_ids?.includes(s.id);
                const isMentored = (guruWaliStudentIds || []).includes(s.id);
                const stClass = classes.find(c => c.id === s.class_id);

                return (
                  <label
                    key={s.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(isChecked)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGuidanceForm({ ...guidanceForm, target_student_ids: [...(guidanceForm.target_student_ids || []), s.id] });
                          } else {
                            setGuidanceForm({ ...guidanceForm, target_student_ids: (guidanceForm.target_student_ids || []).filter(id => id !== s.id) });
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{s.name}</span>
                      {isMentored && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold">
                          Binaan
                        </span>
                      )}
                    </div>
                    
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {stClass?.name} • NIS: {s.nis}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsGuidanceDrawerOpen(false);
                setEditingGuidanceId(null);
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
            >
              {editingGuidanceId ? 'Simpan Perubahan' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </ModalDrawer>

      {/* Print Preview Modal for Home Visit */}
      {selectedHomeVisitForPrint && (
        <ModalDrawer
          isOpen={Boolean(selectedHomeVisitForPrint)}
          onClose={() => setSelectedHomeVisitForPrint(null)}
          title="Berita Acara Kunjungan Rumah Resmi"
          maxWidth="max-w-2xl"
        >
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl select-text space-y-4">
            <KopSurat
              title="SURAT BERITA ACARA KUNJUNGAN RUMAH (HOME VISIT)"
              subtitle={`Nomor: 421.5 / HV / ${new Date().getFullYear()}`}
            />

            <div className="text-xs space-y-2 leading-relaxed">
              <p>Pada hari ini tanggal <strong>{selectedHomeVisitForPrint.visit_date}</strong>, telah dilaksanakan kunjungan rumah terhadap siswa binaan berikut:</p>
              
              <table className="w-full my-2 text-xs">
                <tbody>
                  <tr>
                    <td className="w-32 py-1 font-bold">Nama Siswa</td>
                    <td>: {students.find(s => s.id === selectedHomeVisitForPrint.student_id)?.name}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-bold">NIS / Kelas</td>
                    <td>: {students.find(s => s.id === selectedHomeVisitForPrint.student_id)?.nis} / {classes.find(c => c.id === students.find(s => s.id === selectedHomeVisitForPrint.student_id)?.class_id)?.name}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-bold">Alamat Dikunjungi</td>
                    <td>: {selectedHomeVisitForPrint.address}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-bold">Orang Tua / Wali</td>
                    <td>: {selectedHomeVisitForPrint.parents_met}</td>
                  </tr>
                </tbody>
              </table>

              <div className="space-y-1.5 pt-2">
                <p><strong>1. Maksud & Tujuan:</strong><br />{selectedHomeVisitForPrint.purpose}</p>
                <p><strong>2. Hasil Temuan / Keterangan:</strong><br />{selectedHomeVisitForPrint.findings}</p>
                <p><strong>3. Kesepakatan Bersama:</strong><br />{selectedHomeVisitForPrint.solution_agreement}</p>
                <p><strong>4. Tindak Lanjut:</strong><br />{selectedHomeVisitForPrint.follow_up || '-'}</p>
              </div>

              {/* 5. Bukti / Link Dokumentasi Digital */}
              {(selectedHomeVisitForPrint.evidence_link || selectedHomeVisitForPrint.evidence_url) && (
                <div className="pt-2 border-t border-dashed border-slate-300 text-xs">
                  <p className="font-bold text-slate-900 mb-1">5. Bukti / Link Dokumentasi Kegiatan:</p>
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {selectedHomeVisitForPrint.evidence_link && (
                      <div className="text-[11px] break-all">
                        <span className="font-semibold text-slate-700">🔗 Link Cloud / Google Drive: </span>
                        <a
                          href={selectedHomeVisitForPrint.evidence_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 underline font-mono font-medium"
                        >
                          {selectedHomeVisitForPrint.evidence_link}
                        </a>
                      </div>
                    )}
                    {selectedHomeVisitForPrint.evidence_url && (
                      <div className="text-[11px] break-all">
                        <span className="font-semibold text-slate-700">📷 Link Berkas / Foto: </span>
                        <a
                          href={selectedHomeVisitForPrint.evidence_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 underline font-mono font-medium"
                        >
                          {selectedHomeVisitForPrint.evidence_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div>
                  <p>Orang Tua / Wali Siswa,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">({selectedHomeVisitForPrint.parents_met || '........................'})</p>
                </div>
                <div>
                  <p>Guru Wali / Pembimbing,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{schoolSettings?.teacher_name}</p>
                  <p>NIP. {schoolSettings?.teacher_nip}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Printer size={14} />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </ModalDrawer>
      )}

      {/* Print Preview Modal for Home Visit Recap (Rekapitulasi Laporan Home Visit) */}
      {isHomeVisitRecapPrintOpen && (
        <ModalDrawer
          isOpen={isHomeVisitRecapPrintOpen}
          onClose={() => setIsHomeVisitRecapPrintOpen(false)}
          title="Rekapitulasi Laporan Kunjungan Rumah (Home Visit)"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            
            {/* Filter toolbar inside print modal (hidden on print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 no-print">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Siswa:</span>
                <select
                  value={homeVisitRecapPrintStudentFilter}
                  onChange={(e) => setHomeVisitRecapPrintStudentFilter(e.target.value)}
                  className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">Semua Siswa ({homeVisits.length} Kunjungan)</option>
                  {guruWaliStudents.map(s => {
                    const stClass = classes.find(c => c.id === s.class_id);
                    const countVisits = homeVisits.filter(v => v.student_id === s.id).length;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({stClass?.name}) - {countVisits} Kunjungan
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Printer size={14} />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>

            {/* Printable Document Paper */}
            <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl select-text space-y-4 print:p-0 print:shadow-none">
              <KopSurat
                title="REKAPITULASI LAPORAN KUNJUNGAN RUMAH (HOME VISIT)"
                subtitle="PEMBINAAN GURU WALI SISWA • TAHUN AJARAN 2026/2027"
              />

              {/* Summary Stats Bar */}
              <div className="grid grid-cols-3 gap-2 text-center py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Kunjungan</span>
                  <span className="font-extrabold text-sm text-slate-900">{recapPrintHomeVisitList.length} Kegiatan</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase block">Siswa Dikunjungi</span>
                  <span className="font-extrabold text-sm text-emerald-700">
                    {Array.from(new Set(recapPrintHomeVisitList.map(v => v.student_id))).length} Siswa
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase block">Rombel Terlayani</span>
                  <span className="font-extrabold text-sm text-indigo-700">
                    {Array.from(new Set(recapPrintHomeVisitList.map(v => {
                      const st = students.find(s => s.id === v.student_id);
                      return st?.class_id;
                    }))).filter(Boolean).length} Kelas
                  </span>
                </div>
              </div>

              {/* Table of Home Visits */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="border border-slate-300 px-2 py-2 text-center w-8">No</th>
                      <th className="border border-slate-300 px-3 py-2 w-36">Hari, Tanggal & Pendamping</th>
                      <th className="border border-slate-300 px-3 py-2 w-48">Siswa & Wali Dikunjungi</th>
                      <th className="border border-slate-300 px-3 py-2 min-w-[240px]">Maksud, Tujuan & Bukti Dokumentasi</th>
                      <th className="border border-slate-300 px-3 py-2">Kesepakatan Solusi & Tindak Lanjut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recapPrintHomeVisitList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="border border-slate-300 px-4 py-6 text-center text-slate-400">
                          Tidak ada data kunjungan rumah untuk filter ini.
                        </td>
                      </tr>
                    ) : (
                      recapPrintHomeVisitList.map((item, idx) => {
                        const student = students.find(s => s.id === item.student_id);
                        const studentClass = classes.find(c => c.id === student?.class_id);

                        let formattedDateWithDay = item.visit_date;
                        try {
                          const [y, m, d] = item.visit_date.split('-');
                          const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                          formattedDateWithDay = dateObj.toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          });
                        } catch (err) {
                          formattedDateWithDay = item.visit_date;
                        }

                        return (
                          <tr key={item.id} className="align-top">
                            <td className="border border-slate-300 px-2 py-2 text-center font-bold text-slate-600">{idx + 1}</td>
                            <td className="border border-slate-300 px-3 py-2">
                              <div className="font-semibold text-slate-900 leading-tight">{formattedDateWithDay}</div>
                              <div className="text-[10px] text-slate-500 mt-1.5">Pendamping:</div>
                              <div className="text-[10px] font-medium text-slate-700">{item.companions || '-'}</div>
                            </td>
                            <td className="border border-slate-300 px-3 py-2">
                              <div className="font-bold text-slate-900 leading-snug">{student?.name}</div>
                              <div className="text-[10px] text-indigo-600 font-bold font-mono">Kelas: {studentClass?.name || '-'}</div>
                              <div className="text-[10px] text-slate-500 mt-1">Wali: <strong className="text-slate-700">{item.parents_met || '-'}</strong></div>
                              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.address}</div>
                            </td>
                            <td className="border border-slate-300 px-3 py-2 space-y-1.5">
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Maksud & Tujuan:</span>
                                <div className="font-bold text-slate-900 leading-snug">{item.purpose}</div>
                              </div>
                              {item.findings && (
                                <div className="text-[10px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200">
                                  <strong className="text-slate-900">Temuan Masalah:</strong> {item.findings}
                                </div>
                              )}
                              
                              {/* Tag / Chip Link Dokumentasi Lengkap */}
                              {(item.evidence_link || item.evidence_url) && (
                                <div className="pt-1.5 border-t border-dashed border-slate-200 space-y-1">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Link Dokumentasi:</span>
                                  <div className="flex flex-col gap-1">
                                    {item.evidence_link && (
                                      <a
                                        href={item.evidence_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-start gap-1.5 p-1 px-2 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] transition-colors leading-normal"
                                        title={item.evidence_link}
                                      >
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-600 text-white font-black text-[8px] uppercase shrink-0 shadow-2xs">
                                          🔗 Link Drive
                                        </span>
                                        <span className="font-mono text-[9px] text-indigo-900 break-all underline select-all">
                                          {item.evidence_link}
                                        </span>
                                      </a>
                                    )}
                                    {item.evidence_url && (
                                      <a
                                        href={item.evidence_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-start gap-1.5 p-1 px-2 rounded-lg bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] transition-colors leading-normal"
                                        title={item.evidence_url}
                                      >
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white font-black text-[8px] uppercase shrink-0 shadow-2xs">
                                          📷 Foto Bukti
                                        </span>
                                        <span className="font-mono text-[9px] text-emerald-900 break-all underline select-all">
                                          {item.evidence_url}
                                        </span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="border border-slate-300 px-3 py-2 text-[11px] text-slate-700 leading-relaxed">
                              <div><strong>Solusi:</strong> {item.solution_agreement || '-'}</div>
                              {item.follow_up && (
                                <div className="text-[10px] text-slate-500 mt-1"><strong>Tindak Lanjut:</strong> {item.follow_up}</div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Kepala Sekolah,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{schoolSettings?.principal_name}</p>
                  <p>NIP. {schoolSettings?.principal_nip}</p>
                </div>
                <div>
                  <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-semibold">Guru Wali / Pembimbing,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{schoolSettings?.teacher_name}</p>
                  <p>NIP. {schoolSettings?.teacher_nip}</p>
                </div>
              </div>
            </div>
          </div>
        </ModalDrawer>
      )}

      {/* Print Preview Modal for Guidance Recap (Rekapitulasi Bimbingan Individu & Kelompok) */}
      {isGuidanceRecapPrintOpen && (
        <ModalDrawer
          isOpen={isGuidanceRecapPrintOpen}
          onClose={() => setIsGuidanceRecapPrintOpen(false)}
          title="Rekapitulasi Laporan Bimbingan Guru Wali"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            
            {/* Filter toolbar inside print modal (hidden on print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 no-print">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Jenis:</span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
                  {[
                    { id: 'all', label: 'Semua Bimbingan' },
                    { id: 'Individu', label: 'Bimbingan Individu' },
                    { id: 'Kelompok', label: 'Bimbingan Kelompok' },
                    { id: 'Klasikal', label: 'Bimbingan Klasikal' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setRecapPrintTypeFilter(btn.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        recapPrintTypeFilter === btn.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Printer size={14} />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>

            {/* Printable Document Paper */}
            <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl select-text space-y-4 print:p-0 print:shadow-none">
              <KopSurat
                title="REKAPITULASI LAPORAN BIMBINGAN GURU WALI"
                subtitle={`JENIS LAYANAN: ${
                  recapPrintTypeFilter === 'all'
                    ? 'BIMBINGAN INDIVIDU & KELOMPOK'
                    : `BIMBINGAN ${recapPrintTypeFilter.toUpperCase()}`
                } • TAHUN AJARAN 2026/2027`}
              />

              {/* Summary Stats Bar */}
              <div className="grid grid-cols-4 gap-2 text-center py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Sesi</span>
                  <span className="font-extrabold text-sm text-slate-900">{recapPrintGuidanceList.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-600 font-bold uppercase block">Sesi Individu</span>
                  <span className="font-extrabold text-sm text-blue-700">
                    {recapPrintGuidanceList.filter(g => g.guidance_type === 'Individu').length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-600 font-bold uppercase block">Sesi Kelompok</span>
                  <span className="font-extrabold text-sm text-purple-700">
                    {recapPrintGuidanceList.filter(g => g.guidance_type === 'Kelompok').length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase block">Siswa Terbimbing</span>
                  <span className="font-extrabold text-sm text-emerald-700">
                    {Array.from(new Set(recapPrintGuidanceList.flatMap(g => g.target_student_ids || []))).length} Siswa
                  </span>
                </div>
              </div>

              {/* Table of Guidance Records */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="border border-slate-300 px-2 py-2 text-center w-7">No</th>
                      <th className="border border-slate-300 px-3 py-2 w-36">Hari, Tanggal & Status</th>
                      <th className="border border-slate-300 px-3 py-2 w-48">Layanan & Topik</th>
                      <th className="border border-slate-300 px-3 py-2 w-56">Siswa Terlibat (Kelas)</th>
                      <th className="border border-slate-300 px-3 py-2">Catatan / Tindak Lanjut & Evaluasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recapPrintGuidanceList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="border border-slate-300 px-4 py-6 text-center text-slate-400">
                          Tidak ada data bimbingan untuk filter jenis ini.
                        </td>
                      </tr>
                    ) : (
                      recapPrintGuidanceList.map((item, idx) => {
                        // Format date to include day name (Hari)
                        let formattedDateWithDay = item.scheduled_date;
                        try {
                          const [y, m, d] = item.scheduled_date.split('-');
                          const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                          formattedDateWithDay = dateObj.toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          });
                        } catch (err) {
                          formattedDateWithDay = item.scheduled_date;
                        }

                        return (
                          <tr key={item.id} className="align-top">
                            <td className="border border-slate-300 px-2 py-2 text-center font-bold text-slate-600">{idx + 1}</td>
                            <td className="border border-slate-300 px-3 py-2">
                              <div className="font-semibold text-slate-900 leading-tight">{formattedDateWithDay}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">Pkl {item.scheduled_time} WIB</div>
                              <div className="mt-1.5">
                                <span className={`font-bold text-[9.5px] px-2 py-0.5 rounded border inline-block ${
                                  item.status === 'Selesai'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : item.status === 'Dibatalkan'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                            </td>
                            <td className="border border-slate-300 px-3 py-2">
                              <div className="mb-1">
                                <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded border inline-block ${
                                  item.guidance_type === 'Individu'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : item.guidance_type === 'Kelompok'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}>
                                  {item.guidance_type === 'Individu' ? 'Bimbingan Individu' : item.guidance_type === 'Kelompok' ? 'Bimbingan Kelompok' : 'Bimbingan Klasikal'}
                                </span>
                              </div>
                              <div className="font-bold text-slate-900 leading-snug">{item.title}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">📍 {item.location}</div>
                            </td>
                            <td className="border border-slate-300 px-3 py-2">
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {item.target_student_ids?.map((stId) => {
                                  const st = students.find(s => s.id === stId);
                                  const stClass = classes.find(c => c.id === st?.class_id);
                                  return (
                                    <span key={stId} className="inline-flex items-center gap-1 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                      <span className="font-semibold text-slate-800">{st?.name}</span>
                                      <span className="text-[10px] text-indigo-600 font-bold font-mono">({stClass?.name})</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="border border-slate-300 px-3.5 py-2 text-[11px] text-slate-700 leading-relaxed">
                              {item.notes || '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Kepala Sekolah,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{schoolSettings?.principal_name}</p>
                  <p>NIP. {schoolSettings?.principal_nip}</p>
                </div>
                <div>
                  <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-semibold">Guru Wali / Pembimbing,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{schoolSettings?.teacher_name}</p>
                  <p>NIP. {schoolSettings?.teacher_nip}</p>
                </div>
              </div>
            </div>
          </div>
        </ModalDrawer>
      )}

    </div>
  );
};

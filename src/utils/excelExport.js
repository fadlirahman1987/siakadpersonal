import * as XLSX from 'xlsx';

/**
 * Format date to Indonesian day name
 */
const getIndonesianDayName = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', { weekday: 'long' });
  } catch {
    return '-';
  }
};

/**
 * Export Walas Attendance to XLSX (Excel)
 */
export const exportWalasAttendanceToExcel = ({
  selectedClass,
  academicYear,
  selectedSemester,
  activeMonth,
  printType = 'semester', // 'semester' | 'month'
  semesterMonths,
  classStudents,
  getRecord,
  studentSemesterStats,
  schoolSettings
}) => {
  const wb = XLSX.utils.book_new();
  const semesterName = selectedSemester === '1' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)';
  const docTitle = printType === 'semester'
    ? `REKAPITULASI ABSENSI BULANAN SISWA (WALI KELAS)`
    : `REKAPITULASI ABSENSI SISWA BULAN ${activeMonth.toUpperCase()}`;

  const sheetData = [
    // Header Info
    [schoolSettings?.school_name || 'SEKOLAH INDONESIA'],
    [schoolSettings?.address || ''],
    [docTitle],
    [`Tahun Pelajaran: ${academicYear} | ${semesterName}`],
    [],
    [`Kelas / Rombel: ${selectedClass?.name || '-'} (${selectedClass?.major || '-'})`],
    [`Wali Kelas: ${schoolSettings?.teacher_name || '-'} (NIP: ${schoolSettings?.teacher_nip || '-'})`],
    [`Jumlah Siswa: ${classStudents.length} Orang`],
    [`Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`],
    []
  ];

  if (printType === 'semester') {
    // Header Row 1 (Grouped)
    const headerRow1 = ['No', 'NIS', 'NISN', 'Nama Siswa', 'L/P'];
    semesterMonths.forEach(m => {
      headerRow1.push(`Bulan ${m}`, '', '', '', '');
    });
    headerRow1.push('Total 1 Semester', '', '', '', '', '% Hadir');

    // Header Row 2 (Sub-columns)
    const headerRow2 = ['', '', '', '', ''];
    semesterMonths.forEach(() => {
      headerRow2.push('H', 'S', 'I', 'A', 'D');
    });
    headerRow2.push('H', 'S', 'I', 'A', 'D', '');

    sheetData.push(headerRow1, headerRow2);

    // Data Rows
    classStudents.forEach((st, idx) => {
      const stStat = studentSemesterStats[st.id] || {
        totalH: 0,
        totalS: 0,
        totalI: 0,
        totalA: 0,
        totalD: 0,
        percentHadir: 100
      };

      const row = [
        idx + 1,
        st.nis || '',
        st.nisn || '',
        st.name || '',
        st.gender || 'L'
      ];

      // Monthly breakdown
      semesterMonths.forEach(m => {
        const r = getRecord(st.id, m);
        row.push(
          Number(r.h) || 0,
          Number(r.s) || 0,
          Number(r.i) || 0,
          Number(r.a) || 0,
          Number(r.d) || 0
        );
      });

      // Total Semester
      row.push(
        stStat.totalH,
        stStat.totalS,
        stStat.totalI,
        stStat.totalA,
        stStat.totalD,
        `${stStat.percentHadir}%`
      );

      sheetData.push(row);
    });

  } else {
    // Single Month Table
    const headers = [
      'No',
      'NIS',
      'NISN',
      'Nama Siswa',
      'L/P',
      'Hadir (H)',
      'Sakit (S)',
      'Izin (I)',
      'Alpa (A)',
      'Dispensasi (D)',
      'Total Hari',
      '% Kehadiran',
      'Catatan / Keterangan Wali Kelas'
    ];
    sheetData.push(headers);

    classStudents.forEach((st, idx) => {
      const r = getRecord(st.id, activeMonth);
      const h = Number(r.h) || 0;
      const s = Number(r.s) || 0;
      const iVal = Number(r.i) || 0;
      const a = Number(r.a) || 0;
      const d = Number(r.d) || 0;
      const totalHari = h + s + iVal + a + d;
      const pct = totalHari > 0 ? Math.round(((h + d) / totalHari) * 100) : (h > 0 ? 100 : 0);

      sheetData.push([
        idx + 1,
        st.nis || '',
        st.nisn || '',
        st.name || '',
        st.gender || 'L',
        h,
        s,
        iVal,
        a,
        d,
        totalHari,
        `${pct}%`,
        r.notes || ''
      ]);
    });
  }

  // Add Signature note at the bottom
  sheetData.push(
    [],
    ['', '', '', '', '', '', '', 'Mengetahui,'],
    ['', '', '', '', '', '', '', 'Wali Kelas,'],
    [],
    [],
    ['', '', '', '', '', '', '', schoolSettings?.teacher_name || ''],
    ['', '', '', '', '', '', '', `NIP. ${schoolSettings?.teacher_nip || '-'}`]
  );

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  const colWidths = [
    { wch: 5 },  // No
    { wch: 14 }, // NIS
    { wch: 16 }, // NISN
    { wch: 30 }, // Nama Siswa
    { wch: 6 }   // L/P
  ];
  if (printType === 'semester') {
    semesterMonths.forEach(() => {
      colWidths.push({ wch: 4 }, { wch: 4 }, { wch: 4 }, { wch: 4 }, { wch: 4 });
    });
    colWidths.push({ wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 10 });
  } else {
    colWidths.push(
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 35 }
    );
  }
  ws['!cols'] = colWidths;

  const sheetName = printType === 'semester'
    ? `Rekap Semester ${selectedSemester}`
    : `Bulan ${activeMonth}`;

  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

  const cleanClassName = (selectedClass?.name || 'Kelas').replace(/[\/\\?%*:|"<>]/g, '_');
  const cleanYear = academicYear.replace(/[\/\\?%*:|"<>]/g, '-');
  const filename = printType === 'semester'
    ? `Rekap_Absensi_Walas_${cleanClassName}_Sem${selectedSemester}_${cleanYear}.xlsx`
    : `Rekap_Absensi_Walas_${cleanClassName}_${activeMonth}_${cleanYear}.xlsx`;

  XLSX.writeFile(wb, filename);
};

/**
 * Export Teaching Journals to XLSX (Excel)
 */
export const exportTeachingJournalsToExcel = ({
  teachingJournals,
  schedules,
  classes,
  subjects,
  schoolSettings,
  academicYear,
  activeSemester,
  filterClass = 'all',
  filterSubject = 'all',
  searchQuery = ''
}) => {
  const wb = XLSX.utils.book_new();

  // Filter journals based on active selection
  const filtered = (teachingJournals || []).filter((journal) => {
    const sch = (schedules || []).find(s => s.id === journal.schedule_id);
    const matchClass = filterClass === 'all' || sch?.class_id === Number(filterClass);
    const matchSubject = filterSubject === 'all' || sch?.subject_id === Number(filterSubject);
    const matchSearch = !searchQuery ||
      (journal.topic_material || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (journal.date || '').includes(searchQuery) ||
      (journal.learning_objectives || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (journal.teaching_activities || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSubject && matchSearch;
  });

  // Sort by date ascending
  filtered.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const semesterName = activeSemester === '1' ? 'Semester 1 (Ganjil)' : (activeSemester === '2' ? 'Semester 2 (Genap)' : 'Semester Aktif');

  const sheetData = [
    // Header metadata
    [schoolSettings?.school_name || 'SEKOLAH INDONESIA'],
    [schoolSettings?.address || ''],
    ['REKAPITULASI JURNAL PELAKSANAAN PEMBELAJARAN (KBM)'],
    [`Tahun Pelajaran: ${academicYear || '-'} | ${semesterName}`],
    [],
    [`Nama Guru: ${schoolSettings?.teacher_name || '-'} (NIP: ${schoolSettings?.teacher_nip || '-'})`],
    [`Total Jurnal: ${filtered.length} Catatan Kegiatan`],
    [`Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`],
    []
  ];

  // Table Headers
  const headers = [
    'No',
    'Tanggal',
    'Hari',
    'Kelas / Rombel',
    'Mata Pelajaran',
    'Status KBM',
    'Materi Pokok / Topik Pembelajaran',
    'Capaian / Tujuan Pembelajaran',
    'Aktivitas & Metode Pembelajaran',
    'Hambatan & Solusi / Catatan'
  ];
  sheetData.push(headers);

  // Data rows
  filtered.forEach((j, idx) => {
    const sch = (schedules || []).find(s => s.id === j.schedule_id);
    const cls = (classes || []).find(c => c.id === sch?.class_id);
    const sub = (subjects || []).find(s => s.id === sch?.subject_id);
    const hari = getIndonesianDayName(j.date);

    sheetData.push([
      idx + 1,
      j.date || '-',
      hari,
      cls?.name || '-',
      sub?.name || '-',
      j.kbm_status || 'Tatap Muka',
      j.topic_material || '-',
      j.learning_objectives || '-',
      j.teaching_activities || '-',
      j.obstacles_and_solutions || '-'
    ]);
  });

  // Signature Block
  sheetData.push(
    [],
    ['', '', '', '', '', '', '', 'Mengetahui,', '', ''],
    ['', '', '', '', '', '', '', 'Guru Mata Pelajaran,', '', ''],
    [],
    [],
    ['', '', '', '', '', '', '', schoolSettings?.teacher_name || '', '', ''],
    ['', '', '', '', '', '', '', `NIP. ${schoolSettings?.teacher_nip || '-'}`, '', '']
  );

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Column widths
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 13 }, // Tanggal
    { wch: 10 }, // Hari
    { wch: 14 }, // Kelas
    { wch: 22 }, // Mapel
    { wch: 14 }, // Status KBM
    { wch: 35 }, // Materi Pokok
    { wch: 35 }, // Tujuan Pembelajaran
    { wch: 35 }, // Aktivitas
    { wch: 30 }  // Hambatan & Solusi
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Jurnal Mengajar');

  const cleanYear = (academicYear || '2026-2027').replace(/[\/\\?%*:|"<>]/g, '-');
  const filename = `Rekap_Jurnal_Mengajar_${cleanYear}_Sem${activeSemester || '1'}.xlsx`;

  XLSX.writeFile(wb, filename);
};

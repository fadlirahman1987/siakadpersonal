export const initialSchoolSettings = {
  school_name: "SMK NEGERI 1 TEKNOLOGI NUSANTARA",
  governing_body: "PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA\nDINAS PENDIDIKAN",
  npsn: "20109988",
  postal_code: "12340",
  address: "Jl. Pendidikan V No. 45, Kebayoran Baru, Jakarta Selatan",
  phone: "(021) 7890123",
  email: "info@smkn1teknologi.sch.id",
  website: "https://smkn1teknologi.sch.id",
  principal_name: "Drs. H. Bambang Sujatmiko, M.Pd.",
  principal_nip: "19680817 199303 1 005",
  teacher_name: "Ryu Q, S.Kom., M.T.",
  teacher_nip: "19881110 201502 1 002",
  logo_url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80"
};

export const initialAcademicYears = [
  { id: 1, name: "2026/2027", is_active: true },
  { id: 2, name: "2025/2026", is_active: false }
];

export const initialSemesters = [
  { id: 1, academic_year_id: 1, semester_type: "ganjil", is_active: true },
  { id: 2, academic_year_id: 1, semester_type: "genap", is_active: false }
];

export const initialClasses = [
  { id: 1, name: "X RPL 1", grade_level: "X", major: "Rekayasa Perangkat Lunak", is_homeroom_class: true },
  { id: 2, name: "XI RPL 2", grade_level: "XI", major: "Rekayasa Perangkat Lunak", is_homeroom_class: false },
  { id: 3, name: "XII TKJ 1", grade_level: "XII", major: "Teknik Komputer & Jaringan", is_homeroom_class: false }
];

export const initialSubjects = [
  { id: 1, code: "RPL-01", name: "Pemrograman Web & Perangkat Bergerak", category: "Kejuruan", is_active: true },
  { id: 2, code: "RPL-02", name: "Basis Data & Cloud Architecture", category: "Kejuruan", is_active: true },
  { id: 3, code: "INF-01", name: "Informatika & Logika Komputasi", category: "Umum", is_active: true }
];

export const initialSchedules = [
  {
    id: 1,
    academic_year_id: 1,
    semester_id: 1,
    class_id: 1,
    subject_id: 1,
    day_name: "Senin",
    start_time: "07:30",
    end_time: "10:00",
    room: "Lab Komputer 3"
  },
  {
    id: 2,
    academic_year_id: 1,
    semester_id: 1,
    class_id: 2,
    subject_id: 2,
    day_name: "Senin",
    start_time: "10:30",
    end_time: "12:30",
    room: "Lab Komputer 1"
  },
  {
    id: 3,
    academic_year_id: 1,
    semester_id: 1,
    class_id: 3,
    subject_id: 3,
    day_name: "Selasa",
    start_time: "08:00",
    end_time: "10:30",
    room: "Ruang Teori 12"
  },
  {
    id: 4,
    academic_year_id: 1,
    semester_id: 1,
    class_id: 1,
    subject_id: 2,
    day_name: "Rabu",
    start_time: "07:30",
    end_time: "09:45",
    room: "Lab Komputer 3"
  }
];

export const initialStudents = [
  { id: 1, class_id: 1, nis: "2601001", nisn: "0081234561", name: "Aditya Pratama Putra", gender: "L", parent_phone: "081298765431", address: "Jl. Melati No. 12, Jakarta Selatan" },
  { id: 2, class_id: 1, nis: "2601002", nisn: "0081234562", name: "Annisa Rahmawati Putri", gender: "P", parent_phone: "081387654322", address: "Jl. Mawar Indah Blok B3, Jakarta Selatan" },
  { id: 3, class_id: 1, nis: "2601003", nisn: "0081234563", name: "Bagus Tri Wicaksono", gender: "L", parent_phone: "085712349876", address: "Komplek Guru No. 8, Jakarta Selatan" },
  { id: 4, class_id: 1, nis: "2601004", nisn: "0081234564", name: "Cantika Dewi Lestari", gender: "P", parent_phone: "081987651234", address: "Jl. Anggrek Raya No. 4, Jakarta Timur" },
  { id: 5, class_id: 1, nis: "2601005", nisn: "0081234565", name: "Dimas Arya Nugroho", gender: "L", parent_phone: "081234567890", address: "Jl. Kenanga No. 19, Depok" },
  { id: 6, class_id: 1, nis: "2601006", nisn: "0081234566", name: "Fathur Rahman Hakim", gender: "L", parent_phone: "085698712345", address: "Jl. Flamboyan No. 2, Jakarta Selatan" },
  { id: 7, class_id: 1, nis: "2601007", nisn: "0081234567", name: "Gita Nur Aisyah", gender: "P", parent_phone: "081399887766", address: "Jl. Cempaka Putih No. 15, Jakarta Pusat" },
  { id: 8, class_id: 1, nis: "2601008", nisn: "0081234568", name: "Hafiz Muhammad Ihsan", gender: "L", parent_phone: "087812345678", address: "Jl. Dahlia No. 7, Tangerang Selatan" },
  
  { id: 9, class_id: 2, nis: "2501011", nisn: "0071234511", name: "Indah Permata Sari", gender: "P", parent_phone: "081211223344", address: "Jl. Teratai No. 3, Jakarta Selatan" },
  { id: 10, class_id: 2, nis: "2501012", nisn: "0071234512", name: "Kevin Sanjaya", gender: "L", parent_phone: "081322334455", address: "Jl. Garuda No. 88, Jakarta Selatan" },
  
  { id: 11, class_id: 3, nis: "2401021", nisn: "0061234521", name: "Muhammad Rizky Fauzan", gender: "L", parent_phone: "081233445566", address: "Jl. Rajawali No. 10, Jakarta Timur" },
  { id: 12, class_id: 3, nis: "2401022", nisn: "0061234522", name: "Nabila Zahra", gender: "P", parent_phone: "081344556677", address: "Jl. Elang Mas No. 5, Jakarta Selatan" }
];

export const initialAttendanceRecords = {
  // Key format: `${scheduleId}_${date}`
  "1_2026-09-28": {
    schedule_id: 1,
    date: "2026-09-28",
    kbm_status: "Tatap Muka",
    records: {
      1: "H",
      2: "H",
      3: "S",
      4: "H",
      5: "H",
      6: "I",
      7: "H",
      8: "H"
    }
  }
};

export const initialAssessmentConfig = [
  {
    id: "tugas",
    name: "Tugas / PR / Portofolio",
    shortName: "Tugas",
    weight: 30,
    columns: [
      { id: "tugas1", label: "Tugas 1" },
      { id: "tugas2", label: "Tugas 2" }
    ]
  },
  {
    id: "uh",
    name: "Ulangan Harian / Formatif",
    shortName: "UH",
    weight: 20,
    columns: [
      { id: "uh1", label: "UH 1" },
      { id: "uh2", label: "UH 2" }
    ]
  },
  {
    id: "pts",
    name: "Penilaian Tengah Semester (PTS / STS)",
    shortName: "PTS",
    weight: 25,
    columns: [
      { id: "pts", label: "PTS" }
    ]
  },
  {
    id: "pas",
    name: "Penilaian Akhir Semester (PAS / SAS)",
    shortName: "PAS",
    weight: 25,
    columns: [
      { id: "pas", label: "PAS" }
    ]
  }
];

export const initialGrades = {
  // Key format: `${class_id}_${subject_id}`
  "1_1": {
    1: { tugas1: 88, tugas2: 92, uh1: 85, uh2: 90, pts: 87, pas: 92 },
    2: { tugas1: 90, tugas2: 94, uh1: 92, uh2: 95, pts: 90, pas: 96 },
    3: { tugas1: 75, tugas2: 78, uh1: 72, uh2: 80, pts: 76, pas: 80 },
    4: { tugas1: 85, tugas2: 88, uh1: 84, uh2: 86, pts: 85, pas: 88 },
    5: { tugas1: 80, tugas2: 82, uh1: 78, uh2: 85, pts: 80, pas: 84 },
    6: { tugas1: 70, tugas2: 74, uh1: 68, uh2: 75, pts: 72, pas: 74 },
    7: { tugas1: 92, tugas2: 95, uh1: 90, uh2: 94, pts: 93, pas: 95 },
    8: { tugas1: 84, tugas2: 86, uh1: 82, uh2: 88, pts: 85, pas: 87 }
  }
};

export const initialTeachingJournals = [
  {
    id: 1,
    schedule_id: 1,
    date: "2026-09-28",
    topic_material: "Pengenalan Arsitektur Single Page Application (SPA) dengan React & Vite",
    learning_objectives: "Siswa mampu memahami perbedaan Client-Side Routing vs Server-Side Rendering serta menginisiasi proyek Vite.",
    teaching_activities: "1. Penjelasan teori arsitektur SPA\n2. Live coding setup React Vite\n3. Praktik mandiri pembuatan komponen interaktif",
    obstacles_and_solutions: "Beberapa siswa mengalami kendala instalasi Node.js, diselesaikan dengan bantuan peer teaching.",
    kbm_status: "Tatap Muka"
  }
];

export const initialGuruWaliStudentIds = [1, 3, 6, 9, 10, 11];

export const initialGuidanceSchedules = [
  {
    id: 1,
    title: "Bimbingan Portofolio Project Magang Industri",
    scheduled_date: "2026-09-29",
    scheduled_time: "13:30",
    location: "Ruang Bimbingan / Lab RPL",
    guidance_type: "Kelompok",
    status: "Terjadwal",
    target_student_ids: [1, 3, 9, 11],
    notes: "Review repository GitHub dan persiapan presentasi PKL lintas kelas.",
    attendance: { 1: "H", 3: "H", 9: "H", 11: "H" }
  },
  {
    id: 2,
    title: "Konseling Motivasi Belajar & Kehadiran",
    scheduled_date: "2026-09-30",
    scheduled_time: "09:00",
    location: "Ruang Guru",
    guidance_type: "Individu",
    status: "Terjadwal",
    target_student_ids: [6],
    notes: "Pembahasan kehadiran terlambat dan dispensasi kegiatan organisasi.",
    attendance: { 6: "H" }
  }
];

export const initialHomeVisits = [
  {
    id: 1,
    student_id: 3,
    visit_date: "2026-09-26",
    companions: "Guru BK (Ibu Siti Aminah, S.Pd.)",
    parents_met: "Bapak Joko Widodo (Ayah Kandung)",
    address: "Komplek Guru No. 8, Jakarta Selatan",
    purpose: "Konfirmasi kondisi kesehatan siswa setelah izin sakit 3 hari berturut-turut serta koordinasi tugas susulan.",
    findings: "Siswa sedang dalam masa pemulihan demam berdarah dan membutuhkan waktu istirahat 2 hari lagi.",
    solution_agreement: "Orang tua memberikan surat keterangan dokter dan siswa akan mengerjakan modul secara online dari rumah.",
    follow_up: "Wali kelas memantau penyerahan tugas digital via Google Classroom pada tanggal 30 September 2026.",
    evidence_url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80",
    evidence_link: "https://drive.google.com/drive/folders/sample-home-visit-doc"
  }
];

export const initialHolidays = [
  { id: 1, name: "Hari Maulid Nabi Muhammad SAW", start_date: "2026-09-15", end_date: "2026-09-15", holiday_type: "nasional" },
  { id: 2, name: "Libur Jeda Penilaian Tengah Semester (PTS)", start_date: "2026-10-05", end_date: "2026-10-09", holiday_type: "semester" },
  { id: 3, name: "HUT Kemerdekaan Republik Indonesia", start_date: "2026-08-17", end_date: "2026-08-17", holiday_type: "nasional" },
  { id: 4, name: "Cuti Bersama Hari Raya Idul Fitri", start_date: "2026-03-23", end_date: "2026-03-27", holiday_type: "cuti_bersama" },
  { id: 5, name: "Agenda Rapat Kerja & Workshop Guru Mandiri", start_date: "2026-11-02", end_date: "2026-11-03", holiday_type: "khusus" }
];

export const initialVersionLogs = [
  {
    version: "v2.10.0",
    date: "02 Oktober 2026",
    tag: "UI & Fitur",
    title: "Pemeriksaan Update Online di Beranda, Dialog Changelog Mandiri, dan Penyempurnaan Navigasi Header",
    details: [
      "Fitur Cek Update Interaktif: Pemeriksaan versi rilis terbaru langsung dari Beranda dengan modal perbandingan versi & tautan unduh installer (.exe).",
      "Modal Version Log di Beranda: Akses riwayat pembaruan aplikasi langsung di samping badge versi lengkap dengan fitur pencarian kata kunci.",
      "Penyempurnaan Navigasi Header: Penghapusan tombol sinkronisasi cloud di bar atas agar profil guru dan kontrol utama tampil ideal, lega, dan proporsional.",
      "Tata Letak Master Data Fleksibel: Peringkasan label tab dan desain adaptif flex-wrap yang bebas dari masalah teks terpotong di layar desktop."
    ]
  },
  {
    version: "v2.9.0",
    date: "02 Oktober 2026",
    tag: "Fitur Baru",
    title: "Tag Cepat Presensi & Jurnal Dashboard, Optimalisasi Ruang Kerja, dan CI/CD Cloud Release",
    details: [
      "Tag Aksi Cepat pada Card Jadwal Dashboard: Tombol 1-Tap 'Isi Presensi' dan 'Isi Jurnal' langsung pada jadwal mengajar.",
      "Indikator Real-time Status Presensi & Jurnal: Deteksi otomatis keterisian absensi (✓ Presensi Terisi X/Y) dan jurnal (✓ Jurnal Terisi) pada sesi hari ini.",
      "Optimalisasi Layout Dashboard: Penghapusan hero banner ucapan agar widget statistik dan jadwal mengajar tampil lebih luas, fokus, dan bebas scrolling.",
      "Sinkronisasi Navigasi Subtab Global: Routing cerdas antar modul Presensi, Rekap Nilai, dan Jurnal KBM.",
      "Konfigurasi GitHub Actions & Auto-Updater: Pipeline rilis otomatis file installer Windows (.exe) dan endpoint pembaruan desktop Tauri."
    ]
  },
  {
    version: "v2.8.0",
    date: "01 Oktober 2026",
    tag: "Fitur Baru",
    title: "Sinkronisasi Cloud 14 Tabel, Cadangan & Restore JSON, dan Peningkatan Tampilan Stat Cards",
    details: [
      "Pusat Cadangan & Pemulihan Basis Data (Backup & Restore JSON) untuk arsip offline lengkap seluruh 14 entitas data.",
      "Tombol Cepat Sinkronisasi Cloud (Upload & Tarik Data Online) di Header, Dashboard, dan Master Data.",
      "Penyempurnaan Modal Popup Sinkronisasi ke tengah layar (Center Alignment) menggunakan React Portal.",
      "Redesain 4 Stat Cards di Dashboard dengan aksen gradien warna modern, glow blur, dan tipografi tebal.",
      "Penyederhanaan singkatan predikat absensi semester (SB, B, C, PP) dilengkapi kartu catatan legenda keterangan.",
      "Penggabungan kolom bukti dokumentasi dan link Drive pada Berita Acara Rekap Kunjungan Rumah (Home Visit).",
      "Pembersihan navigasi Master Data dan optimasi integrasi GitHub & Vercel deployment."
    ]
  },
  {
    version: "v2.7.0",
    date: "01 Oktober 2026",
    tag: "Desktop & UI",
    title: "Dukungan Desktop App (.exe Tauri Engine) & Redesain Kalender Akademik",
    details: [
      "Kompilasi native Windows desktop executable (.exe) berbasis framework ultra-ringan Tauri 2.0.",
      "Redesain total Kalender Libur & Agenda Akademik dalam format Modern Table View interaktif.",
      "Penambahan indikator durasi hari libur, badge kategori warna-warni, serta status waktu (Sedang Berlangsung / Mendatang / Selesai).",
      "Penyempurnaan drawer input hari libur dan integrasi responsif pada perangkat mobile & desktop.",
      "Peningkatan sinkronisasi database cloud Supabase dan pembaruan arsitektur data lokal."
    ]
  },
  {
    version: "v2.6.0",
    date: "30 September 2026",
    tag: "Fitur Baru",
    title: "Manajemen Multi Tahun Ajaran, Kenaikan Kelas & Rolling Rombel",
    details: [
      "Isolasi data siswa & presensi otomatis per Tahun Ajaran dan Semester aktif.",
      "Quick Switcher Tahun Ajaran & Semester langsung di Header dengan modal interaktif.",
      "Fitur Salin Siswa (Copy Data) antar semester & tahun ajaran baru.",
      "Kenaikan Kelas otomatis (Promosi Tingkat) dengan pemetaan rombel dan dukungan siswa tinggal kelas.",
      "Fitur Pindah Kelas (Move) & Tukar Rombel Siswa (Swap Class) untuk semester 2.",
      "Penyelarasan navigasi tab Walas & Guru Wali agar lebih rapi, ringkas, dan konsisten.",
      "Standarisasi kolom rekapitulasi absensi: Hadir (H), Sakit (S), Izin (I), Alpa (A), Dispensasi (D)."
    ]
  },
  {
    version: "v2.5.0-Personal",
    date: "28 September 2026",
    tag: "Fitur Baru",
    title: "Rilis Penuh Edisi Guru Mandiri & Supabase Serverless Stack",
    details: [
      "Transisi arsitektur ke React + Vite + Supabase 100% Free Cloud Hosting.",
      "Penghapusan role admin terpisah untuk fleksibilitas total guru.",
      "Fitur One-Tap Set Semua Hadir dan auto-save instan.",
      "Kalkulator RPE Pintar & AI Visual Prompt Generator.",
      "PWA Mobile-First dengan Bottom Sheet Drawer & Micro-animations."
    ]
  },
  {
    version: "v2.1.0",
    date: "14 September 2026",
    tag: "Peningkatan",
    title: "Modul Guru Wali & Bimbingan Terpadu",
    details: [
      "Penambahan fitur presensi kehadiran pada setiap sesi bimbingan siswa.",
      "Dukungan upload bukti foto kunjungan rumah (Home Visit) ke Cloud Storage.",
      "Export rekapitulasi absensi bulanan ke format CSV/Excel."
    ]
  },
  {
    version: "v2.0.0",
    date: "01 September 2026",
    tag: "Fitur Baru",
    title: "Inisiasi SIAKAD Mobile-First Platform",
    details: [
      "Perancangan antarmuka responsif ramah satu tangan (One-handed navigation).",
      "5 status kehadiran terstandarisasi: Hadir, Sakit, Izin, Dispensasi, Alpa."
    ]
  }
];

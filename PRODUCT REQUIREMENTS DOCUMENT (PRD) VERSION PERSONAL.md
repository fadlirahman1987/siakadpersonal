# PRODUCT REQUIREMENTS DOCUMENT (PRD) — FULL PERSONAL EDITION

# SISTEM INFORMASI AKADEMIK SEKOLAH (SIAKAD GURU MANDIRI)
## 100% Free Cloud Hosting, Ultra Fast, Mobile-First (Vite + Supabase + Vercel)

---

## 1. INFORMASI DOKUMEN & SPESIFIKASI STACK

| Item | Keterangan |
|---|---|
| **Nama Produk** | SIAKAD Guru Mandiri (Personal Edition) |
| **Konsep Aplikasi** | **Full Personal / Guru Mandiri** (Tanpa Role Admin terpisah — Seluruh pengaturan profil sekolah, master data, jadwal, presensi, jurnal, hingga bimbingan dikelola sendiri secara mandiri oleh pengguna) |
| **Frontend Framework** | **React.js / Vue 3 + Vite** (Single Page Application super cepat, instan tanpa reload) |
| **CSS & Design System** | **Tailwind CSS + Lucide Icons** (Mobile-First, Dark/Light Mode, Micro-animations) |
| **Backend & API** | **Serverless via Supabase JavaScript SDK (`@supabase/supabase-js`)** — Tanpa server backend PHP/Node manual |
| **Database Cloud** | **Supabase (Managed PostgreSQL 15+)** + Row Level Security (RLS) |
| **Cloud Storage** | **Supabase Storage Bucket** (Dokumentasi Foto Home Visit, Logo Sekolah, dsb) |
| **Hosting & CI/CD** | **Vercel / Netlify / Cloudflare Pages (100% Free Tier Selamanya)** via GitHub Auto-Deploy |
| **Mobile Experience** | **Progressive Web App (PWA)** dengan Bottom Navigation Bar, Bottom Drawer, & Offline-Ready Cache |
| **Target Perangkat** | Smartphone (Prioritas Utama / One-Handed Use), Tablet, Laptop, & Desktop PC |
| **Status Dokumen** | **Blueprint Spesifikasi Final & Production Ready** |

---

## 2. LATAR BELAKANG & PRINSIP DESAIN

### 2.1 Mengapa Full Personal (Tanpa Admin)?
Dalam lingkungan sekolah atau guru independen:
1. **Otonomi Penuh Guru**: Guru tidak perlu bergantung pada admin sekolah untuk menginput data kelas, mata pelajaran, jadwal, atau siswa binaannya.
2. **Pengaturan Mandiri Terpadu**: Profil sekolah, logo, NIP kepala sekolah, dan KOP surat diatur langsung oleh guru dari menu **Pengaturan Lembaga**.
3. **Privasi & Keamanan Data Pribadi**: Setiap data (presensi, jurnal, nilai, bimbingan) terkunci secara otomatis ke akun pengguna masing-masing melalui Supabase *Row Level Security* (RLS).
4. **Biaya Rp 0 (100% Free Selamanya)**:
   - Hosting di **Vercel** gratis tanpa batas waktu.
   - Database & Storage di **Supabase** gratis (Free tier hingga 500MB DB, 1GB Storage, 50k MAU).

---

## 3. ARSITEKTUR TEKNOLOGI SISTEM

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CLIENT TIER (MOBILE-FIRST PWA)                        │
│   React / Vue 3 + Vite + Tailwind CSS + Lucide Icons + PWA Worker           │
│   State Management (Zustand / Pinia) + Supabase JS Client                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                      HOSTING TIER (100% FREE CLOUD)                         │
│   Vercel / Cloudflare Pages Edge Global CDN (Auto Deploy from GitHub)       │
├─────────────────────────────────────────────────────────────────────────────┤
│                   DATA, AUTH & STORAGE TIER (SUPABASE)                      │
│   Supabase Auth (Email / Password Auth & Session Management)                │
│   Supabase Managed PostgreSQL 15 + RLS (Row Level Security)                 │
│   Supabase Storage Bucket (Photos & File Attachments)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. STRUKTUR MENU & FITUR UTAMA (PERSONAL WORKFLOW)

Karena tidak ada role admin, seluruh fitur dikelompokkan ke dalam navigasi yang fokus pada produktivitas harian guru:

```text
📱 BOTTOM NAVIGATION BAR (SMARTPHONE VIEW)
├── 🏠 1. Beranda (Dashboard Ringkasan Jadwal Hari Ini, Statistik Presensi, Quick Actions)
├── 📋 2. KBM & Presensi (Presensi Siswa Harian, Set Semua Hadir, Jurnal Mengajar)
├── 👥 3. Guru Wali & Bimbingan (Catatan Siswa Binaan, Agenda Bimbingan, Home Visit)
├── 💡 4. AI Tools Hub (Kalkulator RPE, Prompt Infografis, Kisi-kisi AI)
└── ⚙️ 5. Menu / Profil (Master Data, Pengaturan Sekolah & KOP, Version Log, Akun)
```

### 4.1 Modul 1: Beranda & Dashboard Pintar
- **Jadwal Mengajar Hari Ini**: Kartu dinamis jadwal kelas yang harus diajar hari ini lengkap dengan jam dan status KBM.
- **Statistik Cepat**: Total kelas yang diajar, total siswa binaan wali, dan persentase kehadiran minggu ini.
- **Pintasan Aksi Cepat**: Tombol sekali klik untuk *Mulai Presensi*, *Tulis Jurnal*, atau *Buat Agenda Bimbingan*.

### 4.2 Modul 2: Presensi Siswa Real-Time & Jurnal KBM
- **5 Status Kehadiran**: `H` (Hadir), `S` (Sakit), `I` (Izin), `D` (Dispensasi), `A` (Alpa).
- **One-Tap Quick Actions**:
  - Tombol **Set Semua Hadir** dengan 1 sentuhan.
  - Perubahan status per siswa otomatis tersimpan (*Auto-Save*) seketika ke Supabase.
- **Jurnal Mengajar Otomatis**:
  - Pilihan Status KBM: *Tatap Muka, Online, Dinas Luar, Sakit/Izin, Guru Inval, Hari Libur*.
  - Form ringkas: Materi/Topik, Tujuan Pembelajaran, Aktivitas, Kendala & Solusi.

### 4.3 Modul 3: Guru Wali & Bimbingan Siswa (Personal Homeroom)
- **Daftar Siswa Binaan**: Profil siswa, kontak orang tua, dan histori kehadiran.
- **Agenda Bimbingan Terpadu**:
  - Jenis: Bimbingan Individu / Kelompok.
  - Dilengkapi fitur **Presensi Kehadiran Siswa Bimbingan** (H, S, I, A, D).
- **Home Visit (Kunjungan Rumah)**:
  - Form kunjungan rumah lengkap (Tujuan, Temuan, Kesepakatan Solusi, Tindak Lanjut).
  - Pilihan bukti foto: Upload langsung ke **Supabase Storage Bucket** atau input tautan **Google Drive**.
- **Rekapitulasi Absensi Bulanan Kelas**: Otomatis menghitung persentase kehadiran bulanan untuk laporan wali kelas.

### 4.4 Modul 4: AI Productivity Tools Hub
- **Kalkulator RPE**: Menghitung pekan efektif, distribusi jam pelajaran per semester secara otomatis.
- **Master Prompt Infografis Visual AI**: Generator instruksi pembuatan materi visual pelajaran dengan AI.
- **Tautan Eksternal AI**: Integrasi cepat ke *KisiKisi.AI* dan *Kartu Soal AI*.

### 4.5 Modul 5: Master Data Mandiri & Pengaturan Lembaga
Semua data diinput dan diatur sendiri oleh guru:
- **Pengaturan Profil Sekolah & KOP Surat**: Nama sekolah, NPSN, nama kepala sekolah, NIP, alamat, dan upload Logo Sekolah.
- **Master Tahun Ajaran & Semester**: Mengatur tahun ajaran aktif dan semester (Ganjil/Genap).
- **Master Kelas & Siswa**: Tambah/edit data kelas, import/input daftar siswa.
- **Master Mata Pelajaran & Jadwal Mengajar**: Input mata pelajaran dan jadwal mingguan (hari, jam mulai - selesai).
- **Kalender Hari Libur**: Input hari libur nasional atau khusus sekolah agar presensi otomatis terkunci.
- **Halaman Version Log (`/version-log`)**: Log catatan rilis fitur dengan pencarian dan filter kategori.
- **Ekspor & Cetak Laporan**: Cetak presensi/jurnal format PDF siap cetak dengan KOP surat resmi dinamis atau ekspor CSV/Excel.

---

## 5. SKEMA DATABASE SUPABASE POSTGRESQL (FULL PERSONAL RLS)

Setiap tabel memiliki relasi ke `user_id` (`auth.users`) sehingga setiap guru mengelola datanya sendiri secara terisolasi dan aman:

```sql
-- 1. AKTIFKAN EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PENGATURAN LEMBAGA / PROFIL SEKOLAH PRIBADI GURU
CREATE TABLE school_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    school_name VARCHAR(255) NOT NULL DEFAULT 'Nama Sekolah Anda',
    governing_body VARCHAR(255) NULL, -- Contoh: Dinas Pendidikan Provinsi ...
    npsn VARCHAR(50) NULL,
    postal_code VARCHAR(20) NULL,
    address TEXT NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    principal_name VARCHAR(255) NULL,
    principal_nip VARCHAR(50) NULL,
    teacher_name VARCHAR(255) NULL,
    teacher_nip VARCHAR(50) NULL,
    logo_url TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. TAHUN AJARAN & SEMESTER
CREATE TABLE academic_years (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(50) NOT NULL, -- e.g. '2026/2027'
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE semesters (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    academic_year_id BIGINT REFERENCES academic_years(id) ON DELETE CASCADE,
    semester_type VARCHAR(10) NOT NULL CHECK (semester_type IN ('ganjil', 'genap')),
    is_active BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE school_holidays (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    academic_year_id BIGINT REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    holiday_type VARCHAR(50) DEFAULT 'nasional' CHECK (holiday_type IN ('nasional', 'khusus_sekolah', 'semester'))
);

-- 4. KELAS & SISWA
CREATE TABLE classes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g. 'X TKRO 1'
    grade_level VARCHAR(10) NOT NULL, -- 'X', 'XI', 'XII'
    major VARCHAR(100) NULL,
    is_homeroom_class BOOLEAN DEFAULT FALSE, -- Ditandai jika guru adalah wali kelas ini
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nis VARCHAR(50) NOT NULL,
    nisn VARCHAR(50) NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('L', 'P')),
    class_id BIGINT REFERENCES classes(id) ON DELETE CASCADE,
    parent_phone VARCHAR(50) NULL,
    address TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MATA PELAJARAN & JADWAL MENGAJAR
CREATE TABLE subjects (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'Kejuruan / Umum',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE teaching_schedules (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    academic_year_id BIGINT REFERENCES academic_years(id) ON DELETE CASCADE,
    semester_id BIGINT REFERENCES semesters(id) ON DELETE CASCADE,
    class_id BIGINT REFERENCES classes(id) ON DELETE CASCADE,
    subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
    day_name VARCHAR(20) NOT NULL, -- 'Senin', 'Selasa', dst
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- 6. SESI PRESENSI & JURNAL KBM
CREATE TABLE attendance_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    schedule_id BIGINT REFERENCES teaching_schedules(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    kbm_status VARCHAR(50) NOT NULL DEFAULT 'Tatap Muka',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE attendance_records (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    attendance_session_id BIGINT REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(5) NOT NULL DEFAULT 'H' CHECK (status IN ('H', 'S', 'I', 'A', 'D')),
    notes VARCHAR(255) NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(attendance_session_id, student_id)
);

CREATE TABLE teaching_journals (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    attendance_session_id BIGINT UNIQUE REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    topic_material TEXT NOT NULL,
    learning_objectives TEXT NULL,
    teaching_activities TEXT NULL,
    obstacles_and_solutions TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. BIMBINGAN SISWA & HOME VISIT
CREATE TABLE guidance_schedules (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    student_id BIGINT NULL REFERENCES students(id) ON DELETE SET NULL,
    academic_year_id BIGINT REFERENCES academic_years(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    location VARCHAR(255) NULL,
    guidance_type VARCHAR(50) DEFAULT 'Individu',
    status VARCHAR(50) DEFAULT 'Terjadwal',
    notes TEXT NULL,
    attendance_data JSONB NULL, -- Menyimpan presensi kehadiran siswa bimbingan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE home_visits (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    academic_year_id BIGINT REFERENCES academic_years(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    companions TEXT NULL,
    parents_met VARCHAR(255) NULL,
    address TEXT NULL,
    purpose TEXT NOT NULL,
    findings TEXT NULL,
    solution_agreement TEXT NULL,
    follow_up TEXT NULL,
    evidence_url TEXT NULL, -- URL Supabase Storage Bucket
    evidence_link TEXT NULL, -- Link Google Drive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Aktifkan RLS di semua tabel agar setiap user hanya bisa melihat & memodifikasi datanya sendiri
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_visits ENABLE ROW LEVEL SECURITY;

-- Contoh Kebijakan Otomatis (Setiap user hanya mengakses data dengan user_id = auth.uid())
CREATE POLICY "Users can manage their own data" ON school_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own classes" ON classes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own students" ON students FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own schedules" ON teaching_schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own attendance" ON attendance_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own records" ON attendance_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own journals" ON teaching_journals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own guidance" ON guidance_schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own home visits" ON home_visits FOR ALL USING (auth.uid() = user_id);
```

---

## 6. KONFIGURASI ENVIRONMENT `.env` (FRONTEND VITE)

File `.env` di proyek Vite:

```ini
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME="SIAKAD Guru Mandiri"
VITE_STORAGE_BUCKET="siakad-attachments"
```

---

## 7. LANGKAH DEPLOYMENT 100% GRATIS (GITHUB + VERCEL)

1. **Inisialisasi & Push ke GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial SIAKAD Personal Edition"
   git remote add origin https://github.com/username/siakad-personal.git
   git push -u origin main
   ```
2. **Deploy di Vercel (Gratis)**:
   - Buka dashboard [vercel.com](https://vercel.com) dan login dengan akun GitHub.
   - Klik **"Add New Project"** -> Pilih repositori `siakad-personal`.
   - Masukkan Environment Variables (`VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`).
   - Klik **Deploy**. Dalam 30 detik aplikasi Anda sudah live dengan domain gratis `https://siakad-personal.vercel.app`.
   - Setiap kali Anda melakukan perubahan kode dan `git push`, Vercel akan otomatis meng-update aplikasi tanpa downtime.

---

## 8. KEUNGGULAN EDISI FULL PERSONAL (VITE + SUPABASE + VERCEL)

1. 🚀 **Performa Instan**: Kompilasi Vite + Edge CDN Vercel menghasilkan waktu buka halaman di bawah 0.5 detik di smartphone.
2. 💰 **0 Biaya (100% Gratis Selamanya)**: Tidak ada tagihan server hosting atau database bulanan.
3. 📱 **Mobile Native Experience**: Dilengkapi *Bottom Navigation Bar*, gestur sentuh halus, dan mode PWA (bisa diinstal di home screen HP).
4. 🔒 **Aman & Mandiri**: Data Anda tersimpan aman di Supabase PostgreSQL dengan proteksi Row Level Security (RLS) per user.
5. 📄 **Laporan Siap Cetak**: Menghasilkan format PDF/Print rapi dengan KOP surat sekolah dinamis.

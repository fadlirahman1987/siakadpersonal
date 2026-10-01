# 🎓 SIAKAD Personal (Sistem Informasi Akademik Mandiri)

Aplikasi administrasi akademik dan pembelajaran mandiri yang dirancang khusus untuk Guru Mata Pelajaran dan Wali Kelas. Mendukung mode **Web Application** (Vercel/PWA) dan **Desktop Windows Native** (.EXE).

---

## ✨ Fitur Utama

- 📋 **Presensi & Jurnal KBM 1-Sentuhan:** Pencatatan kehadiran harian, jurnal mengajar interaktif, dan rekapitulasi semester otomatis dengan kode predikat standar (`SB`, `B`, `C`, `PP`).
- 🎓 **Modul Wali Kelas (Walas):** Manajemen rombel binaan, rekap absensi bulanan berbasis *dropdown list choice*, dan cetak berita acara.
- 👥 **Guru Wali & Bimbingan BK:** Pendataan siswa binaan, konseling, dan integrasi rekaman Home Visit lengkap dengan bukti dokumentasi.
- 📊 **Leger Nilai Dinamis:** Kustomisasi kategori penilaian, bobot persentase, KKM dinamis, dan kalkulasi nilai akhir otomatis.
- 🗄️ **Pusat Cadangan & Restore JSON:** Unduh seluruh basis data (14 tabel) ke dalam file `.json` offline kapan saja atau pulihkan kembali dengan 1 klik.
- ☁️ **Sinkronisasi Supabase Cloud:** Integrasi basis data daring real-time dengan status indikator live.
- 🖥️ **Dukungan Desktop Windows Native (.EXE):** Menggunakan Tauri untuk performa super ringan dan penyimpanan lokal mandiri.

---

## 🚀 Teknologi yang Digunakan

- **Frontend:** React 19, Vite, TailwindCSS v4, Lucide React
- **Penyimpanan Lokal:** LocalStorage & IndexedDB (Offline-First)
- **Cloud Database:** Supabase Cloud
- **Desktop Runtime:** Tauri v2 (Rust-backed)
- **Deployment:** Vercel

---

## 🛠️ Pengembangan Lokal

```bash
# 1. Install dependensi
npm install

# 2. Jalankan development server
npm run dev

# 3. Build untuk produksi
npm run build
```

---

© 2026 SIAKAD Personal — Dibuat untuk efisiensi administrasi guru Indonesia.

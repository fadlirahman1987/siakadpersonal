import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Heart,
  Coffee,
  Code2,
  Sparkles,
  Mail,
  Share2,
  ExternalLink,
  Copy,
  CheckCircle2,
  Globe,
  Award,
  ShieldCheck,
  BookOpen,
  Laptop,
  Users,
  Layers,
  GraduationCap,
  MessageCircle,
  HelpCircle,
  QrCode,
  CreditCard,
  Gift,
  ArrowRight
} from 'lucide-react';

export const AboutView = () => {
  const { schoolSettings, showToast, setActiveTab, currentVersion = '2.10.0' } = useApp();
  const [copiedItem, setCopiedItem] = useState(null);

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    showToast(`${label} berhasil disalin ke clipboard!`, 'success');
    setTimeout(() => {
      setCopiedItem(null);
    }, 3000);
  };

  const donationMethods = [
    {
      id: 'saweria',
      title: 'Saweria (Gopay, OVO, Dana, LinkAja, QRIS)',
      description: 'Dukungan instan via QRIS semua e-wallet & m-banking',
      link: 'https://saweria.co/fadlirahman87',
      accountNumber: 'https://saweria.co/fadlirahman87',
      isLink: true,
      badge: 'Direkomendasikan',
      icon: Coffee,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      id: 'trakteer',
      title: 'Trakteer / Karyakarsa',
      description: 'Traktir kopi digital untuk pengembang aplikasi',
      link: 'https://trakteer.id/fadlirahman',
      accountNumber: 'https://trakteer.id/fadlirahman',
      isLink: true,
      badge: 'Karya Digital',
      icon: Gift,
      color: 'from-rose-500 to-red-500',
      textColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-500/10'
    },
    {
      id: 'bank',
      title: 'Transfer Bank (Bank Kaltimtara)',
      description: 'Transfer langsung via rekening bank lokal',
      accountNumber: '0113199352',
      bankName: 'Bank Kaltimtara',
      accountHolder: 'Fadli Rahman',
      isLink: false,
      badge: 'Direct Transfer',
      icon: CreditCard,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'ewallet',
      title: 'E-Wallet (Dana / GoPay / OVO)',
      description: 'Kirim langsung ke nomor ponsel terdaftar',
      accountNumber: '0812-3456-7890',
      bankName: 'DANA / GoPay / OVO',
      accountHolder: 'Fadli Rahman',
      isLink: false,
      badge: 'E-Wallet Direct',
      icon: QrCode,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-5xl mx-auto">
      
      {/* 1. Hero Profile & Application Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 text-white shadow-xl border border-emerald-500/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/15 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          {/* Avatar / Profile Picture */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400 p-1 shadow-xl shadow-emerald-950/50">
              <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-3xl sm:text-4xl font-black text-emerald-400 select-none">
                FR
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shadow flex items-center gap-1">
              <Sparkles size={11} />
              <span>Developer</span>
            </div>
          </div>

          {/* Profile & App Info */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SIAKAD Personal v{currentVersion}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/15">
                Offline-First & Cloud Sync
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Created with ❤️ for Indonesian Teachers
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Fadli Rahman, S.Pd., Gr.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pendidik, praktisi teknologi pembelajaran, dan pengembang perangkat lunak mandiri. Berdedikasi membangun aplikasi pendidikan yang <strong>cepat, modern, bebas birokrasi, dan aman</strong> untuk membantu efisiensi kerja rekan guru di seluruh Indonesia.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
              <a
                href="https://github.com/fadlirahman1987/siakadpersonal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub Repository</span>
                <ExternalLink size={12} className="text-slate-400" />
              </a>

              <a
                href="mailto:fadlirahman1987@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/50 hover:bg-emerald-600/70 border border-emerald-400/40 text-white font-bold text-xs shadow transition-all active:scale-95 cursor-pointer"
              >
                <Mail size={15} />
                <span>Hubungi Pengembang</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'SIAKAD Personal Guru',
                      text: 'Aplikasi Administrasi & Penilaian Guru Mandiri Offline-First',
                      url: 'https://github.com/fadlirahman1987/siakadpersonal'
                    }).catch(() => {});
                  } else {
                    handleCopyText('https://github.com/fadlirahman1987/siakadpersonal', 'Tautan Aplikasi');
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-xs shadow transition-all active:scale-95 cursor-pointer"
              >
                <Share2 size={14} />
                <span>Bagikan Aplikasi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Donation & Support Cards Section (Highlighted Area) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Heart size={20} className="text-rose-500 fill-rose-500" />
              <span>Dukungan & Donasi Pengembang</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aplikasi ini dikembangkan secara sukarela untuk seluruh guru. Traktiran kopi Anda sangat berarti untuk mendukung biaya server, pembaruan fitur, dan pemeliharaan aplikasi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {donationMethods.map((item) => {
            const Icon = item.icon;
            const isCopied = copiedItem === item.title;

            return (
              <div
                key={item.id}
                className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${item.bgColor} ${item.textColor}`}>
                      <Icon size={22} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Account / Link Info Box */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-2">
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.accountNumber}
                    </div>
                    {item.accountHolder && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                        a.n {item.accountHolder}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button: Open Link or Copy Account */}
                <div>
                  {item.isLink ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Coffee size={15} />
                      <span>Buka Halaman Donasi</span>
                      <ExternalLink size={13} className="opacity-80" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCopyText(item.accountNumber, item.title)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-300">Tersalin ke Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={15} />
                          <span>Salin Nomor Rekening / Akun</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. About The Architecture & Core Mission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
            <ShieldCheck size={22} />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            100% Offline-First & Privasi Guru
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Data siswa, presensi, dan nilai tersimpan di perangkat lokal Anda tanpa tracking rahasia. Opsi sinkronisasi Supabase Cloud bersifat opsional untuk backup mandiri.
          </p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <Code2 size={22} />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Modern Web & Native Desktop Tech
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Dibangun menggunakan React 19, Vite, Tailwind CSS v4, dan dikompilasi dengan Tauri v2 Engine untuk performa kilat, hemat RAM, dan ukuran file sangat kecil.
          </p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit">
            <GraduationCap size={22} />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Standar Kurikulum Nasional
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Disesuaikan dengan standar pelaporan Kurikulum Merdeka & K13: Kolom H, S, I, A, D, Leger Nilai Terbobot, Jurnal Pelaksanaan KBM, dan Format Ekspor Excel / PDF.
          </p>
        </div>
      </div>

      {/* 4. Quick Return to Dashboard Banner */}
      <div className="glass-card p-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-3 rounded-2xl bg-emerald-600 text-white shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Siap Melanjutkan Administrasi KBM?
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola jadwal presensi, isi jurnal harian, atau cetak dokumen absensi wali kelas.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Kembali ke Beranda</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
};

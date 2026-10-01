import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Calculator,
  Image,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AIToolsView = () => {
  const { showToast } = useApp();

  const [activeToolTab, setActiveToolTab] = useState('rpe'); // 'rpe' | 'prompt-gen' | 'ai-links'
  const [copiedIndex, setCopiedIndex] = useState(null);

  // RPE Calculator State
  const [rpeForm, setRpeForm] = useState({
    academicYear: '2026/2027',
    semester: 'Ganjil',
    subject: 'Pemrograman Web',
    weeklyHours: 4,
    totalWeeks: 20,
    nonEffectiveWeeks: 4, // PTS, PAS, Libur, Kegiatan Sekolah
    cadanganJam: 4
  });

  // Calculated RPE Values
  const effectiveWeeks = Math.max(0, rpeForm.totalWeeks - rpeForm.nonEffectiveWeeks);
  const totalEffectiveHours = effectiveWeeks * rpeForm.weeklyHours;
  const netEffectiveHours = Math.max(0, totalEffectiveHours - rpeForm.cadanganJam);

  // AI Infographic Prompt Builder State
  const [promptForm, setPromptForm] = useState({
    topic: 'Arsitektur Client-Server dan REST API',
    grade: 'SMK Kelas XI',
    style: 'Modern Tech Glassmorphism Minimalist',
    keyPoints: '1. Frontend (React/Vite)\n2. REST API Controller\n3. Supabase PostgreSQL Cloud\n4. HTTP Methods (GET, POST, PUT, DELETE)'
  });

  const generatedPrompt = `Create a high-resolution educational infographic poster for Indonesian vocational high school students (${promptForm.grade}).
TOPIC: "${promptForm.topic}"
STYLE: ${promptForm.style}, clean vector diagram, dark sleek slate theme, emerald & indigo glowing neon accents, elegant typography, 4k ultra-detailed.
KEY SECTIONS & VISUAL ELEMENTS:
${promptForm.keyPoints}
LAYOUT: Hierarchical flow with clear Indonesian annotations, icons, and structured cards. Perfect educational visual guide.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    showToast('Prompt Master Visual AI berhasil disalin ke clipboard!', 'success');
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 border border-purple-500/30 p-5 sm:p-6 shadow-2xl text-white">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold mb-1.5">
              <Sparkles size={13} className="text-purple-400" />
              <span>AI Productivity Suite</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              AI Tools Hub untuk Guru Cerdas
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-md">
              Otomatisasi kalkulasi Rencana Pekan Efektif (RPE) dan buat media pembelajaran visual berkualitas tinggi dalam hitungan detik.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Sub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'rpe', label: 'Kalkulator RPE Pintar', icon: Calculator },
          { id: 'prompt-gen', label: 'Generator Visual AI Prompt', icon: Image },
          { id: 'ai-links', label: 'AI External Tools', icon: ExternalLink },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeToolTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveToolTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-200/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-800'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      {/* 3.1 Kalkulator RPE */}
      {activeToolTab === 'rpe' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Input Parameter Form */}
          <div className="lg:col-span-6 glass-card p-5 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator size={16} className="text-purple-600 dark:text-purple-400" />
              <span>Parameter Rencana Pekan Efektif (RPE)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  value={rpeForm.academicYear}
                  onChange={(e) => setRpeForm({ ...rpeForm, academicYear: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Semester</label>
                <select
                  value={rpeForm.semester}
                  onChange={(e) => setRpeForm({ ...rpeForm, semester: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="Ganjil">Ganjil (Juli - Desember)</option>
                  <option value="Genap">Genap (Januari - Juni)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                value={rpeForm.subject}
                onChange={(e) => setRpeForm({ ...rpeForm, subject: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Jam Mengajar / Minggu</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={rpeForm.weeklyHours}
                  onChange={(e) => setRpeForm({ ...rpeForm, weeklyHours: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Total Pekan Semester</label>
                <input
                  type="number"
                  min="10"
                  max="26"
                  value={rpeForm.totalWeeks}
                  onChange={(e) => setRpeForm({ ...rpeForm, totalWeeks: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Pekan Tidak Efektif (PTS, PAS, Libur)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={rpeForm.nonEffectiveWeeks}
                  onChange={(e) => setRpeForm({ ...rpeForm, nonEffectiveWeeks: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Cadangan Jam Pelajaran (JP)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={rpeForm.cadanganJam}
                  onChange={(e) => setRpeForm({ ...rpeForm, cadanganJam: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

          </div>

          {/* Realtime Output Card */}
          <div className="lg:col-span-6 glass-card p-5 rounded-3xl border border-purple-500/30 space-y-4">
            <h3 className="font-extrabold text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Sparkles size={16} />
              <span>Hasil Analisis Pekan & Jam Efektif</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Pekan Efektif</span>
                <p className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">{effectiveWeeks} Pekan</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{rpeForm.totalWeeks} - {rpeForm.nonEffectiveWeeks} pekan</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Jam Efektif</span>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{totalEffectiveHours} JP</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{effectiveWeeks} pekan × {rpeForm.weeklyHours} JP</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Alokasi Jam Tatap Muka Bersih:
              </span>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {netEffectiveHours} <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">Jam Pelajaran (JP)</span>
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Tersedia untuk penyusunan Modul Ajar / Promes / Prota semester {rpeForm.semester} {rpeForm.academicYear}.
              </p>
            </div>

            <button
              onClick={() => showToast('Ringkasan RPE siap dimasukkan ke Program Semester (Promes)!', 'success')}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
            >
              Gunakan untuk Program Semester (Promes)
            </button>
          </div>

        </div>
      )}

      {/* 3.2 Visual AI Prompt Generator */}
      {activeToolTab === 'prompt-gen' && (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Image size={16} className="text-purple-600 dark:text-purple-400" />
              <span>Generator Master Prompt Infografis / Media Visual AI</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Materi / Topik Pelajaran</label>
                <input
                  type="text"
                  value={promptForm.topic}
                  onChange={(e) => setPromptForm({ ...promptForm, topic: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Tingkat Kelas / Sasaran</label>
                <input
                  type="text"
                  value={promptForm.grade}
                  onChange={(e) => setPromptForm({ ...promptForm, grade: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Poin-Poin Kunci / Diagram yang Ingin Ditampilkan</label>
              <textarea
                rows={3}
                value={promptForm.keyPoints}
                onChange={(e) => setPromptForm({ ...promptForm, keyPoints: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Generated Prompt Box with 1-Click Copy */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Prompt Master Siap Copy:</span>
                <button
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Copy size={13} />
                  <span>Salin Prompt</span>
                </button>
              </div>

              <div className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-4 rounded-2xl text-xs font-mono text-purple-900 dark:text-purple-200 select-all whitespace-pre-wrap leading-relaxed shadow-sm">
                {generatedPrompt}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3.3 External AI Tools Hub */}
      {activeToolTab === 'ai-links' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <a
            href="https://kisikisi.ai"
            target="_blank"
            rel="noreferrer"
            className="glass-card p-5 rounded-3xl hover:border-purple-500/50 transition-all group active:scale-98"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <BookOpen size={22} />
              </div>
              <ExternalLink size={16} className="text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-3 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
              KisiKisi.AI
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Generator kisi-kisi soal, rubrik penilaian, dan stimulus soal HOTS otomatis berbasis kurikulum nasional.
            </p>
          </a>

          <a
            href="https://kartusoal.ai"
            target="_blank"
            rel="noreferrer"
            className="glass-card p-5 rounded-3xl hover:border-purple-500/50 transition-all group active:scale-98"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Sparkles size={22} />
              </div>
              <ExternalLink size={16} className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
              Kartu Soal & Bank Soal AI
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Penyusun kartu soal ujian, kunci jawaban, dan pembahasan terstruktur siap cetak.
            </p>
          </a>

        </div>
      )}

    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, ClipboardCheck, GraduationCap, Users, Sparkles, Settings } from 'lucide-react';

export const BottomNav = () => {
  const { activeTab, setActiveTab, classes } = useApp();

  const isHomeroomTeacher = (classes || []).some(c => c.is_homeroom_class);

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'attendance', label: 'Presensi', icon: ClipboardCheck },
    ...(isHomeroomTeacher ? [{ id: 'walas', label: 'Walas', icon: GraduationCap }] : []),
    { id: 'homeroom', label: 'Guru Wali', icon: Users },
    { id: 'ai-tools', label: 'AI Tools', icon: Sparkles, isHighlight: true },
    { id: 'settings', label: 'Master', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav px-2 py-2 sm:py-3 max-w-lg mx-auto sm:max-w-none md:hidden no-print">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 sm:px-4 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_12px_#10b981] transition-all"></span>
              )}

              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 scale-110'
                    : item.isHighlight
                    ? 'bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400'
                    : ''
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

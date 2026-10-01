import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Toast } from './components/common/Toast';

import { DashboardView } from './views/DashboardView';
import { AttendanceView } from './views/AttendanceView';
import { WalasView } from './views/WalasView';
import { HomeroomView } from './views/HomeroomView';
import { AIToolsView } from './views/AIToolsView';
import { SettingsView } from './views/SettingsView';

export const App = () => {
  const { activeTab, classes } = useApp();

  const isHomeroomTeacher = (classes || []).some(c => c.is_homeroom_class);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'attendance':
        return <AttendanceView />;
      case 'walas':
        return isHomeroomTeacher ? <WalasView /> : <DashboardView />;
      case 'homeroom':
        return <HomeroomView />;
      case 'ai-tools':
        return <AIToolsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-200 selection:bg-emerald-500 selection:text-white">
      {/* Toast Alerts */}
      <Toast />

      {/* Top Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl 2xl:max-w-[1440px] w-full mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-12">
        {renderActiveView()}
      </main>

      {/* Mobile-First Floating Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default App;

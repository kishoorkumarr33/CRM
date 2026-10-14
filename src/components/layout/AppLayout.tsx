import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { Sidebar, ActivePage } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { ToastContainer } from '../common/ToastContainer';
import { QuickAddModal } from '../common/QuickAddModal';
import { useCRM } from '../../context/CRMContext';
import { useTheme } from '../../context/ThemeContext';

interface AppLayoutProps {
  onOpenAuth: (view: 'login' | 'register') => void;
  children: (props: {
    activePage: ActivePage;
    setActivePage: (page: ActivePage) => void;
    selectedCustomerId: string | null;
    setSelectedCustomerId: (id: string | null) => void;
  }) => React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ onOpenAuth, children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { isDarkMode, toggleTheme } = useTheme();
  const { isQuickAddOpen, quickAddTab, openQuickAdd, closeQuickAdd } = useCRM();

  const handleNavigate = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setActivePage('customer-detail');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-slate-100 flex transition-colors duration-200 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 3D Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onOpenAuth={onOpenAuth}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          onNavigate={handleNavigate}
          onOpenQuickAdd={(type) => openQuickAdd(type)}
          onSelectCustomerForDetail={handleSelectCustomer}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleTheme}
          onOpenAuth={onOpenAuth}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children({
            activePage,
            setActivePage: handleNavigate,
            selectedCustomerId,
            setSelectedCustomerId,
          })}
        </main>
      </div>

      {/* Floating 3D Quick Add Button with Keyboard Hotkey indicator */}
      <button
        onClick={() => openQuickAdd('customer')}
        className="fixed bottom-6 right-6 z-40 btn-3d-primary py-3 px-4.5 rounded-2xl flex items-center gap-2.5 shadow-2xl hover:scale-105 active:scale-95 transition-transform group"
        title="Quick Add (Press 'Q' or 'Cmd+K')"
      >
        <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
        <span className="text-xs font-black tracking-wide">Quick Add</span>
        <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded-md bg-indigo-900/40 text-[10px] font-mono text-indigo-200 border border-indigo-400/30">
          Q
        </span>
      </button>

      {/* Unified 3D Quick Add Overlay */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={closeQuickAdd}
        initialTab={quickAddTab}
      />

      {/* Notification Toast Hub */}
      <ToastContainer />
    </div>
  );
};

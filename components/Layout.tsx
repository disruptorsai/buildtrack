
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  CalendarDays, 
  Truck, 
  FileText, 
  PieChart, 
  Menu, 
  X, 
  Settings,
  Bell,
  LogOut,
  User as UserIcon,
  HardHat,
  Map,
  FileQuestion
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import clsx from 'clsx';
import { CURRENT_USER } from '../constants';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  mobile?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, mobile = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const baseClasses = mobile
    ? "flex flex-col items-center justify-center w-full py-2 text-xs font-medium transition-colors"
    : "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1";
  
  const activeClasses = mobile
    ? "text-primary-600 dark:text-primary-500"
    : "bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-primary-500";
    
  const inactiveClasses = mobile
    ? "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800";

  return (
    <Link to={to} className={clsx(baseClasses, isActive ? activeClasses : inactiveClasses)}>
      <Icon className={mobile ? "w-6 h-6 mb-1" : "w-5 h-5"} />
      <span>{label}</span>
    </Link>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Disable global scroll for plans page to allow canvas pan/zoom
  const isPlansPage = location.pathname === '/plans';

  const navigation = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/time', icon: Clock, label: 'Time Clock' },
    { to: '/plans', icon: Map, label: 'Plans & Pins' },
    { to: '/schedule', icon: CalendarDays, label: 'Schedule' },
    { to: '/rfis', icon: FileQuestion, label: 'RFIs' },
    { to: '/fleet', icon: Truck, label: 'Fleet & Logs' },
    { to: '/forms', icon: FileText, label: 'Forms' },
    { to: '/financials', icon: PieChart, label: 'Financials' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white">
            <HardHat size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-secondary-900 dark:text-white">BuildTrack</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pro Edition</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav>
            {navigation.map((item) => (
              <NavItem 
                key={item.to} 
                to={item.to} 
                icon={item.icon} 
                label={item.label} 
              />
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
            <img src={CURRENT_USER.avatar} alt="User" className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{CURRENT_USER.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{CURRENT_USER.role}</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center text-white">
              <HardHat size={18} />
            </div>
            <span className="font-bold text-lg text-secondary-900 dark:text-white">BuildTrack</span>
          </div>
          <div className="flex items-center gap-4">
             <Bell size={20} className="text-slate-600 dark:text-slate-300" />
             <img src={CURRENT_USER.avatar} alt="Profile" className="w-8 h-8 rounded-full" />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className={clsx(
          "flex-1 relative", 
          isPlansPage ? "overflow-hidden p-0" : "overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8"
        )}>
          <div className={isPlansPage ? "h-full" : "max-w-7xl mx-auto"}>
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe z-30">
          <div className="flex justify-around items-center">
             {navigation.slice(0, 5).map((item) => (
                <NavItem 
                  key={item.to} 
                  to={item.to} 
                  icon={item.icon} 
                  label={item.label} 
                  mobile 
                />
              ))}
          </div>
        </nav>
      </main>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Truck,
  FileText,
  PieChart,
  Settings,
  Bell,
  Map,
  FileQuestion,
  Moon,
  Sun,
  X,
  User,
  LogOut,
  Shield
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import clsx from 'clsx';
import { CURRENT_USER, NOTIFICATIONS } from '../constants';

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

// Settings Modal Component
const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; darkMode: boolean; setDarkMode: (val: boolean) => void }> = ({ isOpen, onClose, darkMode, setDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* User Profile Section */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <img src={CURRENT_USER.avatar} alt="User" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{CURRENT_USER.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{CURRENT_USER.role}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ID: {CURRENT_USER.id}</p>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={20} className="text-slate-500" /> : <Sun size={20} className="text-amber-500" />}
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Toggle dark/light theme</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={clsx(
                "relative w-12 h-6 rounded-full transition-colors",
                darkMode ? "bg-primary-500" : "bg-slate-300"
              )}
            >
              <div className={clsx(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                darkMode ? "translate-x-7" : "translate-x-1"
              )} />
            </button>
          </div>

          {/* Other Settings */}
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-left">
              <User size={20} className="text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Edit Profile</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update your information</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-left">
              <Shield size={20} className="text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Privacy & Security</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your data</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left text-red-600">
              <LogOut size={20} />
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-xs opacity-70">Log out of your account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications Panel Component
const NotificationsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ALERT': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'SUCCESS': return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      default: return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute right-4 top-16 md:right-8 md:top-4 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {NOTIFICATIONS.map(notification => (
            <div key={notification.id} className="p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="mt-1.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white">{notification.message}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notification.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
          <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

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
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <img
            src="https://i.ibb.co/svGhm1SY/Generated-Image-November-29-2025-3-16-PM.jpg"
            alt="BuildTrack Logo"
            className="w-full h-auto rounded-lg"
          />
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

        {/* Dark Mode Toggle */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
            <img src={CURRENT_USER.avatar} alt="User" className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{CURRENT_USER.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{CURRENT_USER.role}</p>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20">
          <img
            src="https://i.ibb.co/svGhm1SY/Generated-Image-November-29-2025-3-16-PM.jpg"
            alt="BuildTrack Logo"
            className="h-10 w-auto rounded"
          />
          <div className="flex items-center gap-4">
             <button onClick={() => setDarkMode(!darkMode)} className="text-slate-600 dark:text-slate-300">
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button onClick={() => setNotificationsOpen(true)} className="text-slate-600 dark:text-slate-300 relative">
               <Bell size={20} />
               <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
             </button>
             <button onClick={() => setSettingsOpen(true)}>
               <img src={CURRENT_USER.avatar} alt="Profile" className="w-8 h-8 rounded-full" />
             </button>
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

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};

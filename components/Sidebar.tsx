import React from 'react';
import { Link, useLocation } from 'wouter';
import { NAVIGATION_ITEMS } from '../constants';
import { LogOut, Beer, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserSession } from '../services/authService';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  user: UserSession;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, user, onLogout }) => {
  const [location] = useLocation();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      {/* Sidebar para Escritorio (md y superiores) */}
      <aside 
        className={`hidden md:flex h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 hover:text-primary"
          >
            <Menu className="w-5 h-5" />
          </button>
          {!isCollapsed && (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <Beer className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-medium tracking-tight text-slate-800 dark:text-white">Bullbier Tracking</h1>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = location === item.path || (location === "" && item.path === "/");
            return (
              <Link key={item.path} href={item.path}>
                <a 
                  title={isCollapsed ? item.label : ''}
                  className={`flex items-center rounded-full transition-all text-sm font-medium ${
                    isCollapsed ? 'justify-center px-0 py-3 mx-auto w-12' : 'gap-3 px-4 py-2.5'
                  } ${
                    isActive 
                      ? 'bg-primary-light dark:bg-primary/10 text-primary dark:text-blue-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {React.cloneElement(item.icon as React.ReactElement<any>, { 
                    className: `w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-slate-500'}` 
                  })}
                  {!isCollapsed && <span className="truncate animate-in fade-in duration-300">{item.label}</span>}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className={`bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all ${isCollapsed ? 'p-2' : 'p-4'}`}>
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'mb-3'}`}>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(user.name)}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                  <p className="text-sm font-semibold truncate text-slate-800 dark:text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{user.role}</p>
                </div>
              )}
            </div>
            
            {!isCollapsed && (
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors rounded-full animate-in fade-in duration-300"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            )}
            
            {isCollapsed && (
              <button 
                onClick={onLogout}
                title="Cerrar Sesión"
                className="mt-2 w-full flex items-center justify-center p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors rounded-full"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-full p-1 text-slate-400 hover:text-primary transition-all z-50 hover:scale-110"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Navegación Inferior para Celular */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-2 pb-safe">
        <nav className="flex items-center justify-between overflow-x-auto no-scrollbar py-2">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = location === item.path || (location === "" && item.path === "/");
            return (
              <Link key={item.path} href={item.path}>
                <a className={`flex flex-col items-center justify-center min-w-[72px] px-2 py-1 rounded-2xl transition-all ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                  <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary-light dark:bg-primary/10' : 'bg-transparent'}`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { 
                      className: `w-6 h-6 ${isActive ? 'text-primary' : 'text-slate-400'}` 
                    })}
                  </div>
                  <span className="text-[10px] font-bold mt-1 tracking-tight">
                    {item.label === 'Escanear QR' ? 'Escanear' : item.label}
                  </span>
                </a>
              </Link>
            );
          })}
          {/* Mobile Logout Button */}
          <button 
            onClick={onLogout}
            className="flex flex-col items-center justify-center min-w-[72px] px-2 py-1 rounded-2xl transition-all text-slate-400"
          >
            <div className="p-2 rounded-xl transition-all bg-transparent">
              <LogOut className="w-6 h-6 text-slate-400" />
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight">Salir</span>
          </button>
        </nav>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </>
  );
};

export default Sidebar;
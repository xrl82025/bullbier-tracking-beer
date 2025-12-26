import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { Search as SearchIcon, Bell, QrCode, X, Beer, MapPin, ChevronRight, Clock, Sparkles, Sun, Moon, Info, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { storage } from '../services/mockData';
import { Barrel, BarrelStatus, Notification } from '../types';
import StatusBadge from './StatusBadge';

interface HeaderProps {
  isCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ isCollapsed }) => {
  const [location, setLocation] = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState<Barrel[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    setNotifications(storage.getNotifications());
    const unsubscribe = storage.subscribe(() => {
      setNotifications(storage.getNotifications());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (searchValue.trim().length > 0) {
      const allBarrels = storage.getBarrels();
      const filtered = allBarrels.filter(b => 
        b.code.toLowerCase().includes(searchValue.toLowerCase()) ||
        b.lastLocationName.toLowerCase().includes(searchValue.toLowerCase()) ||
        b.beerType.toLowerCase().includes(searchValue.toLowerCase())
      ).slice(0, 5);
      setResults(filtered);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [searchValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (barrelId: string) => {
    setLocation(`/barrels/${barrelId}`);
    setSearchValue('');
    setShowResults(false);
  };

  const markAsRead = (id: string) => {
    storage.markNotificationAsRead(id);
  };

  const clearAll = () => {
    storage.clearNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header 
      className={`fixed top-0 right-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out h-16 flex items-center px-4 md:px-8 
        ${isCollapsed ? 'left-20' : 'left-0 md:left-64'}`}
    >
      <div className="flex-1 flex items-center gap-4">
        {/* Mobile Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 md:hidden hover:opacity-80 transition-opacity">
            <div className="bg-primary-light dark:bg-primary/20 p-1.5 rounded-lg">
              <Beer className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">Bullbier Tracking</h1>
          </a>
        </Link>
        
        <div ref={searchRef} className="relative max-w-md w-full group hidden sm:block">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <SearchIcon className={`w-4 h-4 transition-colors ${showResults ? 'text-primary' : 'text-slate-400 group-focus-within:text-primary'}`} />
          </div>
          <input
            type="text"
            placeholder="Buscar activos..."
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-full py-2.5 pl-11 pr-10 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400 outline-none"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => searchValue.length > 0 && setShowResults(true)}
          />
          {searchValue && (
            <button 
              onClick={() => setSearchValue('')}
              className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3">
                <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resultados Sugeridos</p>
                {results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((barrel) => (
                      <button
                        key={barrel.id}
                        onClick={() => handleSelectResult(barrel.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl transition-all group text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary-light dark:bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                          <Beer className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-800 dark:text-white text-sm truncate">{barrel.code}</span>
                            <StatusBadge status={barrel.status} showIcon={false} />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {barrel.status === BarrelStatus.EN_BODEGA_LIMPIO ? 'Vacío' : barrel.beerType}
                            </span>
                            <span className="text-slate-200 dark:text-slate-700">•</span>
                            <span className="text-[10px] font-medium text-slate-500 truncate flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              {barrel.lastLocationName}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <SearchIcon className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">No se encontraron activos</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/ai-agent">
          <a className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${location === '/ai-agent' ? 'bg-primary-light dark:bg-primary/10 text-primary border-primary/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            <Sparkles className={`w-4 h-4 ${location === '/ai-agent' ? 'text-primary' : 'text-primary/60'}`} />
            <span className="hidden lg:inline">Agente de IA</span>
          </a>
        </Link>

        <button 
          onClick={() => setLocation('/scan')}
          className="hidden md:flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-primary-dark transition-all active:scale-95"
        >
          <QrCode className="w-4 h-4" />
          <span>Escanear Barril</span>
        </button>

        <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 mx-1 hidden md:block" />

        <button 
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all relative"
          title={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-full transition-all relative ${showNotifications ? 'bg-slate-100 dark:bg-slate-800 text-primary' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`} 
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Notificaciones
                  {unreadCount > 0 && <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                </h3>
                <button 
                  onClick={clearAll}
                  className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Limpiar
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer relative group ${!n.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    >
                      {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-primary rounded-full" />}
                      <div className="flex gap-3">
                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                          ${n.type === 'success' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' : 
                            n.type === 'warning' ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20' : 
                            'bg-blue-50 text-blue-500 dark:bg-blue-900/20'}`}
                        >
                          {n.type === 'success' ? <CheckCircle className="w-4 h-4" /> : 
                           n.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : 
                           <Info className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-1 mt-2 text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(n.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-slate-200 dark:text-slate-700" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">Sin notificaciones nuevas</p>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-slate-50 dark:border-slate-700 text-center">
                <button className="text-[10px] font-black text-primary dark:text-blue-400 uppercase tracking-widest hover:underline">Ver todo el historial</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
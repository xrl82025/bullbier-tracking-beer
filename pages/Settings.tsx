
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Moon, Database, Globe, LogOut, Sun, CheckCircle2 } from 'lucide-react';

const Settings: React.FC = () => {
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

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configuración</h1>
        <p className="text-slate-500 dark:text-slate-400">Personaliza tu experiencia y gestiona el sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-xl font-bold">
            <User className="w-5 h-5" />
            Perfil
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-all">
            <Shield className="w-5 h-5" />
            Seguridad
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-all">
            <Bell className="w-5 h-5" />
            Notificaciones
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-all">
            <Globe className="w-5 h-5" />
            Idioma
          </button>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Información del Perfil</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-4xl font-bold text-primary border-4 border-slate-50 dark:border-slate-600 shadow-inner">
                  JD
                </div>
                <button className="text-sm font-bold text-primary hover:underline">Cambiar Foto</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input type="text" defaultValue="Juan Doe" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Usuario</label>
                  <input type="text" defaultValue="jdoe_admin" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              <button className="bg-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary-dark transition-all flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Guardar Cambios
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Preferencias del Sistema</h3>
            <div className="space-y-4">
              <div 
                onClick={toggleDarkMode}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Modo Oscuro</p>
                    <p className="text-xs text-slate-400">Reduce la fatiga visual por la noche</p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex ${isDarkMode ? 'bg-primary justify-end' : 'bg-slate-300 justify-start'}`}>
                  <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Respaldos Automáticos</p>
                    <p className="text-xs text-slate-400">Sincronizar base de datos cada 24h</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full p-1 cursor-pointer flex justify-end">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

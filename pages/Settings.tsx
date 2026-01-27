
import React, { useState } from 'react';
import { useStorage } from '../services/mockData';
import { Settings as SettingsIcon, User, Shield, Bell, Moon, Database, Globe, LogOut, Sun, CheckCircle2, Trash2, RotateCcw, AlertTriangle, Clock } from 'lucide-react';

const Settings: React.FC = () => {
  const storage = useStorage();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [isResetting, setIsResetting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleHardReset = async () => {
    if (confirm("¿Estás seguro de que quieres limpiar el caché local? Esto eliminará cualquier dato guardado en tu navegador y forzará una descarga limpia desde Supabase.")) {
      setIsResetting(true);
      storage.clearLocalData();
      await storage.refreshAll();
      setIsResetting(false);
      alert("Caché local limpiado exitosamente.");
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    const success = await storage.refreshCritical();
    setIsSyncing(false);
    if (success) {
      alert("Sincronización completada.");
    } else {
      alert("Error al sincronizar. Revisa tu conexión.");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Configuración</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Personaliza tu experiencia y gestiona el sistema.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Apariencia */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Preferencias Visuales
            </h3>
            <div className="space-y-4">
              <div 
                onClick={toggleDarkMode}
                className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Modo Oscuro</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Reduce la fatiga visual por la noche</p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex ${isDarkMode ? 'bg-primary justify-end' : 'bg-slate-300 justify-start'}`}>
                  <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Gestión de Datos */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Datos y Almacenamiento
            </h3>
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Sincronización Crítica</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Fuerza la descarga de barriles y lotes desde Supabase</p>
                  </div>
                  <button 
                    onClick={handleForceSync}
                    disabled={isSyncing}
                    className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isSyncing ? <Clock className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                    Sincronizar Ahora
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-6 bg-rose-50/50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/20 mt-8">
                <h4 className="text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Zona de Peligro
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Reiniciar Aplicación (Local)</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">Elimina el historial y el caché de tu navegador. Útil si has vaciado la base de datos central y sigues viendo datos viejos.</p>
                  </div>
                  <button 
                    onClick={handleHardReset}
                    disabled={isResetting}
                    className="bg-rose-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50"
                  >
                    {isResetting ? <Clock className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Limpiar Caché
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 relative overflow-hidden">
             <Sparkles className="absolute top-4 right-4 w-12 h-12 text-white/10" />
             <h3 className="text-lg font-black tracking-tight mb-2">BarrelTrack Pro</h3>
             <p className="text-white/80 text-xs leading-relaxed font-medium">
               Estás utilizando la versión 2.5 con integración nativa de IA y sincronización en tiempo real.
             </p>
             <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span>Conexión DB</span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    ACTIVA
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span>Versión App</span>
                   <span>1.0.0 (Bullbier)</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
